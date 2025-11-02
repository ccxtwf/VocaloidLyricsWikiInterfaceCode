( function ( $, mw ) {
	'use strict';
	
	const DELTA = 7.5 * 24 * 60 * 60 * 1000;	// 7 full days + 12 hour buffer

	const messages = {
		'vlw-guideline-notification--header': "VLW Guideline Notice",
		'vlw-guideline-notification--message': "All translations posted within 7 days of a song\'s publication date must go through the checking process in Help talk:Translation Checking. The only exceptions are official translations by known reliable translators, made available prior to any other submissions for checking."
	};
	mw.messages.set(messages);

	const config = mw.config.get([
		'wgCategories'
	]);

	function isSongPageWithinThreshold() {
		const dateEl = $('.vlw-infobox-song td.date');
		if (dateEl.length === 0) { return false; }
		const dateStr = dateEl[0].innerHTML.replaceAll('&nbsp;', ' ');
		const m = dateStr.match(/([Jj]an(?:uary|)|[Ff]eb(?:ruary|)|[Mm]ar(?:ch|)|[Aa]pr(?:il|)|[Mm]ay|[Jj]un(?:e|)|[Jj]ul(?:y|)|[Aa]ug(?:ust|)|[Ss]ep(?:tember|)|[Oo]ct(?:ober|)|[Nn]ov(?:ember|)|[Dd]ec(?:ember|))\s+(\d{1,2}),?\s+(\d{4})/);
		if (m === null) { return false; }
		const dateNum = Date.parse(m[3]+'-'+convertMonthStrToInt(m[1])+'-'+m[2].padStart(2, '0'));
		const threshold = Date.now() - DELTA;
		return (dateNum > threshold);
	}

	function convertMonthStrToInt(text: string) {
		switch (true) {
			case text.match(/^[Jj]an(?:uary|)$/) !== null:
				return '01';
			case text.match(/^[Ff]eb(?:ruary|)$/) !== null:
				return '02';
			case text.match(/^[Mm]ar(?:ch|)$/) !== null:
				return '03';
			case text.match(/^[Aa]pr(?:il|)$/) !== null:
				return '04';
			case text.match(/^[Mm]ay$/) !== null:
				return '05';
			case text.match(/^[Jj]un(?:e|)$/) !== null:
				return '06';
			case text.match(/^[Jj]ul(?:y|)$/) !== null:
				return '07';
			case text.match(/^[Aa]ug(?:ust|)$/) !== null:
				return '08';
			case text.match(/^[Ss]ep(?:tember|)$/) !== null:
				return '09';
			case text.match(/^[Oo]ct(?:ober|)$/) !== null:
				return '10';
			case text.match(/^[Nn]ov(?:ember|)$/) !== null:
				return '11';
			case text.match(/^[Dd]ec(?:ember|)$/) !== null:
				return '12';
			default:
				return null;
		}
	}

	function showNotice() {
		if (
			config.wgCategories.indexOf('Pages in need of English translation') < 0 || 
			config.wgCategories.indexOf('Japanese songs') < 0
		) {
			return;
		}
		if (isSongPageWithinThreshold()) {
			mw.notify( mw.msg('vlw-guideline-notification--header') , { autoHide: false, type: 'warn', title: mw.msg('vlw-guideline-notification--message') } );
		}
	}
	showNotice();

} )( jQuery, mediaWiki );