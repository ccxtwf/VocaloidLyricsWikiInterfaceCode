/* 
 * A simple modal-based notification script that triggers when a certain category (hidden or not) is detected.
 * Authored by [[User:CoolMikeHatsune22]]
 */
/* [[Category:Scripts]] */
(function (mw, $) {

	var config = mw.config.get([
		'wgArticleId',
		'wgNamespaceNumber',
		'wgCategories'
	]);
	var lc_key = 'skip_nsfw_notice_article_ids_';
	var user_pref = 'userjs-suppress-nsfw-modal';
	var ptLc = 10000;
	var skipIds = [];
	
	// Skip if namespace is not main or the category is not detected
	if (config.wgNamespaceNumber !== 0 || config.wgCategories.indexOf("Songs with NSFW content") < 0) {
		return;
	}
	
	// Skip if user has given their consent to not show any NSFW modals
	if (localStorage.getItem(user_pref) === 'true' || mw.user.options.get([user_pref])[user_pref] === 'true') {
		return;
	}
	
	// Skip if user has already given consent for a single page
	var idx_lc = Math.ceil(config.wgArticleId / ptLc);
	var lc = localStorage.getItem( lc_key + idx_lc );
	if (!!lc) {
		skipIds = (lc || '').split(',');
	}
	if (skipIds.indexOf(''+config.wgArticleId) > -1) {
		return;
	}
	
	function onClickConfirm() {
		$('#cw-modal').css('display', 'none');
		
		// Save user consent to local storage 
		skipIds.push(config.wgArticleId);
		localStorage.setItem( lc_key + idx_lc, skipIds.join(',') );
		
		// Save option to user preferences
		if ($('#cw-suppress-nsfw-notifs').prop('checked') === true) {
			localStorage.setItem(user_pref, true);
			if (mw.user.getId() != 0) {
				var api = new mw.Api();
				api.saveOption(user_pref, true);
			}
		}
		
		// Clear scroll locking
		var scrollY = document.body.style.top;
		document.body.style.position = '';
		document.body.style.top = '';
		window.scrollTo(0, parseInt(scrollY || '0') * -1);
	}
	
	function onClickBack() {
		if (window.history.length > 1) {
			window.history.back();
		}
		window.close();
		// Fallback: If window.close() doesn't work (blocked by browser),
		// redirect to a blank page
		setTimeout(() => {
			if (!window.closed) {
				window.location.href = 'about:blank';
			}
		}, 100);
	}
	
	function init() {
		$modal = $(
			'<div id="cw-modal" style="display:none;">' + 
				'<div id="cw-modal-box">' + 
					'<div id="cw-modal-content">' + 
						'<div id="cw-heading">The following content is not safe for work.</div>' +
						'<div id="cw-subheading">To continue, you must confirm that you are over the age of 18.</div>' +
						'<div id="cw-action-buttons">' + 
							'<button type="button" class="cw-action-button" id="cw-confirm">Yes, I am over the age of 18</button>' +
							'<button type="button" class="cw-action-button" id="cw-back">No, let me go back</button>' +
						'</div>' +
						'<div id="cw-more-actions">' +
							'<label><input type="checkbox" id="cw-suppress-nsfw-notifs">' +
							'<span>Don\'t show me any more of these warnings.</span></label>' +
						'</div>' +
					'</div>' + 
				'</div>' +
			'</div>'
		);
		$('body').append($modal);
		$('#cw-modal #cw-confirm').on('click', onClickConfirm);
		$('#cw-modal #cw-back').on('click', onClickBack);
	}
	
	init();
	mw.hook('wikipage.content').add(function () {
		$('#cw-modal').css('display', '');
		// Lock background scrolling while the modal is open
		document.body.style.position = 'fixed';
		document.body.style.top = '-' + window.scrollY + 'px';
	});
	
}(mediaWiki, jQuery));