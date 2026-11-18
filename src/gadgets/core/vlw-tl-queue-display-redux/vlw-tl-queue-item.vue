<template>
  <div class="tl-queue-item">
    <a
      class="tl-check-req-title"
      :href="link"
      target="_blank"
      rel="nofollow noindex"
    >
      {{ originalTitle }}
    </a>
    <div class="tl-check-req-subtitle">
      <cdx-icon
        :icon="outcomeIcon"
        :class="iconCssClass"
        size="8"
      ></cdx-icon>
      <div class="tl-check-req-producer">
        {{ songAuthor || "" }}
      </div>
      <div class="tl-check-req-author">
        <cdx-icon
          :icon="cdxIconEdit"
          size="6"
        ></cdx-icon>
        {{ tlAuthor || "" }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { TlCheckingParsedQueueItem } from "./types.ts";
const { CdxIcon } = mw_require("@wikimedia/codex");
const { cdxIconEdit, cdxIconCheck, cdxIconClose, cdxIconHelp } = mw_require("./icons.json");

export default {
  props: [
    "originalTitle",
    "songAuthor",
    "tlAuthor",
    "link",
    "outcome",
  ] satisfies (keyof TlCheckingParsedQueueItem)[],
  setup: (_props: TlCheckingParsedQueueItem) => ({
    cdxIconEdit,
    cdxIconCheck,
    cdxIconClose,
    cdxIconHelp,
  }),
  components: { CdxIcon },
  computed: {
    outcomeIcon() {
      switch ((this as TlCheckingParsedQueueItem).outcome) {
        case "approved":
          return this.cdxIconCheck;
        case "rejected":
          return this.cdxIconClose;
        case "pending":
          return this.cdxIconHelp;
      }
      return null;
    },
    iconCssClass() {
      return this.outcome ? "tl-check-req-" + this.outcome : "";
    },
  },
};
</script>