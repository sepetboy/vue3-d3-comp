import { COLOR_MAP, images } from "./constants";
import { DataType, EdgesType, NodeType } from "./type";
import { getCurrentInstance } from "vue";
import { addVector, parallelTransform } from "./utils";
import * as d3 from "d3";
const nodeWidth = 40;
const nodeHeight = 40;
const linkGap = 15;
const linkParallelGap = 6;

export class D3ForceGraph {
  options: any;
  started: any;
  eventBus: any;
  svg: any;
  nodesData: any;
  edgesData: any;
  simulation: d3.Simulation<d3.SimulationNodeDatum, undefined> | undefined;
  nodes: any;
  links: any;
  texts: any;
  constructor(options: any) {
    const el = document.querySelector(options.el);
    if (!el) {
      console.log("未获取到dom，请在dom加载后初始化");
    }
    // 已经初始化后，不需要重新初始化了
    if (this.started) return;
    options.width = el.offsetWidth;
    options.height = el.offsetHeight;
    this.options = options;
    this.started = false;
    this.eventBus =
      getCurrentInstance()?.appContext.config.globalProperties.$eventBus;
    this.createSvgCanvas();
  }

  /**
   * 创建svg画布
   */
  createSvgCanvas() {
    let zoom: any = d3.zoom().scaleExtent([0.1, 10]).on("zoom", zoomed);

    let svg: any = d3
      .select(this.options.el)
      .append("svg")
      .attr("id", "chart")
      .attr("width", this.options.width)
      .attr("height", this.options.height);

    svg.call(zoom).call(zoom.transform, d3.zoomIdentity.scale(1));

    function zoomed(event: any) {
      svg.attr("transform", `scale(${event.transform.k})`);
    }

    this.svg = svg;
  }

  /**
   * @param {*} nodes
   * @param {*} edges
   */
  render(data: any) {
    this.nodesData = data.nodes;
    this.edgesData = data.edges;
    // 初始时执行一次，后续不执行
    if (!this.started) {
      this.createSimulation();
    }
    this.createNode();
    this.createLink();
    this.started = true;
  }

  // 创建一个力导向图模拟
  createSimulation() {
    this.simulation = d3
      .forceSimulation(this.nodesData)
      .force(
        "link",
        d3.forceLink(this.edgesData).id((d: any) => d.id)
      )
      .force("change", d3.forceManyBody())
      .force(
        "center",
        d3.forceCenter(this.options.width / 2, this.options.height / 2)
      )
      .force("y", d3.forceY().strength(0.025))
      .force("x", d3.forceX().strength(0.025))
      .force(
        "collision",
        d3.forceCollide().radius((d) => nodeWidth + 10)
      )
      .force("link", d3.forceLink(this.edgesData).distance(100))
      .on("tick", this.tick.bind(this));
  }

  // 更新节点和边的位置
  tick() {
    const _this = this;
    this.nodes.attr("transform", function (this: any, d: any) {
      const selector: any = d3.select(this);
      const nodeDom = selector._groups[0][0];
      const { width, height } = nodeDom.getBoundingClientRect();
      if (d.x - width / 2 < 0) {
        d.x = width / 2;
      }
      if (d.x > _this.options.width - width / 2) {
        d.x = _this.options.width - width / 2;
      }

      if (d.y - height / 2 < 0) {
        d.y = height / 2;
      }
      if (d.y > _this.options.height - height / 2) {
        d.y = _this.options.height - height / 2;
      }

      return "translate(" + d.x + "," + d.y + ")";
    });
    this.links.attr("d", function (d: any) {
      if (d.target && d.source) {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;

        const dr = 0;
        const slopeVec = { x: dx, y: dy };
        let transformedSource = addVector(d.source, slopeVec, linkGap);
        let transformedTarget = addVector(
          d.target,
          { x: dx, y: dy },
          -1 * linkGap
        );

        transformedSource = parallelTransform(
          transformedSource,
          slopeVec,
          linkParallelGap
        );
        transformedTarget = parallelTransform(
          transformedTarget,
          slopeVec,
          linkParallelGap
        );

        return (
          "M" +
          (transformedSource.x + nodeWidth) +
          "," +
          (transformedSource.y + 28) +
          "A" +
          dr +
          "," +
          dr +
          " 0 0,1 " +
          (transformedTarget.x + nodeWidth) +
          "," +
          (transformedTarget.y + 28)
        );
      }
    });
  }

  // 绘制节点
  createNode() {
    this.nodes = this.svg
      .append("g")
      .selectAll(".node")
      .data(this.nodesData)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("class", "node")
      .on("mouseover", (event: any, d: any) => {
        const x = event.offsetX;
        const y = event.offsetY;
        this.eventBus.$emit("mouseover", { position: { x, y }, data: d });
        event.stopPropagation();
      })
      .on("mouseout", () => {
        this.eventBus.$emit("mouseout");
      })
      .call(
        d3
          .drag()
          .on("start", this._dragstarted.bind(this))
          .on("drag", this._dragged.bind(this))
          .on("end", this._dragended.bind(this))
      );
    this.createImageInNode();
    this.createTextInNode();
  }

  // 创建线
  createLink() {
    this.links = this.svg
      .append("g")
      .classed("links", true)
      .selectAll("path")
      .data(this.edgesData)
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("id", (d: any, i: any) => `linkPath${i}`)
      .attr("stroke", "#979797")
      .attr("stroke-width", "2")
      .attr("stroke-opacity", 1);
  }

  // 节点内创建image
  createImageInNode() {
    this.nodes
      .append("image")
      .attr("class", "node-icon")
      .attr("xlink:href", (d: any) => images[d.type])
      .attr("width", nodeWidth)
      .attr("height", nodeHeight)
      .attr("x", function () {
        return nodeWidth / 2;
      });
  }

  // 创建文字
  createTextInNode() {
    this.texts = this.nodes
      .append("text")
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .attr("x", function () {
        return nodeWidth;
      })
      .attr("y", function (d: any) {
        return -nodeHeight / 4;
      })
      .text(function (d: any) {
        return d.label;
      });
  }

  _dragstarted(event: any, d: any) {
    if (!event.active) this.simulation?.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  _dragged(event: any, d: any) {
    d.fx = event.x;
    d.fy = event.y;
  }

  _dragended(event: any, d: any) {
    if (!event.active) this.simulation?.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  destroy() {
    d3.select(this.options.el).selectAll("svg").remove();
    this.simulation?.stop();
  }
}
