<template>
  <div class="editor-page">
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

    <div v-if="currentDocument" class="editor-wrapper">
      <div class="editor-toolbar">
        <input
          v-model="currentDocument.title"
          class="title-input"
          placeholder="文档标题..."
          @input="saveDocument()"
        />
        <div class="toolbar-actions">
          <div class="toolbar-dropdown">
            <button class="toolbar-btn" title="分类" @click.stop="showCategoryDropdown = !showCategoryDropdown">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2z"/>
              </svg>
              <span v-if="getCurrentDocumentCategory()">{{ getCurrentDocumentCategory()?.name }}</span>
            </button>
            <div class="dropdown-menu" v-show="showCategoryDropdown">
              <div class="dropdown-item" :class="{ active: !getCurrentDocumentCategory() }" @click="setDocumentCategory(null); showCategoryDropdown = false">
                无分类
              </div>
              <div 
                v-for="cat in categories" 
                :key="cat.id"
                class="dropdown-item" 
                :class="{ active: getCurrentDocumentCategory()?.id === cat.id }"
                @click="setDocumentCategory(cat.id); showCategoryDropdown = false"
              >
                <span class="category-color" :style="{ backgroundColor: cat.color }"></span>
                {{ cat.name }}
              </div>
              <div class="dropdown-divider"></div>
              <div class="dropdown-item manage-link" @click="showCategoryManager = true; showCategoryDropdown = false">管理分类</div>
            </div>
          </div>

          <div class="toolbar-dropdown">
            <button class="toolbar-btn" title="标签" @click.stop="showTagDropdown = !showTagDropdown">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
              <span v-if="currentDocument.tags.length > 0">{{ currentDocument.tags.length }}</span>
            </button>
            <div class="dropdown-menu" v-show="showTagDropdown">
              <div 
                v-for="tag in tags" 
                :key="tag.id"
                class="dropdown-item" 
                :class="{ active: currentDocument.tags.includes(tag.id) }"
                @click="toggleDocumentTag(tag.id); showTagDropdown = false"
              >
                <span class="tag-color" :style="{ backgroundColor: tag.color }"></span>
                {{ tag.name }}
              </div>
              <div class="dropdown-divider"></div>
              <div class="dropdown-item manage-link" @click="showTagManager = true; showTagDropdown = false">管理标签</div>
            </div>
          </div>

          <button class="toolbar-btn" @click="saveVersion" title="保存版本">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
            </svg>
          </button>

          <button class="toolbar-btn" @click="showHistoryPanel = true" title="版本历史">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </button>

          <button class="toolbar-btn" @click="showShareDialog = true" title="分享">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 2h3a1 1 0 0 1 1 1v3M18 2c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM10 2c0 1.105-1.343 2-3 2S4 3.105 4 2 5.343 0 8 0s3 .895 3 2zm3 18h3a1 1 0 0 0 1-1v-3M21 16c0-1.105 1.343-2 3-2s3 .895 3 2-1.343 2-3 2-3-.895-3-2zM8 18c0-1.105 1.343-2 3-2s3 .895 3 2-1.343 2-3 2-3-.895-3-2z"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="editor-container">
        <TiptapEditor
          ref="editorRef"
          v-model="currentDocument.content"
          :init-content="currentDocument.content"
          @update="saveDocument"
        />
      </div>
    </div>

    <div v-else class="empty-editor">
      <div class="empty-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      </div>
      <h3>开始编写文档</h3>
      <p>创建一个新文档，开始你的创作之旅</p>
      <button class="btn btn-primary" @click="createNewDocument">创建文档</button>
    </div>

    <div v-if="showCategoryManager" class="dialog-overlay" @click.self="showCategoryManager = false">
      <div class="dialog category-dialog">
        <div class="dialog-header">
          <h3>管理分类</h3>
          <button class="close-btn" @click="showCategoryManager = false">×</button>
        </div>
        <div class="dialog-content">
          <div class="category-list">
            <div 
              v-for="cat in categories" 
              :key="cat.id" 
              class="category-item"
            >
              <span class="category-color" :style="{ backgroundColor: cat.color }"></span>
              <span class="category-name">{{ cat.name }}</span>
              <div class="category-actions">
                <button class="action-btn edit" @click="editCategory(cat)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button class="action-btn delete" @click="deleteCategory(cat.id)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                    <line x1="10" y1="11" x2="10" y2="17"/>
                    <line x1="14" y1="11" x2="14" y2="17"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div class="add-category">
            <div class="form-row">
              <input v-model="newCategoryName" class="input" placeholder="分类名称" />
              <input v-model="newCategoryColor" type="color" class="color-picker" />
              <button class="btn btn-primary" @click="addCategory">添加</button>
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
          <div class="tag-list">
            <div 
              v-for="tag in tags" 
              :key="tag.id" 
              class="tag-item"
            >
              <span class="tag-color" :style="{ backgroundColor: tag.color }"></span>
              <span class="tag-name">{{ tag.name }}</span>
              <div class="tag-actions">
                <button class="action-btn edit" @click="editTag(tag)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button class="action-btn delete" @click="deleteTag(tag.id)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                    <line x1="10" y1="11" x2="10" y2="17"/>
                    <line x1="14" y1="11" x2="14" y2="17"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div class="add-tag">
            <div class="form-row">
              <input v-model="newTagName" class="input" placeholder="标签名称" />
              <input v-model="newTagColor" type="color" class="color-picker" />
              <button class="btn btn-primary" @click="addTag">添加</button>
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
          <div class="share-options">
            <button class="share-btn" @click="copyShareLink">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              <span>复制链接</span>
            </button>
            <button class="share-btn" @click="exportDocument">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              <span>导出文档</span>
            </button>
          </div>
          <div v-if="shareSuccess" class="success-message">✓ 链接已复制到剪贴板</div>
        </div>
      </div>
    </div>

    <div v-if="showHistoryPanel" class="dialog-overlay" @click.self="showHistoryPanel = false">
      <div class="dialog history-dialog">
        <div class="dialog-header">
          <h3>版本历史</h3>
          <button class="close-btn" @click="showHistoryPanel = false">×</button>
        </div>
        <div class="dialog-content history-content">
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, onBeforeUnmount } from 'vue'
import TiptapEditor from '../components/editor/TiptapEditor.vue'
import { documentService } from '../services/storage/documentService'
import { categoryService } from '../services/storage/categoryService'
import { tagService } from '../services/storage/tagService'
import { documentVersionService, type DocumentVersion } from '../services/storage/documentVersionService'
import { shareService } from '../services/shareService'
import type { DocumentListItem, Category, Tag } from '../models/Document'

