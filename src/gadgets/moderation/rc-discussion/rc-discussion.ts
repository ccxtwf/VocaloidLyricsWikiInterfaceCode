import type { ApiQueryRecentChangesParams, ApiQueryAllRevisionsParams } from "types-mediawiki-api";
import type { ApiResponse } from "types-mediawiki/mw/Api.js";
import type { 
	IMenuUption, 
	IParsedApiQueryRc, 
	IGroupedParsedApiQueryRc, 
	IExpectedApiQueryRcResponse,
	IExpectedApiQueryRvResponse, 
	IAppStore,
	IExpectedApiQueryCompareResponse,
} from "./types.js";
import type { Reactive, App } from "vue";

import { 
	parseRcFeeds, 
	parseRcApiQuery,
	parseRvApiQuery,
	compareParsedRcs,
	groupDiscussionsByDate,
	parseCompareApiQuery
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
	const SHOW_ON_SPECIAL_PAGE = 'recentdiscussions';
	const NUMBER_OF_POSTS = 50;
	const MAX_DURATION_IN_DAYS = 7;

	// Set to the domain of another (live/prod) wiki for testing on a local (non-prod) MW mirror
	const DEBUG_FOREIGN_WIKI: string = ''; 

	const LOCAL_STORAGE_KEY = 'vlw_rc_discussions_items';
	const LOCAL_STORAGE_MAX_AGE = 5 * 60; // 5 minutes

	const DEBUGGING_ID = 'gadget-recent-discussions';

	const messages = {
		'rc-discussion--title': 'Recent Discussions - $1',
		'rc-discussion--menu-label': 'Recent Discussions',
		'rc-discussion--menu-tooltip': 'View recent discussion on the $1',
		'rc-discussion--app-overview': "Use this page to look at recent discussion throughout the $1 (max $2 posts for a $3 day period).",
		'rc-discussion--prompt-filter': 'Filter Discussions',
		'rc-discussion--prompt-refresh': 'Refresh',
		'rc-discussion--action-new-topic': 'posted a new topic',
		'rc-discussion--action-new-reply': 'posted a reply',
		'rc-discussion--loading': 'Loading...',
		'rc-discussion--failed-to-load': "The comment has failed to load. Click this text to get the tool to try loading the comment again.",
		'rc-discussion--unexpected-error': 'An unexpected error has occured. Please report this bug if it persists.',
		'rc-discussion--no-data': 'No discussions found with the selected criteria.',
	};
	mw.messages.set(messages);

	const parser = new window.DOMParser();

	// =================
	//   UI
	// =================
	const config = mw.config.get([
		'wgPageName',
		'wgCanonicalSpecialPageName',
		'wgScriptPath',
		'wgSiteName'
	]);

	installPortletLink();
	if (config.wgCanonicalSpecialPageName !== SHOW_ON_SPECIAL_PAGE) {
		return;
	}

	const api: mw.Api | mw.ForeignApi = (DEBUG_FOREIGN_WIKI === '' ? 
		new mw.Api() :
		new mw.ForeignApi(`${DEBUG_FOREIGN_WIKI}${config.wgScriptPath}/api.php`, { anonymous: true })
	);

	let store: Reactive<IAppStore> | undefined;

	function loadApp(): void {
		// Change document title
		document.getElementsByTagName('title')[0].innerHTML = mw.msg('rc-discussion--title', config.wgSiteName);
		// Change page title
		document.getElementById('firstHeading')!.textContent = mw.msg('rc-discussion--title', config.wgSiteName);
		mw.loader.using( ['vue', '@wikimedia/codex'] ).then(require => {
			const Vue = require('vue');
			const { CdxButton, CdxIcon, CdxSelect, CdxField, CdxProgressIndicator } = require('@wikimedia/codex');
			
			store = Vue.reactive({
				option: 0,
				data: {},
				isLoading: false,
			});
			loadDiscussions(store!.option, false);

			const $app: App = Vue.createMwApp({
				template: `
					<div id="rc-discussion-feeds">
						<div>
							{{ $i18n( 'rc-discussion--app-overview', siteName, maxPosts, maxDuration ).text() }}
						</div>
						<div id="rc-discussion-dropdown">
							<cdx-field>
								<cdx-select 
									v-model:selected="store.option"
									v-model:modelValue="selectedLabel"
									:menu-items="dropdownMenuItems"
									:menu-config="dropdownMenuConfig"
									@update:selected="onChangeDropdown"
								/>
								<template #label>
									{{ $i18n( 'rc-discussion--prompt-filter' ).text() }}
								</template>
							</cdx-field>
						</div>
						<div id="rc-discussion-actions">
							<cdx-button @click="onClickedRefresh">
								{{ $i18n( 'rc-discussion--prompt-refresh' ).text() }}
							</cdx-button>
						</div>
						<div id="rc-discussion-feeds-articles-container">
							<div id="rc-discussion-feeds-articles">
								<cdx-progress-indicator show-label v-if="store.isLoading">
									{{ $i18n('rc-discussion--loading').text() }}
								</cdx-progress-indicator>
								<div class="rc-discussion-no-data" v-else-if="dateGroups.length === 0">
									{{ $i18n('rc-discussion--no-data').text() }}
								</div>
								<rc-discussion-cards-grouped-by-date 
									v-else
									v-for="(dateGroup, index) in dateGroups" 
									:key="dateGroup" 
									:date="dateGroup"
									:posts="store.data[dateGroup]"
								/>
							</div>
						</div>
					</div>
					`,
				components: { CdxButton, CdxIcon, CdxSelect, CdxField, CdxProgressIndicator },
				setup: () => {
					return {
						siteName: config.wgSiteName,
						maxPosts: NUMBER_OF_POSTS,
						maxDuration: MAX_DURATION_IN_DAYS,
						dropdownMenuItems: MENU_OPTIONS.map((option, idx) => ({
							label: option.label,
							value: idx
						})),
						dropdownMenuConfig: {
							visibleItemLimit: 5
						},
						store
					}
				},
				computed: {
					dateGroups() {
						return Object.keys(store!.data);
					},
					selectedLabel() {
						return isNaN(store!.option) ? '' : (MENU_OPTIONS[+store!.option].label || '');
					}
				},
				methods: {
					onClickedRefresh() {
						loadDiscussions(store!.option, true);
					},
					onChangeDropdown() {
						loadDiscussions(store!.option, true);
					}
				}
			});
			$app.component("rc-discussion-cards-grouped-by-date", {
				template: `
					<div class="rc-discussion-date-group">
						<div class="rc-discussion-date">
							{{ renderedDate }}
						</div>
						<rc-discussion-card 
							v-for="(post, index) in posts"
							:key="''+post.toRev+(post.contents === null ? '' : 't')"
							:post="post" 
							:date="date"
							:index="index"
						/>
					</div>
					`,
				props: ["date", "posts"],
				setup: ({ date, posts }: { date: string, posts: IParsedApiQueryRc[] }) => ({ date, posts }),
				computed: {
					renderedDate() {
						return new Date(this.date).toLocaleString("en", {
							"year": "numeric",
							"month": "long",
							"day": "numeric"
						});
					}
				}
			});
			$app.component("rc-discussion-card", {
				template: `
					<article>
				
						<div class="rc-discussion-feed-comment-summary">
							<span class="rc-discussion-feed-post-author">
								{{ username }}
							</span>
							<span class="rc-discussion-feed-user-info">
								(<a v-bind:href="userTalkPage" rel="nofollow noindex">talk</a>
								|
								<a v-bind:href="userContribs" rel="nofollow noindex">contribs</a>)
							</span> {{ summaryAction }} on
							<a v-bind:href="pageUrl" rel="nofollow noindex" class="rc-discussion-feed-post-title">
								{{ pageTitle }}
							</a>
						</div>
						
						<div class="rc-discussion-feed-comment-heading">
							<a v-bind:href="postUrl" rel="nofollow noindex">
								{{ heading }}
							</a>
						</div>
				
						<div class="rc-discussion-feed-added-comment">
							<span v-if="contents === null" class="rc-discussion-error" @click="onClickedFailedToLoadCard">
								{{ $i18n( 'rc-discussion--failed-to-load' ).text() }}
							</span>
							<span v-else>
								{{ contents }}
							</span>
						</div>
				
						<div class="rc-discussion-feed-timestamp">
							{{ renderedDate }}
						</div>
				
					</article>
					`,
				props: ["post", "date", "index"],
				setup: ({ post, date, index }: { post: IParsedApiQueryRc, date: string, index: number }) => {
					const { username, heading, contents, timestamp, pageTitle, isNewTopic, isReply, isAnon, fromRev, toRev } = post;
					return { username, heading, contents, timestamp, pageTitle, isNewTopic, isReply, isAnon, fromRev, toRev, date, index, store };
				},
				computed: {
					userTalkPage() {
						return mw.util.getUrl(`User talk:${this.username}`);
					},
					userContribs() {
						return mw.util.getUrl(`Special:Contributions/${this.username}`);
					},
					summaryAction() {
						if (this.isNewTopic) {
							return mw.msg("rc-discussion--action-new-topic");
						} else if (this.isReply) {
							return mw.msg("rc-discussion--action-new-reply");
						}
						return "";
					},
					pageUrl() {
						return `${DEBUG_FOREIGN_WIKI}${mw.util.getUrl(this.pageTitle)}`;
					},
					postUrl() {
						return `${this.pageUrl}#${this.heading.replace(/[\{\}]/g, "").replace(/\s+/g, "_")}`;
					},
					renderedDate() {
						const d = new Date(this.timestamp);
						const timestamp = d.toLocaleString(navigator.language || "en", {
							"year": "numeric",
							"month": "long",
							"day": "numeric"
						}) + ", " + d.toLocaleString(navigator.language || "en", {
							"hour": "numeric",
							"minute": "numeric",
							"timeZoneName": "shortOffset"
						});
						return timestamp;
					}
				},
				methods: {
					onClickedFailedToLoadCard() {
						const { fromRev, toRev, heading, isReply, date, index } = this;
						parseCommentFromCompareActionApi({ fromRev, toRev, heading, isReply, date, index })
							.then(function () {
							})
							.catch((err) => {
								mw.notify(mw.msg('rc-discussion--unexpected-error'), { type: 'error' });
								console.error( err, DEBUGGING_ID );
							});
					}
				}
			});
			$app.mount("#mw-content-text");
		});
	}

	function loadDiscussions(idx: number, noCache?: boolean): void {
		idx = +idx;
		if (isNaN(idx)) {
			console.error('Read recent changes: Invalid Argument', DEBUGGING_ID);
			return;
		}
		store!.isLoading = true;
		if (idx === 0 && !noCache) {
			const fetchedFromCache = fetchFromCache();
			if (fetchedFromCache !== null) {
				store!.data = fetchedFromCache;
				store!.isLoading = false;
				return;
			}
		}
		readRecentChangesFeed(idx)
			.then(([a, b]: [PromiseSettledResult<string>, PromiseSettledResult<ApiResponse>]) => {
				if (a.status !== 'fulfilled') {
					throw new Error('Failed to fetch data.' + a.reason);
				}
				if (b.status !== 'fulfilled') {
					throw new Error('Failed to fetch data.' + b.reason);
				}
				const parsedFeeds = parseRcFeeds(parser, a.value);
				const parsedApiRcs = parseRcApiQuery(b.value as IExpectedApiQueryRcResponse);
				const [comparedApiRcs, revToIdx] = compareParsedRcs(parser, parsedFeeds, parsedApiRcs);
				return fillIntermediaryRevs(comparedApiRcs, revToIdx);
			})
			.then(groupDiscussionsByDate)
			.then((data: IGroupedParsedApiQueryRc) => {
				if (idx === 0) { saveToCache(data); }
				store!.data = data;
			})
			.catch((err) => {
				mw.notify(mw.msg('rc-discussion--unexpected-error'), { type: 'error' });
				console.error( err, DEBUGGING_ID );
			})
			.finally(function () {
				store!.isLoading = false;
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

	function fillIntermediaryRevs(parsedApiRcs: IParsedApiQueryRc[], revToIdx: Map<number, number>) {
		return new Promise(function (resolve, reject) {
			if (revToIdx.size === 0) { 
				resolve(parsedApiRcs); 
				return;
			}
			const revids = Array.from(revToIdx.keys());
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
				parseRvApiQuery(parser, data, parsedApiRcs, revToIdx);
				resolve(parsedApiRcs);
			})
			.fail(reject);
		});
	}

	function parseCommentFromCompareActionApi({ fromRev, toRev, heading, isReply, date, index }: { fromRev: number, toRev: number, heading: string, isReply: boolean, date: string, index: number }): Promise<void> {
		return new Promise((resolve, reject) => {
			api.get({
				action: 'compare',
				format: 'json',
				fromrev: fromRev,
				torev: toRev,
				prop: 'diff',
				difftype: 'table'
			})
				.done((res: IExpectedApiQueryCompareResponse) => {
					const comment = parseCompareApiQuery({ parser, res, heading, isReply });
					store!.data[date]![index]!.contents = comment;
					console.log(store!.data);
					resolve();
				})
				.catch(reject);
		});
	}

	// =================
	//   Caching
	// =================
	function fetchFromCache(): IGroupedParsedApiQueryRc | null {
		// we make it coalesce to null because mw.storage.getObject may return false
		const o = mw.storage.getObject(LOCAL_STORAGE_KEY) || null;
		return o;
	}

	function saveToCache(res: IGroupedParsedApiQueryRc): void {
		mw.storage.setObject(LOCAL_STORAGE_KEY, res, LOCAL_STORAGE_MAX_AGE);
	}

	// =================
	//   Misc
	// =================
	function installPortletLink(): void {
		const label = mw.msg( 'rc-discussion--menu-label' );
		const tooltipText = mw.msg( 'rc-discussion--menu-tooltip', config.wgSiteName );
		const { wgFormattedNamespaces: { '-1': specialNamespace } = { '-1': 'Special' } } = mw.config.get(['wgFormattedNamespaces'])
		if (!$('#t-rc-discussion').length) {
			mw.util.addPortletLink(
				'p-tb',
				mw.util.getUrl(`${specialNamespace}:${SHOW_ON_SPECIAL_PAGE}`),
				label,
				't-rc-discussion',
				tooltipText,
				undefined,
				'#t-specialpages'
			);
		}
		if (config.wgCanonicalSpecialPageName === 'Recentchanges' && !$('#ca-nstab-rc-discussion').length) {
			mw.util.addPortletLink(
				'p-namespaces',
				mw.util.getUrl(`${specialNamespace}:${SHOW_ON_SPECIAL_PAGE}`),
				label,
				'ca-nstab-rc-discussion',
				tooltipText
			);
		}
	}

	// =================
	//   Run
	// =================	
	loadApp();
} )( jQuery, mediaWiki );