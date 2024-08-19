import * as d3 from "d3";
import { get, merge, throttle } from "lodash";
import {
  defaultOptions,
  defaultEncode,
  textFontSize,
  defaultR,
  DEFAULT_NODE_IMAGE,
  DEFAULT_NODE_FILL,
  CHILD_TYPE,
  DEFAULT_NODE_SIZE,
  BRIGHTNESS,
} from "./constants";
// 纵向树状图类
export class VerticalD3TreeGraph {
  /**
   *
   * @param {*} params
   */
  constructor(params) {
    const { source, options, encode } = params;
    const _this = this;
    this.baseWidth = 1920;
    this.baseHeight = 1080;
    this.actives = {}; //选中的元素
    this.highlights = []; //初始高亮的元素
    this.options = merge(defaultOptions, options);
    const el = document.querySelector(this.options.el);
    this.options.width = el.offsetWidth;
    this.options.height = el.offsetHeight;
    this.encode = merge(defaultEncode, encode);
    let nodeSize = this.options.nodeSize || DEFAULT_NODE_SIZE;
    this.clickMoreId = ""; // 当收起以后，会出现少于3个的数字，需要特殊处理
    // 布局
    this.treeLayout = d3
      .tree()
      .nodeSize(nodeSize) // TODO 如果控制不好，就从外面传吧
      // .size([this.options.height, this.options.width - 160])
      .separation(function (a, b) {
        //separation设置固定大小无用，他在按照设置的最小值作为基数，其他值计算和它的比例来呈现的。
        // let s = a.parent == b.parent ? 1.2 : 2;
        const { width = 0, type = "rect" } = _this.getBoxOptions(a.depth);
        let s = width / 61; // 与options里面的width做个比例吧
        if (type == "circle") {
          s = 2;
        }
        return s;
      });

    this.root = d3.hierarchy(source);
    this.root.each((d) => {
      if (this.getLimitStatus(d)) {
        Reflect.deleteProperty(d, "children");
      }
      if (d.depth > 0 && d.children && d.children.length > 3) {
        d._children = d.children.slice(3); // 隐藏的子节点存到 _children
        d.children = d.children.slice(0, 3); // 只保留前三个
      }
    });

    //   this.treeLayout(this.root);
    // 用来拖拽图以及扩大缩放
    let zoom = d3
      .zoom()
      .scaleExtent([0.1, 10])
      .on(
        "zoom",
        throttle((event) => {
          // 重新计算tooltip的位置
          if (_this.actives.node) {
            _this.getTooltipPosition(_this.actives.nodeDom);
          }
          _this.svgG.attr("transform", event.transform);
        }, 50)
      );
    this.svg = d3
      .select(this.options.el)
      .append("svg")
      .attr("width", this.options.width)
      .attr("height", this.options.height)
      .call(zoom)
      .on("dblclick.zoom", null);
    this.svgGTransform = this.svg
      .append("g")
      .attr("transform", `${this.generateSvgTransform()}`); // 第一个g是调整视图，居中展示
    this.svgG = this.svgGTransform.append("g"); // 第二个g标签是设置缩放和偏移，解决鼠标初次移动时抖动的问题
    // 显示tooltip且位置不固定
    if (this.options.showTooltip && !_this.options.fixedPosition) {
      this.tooltip = d3
        .select(this.options.tooltipEL)
        .style("position", "absolute")
        .style("opacity", 0);
    }

    window.addEventListener("resize", this.updateTree.bind(this));
  }

  updateTree() {
    const el = document.querySelector(this.options.el);
    this.options.width = el.offsetWidth;
    this.options.height = el.offsetHeight;
    this.svg
      .attr("width", this.options.width)
      .attr("height", this.options.height);
    this.svgGTransform.attr("transform", `${this.generateSvgTransform()}`); // 第一个g是调整视图，居中展示
    this.render();
  }

  destory() {
    window.removeEventListener("resize", this.updateTree.bind(this));
  }

