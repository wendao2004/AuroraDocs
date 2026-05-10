<template>
  <div class="app-layout">
    <TitleBar title="极光文档" />
    <div class="main-container">
      <aside class="sidebar">
        <nav class="nav-menu">
          <router-link to="/" class="nav-item">
            <span class="icon">📝</span>
            <span class="text">编辑器</span>
          </router-link>
          <router-link to="/documents" class="nav-item">
            <span class="icon">📁</span>
            <span class="text">文档</span>
          </router-link>
          <router-link to="/team" class="nav-item">
            <span class="icon">👥</span>
            <span class="text">团队</span>
          </router-link>
        </nav>
      </aside>
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import TitleBar from './TitleBar.vue'
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #e5e5e5;
}

.main-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 200px;
  background-color: #ffffff;
  border-right: 1px solid #d0d0d0;
  padding: 16px 0;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  color: #333;
  text-decoration: none;
  transition: all 0.15s ease;
}

.nav-item:hover {
  background-color: #f0f0f0;
}

.nav-item.router-link-active {
  background-color: #e8f4ff;
  color: #0078d4;
}

.icon {
  font-size: 18px;
}

.text {
  font-size: 14px;
}

.content {
  flex: 1;
  overflow: auto;
  padding: 16px;
}
</style>
