<template>
  <div class="app-layout">
    <aside class="sidebar">
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
            v-for="cat in categories" 
            :key="cat.id"
            class="category-item" 
            :class="{ active: selectedCategoryId === cat.id }"
            @click="selectCategory(cat.id)"
          >
            <span class="category-color" :style="{ backgroundColor: cat.color }"></span>
            <span>{{ cat.name }}</span>
            <span class="category-count">{{ getDocumentsByCategory(cat.id).length }}</span>
          </div>
        </div>
      </div>
      
      <div class="file-tree">
        <div
          v-for="doc in filteredDocuments"
          :key="doc.id"
          class="file-item"
          :class="{ active: currentDocumentId === doc.id }"
          @click="openDocument(doc.id)"
        >
          <svg class="file-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <span class="file-name">{{ doc.title || '无标题' }}</span>
          <button class="file-delete" @click.stop="deleteDocument(doc.id)" title="删除">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div v-if="filteredDocuments.length === 0 && documents.length > 0" class="empty-tree">
          <p>该分类下暂无文档</p>
        </div>
        <div v-if="documents.length === 0" class="empty-tree">
          <p>暂无文档</p>
          <button class="btn btn-primary btn-sm" @click="createNewDocument">创建文档</button>
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
          <svg class="settings-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </div>
      </div>
    </aside>

    <main class="main-area">
      <div class="editor-tabs" v-if="openDocuments.length > 0">
        <div
          v-for="tab in openDocuments"
          :key="tab.id"
          class="editor-tab"
          :class="{ active: currentDocumentId === tab.id }"
          @click="switchDocument(tab.id)"
        >
          <svg class="tab-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          </svg>
          <span class="tab-name">{{ tab.title || '无标题' }}</span>
          <button class="tab-close" @click.stop="closeDocument(tab.id)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="editor-content" v-if="currentDocument">
        <div class="editor-toolbar">
          <input
            v-model="currentDocument.title"
            class="title-input"
            placeholder="文档标题..."
            @input="saveDocument()"
          />
          <div class="toolbar-actions">
            <div class="toolbar-dropdown" v-if="currentDocumentId">
              <button class="toolbar-btn" title="分类">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2z"/>
                </svg>
              </button>
              <div class="dropdown-menu category-dropdown">
                <div class="dropdown-item" :class="{ active: !getCurrentDocumentCategory() }" @click="setDocumentCategory(null)">
                  无分类
                </div>
                <div 
                  v-for="cat in categories" 
                  :key="cat.id"
                  class="dropdown-item" 
                  :class="{ active: getCurrentDocumentCategory()?.id === cat.id }"
                  @click="setDocumentCategory(cat.id)"
                >
                  <span class="category-color" :style="{ backgroundColor: cat.color }"></span>
                  {{ cat.name }}
                </div>
              </div>
            </div>
            
            <div class="toolbar-dropdown tags-dropdown" v-if="currentDocumentId">
              <button class="toolbar-btn" title="标签">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
              <div class="dropdown-menu">
                <div 
                  v-for="tag in tags" 
                  :key="tag.id"
                  class="dropdown-item"
                  @click="toggleDocumentTag(tag.id)"
                >
                  <span class="tag-checkbox" :class="{ checked: getCurrentDocumentTags().includes(tag.id) }">
                    <svg v-if="getCurrentDocumentTags().includes(tag.id)" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </span>
                  <span class="tag-color" :style="{ backgroundColor: tag.color }"></span>
                  {{ tag.name }}
                </div>
                <div class="dropdown-divider"></div>
                <div class="dropdown-item" @click="showTagManager = true">
                  管理标签
                </div>
              </div>
            </div>
            
            <button
              class="toolbar-btn"
              @click="createVersion"
              title="保存版本"
              :disabled="!currentDocumentId"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
            </button>
            <button
              class="toolbar-btn"
              @click="showVersionHistory"
              title="版本历史"
              :disabled="!currentDocumentId"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </button>
            <button class="toolbar-btn" @click="shareDocument" title="分享">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
            </button>
            <span class="save-status" :class="{ saved: isSaved }">
              {{ isAutoSaving ? '自动保存中...' : (isSaved ? '已保存' : '保存中...') }}
            </span>
          </div>
        </div>
        <div class="editor-wrapper" @click="focusEditor">
          <TiptapEditor
            v-model="currentDocument.content"
            @update:modelValue="onContentChange"
          />
        </div>
      </div>

      <div v-else class="empty-editor">
        <div class="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>
        <h3>选择一个文档开始编辑</h3>
        <p>或创建一个新文档</p>
        <button class="btn btn-primary" @click="createNewDocument">新建文档</button>
      </div>
    </main>

    <aside v-if="showHistoryPanel" class="history-panel">
      <div class="history-header">
        <h3>版本历史</h3>
        <button class="close-btn" @click="showHistoryPanel = false">×</button>
      </div>
      <div class="history-content">
        <div v-if="versions.length === 0" class="empty-history">
          <p>暂无版本记录</p>
          <p class="hint">点击保存版本按钮创建第一个版本</p>
        </div>
        <div v-else class="version-list">
          <div
            v-for="version in versions"
            :key="version.id"
            class="version-item"
            :class="{ selected: selectedVersionId === version.id }"
            @click="selectVersion(version)"
          >
            <div class="version-commit">
              <span class="commit-hash">{{ formatCommitHash(version.id) }}</span>
              <span class="commit-badge">HEAD</span>
            </div>
            <div class="version-message">{{ version.description || 'No message' }}</div>
            <div class="version-meta">
              <span class="version-author">{{ version.author || 'User' }}</span>
              <span class="version-time">{{ formatTime(version.createdAt) }}</span>
            </div>
            <div v-if="version.changes && (version.changes.charsAdded > 0 || version.changes.charsRemoved > 0)" class="version-stats">
              <span v-if="version.changes.charsAdded > 0" class="stat-add">+{{ version.changes.charsAdded }}</span>
              <span v-if="version.changes.charsRemoved > 0" class="stat-remove">-{{ version.changes.charsRemoved }}</span>
            </div>
            <div v-if="selectedVersionId === version.id" class="version-preview">
              <div class="preview-header">
                <div class="preview-title">
                  <strong>{{ version.title || '无标题' }}</strong>
                </div>
                <div v-if="versionDiff && versionDiff.titleDiff" class="title-changed">
                  <span class="change-label">标题已修改</span>
                </div>
              </div>
              <div class="preview-diff" v-if="versionDiff">
                <div class="diff-header">
                  <span class="diff-label">与上一版本差异</span>
                </div>
                <div class="diff-content">
                  <div
                    v-for="(line, index) in versionDiff.lines"
                    :key="index"
                    class="diff-line"
                    :class="{
                      'diff-add': line.startsWith('+'),
                      'diff-remove': line.startsWith('-'),
                      'diff-context': line.startsWith('  ')
                    }"
                  >
                    {{ line }}
                  </div>
                </div>
              </div>
              <div class="version-actions">
                <button class="btn btn-primary" @click.stop="restoreVersion(version)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="1 4 1 10 7 10"/>
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                  </svg>
                  恢复到该版本
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>

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

    <div v-if="showTagManager" class="dialog-overlay" @click.self="showTagManager = false">
      <div class="dialog tag-dialog">
        <div class="dialog-header">
          <h3>管理标签</h3>
          <button class="close-btn" @click="showTagManager = false">×</button>
        </div>
        <div class="dialog-content">
          <div class="tag-form">
            <input v-model="newTagName" class="input" placeholder="标签名称" />
            <input v-model="newTagColor" type="color" class="color-input" />
            <button class="btn btn-primary" @click="addTag">添加</button>
          </div>
          <div class="tag-list-dialog">
            <div v-for="tag in tags" :key="tag.id" class="tag-item-dialog">
              <span class="tag-color" :style="{ backgroundColor: tag.color }"></span>
              <input v-model="tag.name" class="input tag-name-input" @input="updateTag(tag)" />
              <input v-model="tag.color" type="color" class="color-input-small" @input="updateTag(tag)" />
              <button class="btn btn-danger btn-sm" @click="deleteTag(tag.id)">删除</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showSettingsDialog" class="dialog-overlay" @click.self="showSettingsDialog = false">
      <div class="dialog settings-dialog">
        <div class="dialog-header">
          <h3>⚙️ 设置</h3>
          <button class="close-btn" @click="showSettingsDialog = false">×</button>
        </div>
        <div class="dialog-content">
          <div class="settings-section">
            <h4>外观</h4>
            <div class="setting-item">
              <div class="setting-info">
                <div class="setting-label">夜间模式</div>
                <div class="setting-desc">开启后界面将切换为深色主题</div>
              </div>
              <label class="switch">
                <input type="checkbox" :checked="settingsStore.isDarkMode" @change="settingsStore.toggleDarkMode" />
                <span class="switch-slider"></span>
              </label>
            </div>
          </div>

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
            <h4>关于</h4>
            <div class="about-info">
              <div class="about-logo">✦</div>
              <div class="about-name">AuroraDocs 极光文档</div>
              <div class="about-version">版本 1.0.0</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showShareDialog" class="dialog-overlay" @click.self="showShareDialog = false">
      <div class="dialog">
        <div class="dialog-header">
          <h3>分享文档</h3>
          <button class="close-btn" @click="showShareDialog = false">×</button>
        </div>
        <div class="dialog-content">
          <p class="share-desc">复制以下链接分享给其他人：</p>
          <div class="share-link-container">
            <input v-model="shareLink" readonly class="input share-link-input" />
            <button class="btn btn-primary" @click="copyLink">复制</button>
          </div>
          <p v-if="copySuccess" class="copy-success">复制成功！</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import TiptapEditor from '../editor/TiptapEditor.vue'
