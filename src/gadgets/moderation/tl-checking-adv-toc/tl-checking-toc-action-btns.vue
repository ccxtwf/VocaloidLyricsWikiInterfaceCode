<template>
  <div class="action-buttons">
    <div>
      <cdx-field>
        <template #label>{{ $i18n("tl-adv-toc--filter-source-button-label") }}</template>
        <cdx-toggle-button-group
          v-model="store.sourceMode"
          :buttons="buttons1"
        ></cdx-toggle-button-group>
      </cdx-field>
      <cdx-field>
        <template #label>{{ $i18n("tl-adv-toc--filter-status-button-label") }}</template>
        <cdx-toggle-button-group
          v-model="store.statusMode"
          :buttons="buttons2"
        ></cdx-toggle-button-group>
      </cdx-field>
    </div>
    <cdx-field>
      <template #label></template>
      <cdx-toggle-button
        v-model="areAllItemsExpanded"
        @click="onClickedExpand"
      >
        {{
          $i18n(
            areAllItemsExpanded
              ? "tl-adv-toc--collapse-all-button-label"
              : "tl-adv-toc--expand-all-button-label",
          )
        }}
      </cdx-toggle-button>
    </cdx-field>
  </div>
</template>

<script lang="ts">
import type { AppPiniaStore } from "./types";

const { ref, inject } = mw_require("vue");
const { CdxField, CdxToggleButton, CdxToggleButtonGroup } = mw_require("@wikimedia/codex");

const buttons1 = [
  { value: 1, label: mw.msg("tl-adv-toc--first-party") },
  { value: 2, label: mw.msg("tl-adv-toc--third-party") },
  { value: 3, label: mw.msg("tl-adv-toc--official") },
  { value: 0, label: mw.msg("tl-adv-toc--all") },
];
const buttons2 = [
  { value: 1, label: mw.msg("tl-adv-toc--checked") },
  { value: 2, label: mw.msg("tl-adv-toc--unchecked") },
  { value: 0, label: mw.msg("tl-adv-toc--all") },
];

export default {
  name: "TlCheckingTocActionButtons",
  components: { CdxField, CdxToggleButton, CdxToggleButtonGroup },
  setup() {
    const store: AppPiniaStore = inject("store");
    const areAllItemsExpanded = ref(false);
    return { buttons1, buttons2, store, areAllItemsExpanded };
  },
  methods: {
    onClickedExpand() {
      this.$emit("expandAll", this.areAllItemsExpanded);
    },
  },
};
</script>