<template>
  <div id="lyrics-editor-modal">
    <cdx-dialog
      v-model:open="isOpen"
      :title="$i18n('vlw-lyrics-editor--menu-prompt').plain()"
      :use-close-button="true"
      :primary-action="primaryAction"
      :default-action="defaultAction"
      @primary="clickedSave"
      @default="closeModal"
    >
      <div class="table-selector">
        <div>{{ $i18n("vlw-lyrics-editor--found-n-tables") }}</div>
        <cdx-field>
          <cdx-select
            v-model:selected="selected"
            :menu-items="menu - items"
            default-label=""
          >
          </cdx-select>
          <template #label>
            {{ $i18n("vlw-lyrics-editor--select-table") }}
          </template>
        </cdx-field>
      </div>
      <div class="handsontable-container"></div>
      <template #footer-text>
        {{ $i18n("vlw-lyrics-editor--report-message") }}
      </template>
    </cdx-dialog>
  </div>
</template>

<script lang="ts">
// import type { IAppStore } from "./types.ts";

// interface NsfwModalProps {
//   store: IAppStore;
//   onClickedConfirm: () => void;
//   onClickedBack: () => void;
// }

const { ref } = mw_require("vue");
const { CdxDialog, CdxButton, CdxSelect, CdxField } = mw_require("@wikimedia/codex");

export default {
  name: "LyricsEditor",
  props: [],
  components: { CdxDialog, CdxButton, CdxSelect, CdxField },
  setup() {
    const isOpen = ref(false);
    const selected = ref(0);
    const primaryAction = {
      label: mw.msg("vlw-lyrics-editor--confirm-button-text"),
      actionType: "progressive",
    } as const;
    const defaultAction = { label: mw.msg("vlw-lyrics-editor--cancel-button-text") } as const;
    return { isOpen, selected, primaryAction, defaultAction };
  },
  methods: {
    closeModal() {
      this.isOpen = false;
    },
    showModal() {
      this.isOpen = true;
    },
    clickedSave() {
      this.$emit("editedLyricsTable");
    },
    setupHandsontable() {},
  },
};
</script>