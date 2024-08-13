<template>
  <div class="d3-force"></div>
</template>

<script lang="ts" setup>
import { nodes, edges, options } from "./data";
import { D3ForceGraph } from ".";
import { nextTick, onMounted } from "vue";

let graph;

onMounted(() => {
  nextTick(() => {
    graph = new D3ForceGraph(
      {
        nodes,
        edges,
      },
      options
    );
    graph.render();
  });
});
</script>

<style lang="scss" scoped>
.d3-force {
  width: 100%;
  height: 100%;
}
</style>
