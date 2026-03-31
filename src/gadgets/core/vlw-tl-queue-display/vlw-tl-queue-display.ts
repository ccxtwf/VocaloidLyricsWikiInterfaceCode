//! <pre>
import type { Reactive, App } from "vue";

interface TLQueueItem {
  title: string
  producer: string | null
  tlAuthor: string | null
  link: string
  isApproved?: boolean
}
interface TLQueueCollection {
  onq: TLQueueItem[]
  res: TLQueueItem[]
}
interface TLQueueStore {
  isLoading: boolean
  isError: boolean
  data: TLQueueCollection | null
}
interface IAppStore {
  firstParty: TLQueueStore
  thirdParty: TLQueueStore
}

'use strict';

const config = mw.config.get([
  'wgArticlePath',
  'skin'
]);

// =================
//   Configuration
// =================
const TL_CHECKING_PAGE_NAME = 'Help talk:Translation Checking';
const TL_CHECKING_PAGE_NAME_THIRD = 'Help talk:Translation Checking/Third-Party';
const SERVER_RESPONSE_CACHE_EXPIRATION = 15 * 60;					// 15 minutes
const LOCALSTORAGE_CACHE_EXPIRATION = 30 * 60;        		// 30 minutes
const SHOW_NUMBER_OF_ITEMS_AT_START = 3;
const SHOW_MAX_NUMBER_OF_ITEMS = 8;

const LOCALSTORAGE_PREFIX_FIRST_PARTY = 'VLW_TL_CHECKING_QUEUE_FIRST_PARTY';
const LOCALSTORAGE_PREFIX_THIRD_PARTY = 'VLW_TL_CHECKING_QUEUE_THIRD_PARTY';

const containerId = 'vlw-tl-queue-container';

const DEBUGGING_ID = 'vlw-tl-queue-display';

let $container: JQuery<HTMLElement>;
let $app: App | undefined;
let store: Reactive<IAppStore> | undefined;
let isExpandedStore: Reactive<{ x: number }> | undefined;

const messages = {
  'vlw-tl-queue--heading': 'Translation Checking',
  'vlw-tl-queue--go-to-tl-page': 'Go to the translation checking page',
  'vlw-tl-queue--first-party-section': 'First-party Submissions',
  'vlw-tl-queue--third-party-section': 'Third-party Submissions',
  'vlw-tl-queue--heading-in-queue': 'In queue',
  'vlw-tl-queue--heading-resolved': 'Recently checked',
  'vlw-tl-queue--loading': 'Loading',
  'vlw-tl-queue--reload-prompt': 'Reload',
  'vlw-tl-queue--reload-prompt-tooltip': 'Reload this queue',
  'vlw-tl-queue--no-items': 'Currently none',
  'vlw-tl-queue--expand': 'Show more...',
  'vlw-tl-queue--collapse': 'Show less...',
  'vlw-tl-queue--error': 'Failed to fetch data'
};
mw.messages.set(messages);

// =================
//   Fetching
// =================
function getCorrespondentLocalStorageKey(forThirdParty: boolean): string {
  return forThirdParty ? LOCALSTORAGE_PREFIX_THIRD_PARTY : LOCALSTORAGE_PREFIX_FIRST_PARTY;
}

function fetchFromCache(forThirdParty: boolean): TLQueueCollection | null {
  // we make it coalesce to null because mw.storage.getObject may return false
  const o = mw.storage.getObject(getCorrespondentLocalStorageKey(forThirdParty)) || null;
  if (o === null) clearCache(forThirdParty);
  return o;
}

function saveToCache(res: TLQueueCollection, forThirdParty: boolean): void {
  mw.storage.setObject(
    getCorrespondentLocalStorageKey(forThirdParty),
    res,
    LOCALSTORAGE_CACHE_EXPIRATION
  );
}

function clearCache(forThirdParty: boolean): void {
  mw.storage.remove(getCorrespondentLocalStorageKey(forThirdParty));
}