  generateSvgTransform() {
    let y = 20;
    let k = 1; // window.screen.width / this.baseWidth
    if (this.options.scale) {
      k =
        (this.options.width / this.baseWidth >=
        this.options.height / this.baseHeight
          ? this.options.width / this.baseWidth
          : this.options.height / this.baseHeight) * k;
    }
    let x = this.options.width / 2 / k;
    return d3.zoomIdentity.scale(k).translate(x, y);
  }

  getBoxOptions(depth) {
    if (this.options && this.options.box) {
      if (this.options.box[depth]) {
        return this.options.box[depth];
      } else {
        return this.options.box; //每个层级都是一样的配置项
      }
    } else {
      return {};
    }
  }

  getNodeId(d) {
    return get(d.data, this.encode.id, "");
  }

  getNodeName(d) {
    return get(d.data, this.encode.name, "");
  }
  // 有可能嵌套如count映射为 a.b.c
  getNodeCount(d) {
    return get(d.data, this.encode.count, "");
  }
  // 服务端返回了unit字段，则使用服务端返回，否则使用配置的
  getNodeUnit(d) {
    return get(d.data, this.encode.unit || "");
  }

  // d.depth是从0开始的，所以对depthLimit-1进行校对
  // 倒数第二层如果已经到限制了，就删除它的孩子节点
  getLimitStatus(d) {
    return d.depth + 1 > this.options.depthLimit - 1;
  }

  render(highlights) {
    if (Array.isArray(highlights)) {
      // this.highlights = highlights;//高亮变默认选中
      const [activeId] = highlights;
      this.root.each((d) => {
        if (this.getNodeId(d) === activeId) {
          this.actives = {
            id: activeId,
            d: d,
          };
          return;
        }
      });
    }
    this.treeLayout(this.root);
    this.renderNodes();
    this.renderLinks();
    // if(this.options.width / this.baseWidth < 1) {
    //   this.svgG.attr("transform", `${this.generateSvgTransform()}`);
    // }
    return this;
  }

