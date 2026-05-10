<template>
  <div class="task-page">
    <div class="page-header">
      <div class="header-left">
        <h2>✅ 任务管理</h2>
        <span class="task-count">{{ tasks.length }} 个任务</span>
      </div>
      <button class="btn btn-primary" @click="showCreateDialog = true">
        <span>+</span> 创建任务
      </button>
    </div>

    <div class="task-stats">
      <div class="stat-card pending">
        <div class="stat-icon">📋</div>
        <div class="stat-info">
          <div class="stat-number">{{ taskStats.pending }}</div>
          <div class="stat-label">待处理</div>
        </div>
      </div>
      <div class="stat-card in-progress">
        <div class="stat-icon">🔄</div>
        <div class="stat-info">
          <div class="stat-number">{{ taskStats.in_progress }}</div>
          <div class="stat-label">进行中</div>
        </div>
      </div>
      <div class="stat-card completed">
        <div class="stat-icon">✨</div>
        <div class="stat-info">
          <div class="stat-number">{{ taskStats.completed }}</div>
          <div class="stat-label">已完成</div>
        </div>
      </div>
    </div>

    <div class="task-filter">
      <button
        v-for="status in taskStatusOptions"
        :key="status.value"
        class="filter-btn"
        :class="{ active: filterStatus === status.value }"
        @click="filterStatus = status.value"
      >
        {{ status.label }}
      </button>
    </div>

    <div v-if="filteredTasks.length === 0" class="empty-state">
      <div class="empty-icon">📋</div>
      <h3>暂无任务</h3>
      <p>创建任务，开始你的 productivity</p>
      <button class="btn btn-primary" @click="showCreateDialog = true">创建第一个任务</button>
    </div>

    <div v-else class="task-list">
      <div
        v-for="task in filteredTasks"
        :key="task.id"
        class="task-item"
        :class="{ completed: task.status === 'completed' }"
      >
        <div class="task-checkbox" @click.stop>
          <label class="checkbox-wrapper">
            <input
              type="checkbox"
              :checked="task.status === 'completed'"
              @change="toggleTaskStatus(task.id, task.status)"
            />
            <span class="checkmark"></span>
          </label>
        </div>
        <div class="task-content" @click="handleEditTask(task.id)">
          <div class="task-title">{{ task.title }}</div>
          <div class="task-meta">
            <span
              class="priority-badge"
              :class="task.priority"
            >
              {{ TaskPriorityLabels[task.priority] }}
            </span>
            <span
              class="status-badge"
              :class="task.status"
            >
              {{ TaskStatusLabels[task.status] }}
            </span>
            <span v-if="task.dueDate" class="due-date">
              🗓 {{ formatDate(task.dueDate) }}
            </span>
          </div>
        </div>
        <div class="task-actions" @click.stop>
          <button class="action-btn danger" @click="handleDelete(task.id)">删除</button>
        </div>
      </div>
    </div>

    <div v-if="showCreateDialog" class="dialog-overlay" @click.self="closeCreateDialog">
      <div class="dialog">
        <div class="dialog-header">
          <h3>{{ editingTaskId ? '✏️ 编辑任务' : '✨ 创建任务' }}</h3>
          <button class="close-btn" @click="closeCreateDialog">×</button>
        </div>
        <div class="dialog-content">
          <div class="form-group">
            <label>任务标题</label>
            <input v-model="taskForm.title" class="input" placeholder="输入任务标题..." />
          </div>
          <div class="form-group">
            <label>任务描述</label>
            <textarea v-model="taskForm.description" class="input textarea" placeholder="输入任务描述（可选）..." rows="3"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>优先级</label>
              <select v-model="taskForm.priority" class="input">
                <option value="low">🟢 低</option>
                <option value="medium">🟡 中</option>
                <option value="high">🔴 高</option>
              </select>
            </div>
            <div class="form-group">
              <label>截止日期</label>
              <input v-model="taskForm.dueDate" type="date" class="input" />
            </div>
          </div>
          <div class="dialog-actions">
            <button class="btn btn-secondary" @click="closeCreateDialog">取消</button>
            <button class="btn btn-primary" @click="handleSaveTask" :disabled="!taskForm.title.trim()">
              保存
            </button>
          </div>
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
          <p class="delete-warning">确定要删除这个任务吗？此操作不可撤销。</p>
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
import { ref, computed, onMounted } from 'vue'
import { taskService } from '../services/storage/taskService'
import {
  TaskStatusLabels,
  TaskPriorityLabels,
} from '../models/Task'
import type { TaskListItem, TaskPriority, TaskStatus } from '../models/Task'

const tasks = ref<TaskListItem[]>([])
const filterStatus = ref<TaskStatus | 'all'>('all')
const showCreateDialog = ref(false)
const showDeleteDialog = ref(false)
const editingTaskId = ref<string | null>(null)
const deleteTargetId = ref<string | null>(null)

const taskForm = ref({
  title: '',
  description: '',
  priority: 'medium' as TaskPriority,
  dueDate: '',
})

