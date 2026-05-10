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
      <div class="file-tree">
        <div
          v-for="doc in documents"
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
            <polyline points="14 2 14 8 20 8"/>
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
              <input v-model="userName" class="input setting-input" @change="saveUserName" />
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
import { documentVersionService, type DocumentVersion } from '../../services/storage/documentVersionService'
import { shareService } from '../../services/shareService'
import { useSettingsStore } from '../../stores/settingsStore'
import type { DocumentListItem } from '../../models/Document'

const settingsStore = useSettingsStore()

interface OpenDocument {
  id: string
  title: string
  content: string
}

const documents = ref<DocumentListItem[]>([])
const openDocuments = ref<OpenDocument[]>([])
const currentDocumentId = ref<string | null>(null)
const showSettingsDialog = ref(false)
const showShareDialog = ref(false)
const showHistoryPanel = ref(false)
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

const currentDocument = computed(() => {
  return openDocuments.value.find((doc) => doc.id === currentDocumentId.value) || null
})

const loadDocuments = () => {
  documents.value = documentService.getAll()
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

const createNewDocument = () => {
  const doc = documentService.create('无标题', '')
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

  if (!isAuto) {
    const lastContent = lastSavedContent.value || ''
    const lastTitle = lastSavedTitle.value || ''
    const contentChanged = content !== lastContent
    const titleChanged = title !== lastTitle
    
    if (!contentChanged && !titleChanged) {
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
    }

    const openIndex = openDocuments.value.findIndex((d) => d.id === doc.id)
    if (openIndex !== -1) {
      openDocuments.value[openIndex].title = title
      openDocuments.value[openIndex].content = content
    }

    lastSavedContent.value = content
    lastSavedTitle.value = title

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

onMounted(() => {
  loadDocuments()
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

const handleKeyDown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault()
    saveDocument()
  }
}
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
