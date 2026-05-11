<template>
  <div class="documents-page">
    <div class="page-header">
      <div class="header-left">
        <h2>文档</h2>
        <span class="doc-count">{{ documents.length }} 个文档</span>
      </div>
      <button class="btn btn-primary" @click="handleCreate">
        <span>+</span> 新建文档
      </button>
    </div>

    <div class="filter-section">
      <input 
        v-model="searchKeyword" 
        class="input search-input" 
        placeholder="搜索文档..." 
        @input="handleSearch"
      />
      <select v-model="filterCategory" class="input filter-select" @change="applyFilters">
          <option value="">全部分类</option>
          <option value="uncategorized">未分类</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
    </div>

    <div v-if="documents.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      </div>
      <h3>开始创作</h3>
      <p>创建你的第一个文档，开启知识管理之旅</p>
      <button class="btn btn-primary" @click="handleCreate">创建第一个文档</button>
    </div>

    <div v-else class="document-list">
      <div
        v-for="doc in documents"
        :key="doc.id"
        class="document-item"
        @click="handleEdit(doc.id)"
      >
        <div class="doc-header">
          <div class="doc-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <div class="doc-info">
            <div class="doc-title">{{ doc.title || '无标题文档' }}</div>
            <div class="doc-meta">
              <span v-if="getCategory(doc.categoryId)" class="category-badge" :style="{ backgroundColor: getCategory(doc.categoryId)?.color + '20', color: getCategory(doc.categoryId)?.color }">
                {{ getCategory(doc.categoryId)?.name }}
              </span>
              <span class="doc-date">{{ formatDate(doc.updatedAt) }}</span>
            </div>
          </div>
        </div>
        <div class="doc-tags" v-if="doc.tags && doc.tags.length > 0">
          <span 
            v-for="tagId in doc.tags.slice(0, 5)" 
            :key="tagId"
            class="tag-badge"
            :style="{ backgroundColor: getTag(tagId)?.color + '20', color: getTag(tagId)?.color }"
          >
            {{ getTag(tagId)?.name }}
          </span>
          <span v-if="doc.tags.length > 5" class="tag-more">+{{ doc.tags.length - 5 }}</span>
        </div>
        <div class="doc-actions">
          <button class="action-btn" @click.stop="handleShare(doc.id)" title="分享">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="18" cy="5" r="3"/>
              <circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          </button>
          <button class="action-btn danger" @click.stop="handleDelete(doc.id)" title="删除">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
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

    <div v-if="showDeleteDialog" class="dialog-overlay" @click.self="showDeleteDialog = false">
      <div class="dialog delete-dialog">
        <div class="dialog-header">
          <h3>确认删除</h3>
          <button class="close-btn" @click="showDeleteDialog = false">×</button>
        </div>
        <div class="dialog-content">
          <div class="delete-warning">
            <svg class="warning-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <p>确定要删除这个文档吗？此操作不可撤销。</p>
          </div>
          <div class="dialog-actions">
            <button class="btn btn-secondary" @click="showDeleteDialog = false">取消</button>
            <button class="btn btn-danger" @click="confirmDelete">删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { documentService } from '../services/storage/documentService'
import { categoryService } from '../services/storage/categoryService'
import { tagService } from '../services/storage/tagService'
import { shareService } from '../services/shareService'
import type { DocumentListItem, Category, Tag } from '../models/Document'

const router = useRouter()
const documents = ref<DocumentListItem[]>([])
const categories = ref<Category[]>([])
const tags = ref<Tag[]>([])
const showShareDialog = ref(false)
const showDeleteDialog = ref(false)
const shareLink = ref('')
const copySuccess = ref(false)
const deleteTargetId = ref<string | null>(null)
const searchKeyword = ref('')
const filterCategory = ref('')

