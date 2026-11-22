<template>
  <div class="subheading">
    {{ $i18n(headingMessageName).text() }}
  </div>
  <div v-if="isEmpty">
    <i>{{ $i18n("vlw-tl-queue--no-items").text() }}</i>
  </div>
  <template v-else>
    <tl-queue-item
      v-for="(item, _idx) in renderedData"
      v-bind="item"
    ></tl-queue-item>
  </template>
  <div v-if="!doNotShowLoadMore && !isEmpty">
    <a
      class="toggle"
      @click="onClickExpand"
    >
      {{ $i18n(isExpanded ? "vlw-tl-queue--collapse" : "vlw-tl-queue--expand").text() }}
    </a>
  </div>
</template>

<script lang="ts">
import type { AppPiniaStore, TlQueueSectionProps } from "./types.ts";

const { inject } = mw_require("vue");
const { SHOW_NUMBER_OF_ITEMS_AT_START, SHOW_MAX_NUMBER_OF_ITEMS } = mw_require(
  "./vlw-tl-queue-display-config.js",
);
const TlQueueItem = mw_require("./vlw-tl-queue-item.vue");

export default {
  name: "TlQueueSection",
  props: [
    "headingMessageName",
    "exI",
    "doNotShowLoadMore",
    "store",
  ] satisfies (keyof TlQueueSectionProps)[],
  setup(_props: TlQueueSectionProps) {
    const globalStore: AppPiniaStore = inject("store")!;
    return { globalStore };
  },
  components: { TlQueueItem },
  computed: {
    isExpanded() {
      return this.globalStore.isExpanded === this.exI;
    },
    isEmpty() {
      return !this.store || this.store.length === 0;
    },
    renderedData() {
      return (this.store || []).slice(
        0,
        this.isExpanded ? SHOW_MAX_NUMBER_OF_ITEMS : SHOW_NUMBER_OF_ITEMS_AT_START,
      );
    },
  },
  methods: {
    onClickExpand() {
      this.globalStore.isExpanded = this.isExpanded ? 0 : this.exI;
    },
  },
};
</script>