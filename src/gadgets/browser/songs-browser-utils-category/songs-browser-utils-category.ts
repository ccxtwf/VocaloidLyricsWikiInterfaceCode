import type { ApiQueryCategoryMembersParams } from "types-mediawiki-api";
import type { ICategoryFetchUtils, ILookForCategories, IApiSettings, IExpectedApiQueryCategory } from "../songs-browser/types.js";

'use strict';

const DEBUGGING_ID = "songs-browser-utils-category";

class CategoryFetchUtils implements ICategoryFetchUtils {
	api: mw.Api;
	lookForCategories: ILookForCategories;
	apiSettings: IApiSettings;
	categorySettings: { 
		categoryId: number
		contentLanguage: string
		from?: string | null
		to?: string | null
		curPagesInCategory: number
		totalPagesInCategory: number
	};

	constructor(serverCacheMaxAge: number) {
		const config = mw.config.get([
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
		this.apiSettings = {
			serverCacheMaxAge,
			apiMaxLimit: 500
		}
		
		let from = mw.util.getParamValue( 'pagefrom' ) || mw.util.getParamValue( 'from' );
		let to = mw.util.getParamValue( 'pageuntil' );
		if ((to || '') !== '' && (from || '') === '') {
			// Exploit to get the API to return the last 200 pages until the sortkey stored in the variable 'to' (MW 1.43)
			const prevPageLink = $('#mw-pages > a').first();
			if (prevPageLink.length && prevPageLink[0].innerText === 'previous page') {
				from = mw.util.getParamValue( 'pageuntil', prevPageLink.attr('href') );
			}
		}
		
		let curPagesInCategory = 0;
		let totalPagesInCategory = 0; 
		const catSummaryNode = $('#mw-pages > h2:first-child() + p').first();
		const catSummaryText = (catSummaryNode.length > 0) ? catSummaryNode.html() : '';
		const catSummaryParsed = catSummaryText.match(/The following (\d+) pages are in this category, out of ([\d,\.]+) total/);
		if (catSummaryParsed !== null) {
			const thousandSeparator = (1234).toLocaleString(config.wgContentLanguage).substring(1, 2);
			const rxRemoveSeparator = new RegExp(thousandSeparator.replace(/\./, "\\."), "g");
			curPagesInCategory = parseInt(catSummaryParsed[1].replaceAll(rxRemoveSeparator, ''));
			totalPagesInCategory = parseInt(catSummaryParsed[2].replaceAll(rxRemoveSeparator, ''));
		}
		
		this.categorySettings = {
			categoryId: config.wgArticleId,
			contentLanguage: config.wgContentLanguage,
			from: (from || '') === '' ? undefined : from,
			to: (to || '') === '' ? undefined : to,
			curPagesInCategory: curPagesInCategory,
			totalPagesInCategory: totalPagesInCategory
		};
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
		if (this.categorySettings.curPagesInCategory === 0) {
			return [promises, batchCategories];
		}
		const ctPerQuery = Math.floor(this.apiSettings.apiMaxLimit / this.categorySettings.curPagesInCategory);
		const numQueries = Math.ceil(categories.length / ctPerQuery);
		for (let i = 0; i < numQueries; i++) {
			const fetchCats = categories
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
				gcmstartsortkeyprefix: this.categorySettings.from ?? undefined,
				gcmendsortkeyprefix: this.categorySettings.to ?? undefined,
				cllimit: this.apiSettings.apiMaxLimit,
				clcategories: fetchCats,
				maxage: this.apiSettings.serverCacheMaxAge || 0,
				smaxage: this.apiSettings.serverCacheMaxAge || 0
			} as ApiQueryCategoryMembersParams));
			batchCategories.push(fetchCats);
		}
		return [promises, batchCategories];
	}

	processSettledPromise(results: PromiseSettledResult<IExpectedApiQueryCategory>, categories: string[]): void {
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
		
		for (const o of Object.values(data.query.pages || {})) {
			const pageTitle = o.title;
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
			.filter(([_, isFetched]) => !isFetched)
			.map(([title, _]) => title);
		const [promises, catsInBatches] = this.createQueryPromises(categories);
		const onSettledPromises = (arrResults: PromiseSettledResult<IExpectedApiQueryCategory>[]) => {
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

(mw.libs as any).CategoryFetchUtils = CategoryFetchUtils;