const documents = ref<DocumentListItem[]>([])
const categories = ref<Category[]>([])
const tags = ref<Tag[]>([])
const openDocuments = ref<{
  id: string;
  title: string;
  content: string;
  categoryId: string | null;
  tags: string[];
}[]>([])
const currentDocumentId = ref<string | null>(null)
const editorRef = ref<InstanceType<typeof TiptapEditor> | null>(null)
const showSettingsDialog = ref(false)
const showShareDialog = ref(false)
const showHistoryPanel = ref(false)
const showCategoryManager = ref(false)
const showTagManager = ref(false)
const showCategoryDropdown = ref(false)
const showTagDropdown = ref(false)
const shareSuccess = ref(false)
const versions = ref<DocumentVersion[]>([])
const selectedVersionId = ref<string | null>(null)
const versionDiff = ref<{
  lines: string[];
  titleDiff?: boolean;
} | null>(null)
const newCategoryName = ref('')
const newCategoryColor = ref('#1890ff')
const editingCategory = ref<Category | null>(null)
const newTagName = ref('')
const newTagColor = ref('#52c41a')
const editingTag = ref<Tag | null>(null)
const lastSavedContent = ref('')
const lastSavedTitle = ref('')
const lastSavedCategoryId = ref<string | null>(null)
const lastSavedTags = ref<string[]>([])

const currentDocument = computed(() => {
  return openDocuments.value.find(doc => doc.id === currentDocumentId.value)
})

const getCurrentDocumentCategory = () => {
  if (!currentDocument.value?.categoryId) return null
  return categories.value.find(cat => cat.id === currentDocument.value?.categoryId)
}

const loadDocuments = () => {
  documents.value = documentService.getAll()
}

const loadCategories = () => {
  categories.value = categoryService.getAll()
}

const loadTags = () => {
  tags.value = tagService.getAll()
}

const createNewDocument = () => {
  const newDoc = documentService.create('无标题文档', '', null, [])
  openDocument(newDoc.id)
}