import { documentService } from '../../services/storage/documentService'
import { categoryService } from '../../services/storage/categoryService'
import { tagService } from '../../services/storage/tagService'
import { documentVersionService, type DocumentVersion } from '../../services/storage/documentVersionService'
import { shareService } from '../../services/shareService'
import { useSettingsStore } from '../../stores/settingsStore'
import type { DocumentListItem, Category, Tag } from '../../models/Document'

const settingsStore = useSettingsStore()

interface OpenDocument {
  id: string
  title: string
  content: string
  categoryId: string | null
  tags: string[]
}

const documents = ref<DocumentListItem[]>([])
const categories = ref<Category[]>([])
const tags = ref<Tag[]>([])
const openDocuments = ref<OpenDocument[]>([])
const currentDocumentId = ref<string | null>(null)
const selectedCategoryId = ref<string>('')
const showSettingsDialog = ref(false)
const showShareDialog = ref(false)
const showHistoryPanel = ref(false)
const showCategoryManager = ref(false)
const showTagManager = ref(false)
const versions = ref<DocumentVersion[]>([])
const selectedVersionId = ref<string | null>(null)
const versionDiff = ref<{ lines: string[], titleDiff: boolean } | null>(null)
const shareLink = ref('')
const copySuccess = ref(false)
const isSaved = ref(true)
const isAutoSaving = ref(false)
const userName = ref('用户')
const autoSaveTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const lastSavedContent = ref('')
const lastSavedTitle = ref('')
const lastSavedCategoryId = ref('')
const lastSavedTags = ref<string[]>([])
const newCategoryName = ref('')
const newCategoryColor = ref('#1890ff')
const newTagName = ref('')
const newTagColor = ref('#52c759')

