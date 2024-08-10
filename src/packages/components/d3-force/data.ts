export const nodes = [
  { id: "11", group: "1" },
  { id: "22", group: "2" },
  { id: "33", group: "3" },
  { id: "44", group: "4" },
  { id: "55", group: "2" },
  { id: "66", group: "5" },
  { id: "77", group: "6" },
];

export const edges = [
  { source: "11", target: "22" },
  { source: "11", target: "33" },
  { source: "11", target: "44" },
  { source: "22", target: "55" },
  { source: "22", target: "66" },
  { source: "22", target: "77" },
];

export const options = {
  el: ".d3-force",
  width: 800,
  height: 600,
};
