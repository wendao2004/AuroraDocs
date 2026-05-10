<template>
  <div class="app-layout">
    <TitleBar title="极光文档 AuroraDocs" />
    <div class="main-container">
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo">
            <span class="logo-icon">✦</span>
            <span class="logo-text">AuroraDocs</span>
          </div>
        </div>
        <nav class="nav-menu">
          <router-link to="/" class="nav-item">
            <span class="nav-icon">📝</span>
            <span class="nav-text">编辑器</span>
          </router-link>
          <router-link to="/documents" class="nav-item">
            <span class="nav-icon">📁</span>
            <span class="nav-text">文档</span>
          </router-link>
          <router-link to="/tasks" class="nav-item">
            <span class="nav-icon">✅</span>
            <span class="nav-text">任务</span>
          </router-link>
          <router-link to="/team" class="nav-item">
            <span class="nav-icon">👥</span>
            <span class="nav-text">团队</span>
          </router-link>
        </nav>
        <div class="sidebar-footer">
          <div class="version">v1.0.0</div>
        </div>
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
  background: var(--color-bg-base);
}

.main-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 240px;
  background: linear-gradient(180deg, #1a1d23 0%, #252a33 100%);
  display: flex;
  flex-direction: column;
  position: relative;
}

.sidebar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: linear-gradient(180deg, rgba(0, 120, 212, 0.15) 0%, transparent 100%);
  pointer-events: none;
}

.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  font-size: 24px;
  color: #0078d4;
  text-shadow: 0 0 20px rgba(0, 120, 212, 0.5);
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.5px;
}

.nav-menu {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: #0078d4;
  border-radius: 0 2px 2px 0;
  transition: height 0.2s ease;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
}

.nav-item.router-link-active {
  background: rgba(0, 120, 212, 0.2);
  color: #ffffff;
}

.nav-item.router-link-active::before {
  height: 24px;
}

.nav-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.nav-text {
  font-size: 14px;
  font-weight: 500;
}

.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.version {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.content {
  flex: 1;
  overflow: auto;
  padding: 24px;
  background: var(--color-bg-base);
}
</style>
