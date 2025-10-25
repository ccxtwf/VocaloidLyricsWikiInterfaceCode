/*! 
 * Adds a special page to browse through recent posts and replies made using the DiscussionTools extension.
 * Authored by [[User:CoolMikeHatsune22]]
 */
import type { ApiQueryRecentChangesParams, ApiQueryAllRevisionsParams } from "types-mediawiki-api";
import type { ApiResponse } from "types-mediawiki/mw/Api.js";
import type { 
	IMenuUption, 
	IParsedApiQueryRc, 
	IGroupedParsedApiQueryRc, 
	IExpectedApiQueryRvResponse 
} from "./types.js";

import { 
	parseRcFeeds, 
	parseRcApiQuery,
	parseRvApiQuery,
	compareParsedRcs,
	groupDiscussionsByDate,
} from './utils.js';


( function ( $, mw ) {
	'use strict';

	// =================
	//   Configuration
	// =================
	const MENU_OPTIONS: IMenuUption[] = [
		{ 
			label: 'All (Excluding User Talk)', 
			frc: '&namespace=3&invert=true', 
			ns: [1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 500, 501, 828, 829]
		},
		{ 
			label: 'All', 
			frc: '', 
			ns: null
		},
		{
			label: 'Main Talk', 
			frc: '&namespace=1', 
			ns: [1]
		},
		{
			label: 'Help Talk', 
			frc: '&namespace=13', 
			ns: [13]
		},
		{
			label: 'Vocaloid Lyrics Wiki Discussion', 
			frc: '&namespace=4', 
			ns: [4]
		},
		{
			label: 'Vocaloid Lyrics Wiki Talk', 
			frc: '&namespace=5', 
			ns: [5]
		},
		{
			label: 'User Talk', 
			frc: '&namespace=3', 
			ns: [3]
		},
		{
			label: 'Category Talk', 
			frc: '&namespace=15', 
			ns: [15]
		},
		{
			label: 'File Talk', 
			frc: '&namespace=7', 
			ns: [7]
		},
		{
			label: 'MediaWiki Talk', 
			frc: '&namespace=9', 
			ns: [9]
		},
		{
			label: 'Template Talk', 
			frc: '&namespace=11', 
			ns: [11]
		},
		{
			label: 'Module Talk', 
			frc: '&namespace=829', 
			ns: [829]
		}
	];
	const SHOW_ON_PAGES = ['Special:RecentDiscussions', 'Special:BlankPage/RC-Discussions'];
	const NUMBER_OF_POSTS = 50;
	const MAX_DURATION_IN_DAYS = 7;

	//! Set to the domain of another (live/prod) wiki for testing on a local (non-prod) MW mirror
	const DEBUG_FOREIGN_WIKI = ''; 

	const LOCAL_STORAGE_KEY = 'vlw_rc_discussions_items';
	const LOCAL_STORAGE_EXPIRATION_KEY = 'vlw_rc_discussions_expiration';
	const LOCAL_STORAGE_MAX_AGE = 5 * 60 * 1000; // 5 minutes

	const DEBUGGING_ID = 'gadget-recent-discussions';

	const messages = {
		'rc-discussion--app-overview': "Use this page to look at recent discussion throughout the $1  (max $2 posts for a $3 day period)."
	};

	// =================
	//   Main Fetching Logic
	// =================
	const config = mw.config.get([
		'wgPageName',
		'wgCanonicalSpecialPageName',
		'wgScriptPath',
		'wgSiteName'
	]);

	installPortletLink();
	if (SHOW_ON_PAGES.indexOf(config.wgPageName) < 0) {
		return;
	}

	const api: mw.Api | mw.ForeignApi = (DEBUG_FOREIGN_WIKI === '' ? 
		new mw.Api() :
		new mw.ForeignApi(`${DEBUG_FOREIGN_WIKI}${config.wgScriptPath}/api.php`, { anonymous: true })
	);

	function loadApp() {
		const App = Vue.createMwApp({
			template: `
			<div id="rc-discussion-feeds">
				<div>
					{{ $i18n( 'rc-discussion--app-overview', siteName, maxPosts, maxDuration ).text() }}
				</div>
				<div id="rc-discussion-dropdown">
				</div>
				<div id="rc-discussion-actions">
				</div>
				<div id="rc-discussion-feeds-articles-container">
					<div id="rc-discussion-feeds-articles">
					</div>
				</div>
			</div>
			`,
			setup: () => ({
				siteName: config.wgSiteName,
				maxPosts: NUMBER_OF_POSTS,
				maxDuration: MAX_DURATION_IN_DAYS
			})
		});

		App.component('rc-discussion-cards', {
			template: `
			<div class="rc-discussion-date-group">
				<div class="rc-discussion-date">
				{{}}
				</div>
				<rc-discussion-card v-for: />
			</div>
			`
		});

		App.component('rc-discussion-card', {
			template: `
			<article>

				<div class="rc-discussion-feed-comment-summary">
					<span class="rc-discussion-feed-post-author"></span>
					<span class="rc-discussion-feed-user-info">
						&nbsp;(
						<a href="" rel="nofollow noindex">
							talk
						</a>
						&nbsp;|&nbsp;
						<a href="" rel="nofollow noindex">
							contribs
						</a>
						)&nbsp;
					</span>
				</div>
				
				<div class="rc-discussion-feed-comment-heading">
					<a href="" rel="nofollow noindex">
					</a>
				</div>

				<div class="rc-discussion-feed-added-comment">

				</div>

				<div class="rc-discussion-feed-timestamp">
				</div>

			</article>
			`
		});
	}






	function loadDiscussions(idx: number, noCache?: boolean): void {
		idx = +idx;
		if (isNaN(idx)) {
			console.error('Read recent changes: Invalid Argument', DEBUGGING_ID);
			return;
		}
		$('#rc-discussion-feeds-articles').html('');
		$('#rc-discussion-feeds-articles-container .mw-spinner').show();
		if (idx === 0 && !noCache) {
			const fetchedFromCache = fetchFromCache();
			if (fetchedFromCache !== null) {
				populateRecentDiscussion(fetchedFromCache);
				$('#rc-discussion-feeds-articles-container .mw-spinner').hide();
				return;
			}
		}
		readRecentChangesFeed(idx)
			.then(([a, b]: [PromiseSettledResult<string>, PromiseSettledResult<ApiResponse>]) => {
				const parsedFeeds = parseRcFeeds(a);
				const parsedApiRcs = parseRcApiQuery(b);
				const [comparedApiRcs, fillIndexes, revIds] = compareParsedRcs(parsedFeeds, parsedApiRcs);
				return fillIntermediaryRevs(comparedApiRcs, fillIndexes, revIds);
			})
			.then(groupDiscussionsByDate)
			.then((data: IGroupedParsedApiQueryRc) => {
				if (idx === 0) { saveToCache(data); }
				return data;
			})
			.then(populateRecentDiscussion)
			.catch((err) => {
				mw.notify('An unexpected error has occured. Please report this bug if it persists.', { type: 'error' });
				console.error( err, DEBUGGING_ID );
			})
			.finally(function () {
				$('#rc-discussion-feeds-articles-container .mw-spinner').hide();
			});
	}

	function readRecentChangesFeed(idx: number): Promise<[PromiseSettledResult<string>, PromiseSettledResult<ApiResponse>]> {
		return Promise.allSettled([
			new Promise<string>((resolve, reject) => {
				fetch(
					`${DEBUG_FOREIGN_WIKI}${config.wgScriptPath}/api.php?action=feedrecentchanges&feedformat=rss&tagfilter=discussiontools&limit=${NUMBER_OF_POSTS}&days=${MAX_DURATION_IN_DAYS}${MENU_OPTIONS[idx].frc}&origin=*`
				)
				.then(res => { resolve(res.text()); })
				.catch(reject);
			}),
			api.get({
				action: 'query', 
				format: 'json',
				list: 'recentchanges', 
				rctag: 'discussiontools',
				rcprop: ['user', 'comment', 'flags', 'timestamp', 'title', 'tags', 'ids'],
				rcnamespace: MENU_OPTIONS[idx].ns,
				rclimit: NUMBER_OF_POSTS,
				rcslot: 'main', 
				rcgeneraterevisions: true,
				rcend: new Date(Date.now() - (MAX_DURATION_IN_DAYS * 24 * 60 * 60 * 1000)).toISOString(),
			} as ApiQueryRecentChangesParams)
		]);
	}

	function fillIntermediaryRevs(parsedApiRcs: IParsedApiQueryRc[], fillIndexes: number[], revids: number[]): Promise<IParsedApiQueryRc[]> {
		return new Promise(function (resolve, reject) {
			if (revids.length === 0) { resolve(parsedApiRcs); }
			
			api.get({
				action: 'query', 
				format: 'json',
				revids,
				prop: 'revisions',
				//! rvdiffto is a quote-on-quote deprecated method of prop=revisions 
				//! (https://www.mediawiki.org/w/api.php?action=help&modules=query%2Brevisions)
				//! If you're importing this code to use on another wiki, beware
				rvdiffto: 'prev'	
			} as ApiQueryAllRevisionsParams)
			.done((data: IExpectedApiQueryRvResponse) => {
				parseRvApiQuery(data, parsedApiRcs, revToIdx);
				resolve(parsedApiRcs);
			})
			.fail(reject);
		});
	}


	// =================
	//   Caching
	// =================
	function fetchFromCache(): IGroupedParsedApiQueryRc | null {
		try { 
			const cacheExpiredTime = localStorage.getItem(LOCAL_STORAGE_EXPIRATION_KEY);
			if (cacheExpiredTime === null || isNaN(+cacheExpiredTime) || Date.now() > +cacheExpiredTime) {
				clearCache();
			}
			let raw = localStorage.getItem(LOCAL_STORAGE_KEY);
			if (raw === null) return null;
			return JSON.parse(raw);
		} catch(error) {
			clearCache(); 
			return null;
		}		
	}

	function saveToCache(res: IGroupedParsedApiQueryRc): void {
		localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(res));
		const expirationTime = new Date(Date.now() + LOCAL_STORAGE_MAX_AGE).getTime();
		localStorage.setItem(LOCAL_STORAGE_EXPIRATION_KEY, expirationTime.toString());
	}

	function clearCache(): void {
		localStorage.removeItem(LOCAL_STORAGE_KEY);
		localStorage.removeItem(LOCAL_STORAGE_EXPIRATION_KEY);
	}

	

	

	function installPortletLink(): void {
		const label = 'Recent Discussions';
		const tooltipText = `View recent discussion on the ${config.wgSiteName}`;
		if (!$('#t-rc-discussion').length) {
			mw.util.addPortletLink(
				'p-tb',
				mw.util.getUrl(SHOW_ON_PAGES[0]),
				label,
				't-rc-discussion',
				tooltipText,
				undefined,
				'#t-specialpages'
			);
		}
		if (!$('#n-rc-discussion').length) {
			mw.util.addPortletLink(
				'p-navigation',
				mw.util.getUrl(SHOW_ON_PAGES[0]),
				label,
				'n-rc-discussion',
				tooltipText,
				undefined,
				'#n-Create-Page'
			);
			$('#n-rc-discussion > a').addClass('nav-link');
		}
		if (config.wgCanonicalSpecialPageName === 'Recentchanges' && !$('#ca-nstab-rc-discussion').length) {
			mw.util.addPortletLink(
				'p-namespaces',
				mw.util.getUrl(SHOW_ON_PAGES[0]),
				label,
				'ca-nstab-rc-discussion',
				tooltipText
			);
		}
	}

	// =================
	//   Run
	// =================	
	init();
} )( jQuery, mediaWiki );