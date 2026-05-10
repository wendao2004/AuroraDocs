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
        <div class="doc-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        <div class="doc-info">
          <div class="doc-title">{{ doc.title || '无标题文档' }}</div>
          <div class="doc-meta">{{ formatDate(doc.updatedAt) }}</div>
        </div>
        <div class="doc-actions" @click.stop>
          <button class="action-btn" @click="handleShare(doc.id)" title="分享">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="18" cy="5" r="3"/>
              <circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          </button>
          <button class="action-btn danger" @click="handleDelete(doc.id)" title="删除">
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
      <div class="dialog">
        <div class="dialog-header">
          <h3>确认删除</h3>
          <button class="close-btn" @click="showDeleteDialog = false">×</button>
        </div>
        <div class="dialog-content">
          <p class="delete-warning">确定要删除这个文档吗？此操作不可撤销。</p>
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
import { shareService } from '../services/shareService'
import type { DocumentListItem } from '../models/Document'

const router = useRouter()
const documents = ref<DocumentListItem[]>([])
const showShareDialog = ref(false)
const showDeleteDialog = ref(false)
const shareLink = ref('')
const copySuccess = ref(false)
const deleteTargetId = ref<string | null>(null)

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

const loadDocuments = () => {
  documents.value = documentService.getAll()
}

const handleCreate = () => {
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
  loadDocuments()
})
</script>

<style scoped>
.documents-page {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.page-header h2 {
  font-size: 22px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.doc-count {
  font-size: 13px;
  color: var(--color-text-muted);
}

.empty-state {
  text-align: center;
  padding: 60px 40px;
  background: var(--color-bg-white);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-light);
}

.empty-icon {
  color: var(--color-text-muted);
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 6px 0;
}

.empty-state p {
  font-size: 14px;
  color: var(--color-text-muted);
  margin: 0 0 20px 0;
}

.document-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.document-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: var(--color-bg-white);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color 0.15s ease;
  border: 1px solid transparent;
}

.document-item:hover {
  background: var(--color-bg-gray);
}

.doc-icon {
  color: var(--color-text-muted);
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
}

.doc-meta {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 2px;
}

.doc-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.document-item:hover .doc-actions {
  opacity: 1;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: var(--color-text-muted);
  transition: all 0.15s ease;
}

.action-btn:hover {
  background: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.action-btn.danger:hover {
  background: #fff1f0;
  color: #ff3b30;
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

.delete-warning {
  color: var(--color-text-secondary);
  line-height: 1.6;
  font-size: 14px;
}
</style>
