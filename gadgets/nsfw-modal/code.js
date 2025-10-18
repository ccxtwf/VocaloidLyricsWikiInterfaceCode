/* 
 * A simple modal-based notification script that triggers when a certain category (hidden or not) is detected.
 * Authored by [[User:CoolMikeHatsune22]]
 */
/* [[Category:Scripts]] */

(function (mw, $) {
	"use strict";

	var config = mw.config.get([
		'wgArticleId',
		'wgNamespaceNumber',
		'wgCategories'
	]);
	var lc_key = 'skip_nsfw_notice_article_ids_';
	var user_pref = 'userjs-suppress-nsfw-modal';
	var ptLc = 10000;
	var skipIds = [];
	var $modal;
	
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
		$('#cw-modal').hide();
		
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
		$modal = $('<div>', { id: 'cw-modal' })
			.append(
				$('<div>', { id: 'cw-modal-box' })
					.append(
						$('<div>', { id: 'cw-modal-content' })
							.append(
								$('<div>', { id: 'cw-heading' })
									.text('The following content is not safe for work.')
							)
							.append(
								$('<div>', { id: 'cw-subheading' })
									.text('To continue, you must confirm that you are over the age of 18.')
							)
							.append(
								$('<div>', { id: 'cw-action-buttons' })
									.append(
										$('<button>', { id: 'cw-confirm', type: 'button', 'class': 'cw-action-button' })
											.text('Yes, I am over the age of 18')
									)
									.append(
										$('<button>', { id: 'cw-back', type: 'button', 'class': 'cw-action-button' })
											.text('No, let me go back')
									)
							)
							.append(
								$('<div>', { id: 'cw-more-actions' })
									.append(
										$('<label>')
											.append($('<input>', { id: 'cw-suppress-nsfw-notifs', type: 'checkbox' }))
											.append(
												$('<span>').text('Don\'t show me any more of these warnings.')
											)
									)
							)
					)
			);
		$('body').append($modal);
		$('#cw-modal #cw-confirm').on('click', onClickConfirm);
		$('#cw-modal #cw-back').on('click', onClickBack);
	}
	
	init();
	mw.hook('wikipage.content').add(function () {
		$('#cw-modal').show();
		// Lock background scrolling while the modal is open
		document.body.style.position = 'fixed';
		document.body.style.top = '-' + window.scrollY + 'px';
	});
	
}(mediaWiki, jQuery));