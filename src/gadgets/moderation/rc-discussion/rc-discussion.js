/* 
 * Adds a special page to browse through recent posts and replies made using the DiscussionTools extension.
 * Authored by [[User:CoolMikeHatsune22]]
 */
( function ( $, mw ) {
	'use strict';
	
	// =================
	//   Configuration
	// =================
	var MENU_OPTIONS = [
		{ label: 'All (Excluding User Talk)', frc: '&namespace=3&invert=true', ns: '1|2|4|5|6|7|8|9|10|11|12|13|14|15|301|500|501|828|829' },
		{ label: 'All', frc: '', ns: '*' },
		{ label: 'Main Talk', frc: '&namespace=1', ns: '1' },
		{ label: 'Help Talk', frc: '&namespace=13', ns: '13' },
		{ label: 'Vocaloid Lyrics Wiki Discussion', frc: '&namespace=4', ns: '4' },
		{ label: 'Vocaloid Lyrics Wiki Talk', frc: '&namespace=5', ns: '5' },
		{ label: 'User Talk', frc: '&namespace=3', ns: '3' },
		{ label: 'Category Talk', frc: '&namespace=15', ns: '15' },
		{ label: 'File Talk', frc: '&namespace=7', ns: '7' },
		{ label: 'MediaWiki Talk', frc: '&namespace=9', ns: '9' },
		{ label: 'Template Talk', frc: '&namespace=11', ns: '11' },
		{ label: 'Module Talk', frc: '&namespace=829', ns: '829' }
	];
	var SHOW_ON_PAGES = ['Special:RecentDiscussions', 'Special:BlankPage/RC-Discussions'];
	var NUMBER_OF_POSTS = 50;
	var MAX_DURATION_IN_DAYS = 7;
	var DEBUG_DOMAIN = ''; // For local testing
	
	var LOCAL_STORAGE_KEY = 'vlw_rc_discussions_items';
	var LOCAL_STORAGE_EXPIRATION_KEY = 'vlw_rc_discussions_expiration';
	var LOCAL_STORAGE_MAX_AGE = 5 * 60 * 1000; // 5 minutes

	// =================
	//   Main Fetching Logic
	// =================
	var config = mw.config.get([
		'wgPageName',
		'wgCanonicalSpecialPageName',
		'wgScriptPath',
		'wgSiteName'
	]);
	
	installPortletLink();
	if (SHOW_ON_PAGES.indexOf(config.wgPageName) < 0) {
		return;
	}
	
	var api = (DEBUG_DOMAIN === '' ? 
		new mw.Api() :
		new mw.ForeignApi(DEBUG_DOMAIN+config.wgScriptPath+'/api.php', { anonymous: true })
	);
	
	function loadDiscussions(idx, noCache) {
		idx = +idx;
		if (isNaN(idx)) {
			console.error('Read recent changes: Invalid Argument');
			return;
		}
		$('#rc-discussion-feeds-articles').html('');
		$('#rc-discussion-feeds-articles-container .mw-spinner').show();
		if (idx === 0 && !noCache) {
			var fetchedFromCache = fetchFromCache();
			if (fetchedFromCache !== null) {
				populateRecentDiscussion(fetchedFromCache);
				$('#rc-discussion-feeds-articles-container .mw-spinner').hide();
				return;
			}
		}
		readRecentChangesFeed(idx)
			.then(function (arr) {
				var parsedFeeds = parseRcFeeds(arr[0].value);
				var parsedApiRcs = parseApiQuery(arr[1].value);
				var a = compareParsedRcs(parsedFeeds, parsedApiRcs);
				return fillIntermediaryRevs(a[0], a[1], a[2]);
			})
			.then(groupDiscussionsByDate)
			.then(function (data) {
				if (idx === 0) { saveToCache(data); }
				return data;
			})
			.then(populateRecentDiscussion)
			.catch(function (err) {
				mw.notify('An unexpected error has occured. Please report this bug if it persists.', { type: 'error' });
				console.error( err, 'gadget-rc-discussion' );
			})
			.finally(function () {
				$('#rc-discussion-feeds-articles-container .mw-spinner').hide();
			});
	}

	function readRecentChangesFeed(idx) {
		return Promise.allSettled([
			new Promise(function (resolve, reject ) {
				fetch(
					DEBUG_DOMAIN+config.wgScriptPath+
					'/api.php?action=feedrecentchanges&feedformat=rss&tagfilter=discussiontools' + 
					'&limit='+NUMBER_OF_POSTS+
					'&days='+MAX_DURATION_IN_DAYS+
					MENU_OPTIONS[idx].frc+
					'&origin=*'
				)
				.then(function (res) { resolve(res.text()); })
				.catch(reject);
			}),
			api.get({
				action: 'query', 
				format: 'json',
				list: 'recentchanges', 
				rctag: 'discussiontools',
				rcprop: 'user|comment|flags|timestamp|title|tags|ids',
				rcnamespace: MENU_OPTIONS[idx].ns,
				rclimit: NUMBER_OF_POSTS,
				rcslot: 'main', 
				rcgeneraterevisions: true,
				rcend: new Date(Date.now() - (MAX_DURATION_IN_DAYS * 24 * 60 * 60 * 1000)).toISOString(),
			})
		]);
	}

	function parseRcFeeds(rss) {
		var parser = new window.DOMParser();
		var data = parser.parseFromString(rss, "application/xml");
    	var items = Array.from(data.querySelectorAll("item"));
		return items.map(function (item) {
			var xmlString = decodeXmlContents(item.querySelector("description").innerHTML);
			var pageTitle = item.querySelector("title").innerHTML;
			var author = item.getElementsByTagName('dc:creator')[0].innerHTML;
			var timestamp = item.querySelector("pubDate").innerHTML;
			timestamp = ((timestamp || '') === '') ? null : Date.parse(timestamp);
			var link = decodeXmlContents(item.querySelector("link").innerHTML);

			var doc = parser.parseFromString('<html>' + xmlString + '</html>', 'application/xml');

			var fromRev = +(mw.util.getParamValue("oldid", link) || 0);
			var toRev = +(mw.util.getParamValue("diff", link) || 0);
			var isNewPage = (fromRev === 0);

			var hasMultipleRevs = doc.querySelector('td.diff-multi') !== null;

			var summaryNode = doc.querySelector('p:first-child');
			var commentHeadingNode = summaryNode === null ? null : summaryNode.firstChild;
			var commentHeading = null, commentType = null, isReply = false;
			if (commentHeadingNode !== null) {
				commentHeading = commentHeadingNode.innerHTML.replace(/\s*:\s*$/, '');
				commentType = summaryNode.innerHTML.replace(commentHeadingNode.outerHTML, '').trim();
				if (commentType === 'Reply') { isReply = true; }
			}

			var textAdditions = null;
			if (isNewPage) {
        		textAdditions = Array.from(doc.documentElement.children).slice(2)
					.map(function (el) { return el.innerHTML.replace(/<br\s*\/?>/g, '\n'); })
					.map(function (s) {
						// Trim unneeded whitespace
						while (s.match(/^[\n ]*<br\s?\/>[\n ]*/) !== null) {
							s = s.replace(/^[\n ]*<br\s?\/>[\n ]*/, '');
						}
						return s;
					});
    		} else if (!hasMultipleRevs) {
				textAdditions = parseNewAdditionDiffs(doc);
			}

			return { 
				author: author, 
				pageTitle: pageTitle, 
				heading: commentHeading,
				textAdditions: textAdditions,
				timestamp: timestamp, 
				isReply: isReply,
				fromRev: fromRev, 
				toRev: toRev, 
				isNewPage: isNewPage, 
				hasMultipleRevs: hasMultipleRevs
			};
		});
	}

	function parseApiQuery(res) {
		var discussions = (res.query.recentchanges || []).map(function (curComment) {
			var pageTitle = curComment.title;
			var pageId = curComment.pageid;
			var isReply = (curComment.tags || []).indexOf("discussiontools-reply") > -1;
			var isNewTopic = (curComment.tags || []).indexOf("discussiontools-newtopic") > -1;
			var fromRev = curComment.old_revid;
			var toRev = curComment.revid;
			var heading = curComment.comment;
			var username = curComment.user;
			var timestamp = ((curComment.timestamp || '') === '') ? null : Date.parse(curComment.timestamp);
			if (isReply) {
				heading = heading.slice(3, heading.length - ("Reply".length) - 4);
			} else if (isNewTopic) {
				heading = heading.slice(3, heading.length - ("new section".length) - 4);
			}
			return {
				pageId: pageId,
				pageTitle: pageTitle,
				heading: heading,
				username: username,
				timestamp: timestamp,
				isReply: isReply,
				isNewTopic: isNewTopic,
				fromRev: fromRev,
				toRev: toRev,
				contents: null
			};
		});
		return discussions;
	}

	function compareParsedRcs(parsedFeeds, parsedApiQuery) {
		var idxApiQuery = 0, idxFeeds = 0;
		var atIndexes = [];
		var fetchMidRevs = [];
		while (idxApiQuery < parsedApiQuery.length) {
			if (idxFeeds >= parsedFeeds.length) {
				atIndexes.push(idxApiQuery);
				fetchMidRevs.push(parsedApiQuery[idxApiQuery].toRev);
				idxApiQuery++;
				continue;
			}
			if (parsedApiQuery[idxApiQuery].fromRev === parsedFeeds[idxFeeds].fromRev && parsedApiQuery[idxApiQuery].toRev === parsedFeeds[idxFeeds].toRev) {
				parsedApiQuery[idxApiQuery].contents = buildStringFromDiffs(
					parsedFeeds[idxFeeds].textAdditions, 
					parsedFeeds[idxFeeds].heading, 
					parsedFeeds[idxFeeds].isReply
				);
				idxApiQuery++;
				idxFeeds++;
			} else if (parsedFeeds[idxFeeds].hasMultipleRevs) {
				do {
					atIndexes.push(idxApiQuery);
					fetchMidRevs.push(parsedApiQuery[idxApiQuery].toRev);
					idxApiQuery++;
				} while (idxApiQuery < parsedApiQuery.length && parsedApiQuery[idxApiQuery-1].fromRev !== parsedFeeds[idxFeeds].fromRev);
				idxFeeds++;
			} else {
				// Something is wrong... Try to fetch the extra information anyway
				atIndexes.push(idxApiQuery);
				fetchMidRevs.push(parsedApiQuery[idxApiQuery].toRev);
				idxApiQuery++;
				idxFeeds++;
			}
		}
		return [parsedApiQuery, atIndexes, fetchMidRevs];
	}
	
	function fillIntermediaryRevs(parsedApiRcs, fillIndexes, revids) {
		return new Promise(function (resolve, reject) {
			if (revids.length === 0) { resolve(parsedApiRcs); }
			var parser = new window.DOMParser();
			api.get({
				action: 'query', 
				format: 'json',
				revids: revids.join('|'),
				prop: 'revisions',
				rvdiffto: 'prev'
			})
				.done(function (data) {
					var i, j;
					var revToIdx = {};
					for (i = 0; i < revids.length; i++) {
						revToIdx[revids[i]] = fillIndexes[i];
					}
					var objs = Object.values(data.query.pages || {});
					for (i = 0; i < objs.length; i++) {
						var revs = (objs[i] || {}).revisions || [];
						for (j = 0; j < revs.length; j++) {
							var revid = revs[j].revid;
							var diffs = (revs[j].diff || {})['*'];
							if (diffs !== undefined) {
								diffs = parser.parseFromString('<html><table>' + diffs + '</table></html>', 'application/xml');
								diffs = parseNewAdditionDiffs(diffs);
								var atIndex = revToIdx[''+revid];
								var comment = buildStringFromDiffs(
									diffs, 
									parsedApiRcs[atIndex].heading, 
									parsedApiRcs[atIndex].isReply
								);
								parsedApiRcs[atIndex].contents = comment;
							}
						}
					}
					resolve(parsedApiRcs);
				})
				.fail(reject);
		});
	}

	function fetchFromCache() {
		try { 
			var cacheExpiredTime = localStorage.getItem(LOCAL_STORAGE_EXPIRATION_KEY);
			if (cacheExpiredTime === null || isNaN(+cacheExpiredTime) || Date.now() > +cacheExpiredTime) {
				clearCache();
			}
			var raw = localStorage.getItem(LOCAL_STORAGE_KEY);
			if (raw === null) return null;
			raw = JSON.parse(raw);
			return raw;
		} catch(error) {
			clearCache(); 
			return null;
		}		
	}
	
	function saveToCache(res) {
		localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(res));
		localStorage.setItem(LOCAL_STORAGE_EXPIRATION_KEY, new Date(Date.now() + LOCAL_STORAGE_MAX_AGE).getTime());
	}
	
	function clearCache() {
		localStorage.removeItem(LOCAL_STORAGE_KEY);
		localStorage.removeItem(LOCAL_STORAGE_EXPIRATION_KEY);
	}
	
	// =================
	//   UI
	// =================
	function buildRCDiscussionItem(item) {
		var card = $('<article>');
		
		var commentSummary = $('<div>').addClass('rc-discussion-feed-comment-summary');
		commentSummary.append(
			$('<span>')
				.addClass('rc-discussion-feed-post-author')
				.text(item.username)
		);
		commentSummary.append(
			$('<span>')
				.addClass('rc-discussion-feed-user-info')
				.append(' (')
				.append(
					$('<a>')
						.attr('href', mw.util.getUrl('User talk:'+item.username))
						.attr('rel', 'nofollow noindex')
						.text('talk')
				)
				.append(' | ')
				.append(
					$('<a>')
						.attr('href', mw.util.getUrl('Special:Contributions/'+item.username))
						.attr('rel', 'nofollow noindex')
						.text('contribs')
				)
				.append(') ')
		);
		if (item.isNewTopic) {
			commentSummary.append("posted a new topic");
		} else if (item.isReply) {
			commentSummary.append("posted a reply");
		}
		commentSummary
			.append(' on ')
			.append(
				$('<a>')
					.attr('href', DEBUG_DOMAIN+mw.util.getUrl(item.pageTitle))
					.attr('rel', 'nofollow noindex')
					.addClass("rc-discussion-feed-post-title")
					.text(item.pageTitle)
			);
		
		var postUrl = DEBUG_DOMAIN+mw.util.getUrl(item.pageTitle) + ('#' + (
			item.heading
				.replaceAll(/[\{\}]/g, '')
				.replaceAll(/\s+/g, '_')));
		var headingLink = (
			$('<div>')
				.addClass('rc-discussion-feed-comment-heading')
				.append(
					$('<a>')
						.attr('href', postUrl)
						.attr('rel', 'nofollow noindex')
						.text(item.heading)
				)
		);
		
		var addedComment = $('<div>').addClass('rc-discussion-feed-added-comment');
		if (item.contents === null) {
			var failedToFetchMsg = $('<span>')
				.addClass('rc-discussion-error')
				.text('Failed to load the comment. Click the link to the post to see the full discussion.');
			addedComment.append(failedToFetchMsg);
		} else {
			addedComment.text(item.contents);
		}
		
		var d = new Date(item.timestamp);
		var timestamp = d.toLocaleString(navigator.language || 'en', { 
		    'year': 'numeric', 
		    'month': 'long', 
		    'day': 'numeric'
		}) + ', ' + d.toLocaleString(navigator.language || 'en', { 
		    'hour': 'numeric', 
		    'minute': 'numeric', 
		    'timeZoneName': 'longOffset'
		});
		timestamp = $('<div>').addClass('rc-discussion-feed-timestamp').text(timestamp);
		
		card
			.append(commentSummary)
			.append(headingLink)
			.append(addedComment)
			.append(timestamp);
		return card;
	}
	
	function groupDiscussionsByDate(items) {
		var res = {};
		var prevDate = null;
		for (var i = 0; i < items.length; i++) {
			var curDate = items[i].timestamp === null ? '' : 
				new Date(items[i].timestamp).toLocaleString(navigator.language || 'en', { 
	    			'year': 'numeric', 'month': 'long', 'day': 'numeric'
				});
			if (prevDate !== curDate) {
				res[curDate] = [];
				prevDate = curDate;
			}
			res[curDate].push(items[i]);
		}
		return res;
	}
	
	function populateRecentDiscussion(data) {
		var html = '';
		var dates = Object.keys(data);
		var i, j;
		if (dates.length === 0) {
			$( '#rc-discussion-feeds-articles' ).html(
				'<div>No data found.</div>'
			);
		} else {
			for (i = 0; i < dates.length; i++) {
				var dateGroup = $('<div>').addClass('rc-discussion-date-group');
				dateGroup.append(
					$('<div>')
						.addClass('rc-discussion-date')
						.text(dates[i])
				);
				var items = data[dates[i]];
				for (j = 0; j < items.length; j++) {
					dateGroup.append(buildRCDiscussionItem(items[j]));
				}
				$( '#rc-discussion-feeds-articles' ).append(dateGroup);
			}
		}
	}
	
	function init() {
		$( 'head title' ).html( 'Recent Discussion - ' + config.wgSiteName );
		$( '#firstHeading' ).html( 'Recent Changes - Discussion' );
		$( '#mw-content-text' ).html( '<div id="rc-discussion-feeds"></div>' );
		$( '#rc-discussion-feeds' ).html(
			'<div>Use this page to look at recent discussion throughout the ' + config.wgSiteName + 
			' (max ' + NUMBER_OF_POSTS + ' posts for a ' + MAX_DURATION_IN_DAYS + ' day period).</div>' + 
			'<div id="rc-discussion-dropdown"></div>' + 
			'<div id="rc-discussion-actions"></div>' +
			'<div id="rc-discussion-feeds-articles-container"><div id="rc-discussion-feeds-articles"></div></div>'
		);
		var dropdown = new OO.ui.DropdownInputWidget( {
			options: MENU_OPTIONS.map(function (op, idx) { return { label: op.label, data: idx }; }),
		} );
		var fieldset = new OO.ui.FieldsetLayout({
			items: [
				new OO.ui.FieldLayout( dropdown, { label: 'Filter discussions:' } ),
			]
		});
		$( '#rc-discussion-dropdown' ).append( fieldset.$element );
		var refreshButton = new OO.ui.ButtonWidget( {
	        label: 'Reload',
	        icon: 'reload',
	        title: 'Reload discussions feed'
	    } );
		$( '#rc-discussion-actions' ).append( refreshButton.$element );
		var $spinner = $.createSpinner( { size: 'large', type: 'block', id: 'rc-discussion' } );
		$( '#rc-discussion-feeds-articles' ).after($spinner);
		dropdown.on('change', loadDiscussions);
		refreshButton.on('click', function () {
			console.log(dropdown.getValue());
			loadDiscussions(dropdown.getValue(), true);
		});
		loadDiscussions(0);
	}
	
	function installPortletLink() {
		mw.loader.using('mediawiki.util', function () {
			if (!$('#t-rc-discussion').length) {
				mw.util.addPortletLink(
					'p-tb',
					mw.util.getUrl(SHOW_ON_PAGES[0]),
					'Recent Discussions',
					't-rc-discussion',
					'View recent discussion on the ' + config.wgSiteName,
					null,
					'#t-specialpages'
				);
			}
			if (!$('#n-rc-discussion').length) {
				mw.util.addPortletLink(
					'p-navigation',
					mw.util.getUrl(SHOW_ON_PAGES[0]),
					'Recent Discussions',
					'n-rc-discussion',
					'View recent discussion on the ' + config.wgSiteName,
					null,
					'#n-Create-Page'
				);
				$('#n-rc-discussion > a').addClass('nav-link');
			}
			if (config.wgCanonicalSpecialPageName === 'Recentchanges' && !$('#ca-nstab-rc-discussion').length) {
				mw.util.addPortletLink(
					'p-namespaces',
					mw.util.getUrl(SHOW_ON_PAGES[0]),
					'Recent Discussions',
					'ca-nstab-rc-discussion',
					'View recent discussion on the ' + config.wgSiteName
				);
			}
		});
	}
	
	// =================
	//   Utilities
	// =================
	function decodeXmlContents(text) {
		return text.replaceAll(/&lt;/g,'<').replaceAll(/&gt;/g,'>').replaceAll(/&amp;/g,'&');
	}
	function escapeRegExp(string) {
		return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
	}
	function stripLinks(text) {
		text = text.replaceAll(/\[\[([^\|\]]+)\]\]/g, '$1');
		text = text.replaceAll(/\[\[([^\|\]]+)\|([^\|\]]*)\]\]/g, '$2');
		text = text.replaceAll(/\[(https?:\/\/[^ \]]+)\s*([^\]]*)\]/g, '$2');
		return text;
	}
	function stripTags(text) {
		text = text.replaceAll(/<(nowiki|includeonly|noinclude|mobileonly|nomobile|code|blockquote)>(.*?)<\/\1>/g, "$2");
		return text;
	}
	function parseNewAdditionDiffs(doc) {
		var diffs = Array.from(doc.querySelectorAll('table > tr:not(.diff-title)'));
		diffs = diffs
			.filter(function (tr) {
				return tr.querySelector('td.diff-empty.diff-side-deleted') !== null;
			})
			.map(function (tr) {
				return tr.querySelector('td:not(.diff-empty):not(.diff-side-deleted):not(.diff-marker)');
			})
			.map(function (tr) { return decodeXmlContents(tr.textContent); });
		return diffs;
	}
	function buildStringFromDiffs(diffs, filterHeading, isReply) {
		var rxTaggedSignature = /\s*\[\[User:[^\]]+?\]\]\s+\(\[\[User[ _]talk:[^\]\|]+?\|talk\]\]\)\s+\d{1,2}:\d{1,2},\s+\d{1,2}\s+[a-zA-Z]+\s+\d{4}\s+\(UTC\)\s*$/;
		var rxHeadingWikitext = new RegExp("(?<=^|\\n|<br\\s?\\/?>)={2}\\s*" + escapeRegExp(filterHeading || '').replaceAll(/[ _]/g, '[ _]') + "\\s*={2}(?=\\n|<br\\s?\/?>|$)");
		
		// Clear heading
		diffs = diffs
			.map(function (txt) { return txt.replace(rxHeadingWikitext, ''); })
			.filter(function (txt) { return txt.trim() !== ''; });
		// Remove reply wikitext syntax
		if (isReply) { diffs = diffs.map(function (s) { return s.replace(/^:+\s*/, ''); }); }
		// Remove tagged signature
		diffs = diffs.map(function (s) { return s.replace(rxTaggedSignature, ''); });
		// Trim unneeded whitespace
		while (diffs.length > 0 && diffs[0] === '') { diffs.shift(); }
		while (diffs.length > 0 && diffs[diffs.length-1] === '') { diffs.pop(); }
		// Build string
		return stripTags(stripLinks(diffs.map(function (s) { return s === '' ? '<br />' : s; }).join(' ').trim()));
	}
	
	// =================
	//   Run
	// =================	
	init();
	
} )( jQuery, mediaWiki );