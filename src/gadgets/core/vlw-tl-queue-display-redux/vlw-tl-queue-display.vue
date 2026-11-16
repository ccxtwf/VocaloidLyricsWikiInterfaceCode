<template>
  <div class="title">
    {{ $i18n("vlw-tl-queue--heading").text() }}
  </div>
  <div class="body">
    <tl-queue-sections
      heading-message-name="vlw-tl-queue--first-party-section"
      :link-to-page="firstPartyTlCheckingPage"
      :ex-i="1"
      store-key="firstParty"
    ></tl-queue-sections>
    <tl-queue-sections
      heading-message-name="vlw-tl-queue--third-party-section"
      :link-to-page="thirdPartyTlCheckingPage"
      :ex-i="3"
      store-key="thirdParty"
    ></tl-queue-sections>
  </div>
  <tl-queue-more-actions @refresh="onRefresh" />
</template>

<script lang="ts">
const { TL_CHECKING_PAGE_NAME, TL_CHECKING_PAGE_NAME_THIRD } = mw_require(
  "./vlw-tl-queue-display-config.js",
);
import type { TlAppProps } from "./types.ts";

const TlQueueSections = mw_require("./vlw-tl-queue-sections.vue");
const TlQueueMoreActions = mw_require("./vlw-tl-queue-more-actions.vue");

export default {
  name: "TlQueueDisplay",
  props: {
    onRefresh: {
      type: Function,
      required: true,
    },
  },
  setup(_props: TlAppProps) {},
  components: {
    TlQueueSections,
    TlQueueMoreActions,
  },
  computed: {
    firstPartyTlCheckingPage() {
      return mw.util.getUrl(TL_CHECKING_PAGE_NAME);
    },
    thirdPartyTlCheckingPage() {
      return mw.util.getUrl(TL_CHECKING_PAGE_NAME_THIRD);
    },
  },
};
</script>