const openDocument = (id: string) => {
  const doc = documentService.getById(id)
  if (!doc) return
  
  if (openDocuments.value.find(d => d.id === id)) {
    switchDocument(id)
    return
  }
  
  openDocuments.value.push({
    id: doc.id,
    title: doc.title,
    content: doc.content,
    categoryId: doc.categoryId,
    tags: [...doc.tags]
  })
  currentDocumentId.value = id
  lastSavedContent.value = doc.content
  lastSavedTitle.value = doc.title
  lastSavedCategoryId.value = doc.categoryId
  lastSavedTags.value = [...doc.tags]
  
  nextTick(() => {
    if (editorRef.value) {
      editorRef.value.setContent(doc.content)
    }
  })
}

const switchDocument = (id: string) => {
  currentDocumentId.value = id
  const doc = openDocuments.value.find(d => d.id === id)
  if (doc) {
    lastSavedContent.value = doc.content
    lastSavedTitle.value = doc.title
    lastSavedCategoryId.value = doc.categoryId
    lastSavedTags.value = [...doc.tags]
  }
}

const closeDocument = (id: string) => {
  const index = openDocuments.value.findIndex(d => d.id === id)
  if (index > -1) {
    openDocuments.value.splice(index, 1)
    if (currentDocumentId.value === id) {
      currentDocumentId.value = openDocuments.value[0]?.id || null
    }
  }
}

const saveDocument = () => {
  if (!currentDocument.value) return
  
  const hasChanges = currentDocument.value.content !== lastSavedContent.value ||
                     currentDocument.value.title !== lastSavedTitle.value ||
                     currentDocument.value.categoryId !== lastSavedCategoryId.value ||
                     JSON.stringify(currentDocument.value.tags) !== JSON.stringify(lastSavedTags.value)
  
  if (!hasChanges) return
  
  documentService.update(currentDocument.value.id, {
    title: currentDocument.value.title,
    content: currentDocument.value.content,
    categoryId: currentDocument.value.categoryId,
    tags: [...currentDocument.value.tags]
  })
  
  lastSavedContent.value = currentDocument.value.content
  lastSavedTitle.value = currentDocument.value.title
  lastSavedCategoryId.value = currentDocument.value.categoryId
  lastSavedTags.value = [...currentDocument.value.tags]
  
  loadDocuments()
}

const setDocumentCategory = (categoryId: string | null) => {
  if (currentDocument.value) {
    currentDocument.value.categoryId = categoryId
    saveDocument()
  }
}

const toggleDocumentTag = (tagId: string) => {
  if (currentDocument.value) {
    const index = currentDocument.value.tags.indexOf(tagId)
    if (index > -1) {
      currentDocument.value.tags.splice(index, 1)
    } else {
      currentDocument.value.tags.push(tagId)
    }
    saveDocument()
  }
}

const addCategory = () => {
  if (newCategoryName.value.trim()) {
    categoryService.create(newCategoryName.value.trim(), newCategoryColor.value)
    loadCategories()
    newCategoryName.value = ''
    newCategoryColor.value = '#1890ff'
  }
}

const editCategory = (cat: Category) => {
  editingCategory.value = cat
  newCategoryName.value = cat.name
  newCategoryColor.value = cat.color
}

const deleteCategory = (id: string) => {
  categoryService.delete(id)
  loadCategories()
  openDocuments.value.forEach(doc => {
    if (doc.categoryId === id) {
      doc.categoryId = null
    }
  })
}

const addTag = () => {
  if (newTagName.value.trim()) {
    tagService.create(newTagName.value.trim(), newTagColor.value)
    loadTags()
    newTagName.value = ''
    newTagColor.value = '#52c41a'
  }
}

const editTag = (tag: Tag) => {
  editingTag.value = tag
  newTagName.value = tag.name
  newTagColor.value = tag.color
}

const deleteTag = (id: string) => {
  tagService.delete(id)
  loadTags()
  openDocuments.value.forEach(doc => {
    const index = doc.tags.indexOf(id)
    if (index > -1) {
      doc.tags.splice(index, 1)
    }
  })
}

const saveVersion = () => {
  if (currentDocument.value) {
    documentVersionService.saveVersion(currentDocument.value.id, {
      title: currentDocument.value.title,
      content: currentDocument.value.content,
      description: `版本 ${Date.now()}`
    })
  }
}

