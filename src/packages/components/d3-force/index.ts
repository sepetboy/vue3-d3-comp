import { COLOR_MAP } from "./constants";
import { DataType, EdgesType, NodeType } from "./type";
import * as d3 from "d3";

export class D3ForceGraph {
  svg: any;
  simulation: any;
  nodes: any;
  links: any;
  texts: any;
  nodesData: NodeType[];
  edgesData: EdgesType[];
  options: Record<string, any>;
  constructor(data: DataType, options: Record<string, any>) {
    this.svg = d3
      .select(options.el)
      .append("svg")
      .attr("width", options.width)
      .attr("height", options.height);

    this.nodesData = data.nodes;
    this.edgesData = data.edges;
    this.options = options;
  }

  render() {
    this.createSimulation();
    this.createNode();
    this.createLink();
    this.createText();
    this.updateNodeAndLinkPosition();
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
      );
  }
  // 绘制节点
  createNode() {
    // 绘制节点
    this.nodes = this.svg
      .append("g")
      .selectAll("circle")
      .data(this.nodesData)
      .enter()
      .append("circle")
      .attr("r", 5)
      .attr("fill", function (d: NodeType) {
        return COLOR_MAP[d.group + ""]; // 根据组别设置颜色
      })
      .call(
        d3
          .drag()
          .on("start", this.dragstarted.bind(this))
          .on("drag", this.dragged.bind(this))
          .on("end", this.dragended.bind(this))
      );
  }

  // 创建线
  createLink() {
    this.links = this.svg
      .append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(this.edgesData)
      .enter()
      .append("line")
      .attr("class", "link");
  }

  // 创建文字
  createText() {
    this.texts = this.nodes.append("title").text(function (d: any) {
      return d.id;
    });
  }

  // 更新节点和边的位置
  updateNodeAndLinkPosition() {
    this.simulation.on("tick", () => {
      this.nodes
        .attr("cx", function (d: any) {
          return d.x;
        })
        .attr("cy", function (d: any) {
          return d.y;
        });

      this.links
        .attr("x1", function (d: any) {
          return d.source.x;
        })
        .attr("y1", function (d: any) {
          return d.source.y;
        })
        .attr("x2", function (d: any) {
          return d.target.x;
        })
        .attr("x2", function (d: any) {
          return d.target.x;
        });
    });
  }

  private dragstarted(event: any, d: any) {
    if (!event.active) this.simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  private dragged(event: any, d: any) {
    d.fx = event.x;
    d.fy = event.y;
  }

  private dragended(event: any, d: any) {
    if (!event.active) this.simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
}