const currentDocument = computed(() => {
  return openDocuments.value.find((doc) => doc.id === currentDocumentId.value) || null
})

const filteredDocuments = computed(() => {
  if (!selectedCategoryId.value) {
    return documents.value
  }
  return documents.value.filter(doc => doc.categoryId === selectedCategoryId.value)
})

const getDocumentsByCategory = (categoryId: string) => {
  return documents.value.filter(doc => doc.categoryId === categoryId)
}

const getCurrentDocumentCategory = () => {
  if (!currentDocument.value) return null
  return categories.value.find(cat => cat.id === currentDocument.value?.categoryId) || null
}

const getCurrentDocumentTags = () => {
  return currentDocument.value?.tags || []
}

const loadDocuments = () => {
  documents.value = documentService.getAll()
}

const loadCategoriesAndTags = () => {
  categories.value = categoryService.getAll()
  tags.value = tagService.getAll()
}

const loadUserName = () => {
  const saved = localStorage.getItem('userName')
  if (saved) {
    userName.value = saved
  }
}

const saveUserName = () => {
  localStorage.setItem('userName', userName.value)
}

const selectCategory = (categoryId: string) => {
  selectedCategoryId.value = categoryId
}

const addCategory = () => {
  if (newCategoryName.value.trim()) {
    categoryService.create(newCategoryName.value.trim(), newCategoryColor.value)
    categories.value = categoryService.getAll()
    newCategoryName.value = ''
  }
}

