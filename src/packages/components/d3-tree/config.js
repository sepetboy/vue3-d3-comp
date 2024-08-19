export default {
  name: "指标树", // 插件中文名称
  tagName: "indicator-tree", // 插件注册名称 必须英文 且唯一
  thumbnail: {
    // 插件缩略图
    type: "text", // text ｜ image
    value: "指标树",
  },
  config: {
    // 插件表单配置  参考dcp表单配置
    setters: {
    },
    // 插件属性配置
    props: [
      {
        key: "list",
        label: "数据",
        type: ["array"],
        defaultValue: [],
      },
      {
        key: "options",
        label: "配置项",
        type: ["object"],
        defaultValue: {},
      }
    ],
    // 插件事件配置
    events: [
      {
        key: "click",
        label: "单击事件",
        parameters: ["data"],
        defaultValue: "",
      },
    ],
  },
  // 插件初始化数据
  initData: {
    // 插件默认大小
    size: [1920, 830],
    // 插件默认属性
    props: {
    },
  },
};
