<template>
  <div class="team-page">
    <div class="page-header">
      <div class="header-left">
        <h2>👥 团队管理</h2>
        <span class="team-count">{{ teams.length }} 个团队</span>
      </div>
      <button class="btn btn-primary" @click="showCreateDialog = true">
        <span>+</span> 创建团队
      </button>
    </div>

    <div v-if="teams.length === 0" class="empty-state">
      <div class="empty-icon">👥</div>
      <h3>创建你的团队</h3>
      <p>邀请成员，协作管理知识文档</p>
      <button class="btn btn-primary" @click="showCreateDialog = true">创建第一个团队</button>
    </div>

    <div v-else class="team-content">
      <div class="team-list">
        <div
          v-for="team in teams"
          :key="team.id"
          class="team-card"
          :class="{ active: selectedTeamId === team.id }"
          @click="selectTeam(team.id)"
        >
          <div class="team-avatar">{{ team.name.charAt(0) }}</div>
          <div class="team-info">
            <div class="team-name">{{ team.name }}</div>
            <div class="team-members-count">团队成员</div>
          </div>
        </div>
      </div>

      <div v-if="selectedTeam" class="team-detail">
        <div class="detail-header">
          <div class="detail-info">
            <div class="detail-title">
              <div class="detail-avatar">{{ selectedTeam.name.charAt(0) }}</div>
              <div>
                <h3>{{ selectedTeam.name }}</h3>
                <p>{{ selectedTeam.description || '暂无描述' }}</p>
              </div>
            </div>
          </div>
          <button class="btn btn-secondary" @click="showAddMemberDialog = true">
            <span>+</span> 添加成员
          </button>
        </div>

        <div class="member-section">
          <h4>成员列表 ({{ members.length }})</h4>
          <div v-if="members.length === 0" class="empty-members">
            <p>暂无成员，点击上方按钮添加</p>
          </div>
          <div v-else class="member-list">
            <div v-for="member in members" :key="member.id" class="member-item">
              <div class="member-avatar">{{ member.userName.charAt(0) }}</div>
              <div class="member-info">
                <div class="member-name">{{ member.userName }}</div>
                <div class="member-email">{{ member.userEmail }}</div>
              </div>
              <span
                class="role-badge"
                :class="member.role"
              >
                {{ TeamRoleLabels[member.role] }}
              </span>
              <button
                v-if="member.role !== 'owner'"
                class="action-btn danger"
                @click="handleRemoveMember(member.id)"
              >
                移除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showCreateDialog" class="dialog-overlay" @click.self="showCreateDialog = false">
      <div class="dialog">
        <div class="dialog-header">
          <h3>✨ 创建团队</h3>
          <button class="close-btn" @click="showCreateDialog = false">×</button>
        </div>
        <div class="dialog-content">
          <div class="form-group">
            <label>团队名称</label>
            <input v-model="newTeamName" class="input" placeholder="输入团队名称..." />
          </div>
          <div class="form-group">
            <label>团队描述</label>
            <textarea v-model="newTeamDescription" class="input textarea" placeholder="输入团队描述（可选）..." rows="3"></textarea>
          </div>
          <div class="dialog-actions">
            <button class="btn btn-secondary" @click="showCreateDialog = false">取消</button>
            <button class="btn btn-primary" @click="handleCreateTeam" :disabled="!newTeamName.trim()">
              创建
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showAddMemberDialog" class="dialog-overlay" @click.self="showAddMemberDialog = false">
      <div class="dialog">
        <div class="dialog-header">
          <h3>👤 添加成员</h3>
          <button class="close-btn" @click="showAddMemberDialog = false">×</button>
        </div>
        <div class="dialog-content">
          <div class="form-group">
            <label>成员姓名</label>
            <input v-model="newMemberName" class="input" placeholder="输入成员姓名..." />
          </div>
          <div class="form-group">
            <label>成员邮箱</label>
            <input v-model="newMemberEmail" class="input" type="email" placeholder="输入成员邮箱..." />
          </div>
          <div class="dialog-actions">
            <button class="btn btn-secondary" @click="showAddMemberDialog = false">取消</button>
            <button
              class="btn btn-primary"
              @click="handleAddMember"
              :disabled="!newMemberName.trim() || !newMemberEmail.trim()"
            >
              添加
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { teamService } from '../services/storage/teamService'
import type { Team, TeamMember } from '../models/Team'
import { TeamRoleLabels } from '../models/Team'

