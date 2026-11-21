<template>
  <toc-action-buttons @expand-all="expandOrCollapseAll"></toc-action-buttons>
  <cdx-progress-bar
    :aria-label="$i18n('tl-adv-toc--loading')"
    :max="100"
    v-if="store.isLoading"
  ></cdx-progress-bar>
  <div
    class="tl-checking-error"
    v-else-if="store.isError"
  >
    {{ $i18n("tl-adv-toc--failed-to-fetch") }}
  </div>
  <div
    v-else-if="!store.shown.length"
    class="tl-checking-error"
  >
    {{ $i18n("tl-adv-toc--no-data") }}
  </div>
  <div
    class="tl-checking-items"
    v-else
  >
    <tl-checking-item
      v-for="item in store.shown"
      v-bind="item"
    ></tl-checking-item>
  </div>
</template>

<script lang="ts">
import { AppPiniaStore } from "./types.ts";
const { CdxProgressBar } = mw_require("@wikimedia/codex");

const { inject } = mw_require("vue");
const TocActionButtons = mw_require("./tl-checking-toc-action-btns.vue");
const TlCheckingItem = mw_require("./tl-checking-toc-item.vue");

export default {
  name: "TlCheckingAdvToc",
  components: { CdxProgressBar, TocActionButtons, TlCheckingItem },
  setup() {
    const store: AppPiniaStore = inject("store");
    return { store };
  },
  methods: {
    expandOrCollapseAll(expandAll: boolean) {
      document
        .querySelectorAll(".tl-checking-items details")
        .forEach(expandAll ? (e) => e.setAttribute("open", "") : (e) => e.removeAttribute("open"));
    },
  },
};
</script>