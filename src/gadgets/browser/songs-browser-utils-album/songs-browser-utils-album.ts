import type { ApiQueryCategoriesParams } from "types-mediawiki-api";
import type { IAlbumFetchUtils, ILookForCategories, IApiSettings, IExpectedApiQueryAlbum } from "../songs-browser/types.js";

(function (mw, $) {
	'use strict';

	const DEBUGGING_ID = "songs-browser-utils-album";

	class AlbumFetchUtils implements IAlbumFetchUtils {
		api: mw.Api;
		lookForCategories: ILookForCategories;
		checkForAlbumTitles: string[];
		apiSettings: IApiSettings;

		constructor(serverCacheMaxAge: number) {
			this.api = new mw.Api();
			this.lookForCategories = {
				titles: [],
				fetched: {},
				mapToEvents: {},
				mapToResults: {},
			};
			this.checkForAlbumTitles = this.findAlbumSongTitles();
			this.apiSettings = {
				serverCacheMaxAge,
				apiMaxLimit: 500
			}
		}

		findAlbumSongTitles(): string[] {
			const titles: string[] = [];
			$('.album-infobox ol > li > a').each(function () {
				titles.push( $(this).attr('title')! );
			});
			return titles;
		}

		registerCategory(title: string, event: string): void {
			title = 'Category:' + title;
			if (this.lookForCategories.fetched[title] !== undefined) { 
				return; 
			}
			this.lookForCategories.titles.push(title);
			this.lookForCategories.fetched[title] = false;
			this.lookForCategories.mapToEvents[title] = event;
			this.lookForCategories.mapToResults[title] = [];
		}

		createQueryPromises(categories: string[]): [mw.Api.AbortablePromise[], string[][]] {
			const promises: mw.Api.AbortablePromise[] = [];
			const batchCategories: string[][] = [];
			if (this.checkForAlbumTitles.length === 0) {
				return [promises, batchCategories];
			}
			const ctPerQuery = Math.floor(this.apiSettings.apiMaxLimit / this.checkForAlbumTitles.length);
			const numQueries = Math.ceil(categories.length / ctPerQuery);
			for (let i = 0; i < numQueries; i++) {
				const fetchCats = categories
					.slice(i*ctPerQuery, (i+1)*ctPerQuery);
				promises.push(this.api.get( {
					action: 'query',
					format: 'json',
					prop: 'categories',
					cllimit: 500,
					clcategories: fetchCats,
					titles: this.checkForAlbumTitles,
					redirects: true,
					maxage: this.apiSettings.serverCacheMaxAge || 0,
					smaxage: this.apiSettings.serverCacheMaxAge || 0
				} as ApiQueryCategoriesParams));
				batchCategories.push(fetchCats);
			}
			return [promises, batchCategories];
		}

		processSettledPromise(results: PromiseSettledResult<IExpectedApiQueryAlbum>, categories: string[]): void {
			if (results.status === 'rejected') {
				console.error(results.reason, DEBUGGING_ID);
				return;
			}
			const data = results.value;
			if (!data.query) { 
				console.error("The MediaWiki API has returned zero results.", DEBUGGING_ID);
				if (!!data.error) {
					console.error("Error message from the API: ", (data.error as { info: string }).info || data.error, DEBUGGING_ID);
				}
				return;
			}
			
			const mapRedirects: { [target: string]: string } = {};
			if (!!data.query.redirects) {
				for (const { from, to } of data.query.redirects) {
					mapRedirects[to] = from;
				}
			}
			for (const [pageid, o] of Object.entries(data.query.pages || {})) {
				if (+pageid < 0) { continue; }
				let pageTitle = o.title;
				if (pageTitle in mapRedirects) {
					pageTitle = mapRedirects[pageTitle];
				}
				if (!!o.categories) {
					for (const { title: categoryTitle } of o.categories) {
						this.lookForCategories.mapToResults[categoryTitle].push(pageTitle);
					}
				}
			}
			for (const category of categories) {
				this.lookForCategories.fetched[category] = true;
			}
		}

		publishResultsToObserver(category: string): void {
			const event = this.lookForCategories.mapToEvents[category];
			const categoryMembers = this.lookForCategories.mapToResults[category];
			let elements = $('');
			for (const categoryMember of categoryMembers) {
				const selector = `a[title='${categoryMember.replaceAll("'", "\\'")}']`;
				elements = elements.add(selector);
			}
			mw.hook(event).fire(elements);
		}

		queryPagesBelongingToUnfetchedCategories(): void {
			const categories = Object.entries(this.lookForCategories.fetched)
				.filter(([_, isFetched]) => !isFetched )
				.map(([title, _]) => title );
			const [promises, catsInBatches] = this.createQueryPromises(categories);
			const onSettledPromises = (arrResults: PromiseSettledResult<IExpectedApiQueryAlbum>[]) => {
				for (let i = 0; i < arrResults.length; i++) {
					this.processSettledPromise(arrResults[i], catsInBatches[i]);
				}
				for (const category of categories) {
					this.publishResultsToObserver(category);
				}
			}
			onSettledPromises.bind(this);
			Promise.allSettled(promises)
				.then(onSettledPromises)
				.catch(function (err) {
					console.error(err, DEBUGGING_ID);
				});
		}
	}

	(mw.libs as any).AlbumFetchUtils = AlbumFetchUtils;

}(mediaWiki, jQuery));