<template>
  <div class="more-actions">
    <a
      id="icon-refresh"
      :title="$i18n('vlw-tl-queue--reload-prompt-tooltip').text()"
      @click="onClickRefresh"
    >
      <img src="https://upload.wikimedia.org/wikipedia/commons/c/ce/Ic_refresh_48px.svg" />
      <span class="label">
        {{ $i18n("vlw-tl-queue--reload-prompt").text() }}
      </span>
    </a>
  </div>
</template>

<script lang="ts">
export default {
  name: "TlQueueMoreActions",
  setup() {},
  methods: {
    onClickRefresh() {
      this.$emit("refresh");
    },
  },
};
</script>