const updateCategory = (category: Category) => {
  categoryService.update(category.id, { name: category.name, color: category.color })
}

const deleteCategory = (categoryId: string) => {
  categoryService.delete(categoryId)
  categories.value = categoryService.getAll()
  if (selectedCategoryId.value === categoryId) {
    selectedCategoryId.value = ''
  }
}

const addTag = () => {
  if (newTagName.value.trim()) {
    tagService.create(newTagName.value.trim(), newTagColor.value)
    tags.value = tagService.getAll()
    newTagName.value = ''
  }
}

const updateTag = (tag: Tag) => {
  tagService.update(tag.id, { name: tag.name, color: tag.color })
}

const deleteTag = (tagId: string) => {
  tagService.delete(tagId)
  tags.value = tagService.getAll()
}

const setDocumentCategory = (categoryId: string | null) => {
  if (currentDocument.value) {
    currentDocument.value.categoryId = categoryId
    saveDocument()
  }
}

const toggleDocumentTag = (tagId: string) => {
  if (!currentDocument.value) return
  const docTags = currentDocument.value.tags || []
  const index = docTags.indexOf(tagId)
  if (index > -1) {
    docTags.splice(index, 1)
  } else {
    docTags.push(tagId)
  }
  currentDocument.value.tags = docTags
  saveDocument()
}

const createNewDocument = () => {
  const categoryId = selectedCategoryId.value || null
  const doc = documentService.create('无标题', '', categoryId, [])
  loadDocuments()
  openDocument(doc.id)
}

const openDocument = (id: string) => {
  const existing = openDocuments.value.find((doc) => doc.id === id)
  if (existing) {
    currentDocumentId.value = id
    lastSavedContent.value = existing.content
    lastSavedTitle.value = existing.title
    return
  }

  const doc = documentService.getById(id)
  if (doc) {
    openDocuments.value.push({
      id: doc.id,
      title: doc.title,
      content: doc.content,
      categoryId: doc.categoryId || null,
      tags: doc.tags || []
    })
    currentDocumentId.value = id
    lastSavedContent.value = doc.content
    lastSavedTitle.value = doc.title
    showHistoryPanel.value = false
    versions.value = []
    selectedVersionId.value = null
  }
}

const switchDocument = (id: string) => {
  currentDocumentId.value = id
  showHistoryPanel.value = false
  versions.value = []
  selectedVersionId.value = null
}

