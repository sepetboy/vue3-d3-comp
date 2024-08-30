<template>
  <div class="preview-doc" ref="docRef"></div>
</template>

<script>
import { defineComponent, ref, onMounted } from "@vue/composition-api";
import axios from "axios";
import { renderAsync } from "docx-preview";
// const wordPath = new URL("../mock/test.doc", import.meta.url).href; //TODO 换成真实的url
export default defineComponent({
  props: {
    fileUrl: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    const docRef = ref(null);
    onMounted(() => {
      axios({
        method: "get",
        url: props.fileUrl,
        responseType: "blob",
      }).then((res) => {
        const blob = new Blob([res.data], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
        renderAsync(blob, docRef.value);
      });
    });
    return {
      docRef,
    };
  },
});
</script>

<style lang="scss" scoped>
.preview-doc {
  width: 100%;
  height: 100%;
  overflow: auto;
}
</style>