const teams = ref<Team[]>([])
const selectedTeamId = ref<string | null>(null)
const showCreateDialog = ref(false)
const showAddMemberDialog = ref(false)
const newTeamName = ref('')
const newTeamDescription = ref('')
const newMemberName = ref('')
const newMemberEmail = ref('')

const selectedTeam = computed(() => {
  return teams.value.find((t) => t.id === selectedTeamId.value) || null
})

const members = ref<TeamMember[]>([])

const loadTeams = () => {
  teams.value = teamService.getAll()
  if (teams.value.length > 0 && !selectedTeamId.value) {
    selectTeam(teams.value[0].id)
  }
}

const selectTeam = (id: string) => {
  selectedTeamId.value = id
  loadMembers()
}

const loadMembers = () => {
  if (selectedTeamId.value) {
    members.value = teamService.getMembers(selectedTeamId.value)
  }
}

const handleCreateTeam = () => {
  if (newTeamName.value.trim()) {
    const team = teamService.create(newTeamName.value.trim(), newTeamDescription.value.trim())
    newTeamName.value = ''
    newTeamDescription.value = ''
    showCreateDialog.value = false
    loadTeams()
    selectTeam(team.id)
  }
}

const handleAddMember = () => {
  if (selectedTeamId.value && newMemberName.value.trim() && newMemberEmail.value.trim()) {
    teamService.addMember(selectedTeamId.value, newMemberName.value.trim(), newMemberEmail.value.trim())
    newMemberName.value = ''
    newMemberEmail.value = ''
    showAddMemberDialog.value = false
    loadMembers()
  }
}

const handleRemoveMember = (memberId: string) => {
  if (selectedTeamId.value) {
    teamService.removeMember(selectedTeamId.value, memberId)
    loadMembers()
  }
}

onMounted(() => {
  loadTeams()
})
</script>

<style scoped>
.team-page {
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

.team-count {
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

.team-content {
  display: flex;
  gap: 24px;
  min-height: 500px;
}

.team-list {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.team-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--color-bg-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.team-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateX(4px);
}

.team-card.active {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.team-avatar {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, #0078d4 0%, #006cbd 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(0, 120, 212, 0.3);
}

.team-info {
  flex: 1;
}

.team-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.team-members-count {
  font-size: 12px;
  color: var(--color-text-muted);
}

.team-detail {
  flex: 1;
  background: var(--color-bg-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  padding: 28px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--color-border-light);
}

.detail-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.detail-avatar {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, #0078d4 0%, #006cbd 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  box-shadow: 0 4px 16px rgba(0, 120, 212, 0.3);
}

.detail-info h3 {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 6px 0;
  color: var(--color-text-primary);
}

.detail-info p {
  font-size: 14px;
  color: var(--color-text-muted);
  margin: 0;
}

.member-section h4 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 20px 0;
  color: var(--color-text-primary);
}

.empty-members {
  text-align: center;
  padding: 40px;
  background: var(--color-bg-gray);
  border-radius: var(--radius-lg);
  color: var(--color-text-muted);
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
  padding: 16px;
  background: var(--color-bg-gray);
  border-radius: var(--radius-lg);
  transition: all 0.2s ease;
}

.member-item:hover {
  background: var(--color-bg-hover);
}

.member-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 2px;
}

.member-email {
  font-size: 12px;
  color: var(--color-text-muted);
}

.role-badge {
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 20px;
  color: white;
}

.role-badge.owner { background: #722ed1; }
.role-badge.admin { background: #1890ff; }
.role-badge.member { background: #52c41a; }

.action-btn {
  padding: 6px 12px;
  font-size: 12px;
  background: var(--color-bg-white);
  border: 1px solid var(--color-border);
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
  border-color: var(--color-danger);
}

.action-btn.danger:hover {
  background: var(--color-danger-light);
}

.textarea {
  resize: vertical;
  min-height: 80px;
}
</style>
