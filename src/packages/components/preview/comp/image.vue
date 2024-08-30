<template>
  <div class="preview-image">
    <img :src="fileUrl" />
  </div>
</template>

<script>
import { defineComponent } from "@vue/composition-api";

export default defineComponent({
  props: {
    fileUrl: {
      type: String,
      default: "",
    },
  },
  setup() {},
});
</script>

<style lang="scss" scoped>
.preview-image {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #000 !important;
}
</style>
