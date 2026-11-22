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
  name: "NsfwModal",
  props: ["store", "onClickedConfirm", "onClickedBack"] satisfies (keyof NsfwModalProps)[],
  components: { CdxCheckbox },
  setup(_props: NsfwModalProps) {},
};
</script>