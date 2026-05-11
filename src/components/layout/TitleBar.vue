<template>
  <div class="title-bar" data-tauri-drag-region>
    <div class="title-left">
      <span class="app-icon">✦</span>
      <span class="app-name">{{ title }}</span>
    </div>
    <div class="title-right">
      <span class="storage-badge">本地模式</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<style scoped>
.title-bar {
  height: 0;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  -webkit-app-region: drag;
  user-select: none;
}

.title-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.app-icon {
  font-size: 16px;
  color: var(--color-primary);
}

.app-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.title-right {
  display: flex;
  align-items: center;
}

.storage-badge {
  font-size: 11px;
  color: var(--color-text-muted);
  background: var(--color-bg-gray);
  padding: 4px 10px;
  border-radius: 12px;
}
</style>