const closeDocument = (id: string) => {
  const index = openDocuments.value.findIndex((doc) => doc.id === id)
  if (index !== -1) {
    openDocuments.value.splice(index, 1)
    if (currentDocumentId.value === id) {
      currentDocumentId.value = openDocuments.value.length > 0
        ? openDocuments.value[Math.max(0, index - 1)].id
        : null
    }
  }
}

const deleteDocument = (id: string) => {
  closeDocument(id)
  documentService.delete(id)
  loadDocuments()
}

const saveDocument = (isAuto: boolean = false) => {
  const doc = currentDocument.value
  if (!doc) {
    console.warn('saveDocument: currentDocument is null')
    return
  }

  const content = doc.content
  const title = doc.title
  const categoryId = doc.categoryId
  const tags = doc.tags

  if (!isAuto) {
    const lastContent = lastSavedContent.value || ''
    const lastTitle = lastSavedTitle.value || ''
    const lastCategoryId = lastSavedCategoryId.value || ''
    const lastTags = lastSavedTags.value || []
    const contentChanged = content !== lastContent
    const titleChanged = title !== lastTitle
    const categoryChanged = categoryId !== lastCategoryId
    const tagsChanged = JSON.stringify(tags) !== JSON.stringify(lastTags)
    
    if (!contentChanged && !titleChanged && !categoryChanged && !tagsChanged) {
      console.debug('saveDocument: no changes detected')
      return
    }
  }

  if (isAuto) {
    isAutoSaving.value = true
  } else {
    isSaved.value = false
  }

  try {
    documentService.update(doc.id, {
      title,
      content,
      categoryId: doc.categoryId,
      tags: doc.tags
    })

    const versionResult = documentVersionService.createVersion({
      id: doc.id,
      title,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
      authorId: 'local-user',
    })

    if (!versionResult) {
      console.debug('saveDocument: no new version created (no changes)')
    }

    const docIndex = documents.value.findIndex((d) => d.id === doc.id)
    if (docIndex !== -1) {
      documents.value[docIndex].title = title
      documents.value[docIndex].categoryId = doc.categoryId
      documents.value[docIndex].tags = doc.tags
    }

    const openIndex = openDocuments.value.findIndex((d) => d.id === doc.id)
    if (openIndex !== -1) {
      openDocuments.value[openIndex].title = title
      openDocuments.value[openIndex].content = content
      openDocuments.value[openIndex].categoryId = doc.categoryId
      openDocuments.value[openIndex].tags = doc.tags
    }

    lastSavedContent.value = content
    lastSavedTitle.value = title
    lastSavedCategoryId.value = categoryId
    lastSavedTags.value = [...tags]

    if (showHistoryPanel.value && currentDocumentId.value) {
      versions.value = documentVersionService.getVersions(currentDocumentId.value)
    }

    console.debug('saveDocument: saved successfully')
  } catch (error) {
    console.error('saveDocument error:', error)
    if (!isAuto) {
      isSaved.value = true
    }
    return
  }

  setTimeout(() => {
    isSaved.value = true
    isAutoSaving.value = false
  }, isAuto ? 500 : 300)
}

const onContentChange = () => {
  if (autoSaveTimer.value) {
    clearTimeout(autoSaveTimer.value)
  }

  autoSaveTimer.value = setTimeout(() => {
    if (currentDocument.value) {
      const contentChanged = currentDocument.value.content !== lastSavedContent.value
      const titleChanged = currentDocument.value.title !== (lastSavedTitle.value || '')
      if (contentChanged || titleChanged) {
        saveDocument(true)
      }
    }
  }, 30000)
}

const createVersion = () => {
  if (!currentDocument.value || !currentDocumentId.value) return

  const doc = documentService.getById(currentDocumentId.value)
  if (doc) {
    const version = documentVersionService.createVersion(doc)
    if (version) {
      versions.value = documentVersionService.getVersions(currentDocumentId.value)
      selectedVersionId.value = version.id
    }
  }
}

