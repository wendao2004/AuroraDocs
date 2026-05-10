<template>
  <div class="team-page">
    <div class="page-header">
      <h2>团队管理</h2>
      <button class="btn btn-primary" @click="showCreateDialog = true">创建团队</button>
    </div>

    <div v-if="teams.length === 0" class="empty-state">
      <p>暂无团队</p>
      <button class="btn btn-secondary" @click="showCreateDialog = true">创建第一个团队</button>
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
          <div class="team-icon">{{ team.name.charAt(0) }}</div>
          <div class="team-name">{{ team.name }}</div>
        </div>
      </div>

      <div v-if="selectedTeam" class="team-detail">
        <div class="detail-header">
          <div class="detail-info">
            <h3>{{ selectedTeam.name }}</h3>
            <p>{{ selectedTeam.description || '暂无描述' }}</p>
          </div>
          <button class="btn btn-secondary" @click="showAddMemberDialog = true">添加成员</button>
        </div>

        <div class="member-section">
          <h4>成员列表 ({{ members.length }})</h4>
          <div v-if="members.length === 0" class="empty-members">
            <p>暂无成员</p>
          </div>
          <div v-else class="member-list">
            <div v-for="member in members" :key="member.id" class="member-item">
              <div class="member-avatar">{{ member.userName.charAt(0) }}</div>
              <div class="member-info">
                <div class="member-name">{{ member.userName }}</div>
                <div class="member-email">{{ member.userEmail }}</div>
              </div>
              <span
                class="member-role"
                :style="{ backgroundColor: TeamRoleColors[member.role] }"
              >
                {{ TeamRoleLabels[member.role] }}
              </span>
              <button
                v-if="member.role !== 'owner'"
                class="icon-btn delete"
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
            <input v-model="newTeamName" class="form-input" placeholder="请输入团队名称" />
          </div>
          <div class="form-group">
            <label>团队描述</label>
            <textarea
              v-model="newTeamDescription"
              class="form-textarea"
              placeholder="请输入团队描述（可选）"
              rows="3"
            ></textarea>
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
            <input v-model="newMemberName" class="form-input" placeholder="请输入成员姓名" />
          </div>
          <div class="form-group">
            <label>成员邮箱</label>
            <input v-model="newMemberEmail" class="form-input" type="email" placeholder="请输入成员邮箱" />
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
import { TeamRoleLabels, TeamRoleColors } from '../models/Team'

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

.btn-primary:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
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

.team-content {
  display: flex;
  gap: 20px;
}

.team-list {
  width: 200px;
  flex-shrink: 0;
}

.team-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: white;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.team-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.team-card.active {
  background-color: #e8f4ff;
  border: 1px solid #0078d4;
}

.team-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #0078d4;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
}

.team-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.team-detail {
  flex: 1;
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.detail-info h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #333;
}

.detail-info p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.member-section h4 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #333;
}

.empty-members {
  text-align: center;
  padding: 30px;
  color: #999;
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
  padding: 12px;
  background-color: #f8f8f8;
  border-radius: 8px;
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
  font-size: 16px;
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

.member-role {
  padding: 4px 8px;
  font-size: 12px;
  color: white;
  border-radius: 4px;
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

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  outline: none;
  transition: border-color 0.15s ease;
}

.form-input:focus,
.form-textarea:focus {
  border-color: #0078d4;
}

.form-textarea {
  resize: vertical;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}
</style>
