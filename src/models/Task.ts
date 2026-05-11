export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assigneeId: string | null
  dueDate: Date | null
  createdAt: Date
  updatedAt: Date
  authorId: string
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface TaskListItem {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assigneeName: string | null
  dueDate: Date | null
}

export const TaskStatusLabels: Record<TaskStatus, string> = {
  pending: '待处理',
  in_progress: '进行中',
  completed: '已完成',
}

export const TaskPriorityLabels: Record<TaskPriority, string> = {
  low: '低',
  medium: '中',
  high: '高',
}

export const TaskPriorityColors: Record<TaskPriority, string> = {
  low: '#52c41a',
  medium: '#faad14',
  high: '#f5222d',
}

export const TaskStatusColors: Record<TaskStatus, string> = {
  pending: '#999999',
  in_progress: '#1890ff',
  completed: '#52c41a',
}