function getListOfTranslations(noCacheMode: boolean, forThirdParty: boolean): Promise<TLQueueCollection> {
  return new Promise<TLQueueCollection>(function (resolve, reject) {
    if (noCacheMode) {
      clearCache(forThirdParty);
    }
    const cached = fetchFromCache(forThirdParty);
    if (cached !== null) {
      resolve(cached);
      return;
    }

    const page = forThirdParty ? TL_CHECKING_PAGE_NAME_THIRD : TL_CHECKING_PAGE_NAME;
    const linkToPage = mw.util.getUrl(page);
    const promise = $.get(mw.util.getUrl(page, {
      action: 'raw',
      maxage: '' + (noCacheMode ? 0 : SERVER_RESPONSE_CACHE_EXPIRATION),
      smaxage: '' + (noCacheMode ? 0 : SERVER_RESPONSE_CACHE_EXPIRATION),
    })).promise();

    promise
    .then(function (wikitext: string) {
      const resolvedTlRequests: TLQueueItem[] = [];
      const onQueueTlRequests: TLQueueItem[] = [];
      let s1 = 0, s2 = 0;
      const headings = Array.from(wikitext.matchAll(/(?<=\n)={2}(?!=)\s*([^\n]+?)\s*(?<=)={2}[ \r]*(?=\n)/g));
      for (let [_, heading] of headings) {
        let item: TLQueueItem;
        let isApproved: boolean | undefined = undefined;
        let rTemplate: RegExpMatchArray | string | null = heading.match(/^(.+)\s*\{\{([Aa]ccepted|[Rr]ejected|[Pp]ending)\s*\|?\s*\b([^\}]*)\s*\}\}\s*$/);
        if (rTemplate !== null) {
          heading = rTemplate[1];
          if (rTemplate[2].match(/^[Aa]ccepted$/) !== null) {
            isApproved = true;
          } else if (rTemplate[2].match(/^[Rr]ejected$/) !== null) {
            isApproved = false;
          }
          rTemplate = (rTemplate[3] === '') ? rTemplate[2] : rTemplate[3];
        }
        const linkDirect = `${linkToPage}#${
          heading.replaceAll(/[\{\}]/g, '').replaceAll(/\s+/g, '_')
        }${
          (rTemplate || '').replaceAll(/\s+/g, '_')
        }`;
        const splitComponents = heading.split(/\s*\|\s*/g);
        if (splitComponents.length < 3) {
          item = {
            title: heading,
            producer: null,
            tlAuthor: null,
            link: linkDirect,
            isApproved
          };
        } else {
          item = {
            title: splitComponents[0],
            producer: splitComponents[1],
            tlAuthor: splitComponents.slice(2).join(' | '),
            link: linkDirect,
            isApproved
          };
        }
        if (isApproved !== undefined) {
          // Optimize resolved tl items list
          if (s1 < SHOW_NUMBER_OF_ITEMS_AT_START) {
            resolvedTlRequests.unshift(item);
            s1++
          }
        } else {
          // Optimize on queue tl items list
          if (s2 < SHOW_MAX_NUMBER_OF_ITEMS) {
            onQueueTlRequests.push(item);
            s2++;
          }
        }
        if (s1 >= SHOW_NUMBER_OF_ITEMS_AT_START && s2 >= SHOW_MAX_NUMBER_OF_ITEMS) {
          break;
        }
      }

      const data = { onq: onQueueTlRequests, res: resolvedTlRequests };
      saveToCache(data, forThirdParty);
      resolve(data);
    })
    .catch(reject);
  });
}

// =================
//   Installation & initialization
// =================
function installContainer(): void {
  let mq: MediaQueryList;
  switch(config.skin) {
    case "vector-2022":
    case "vector":
      mq = window.matchMedia("(max-width: calc(1119px))");
      function _onMqChangeVector(mq: MediaQueryList) {
        if (mq.matches) {
          if ($('.mw-footer-container').find('#'+containerId).length > 0) return;
          if (!!$app) $app.unmount();
          $('.mw-footer-container').prepend($container);
          loadApp();
        } else {
          if ($('#mw-panel').find('#'+containerId).length > 0) return;
          if (!!$app) $app.unmount();
          $('#mw-panel').append($container);
          loadApp();
        }
      }
      _onMqChangeVector(mq);
      mq.addEventListener("change", function() { _onMqChangeVector(mq); });
      break;
    case "medik":
      mq = window.matchMedia("(max-width: 768px)");
      function _onMqChangeMedik(mq: MediaQueryList) {
        if (mq.matches) {
          if ($('#footer').find('#'+containerId).length > 0) return;
          if (!!$app) $app.unmount();
          $('#footer').prepend($container);
          loadApp();
        } else {
          if ($('#mw-navigation').find('#'+containerId).length > 0) return;
          if (!!$app) $app.unmount();
          $('#mw-navigation').append($container);
          loadApp();
        }
      }
      _onMqChangeMedik(mq);
      mq.addEventListener("change", function() { _onMqChangeMedik(mq); });
      break;
    case "monobook":
      $('#sidebar').append($container);
      loadApp();
      break;
    case "timeless":
      mq = window.matchMedia("(max-width: 1099px)");
      function _onMqChangeTimeless(mq: MediaQueryList) {
        if (mq.matches) {
          if ($('#mw-content-container').find('> #'+containerId).length > 0) return;
          if (!!$app) $app.unmount();
          $('#mw-content-container').append($container);
          loadApp();
        } else {
          if ($('#mw-related-navigation').find('#'+containerId).length > 0) return;
          if (!!$app) $app.unmount();
          $('#mw-related-navigation').append($container);
          loadApp();
        }
      }
      _onMqChangeTimeless(mq);
      mq.addEventListener("change", function() { _onMqChangeTimeless(mq); });
      break;
    case "mirage":
      $('#p-tb').after($container);
      loadApp();
      break;
    case "minerva":
      $('.post-content.footer-content').append($container);
      loadApp();
      break;
    case "citizen":
      $('.citizen-footer__container').prepend($container);
      loadApp();
      break;
    default:
      break;
  }
}

