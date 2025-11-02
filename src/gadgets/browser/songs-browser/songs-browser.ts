import { ISongBrowserDropdownOption, IAlbumFetchUtils, ICategoryFetchUtils } from "./types.js";

(function (mw, $) {
	'use strict';

	const DEBUGGING_ID = 'songs-browser';
	
	// =================
	//   Config
	// =================
	const messages = {
		'songs-browser--dropdown-text': "Mark certain song pages",
		'songs-browser--has-eng-tl-menu-label': 'Songs with English translation',
		'songs-browser--has-eng-tl-tooltip': 'This page has an available English translation',
		'songs-browser--has-eng-tl-chip-text': 'ENG',
		'songs-browser--needs-eng-tl-menu-label': 'Songs in need of English translation',
		'songs-browser--needs-eng-tl-tooltip': 'This page needs an English translation',
		'songs-browser--needs-eng-tl-chip-text': 'NEEDS TL',
		'songs-browser--genai-menu-label': 'Songs using Generative AI',
		'songs-browser--verified-genai-tooltip': 'This page has been confirmed to use generative AI by official sources',
		'songs-browser--verified-genai-chip-text': 'GenAI',
		'songs-browser--suspected-genai-tooltip': 'This page is suspected to use generative AI',
		'songs-browser--suspected-genai-chip-text': 'Suspected GenAI',
		'songs-browser--consolidation-wip-menu-label': 'Pages with ConsolidationWIP',
		'songs-browser--consolidation-wip-tooltip': 'This is a WIP page using a legacy format that may need to be updated',
		'songs-browser--consolidation-wip-chip-text': 'WIP',
	}
	mw.messages.set(messages);

	const dropdownToggleText = mw.message('songs-browser--dropdown-text').text();

	const DROPDOWN_OPTIONS: ISongBrowserDropdownOption[] = [
		createSongBrowserDropdownOption({
			menuLabelId: 'has-eng-tl', 
			ids: ['has-eng-tl'], 
			categoryTitles: ['Pages with English translation']
		}),
		createSongBrowserDropdownOption({
			menuLabelId: 'needs-eng-tl',
			ids: ['needs-eng-tl'], 
			categoryTitles: ['Pages in need of English translation']
		}),
		createSongBrowserDropdownOption({
			menuLabelId: 'genai',
			ids: ['verified-genai', 'suspected-genai'], 
			categoryTitles: [
				'Songs with verified AI-generated material',
				'Songs with suspected AI-generated material'
			]
		}),
		createSongBrowserDropdownOption({
			menuLabelId: 'consolidation-wip', 
			ids: ['consolidation-wip'], 
			categoryTitles: ['Consolidation WIP']
		})
	];
	const LOCALSTORAGE_KEY = 'songs_browser_highlight_categories';
	const SERVER_CACHE_MAXAGE = 5 * 60;										// 5 minutes
	const LOCALSTORAGE_CACHE_EXPIRATION = 6 * 60 * 60;		// 6 hours
	
	// =================
	//   Definitions
	// =================	
	const config = mw.config.get([
		'wgNamespaceNumber',
		'wgCategories'
	]); 
	let selectedOptions: number[] = [];
	let $container: JQuery<HTMLElement>, $dropdown: JQuery<HTMLElement>;
	let albumFetchUtils: IAlbumFetchUtils;
	let categoryFetchUtils: ICategoryFetchUtils;
	
	// =================
	//   Installation & Initialization
	// =================
	function getSelectedOptionsFromSession(): number[] {
		let res: number[] = mw.storage.getObject(LOCALSTORAGE_KEY) || [];
		res = res.filter(el => !isNaN(el)).map(el => +el);
		return res;
	}
	function saveSelectedOptionsToSession(selectedItems: number[]): void {
		mw.storage.setObject(LOCALSTORAGE_KEY, selectedItems, LOCALSTORAGE_CACHE_EXPIRATION);
	}
	
	function setupHooks(): void {
		for (const option of DROPDOWN_OPTIONS) {
			option.setupHooksOnCategoryFetch();
		}
	}
	
	function initToggle(
		cbOnFirstLoad: (selectedOptionsOnStorage: number[]) => void, 
		cbOnOptionChange: (id: number, isSelected: boolean) => void
	): void {
		const selectedOptionsOnStorage = getSelectedOptionsFromSession();
		$('#songs-browser-container').html(
			$('<div>', { id: 'songs-browser' })
				.append($('<div>', { 'class': 'dropdown-toggle' }).text(dropdownToggleText))
				.append($('<div>', { 'class': 'dropdown-menu' }).append($('<ul>')))
				.html()
		);
		$container = $('#songs-browser-container');
		$dropdown = $('#songs-browser .dropdown-menu ul');
		
		for (let i = 0; i < DROPDOWN_OPTIONS.length; i++) {
			const isChecked = selectedOptionsOnStorage.indexOf(i) > -1;
			$dropdown.append(
				$('<li>')
					.append(
						$('<span>', { 
							'class': `faux-checkbox${isChecked ? ' checked': ''}`,
							'data-id': i, 
						})
					)
					.append(
						$('<div>', { 'class': 'item' }).text(DROPDOWN_OPTIONS[i].name)
					)
			);
		}
		$dropdown.find('> li').on('click', function () {
			const cb = $( this ).find('.faux-checkbox');
			const id = +cb.data( 'id' );
			const isSelected = !cb.hasClass('checked');
			cbOnOptionChange(id, isSelected);
			cb.toggleClass('checked');
		});
		cbOnFirstLoad(selectedOptionsOnStorage);
		selectedOptions = selectedOptionsOnStorage;
		saveSelectedOptionsToSession(selectedOptionsOnStorage);
	}
	
	function onOptionChangeOnCategoryPage(id: number, isSelected: boolean): void {
		if (categoryFetchUtils === undefined) {
			console.error("CategoryFetchUtils is not yet defined", DEBUGGING_ID);
			return;
		}
		const selectedOption = DROPDOWN_OPTIONS[id];
		if (isSelected) {
			for (const { title, event } of selectedOption.cats) {
				categoryFetchUtils.registerCategory(title, event);
			}
			categoryFetchUtils.queryPagesBelongingToUnfetchedCategories();
			selectedOption.toggleElementsOnMainArticle(true);
			selectedOptions.push(id);
			saveSelectedOptionsToSession(selectedOptions);
		} else {
			selectedOption.toggleElementsOnMainArticle(false);
			selectedOptions = selectedOptions.filter((el) => (el !== id));
			saveSelectedOptionsToSession(selectedOptions);
		}
	}
	
	function onOptionChangeOnAlbumPage(id: number, isSelected: boolean): void {
		if (albumFetchUtils === undefined) {
			console.error("AlbumFetchUtils is not yet defined", DEBUGGING_ID);
			return;
		}
		const selectedOption = DROPDOWN_OPTIONS[id];
		if (isSelected) {
			for (const { title, event } of selectedOption.cats) {
				albumFetchUtils.registerCategory(title, event);
			}
			albumFetchUtils.queryPagesBelongingToUnfetchedCategories();
			selectedOption.toggleElementsOnMainArticle(true);
			selectedOptions.push(id);
			saveSelectedOptionsToSession(selectedOptions);
		} else {
			selectedOption.toggleElementsOnMainArticle(false);
			selectedOptions = selectedOptions.filter(el => (el !== id));
			saveSelectedOptionsToSession(selectedOptions);
		}
	}
	
	function onOptionChangeOnProducerPage(id: number, isSelected: boolean): void {
		const selectedOption = DROPDOWN_OPTIONS[id];
		selectedOption.toggleElementsOnMainArticle(isSelected);
		if (isSelected) {
			selectedOptions.push(id);
			saveSelectedOptionsToSession(selectedOptions);
		} else {
			selectedOptions = selectedOptions.filter(el => (el !== id));
			saveSelectedOptionsToSession(selectedOptions);
		}
	}
	
	function onLoadedCategoryPage(selectedOptions: number[]): void {
		if (categoryFetchUtils === undefined) {
			console.error("CategoryFetchUtils is not yet defined", DEBUGGING_ID);
			return;
		}
		for (const i of selectedOptions) {
			const selectedOption = DROPDOWN_OPTIONS[i];
			for (const { title, event } of selectedOption.cats) {
				categoryFetchUtils.registerCategory(title, event);
			}
		}
		categoryFetchUtils.queryPagesBelongingToUnfetchedCategories();
	}
	
	function onLoadedAlbumPage(selectedOptions: number[]): void {
		if (albumFetchUtils === undefined) {
			console.error("AlbumFetchUtils is not yet defined", DEBUGGING_ID);
			return;
		}
		for (const i of selectedOptions) {
			const selectedOption = DROPDOWN_OPTIONS[i];
			for (const { title, event } of selectedOption.cats) {
				albumFetchUtils.registerCategory(title, event);
			}
		}
		albumFetchUtils.queryPagesBelongingToUnfetchedCategories();
	}
	
	function onLoadedProducerPage(selectedOptions: number[]): void {
		for (const i of selectedOptions) {
			const selectedOption = DROPDOWN_OPTIONS[i];
			selectedOption.toggleElementsOnMainArticle(true);
		}
	}

	// =================
	//   Utilities
	// =================
	function createSongBrowserDropdownOption(
		{ menuLabelId, ids, categoryTitles }: { menuLabelId: string, ids: string[], categoryTitles: string[] }
	): ISongBrowserDropdownOption {
		const menuLabel = mw.message(`songs-browser--${menuLabelId}-menu-label`).text();

		const cats: { title: string, event: string }[] = [];
		const hooks: { event: string, hook: (pages: JQuery<HTMLElement>) => void }[] = [];
		const showAllAction: (() => void)[] = [];
		const hideAllAction: (() => void)[] = [];

		for (let i = 0; i < ids.length; i++) {
			const id = ids[i];
			const event = `userjs.songs-browser-${id}.init`; 
			const chipCssClass = `chip ${id}`;
			const chipSelector = '.'+chipCssClass.replace(/ /g, '.');
			
			const tooltip = mw.message(`songs-browser--${id}-tooltip`).text();
			const chipText = mw.message(`songs-browser--${id}-chip-tooltip`).text();

			cats.push({ title: categoryTitles[i], event });
			hooks.push({
				event,
				hook: (pages: JQuery<HTMLElement>) => {
					pages.after(
						$('<span>', {
							'class': chipCssClass,
							title: tooltip
						}).text(chipText)
					);
				}
			});
			showAllAction.push(() => {
				$(chipSelector).attr('title', tooltip).text(chipText).show();
			});
			hideAllAction.push(() => {
				$(chipSelector).hide();
			})
		}
		

		return {
			name: menuLabel,
			cats,
			setupHooksOnCategoryFetch: () => {
				hooks.forEach(({ event, hook }) => {
					mw.hook(event).add(hook);
				});
			},
			toggleElementsOnMainArticle: (show: boolean) => {
				if (show) {
					showAllAction.forEach((fn) => fn());
				} else {
					hideAllAction.forEach((fn) => fn());
				}
			}
		}

	}
	
	// =================
	//   Run
	// =================
	if (config.wgNamespaceNumber === 0) {
		if (config.wgCategories.indexOf('Producers') > -1) {
			$('.mw-parser-output > h2:first-of-type').after(
				$('<div>', { id: "songs-browser-container" })
			);
			initToggle(onLoadedProducerPage, onOptionChangeOnProducerPage);
		} else if (config.wgCategories.indexOf('Albums') > -1) {
			setupHooks();
			mw.loader.using( 'ext.gadget.songs-browser-utils-album', function () {
				albumFetchUtils = new (mw.libs as any).AlbumFetchUtils(SERVER_CACHE_MAXAGE);
				$('.album-infobox-parent-container').before(
					$('<div>')
						.append($('<div>', { id: 'songs-browser-container' }))
						.append($('<div>').css('clear', 'both'))
				);
				initToggle(onLoadedAlbumPage, onOptionChangeOnAlbumPage);
			} );
		}
	} else if (config.wgNamespaceNumber === 14) {
		setupHooks();
		mw.loader.using( 'ext.gadget.songs-browser-utils-category', function () {
			categoryFetchUtils = new (mw.libs as any).CategoryFetchUtils(SERVER_CACHE_MAXAGE);
			$('#mw-pages > h2:first-of-type').after(
				$('<div>', { id: "songs-browser-container" })
			);
			initToggle(onLoadedCategoryPage, onOptionChangeOnCategoryPage);
		} );
	}
	
}(mediaWiki, jQuery));