  renderNodes = function () {
    var _this = this;
    const nodes = this.svgG
      .selectAll(".node")
      .data(this.root.descendants(), (d) => {
        _this.getNodeId(d);
      });
    nodes.exit().remove();
    console.log("nodes", nodes);
    const nodeEnter = nodes
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("strokeWidth", 100)
      .attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
      })
      .style("filter", (d) => {
        const id = _this.getNodeId(d);
        if (_this.actives.id === id) {
          return BRIGHTNESS.HIGH;
        } else {
          return BRIGHTNESS.NORMAL;
        }
      });
    // 绘制矩形或图片
    this.renderNodesByType(nodeEnter);
    // 处理点击事件
    this.handlerNodeClick(nodeEnter);
    // 渲染text
    this.renderText(nodeEnter);
    // 重新布局后，node和nodeDom变化了，重新赋值
    if (_this.actives.id) {
      const selectedNode = _this.svgG.selectAll(".node").filter(function (d) {
        return _this.getNodeId(d) === _this.actives.id;
      });
      console.log("selectedNode", selectedNode);
      if (selectedNode) {
        _this.actives.node = selectedNode;
        _this.actives.nodeDom = selectedNode._groups[0][0];
      }
    }
  };
  handlerNodeClick(nodeEnter) {
    const _this = this;
    nodeEnter.on("click", async function (event, d) {
      console.log("node click", event.currentTarget);
      const node = d3.select(this);
      // onClick回调，返回新增节点（TODO考虑优化，直接从数据上新增，然后重新生成树再渲染，不知道页面会不会重置到初始位置，待验证）
      if (_this.options.onClick && typeof _this.options.onClick == "function") {
        // 回调
        const flag = _this.actives.id !== _this.getNodeId(d);
        _this.getTooltipPosition(event.currentTarget, flag);
        // 可能是异步
        const callback = await _this.options.onClick(d, flag);
        // 如果上一次有新增节点，点击当前节点时，删除上一次新增的节点，需要重新渲染
        let newAddFlag = false;
        // 删除上一次新增的节点
        if (_this.actives.d !== d) {
          _this.root.each((d) => {
            if (d.data.new_add) {
              Reflect.deleteProperty(d.parent, "children");
              newAddFlag = true;
            }
          });
        }
        // 如果返回子节点
        if (Array.isArray(callback) && callback.length) {
          if (_this.actives.d !== d) {
            const children = [];
            callback.forEach((item) => {
              children.push({
                ...d3.hierarchy({ ...item, new_add: true }),
                depth: d.depth + 1,
                parent: d,
              });
            });
            if (!d.children) {
              d.children = [];
            }
            d.children.push(...children);
          }
          _this.handlerSelected(node, d, event);
          _this.render();
        } else {
          // 返回false，不添加选中状态
          if (callback === false) return;
          _this.handlerSelected(node, d, event);
          if (newAddFlag) {
            _this.render();
          }
        }
      } else {
        _this.handlerSelected(node, d, event);
      }
    });
  }
  getTooltipPosition(target, flag = true) {
    // 如果不展示tooltip或者位置固定不需要跟随节点则 return
    if (
      target == null ||
      !this.options.showTooltip ||
      this.options.fixedPosition
    )
      return;
    if (!flag) {
      this.tooltip.style("opacity", 0);
      return;
    }
    const { left, top, width, height } = target.getBoundingClientRect();
    const { left: svgLeft, top: svgTop } =
      target.ownerSVGElement.getBoundingClientRect();
    const { scrollTop, scrollLeft } = document.documentElement;
    this.tooltip
      .style("opacity", 1)
      .style("left", left - svgLeft + scrollLeft + width + 10 + "px")
      .style("top", top - svgTop + scrollTop + "px");
  }
  // 只保留一个选中，tooltip也一个
  handlerSelected(node, d, event) {
    const id = this.getNodeId(d);
    if (this.actives.node) {
      this.actives.node.style("filter", () => {
        return BRIGHTNESS.NORMAL;
      });
    }
    // 设置高亮
    if (id !== this.actives.id) {
      this.actives = {
        node: node,
        d,
        id: id,
        nodeDom: event.currentTarget,
      };
    } else if (this.options.toggle) {
      // 如果切换键开启则取消选中，否则不取消选中
      this.actives = {
        node: null,
        d: null,
        id: "",
        nodeDom: null,
      };
    }
    node.style("filter", () => {
      if (this.actives.id !== "") {
        return BRIGHTNESS.HIGH;
      } else {
        return BRIGHTNESS.NORMAL;
      }
    });
  }
  // TODO 如果需要保留多个选中，多个tooltip，可以加参数控制
  // 根据类型绘制矩形、图片、圆形
  renderNodesByType(nodeEnter) {
    const _this = this;
    nodeEnter.each(function (d) {
      const {
        type = "rect",
        url = "",
        width,
        height,
        fillActive,
        fill,
        strokeDasharray,
        r,
      } = _this.getBoxOptions(d.depth);
      if (type === "image") {
        let imageUrl = DEFAULT_NODE_IMAGE; // TODO添加一个默认的图片
        if (typeof url === "function") {
          imageUrl = url(d);
        } else {
          imageUrl = url;
        }
        if (imageUrl == null) {
          imageUrl = DEFAULT_NODE_IMAGE;
        }
        d3.select(this)
          .append("image")
          .attr("xlink:href", imageUrl)
          .attr("y", 0)
          .attr("x", -(width / 2))
          .attr("width", width)
          .attr("height", height);
      } else if (type === "rect") {
        let bgColor = "";
        if (typeof fill === "function") {
          bgColor = fill(d);
        } else {
          bgColor = fill;
        }
        if (!bgColor) {
          bgColor = DEFAULT_NODE_FILL;
        }
        d3.select(this)
          .append("rect")
          .attr("y", 0)
          .attr("x", -(width / 2))
          .attr("width", width)
          .attr("height", height)
          .attr("rx", 8)
          .attr("ry", 8)
          // 矩形背景色以及边框颜色宽度
          .attr("fill", function (d) {
            const id = _this.getNodeId(d);
            // if(_this.actives.id === id) {
            //   return 'red'
            // }else
            if (_this.highlights.includes(id)) {
              return fillActive;
            } else {
              return bgColor;
            }
          })
          .attr("stroke", "rgba(66,145,195,1)")
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", strokeDasharray);
      } else if (type === "circle") {
        let bgColor = "";
        if (typeof fill === "function") {
          bgColor = fill(d);
        } else {
          bgColor = fill;
        }
        if (!bgColor) {
          bgColor = DEFAULT_NODE_FILL;
        }
        d3.select(this)
          .append("circle")
          .attr("cx", 0)
          .attr("cy", r)
          .attr("r", r)
          // 矩形背景色以及边框颜色宽度
          .attr("fill", function (d) {
            const id = _this.getNodeId(d);
            if (_this.highlights.includes(id)) {
              return fillActive;
            } else {
              return bgColor;
            }
          })
          .attr("stroke", "rgba(66,145,195,1)")
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", strokeDasharray);
      }
    });
  }

  // 处理text
  renderText(nodeEnter) {
    const _this = this;
    nodeEnter
      .append("text")
      .attr("x", function (d) {
        const {
          width = 0,
          height = 0,
          r,
          type = "rect",
        } = _this.getBoxOptions(d.depth);
        if (type === "circle") {
          return r;
        } else {
          return width / 2 + 5;
        }
      })
      .attr("text-anchor", function (d) {
        return "middle";
      })
      .attr("font-size", textFontSize)
      .attr("fill", "#fff")
      .each(function (d) {
        const text = d3.select(this);
        const lines = _this.getTextsForNode(d);
        let { height = 0, type, r = defaultR } = _this.getBoxOptions(d.depth);
        if (type == "circle") {
          height = 2 * r;
        }
        const em = 1.2;
        let firstDy =
          (height - lines.length * textFontSize * em) / 2 + textFontSize; //为了垂直居中显示，计算firstDay的值
        lines.forEach(function (line, i) {
          const tspan = text
            .append("tspan")
            .attr("x", 0)
            .attr("dy", i ? `${em}em` : firstDy) // 如果不是第一行，则向下移动
            .text(line.text);
          // 根据类型来判断
          if (line.type == "more") {
            tspan.attr("fill", "red").on("click", function (event) {
              console.log("line", line);
              event.stopPropagation();
              if (d.depth > 0 && d.children && d.children.length > 3) {
                // 如果当前节点有隐藏的子节点，点击时切换显示
                d._children = (d._children || []).concat(d.children.splice(3)); // 将隐藏的子节点移到 _children
                d.children = d.children.slice(0, 3); // 只保留前三个子节点
                _this.resetSiblingNodes(d);
                _this.render(); // 重新渲染树
              } else if (d._children) {
                // 如果 _children 存在，说明之前隐藏了子节点，点击时恢复
                d.children = (d.children || []).concat(d._children);
                d._children = null;
                _this.hideSiblingNodes(d);
                _this.render(); // 重新渲染树
              } else if (
                _this.options.expandAndHideSiblingNodes &&
                _this.clickMoreId == d.data.indicator_id
              ) {
                // 当收起以后，会出现少于3个的数字，特殊处理
                _this.resetSiblingNodes(d);
                _this.render(); // 重新渲染树
              }
            });
          }
        });
      });
  }
  hideSiblingNodes(activeD) {
    // 隐藏同级子元素
    if (this.options.expandAndHideSiblingNodes) {
      this.clickMoreId =
        this.clickMoreId !== activeD.data.indicator_id
          ? activeD.data.indicator_id
          : "";
      this.root.each((d) => {
        if (d.depth == activeD.depth && d !== activeD) {
          if (d.children) {
            d._children = (d._children || []).concat(d.children);
            d.children = null;
          }
        }
      });
      console.log("this.root hideSiblingNodes", activeD);
    }
  }
  resetSiblingNodes(activeD) {
    if (this.options.expandAndHideSiblingNodes) {
      this.clickMoreId =
        this.clickMoreId !== activeD.data.indicator_id
          ? activeD.data.indicator_id
          : "";
      this.root.each((d) => {
        if (d.depth == activeD.depth && d !== activeD) {
          if (d._children && d._children.length > 3) {
            d.children = d._children.slice(0, 3); // 只保留前三个
            d._children = d._children.slice(3); // 隐藏的子节点存到 _children
          } else if (d._children) {
            d.children = (d.children || []).concat(d._children);
            d._children = null;
          }
        }
      });
      console.log("this.root", this.root);
    }
  }
  getTextsForNode(d) {
    const arr = [];
    // 处理内容
    const name = this.getNodeName(d);
    let { width = 0, type, r = defaultR } = this.getBoxOptions(d.depth);
    if (type == "circle") {
      width = 2 * r;
    }
    if (name) {
      const gap =
        Math.floor(width / textFontSize) > 1
          ? Math.floor(width / textFontSize) - 1
          : Math.floor(width / textFontSize);
      const nameArr = this.stringToArrayOfPairs(name, gap);
      arr.push(
        ...nameArr.map((item) => {
          return {
            text: item,
            type: "name",
          };
        })
      );
    }
    // 处理数字和单位
    if (typeof this.options.countRender == "function") {
      arr.push({
        text: this.options.countRender(d), // 获取返回值
        type: "count",
      });
    } else {
      const count = this.getNodeCount(d);
      const unit = this.getNodeUnit(d);
      if (count) {
        if (unit) {
          arr.push({
            text: count + unit,
            type: "count",
          });
        } else {
          arr.push({
            text: count,
            type: "count",
          });
        }
      }
    }

    // 处理展示更多和收起的文案
    if (d._children && d._children.length > 0) {
      arr.push({
        text: `+${d._children.length}`,
        type: "more",
      });
    } else if (
      (d.depth > 0 && d.children && d.children.length > 3) ||
      (this.options.expandAndHideSiblingNodes &&
        this.clickMoreId == d.data.indicator_id)
    ) {
      arr.push({
        text: `收起`,
        type: "more",
      });
    }
    return arr;
  }
  stringToArrayOfPairs(str, gap = 2) {
    let result = [];
    for (let i = 0; i < str.length; i += gap) {
      // 检查字符串剩余长度是否足够组成一个对
      if (i + 1 < str.length) {
        result.push(str.slice(i, i + gap));
      } else {
        // 如果字符串长度为奇数，则最后一个字符单独作为一个项（如果需要的话）
        // 如果不需要单独处理奇数长度的最后一个字符，可以移除或注释掉以下代码行
        result.push(str.slice(i));
      }
    }
    return result;
  }
  renderLinks = function () {
    var _this = this;
    // 将曲线换为折线
    const link = _this.svgG
      .selectAll("path.link")
      .data(this.root.links(), (d) => {
        // TODO 待优化，某些线还是可以复用的
        return Math.random();
      }); //id相同的不更新,_this.getNodeId(d.target)+ (+new Date())
    // 删除不使用的线
    link.exit().remove();
    // 新增线
    link
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#7DC9FF")
      .attr("stroke-width", 2)
      .attr("d", function (d) {
        const { width = 0, height = 0 } = _this.getBoxOptions(d.source.depth);
        let sourceX = d.source.x,
          sourceY = d.source.y + height,
          targetX = d.target.x,
          targetY = d.target.y;
        return (
          "M" +
          sourceX +
          "," +
          sourceY +
          "V" +
          ((targetY - sourceY) / 2 + sourceY) +
          "H" +
          targetX +
          "V" +
          targetY
        );
      });
  };
}