const showVersionHistory = () => {
  if (!currentDocumentId.value) return
  versions.value = documentVersionService.getVersions(currentDocumentId.value)
  showHistoryPanel.value = true
  selectedVersionId.value = null
}

const selectVersion = (version: DocumentVersion) => {
  if (selectedVersionId.value === version.id) {
    selectedVersionId.value = null
    versionDiff.value = null
  } else {
    selectedVersionId.value = version.id
    if (currentDocumentId.value) {
      versionDiff.value = documentVersionService.getDiffWithPrevious(
        currentDocumentId.value,
        version.id
      )
    }
  }
}

const restoreVersion = (version: DocumentVersion) => {
  if (!currentDocument.value) return

  currentDocument.value.title = version.title
  currentDocument.value.content = version.content
  lastSavedContent.value = version.content
  saveDocument()
  showHistoryPanel.value = false
  versions.value = []
  selectedVersionId.value = null
  versionDiff.value = null
}

const formatTime = (date: Date) => {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 7) return `${days} 天前`
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const formatCommitHash = (id: string) => {
  const parts = id.replace('commit_', '').split('_')
  const hashPart = parts.length > 1 ? parts[1] : parts[0]
  return hashPart.substring(0, 7).toUpperCase()
}

const shareDocument = () => {
  if (currentDocument.value) {
    shareLink.value = shareService.getShareUrl(currentDocument.value.id) || ''
    showShareDialog.value = true
    copySuccess.value = false
  }
}

const copyLink = async () => {
  const success = await shareService.copyToClipboard(shareLink.value)
  if (success) {
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  }
}

const focusEditor = () => {
  // Focus handled by TiptapEditor component
}

const handleKeyDown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault()
    saveDocument()
  }
}

onMounted(() => {
  loadDocuments()
  loadCategoriesAndTags()
  loadUserName()
  settingsStore.loadSettings()

  document.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeyDown)
  if (autoSaveTimer.value) {
    clearTimeout(autoSaveTimer.value)
  }
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
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: var(--color-text-muted);
  transition: all 0.15s ease;
}

.add-btn:hover {
  background: var(--color-bg-gray);
  color: var(--color-primary);
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
  margin-bottom: 4px;
}

.category-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-muted);
}

.manage-categories-btn {
  font-size: 11px;
  color: var(--color-primary);
  background: transparent;
  border: none;
  cursor: pointer;
}

.manage-categories-btn:hover {
  text-decoration: underline;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 13px;
  color: var(--color-text-secondary);
  transition: background-color 0.15s ease;
}

.category-item:hover {
  background: var(--color-bg-gray);
}

.category-item.active {
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: 500;
}

