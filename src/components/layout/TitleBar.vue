<template>
  <div class="title-bar">
    <div class="title">{{ title }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<style scoped>
.title-bar {
  height: 40px;
  background-color: #ffffff;
  border-bottom: 1px solid #d0d0d0;
  display: flex;
  align-items: center;
  padding: 0 16px;
  -webkit-app-region: drag;
  user-select: none;
}

.title {
  font-size: 13px;
  font-weight: 500;
  color: #333;
}
</style>
