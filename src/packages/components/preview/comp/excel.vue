<template>
  <div class="preview-excel">
    <div class="excel-container" ref="excelRef"></div>
    <div class="button-group">
      <div
        class="button"
        :class="{ active: currentPage === index }"
        v-for="(item, index) in sheetNames"
        :key="item"
        @click="handleClick(index)"
        >{{ item }}</div
      >
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from "@vue/composition-api";
import axios from "axios";
import * as xlsx from "xlsx";
import Handsontable from "handsontable";
import "handsontable/dist/handsontable.full.min.css";
// const excelPath = new URL("../mock/test.xls", import.meta.url).href; //TODO 换成真实的url
export default defineComponent({
  props: {
    fileUrl: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    const excelRef = ref(null);
    let currentPage = ref(0);
    const sheetNames = ref([]);
    let sheets = [];
    let hot = null;
    onMounted(() => {
      axios({
        method: "get",
        url: props.fileUrl,
        responseType: "arraybuffer",
        timeout: 1000 * 60 * 60,
        onDownloadProgress: (a, b, c, d) => {
          //excel一般比较大，可以添加进度条
          console.log("进度回调", a, b, c, d);
        },
      }).then((res) => {
        const workbook = xlsx.read(res.data, { type: "array" });
        sheetNames.value = workbook.SheetNames;
        sheets = workbook.Sheets;
        initRender();
      });
    });

    function handleClick(index) {
      currentPage.value = index;
      updateRender();
    }

    function getData() {
      const sheet = sheets[sheetNames.value[currentPage.value]]; //获取第一个sheet
      const json = xlsx.utils.sheet_to_json(sheet, {
        header: 1,
      });
      return json;
    }

    function initRender() {
      const json = getData();
      hot = new Handsontable(excelRef.value, {
        data: json,
        rowHeaders: true,
        colHeaders: true,
        height: "auto",
        autoWrapRow: true,
        autoWrapCol: true,
        licenseKey: "non-commercial-and-evaluation", // for non-commercial use only
      });
      console.log("const hot", hot);
    }

    function updateRender() {
      const json = getData();
      hot.updateSettings({
        data: json,
      });
      hot.render();
    }
    return {
      excelRef,
      currentPage,
      sheetNames,
      handleClick,
    };
  },
});
</script>

<style lang="scss" scoped>
.preview-excel {
  width: 100%;
  height: 100%;
  .excel-container {
    max-height: calc(100% - 30px);
  }
  .button-group {
    display: flex;
    height: 30px;
    margin-top: 8px;
    .button {
      padding: 0 8px;
      height: 100%;
      line-height: 30px;
      text-align: center;
      background: rgba(#000, 0.56);
      color: #fff;
      margin-left: 8px;
      border-radius: 4px;
      cursor: pointer;
      &:first-child {
        margin-left: 0;
      }
      &.active {
        color: #217346;
        background: rgba(#217346, 0.2);
      }
    }
  }
}
</style>
