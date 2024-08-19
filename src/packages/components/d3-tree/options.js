import { parseImages } from "@/utils/import-image.js";
import { get } from "lodash";
const imagesContext = import.meta.glob(
  "@/assets/indicator-tree/full-screen/*",
  {
    eager: true,
  }
);
const images = parseImages(imagesContext);
const COLOR_LEVEL_MAPPING = {
  blue: "#033467",
  green: "#02664E",
  yellow: "#B47F00",
  orange: "#FF6F00",
  red: "#FF6969",
};
function getKey(d) {
  const color = get(d, "data.cal_result.color", "blue");
  return {
    urlKey: `${color}-${d.depth}`,
    fillKey: color || "blue",
  };
}
export const fullOptions = {
  el: ".indicator-tree",
  scale: false,
  depthLimit: 4,
  countRender: (d) => {
    return Math.floor(d?.data?.cal_result?.cal_result ?? 0) + "分";
  }, // 默认全局所有数据都是这个配置，TODO---可以扩展到具体某一层级进行控制
  nodeSize: [66, 210],
  showTooltip: true,
  fixedPosition: true,
  expandAndHideSiblingNodes: true, //点击更多（+12）隐藏同级子元素
  toggle: true, // 选中节点，再次选中取消选中
  box: {
    width: 82,
    height: 120,
    type: "rect",
    fill: COLOR_LEVEL_MAPPING["blue"],
    0: {
      width: 720,
      height: 100,
      type: "image",
      url: (d) => {
        // string | function
        const { urlKey } = getKey(d);
        return images[urlKey] || images["blue-0"];
      },
    },
    1: {
      width: 184,
      height: 115,
      type: "image",
      url: (d) => {
        // string | function
        const { urlKey } = getKey(d);
        return images[urlKey] || images["blue-1"];
      },
    },
    2: {
      width: 82,
      height: 160,
      type: "rect",
      fill: (d) => {
        // string | function
        const { fillKey } = getKey(d);
        return COLOR_LEVEL_MAPPING[fillKey];
      },
      fillActive: "#25B0FF",
      strokeDasharray: "",
    },
    3: {
      width: 60,
      height: 240,
      r: 71,
      type: "rect",
      fill: (d) => {
        // string | function
        const { fillKey } = getKey(d);
        return COLOR_LEVEL_MAPPING[fillKey];
      },
      strokeDasharray: "10,5",
      fillActive: "#25B0FF",
    },
  },
};

const imagesContextLeft = import.meta.glob(
  "@/assets/indicator-tree/left-screen/*",
  {
    eager: true,
  }
);
const imagesLeft = parseImages(imagesContextLeft);

export const leftOptions = {
  el: ".indicator-tree",
  scale: false,
  depthLimit: 3,
  countRender: (d) => {
    const count = Math.floor(d?.data?.cal_result?.cal_result ?? 0);
    return d.depth == 3 ? count : count + "分";
  }, // 默认全局所有数据都是这个配置，TODO---可以扩展到具体某一层级进行控制
  nodeSize: [74, 210],
  showTooltip: false,
  expandAndHideSiblingNodes: true, //点击更多（+12）隐藏同级子元素
  toggle: false, // 选中节点，再次选中不取消选中
  box: {
    width: 82,
    height: 120,
    type: "rect",
    fill: COLOR_LEVEL_MAPPING["blue"],
    0: {
      width: 218,
      height: 137,
      type: "image",
      url: (d) => {
        // string | function
        const { urlKey } = getKey(d);
        return imagesLeft[urlKey] || imagesLeft["blue-0"];
      },
    },
    1: {
      width: 184,
      height: 115,
      type: "image",
      url: (d) => {
        // string | function
        const { urlKey } = getKey(d);
        return imagesLeft[urlKey] || imagesLeft["blue-1"];
      },
    },
    2: {
      width: 82,
      height: 180,
      type: "rect",
      fill: (d) => {
        // string | function
        const { fillKey } = getKey(d);
        return COLOR_LEVEL_MAPPING[fillKey];
      },
      fillActive: "#25B0FF",
      strokeDasharray: "",
    },
    3: {
      r: 71,
      type: "circle",
      fill: (d) => {
        // string | function
        const { fillKey } = getKey(d);
        return COLOR_LEVEL_MAPPING[fillKey];
      },
      strokeDasharray: "10,5",
      fillActive: "#25B0FF",
    },
  },
};
