<template>
  <div class="team-page">
    <div class="page-header">
      <div class="header-left">
        <h2>团队</h2>
        <span class="team-count">{{ teams.length }} 个团队</span>
      </div>
      <button class="btn btn-primary" @click="showCreateDialog = true">
        <span>+</span> 创建团队
      </button>
    </div>

    <div v-if="teams.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      </div>
      <h3>创建你的团队</h3>
      <p>邀请成员，协作管理知识文档</p>
      <button class="btn btn-primary" @click="showCreateDialog = true">创建第一个团队</button>
    </div>

    <div v-else class="team-content">
      <div class="team-list">
        <div
          v-for="team in teams"
          :key="team.id"
          class="team-item"
          :class="{ active: selectedTeamId === team.id }"
          @click="selectTeam(team.id)"
        >
          <div class="team-avatar">{{ team.name.charAt(0) }}</div>
          <div class="team-info">
            <div class="team-name">{{ team.name }}</div>
            <div class="team-desc">{{ team.description || '暂无描述' }}</div>
          </div>
        </div>
      </div>

      <div v-if="selectedTeam" class="team-detail">
        <div class="detail-header">
          <div class="detail-title">
            <div class="detail-avatar">{{ selectedTeam.name.charAt(0) }}</div>
            <div>
              <h3>{{ selectedTeam.name }}</h3>
              <p>{{ selectedTeam.description || '暂无描述' }}</p>
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
              <span class="role-badge" :class="member.role">
                {{ TeamRoleLabels[member.role] }}
              </span>
              <button
                v-if="member.role !== 'owner'"
                class="remove-btn"
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
          <h3>创建团队</h3>
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
          <h3>添加成员</h3>
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
  max-width: 950px;
  margin: 0 auto;
  padding: 24px;
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

.team-count {
  font-size: 13px;
  color: var(--color-text-muted);
  padding: 4px 10px;
  background: var(--color-bg-gray);
  border-radius: 12px;
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

.team-content {
  display: flex;
  gap: 20px;
}

.team-list {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  background: var(--color-bg-white);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-light);
}

.team-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.team-item:hover {
  background: var(--color-bg-gray);
}

.team-item.active {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
}

.team-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
}

.team-info {
  flex: 1;
  min-width: 0;
}

.team-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.team-desc {
  font-size: 12px;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.team-detail {
  flex: 1;
  background: var(--color-bg-white);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-light);
  padding: 28px;
  box-shadow: var(--shadow-sm);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--color-border-light);
}

.detail-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.detail-avatar {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.detail-title h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: var(--color-text-primary);
}

.detail-title p {
  font-size: 14px;
  color: var(--color-text-muted);
  margin: 0;
}

.member-section h4 {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: var(--color-text-primary);
}

.empty-members {
  text-align: center;
  padding: 40px;
  background: var(--color-bg-gray);
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  font-size: 14px;
}

.member-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: var(--color-bg-white);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  border: 1px solid var(--color-border-light);
}

.member-item:hover {
  background: var(--color-bg-gray);
  transform: translateX(4px);
}

.member-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.member-info {
  flex: 1;
  min-width: 0;
}

.member-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.member-email {
  font-size: 12px;
  color: var(--color-text-muted);
}

.role-badge {
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 500;
  border-radius: 4px;
  color: white;
}

.role-badge.owner { background: #764ba2; }
.role-badge.admin { background: #007aff; }
.role-badge.member { background: #34c759; }

.remove-btn {
  padding: 4px 10px;
  font-size: 12px;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: var(--color-text-muted);
  opacity: 0;
  transition: all 0.15s ease;
}

.member-item:hover .remove-btn {
  opacity: 1;
}

.remove-btn:hover {
  background: #fff1f0;
  color: #ff3b30;
}

.textarea {
  resize: vertical;
  min-height: 80px;
}
</style>
