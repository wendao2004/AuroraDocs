<template>
  <div class="documents-page">
    <div class="page-header">
      <h2>文档管理</h2>
      <button class="btn btn-primary" @click="handleCreate">新建文档</button>
    </div>
    <div v-if="documents.length === 0" class="empty-state">
      <p>暂无文档</p>
      <button class="btn btn-secondary" @click="handleCreate">创建第一个文档</button>
    </div>
    <div v-else class="document-list">
      <div
        v-for="doc in documents"
        :key="doc.id"
        class="document-item"
        @click="handleEdit(doc.id)"
      >
        <div class="document-info">
          <div class="document-title">{{ doc.title }}</div>
          <div class="document-meta">更新于 {{ formatDate(doc.updatedAt) }}</div>
        </div>
        <div class="document-actions" @click.stop>
          <button class="icon-btn" title="分享" @click="handleShare(doc.id)">分享</button>
          <button class="icon-btn delete" title="删除" @click="handleDelete(doc.id)">删除</button>
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
          <p>复制以下链接分享给其他人：</p>
          <div class="share-link-container">
            <input v-model="shareLink" readonly class="share-link-input" />
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
          <p>确定要删除这个文档吗？此操作不可撤销。</p>
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
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
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
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.btn {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-primary {
  background-color: #0078d4;
  color: white;
}

.btn-primary:hover {
  background-color: #0066b4;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}

.btn-danger {
  background-color: #f5222d;
  color: white;
}

.btn-danger:hover {
  background-color: #d91b16;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.empty-state p {
  font-size: 16px;
  color: #999;
  margin-bottom: 16px;
}

.document-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.document-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
}

.document-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.document-info {
  flex: 1;
}

.document-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.document-meta {
  font-size: 12px;
  color: #999;
}

.document-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  padding: 6px 12px;
  font-size: 12px;
  background-color: #f0f0f0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.icon-btn:hover {
  background-color: #e0e0e0;
}

.icon-btn.delete {
  color: #f5222d;
}

.icon-btn.delete:hover {
  background-color: #fff1f0;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background-color: white;
  border-radius: 8px;
  width: 480px;
  max-width: 90%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.dialog-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  line-height: 1;
}

.close-btn:hover {
  color: #333;
}

.dialog-content {
  padding: 20px;
}

.dialog-content p {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #666;
}

.share-link-container {
  display: flex;
  gap: 8px;
}

.share-link-input {
  flex: 1;
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  background-color: #f8f8f8;
}

.copy-success {
  color: #52c41a !important;
  margin-top: 8px !important;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}
</style>