function init(): void {
  $container = $('#'+containerId);

  mw.loader.using(['vue', '@wikimedia/codex']).then((require) => {
    const Vue = require('vue');
    const { CdxProgressIndicator } = require('@wikimedia/codex');
    (mw.libs as any).Vue = Vue;
    (mw.libs as any).CdxProgressIndicator = CdxProgressIndicator;

    //@ts-ignore
    store = Vue.reactive({
      firstParty: {
        isLoading: false,
        isError: false,
        data: null,
      },
      thirdParty: {
        isLoading: false,
        isError: false,
        data: null,
      },
    });
    //@ts-ignore
    isExpandedStore = Vue.reactive({ x: 0 });

    if ($container.length === 0) {
      $container = $('<div>', { id: containerId });
      installContainer();
    } else {
      loadApp();
    }
    populate(false);

  });
}

function loadApp(): void {
  const Vue = (mw.libs as any).Vue;
  const CdxProgressIndicator = (mw.libs as any).CdxProgressIndicator;

  $app = Vue.createMwApp({
    template: `
      <div class="title">
        {{ $i18n( 'vlw-tl-queue--heading' ).text() }}
      </div>
      <div class="body">
        <tl-queue-sections
          headingMessageName="vlw-tl-queue--first-party-section"
          :linkToPage="firstPartyTlCheckingPage"
          :store="firstPartyStore"
          :exI="1"
        />
        <tl-queue-sections
          headingMessageName="vlw-tl-queue--third-party-section"
          :linkToPage="thirdPartyTlCheckingPage"
          :store="thirdPartyStore"
          :exI="3"
        />
      </div>
      <tl-queue-more-actions />
    `,
    setup: () => ({ store }),
    computed: {
      firstPartyStore() {
        return this.store.firstParty;
      },
      thirdPartyStore() {
        return this.store.thirdParty;
      },
      firstPartyTlCheckingPage() {
        return mw.util.getUrl(TL_CHECKING_PAGE_NAME);
      },
      thirdPartyTlCheckingPage() {
        return mw.util.getUrl(TL_CHECKING_PAGE_NAME_THIRD);
      }
    }
  });
  $app!.component('tl-queue-sections', {
    template: `
      <div class="tl-queue-sections">
        <a class="heading" :href="linkToPage" :title="$i18n( 'vlw-tl-queue--go-to-tl-page' ).text()" target="_blank" rel="nofollow noindex">
          {{ $i18n( headingMessageName ).text() }}
        </a>
        <cdx-progress-indicator show-label v-if="isLoading">
          {{ $i18n( 'vlw-tl-queue--loading' ).text() }}
        </cdx-progress-indicator>
        <div class="error" v-else-if="isError">
          {{ $i18n( 'vlw-tl-queue--error' ).text() }}
        </div>
        <div class="tl-queue-items" v-else>
          <tl-queue-section
            headingMessageName="vlw-tl-queue--heading-in-queue"
            :store="onQueueTls"
            :exI="exI"
          />
          <tl-queue-section
            headingMessageName="vlw-tl-queue--heading-resolved"
            :store="resolvedTls"
            :exI="exI+1"
            :doNotShowLoadMore="true"
          />
        </div>
      </div>
    `,
    components: { CdxProgressIndicator },
    props: ['headingMessageName', 'linkToPage', 'store', 'exI'],
    setup: ({ headingMessageName, linkToPage, store, exI }: { headingMessageName: string, linkToPage: string, store: TLQueueStore, exI: number }) => ({ headingMessageName, linkToPage, store, exI }),
    computed: {
      onQueueTls() {
        return (this.store.data || {}).onq;
      },
      resolvedTls() {
        return (this.store.data || {}).res;
      },
      isLoading() {
        return this.store.isLoading;
      },
      isError() {
        return this.store.isError;
      },
    }
  });
  $app!.component('tl-queue-section', {
    template: `
      <div class="subheading">
        {{ $i18n( headingMessageName ).text() }}
      </div>
      <div v-if="isEmpty">
        <i>{{ $i18n( 'vlw-tl-queue--no-items' ).text() }}</i>
      </div>
      <template v-else>
        <tl-queue-item
          v-for="(item, idx) in renderedData"
          :item="item"
        />
      </template>
      <div v-if="!doNotShowLoadMore">
        <a
          class="toggle"
          @click="onClickExpand"
        >
          {{ $i18n( isExpanded ? 'vlw-tl-queue--collapse' : 'vlw-tl-queue--expand' ).text() }}
        </a>
      </div>
      `,
    props: ['headingMessageName', 'store', 'exI', 'doNotShowLoadMore'],
    setup: ({ headingMessageName, store, exI, doNotShowLoadMore }: { headingMessageName: string, store?: TLQueueCollection, exI: number, doNotShowLoadMore?: boolean }) => ({
      headingMessageName,
      store,
      exI,
      doNotShowLoadMore,
      isExpandedStore,
    }),
    computed: {
      storedData() {
        return this.store;
      },
      isExpanded() {
        return this.isExpandedStore.x === this.exI;
      },
      isEmpty() {
        return !this.storedData || this.storedData.length === 0;
      },
      renderedData() {
        return (this.storedData || []).slice(0, this.isExpanded ? SHOW_MAX_NUMBER_OF_ITEMS : SHOW_NUMBER_OF_ITEMS_AT_START);
      },
    },
    methods: {
      onClickExpand() {
        this.isExpandedStore.x = this.isExpanded ? 0 : this.exI;
      }
    }
  });
  $app!.component('tl-queue-item', {
    template: `
    <div class="tl-queue-item">
      <a class="tl-check-req-title" :href="link" target="_blank" rel="nofollow noindex">
        {{ title }}
      </a>
      <div class="tl-check-req-subtitle">
        <div :class="iconCssClass">
        </div>
        <div class="tl-check-req-producer">
          {{ producer || '' }}
        </div>
        <div class="tl-check-req-author">
          {{ tlAuthor || '' }}
        </div>
      </div>
    </div>
    `,
    props: ['item'],
    setup: ({ item: { title, link, producer, tlAuthor, isApproved } }: { item: TLQueueItem }) => ({
      title, link, producer, tlAuthor, isApproved
    }),
    computed: {
      iconCssClass() {
        return this.isApproved === undefined ? '' :
          'tl-check-req-' + (this.isApproved ? 'approved' : 'rejected');
      }
    }
  });
  $app!.component('tl-queue-more-actions', {
    template: `
      <div class="more-actions">
        <a id="icon-refresh" :title="$i18n('vlw-tl-queue--reload-prompt-tooltip').text()" @click="onClickRefresh">
          <img src="https://upload.wikimedia.org/wikipedia/commons/c/ce/Ic_refresh_48px.svg" />
          <span class="label">
            {{ $i18n('vlw-tl-queue--reload-prompt').text() }}
          </span>
        </a>
      </div>
    `,
    methods: {
      onClickRefresh() {
        populate(true);
      }
    }
  });
  $app!.mount('#'+containerId);
}

function populate(noCacheMode: boolean): void {
  const promises = [false, true].map(function (forThirdParty) {
    const prop = forThirdParty ? 'thirdParty' : 'firstParty';
    store![prop].isLoading = true;
    return getListOfTranslations(noCacheMode, forThirdParty)
      .then(function (res) {
        store![prop].data = res;
      })
      .catch(function (error) {
        store![prop].isError = true;
        console.error(error, DEBUGGING_ID);
      })
      .finally(function() {
        store![prop].isLoading = false;
      });
  });
  Promise.all(promises);
}

// =================
//   Run
// =================
mw.loader.using( ['mediawiki.util'] ).then(function() {
  init();
  // mw.hook('wikipage.content') fires several times each page (e.g. refreshing recent changes queue)
});
//! </pre>
