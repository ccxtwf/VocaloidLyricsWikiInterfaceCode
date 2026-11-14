<template>
  <div id="cw-modal">
    <div id="cw-modal-box-wrapper">
      <div id="cw-modal-box">
        <div id="cw-heading">
          {{ $i18n("vlw-nsfw-modal--cw-heading").text() }}
        </div>
        <div id="cw-subheading">
          {{ $i18n("vlw-nsfw-modal--cw-subheading").text() }}
        </div>
        <div id="cw-action-buttons">
          <button
            id="cw-confirm"
            type="button"
            class="cw-action-button"
            @click="onClickedConfirm"
          >
            {{ $i18n("vlw-nsfw-modal--cw-confirm").text() }}
          </button>
          <button
            id="cw-back"
            type="button"
            class="cw-action-button"
            @click="onClickedBack"
          >
            {{ $i18n("vlw-nsfw-modal--cw-back").text() }}
          </button>
        </div>
        <div id="cw-more-actions">
          <cdx-checkbox v-model="store.doNotShowMoreWarnings">
            {{ $i18n("vlw-nsfw-modal--do-not-show").text() }}
          </cdx-checkbox>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { IAppStore } from "./types.ts";

interface NsfwModalProps {
  store: IAppStore;
  onClickedConfirm: () => void;
  onClickedBack: () => void;
}

const { CdxCheckbox } = mw_require("@wikimedia/codex");

export default {
  name: "DialogBasic",
  props: {
    store: {
      type: Object,
      required: true,
    },
    onClickedConfirm: {
      type: Function,
      required: true,
    },
    onClickedBack: {
      type: Function,
      required: true,
    },
  },
  components: { CdxCheckbox },
  setup({ store, onClickedConfirm, onClickedBack }: NsfwModalProps) {
    return { store, onClickedConfirm, onClickedBack };
  },
};
</script>