const loadVersions = () => {
  if (currentDocumentId.value) {
    versions.value = documentVersionService.getVersions(currentDocumentId.value)
  }
}

const selectVersion = (version: DocumentVersion) => {
  selectedVersionId.value = version.id
  loadVersionDiff(version)
}

const loadVersionDiff = (version: DocumentVersion) => {
  if (!currentDocument.value) return
  
  const prevVersion = versions.value.find(v => v.createdAt < version.createdAt)
  if (!prevVersion) {
    versionDiff.value = {
      lines: version.content.split('\n'),
      titleDiff: false
    }
    return
  }
  
  const currentLines = version.content.split('\n')
  const prevLines = prevVersion.content.split('\n')
  const diffLines: string[] = []
  
  currentLines.forEach((line, i) => {
    if (line !== prevLines[i]) {
      if (prevLines[i]) {
        diffLines.push(`-${prevLines[i]}`)
      }
      diffLines.push(`+${line}`)
    } else {
      diffLines.push(` ${line}`)
    }
  })
  
  versionDiff.value = {
    lines: diffLines,
    titleDiff: version.title !== prevVersion.title
  }
}

const restoreVersion = (version: DocumentVersion) => {
  if (currentDocument.value) {
    currentDocument.value.title = version.title
    currentDocument.value.content = version.content
    saveDocument()
    showHistoryPanel.value = false
    selectedVersionId.value = null
  }
}

const formatCommitHash = (id: string) => {
  return id.slice(-7)
}

const formatTime = (date: Date) => {
  return new Date(date).toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const copyShareLink = async () => {
  if (currentDocument.value) {
    await shareService.copyShareLink(currentDocument.value.id)
    shareSuccess.value = true
    setTimeout(() => {
      shareSuccess.value = false
    }, 2000)
  }
}

const exportDocument = () => {
  if (currentDocument.value) {
    shareService.exportDocument(currentDocument.value)
  }
}

const handleOpenDocument = (event: Event) => {
  const customEvent = event as CustomEvent<{ id: string }>
  if (customEvent.detail?.id) {
    openDocument(customEvent.detail.id)
  }
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.toolbar-dropdown')) {
    showCategoryDropdown.value = false
    showTagDropdown.value = false
  }
}

watch(currentDocumentId, () => {
  loadVersions()
})

onMounted(() => {
  loadDocuments()
  loadCategories()
  loadTags()
  
  const firstDoc = documents.value[0]
  if (firstDoc) {
    openDocument(firstDoc.id)
  }
  
  window.addEventListener('open-document', handleOpenDocument)
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  window.removeEventListener('open-document', handleOpenDocument)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.editor-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-tabs {
  display: flex;
  gap: 4px;
  padding: 8px 12px;
  background: var(--color-bg-gray);
  border-bottom: 1px solid var(--color-border-light);
  overflow-x: auto;
}

.editor-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--color-bg-white);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 13px;
  color: var(--color-text-secondary);
  transition: all 0.15s ease;
  border: 1px solid var(--color-border-light);
}

.editor-tab:hover {
  background: var(--color-bg-hover);
}

.editor-tab.active {
  background: var(--color-bg-white);
  color: var(--color-text-primary);
  border-color: var(--color-primary);
}

.tab-icon {
  color: var(--color-text-muted);
}

.tab-name {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tab-close {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: var(--color-text-muted);
  opacity: 0;
  transition: all 0.15s ease;
}

.editor-tab:hover .tab-close {
  opacity: 1;
}

.tab-close:hover {
  background: var(--color-bg-gray);
  color: var(--color-text-primary);
}

.editor-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: var(--color-bg-white);
  border-bottom: 1px solid var(--color-border-light);
}

.title-input {
  flex: 1;
  max-width: 400px;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  background: transparent;
  border: none;
  outline: none;
  padding: 6px 12px;
}

.title-input::placeholder {
  color: var(--color-text-muted);
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.toolbar-dropdown {
  position: relative;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--color-text-secondary);
  font-size: 13px;
  transition: all 0.15s ease;
}

