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
      <div :class="iconCssClass"></div>
      <div class="tl-check-req-producer">
        {{ songAuthor || "" }}
      </div>
      <div class="tl-check-req-author">
        {{ tlAuthor || "" }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { TlCheckingParsedQueueItem } from "./types.ts";

export default {
  props: [
    "originalTitle",
    "songAuthor",
    "tlAuthor",
    "link",
    "outcome",
  ] satisfies (keyof TlCheckingParsedQueueItem)[],
  setup: (_props: TlCheckingParsedQueueItem) => {},
  computed: {
    iconCssClass() {
      return this.outcome ? "tl-check-req-" + this.outcome : "";
    },
  },
};
</script>