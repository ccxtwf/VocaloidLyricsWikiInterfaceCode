(function (mw, $) {
	"use strict";

	const config = mw.config.get([
		'wgArticleId',
		'wgNamespaceNumber',
		'wgCategories'
	]);
	const LOCALSTORAGE_KEY = 'skip_nsfw_notice_article_ids_';
	const USER_PREFERENCE_PREFIX = 'userjs-suppress-nsfw-modal';
	const ptLc = 10000;
	let skipIds: string[] = [];
	let $modal: JQuery<HTMLElement>;
	
	const messages = {
		'vlw-nsfw-modal--cw-heading': 'The following content is not safe for work.',
		'vlw-nsfw-modal--cw-subheading': 'To continue, you must confirm that you are over the age of 18.',
		'vlw-nsfw-modal--cw-confirm': 'Yes, I am over the age of 18',
		'vlw-nsfw-modal--cw-back': 'No, let me go back',
		'vlw-nsfw-modal--do-not-show': 'Don\'t show me any more of these warnings.'
	};
	mw.messages.set(messages);

	// Skip if namespace is not main or the category is not detected
	if (config.wgNamespaceNumber !== 0 || config.wgCategories.indexOf("Songs with NSFW content") < 0) {
		return;
	}
	
	// Skip if user has given their consent to not show any NSFW modals
	if (localStorage.getItem(USER_PREFERENCE_PREFIX) === 'true' || mw.user.options.get([USER_PREFERENCE_PREFIX])[USER_PREFERENCE_PREFIX] === 'true') {
		return;
	}
	
	// Skip if user has already given consent for a single page
	const idx_lc = Math.ceil(config.wgArticleId / ptLc);
	const lc = localStorage.getItem( LOCALSTORAGE_KEY + idx_lc );
	if (!!lc) {
		skipIds = (lc || '').split(',');
	}
	if (skipIds.indexOf(''+config.wgArticleId) > -1) {
		return;
	}
	
	function onClickConfirm(): void {
		$('#cw-modal').hide();
		
		// Save user consent to local storage 
		skipIds.push(''+config.wgArticleId);
		localStorage.setItem( LOCALSTORAGE_KEY + idx_lc, skipIds.join(',') );
		
		// Save option to user preferences
		if ($('#cw-suppress-nsfw-notifs').prop('checked') === true) {
			//@ts-ignore
			localStorage.setItem(USER_PREFERENCE_PREFIX, true);
			if (mw.user.getId() != 0) {
				const api = new mw.Api();
				//@ts-ignore
				api.saveOption(USER_PREFERENCE_PREFIX, true);
			}
		}
		
		// Clear scroll locking
		const scrollY = document.body.style.top;
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
									.text(
										mw.msg('vlw-nsfw-modal--cw-heading')
									)
							)
							.append(
								$('<div>', { id: 'cw-subheading' })
									.text(
										mw.msg('vlw-nsfw-modal--cw-subheading')
									)
							)
							.append(
								$('<div>', { id: 'cw-action-buttons' })
									.append(
										$('<button>', { id: 'cw-confirm', type: 'button', 'class': 'cw-action-button' })
											.text(mw.msg('vlw-nsfw-modal--cw-confirm'))
									)
									.append(
										$('<button>', { id: 'cw-back', type: 'button', 'class': 'cw-action-button' })
											.text(mw.msg('vlw-nsfw-modal--cw-back'))
									)
							)
							.append(
								$('<div>', { id: 'cw-more-actions' })
									.append(
										$('<label>')
											.append($('<input>', { id: 'cw-suppress-nsfw-notifs', type: 'checkbox' }))
											.append(
												$('<span>').text(
													mw.msg('vlw-nsfw-modal--do-not-show')
												)
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