const formatDate = (date: Date) => {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return '今天 ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  if (days === 1) return '昨天'
  if (days < 7) return `${days} 天前`
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

const getCategory = (categoryId: string | null) => {
  if (!categoryId) return null
  return categories.value.find((c) => c.id === categoryId) || null
}

const getTag = (tagId: string) => {
  return tags.value.find((t) => t.id === tagId) || null
}

const loadDocuments = () => {
  if (searchKeyword.value) {
    documents.value = documentService.search(searchKeyword.value)
  } else if (filterCategory.value === 'uncategorized') {
    documents.value = documentService.getAll().filter(doc => !doc.categoryId)
  } else if (filterCategory.value) {
    documents.value = documentService.getByCategory(filterCategory.value)
  } else {
    documents.value = documentService.getAll()
  }
}

const loadCategoriesAndTags = () => {
  categories.value = categoryService.getAll()
  tags.value = tagService.getAll()
}

const handleSearch = () => {
  loadDocuments()
}

const applyFilters = () => {
  loadDocuments()
}

const handleCreate = () => {
  const newDoc = documentService.create('无标题文档', '', null, [])
  const event = new CustomEvent('document-created', { detail: { id: newDoc.id } })
  window.dispatchEvent(event)
  router.push('/')
}

const handleEdit = (id: string) => {
  router.push(`/?id=${id}`)
}

const handleShare = (id: string) => {
  shareLink.value = shareService.getShareUrl(id) || ''
  showShareDialog.value = true
  copySuccess.value = false
}

const handleDelete = (id: string) => {
  deleteTargetId.value = id
  showDeleteDialog.value = true
}

const confirmDelete = () => {
  if (deleteTargetId.value) {
    documentService.delete(deleteTargetId.value)
    loadDocuments()
    showDeleteDialog.value = false
    deleteTargetId.value = null
    const event = new CustomEvent('document-deleted', { detail: {} })
    window.dispatchEvent(event)
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

onMounted(() => {
  loadCategoriesAndTags()
  loadDocuments()
})
</script>

<style scoped>
.documents-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
  height: calc(100vh - 60px);
  overflow-y: auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.page-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.doc-count {
  font-size: 13px;
  color: var(--color-text-muted);
  padding: 4px 10px;
  background: var(--color-bg-gray);
  border-radius: 12px;
}

.filter-section {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.search-input {
  flex: 1;
  padding: 10px 14px;
  font-size: 14px;
}

.filter-select {
  width: 180px;
  padding: 10px 14px;
  font-size: 14px;
}

.empty-state {
  text-align: center;
  padding: 80px 40px;
  background: var(--color-bg-white);
  border-radius: var(--radius-lg);
  border: 2px dashed var(--color-border-light);
}

.empty-icon {
  color: var(--color-text-muted);
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 8px 0;
}

.empty-state p {
  font-size: 14px;
  color: var(--color-text-muted);
  margin: 0 0 24px 0;
}

.document-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.document-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: var(--color-bg-white);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid var(--color-border-light);
}

.document-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-border);
}

.doc-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.doc-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-light);
  border-radius: var(--radius-sm);
  color: var(--color-primary);
  flex-shrink: 0;
}

.doc-info {
  flex: 1;
  min-width: 0;
}

.doc-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.doc-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.category-badge {
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 500;
  border-radius: 4px;
}

.doc-date {
  font-size: 12px;
  color: var(--color-text-muted);
}

.doc-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.tag-badge {
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 500;
  border-radius: 4px;
}

.tag-more {
  font-size: 11px;
  color: var(--color-text-muted);
  padding: 2px 4px;
}

.doc-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--color-border-light);
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--color-text-muted);
  transition: all 0.15s ease;
}

.action-btn:hover {
  background: var(--color-bg-gray);
  color: var(--color-text-primary);
  border-color: var(--color-border);
}

.action-btn.danger:hover {
  background: #fff1f0;
  color: #ff3b30;
  border-color: #ffccc7;
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

.delete-dialog {
  border-color: #ffccc7;
  box-shadow: 0 4px 20px rgba(255, 59, 48, 0.2);
}

.delete-dialog .dialog-header h3 {
  color: #ff3b30;
}

.delete-warning {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  font-size: 14px;
  padding: 12px;
  background: #fff1f0;
  border-radius: var(--radius-sm);
  border-left: 4px solid #ff3b30;
}

.warning-icon {
  color: #ff9500;
  flex-shrink: 0;
}

.delete-warning p {
  margin: 0;
}
</style>
