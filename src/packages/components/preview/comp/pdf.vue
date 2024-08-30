<template>
  <div id="my-pdf"></div>
</template>

<script>
import { defineComponent, onMounted, nextTick } from "@vue/composition-api";
import PDFObject from "@/utils/pdfobject.js";
// const pdfPath = new URL("../mock/ming-chao.pdf", import.meta.url).href; //TODO 换成真实的url

export default defineComponent({
  props: {
    fileUrl: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    onMounted(() => {
      nextTick(() => {
        PDFObject.embed(props.fileUrl, "#my-pdf");
      });
    });
  },
});
</script>

<style lang="scss" scoped>
#my-pdf {
  width: 100%;
  height: 100%;
}
</style>
