/* [[Category:Scripts]] */
( function ( $, mw ) {
	'use strict';
	
	function langSelect ( id, buttons ) { 
		return function ( item, selected ) {
			var cssSelector = '#lyrics-' + id + ' .lyrics-table-header, #lyrics-' + id + ' .lyrics-row';
			
			var changedLanguage = item.getData();
			var languageSelector = '.lyrics-' + changedLanguage;
			
			// Show/hide columns
			$( cssSelector ).each( function () {
				var $lyricsElement = $( this ).find( languageSelector );
				
				if ( selected ) {
					$lyricsElement.show();
				} else {
					$lyricsElement.hide();
				}
			} );
			
			// Show/hide elements that have been anchored to lyrics columns
			$( '.lyrics-table-' + id + '.lyrics-anchor-' + changedLanguage ).each(function () {
				if ( selected ) {
					$( this ).show();
				} else {
					$( this ).hide();
				}
			});
			
			// Disallows user from deselecting the last visible column
			// Also set lyrics-comb accordingly
			var lyricsOptions = $( '.lyrics-options[data-id="' + id + '"]' ).first();
			var visibleColumns = +lyricsOptions.attr( 'data-visible-columns' ) || 0;
			visibleColumns = visibleColumns + ( selected ? 1 : -1 );
			lyricsOptions.attr( 'data-visible-columns', visibleColumns );
			var combinedLyricsCells = $( '#lyrics-' + id + ' .lyrics-row .lyrics-comb');
			if ( visibleColumns === 1 ) {
				// Disable selected buttons
				for (var i = 0; i < buttons.length; i++) {
					if (buttons[i].isSelected()) {
						buttons[i].setDisabled(true);
					}
				}
				combinedLyricsCells.each( function() { 
					$( this ).addClass( "only-selected" ); 
				} );
			} else {
				// Re-enable all buttons
				for (var i = 0; i < buttons.length; i++) {
					buttons[i].setDisabled(false);
				}
				combinedLyricsCells.each( function() { 
					$( this ).removeClass( "only-selected" ); 
				} );
			}
		}
	}
	function makeLanguageSelectorButton ( id, languages, labels, maxNumCols ) {
		var buttons = languages.map( function ( language, index ) {
			return new OO.ui.ButtonOptionWidget( {
    			data: language,
    			label: labels[language],
    			selected: index < (maxNumCols || 3), //Default: Show max. 3 columns
			} );
		} );
		var selector = new OO.ui.ButtonSelectWidget( {
    		items: buttons,
    		align: 'left',
    		multiselect: true
		} );
		selector.on( 'choose', langSelect(id, buttons) );
  
		return selector;
	}
	function makeLanguageSelectorDropdown ( id, languages, labels, maxNumCols ) {
		var options = languages.map( function ( language, index ) {
			return new OO.ui.CheckboxMultioptionWidget( {
				data: language,
				label: labels[language],
				selected: index < (maxNumCols || 3), // Only show n number of columns (default 3)
			} );
		} );
		var multiselect = new OO.ui.CheckboxMultiselectWidget( { items: options, } );
		var langSelector = new OO.ui.PopupButtonWidget( {
			icon: 'menu',
			label: 'Show/hide columns',
			popup: {
				$content: multiselect.$element,
				padded: true,
				anchor: false,
				align: 'backwards',
				autoFlip: false
			}
		} );
		multiselect.on( 'select', langSelect(id, options) );
		
		return langSelector;
	}
	function createColumnToggle() {
		$( '.lyrics-options' ).each( function () {
			var id = $( this ).data( 'id' );
			var languages = $( this ).data( 'languages' );
			var labels = $( this ).data( 'labels' );
			var maxNumCols = $( this ).data( 'max-col-shown' );
			
			if (
				typeof languages !== 'string' ||
				languages.length === 0
			) {
				console.error(
					'Lyrics options ' + 
					'#' + id + ': ' +
					'Unable to get columns.'
				);
				return;
			}
			
			var languagesList = languages.split( ',' )
			.filter( function ( language ) {
				return language.length > 0;
			} );
			
			for ( var i = 0; i < languagesList.length; i++ ) {
				var language = languagesList[i];
				if (!(language in labels)) {
					console.error(
						'Lyrics options ' +
						'#' + id + ': ' +
						'No label found for column "' + language + '".' 
					);
					return;
				}
			}
			
			if (languagesList.length <= 1) {
				// Do not add options for tables with one column or less
				return;
			}
			
			var preferences = mediaWiki.user.options.get('userjs-lyrics-option-type') || 'buttons';
			
			var fieldset = new OO.ui.FieldsetLayout( {
				label: 'Lyrics display options'
			} );
			
			switch (preferences) {
				case "dropdown":
					var langSelector = makeLanguageSelectorDropdown( id, languagesList, labels, maxNumCols );
					fieldset.addItems( [
						new OO.ui.FieldLayout( 
							langSelector
						)
					] );
					break;
				case "buttons":
				default:
					var langSelector = makeLanguageSelectorButton( id, languagesList, labels, maxNumCols );
					fieldset.addItems( [
				    	new OO.ui.FieldLayout( 
				        	langSelector,
				        	{ label: 'Visible columns', align: 'inline' } 
				    	)
				    ] );
			}
			
			$( this ).append( fieldset.$element );
		} );
	}
	
	function prepareCssClassesOfLyricsColumns() {
		// This function set ups the CSS classes which facilitates the automatic toggling of columns through jQuery 
		$(".lyrics-options").each(function() {
			var id = $( this ).data( 'id' );
			var languages = $( this ).data( 'languages' ).split( ',' );
			var isoLangCode = $( this ).data( 'iso-lang' );
			var n_languages = languages.length;
			var lyricsTableRows = $( "#lyrics-" + id + ".lyrics-table > tbody > tr" ).not( ".lyrics-table-header" );
			var isOneColumnOnly = $( "#lyrics-" + id ).hasClass( 'one-column' );
			lyricsTableRows.each(function() {
				$( this ).addClass( "lyrics-row" );
				var cells = $( this ).find( "td" );
				if (!isOneColumnOnly && cells.length === 1) {
					cells.first().addClass("lyrics-comb");
				} else {
					cells.each(function( index ) {
						if (index >= n_languages) return;
						$( this ).addClass( "lyrics-" + languages[index] );
						// Set ISO language code for correct HTML rendering of text
						if (index === 0 && !!isoLangCode && $( this ).attr('lang') === undefined) {
							$( this ).attr('lang', isoLangCode);
						}
					});
				}
			});
			
			// Set colspan
    		$( "#lyrics-" + id +  " .lyrics-comb" ).attr("colspan", n_languages);
			
			// Hide cells on columns greater than set on the toggle menu (default 3)
			var maxNumCols = $( this ).data( 'max-col-shown' );
			var cells = $( "#lyrics-" + id + ".lyrics-table th, #lyrics-" + id + ".lyrics-table td" );
			for (var i = 1; i <= (maxNumCols || 3); i++) {
				cells = cells.not( ":nth-of-type(" + i + ")" );
			}
			cells.each(function() { $( this ).css("display", "none"); });
			
			// Hide elements that are anchored to lyrics columns
			for (var i = (maxNumCols || 3); i < languages.length; i++) {
				$( '.lyrics-table-' + id + '.lyrics-anchor-' + languages[i] ).each(function () {
					$( this ).hide();
				});
			}
		});
	}
	
	$( function () {
		prepareCssClassesOfLyricsColumns();
		createColumnToggle();
	} );
	
} )( jQuery, mediaWiki );