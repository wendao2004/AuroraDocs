<template>
  <div class="task-page">
    <div class="page-header">
      <h2>任务管理</h2>
      <button class="btn btn-primary" @click="showCreateDialog = true">创建任务</button>
    </div>

    <div class="task-stats">
      <div class="stat-card">
        <div class="stat-number">{{ taskStats.pending }}</div>
        <div class="stat-label">待处理</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ taskStats.in_progress }}</div>
        <div class="stat-label">进行中</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ taskStats.completed }}</div>
        <div class="stat-label">已完成</div>
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
      <p>暂无任务</p>
      <button class="btn btn-secondary" @click="showCreateDialog = true">创建第一个任务</button>
    </div>

    <div v-else class="task-list">
      <div
        v-for="task in filteredTasks"
        :key="task.id"
        class="task-item"
        @click="handleEditTask(task.id)"
      >
        <div class="task-checkbox" @click.stop>
          <input
            type="checkbox"
            :checked="task.status === 'completed'"
            @change="toggleTaskStatus(task.id, task.status)"
          />
        </div>
        <div class="task-content">
          <div class="task-title">{{ task.title }}</div>
          <div class="task-meta">
            <span
              class="task-priority"
              :style="{ backgroundColor: TaskPriorityColors[task.priority] }"
            >
              {{ TaskPriorityLabels[task.priority] }}
            </span>
            <span
              class="task-status"
              :style="{ backgroundColor: TaskStatusColors[task.status] }"
            >
              {{ TaskStatusLabels[task.status] }}
            </span>
            <span v-if="task.dueDate" class="task-due">
              截止：{{ formatDate(task.dueDate) }}
            </span>
          </div>
        </div>
        <div class="task-actions" @click.stop>
          <button class="icon-btn delete" @click="handleDelete(task.id)">删除</button>
        </div>
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
            <input v-model="taskForm.title" class="form-input" placeholder="请输入任务标题" />
          </div>
          <div class="form-group">
            <label>任务描述</label>
            <textarea
              v-model="taskForm.description"
              class="form-textarea"
              placeholder="请输入任务描述（可选）"
              rows="3"
            ></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>优先级</label>
              <select v-model="taskForm.priority" class="form-select">
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>
            </div>
            <div class="form-group">
              <label>截止日期</label>
              <input v-model="taskForm.dueDate" type="date" class="form-input" />
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
          <p>确定要删除这个任务吗？此操作不可撤销。</p>
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
  TaskPriorityColors,
  TaskStatusColors,
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
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
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

.btn-danger {
  background-color: #f5222d;
  color: white;
}

.btn-danger:hover {
  background-color: #d91b16;
}

.task-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  flex: 1;
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-number {
  font-size: 32px;
  font-weight: 600;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 8px;
}

.task-filter {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.filter-btn {
  padding: 8px 16px;
  font-size: 14px;
  background-color: white;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.filter-btn:hover {
  border-color: #0078d4;
  color: #0078d4;
}

.filter-btn.active {
  background-color: #0078d4;
  color: white;
  border-color: #0078d4;
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

.task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
}

.task-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.task-checkbox input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.task-content {
  flex: 1;
}

.task-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-priority,
.task-status {
  padding: 4px 8px;
  font-size: 12px;
  color: white;
  border-radius: 4px;
}

.task-due {
  font-size: 12px;
  color: #999;
}

.task-actions {
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
  width: 520px;
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
.form-textarea,
.form-select {
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  outline: none;
  transition: border-color 0.15s ease;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  border-color: #0078d4;
}

.form-textarea {
  resize: vertical;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-row .form-group {
  flex: 1;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}
</style>
