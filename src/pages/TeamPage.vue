<template>
  <div class="team-page">
    <h2>团队管理</h2>
    <div class="team-info">
      <div class="team-name">{{ teamName }}</div>
      <div class="member-count">{{ members.length }} 位成员</div>
    </div>
    <div class="member-list">
      <div v-for="member in members" :key="member.id" class="member-item">
        <div class="member-avatar">{{ member.name.charAt(0) }}</div>
        <div class="member-info">
          <div class="member-name">{{ member.name }}</div>
          <div class="member-email">{{ member.email }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { User } from '../models/User'

const teamName = ref('极光文档开发团队')

const members = ref<User[]>([
  {
    id: '1',
    name: '张三',
    email: 'zhangsan@example.com',
  },
  {
    id: '2',
    name: '李四',
    email: 'lisi@example.com',
  },
  {
    id: '3',
    name: '王五',
    email: 'wangwu@example.com',
  },
])
</script>

<style scoped>
.team-page {
  padding: 20px;
}

.team-page h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}

.team-info {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.team-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.member-count {
  font-size: 14px;
  color: #666;
}

.member-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: white;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #0078d4;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
}

.member-info {
  flex: 1;
}

.member-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.member-email {
  font-size: 12px;
  color: #999;
}
</style>