const taskStatusOptions = [
  { value: 'all' as const, label: '全部' },
  { value: 'pending' as const, label: '待处理' },
  { value: 'in_progress' as const, label: '进行中' },
  { value: 'completed' as const, label: '已完成' },
]

const taskStats = computed(() => {
  const all = tasks.value
  return {
    pending: all.filter((t) => t.status === 'pending').length,
    in_progress: all.filter((t) => t.status === 'in_progress').length,
    completed: all.filter((t) => t.status === 'completed').length,
  }
})

const filteredTasks = computed(() => {
  if (filterStatus.value === 'all') {
    return tasks.value
  }
  return tasks.value.filter((t) => t.status === filterStatus.value)
})

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
  })
}

const loadTasks = () => {
  tasks.value = taskService.getAll()
}

const closeCreateDialog = () => {
  showCreateDialog.value = false
  editingTaskId.value = null
  taskForm.value = {
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
  }
}

const handleSaveTask = () => {
  if (!taskForm.value.title.trim()) return

  const dueDate = taskForm.value.dueDate ? new Date(taskForm.value.dueDate) : null

  if (editingTaskId.value) {
    taskService.update(editingTaskId.value, {
      title: taskForm.value.title.trim(),
      description: taskForm.value.description.trim(),
      priority: taskForm.value.priority,
      dueDate,
    })
  } else {
    taskService.create(
      taskForm.value.title.trim(),
      taskForm.value.description.trim(),
      taskForm.value.priority,
      null,
      dueDate
    )
  }

  loadTasks()
  closeCreateDialog()
}

const handleEditTask = (id: string) => {
  const task = taskService.getById(id)
  if (task) {
    editingTaskId.value = id
    taskForm.value = {
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    }
    showCreateDialog.value = true
  }
}

const toggleTaskStatus = (id: string, currentStatus: TaskStatus) => {
  const newStatus: TaskStatus = currentStatus === 'completed' ? 'pending' : 'completed'
  taskService.updateStatus(id, newStatus)
  loadTasks()
}

const handleDelete = (id: string) => {
  deleteTargetId.value = id
  showDeleteDialog.value = true
}

const confirmDelete = () => {
  if (deleteTargetId.value) {
    taskService.delete(deleteTargetId.value)
    loadTasks()
    showDeleteDialog.value = false
    deleteTargetId.value = null
  }
}

onMounted(() => {
  loadTasks()
})
</script>

<style scoped>
.task-page {
  max-width: 1000px;
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

.task-count {
  font-size: 14px;
  color: var(--color-text-muted);
  background: var(--color-bg-white);
  padding: 4px 12px;
  border-radius: 20px;
  border: 1px solid var(--color-border-light);
}

.task-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: var(--color-bg-white);
  border-radius: var(--radius-lg);
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-light);
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-icon {
  font-size: 32px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-gray);
  border-radius: var(--radius-md);
}

.stat-card.pending .stat-icon { background: #fff7e6; }
.stat-card.in-progress .stat-icon { background: #e6f7ff; }
.stat-card.completed .stat-icon { background: #f6ffed; }

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: var(--color-text-muted);
  margin-top: 4px;
}

.task-filter {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  background: var(--color-bg-white);
  padding: 8px;
  border-radius: var(--radius-lg);
  width: fit-content;
}

.filter-btn {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
}

.filter-btn:hover {
  background: var(--color-bg-gray);
  color: var(--color-text-primary);
}

.filter-btn.active {
  background: var(--color-primary);
  color: white;
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

.task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--color-bg-white);
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-light);
  transition: all 0.2s ease;
}

.task-item:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--color-border);
}

.task-item.completed .task-title {
  text-decoration: line-through;
  color: var(--color-text-muted);
}

.checkbox-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-wrapper input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkmark {
  width: 22px;
  height: 22px;
  border: 2px solid var(--color-border);
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox-wrapper input:checked + .checkmark {
  background: var(--color-success);
  border-color: var(--color-success);
}

.checkbox-wrapper input:checked + .checkmark::after {
  content: '✓';
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.task-content {
  flex: 1;
  cursor: pointer;
}

.task-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 8px;
  transition: all 0.2s ease;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.priority-badge,
.status-badge {
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 20px;
  color: white;
}

.priority-badge.low { background: #52c41a; }
.priority-badge.medium { background: #faad14; }
.priority-badge.high { background: #f5222d; }

.status-badge.pending { background: #faad14; }
.status-badge.in_progress { background: #1890ff; }
.status-badge.completed { background: #52c41a; }

.due-date {
  font-size: 12px;
  color: var(--color-text-muted);
}

.task-actions {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.task-item:hover .task-actions {
  opacity: 1;
}

.action-btn {
  padding: 6px 12px;
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

.textarea {
  resize: vertical;
  min-height: 80px;
}

.delete-warning {
  color: var(--color-text-secondary);
  line-height: 1.6;
}
</style>
