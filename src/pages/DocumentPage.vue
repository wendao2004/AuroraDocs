<template>
  <div class="documents-page">
    <div class="page-header">
      <div class="header-left">
        <h2>📁 文档管理</h2>
        <span class="doc-count">{{ documents.length }} 个文档</span>
      </div>
      <button class="btn btn-primary" @click="handleCreate">
        <span>+</span> 新建文档
      </button>
    </div>

    <div v-if="documents.length === 0" class="empty-state">
      <div class="empty-icon">📝</div>
      <h3>开始创作</h3>
      <p>创建你的第一个文档，开启知识管理之旅</p>
      <button class="btn btn-primary" @click="handleCreate">创建第一个文档</button>
    </div>

    <div v-else class="document-grid">
      <div
        v-for="doc in documents"
        :key="doc.id"
        class="document-card"
        @click="handleEdit(doc.id)"
      >
        <div class="card-header">
          <div class="card-icon">📄</div>
          <div class="card-actions" @click.stop>
            <button class="action-btn" title="分享" @click="handleShare(doc.id)">分享</button>
            <button class="action-btn danger" title="删除" @click="handleDelete(doc.id)">删除</button>
          </div>
        </div>
        <div class="card-body">
          <h4 class="card-title">{{ doc.title || '无标题文档' }}</h4>
          <div class="card-meta">
            <span class="meta-item">
              <span class="meta-icon">🕐</span>
              {{ formatDate(doc.updatedAt) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showShareDialog" class="dialog-overlay" @click.self="showShareDialog = false">
      <div class="dialog">
        <div class="dialog-header">
          <h3>🔗 分享文档</h3>
          <button class="close-btn" @click="showShareDialog = false">×</button>
        </div>
        <div class="dialog-content">
          <p class="share-desc">复制以下链接分享给其他人：</p>
          <div class="share-link-container">
            <input v-model="shareLink" readonly class="input share-link-input" />
            <button class="btn btn-primary" @click="copyLink">复制</button>
          </div>
          <p v-if="copySuccess" class="copy-success">✓ 复制成功！</p>
        </div>
      </div>
    </div>

    <div v-if="showDeleteDialog" class="dialog-overlay" @click.self="showDeleteDialog = false">
      <div class="dialog">
        <div class="dialog-header">
          <h3>⚠️ 确认删除</h3>
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
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.header-left {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.page-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.doc-count {
  font-size: 14px;
  color: var(--color-text-muted);
  background: var(--color-bg-white);
  padding: 4px 12px;
  border-radius: 20px;
  border: 1px solid var(--color-border-light);
}

.empty-state {
  text-align: center;
  padding: 80px 40px;
  background: var(--color-bg-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 24px;
}

.empty-state h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 8px 0;
}

.empty-state p {
  font-size: 14px;
  color: var(--color-text-muted);
  margin: 0 0 24px 0;
}

.document-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.document-card {
  background: var(--color-bg-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-light);
  cursor: pointer;
  transition: all 0.25s ease;
  overflow: hidden;
}

.document-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
  border-color: var(--color-primary);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 16px 0 16px;
}

.card-icon {
  font-size: 32px;
}

.card-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.document-card:hover .card-actions {
  opacity: 1;
}

.action-btn {
  padding: 6px 10px;
  font-size: 12px;
  background: var(--color-bg-gray);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.15s ease;
  color: var(--color-text-secondary);
}

.action-btn:hover {
  background: var(--color-bg-hover);
}

.action-btn.danger {
  color: var(--color-danger);
}

.action-btn.danger:hover {
  background: var(--color-danger-light);
}

.card-body {
  padding: 12px 16px 20px 16px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 12px 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-meta {
  display: flex;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--color-text-muted);
}

.share-desc {
  color: var(--color-text-secondary);
  margin-bottom: 16px;
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
  color: var(--color-success) !important;
  margin-top: 12px !important;
  font-weight: 500;
}

.delete-warning {
  color: var(--color-text-secondary);
  line-height: 1.6;
}
</style>
