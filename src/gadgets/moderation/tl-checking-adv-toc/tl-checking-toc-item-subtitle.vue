<template>
  <span class="tl-item-subtitle">
    <span class="tl-author">
      <cdx-info-chip
        class="official-tl"
        v-if="isOfficial"
      >
        {{ $i18n("tl-adv-toc--official") }}
      </cdx-info-chip>
      <template v-else>
        {{ tlAuthor }}
        <cdx-info-chip
          class="third-party"
          v-if="isThirdParty"
        >
          {{ $i18n("tl-adv-toc--third-party-note") }}
        </cdx-info-chip>
      </template>
    </span>
    <span
      class="tl-outcome"
      v-if="outcome"
    >
      {{ getTlStatusIcon }}
      <span
        class="tl-comments"
        v-if="comments"
      >
        {{ comments }}
      </span>
    </span>
  </span>
</template>

<script lang="ts">
import type { TlCheckingParsedQueueItem, OutcomeEnum } from "./types.ts";

const { CdxInfoChip } = mw_require("@wikimedia/codex");

export default {
  props: [
    "tlAuthor",
    "outcome",
    "comments",
    "isThirdParty",
    "isOfficial",
    /* Unused */
    "originalTitle",
    "songAuthor",
    "link",
  ] satisfies (keyof TlCheckingParsedQueueItem)[],
  setup(_props: TlCheckingParsedQueueItem) {},
  components: { CdxInfoChip },
  computed: {
    getTlStatusIcon() {
      switch (this.outcome as OutcomeEnum) {
        case "approved":
          return "✅";
        case "rejected":
          return "❌";
        case "pending":
          return "⏳";
      }
      return null;
    },
  },
};
</script>