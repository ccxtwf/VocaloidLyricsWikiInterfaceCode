<template>
  <div
    class="tl-checking-item"
    v-if="subitems.length < 2"
  >
    <a
      :href="subitems[0].link"
      :target="isCrossPage(subitems[0].isThirdParty) ? '_blank' : ''"
      rel="noreferrer nofollow"
    >
      <span class="song-title">{{ originalTitle }}</span>
      <span class="song-author">{{ songAuthor }}</span>
      <tl-checking-item-subtitle v-bind="subitems[0]"></tl-checking-item-subtitle>
    </a>
  </div>
  <details
    class="tl-checking-item-group"
    v-else
  >
    <summary>
      <span class="song-title">{{ originalTitle }}</span>
      <span class="song-author">{{ songAuthor }}</span>
      <cdx-info-chip
        v-if="subitems.length"
        class="item-group-count"
      >
        {{ $i18n("tl-adv-toc--multi-note", subitems.length) }}
      </cdx-info-chip>
    </summary>
    <ul>
      <li v-for="subitem in subitems">
        <a
          :href="subitem.link"
          :target="isCrossPage(subitem.isThirdParty) ? '_blank' : ''"
          rel="noreferrer nofollow"
        >
          <tl-checking-item-subtitle v-bind="subitem"></tl-checking-item-subtitle>
        </a>
      </li>
    </ul>
  </details>
</template>

<script lang="ts">
import type { TlCheckingTocItemGroup, OnPageEnum } from "./types.ts";

const { inject } = mw_require("vue");
const { CdxInfoChip } = mw_require("@wikimedia/codex");
const TlCheckingItemSubtitle = mw_require("./tl-checking-toc-item-subtitle.vue");

export default {
  name: "TlCheckingAdvTocItem",
  components: { CdxInfoChip, TlCheckingItemSubtitle },
  props: ["originalTitle", "songAuthor", "subitems"] satisfies (keyof TlCheckingTocItemGroup)[],
  setup(_props: TlCheckingTocItemGroup) {
    const onPage: OnPageEnum = inject("onPage");
    return { onPage };
  },
  methods: {
    isCrossPage(isThirdParty: boolean) {
      return Boolean(this.onPage) !== isThirdParty;
    },
  },
};
</script>