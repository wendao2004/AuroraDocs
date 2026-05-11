<template>
  <div class="app-layout">
    <aside class="sidebar">
      <div class="nav-section">
        <div 
          v-for="item in navItems" 
          :key="item.path"
          class="nav-item"
          :class="{ active: currentRoute === item.path }"
          @click="navigateTo(item.path)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path :d="item.icon" />
          </svg>
          <span>{{ item.label }}</span>
        </div>
      </div>
      
      <div class="sidebar-header">
        <span class="sidebar-title">文档</span>
        <button class="add-btn" @click="createNewDocument" title="新建文档">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>
      
      <div class="category-section" v-if="categories.length > 0">
        <div class="category-header">
          <span class="category-label">分类</span>
          <button class="manage-categories-btn" @click="showCategoryManager = true">管理</button>
        </div>
        <div class="category-list">
          <div 
            class="category-item" 
            :class="{ active: selectedCategoryId === '' }"
            @click="selectCategory('')"
          >
            <span>全部</span>
            <span class="category-count">{{ documents.length }}</span>
          </div>
          <div 
            class="category-item" 
            :class="{ active: selectedCategoryId === 'uncategorized' }"
            @click="selectCategory('uncategorized')"
          >
            <span>未分类</span>
            <span class="category-count">{{ getUncategorizedDocCount() }}</span>
          </div>
          <div 
            v-for="cat in categories" 
            :key="cat.id"
            class="category-item"
            :class="{ active: selectedCategoryId === cat.id }"
            @click="selectCategory(cat.id)"
          >
            <span class="category-color" :style="{ backgroundColor: cat.color }"></span>
            <span>{{ cat.name }}</span>
            <span class="category-count">{{ getCategoryDocCount(cat.id) }}</span>
          </div>
        </div>
      </div>

      <div class="document-list">
        <div 
          v-for="doc in filteredDocuments" 
          :key="doc.id"
          class="document-item"
          @click="openDocument(doc.id)"
        >
          <svg class="doc-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          <span class="doc-title">{{ doc.title }}</span>
          <button class="doc-delete" @click.stop="handleDelete(doc.id)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div v-if="filteredDocuments.length === 0 && documents.length > 0" class="empty-doc-list">
          <p>该分类下暂无文档</p>
        </div>
        <div v-if="documents.length === 0" class="empty-doc-list">
          <p>暂无文档</p>
        </div>
      </div>

      <div class="sidebar-footer">
        <div class="user-section" @click="showSettingsDialog = true">
          <div class="user-avatar">
            {{ userName.charAt(0).toUpperCase() }}
          </div>
          <div class="user-info">
            <div class="user-name">{{ userName }}</div>
            <div class="user-status">本地模式</div>
          </div>
        </div>
      </div>
    </aside>

    <main class="main-area">
      <router-view />
    </main>

    <div v-if="showDeleteDialog" class="dialog-overlay" @click.self="showDeleteDialog = false">
      <div class="dialog">
        <div class="dialog-header">
          <h3>确认删除</h3>
          <button class="close-btn" @click="showDeleteDialog = false">×</button>
        </div>
        <div class="dialog-content">
          <p>确定要删除文档吗？此操作不可撤销。</p>
          <div class="dialog-actions">
            <button class="btn btn-secondary" @click="showDeleteDialog = false">取消</button>
            <button class="btn btn-danger" @click="confirmDelete">删除</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showCategoryManager" class="dialog-overlay" @click.self="showCategoryManager = false">
      <div class="dialog category-dialog">
        <div class="dialog-header">
          <h3>管理分类</h3>
          <button class="close-btn" @click="showCategoryManager = false">×</button>
        </div>
        <div class="dialog-content">
          <div class="category-form">
            <input v-model="newCategoryName" class="input" placeholder="分类名称" />
            <input v-model="newCategoryColor" type="color" class="color-input" />
            <button class="btn btn-primary" @click="addCategory">添加</button>
          </div>
          <div class="category-list-dialog">
            <div v-for="cat in categories" :key="cat.id" class="category-item-dialog">
              <span class="category-color" :style="{ backgroundColor: cat.color }"></span>
              <input v-model="cat.name" class="input category-name-input" @input="updateCategory(cat)" />
              <input v-model="cat.color" type="color" class="color-input-small" @input="updateCategory(cat)" />
              <button class="btn btn-danger btn-sm" @click="deleteCategory(cat.id)">删除</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showSettingsDialog" class="dialog-overlay" @click.self="showSettingsDialog = false">
      <div class="dialog settings-dialog">
        <div class="dialog-header">
          <h3>设置</h3>
          <button class="close-btn" @click="showSettingsDialog = false">×</button>
        </div>
        <div class="dialog-content">
          <div class="settings-section">
            <h4>用户信息</h4>
            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-label">用户名</div>
                <div class="setting-desc">显示在侧边栏的用户名称</div>
              </div>
              <input v-model="userName" class="input setting-input" @input="saveUserName" />
            </div>
          </div>
          <div class="settings-section">
            <h4>外观</h4>
            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-label">夜间模式</div>
                <div class="setting-desc">切换深色/浅色主题</div>
              </div>
              <button 
                class="toggle-switch" 
                :class="{ active: settingsStore.isDarkMode }"
                @click="settingsStore.toggleDarkMode"
              >
                <span class="toggle-slider"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { documentService } from '../../services/storage/documentService'
