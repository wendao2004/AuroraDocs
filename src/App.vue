<template>
  <AppLayout />
</template>

<script setup lang="ts">
import AppLayout from './components/layout/AppLayout.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  overflow: hidden;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  background-color: #e5e5e5;
}

#app {
  height: 100%;
}
</style>
