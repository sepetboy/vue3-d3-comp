import { SimulationNodeDatum, SimulationLinkDatum } from "d3";
export type NodeType = {
  id: String;
  group: String;
} & SimulationNodeDatum;

export type EdgesType = {
  source: String;
  target: String;
} & SimulationLinkDatum<NodeType>;

export type DataType = {
  nodes: NodeType[];
  edges: EdgesType[];
};
