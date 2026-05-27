/// <reference types="vue" />
/// <reference types="types-mediawiki" />
/// <reference types="types-mediawiki-api" />

import type { Reactive, App } from "vue";

"use strict";

const config = mw.config.get([
	'wgArticleId',
	'wgNamespaceNumber',
	'wgCategories',
  'wgUserId'
]);

const SUPPRESSED_PAGE_IDS_KEY = 'vlw-suppress-nsfw';
const USER_PREFERENCE_KEY = 'userjs-vlw-suppress-nsfw';
const USER_PREFERENCE_EXPIRY_KEY = USER_PREFERENCE_KEY+'-EXPIRY';

const ONE_DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
const SUPPRESS_EXPIRY = 30 * ONE_DAY_IN_MILLISECONDS;	 // 1 month
let skipIds: string[] = [];

const container = document.createElement('div');
container.setAttribute('id', 'cw-modal');
container.style.display = 'none';

let store: Reactive<IAppStore>;

const messages = {
	'vlw-nsfw-modal--cw-heading': 'The following content is not safe for work.',
	'vlw-nsfw-modal--cw-subheading': 'To continue, you must confirm that you are over the age of 18.',
	'vlw-nsfw-modal--cw-confirm': 'Yes, I am over the age of 18',
	'vlw-nsfw-modal--cw-back': 'No, let me go back',
	'vlw-nsfw-modal--do-not-show': 'Don\'t show me any more of these warnings.',
};
mw.messages.set(messages);

interface IAppStore {
  doNotShowMoreWarnings: boolean,
}

/**
 * Checks if the user has set preferences to disable the site-wide NSFW modals
 *
 * The preferences are stored in one of two places:
 *  1) The MediaWiki user options, stored in-server.
 *     This is loaded onto the mw.user.options Map on each page load (no latency/no waiting for
 *     an additional network request).
 *     This is not available to non-logged-in users.
 *  2) The client-side storage for non-logged-in users.
 *     `mw.cookie` is used as the wrapper interface around this storage.
 *     The storage clears itself again when the user exits the browser.
 *
 * @returns
 */
function checkUserSavedOptions(): boolean {
  const curTimestamp = Date.now();

  if (config.wgUserId) {
    /**
     * Logged in
     */
    const mwSuppressedModals = mw.user.options.get( USER_PREFERENCE_KEY ) === '1';
    const mwSuppressedModalsExpiry = +(mw.user.options.get( USER_PREFERENCE_EXPIRY_KEY ) || 0);
    return (mwSuppressedModals && mwSuppressedModalsExpiry > curTimestamp);
  } else {
    /**
     * Logged out
     */
    const ssSuppressedModals = mw.cookie.get( USER_PREFERENCE_KEY ) === '1';
    return ssSuppressedModals;
  }
}

/**
 * Analogue to `checkUserSavedOptions`
 */
async function saveUserOptions(): Promise<void> {
  if (config.wgUserId) {
    /**
     * Logged in
     */
    const expiry = new Date(Date.now() + SUPPRESS_EXPIRY).getTime();
    const api = new mw.Api();
    await api.saveOptions( {
      [USER_PREFERENCE_KEY]: '1',
      [USER_PREFERENCE_EXPIRY_KEY]: ''+expiry,
    } );
  } else {
    /**
     * Logged out
     */
    mw.cookie.set( USER_PREFERENCE_KEY, '1' );  /* mw.cookie persists as a session cookie */
  }
}

/**
 * Utility function for UI update
 */
function showOrHideModal(isShown: boolean) {
  container.style.display = isShown ? '' : 'none';
}

(function (mw) {
  /**
   * Skip if namespace is not main or the category is not detected
   */
	if (config.wgNamespaceNumber !== 0 || config.wgCategories.indexOf("Songs with NSFW content") < 0) {
		return;
	}

	/**
   * Skip if user has given their consent to not show any NSFW modals
   */
	const userHasSuppressedModals = checkUserSavedOptions();
	if (userHasSuppressedModals) {
		return;
	}

	/**
   * Skip if user has already given consent for a single page
   */
  const hasSkipped = (() => {
    const ss = mw.cookie.get( SUPPRESSED_PAGE_IDS_KEY );
    if (ss) {
      skipIds = ss.split(',');
    }
    return (skipIds.indexOf( ''+config.wgArticleId ) > -1);
  })();
  if (hasSkipped) {
    return;
  }

	function init() {
    mw.loader.using( ['vue', '@wikimedia/codex'] ).then(require => {
			const Vue = require('vue');
			const { CdxCheckbox } = require('@wikimedia/codex');

      store = Vue.reactive({
				doNotShowMoreWarnings: false,
			});

      const $app: App = Vue.createMwApp({
        template: `
        <div id="cw-modal-box-wrapper">
          <div id="cw-modal-box">
            <div id="cw-heading">
              {{ $i18n( 'vlw-nsfw-modal--cw-heading' ).text() }}
            </div>
            <div id="cw-subheading">
              {{ $i18n( 'vlw-nsfw-modal--cw-subheading' ).text() }}
            </div>
            <div id="cw-action-buttons">
              <button id="cw-confirm" type="button" class="cw-action-button" @click="onClickConfirm">
                {{ $i18n( 'vlw-nsfw-modal--cw-confirm' ).text() }}
              </button>
              <button id="cw-back" type="button" class="cw-action-button" @click="onClickBack">
                {{ $i18n( 'vlw-nsfw-modal--cw-back' ).text() }}
              </button>
            </div>
            <div id="cw-more-actions">
              <cdx-checkbox v-model="store.doNotShowMoreWarnings" @update:model-value="onUpdate">
                {{ $i18n( 'vlw-nsfw-modal--do-not-show' ).text() }}
              </cdx-checkbox>
            </div>
          </div>
        </div>
        `,
        components: { CdxCheckbox },
        setup: () => ({ store }),
        methods: {
          /**
           * Event handler on clicking the "Yes, I'm over 18" Button
           */
          onClickConfirm(): void {
            showOrHideModal(false);

            // Save user consent to session storage
            skipIds.push(''+config.wgArticleId);
            mw.cookie.set( SUPPRESSED_PAGE_IDS_KEY, skipIds.join(',') );

            // Save option to user preferences
            if (this.store.doNotShowMoreWarnings) {
              saveUserOptions();  //! unawaited
            }

            // Clear scroll locking
            const scrollY = document.body.style.top;
            document.body.style.position = '';
            document.body.style.top = '';
            window.scrollTo(0, parseInt(scrollY || '0') * -1);
          },

          /**
           * Event handler on clicking the "Let me go back" Button
           */
          onClickBack(): void {
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
        }
      });
      document.body.appendChild(container);
      $app.mount("#"+container.getAttribute('id'));
    });
	}

	init();
	mw.hook('wikipage.content').add(function () {
    showOrHideModal(true);
		// Lock background scrolling while the modal is open
		document.body.style.position = 'fixed';
		document.body.style.top = '-' + window.scrollY + 'px';
	});

}(mediaWiki));