.toolbar-btn:hover {
  background: var(--color-bg-gray);
  color: var(--color-text-primary);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  background: var(--color-bg-white);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  min-width: 180px;
  z-index: 100;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 13px;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.dropdown-item:hover {
  background: var(--color-bg-gray);
}

.dropdown-item.active {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.dropdown-divider {
  height: 1px;
  background: var(--color-border-light);
  margin: 4px 0;
}

.manage-link {
  color: var(--color-primary);
}

.category-color,
.tag-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.editor-container {
  flex: 1;
  overflow: hidden;
}

.empty-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: var(--color-bg-white);
}

.empty-icon {
  color: var(--color-text-muted);
  margin-bottom: 16px;
}

.empty-editor h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 6px 0;
}

.empty-editor p {
  font-size: 14px;
  color: var(--color-text-muted);
  margin: 0 0 20px 0;
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
  border-radius: var(--radius-lg);
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

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 14px;
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

.category-dialog,
.tag-dialog {
  max-width: 520px;
}

.category-list,
.tag-list {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 16px;
}

.category-item,
.tag-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: var(--radius-sm);
  transition: background-color 0.15s ease;
}

.category-item:hover,
.tag-item:hover {
  background: var(--color-bg-gray);
}

.category-name,
.tag-name {
  flex: 1;
  font-size: 14px;
  color: var(--color-text-primary);
}

.category-actions,
.tag-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: var(--color-text-muted);
  opacity: 0;
  transition: all 0.15s ease;
}

.category-item:hover .action-btn,
.tag-item:hover .action-btn {
  opacity: 1;
}

.action-btn:hover.edit {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.action-btn:hover.delete {
  background: #fff1f0;
  color: var(--color-danger);
}

.form-row {
  display: flex;
  gap: 10px;
}

.input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--color-text-primary);
  background: var(--color-bg-white);
  outline: none;
  transition: border-color 0.15s ease;
}

.input:focus {
  border-color: var(--color-primary);
}

.color-picker {
  width: 48px;
  height: 36px;
  padding: 2px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  background: transparent;
}

.add-category,
.add-tag {
  padding-top: 16px;
  border-top: 1px solid var(--color-border-light);
}

.share-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.share-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: var(--color-bg-gray);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 14px;
  color: var(--color-text-primary);
  transition: background-color 0.15s ease;
}

.share-btn:hover {
  background: var(--color-border);
}

.success-message {
  margin-top: 16px;
  padding: 10px 12px;
  background: var(--color-success-light);
  color: var(--color-success);
  border-radius: var(--radius-sm);
  font-size: 13px;
  text-align: center;
}

.history-dialog {
  width: 560px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.history-dialog .dialog-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.empty-history {
  text-align: center;
  padding: 40px;
}

.empty-history p {
  font-size: 14px;
  color: var(--color-text-muted);
  margin: 0 0 8px 0;
}

.empty-history .hint {
  font-size: 12px;
}

.version-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.version-item {
  padding: 12px;
  background: var(--color-bg-gray);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.version-item:hover {
  background: var(--color-border);
}

.version-item.selected {
  background: var(--color-primary-light);
}

.version-commit {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.commit-hash {
  font-family: monospace;
  font-size: 13px;
  color: var(--color-primary);
  font-weight: 600;
}

.commit-badge {
  font-size: 10px;
  padding: 2px 6px;
  background: var(--color-success);
  color: white;
  border-radius: 4px;
}

.version-message {
  font-size: 14px;
  color: var(--color-text-primary);
  margin-bottom: 6px;
}

.version-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: var(--color-text-muted);
}

.version-stats {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.stat-add {
  font-size: 12px;
  color: var(--color-success);
  font-weight: 500;
}

.stat-remove {
  font-size: 12px;
  color: var(--color-danger);
  font-weight: 500;
}

.version-preview {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--color-border-light);
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.preview-title {
  font-size: 14px;
}

.title-changed {
  font-size: 11px;
  padding: 2px 6px;
  background: var(--color-warning-light);
  color: var(--color-warning);
  border-radius: 4px;
}

.preview-diff {
  margin-bottom: 12px;
}

.diff-header {
  margin-bottom: 8px;
}

.diff-label {
  font-size: 12px;
  color: var(--color-text-muted);
}

.diff-content {
  background: #1e1e1e;
  border-radius: var(--radius-sm);
  padding: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.diff-line {
  font-family: monospace;
  font-size: 12px;
  line-height: 1.4;
  color: #d4d4d4;
}

.diff-add {
  color: #4ec9b0;
}

.diff-remove {
  color: #f14c4c;
}

.version-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
