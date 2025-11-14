import type { Reactive, App } from "vue";

interface TLQueueItem {
  title: string
  producer: string | null
  tlAuthor: string | null
  link: string
  isApproved?: boolean
}

interface IAppStore {
  inQueue: TLQueueItem[]
  resolved: TLQueueItem[]
  loadedMoreInQueue: boolean
  loadedMoreInResolved: boolean
  isLoading: boolean
  isError: boolean
}

(function (mw, $) {
  'use strict';
  
  const config = mw.config.get([
    'wgArticlePath',
    'skin'
  ]);
  
  // =================
  //   Configuration
  // =================
  const TL_CHECKING_PAGE_NAME = 'Help talk:Translation Checking';
  const SERVER_RESPONSE_CACHE_EXPIRATION = 15 * 60;					// 15 minutes
  const LOCALSTORAGE_CACHE_EXPIRATION = 30 * 60;        		// 30 minutes
  const SHOW_NUMBER_OF_ITEMS_AT_START = 5;
  const SHOW_MAX_NUMBER_OF_ITEMS = 10;
  
  const LOCALSTORAGE_PREFIX = 'vlw_tl_checking_queue_data';

  const containerId = 'vlw-tl-queue-container';

  const DEBUGGING_ID = 'vlw-tl-queue-display';
  
  let $container: JQuery<HTMLElement>;
  let $app: App | undefined;
  let store: Reactive<IAppStore> | undefined;

  const messages = {
    'vlw-tl-queue--heading-in-queue': 'Translations in queue',
    'vlw-tl-queue--heading-resolved': 'Recently checked',
    'vlw-tl-queue--loading': 'Loading',
    'vlw-tl-queue--reload-prompt': 'Reload',
    'vlw-tl-queue--reload-prompt-tooltip': 'Reload this queue',
    'vlw-tl-queue--no-items': 'Currently none',
    'vlw-tl-queue--load-more': 'Load more...',
    'vlw-tl-queue--view-more': 'View More on the Translation Checking Page',
    'vlw-tl-queue--error': 'Failed to fetch data'
  };
  mw.messages.set(messages);

  // =================
  //   Fetching
  // =================
  const linkToPage = mw.util.getUrl(TL_CHECKING_PAGE_NAME);
  function fetchFromCache(): [TLQueueItem[], TLQueueItem[]] | null {
    // we make it coalesce to null because mw.storage.getObject may return false
    const o = mw.storage.getObject(LOCALSTORAGE_PREFIX) || null;
    return o;
  }
  
  function saveToCache(res: [TLQueueItem[], TLQueueItem[]]): void {
    mw.storage.setObject(LOCALSTORAGE_PREFIX, res, LOCALSTORAGE_CACHE_EXPIRATION);
  }
  
  function clearCache(): void {
    mw.storage.remove(LOCALSTORAGE_PREFIX);
  }
  
  function getListOfTranslations(noCacheMode: boolean): Promise<[TLQueueItem[], TLQueueItem[]]> {
    return new Promise<[TLQueueItem[], TLQueueItem[]]>(function (resolve, reject) {
      
      if (noCacheMode) clearCache();
      const cached = fetchFromCache();
      if (cached !== null) {
        resolve(cached);
        return;
      }
      
      $.get(mw.util.getUrl(TL_CHECKING_PAGE_NAME, {
        action: 'raw',
        maxage: '' + (noCacheMode ? 0 : SERVER_RESPONSE_CACHE_EXPIRATION),
        smaxage: '' + (noCacheMode ? 0 : SERVER_RESPONSE_CACHE_EXPIRATION),
      }))
      .done(function (wikitext: string) {
        const resolvedTlRequests: TLQueueItem[] = [];
        const onQueueTlRequests: TLQueueItem[] = [];
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
            if (resolvedTlRequests.length < SHOW_MAX_NUMBER_OF_ITEMS) {
              resolvedTlRequests.unshift(item);
            }
          } else {
            if (onQueueTlRequests.length < SHOW_MAX_NUMBER_OF_ITEMS) {
              onQueueTlRequests.push(item);
            }
          }
        }
        saveToCache([onQueueTlRequests, resolvedTlRequests]);
        resolve([onQueueTlRequests, resolvedTlRequests]);
      })
      .fail(reject);
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
				inQueue: [],
        resolved: [],
        loadedMoreInQueue: false,
        loadedMoreInResolved: false,
				isLoading: false,
			});

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
        <div class="tl-queue-sections">
          <tl-queue-section 
            cssClass="on-queue" 
            headingMessageName="vlw-tl-queue--heading-in-queue" 
            storeKeyData="inQueue"
            storeKeyHasLoadedMore="loadedMoreInQueue"
          />
          <tl-queue-section 
            cssClass="resolved" 
            headingMessageName="vlw-tl-queue--heading-resolved"  
            storeKeyData="resolved"
            storeKeyHasLoadedMore="loadedMoreInResolved"
          />
        </div>
        <tl-queue-more-actions />
      `,
      setup: () => ({ store }),
    });
    $app!.component('tl-queue-section', {
      template: `
        <div class="tl-queue-section">
          <div class="label">
            {{ $i18n( headingMessageName ).text() }}
          </div>
          <div class="tl-queue-contents">
            <cdx-progress-indicator show-label v-if="store.isLoading">
              {{ $i18n( 'vlw-tl-queue--loading' ).text() }}
            </cdx-progress-indicator>
            <div class="error" v-else-if="store.isError">
              {{ $i18n( 'vlw-tl-queue--error' ).text() }}
            </div>
            <ul v-else>
              <span v-if="isEmpty">
                <i>{{ $i18n( 'vlw-tl-queue--no-items' ).text() }}</i>
              </span>
              <tl-queue-item 
                v-for="(item, idx) in renderedData"
                :item="item"
              />
            </ul>
          </div>
          <div class="more-links">
            <a 
              class="toggle" 
              @click="onClickLoadMore" 
              v-if="!isEmpty && hasMoreDataToShow"
            >
              {{ $i18n( 'vlw-tl-queue--load-more' ).text() }}
            </a>
            <a class="tl-check-page-link" :href="linkToPage" target="_blank" rel="nofollow noindex">
              {{ $i18n( 'vlw-tl-queue--view-more' ).text() }}
            </a>
          </div>
        </div>
        `,
      components: { CdxProgressIndicator },
      props: ['headingMessageName', 'storeKeyData', 'storeKeyHasLoadedMore'],
      setup: ({ headingMessageName, storeKeyData, storeKeyHasLoadedMore }: { cssClass: string, headingMessageName: string, storeKeyData: string, storeKeyHasLoadedMore: string }) => ({
        linkToPage,
        headingMessageName, 
        storeKeyData, 
        storeKeyHasLoadedMore,
        store
      }),
      computed: {
        storedData() {
          //@ts-ignore
          return store[this.storeKeyData];
        },
        isEmpty() {
          return this.storedData.length === 0;
        },
        hasMoreDataToShow() {
          //@ts-ignore
          const hasLoadedMore = store[this.storeKeyHasLoadedMore];
          if (hasLoadedMore) return false;
          return this.storedData.length > SHOW_NUMBER_OF_ITEMS_AT_START;
        },
        renderedData() {
          if (!this.hasMoreDataToShow) {
            return this.storedData;
          }
          return this.storedData.slice(0, SHOW_NUMBER_OF_ITEMS_AT_START);
        }
      },
      methods: {
        onClickLoadMore() {
          //@ts-ignore
          store[this.storeKeyHasLoadedMore] = true;
        }
      }
    });
    $app!.component('tl-queue-item', {
      template: `
      <li>
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
      </li>
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
          <a id="icon-refresh" :title="$i18n('vlw-tl-queue--reload-prompt-tooltip').text()">
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
    store!.isLoading = true;
    store!.isError = false;
    getListOfTranslations(noCacheMode)
      .then(function (res) {
        const [onQueueTlRequests, resolvedTlRequests] = res;
        store!.inQueue = onQueueTlRequests;
        store!.resolved = resolvedTlRequests;
        store!.loadedMoreInQueue = false;
        store!.loadedMoreInResolved = false;
      })
      .catch(function (error) {
        store!.isError = true;
        console.error(error, DEBUGGING_ID);
      })
      .finally(function() {
        store!.isLoading = false;
      });
  }
  
  // =================
  //   Run
  // =================
  mw.loader.using( ['mediawiki.util'] ).then(function() {
    init();
    // mw.hook('wikipage.content') fires several times each page (e.g. refreshing recent changes queue)
  });
  
}(mediaWiki, jQuery));