(function (mw, $) {
	'use strict';
	
	// =================
	//   Config
	// =================
	var dropdownToggleText = "Mark certain song pages";
	var options = [
		{ 
			name: 'Songs with English translation',  
			cats: [{title:'Pages with English translation', event: 'userjs.songs-browser-has-eng-tl.init'}],
			setupHooksOnCategoryFetch: function () {
				mw.hook('userjs.songs-browser-has-eng-tl.init').add(function(pages) {
					pages.after( $('<span class="chip has-eng-tl" title="This page has an available English translation">ENG</span>') );
				});
			},
			toggleElementsOnMainArticle: function (show) {
				if (show) {
					$('.chip.has-eng-tl')
						.attr('title', 'This page has an available English translation')
						.text('ENG')
						.show();
				} else {
					$('.chip.has-eng-tl').hide();
				}
			}
		},
		{ 
			name: 'Songs in need of English translation',  
			cats: [{title:'Pages in need of English translation', event: 'userjs.songs-browser-needs-eng-tl.init'}],
			setupHooksOnCategoryFetch: function () {
				mw.hook('userjs.songs-browser-needs-eng-tl.init').add(function(pages) {
					pages.after( $('<span class="chip needs-eng-tl" title="This page needs an English translation">NEEDS TL</span>') );
				});
			},
			toggleElementsOnMainArticle: function (show) {
				if (show) {
					$('.chip.needs-eng-tl')
						.attr('title', 'This page needs an English translation')
						.text('NEEDS TL')
						.show();
				} else {
					$('.chip.needs-eng-tl').hide();
				}
			}
		},
		{ 
			name: 'Songs using Generative AI',  
			cats: [
				{title:'Songs with verified AI-generated material', event: 'userjs.songs-browser-genai-verified.init'},
				{title:'Songs with suspected AI-generated material', event: 'userjs.songs-browser-genai-suspected.init'}
			],
			setupHooksOnCategoryFetch: function () {
				mw.hook('userjs.songs-browser-genai-verified.init').add(function(pages) {
					pages.after( $('<span class="chip ai-usage" title="This page has been confirmed to use generative AI by official sources">GenAI</span>') );
				});
				mw.hook('userjs.songs-browser-genai-suspected.init').add(function(pages) {
					pages.after( $('<span class="chip ai-usage-suspected" title="This page is suspected to use generative AI">Suspected GenAI</span>') );
				});
			},
			toggleElementsOnMainArticle: function (show) {
				if (show) {
					$('.chip.ai-usage')
						.attr('title', 'This page has been confirmed to use generative AI by official sources')
						.text('GenAI')
						.show();
					$('.chip.ai-usage-suspected')
						.attr('title', 'This page is suspected to use generative AI')
						.text('Suspected GenAI')
						.show();
				} else {
					$('.chip.ai-usage').hide();
					$('.chip.ai-usage-suspected').hide();
				}
			}
		},
		{ 
			name: 'Pages with ConsolidationWIP',  
			cats: [{title:'Consolidation WIP', event: 'userjs.songs-browser-consolidation-wip.init'}],
			setupHooksOnCategoryFetch: function () {
				mw.hook('userjs.songs-browser-consolidation-wip.init').add(function(pages) {
					pages.after( $('<span class="chip consolidation-wip" title="This is a WIP page using a legacy format that may need to be updated">WIP</span>') );
				});
			},
			toggleElementsOnMainArticle: function (show) {
				if (show) {
					$('.chip.consolidation-wip')
						.attr('title', 'This is a WIP page using a legacy format that may need to be updated')
						.text('WIP')
						.show();
				} else {
					$('.chip.consolidation-wip').hide();
				}
			}
		}
	];
	var lcKey = 'songs_browser_highlight_categories';
	var lcKeyExp = 'songs_browser_highlight_categories_expiration';
	var serverCacheAge = 5 * 60;							// 5 minutes
	var lcSaveSettingsForDuration = 6 * 60 * 60 * 1000;		// 6 hours
	
	// =================
	//   Definitions
	// =================	
	var config = mw.config.get([
		'wgNamespaceNumber',
		'wgCategories'
	]); 
	var selectedOptions = [];
	var $container, $dropdown, $actionButton;
	var albumFetchUtils;
	var categoryFetchUtils;
	
	// =================
	//   Installation & Initialization
	// =================
	function refreshStorageOnFirstLoad() {
		var cacheExpiredTime = localStorage.getItem(lcKeyExp);
		if (cacheExpiredTime === null || isNaN(+cacheExpiredTime) || Date.now() > +cacheExpiredTime) {
			localStorage.removeItem(lcKey);
			localStorage.removeItem(lcKeyExp);
		}
	}
	function getSelectedOptionsFromSession() {
		var res = [];
		var c = localStorage.getItem(lcKey);
		if (!!c) {
			res = (c || '').split(',')
				.filter(function (el) { return !isNaN(el); })
				.map(function (el) { return +el; });
		}
		localStorage.setItem(lcKeyExp, new Date(Date.now() + lcSaveSettingsForDuration).getTime());
		return res;
	}
	function saveSelectedOptionsToSession(selectedItems) {
		localStorage.setItem(lcKey, selectedItems);
		localStorage.setItem(lcKeyExp, new Date(Date.now() + lcSaveSettingsForDuration).getTime());
	}
	
	function setupHooks() {
		for (var i = 0; i < options.length; i++) {
			options[i].setupHooksOnCategoryFetch();
		}
	}
	
	function initToggle(cbOnFirstLoad, cbOnOptionChange) {
		var selectedOptionsOnStorage = getSelectedOptionsFromSession();
		$('#songs-browser-container').html(
			'<div id="songs-browser">' +
				'<div class="dropdown">' + 
					'<div class="dropdown-toggle">' + dropdownToggleText + '</div>' + 
					'<div class="dropdown-menu">' + 
						'<ul></ul>' + 
					'</div>' + 
				'</div>' +
			'</div>'
		);
		
		$container = $('#songs-browser-container');
		$dropdown = $('#songs-browser .dropdown-menu ul');
		
		for (var i = 0; i < options.length; i++) {
			var isChecked = selectedOptionsOnStorage.indexOf(i) > -1;
			$dropdown.append(
				$('<li>' + 
					'<span class="faux-checkbox' + (isChecked ? ' checked' : '') + '" data-id="' + i + '"></span>' +
					'<div class="item">' + options[i].name + '</div>' + 
				'</li>')
			);
		}
		$dropdown.find('> li').on('click', function () {
			var cb = $( this ).find('.faux-checkbox');
			var id = +cb.data( 'id' );
			var isSelected = !cb.hasClass('checked');
			cbOnOptionChange(id, isSelected);
			cb.toggleClass('checked');
		});
		cbOnFirstLoad(selectedOptionsOnStorage);
		selectedOptions = selectedOptionsOnStorage;
		saveSelectedOptionsToSession(selectedOptionsOnStorage);
	}
	
	function onOptionChangeOnCategoryPage(id, isSelected) {
		if (categoryFetchUtils === undefined) {
			mw.errorLogger.logError("CategoryFetchUtils is not yet defined", "songs-browser");
		  return;
		}
		var selectedOption = options[id];
		if (isSelected) {
			for (var i = 0; i < selectedOption.cats.length; i++) {
				categoryFetchUtils.registerCategory(
					selectedOption.cats[i].title, 
					selectedOption.cats[i].event
				);
			}
			categoryFetchUtils.queryPagesBelongingToUnfetchedCategories();
			selectedOption.toggleElementsOnMainArticle(true);
			selectedOptions.push(id);
			saveSelectedOptionsToSession(selectedOptions);
		} else {
			selectedOption.toggleElementsOnMainArticle(false);
			selectedOptions = selectedOptions.filter(function(el) { return (el !== id); });
			saveSelectedOptionsToSession(selectedOptions);
		}
	}
	
	function onOptionChangeOnAlbumPage(id, isSelected) {
		if (albumFetchUtils === undefined) {
			mw.errorLogger.logError("AlbumFetchUtils is not yet defined", "songs-browser");
		  return;
		}
		var selectedOption = options[id];
		if (isSelected) {
			for (var i = 0; i < selectedOption.cats.length; i++) {
				albumFetchUtils.registerCategory(
					selectedOption.cats[i].title, 
					selectedOption.cats[i].event
				);
			}
			albumFetchUtils.queryPagesBelongingToUnfetchedCategories();
			selectedOption.toggleElementsOnMainArticle(true);
			selectedOptions.push(id);
			saveSelectedOptionsToSession(selectedOptions);
		} else {
			selectedOption.toggleElementsOnMainArticle(false);
			selectedOptions = selectedOptions.filter(function(el) { return (el !== id); });
			saveSelectedOptionsToSession(selectedOptions);
		}
	}
	
	function onOptionChangeOnProducerPage(id, isSelected) {
		var selectedOption = options[id];
		selectedOption.toggleElementsOnMainArticle(isSelected);
		if (isSelected) {
			selectedOptions.push(id);
			saveSelectedOptionsToSession(selectedOptions);
		} else {
			selectedOptions = selectedOptions.filter(function(el) { return (el !== id); });
			saveSelectedOptionsToSession(selectedOptions);
		}
	}
	
	function onLoadedCategoryPage(selectedOptions) {
		if (categoryFetchUtils === undefined) {
			mw.errorLogger.logError("CategoryFetchUtils is not yet defined", "songs-browser");
		  return;
		}
		var i, j;
		for (i = 0; i < selectedOptions.length; i++) {
			var selectedOption = options[selectedOptions[i]];
			for (j = 0; j < selectedOption.cats.length; j++) {
				categoryFetchUtils.registerCategory(
					selectedOption.cats[j].title, 
					selectedOption.cats[j].event
				);
			}
		}
		categoryFetchUtils.queryPagesBelongingToUnfetchedCategories();
	}
	
	function onLoadedAlbumPage(selectedOptions) {
		if (albumFetchUtils === undefined) {
			mw.errorLogger.logError("AlbumFetchUtils is not yet defined", "songs-browser");
		  return;
		}
		var i, j;
		for (i = 0; i < selectedOptions.length; i++) {
			var selectedOption = options[selectedOptions[i]];
			for (j = 0; j < selectedOption.cats.length; j++) {
				albumFetchUtils.registerCategory(
					selectedOption.cats[j].title, 
					selectedOption.cats[j].event
				);
			}
		}
		albumFetchUtils.queryPagesBelongingToUnfetchedCategories();
	}
	
	function onLoadedProducerPage(selectedOptions) {
		var i, j;
		for (i = 0; i < selectedOptions.length; i++) {
			var selectedOption = options[selectedOptions[i]];
			selectedOption.toggleElementsOnMainArticle(true);
		}
	}
	
	// =================
	//   Run
	// =================
	refreshStorageOnFirstLoad();
	if (config.wgNamespaceNumber === 0) {
		if (config.wgCategories.indexOf('Producers') > -1) {
			$('.mw-parser-output > h2:first-of-type').after($('<div id="songs-browser-container">'));
			initToggle(onLoadedProducerPage, onOptionChangeOnProducerPage);
		} else if (config.wgCategories.indexOf('Albums') > -1) {
			setupHooks();
			mw.loader.using( 'ext.gadget.songs-browser-utils-album', function () {
		    	albumFetchUtils = new window.AlbumFetchUtils(serverCacheAge);
		    	$('.album-infobox-parent-container').before(
					$('<div><div id="songs-browser-container"></div><div style="clear: both;"></div></div>'
				));
				initToggle(onLoadedAlbumPage, onOptionChangeOnAlbumPage);
		    } );
		}
		return;
	} else if (config.wgNamespaceNumber === 14) {
		setupHooks();
	    mw.loader.using( 'ext.gadget.songs-browser-utils-category', function () {
	    	categoryFetchUtils = new window.CategoryFetchUtils(serverCacheAge);
	    	$('#mw-pages > h2:first-of-type').after($('<div id="songs-browser-container">'));
			initToggle(onLoadedCategoryPage, onOptionChangeOnCategoryPage);
	    } );
	} else {
		return;
	}
	
}(mediaWiki, jQuery));