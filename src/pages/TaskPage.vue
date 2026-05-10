<template>
  <div class="task-page">
    <div class="page-header">
      <div class="header-left">
        <h2>任务</h2>
        <span class="task-count">{{ tasks.length }} 个任务</span>
      </div>
      <button class="btn btn-primary" @click="showCreateDialog = true">
        <span>+</span> 创建任务
      </button>
    </div>

    <div class="task-stats">
      <div class="stat-item">
        <span class="stat-number">{{ taskStats.pending }}</span>
        <span class="stat-label">待处理</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ taskStats.in_progress }}</span>
        <span class="stat-label">进行中</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ taskStats.completed }}</span>
        <span class="stat-label">已完成</span>
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
      <div class="empty-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M9 11l3 3L22 4"/>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
      </div>
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
        <label class="checkbox-wrapper">
          <input
            type="checkbox"
            :checked="task.status === 'completed'"
            @change="toggleTaskStatus(task.id, task.status)"
          />
          <span class="checkmark"></span>
        </label>
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
        <button class="delete-btn" @click.stop="handleDelete(task.id)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>

    <div v-if="showCreateDialog" class="dialog-overlay" @click.self="closeCreateDialog">
      <div class="dialog">
        <div class="dialog-header">
          <h3>{{ editingTaskId ? '编辑任务' : '创建任务' }}</h3>
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
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
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
          <h3>确认删除</h3>
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
  max-width: 800px;
  margin: 0 auto;
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
  font-size: 22px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.task-count {
  font-size: 13px;
  color: var(--color-text-muted);
}

.task-stats {
  display: flex;
  gap: 32px;
  margin-bottom: 24px;
  padding: 16px 20px;
  background: var(--color-bg-white);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-light);
}

.stat-item {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.stat-number {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.stat-label {
  font-size: 13px;
  color: var(--color-text-muted);
}

.task-filter {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
}

.filter-btn {
  padding: 6px 14px;
  font-size: 13px;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: all 0.15s ease;
}

.filter-btn:hover {
  background: var(--color-bg-gray);
  color: var(--color-text-primary);
}

.filter-btn.active {
  background: var(--color-primary-light);
  color: var(--color-primary);
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

.task-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: var(--color-bg-white);
  border-radius: var(--radius-sm);
  transition: background-color 0.15s ease;
}

.task-item:hover {
  background: var(--color-bg-gray);
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
  width: 18px;
  height: 18px;
  border: 2px solid var(--color-border);
  border-radius: 4px;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox-wrapper input:checked + .checkmark {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.checkbox-wrapper input:checked + .checkmark::after {
  content: '✓';
  color: white;
  font-size: 11px;
  font-weight: bold;
}

.task-content {
  flex: 1;
  cursor: pointer;
  min-width: 0;
}

.task-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.priority-badge,
.status-badge {
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 500;
  border-radius: 4px;
  color: white;
}

.priority-badge.low { background: #34c759; }
.priority-badge.medium { background: #ff9500; }
.priority-badge.high { background: #ff3b30; }

.status-badge.pending { background: #ff9500; }
.status-badge.in_progress { background: #007aff; }
.status-badge.completed { background: #34c759; }

.due-date {
  font-size: 11px;
  color: var(--color-text-muted);
}

.delete-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: var(--color-text-muted);
  opacity: 0;
  transition: all 0.15s ease;
}

.task-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  background: #fff1f0;
  color: #ff3b30;
}

.textarea {
  resize: vertical;
  min-height: 80px;
}

.delete-warning {
  color: var(--color-text-secondary);
  line-height: 1.6;
  font-size: 14px;
}
</style>
