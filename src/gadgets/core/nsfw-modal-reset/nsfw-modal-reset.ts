/// <reference types="types-mediawiki" />
/// <reference types="types-mediawiki-api" />

"use strict";

const config = mw.config.get([
	'wgArticleId',
	'wgNamespaceNumber',
	'wgCategories',
  'wgUserId'
]);

const messages = {
	'vlw-nsfw-modal--reset-processing': 'Clearing the current user\'s NSFW popup settings...',
  'vlw-nsfw-modal--reset-success': 'The current user\'s NSFW popup settings have been successfully reset.',
  'vlw-nsfw-modal--reset-unknown-error': 'An unknown error has occured!',
};
mw.messages.set(messages);

const SUPPRESSED_PAGE_IDS_KEY = 'vlw-suppress-nsfw';
const USER_PREFERENCE_KEY = 'userjs-vlw-suppress-nsfw';
const USER_PREFERENCE_EXPIRY_KEY = USER_PREFERENCE_KEY+'-EXPIRY';

const OBSOLETED_KEYS = [
  'userjs-suppress-nsfw-modal',
  'userjs-suppress-nsfw-modal-EXPIRY',
];

/**
 * Clears all NSFW popup settings from user-saved options, including settings stored
 * into old/obsoleted keys
 *
 * @returns
 */
async function clearAllUserSettings(): Promise<void> {
  const CLEAR_KEYS_MW_API = [
    USER_PREFERENCE_KEY,
    USER_PREFERENCE_EXPIRY_KEY,
    ...OBSOLETED_KEYS,
  ];

  /**
   * Clear user-saved options stored in the MediaWiki API
   */
  if (config.wgUserId) {
    const api = new mw.Api();
    await api.saveOptions(CLEAR_KEYS_MW_API.reduce((obj, k) => {
      obj[k] = null;
      return obj;
    }, {} as Record<string, any>));
  } else {
    /* If not logged in, simply remove the saved settings from the session cookie */
    mw.cookie.set( USER_PREFERENCE_KEY, null );
    mw.cookie.set( USER_PREFERENCE_EXPIRY_KEY, null );
  }

  /**
   * Also clear values stored in mw.cookie (session storage)
   */
  mw.cookie.set( SUPPRESSED_PAGE_IDS_KEY, null );
};


(function (mw) {
  mw.notify( mw.msg('vlw-nsfw-modal--reset-processing'), { type: 'info' } );
  clearAllUserSettings()
    .then(() => {
      mw.notify( mw.msg('vlw-nsfw-modal--reset-success'), { type: 'success' } );
    })
    .catch((err) => {
      console.error(err);
      mw.notify( mw.msg('vlw-nsfw-modal--reset-unknown-error'), { type: 'error' } );
    });
})(mediaWiki);
