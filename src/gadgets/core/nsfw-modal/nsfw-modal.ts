"use strict";

const config = mw.config.get([
	'wgArticleId',
	'wgNamespaceNumber',
	'wgCategories'
]);
const SESSIONSTORAGE_KEY = 'skip-nsfw-notice';
const USER_PREFERENCE_KEY = 'userjs-suppress-nsfw-modal';
const USER_PREFERENCE_EXPIRY_KEY = USER_PREFERENCE_KEY+'-EXPIRY';
const ONE_DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
const SUPPRESS_EXPIRY = 30 * ONE_DAY_IN_MILLISECONDS;	 // 1 month
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
	devspace.exitMediaWiki();
}

// Skip if user has given their consent to not show any NSFW modals
const userHasSuppressedModals = checkUserSavedOptions();
if (userHasSuppressedModals) {
	devspace.exitMediaWiki();
}

// Skip if user has already given consent for a single page
const lc = sessionStorage.getItem( SESSIONSTORAGE_KEY );
if (!!lc) {
	skipIds = (lc || '').split(',');
}
if (skipIds.indexOf(''+config.wgArticleId) > -1) {
	devspace.exitMediaWiki();
}

function checkUserSavedOptions(): boolean {
	const curTimestamp = Date.now();
	const lcSuppressedModals = localStorage.getItem(USER_PREFERENCE_KEY) === 'true';
	const lcSuppressedModalsExpiry = +(localStorage.getItem(USER_PREFERENCE_EXPIRY_KEY) || 0);
	if (lcSuppressedModals && lcSuppressedModalsExpiry > curTimestamp) {
		return true;
	}
	localStorage.removeItem(USER_PREFERENCE_KEY);
	localStorage.removeItem(USER_PREFERENCE_EXPIRY_KEY);
	const mwSuppressedModals = mw.user.options.get([USER_PREFERENCE_KEY])[USER_PREFERENCE_KEY] === 'true';
	const mwSuppressedModalsExpiry = +(mw.user.options.get([USER_PREFERENCE_EXPIRY_KEY])[USER_PREFERENCE_EXPIRY_KEY] || 0);
	if (mwSuppressedModals && mwSuppressedModalsExpiry > curTimestamp) {
		localStorage.setItem(USER_PREFERENCE_KEY, 'true');
		localStorage.setItem(USER_PREFERENCE_EXPIRY_KEY, ''+mwSuppressedModalsExpiry);
		return true;
	}
	return false;
}

function onClickConfirm(): void {
	$('#cw-modal').hide();
	
	// Save user consent to local storage 
	skipIds.push(''+config.wgArticleId);
	sessionStorage.setItem( SESSIONSTORAGE_KEY, skipIds.join(',') );
	
	// Save option to user preferences
	if ($('#cw-suppress-nsfw-notifs').prop('checked') === true) {
		const expiry = new Date(Date.now() + SUPPRESS_EXPIRY).getTime();
		localStorage.setItem(USER_PREFERENCE_KEY, 'true');
		localStorage.setItem(USER_PREFERENCE_EXPIRY_KEY, ''+expiry);
		if (mw.user.getId() != 0) {
			const api = new mw.Api();
			api.saveOption(USER_PREFERENCE_KEY, 'true');
			api.saveOption(USER_PREFERENCE_EXPIRY_KEY, ''+expiry);
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