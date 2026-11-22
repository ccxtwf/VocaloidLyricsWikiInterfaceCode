<template>
  <div class="tl-queue-sections">
    <a
      class="heading"
      :href="linkToPage"
      :title="$i18n('vlw-tl-queue--go-to-tl-page').text()"
      target="_blank"
      rel="nofollow noindex"
    >
      {{ $i18n(headingMessageName).text() }}
    </a>
    <cdx-progress-indicator
      show-label
      v-if="isLoading"
    >
      {{ $i18n("vlw-tl-queue--loading").text() }}
    </cdx-progress-indicator>
    <div
      class="error"
      v-else-if="isError"
    >
      {{ $i18n("vlw-tl-queue--error").text() }}
    </div>
    <div
      class="tl-queue-items"
      v-else
    >
      <tl-queue-section
        heading-message-name="vlw-tl-queue--heading-in-queue"
        :store="onQueueTls"
        :ex-i="exI"
      ></tl-queue-section>
      <tl-queue-section
        heading-message-name="vlw-tl-queue--heading-resolved"
        :store="resolvedTls"
        :ex-i="exI + 1"
        :do-not-show-load-more="true"
      ></tl-queue-section>
    </div>
  </div>
</template>

<script lang="ts">
import type { AppPiniaStore, TlQueueSectionsProps } from "./types.ts";

const { inject } = mw_require("vue");
const { CdxProgressIndicator } = mw_require("@wikimedia/codex");
const TlQueueSection = mw_require("./vlw-tl-queue-section.vue");

export default {
  name: "TlQueueSections",
  props: [
    "headingMessageName",
    "linkToPage",
    "storeKey",
    "exI",
  ] satisfies (keyof TlQueueSectionsProps)[],
  setup(_props: TlQueueSectionsProps) {
    const globalStore: AppPiniaStore = inject("store")!;
    return { globalStore };
  },
  components: {
    CdxProgressIndicator,
    TlQueueSection,
  },
  computed: {
    store() {
      return this.globalStore[this.storeKey];
    },
    onQueueTls() {
      return (this.store.data || {}).onq || [];
    },
    resolvedTls() {
      return (this.store.data || {}).res || [];
    },
    isLoading() {
      return this.store.isLoading;
    },
    isError() {
      return this.store.isError;
    },
  },
};
</script>