.category-color {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.category-count {
  margin-left: auto;
  font-size: 11px;
  color: var(--color-text-muted);
}

.file-tree {
  flex: 1;
  overflow-y: auto;
  padding: 6px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color 0.1s ease;
}

.file-item:hover {
  background: var(--color-bg-gray);
}

.file-item.active {
  background: var(--color-primary-light);
}

.file-item.active .file-name {
  color: var(--color-primary);
  font-weight: 500;
}

.file-icon {
  flex-shrink: 0;
  color: var(--color-text-muted);
}

.file-name {
  flex: 1;
  font-size: 13px;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-delete {
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
  opacity: 0;
  transition: all 0.1s ease;
}

.file-item:hover .file-delete {
  opacity: 1;
}

.file-delete:hover {
  background: #fff1f0;
  color: #ff3b30;
}

.empty-tree {
  text-align: center;
  padding: 24px 16px;
  color: var(--color-text-muted);
}

.empty-tree p {
  font-size: 13px;
  margin-bottom: 12px;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid var(--color-border-light);
}

.user-section {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.user-section:hover {
  background: var(--color-bg-gray);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary) 0%, #9d4edd 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
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

.settings-icon {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  position: relative;
}

.editor-tabs {
  display: flex;
  background: var(--color-bg-white);
  border-bottom: 1px solid var(--color-border);
  overflow-x: auto;
}

.editor-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  font-size: 13px;
  color: var(--color-text-secondary);
  background: transparent;
  border-right: 1px solid var(--color-border-light);
  cursor: pointer;
  transition: all 0.1s ease;
  min-width: 120px;
  max-width: 200px;
}

.editor-tab:hover {
  background: var(--color-bg-gray);
}

.editor-tab.active {
  background: var(--color-bg-base);
  color: var(--color-text-primary);
  border-bottom: 2px solid var(--color-primary);
  margin-bottom: -1px;
}

.tab-icon {
  flex-shrink: 0;
  color: var(--color-text-muted);
}

.tab-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tab-close {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: var(--color-text-muted);
  opacity: 0;
  transition: all 0.1s ease;
}

.editor-tab:hover .tab-close,
.editor-tab.active .tab-close {
  opacity: 1;
}

.tab-close:hover {
  background: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.editor-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: var(--color-bg-white);
  border-bottom: 1px solid var(--color-border-light);
}

.title-input {
  flex: 1;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  border: none;
  background: transparent;
  outline: none;
  padding: 4px 0;
}

.title-input::placeholder {
  color: var(--color-text-placeholder);
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-dropdown {
  position: relative;
}

.toolbar-dropdown:hover .dropdown-menu,
.toolbar-dropdown:focus-within .dropdown-menu {
  display: block;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  min-width: 180px;
  max-height: 360px;
  overflow-y: auto;
  z-index: 100;
  display: none;
  padding: 4px 0;
}

.category-dropdown {
  right: auto;
  left: 0;
}

.tags-dropdown:hover .dropdown-menu {
  display: block;
}

.tags-dropdown .dropdown-menu {
  right: auto;
  left: 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  cursor: pointer;
  font-size: 13px;
  color: var(--color-text-primary);
  transition: background-color 0.15s ease;
}

.dropdown-item:hover {
  background: var(--color-bg-gray);
}

.dropdown-item.active {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.tag-checkbox {
  width: 16px;
  height: 16px;
  border: 2px solid var(--color-border);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.tag-checkbox.checked {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.dropdown-divider {
  height: 1px;
  background: var(--color-border-light);
  margin: 4px 0;
}

.toolbar-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: var(--color-text-muted);
  transition: all 0.15s ease;
}

.toolbar-btn:hover:not(:disabled) {
  background: var(--color-bg-gray);
  color: var(--color-text-primary);
}

.toolbar-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.save-status {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-left: 8px;
}

.save-status.saved {
  color: #34c759;
}

.editor-wrapper {
  flex: 1;
  overflow: hidden;
}

.empty-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
}

.empty-icon {
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-editor h3 {
  font-size: 18px;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin: 0 0 8px 0;
}

.empty-editor p {
  font-size: 14px;
  margin: 0 0 20px 0;
}

.history-panel {
  width: 320px;
  background: var(--color-bg-white);
  border-left: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  animation: slideIn 0.2s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border-light);
}

.history-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.history-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.empty-history {
  text-align: center;
  padding: 40px 20px;
  color: var(--color-text-muted);
}

.empty-history p {
  margin: 0 0 8px 0;
}

.empty-history .hint {
  font-size: 12px;
}

.version-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.version-item {
  padding: 12px 14px;
  background: var(--color-bg-gray);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid transparent;
}

.version-item:hover {
  background: var(--color-bg-hover);
}

.version-item.selected {
  background: var(--color-bg-white);
  border-color: var(--color-primary);
}

.version-commit {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.commit-hash {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-primary);
  background: var(--color-primary-light);
  padding: 2px 6px;
  border-radius: 4px;
}

.commit-badge {
  font-size: 10px;
  font-weight: 600;
  color: white;
  background: var(--color-primary);
  padding: 2px 5px;
  border-radius: 3px;
  text-transform: uppercase;
}

.version-message {
  font-size: 13px;
  color: var(--color-text-primary);
  margin-bottom: 4px;
  line-height: 1.4;
}

.version-meta {
  display: flex;
  gap: 8px;
  font-size: 11px;
  color: var(--color-text-muted);
}

.version-stats {
  display: flex;
  gap: 6px;
  margin-top: 6px;
}

.stat-add {
  font-size: 11px;
  font-weight: 600;
  color: #34c759;
  background: rgba(52, 199, 89, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.stat-remove {
  font-size: 11px;
  font-weight: 600;
  color: #ff3b30;
  background: rgba(255, 59, 48, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.version-preview {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--color-border-light);
}

.preview-title {
  font-size: 14px;
  margin-bottom: 8px;
  padding: 8px;
  background: var(--color-bg-gray);
  border-radius: var(--radius-sm);
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.preview-title {
  flex: 1;
  font-size: 14px;
  padding: 8px;
  background: var(--color-bg-gray);
  border-radius: var(--radius-sm);
}

.title-changed {
  font-size: 11px;
  color: var(--color-primary);
  background: var(--color-primary-light);
  padding: 4px 8px;
  border-radius: 4px;
}

.preview-diff {
  margin-bottom: 12px;
}

.diff-header {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
  margin-bottom: 6px;
  text-transform: uppercase;
}

.diff-content {
  background: #1e1e1e;
  border-radius: var(--radius-sm);
  padding: 8px;
  max-height: 200px;
  overflow-y: auto;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.5;
}

.diff-line {
  white-space: pre-wrap;
  word-break: break-all;
  padding: 2px 4px;
  border-radius: 2px;
}

.diff-add {
  background: rgba(52, 199, 89, 0.2);
  color: #34c759;
}

.diff-remove {
  background: rgba(255, 59, 48, 0.2);
  color: #ff3b30;
  text-decoration: line-through;
}

.diff-context {
  color: #8c8c8c;
}

.settings-dialog {
  width: 520px;
}

.category-dialog,
.tag-dialog {
  width: 480px;
}

.category-form,
.tag-form {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.color-input {
  width: 50px;
  height: 36px;
  padding: 2px;
  cursor: pointer;
}

.color-input-small {
  width: 36px;
  height: 30px;
  padding: 2px;
  cursor: pointer;
}

.category-list-dialog,
.tag-list-dialog {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-item-dialog,
.tag-item-dialog {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  background: var(--color-bg-gray);
  border-radius: var(--radius-sm);
}

.category-name-input,
.tag-name-input {
  flex: 1;
}

.settings-section {
  margin-bottom: 28px;
}

.settings-section:last-child {
  margin-bottom: 0;
}

.settings-section h4 {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-muted);
  margin-bottom: 14px;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border-light);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info {
  flex: 1;
}

.setting-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 2px;
}

.setting-desc {
  font-size: 12px;
  color: var(--color-text-muted);
}

.setting-input {
  width: 160px;
}

.about-info {
  text-align: center;
  padding: 20px;
  background: var(--color-bg-gray);
  border-radius: var(--radius-md);
}

.about-logo {
  font-size: 32px;
  color: var(--color-primary);
  margin-bottom: 8px;
}

.about-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.about-version {
  font-size: 12px;
  color: var(--color-text-muted);
}

.share-desc {
  color: var(--color-text-secondary);
  margin-bottom: 14px;
  font-size: 14px;
}

.share-link-container {
  display: flex;
  gap: 8px;
}

.share-link-input {
  flex: 1;
  background: var(--color-bg-gray);
  font-family: var(--font-mono);
  font-size: 13px;
}

.copy-success {
  color: #34c759;
  margin-top: 10px;
  font-size: 13px;
}
</style>
