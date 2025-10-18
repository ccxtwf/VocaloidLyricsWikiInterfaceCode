/* [[Category:Scripts]] */
(function (mw, $) {
	'use strict';

	function CategoryFetchUtils(serverCacheMaxAge) {
		var config = mw.config.get([
			'wgArticleId',
			'wgContentLanguage'
		]);
		this.api = new mw.Api();
		this.lookForCategories = {
			titles: [],
			fetched: {},
			mapToEvents: {},
			mapToResults: {},
		};
		
		var from = mw.util.getParamValue( 'pagefrom' ) || mw.util.getParamValue( 'from' );
		var to = mw.util.getParamValue( 'pageuntil' );
		if ((to || '') !== '' && (from || '') === '') {
			// Exploit to get the API to return the last 200 pages until the sortkey stored in the variable 'to' (MW 1.43)
			var prevPageLink = $('#mw-pages > a').first();
			if (prevPageLink.length && prevPageLink[0].innerText === 'previous page') {
				from = mw.util.getParamValue( 'pageuntil', prevPageLink.attr('href') );
			}
		}
		
		var curPagesInCategory = 0, totalPagesInCategory = 0; 
		var catSummaryNode = $('#mw-pages > h2:first-child() + p').first();
		var catSummaryText = (catSummaryNode.length > 0) ? catSummaryNode.html() : '';
		var catSummaryParsed = catSummaryText.match(/The following (\d+) pages are in this category, out of ([\d,\.]+) total/);
		if (catSummaryParsed !== null) {
			var thousandSeparator = (1234).toLocaleString(config.wgContentLanguage).substring(1, 2);
			var rxRemoveSeparator = new RegExp(thousandSeparator.replace(/\./, "\\."), "g");
			curPagesInCategory = parseInt(catSummaryParsed[1].replaceAll(rxRemoveSeparator, ''));
			totalPagesInCategory = parseInt(catSummaryParsed[2].replaceAll(rxRemoveSeparator, ''));
		}
		
		this.categorySettings = {
			categoryId: config.wgArticleId,
			contentLanguage: config.wgContentLanguage,
			from: (from || '') === '' ? undefined : from,
			to: (to || '') === '' ? undefined : to,
			curPagesInCategory: curPagesInCategory,
			totalPagesInCategory: totalPagesInCategory,
			apiMaxLimit: 500,
			serverCacheMaxAge: serverCacheMaxAge
		};
	}
	CategoryFetchUtils.prototype.registerCategory = function (title, event) {
		title = 'Category:' + title;
		if (this.lookForCategories.fetched[title] !== undefined) { return; }
		this.lookForCategories.titles.push(title);
		this.lookForCategories.fetched[title] = false;
		this.lookForCategories.mapToEvents[title] = event;
		this.lookForCategories.mapToResults[title] = [];
	};
	CategoryFetchUtils.prototype.createQueryPromises = function (categories) {
		var promises = [];
		var batchCategories = [];
		if (this.categorySettings.curPagesInCategory === 0) return [promises, batchCategories];
		var ctPerQuery = Math.floor(this.categorySettings.apiMaxLimit / this.categorySettings.curPagesInCategory);
		var numQueries = Math.ceil(categories.length / ctPerQuery);
		for (var i = 0; i < numQueries; i++) {
			var fetchCats = categories
				.slice(i*ctPerQuery, (i+1)*ctPerQuery);
			promises.push(this.api.get( {
				action: 'query',
				format: 'json',
				generator: 'categorymembers',
				prop: 'categories',
				gcmpageid: this.categorySettings.categoryId,
				gcmprop: "title|sortkey",
				gcmlimit: 200,
				gcmsort: 'sortkey', 
				gcmdir: 'ascending',
				gcmstartsortkeyprefix: this.categorySettings.from,
				gcmendsortkeyprefix: this.categorySettings.to,
				cllimit: this.categorySettings.apiMaxLimit,
				clcategories: fetchCats.join('|'),
				maxage: this.categorySettings.serverCacheMaxAge || 0,
				smaxage: this.categorySettings.serverCacheMaxAge || 0
			} ));
			batchCategories.push(fetchCats);
		}
		return [promises, batchCategories];
	};
	CategoryFetchUtils.prototype.processSettledPromise = function (results, categories) {
		if (results.status === 'rejected') {
			mw.errorLogger.logError(results.reason, "songs-browser-utils");
			return;
		}
		var i;
		var data = results.value;
		if (!data.query) { 
			mw.errorLogger.logError("The MediaWiki API has returned zero results.", "songs-browser-utils");
			if (!!data.error) {
				mw.errorLogger.logError("Error message from the API: ", data.error.info || data.error, "songs-browser-utils");
			}
			return;
		}
		
		var values = Object.values(data.query.pages || {});
		for (i = 0; i < values.length; i++) {
			var pageTitle = values[i].title;
			if ("categories" in values[i]) {
				var foundCats = [];
				for (var j = 0; j < values[i].categories.length; j++) {
					var category = values[i].categories[j].title;
					this.lookForCategories.mapToResults[category].push(pageTitle);
				}
			}
		}
		for (i = 0; i < categories.length; i++) {
			this.lookForCategories.fetched[categories[i]] = true;
		}
	};
	CategoryFetchUtils.prototype.publishResultsToObserver = function (category) {
		var event = this.lookForCategories.mapToEvents[category];
		var categoryMembers = this.lookForCategories.mapToResults[category];
		var elements = $('');
		for (var c = 0; c < categoryMembers.length; c++) {
			var selector = "a[title='" + categoryMembers[c].replaceAll("'", "\\'") + "']";
			elements = elements.add(selector);
		}
		mw.hook(event).fire(elements);
	};
	CategoryFetchUtils.prototype.queryPagesBelongingToUnfetchedCategories = function () {
		var i;
		var categories = Object.entries(this.lookForCategories.fetched)
			.filter(function (kv) { return !kv[1]; })
			.map(function (kv) { return kv[0]; });
		var p = this.createQueryPromises(categories);
		var promises = p[0], catsInBatches = p[1];
		var self = this;
		Promise.allSettled(promises)
			.then(function (arrResults) {
				for (i = 0; i < arrResults.length; i++) {
					self.processSettledPromise(arrResults[i], catsInBatches[i]);
				}
				for (i = 0; i < categories.length; i++) {
					self.publishResultsToObserver(categories[i]);
				}
			})
			.catch(function (err) {
				mw.errorLogger.logError(err, "songs-browser-utils");
			});
	};
	window.CategoryFetchUtils = CategoryFetchUtils;
}(mediaWiki, jQuery));