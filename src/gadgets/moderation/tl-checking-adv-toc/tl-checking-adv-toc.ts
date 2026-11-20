import { AppPiniaStore, TlCheckingParsedQueueItem } from "./types.ts";
import { parseTlCheckingTocData } from "../../../utils/tl-checking-utils.ts";

let $store: AppPiniaStore;

const Vue = mw_require("vue");
const Pinia = mw_require("pinia");
const pinia = Pinia.createPinia();

const ALLOWED_PAGES = [
  "Help_talk:Translation_Checking",
  "Help_talk:Translation_Checking/Third-Party",
];
const TOC_SELECTOR = "toc";
const DEBUGGING_ID = "[tl-checking-adv-toc]";

const messages = {
  "tl-adv-toc--filter-source-button-label": "Filter by Translation Source",
  "tl-adv-toc--filter-status-button-label": "Filter by Status",
  "tl-adv-toc--collapse-all-button-label": "Collapse All",
  "tl-adv-toc--expand-all-button-label": "Expand All",
  "tl-adv-toc--first-party": "First Party",
  "tl-adv-toc--third-party": "Third Party",
  "tl-adv-toc--official": "Official",
  "tl-adv-toc--checked": "Checked",
  "tl-adv-toc--unchecked": "Unchecked",
  "tl-adv-toc--all": "All",
  "tl-adv-toc--third-party-note": "3rd",
  "tl-adv-toc--multi-note": "MULTI ($1)",
  "tl-adv-toc--loading": "Loading...",
  "tl-adv-toc--no-data": "No data was found.",
  "tl-adv-toc--failed-to-fetch":
    "Translation Checking: Failed to fetch data for the Table of Contents.",
};
mw.messages.set(messages);

(function (mw) {
  async function fetchAndParsePage(
    api: mw.Api,
    page: string,
    isThirdParty: boolean,
  ): Promise<TlCheckingParsedQueueItem[]> {
    const f = await api
      .get({
        action: "parse",
        page,
        prop: "tocdata",
        format: "json",
      })
      .promise();
    if (!f.parse || !f.parse.tocdata || !f.parse.tocdata.sections) {
      throw new Error("Got unexpected response from the MediaWiki API");
    }
    return parseTlCheckingTocData(f, isThirdParty);
  }

  async function fetchData(): Promise<TlCheckingParsedQueueItem[][]> {
    try {
      const api = new mw.Api();
      const waitFor = await Promise.all(
        ALLOWED_PAGES.map((page, idx) => fetchAndParsePage(api, page, idx > 0)),
      );
      return waitFor;
    } catch (err) {
      mw.notify(mw.msg("tl-adv-toc--failed-to-fetch"), { type: "error" });
      console.error(
        DEBUGGING_ID,
        "Failed to fetch tl checking data with the following error:",
        err,
      );
      throw err;
    }
  }

  function createApp(): void {
    try {
      const TlCheckingAdvToc = mw_require("./tl-checking-adv-toc.vue");
      const vueAppContainer = document.createElement("div");
      vueAppContainer.classList.add("tl-checking-toc-container");
      document.getElementById(TOC_SELECTOR)!.querySelector("ul")!.remove();
      document.getElementById(TOC_SELECTOR)!.appendChild(vueAppContainer);
      Vue.createMwApp(TlCheckingAdvToc).use(pinia).mount(vueAppContainer);
      $store = mw_require("./tl-checking-adv-toc-store.js")();
    } catch (err) {
      console.error(DEBUGGING_ID, "Failed to create Vue app");
      console.error(DEBUGGING_ID, err);
      throw err;
    }
  }

  async function init() {
    try {
      createApp();
      $store.isLoading = true;
      const data = await fetchData();
      $store.setItems(data[0], data[1]);
      if (DEBUG) {
        mw.libs = mw.libs || {};
        (mw.libs as any).tlCheckingStore = $store;
      }
    } catch (err) {
      console.error(DEBUGGING_ID, "Failed to initialize");
      console.error(DEBUGGING_ID, err);
      if ($store) $store.isError = false;
    } finally {
      if ($store) $store.isLoading = false;
    }
  }

  if (ALLOWED_PAGES.indexOf(mw.config.get("wgPageName")) < 0) {
    return;
  }
  init();
})(mediaWiki);