import type { App } from "vue";

import type { AppPiniaStore, TLQueueCollection, TlCheckingParsedQueueItem } from "./types.ts";
import { parseTlCheckingTocData } from "../../../utils/tl-checking-utils.ts";

//! <pre>

const config = mw.config.get(["wgArticlePath", "skin"]);

const {
  TL_CHECKING_PAGE_NAME,
  TL_CHECKING_PAGE_NAME_THIRD,
  SERVER_RESPONSE_CACHE_EXPIRATION,
  LOCALSTORAGE_CACHE_EXPIRATION,
  SHOW_NUMBER_OF_ITEMS_AT_START,
  SHOW_MAX_NUMBER_OF_ITEMS,
  LOCALSTORAGE_PREFIX_FIRST_PARTY,
  LOCALSTORAGE_PREFIX_THIRD_PARTY,
  CACHE_VERSION_KEY,
  CACHE_VERSION,
} = mw_require("./vlw-tl-queue-display-config.js");
const containerId = "vlw-tl-queue-container";
const DEBUGGING_ID = "vlw-tl-queue-display";

let $container: JQuery<HTMLElement>;
let $app: App;
let $store: AppPiniaStore;

const messages = {
  "vlw-tl-queue--heading": "Translation Checking",
  "vlw-tl-queue--go-to-tl-page": "Go to the translation checking page",
  "vlw-tl-queue--first-party-section": "First-party Submissions",
  "vlw-tl-queue--third-party-section": "Third-party Submissions",
  "vlw-tl-queue--heading-in-queue": "In queue",
  "vlw-tl-queue--heading-resolved": "Recently checked",
  "vlw-tl-queue--loading": "Loading",
  "vlw-tl-queue--reload-prompt": "Reload",
  "vlw-tl-queue--reload-prompt-tooltip": "Reload this queue",
  "vlw-tl-queue--no-items": "Currently none",
  "vlw-tl-queue--expand": "Show more...",
  "vlw-tl-queue--collapse": "Show less...",
  "vlw-tl-queue--error": "Failed to fetch data",
};
mw.messages.set(messages);

const Vue = mw_require("vue");
const Pinia = mw_require("pinia");
const pinia = Pinia.createPinia();

// =================
//   Fetching
// =================
function getCorrespondentLocalStorageKey(forThirdParty: boolean): string {
  return forThirdParty ? LOCALSTORAGE_PREFIX_THIRD_PARTY : LOCALSTORAGE_PREFIX_FIRST_PARTY;
}

function fetchFromCache(forThirdParty: boolean): TLQueueCollection | null {
  // we make it coalesce to null because mw.storage.getObject may return false
  const o = mw.storage.getObject(getCorrespondentLocalStorageKey(forThirdParty)) || null;
  if (o === null || (mw.storage.getObject(CACHE_VERSION_KEY) || 0) < CACHE_VERSION) {
    clearCache(forThirdParty);
  }
  return o;
}

function saveToCache(res: TLQueueCollection, forThirdParty: boolean): void {
  mw.storage.setObject(
    getCorrespondentLocalStorageKey(forThirdParty),
    res,
    LOCALSTORAGE_CACHE_EXPIRATION,
  );
  mw.storage.setObject(CACHE_VERSION_KEY, CACHE_VERSION);
}

function clearCache(forThirdParty: boolean): void {
  mw.storage.remove(getCorrespondentLocalStorageKey(forThirdParty));
  mw.storage.remove(CACHE_VERSION_KEY);
}

