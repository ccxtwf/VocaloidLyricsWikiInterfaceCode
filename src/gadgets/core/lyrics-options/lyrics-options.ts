( function ( $, mw ) {
	'use strict';

	const messages = {
		'vlw-lyrics-options--show-hide-prompt': 'Show/hide columns',
		'vlw-lyrics-options--fieldset-legend': 'Lyrics display options',
		'vlw-lyrics-options--visible-columns-legend': 'Visible columns',
	};
	mw.messages.set(messages);
	
	function langSelect ( id: string, buttons: (OO.ui.ButtonOptionWidget | OO.ui.CheckboxMultioptionWidget)[] ) { 
		return function ( item: OO.ui.ButtonSelectWidget | OO.ui.CheckboxMultiselectWidget, selected: boolean ) {
			const cssSelector = `#lyrics-${id} .lyrics-table-header, #lyrics-${id} .lyrics-row`;
			
			const changedLanguage = item.getData();
			const languageSelector = `.lyrics-${changedLanguage}`;
			
			// Show/hide columns
			$( cssSelector ).each( function () {
				const $lyricsElement = $( this ).find( languageSelector );
				
				if ( selected ) {
					$lyricsElement.show();
				} else {
					$lyricsElement.hide();
				}
			} );
			
			// Show/hide elements that have been anchored to lyrics columns
			$( `.lyrics-table-${id}.lyrics-anchor-${changedLanguage}` ).each(function () {
				if ( selected ) {
					$( this ).show();
				} else {
					$( this ).hide();
				}
			});
			
			// Disallows user from deselecting the last visible column
			// Also set lyrics-comb accordingly
			let lyricsOptions = $( `.lyrics-options[data-id="${id}"]` ).first();
			let visibleColumns = +(lyricsOptions?.attr( 'data-visible-columns' ) || 0);
			visibleColumns = visibleColumns + ( selected ? 1 : -1 );
			lyricsOptions.attr( 'data-visible-columns', visibleColumns );
			const combinedLyricsCells = $( `#lyrics-${id} .lyrics-row .lyrics-comb`);
			if ( visibleColumns === 1 ) {
				// Disable selected buttons
				for (const button of buttons) {
					if (button.isSelected()) {
						button.setDisabled(true);
					}
				}
				combinedLyricsCells.each( function() { 
					$( this ).addClass( "only-selected" ); 
				} );
			} else {
				// Re-enable all buttons
				for (const button of buttons) {
					button.setDisabled(false);
				}
				combinedLyricsCells.each( function() { 
					$( this ).removeClass( "only-selected" ); 
				} );
			}
		}
	}
	function makeLanguageSelectorButton ( id: string, languages: string[], labels: { [lang: string]: string }, maxNumCols?: number ): OO.ui.ButtonSelectWidget {
		const buttons = languages.map( function ( language, index ) {
			return new OO.ui.ButtonOptionWidget( {
				data: language,
				label: labels[language],
				//@ts-ignore
				selected: index < (maxNumCols || 3), //Default: Show max. 3 columns
			} );
		} );
		const selector = new OO.ui.ButtonSelectWidget( {
			items: buttons,
			multiselect: true
		} );
		//@ts-ignore
		selector.on( 'choose', langSelect(id, buttons) );
  
		return selector;
	}
	function makeLanguageSelectorDropdown ( id: string, languages: string[], labels: { [lang: string ]: string }, maxNumCols?: number ): OO.ui.PopupButtonWidget {
		const options = languages.map( function ( language, index ) {
			return new OO.ui.CheckboxMultioptionWidget( {
				data: language,
				label: labels[language],
				selected: index < (maxNumCols || 3), // Only show n number of columns (default 3)
			} );
		} );
		const multiselect = new OO.ui.CheckboxMultiselectWidget( { items: options, } );
		const langSelector = new OO.ui.PopupButtonWidget( {
			icon: 'menu',
			label: mw.msg('vlw-lyrics-options--show-hide-prompt'),
			popup: {
				$content: multiselect.$element,
				padded: true,
				anchor: false,
				align: 'backwards',
				autoFlip: false
			}
		} );
		//@ts-ignore
		multiselect.on( 'select', langSelect(id, options) );
		
		return langSelector;
	}
	function createColumnToggle(): void {
		$( '.lyrics-options' ).each( function () {
			const id = $( this ).data( 'id' ).replace(/</g, '&lt;');
			const languages = $( this ).data( 'languages' );
			const labels = $( this ).data( 'labels' );
			const maxNumCols = $( this ).data( 'max-col-shown' );
			
			if (
				typeof languages !== 'string' ||
				languages.length === 0
			) {
				console.error(
					`Lyrics options #${id}: Unable to get columns.`
				);
				return;
			}
			
			const languagesList = languages.split( ',' )
				.filter(language => language.length > 0);
			
			for ( const language of languagesList ) {
				if (!(language in labels)) {
					console.error(
						`Lyrics options #${id}: No label found for column "${language}".` 
					);
					return;
				}
			}
			
			if (languagesList.length <= 1) {
				// Do not add options for tables with one column or less
				return;
			}
			
			const preferences = mediaWiki.user.options.get('userjs-lyrics-option-type') || 'buttons';
			
			const fieldset = new OO.ui.FieldsetLayout( {
				label: mw.msg('vlw-lyrics-options--fieldset-legend')
			} );
			
			let langSelector;
			switch (preferences) {
				case "dropdown":
					langSelector = makeLanguageSelectorDropdown( id, languagesList, labels, maxNumCols );
					fieldset.addItems( [
						new OO.ui.FieldLayout( 
							langSelector
						)
					] );
					break;
				case "buttons":
				default:
					langSelector = makeLanguageSelectorButton( id, languagesList, labels, maxNumCols );
					fieldset.addItems( [
				    	new OO.ui.FieldLayout( 
				        	langSelector,
				        	{ 
										label: mw.msg('vlw-lyrics-options--visible-columns-legend'), 
										align: 'inline' 
									} 
				    	)
				    ] );
			}
			
			$( this ).append( fieldset.$element );
		} );
	}
	
	function prepareCssClassesOfLyricsColumns(): void {
		// This function set ups the CSS classes which facilitates the automatic toggling of columns through jQuery 
		$(".lyrics-options").each(function() {
			const id: string = $( this ).data( 'id' ).replace(/</g, '&lt;');
			const languages = $( this ).data( 'languages' ).split( ',' );
			const isoLangCode = $( this ).data( 'iso-lang' );
			const n_languages = languages.length;
			const lyricsTableRows = $( `#lyrics-${id}.lyrics-table > tbody > tr` ).not( ".lyrics-table-header" );
			const isOneColumnOnly = $( `#lyrics-${id}` ).hasClass( 'one-column' );
			lyricsTableRows.each(function() {
				$( this ).addClass( "lyrics-row" );
				const cells = $( this ).find( "td" );
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
    	$( `#lyrics-${id} .lyrics-comb` ).attr("colspan", n_languages);
			
			// Hide cells on columns greater than set on the toggle menu (default 3)
			const maxNumCols = $( this ).data( 'max-col-shown' );
			let cells = $( `#lyrics-${id}.lyrics-table th, #lyrics-${id}.lyrics-table td` );
			for (let i = 1; i <= (maxNumCols || 3); i++) {
				cells = cells.not( ":nth-of-type(" + i + ")" );
			}
			cells.each(function() { $( this ).css("display", "none"); });
			
			// Hide elements that are anchored to lyrics columns
			for (let i = (maxNumCols || 3); i < languages.length; i++) {
				$( `.lyrics-table-${id}.lyrics-anchor-${languages[i]}` ).each(function () {
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