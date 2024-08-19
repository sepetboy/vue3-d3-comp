<template>
  <div class="indicator-tree">
    <div id="tooltip" class="tooltip" v-if="options.showTooltip && showTooltip && (tooltipInfo.name || tooltipInfo.description)">
      <div class="tooltip-title" :title="tooltipInfo.name">{{ tooltipInfo.name }}</div>
      <div class="tooltip-content" :title="tooltipInfo.description">{{ tooltipInfo.description }}</div>
      <div class="close" @click="handleClose"></div>
    </div>
    <!-- <div class="indicator-tree-loading" v-if="loading">加载中...</div> -->
    <vui-loading v-if="loading"></vui-loading>
  </div>
</template>
<script>
import { fullOptions } from "./options.js";
import { VerticalD3TreeGraph } from "@/utils/index";

export default {
  props: {
    list: {
      type: Array,
      default: () => [],
    },
    options: {
      type: Object,
      default: () => fullOptions, // 默认配置
    },
    highlights: {
      type: Array,
      default: () => [],
    },
    handleClickNode: {
      type: Function,
      default: () => () => {},
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      graph: null,
      tooltipInfo: {
        description: "",
        name: "",
      },
      images: [],
      showTooltip: true
    };
  },
  methods: {
    buildTree(data, parentId = null) {
      let branch = [];
      data.forEach((item) => {
        if (item.parent_indicator_id === parentId) {
          // 找到子节点
          const children = this.buildTree(data, item.indicator_id);
          // 如果子节点存在，则添加到当前节点的children属性中
          if (children.length) {
            item.children = children;
          }
          // 将当前节点添加到分支中
          branch.push(item);
        }
      });
      return branch;
    },
    graphRender() {
      const _this = this
      if(!Array.isArray(this.list) || this.list.length == 0) return 
      const tree = this.buildTree(this.list);
      console.log("tree", tree);
      this.graph = new VerticalD3TreeGraph({
        source: tree[0],
        options: {
          ...this.options,
          onClick: async function (d, flag) {
            if(_this.options.showTooltip) {
              const { description, indicator_alias_name } = d.data;
              if(flag) {
                _this.tooltipInfo = {
                  description,
                  name: indicator_alias_name,
                };
                _this.showTooltip = true
              } else {
                _this.tooltipInfo = {
                  description: "",
                  name: "",
                };
                _this.showTooltip = false
              }
            }
            _this.$emit("clickNode", d.data);

            if (typeof _this.handleClickNode === "function") {
              return _this.handleClickNode(d);
            }
          },
        },
        encode: {
          id: "indicator_id",
          name: "indicator_alias_name",
          parentId: "parent_indicator_id",
          parentName: "parent_indicator_name",
          count: "cal_result.cal_result",
        },
      });
      this.graph.render(this.highlights);
    },
    handleClose() {
      this.showTooltip = false
    }
  },
  beforeDestroy(){
    this.graph.destory()
  },
  watch: {
    list: {
      handler() {
        this.graphRender()
      }
    }
  },
};
</script>
<style lang="less" scoped>
.indicator-tree {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  .tooltip {
    position: absolute;
    top: 20px;
    right: 20px;
    padding: 16px 36px 4px;
    width: 352px;
    height: 238px;
    opacity: 1;
    background: url("@/assets/indicator-tree/tooltip.svg") no-repeat;
    background-size: contain;
    &-title {
      width: 100%;
      height: 40px;
      line-height: 40px;
      text-align: center;
      font-size: 24px;
      color: #fff;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    &-content {
      height: 160px;
      margin-top: 8px;
      font-size: 22px;
      color: #a1d4ff;
      overflow: hidden;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 5;
      word-break: break-word;
    }
    .close {
      position: absolute;
      background-image: url(@/assets/govern-effect/modal-close.svg);
      width: 32px;
      height: 32px;
      top: 20px;
      right: 16px;
      cursor: pointer;
    }
  }
  /deep/ .vui-loading__full, .vui-loading__maskall {
    position: absolute;
  }
}
</style>