async function getListOfTranslations(
  noCacheMode: boolean,
  forThirdParty: boolean,
): Promise<TLQueueCollection> {
  if (noCacheMode) {
    clearCache(forThirdParty);
  }
  const cached = fetchFromCache(forThirdParty);
  if (cached !== null) {
    return cached;
  }

  const page = forThirdParty ? TL_CHECKING_PAGE_NAME_THIRD : TL_CHECKING_PAGE_NAME;
  const res = await new mw.Api()
    .get({
      action: "parse",
      page,
      prop: "tocdata",
      format: "json",
      maxage: "" + (noCacheMode ? 0 : SERVER_RESPONSE_CACHE_EXPIRATION),
      smaxage: "" + (noCacheMode ? 0 : SERVER_RESPONSE_CACHE_EXPIRATION),
    })
    .promise();

  if (!res.parse || !res.parse.tocdata || !res.parse.tocdata.sections) {
    throw new Error("Got unexpected response from the MediaWiki API");
  }

  const resolvedTlRequests: TlCheckingParsedQueueItem[] = [];
  const onQueueTlRequests: TlCheckingParsedQueueItem[] = [];
  let s1 = 0,
    s2 = 0;
  const queueItems = parseTlCheckingTocData(res, forThirdParty);
  for (const item of queueItems) {
    if (item.outcome) {
      // Optimize resolved tl items list
      if (s1 < SHOW_NUMBER_OF_ITEMS_AT_START) {
        resolvedTlRequests.unshift(item);
        s1++;
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
  return data;
}

// =================
//   Installation & initialization
// =================
function installContainer(): void {
  let mq: MediaQueryList;
  switch (config.skin) {
    case "vector-2022":
    case "vector":
      mq = window.matchMedia("(max-width: calc(1119px))");
      function _onMqChangeVector(mq: MediaQueryList) {
        if (mq.matches) {
          if ($(".mw-footer-container").find("#" + containerId).length > 0) return;
          if ($app) $app.unmount();
          $(".mw-footer-container").prepend($container);
          loadApp();
        } else {
          if ($("#mw-panel").find("#" + containerId).length > 0) return;
          if ($app) $app.unmount();
          $("#mw-panel").append($container);
          loadApp();
        }
      }
      _onMqChangeVector(mq);
      mq.addEventListener("change", function () {
        _onMqChangeVector(mq);
      });
      break;
    case "medik":
      mq = window.matchMedia("(max-width: 768px)");
      function _onMqChangeMedik(mq: MediaQueryList) {
        if (mq.matches) {
          if ($("#footer").find("#" + containerId).length > 0) return;
          if ($app) $app.unmount();
          $("#footer").prepend($container);
          loadApp();
        } else {
          if ($("#mw-navigation").find("#" + containerId).length > 0) return;
          if ($app) $app.unmount();
          $("#mw-navigation").append($container);
          loadApp();
        }
      }
      _onMqChangeMedik(mq);
      mq.addEventListener("change", function () {
        _onMqChangeMedik(mq);
      });
      break;
    case "monobook":
      $("#sidebar").append($container);
      loadApp();
      break;
    case "timeless":
      mq = window.matchMedia("(max-width: 1099px)");
      function _onMqChangeTimeless(mq: MediaQueryList) {
        if (mq.matches) {
          if ($("#mw-content-container").find("> #" + containerId).length > 0) return;
          if ($app) $app.unmount();
          $("#mw-content-container").append($container);
          loadApp();
        } else {
          if ($("#mw-related-navigation").find("#" + containerId).length > 0) return;
          if ($app) $app.unmount();
          $("#mw-related-navigation").append($container);
          loadApp();
        }
      }
      _onMqChangeTimeless(mq);
      mq.addEventListener("change", function () {
        _onMqChangeTimeless(mq);
      });
      break;
    case "mirage":
      $("#p-tb").after($container);
      loadApp();
      break;
    case "minerva":
      $(".post-content.footer-content").append($container);
      loadApp();
      break;
    case "citizen":
      $(".citizen-footer__container").prepend($container);
      loadApp();
      break;
    default:
      break;
  }
}

function init(): void {
  $container = $("#" + containerId);
  if ($container.length === 0) {
    $container = $("<div>", { id: containerId });
    installContainer();
  } else {
    loadApp();
  }
  populate(false); // unawaited
}

function loadApp(): void {
  const appComponent = mw_require("./vlw-tl-queue-display.vue");
  $app = Vue.createMwApp(appComponent, {
    onRefresh() {
      populate(true);
    },
  }).use(pinia);
  $app.mount("#" + containerId);
  $store = mw_require("./vlw-tl-queue-display-store.js")();
  $app.provide("store", $store);
}

async function populate(noCacheMode: boolean): Promise<void> {
  await Promise.all(
    [false, true].map(async function (forThirdParty) {
      $store!.setIsLoading(forThirdParty, true);
      $store!.setIsError(forThirdParty, false);
      try {
        const res = await getListOfTranslations(noCacheMode, forThirdParty);
        $store!.setItems(forThirdParty, res);
      } catch (error) {
        $store!.setIsLoading(forThirdParty, true);
        console.error(DEBUGGING_ID, error);
      } finally {
        $store!.setIsLoading(forThirdParty, false);
      }
    }),
  );
}

// =================
//   Run
// =================
init();
// mw.hook('wikipage.content') fires several times each page (e.g. refreshing recent changes queue)
//! </pre>