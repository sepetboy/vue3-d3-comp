export default {
  name: "实时病毒热报", // 插件中文名称
  tagName: "realTimeVirus", // 插件注册名称 必须英文 且唯一
  thumbnail: {
    // 插件缩略图
    type: "text", // text ｜ image
    value: "实时病毒热报",
  },
  config: {
    // 插件表单配置  参考dcp表单配置
    setters: {
      msg: {
        _label: "输入框",
        _comp: "dcpInput",
        _placeholder: "带输入建议文本的输入框",
      },
    },
    // 插件属性配置
    props: [
      {
        key: "isShow",
        label: "是否显示",
        type: ["boolean"],
        defaultValue: true,
      },
    ],
    // 插件事件配置
    events: [
      {
        key: "click",
        label: "单击事件",
        parameters: ["eventTarget", "event", "animeEngine"],
        defaultValue: "",
      },
    ],
  },
  // 插件初始化数据
  initData: {
    // 插件默认大小
    size: [383, 874],
    // 插件默认属性
    props: {
      msg: "hello world",
    },
  },
};
