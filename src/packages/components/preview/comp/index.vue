<template>
  <component
    class="preview-file"
    :is="dynamicsComponent"
    :fileUrl="fileUrl"
  ></component>
</template>

<script>
import { defineComponent, ref } from "@vue/composition-api";
import PDF from "./pdf.vue";
import WORD from "./word.vue";
import EXCEL from "./excel.vue";
import PreviewImage from "./image.vue";
import { ParseFileEnum } from "@/constants";

export default defineComponent({
  setup() {
    const fileInfo = JSON.parse(localStorage.getItem("parseFileInfo"));
    console.log("fileInfo", fileInfo);
    const { file_type = "", file_url = "" } = fileInfo || {};
    let dynamicsComponent = ref(null);
    if (ParseFileEnum.PDF.includes(file_type)) {
      dynamicsComponent = PDF;
    } else if (ParseFileEnum.WORD.includes(file_type)) {
      dynamicsComponent = WORD;
    } else if (ParseFileEnum.EXCEL.includes(file_type)) {
      dynamicsComponent = EXCEL;
    } else if (ParseFileEnum.IMAGE.includes(file_type)) {
      dynamicsComponent = PreviewImage;
    }

    return {
      dynamicsComponent,
      fileUrl: ref(file_url),
    };
  },
});
</script>

<style lang="scss" scoped>
.preview-file {
  background: #fff;
}
</style>