import { categoryService } from '../../services/storage/categoryService'
import { useSettingsStore } from '../../stores/settingsStore'
import type { DocumentListItem, Category } from '../../models/Document'

const settingsStore = useSettingsStore()
const router = useRouter()

const navItems = [
  { path: '/', label: '编辑器', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' },
  { path: '/documents', label: '文档', icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
  { path: '/tasks', label: '任务', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
  { path: '/team', label: '团队', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' },
]

const documents = ref<DocumentListItem[]>([])
const categories = ref<Category[]>([])
const selectedCategoryId = ref<string>('')
const showSettingsDialog = ref(false)
const showDeleteDialog = ref(false)
const showCategoryManager = ref(false)
const deleteTargetId = ref<string | null>(null)
const newCategoryName = ref('')
const newCategoryColor = ref('#1890ff')
const userName = ref('用户')

const currentRoute = computed(() => {
  return router.currentRoute.value.path
})

const filteredDocuments = computed(() => {
  if (!selectedCategoryId.value) {
    return documents.value
  }
  if (selectedCategoryId.value === 'uncategorized') {
    return documents.value.filter(doc => !doc.categoryId)
  }
  return documents.value.filter(doc => doc.categoryId === selectedCategoryId.value)
})

const getUncategorizedDocCount = () => {
  return documents.value.filter(doc => !doc.categoryId).length
}

const loadDocuments = () => {
  documents.value = documentService.getAll()
}

const loadCategories = () => {
  categories.value = categoryService.getAll()
}

const navigateTo = (path: string) => {
  router.push(path)
}

const createNewDocument = () => {
  const newDoc = documentService.create('无标题文档', '', null, [])
  const event = new CustomEvent('document-created', { detail: { id: newDoc.id } })
  window.dispatchEvent(event)
  router.push('/')
  setTimeout(() => {
    const openEvent = new CustomEvent('open-document', { detail: { id: newDoc.id } })
    window.dispatchEvent(openEvent)
  }, 100)
}

const openDocument = (id: string) => {
  router.push('/')
  setTimeout(() => {
    const event = new CustomEvent('open-document', { detail: { id } })
    window.dispatchEvent(event)
  }, 100)
}

const selectCategory = (id: string) => {
  selectedCategoryId.value = id
}

const getCategoryDocCount = (categoryId: string) => {
  return documents.value.filter(doc => doc.categoryId === categoryId).length
}

const handleDelete = (id: string) => {
  deleteTargetId.value = id
  showDeleteDialog.value = true
}

const confirmDelete = () => {
  if (deleteTargetId.value) {
    documentService.delete(deleteTargetId.value)
    loadDocuments()
  }
  showDeleteDialog.value = false
  deleteTargetId.value = null
}

const addCategory = () => {
  if (newCategoryName.value.trim()) {
    categoryService.create(newCategoryName.value.trim(), newCategoryColor.value)
    loadCategories()
    newCategoryName.value = ''
    newCategoryColor.value = '#1890ff'
  }
}

const updateCategory = (cat: Category) => {
  categoryService.update(cat.id, { name: cat.name, color: cat.color })
}

const deleteCategory = (id: string) => {
  categoryService.delete(id)
  loadCategories()
  if (selectedCategoryId.value === id) {
    selectedCategoryId.value = ''
  }
}

const saveUserName = () => {
  settingsStore.userName = userName.value
  settingsStore.saveSettings()
}

const handleDocumentDeleted = () => {
  loadDocuments()
}

const handleDocumentCreated = () => {
  loadDocuments()
}

const handleDocumentUpdated = () => {
  loadDocuments()
}

onMounted(() => {
  loadDocuments()
  loadCategories()
  userName.value = settingsStore.userName || '用户'
  window.addEventListener('document-deleted', handleDocumentDeleted)
  window.addEventListener('document-created', handleDocumentCreated)
  window.addEventListener('document-updated', handleDocumentUpdated)
})

onUnmounted(() => {
  window.removeEventListener('document-deleted', handleDocumentDeleted)
  window.removeEventListener('document-created', handleDocumentCreated)
  window.removeEventListener('document-updated', handleDocumentUpdated)
})
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  background: var(--color-bg-base);
}

.sidebar {
  width: 240px;
  background: var(--color-bg-white);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.nav-section {
  display: flex;
  flex-direction: column;
  padding: 8px;
  border-bottom: 1px solid var(--color-border-light);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  color: var(--color-text-secondary);
  transition: all 0.15s ease;
}

.nav-item:hover {
  background: var(--color-bg-gray);
  color: var(--color-text-primary);
}

.nav-item.active {
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: 500;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border-bottom: 1px solid var(--color-border-light);
}

.sidebar-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-muted);
}

.add-btn {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: white;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
}

.add-btn:hover {
  background: var(--color-primary-hover);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
  transform: translateY(-1px);
}

.category-section {
  padding: 8px;
  border-bottom: 1px solid var(--color-border-light);
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 6px;
  font-size: 11px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.category-label {
  font-weight: 600;
}

.manage-categories-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.manage-categories-btn:hover {
  background: var(--color-bg-gray);
  color: var(--color-text-primary);
}

.category-list {
  margin-top: 4px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: var(--color-text-secondary);
  transition: all 0.15s ease;
}

.category-item:hover {
  background: var(--color-bg-gray);
}

.category-item.active {
  background: var(--color-bg-gray);
  color: var(--color-text-primary);
}

.category-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.category-count {
  margin-left: auto;
  font-size: 12px;
  color: var(--color-text-muted);
}

.document-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.document-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: var(--color-text-secondary);
  transition: all 0.15s ease;
}

.document-item:hover {
  background: var(--color-bg-gray);
}

.document-item:hover .doc-delete {
  opacity: 1;
}

.doc-icon {
  color: var(--color-text-muted);
}

.doc-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.doc-delete {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: var(--color-text-muted);
  opacity: 0.6;
  transition: all 0.15s ease;
}

.doc-delete:hover {
  background: #fff1f0;
  color: var(--color-danger);
}

.empty-doc-list {
  padding: 20px 12px;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 13px;
}

.empty-doc-list p {
  margin: 0 0 12px 0;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--color-primary-dark);
}

.btn-sm {
  padding: 4px 10px;
  font-size: 12px;
}

.btn-secondary {
  background: var(--color-bg-gray);
  color: var(--color-text-secondary);
}

.btn-secondary:hover {
  background: var(--color-border);
}

.btn-danger {
  background: var(--color-danger);
  color: white;
}

.btn-danger:hover {
  background: var(--color-danger-dark);
}

.sidebar-footer {
  padding: 8px;
  border-top: 1px solid var(--color-border-light);
}

.user-section {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.user-section:hover {
  background: var(--color-bg-gray);
}

.user-avatar {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  border-radius: 50%;
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-status {
  font-size: 11px;
  color: var(--color-text-muted);
}

.main-area {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: var(--color-bg-white);
  border-radius: 8px;
  box-shadow: var(--shadow-xl);
  width: 90%;
  max-width: 480px;
  max-height: 80vh;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border-light);
}

.dialog-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.close-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: var(--color-text-muted);
  font-size: 18px;
  transition: all 0.15s ease;
}

.close-btn:hover {
  background: var(--color-bg-gray);
  color: var(--color-text-primary);
}

.dialog-content {
  padding: 20px;
  max-height: calc(80vh - 60px);
  overflow-y: auto;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 14px;
  color: var(--color-text-primary);
  background: var(--color-bg-white);
  outline: none;
  transition: border-color 0.15s ease;
}

.input:focus {
  border-color: var(--color-primary);
}

.category-dialog {
  max-width: 520px;
}

.category-form {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.color-input {
  width: 52px;
  height: 36px;
  padding: 2px;
  border: 2px solid var(--color-border);
  border-radius: 6px;
  cursor: pointer;
  background: transparent;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.color-input:hover {
  border-color: var(--color-primary);
}

.color-input-small {
  width: 38px;
  height: 32px;
  padding: 2px;
  border: 2px solid var(--color-border);
  border-radius: 4px;
  cursor: pointer;
  background: transparent;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.color-input-small:hover {
  border-color: var(--color-primary);
}

.category-list-dialog {
  max-height: 200px;
  overflow-y: auto;
}

.category-item-dialog {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 4px;
  transition: background-color 0.15s ease;
}

.category-item-dialog:hover {
  background: var(--color-bg-gray);
}

.category-name-input {
  flex: 1;
  max-width: 200px;
}

.settings-dialog {
  max-width: 420px;
}

.settings-section {
  margin-bottom: 20px;
}

.settings-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 12px 0;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border-light);
}

.setting-info {
  flex: 1;
}

.setting-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.setting-desc {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 2px;
}

.setting-input {
  width: 150px;
}

.toggle-switch {
  width: 48px;
  height: 26px;
  border-radius: 13px;
  background: var(--color-border);
  border: none;
  cursor: pointer;
  position: relative;
  transition: background-color 0.2s ease;
  padding: 0;
}

.toggle-switch:hover {
  background: var(--color-border-dark);
}

.toggle-switch.active {
  background: var(--color-primary);
}

.toggle-slider {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
}

.toggle-switch.active .toggle-slider {
  transform: translateX(22px);
}
</style>
