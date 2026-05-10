<template>
  <div class="editor-page">
    <div class="editor-header">
      <input
        v-model="documentTitle"
        class="title-input"
        placeholder="请输入文档标题..."
        @blur="saveDocument"
      />
      <div class="editor-actions">
        <span v-if="lastSaved" class="save-status">已保存 {{ formatTime(lastSaved) }}</span>
        <button class="btn btn-primary" @click="handleSave">保存</button>
        <button class="btn btn-secondary" @click="handleShare">分享链接</button>
      </div>
    </div>
    <TiptapEditor v-model="content" @update="handleContentUpdate" />
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import TiptapEditor from '../components/editor/TiptapEditor.vue'
import { documentService } from '../services/storage/documentService'
import { shareService } from '../services/shareService'

const route = useRoute()
const content = ref('')
const documentTitle = ref('未命名文档')
const currentDocId = ref<string | null>(null)
const lastSaved = ref<Date | null>(null)
const showShareDialog = ref(false)
const shareLink = ref('')
const copySuccess = ref(false)

const formatTime = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const handleContentUpdate = (newContent: string) => {
  content.value = newContent
}

const saveDocument = () => {
  if (currentDocId.value) {
    documentService.update(currentDocId.value, {
      title: documentTitle.value,
      content: content.value,
    })
  } else {
    const doc = documentService.create(documentTitle.value, content.value)
    currentDocId.value = doc.id
  }
  lastSaved.value = new Date()
}

const handleSave = () => {
  saveDocument()
}

const handleShare = () => {
  if (!currentDocId.value) {
    saveDocument()
  }
  if (currentDocId.value) {
    shareLink.value = shareService.getShareUrl(currentDocId.value) || ''
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

onMounted(() => {
  const docId = route.query.id as string
  if (docId) {
    const doc = documentService.getById(docId)
    if (doc) {
      currentDocId.value = doc.id
      documentTitle.value = doc.title
      content.value = doc.content
      lastSaved.value = new Date(doc.updatedAt)
    }
  }
})
</script>

<style scoped>
.editor-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: white;
  border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.title-input {
  flex: 1;
  font-size: 18px;
  font-weight: 600;
  border: none;
  outline: none;
  padding: 8px 0;
  background: transparent;
}

.title-input::placeholder {
  color: #999;
}

.editor-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.save-status {
  font-size: 12px;
  color: #999;
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
</style>
