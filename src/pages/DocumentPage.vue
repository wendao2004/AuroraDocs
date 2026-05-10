<template>
  <div class="documents-page">
    <h2>文档管理</h2>
    <div class="document-list">
      <div v-for="doc in documents" :key="doc.id" class="document-item">
        <div class="document-title">{{ doc.title }}</div>
        <div class="document-meta">更新于 {{ formatDate(doc.updatedAt) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { DocumentListItem } from '../models/Document'

const documents = ref<DocumentListItem[]>([
  {
    id: '1',
    title: '项目计划书',
    updatedAt: new Date('2024-01-15'),
    authorName: '张三',
  },
  {
    id: '2',
    title: '技术方案文档',
    updatedAt: new Date('2024-01-14'),
    authorName: '李四',
  },
  {
    id: '3',
    title: '会议纪要',
    updatedAt: new Date('2024-01-13'),
    authorName: '王五',
  },
])

const formatDate = (date: Date) => {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}
</script>

<style scoped>
.documents-page {
  padding: 20px;
}

.documents-page h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}

.document-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.document-item {
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
</style>
