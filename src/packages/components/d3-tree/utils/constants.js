import blue2 from '../assets/indicator-tree/full-screen/blue-2.svg'
/**
 * box可以通配，也可以针对不同的depth进行配置，如
 * box: {
      0: {
        width: 218,
        height: 128,
        type: "image",
        url: "file:///C:/Users/Administrator/AppData/Roaming/LanxinSoftCustom/LxResource/Docs/2024-08/all%E5%88%87%E5%9B%BE/%E5%88%87%E5%9B%BE/%E5%A4%A7BG-%E6%A9%99.svg",
        urlActive: '',
      },
      1: {
        width: 183,
        height: 105,
        type: "image",
        url: "file:///C:/Users/Administrator/AppData/Roaming/LanxinSoftCustom/LxResource/Docs/2024-08/all%E5%88%87%E5%9B%BE/%E5%88%87%E5%9B%BE/%E5%A4%A7BG-%E6%A9%99.svg",
        urlActive: '',
      },
      2: {
        width: 82,
        height: 226,
        type: "rect",
        fill: "#073a5e",
        fillActive: "#88EAFE",
        strokeDasharray: "",
      },
      3: {
        r: 71,
        type: "circle",
        fill: "#073a5e",
        strokeDasharray: "5,2",
        fillActive: "#88EAFE",
      },
    },
    属性名都一致
 */
export const defaultOptions = {
  el:'body',
  tooltipEL:'#tooltip',
  depthLimit: 4,
  showTooltip: true,
  fixedPosition: false,
  toggle: true,//默认选中节点，再次选中相同节点是取消选中
  box: {
    width: 82,
    height: 120,
    type: "rect",
    fill: "#073a5e",
    fillActive: "#88EAFE",
    strokeDasharray: "",
  }
};
export const defaultEncode = {
  id: 'id',
  name: 'name',
  parentId: 'parentId',
  parentName: 'parentName'
};

export const textFontSize = 20
export const defaultR = 50//默认半径
export const DEFAULT_NODE_IMAGE = blue2
export const DEFAULT_NODE_FILL = '#3896CF'
export const CHILD_TYPE = {
  NEW_ADD: 'add',
  INIT: 'init',
  NONE: 'none'
}
export const DEFAULT_NODE_SIZE = [74, 210]
export const BRIGHTNESS = {
  NORMAL: 'brightness(1)',
  HIGH: 'brightness(2)'
}