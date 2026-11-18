<template>
  <div class="more-actions">
    <a
      id="icon-refresh"
      :title="$i18n('vlw-tl-queue--reload-prompt-tooltip').text()"
      @click="onClickRefresh"
    >
      <cdx-icon :icon="cdxIconReload"></cdx-icon
      ><span class="label">
        {{ $i18n("vlw-tl-queue--reload-prompt").text() }}
      </span>
    </a>
  </div>
</template>

<script lang="ts">
const { CdxIcon } = mw_require("@wikimedia/codex");
const { cdxIconReload } = mw_require("./icons.json");

export default {
  name: "TlQueueMoreActions",
  setup() {
    return { cdxIconReload };
  },
  components: { CdxIcon },
  methods: {
    onClickRefresh() {
      this.$emit("refresh");
    },
  },
};
</script>