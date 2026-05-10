import { storage, STORAGE_KEYS } from '../storage/localStorage'
import type { Task, TaskListItem, TaskStatus, TaskPriority } from '../../models/Task'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

function getTasks(): Task[] {
  return storage.get<Task[]>(STORAGE_KEYS.TASKS) || []
}

function saveTasks(tasks: Task[]): void {
  storage.set(STORAGE_KEYS.TASKS, tasks)
}

export const taskService = {
  getAll(): TaskListItem[] {
    const tasks = getTasks()
    return tasks.map((task) => ({
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      assigneeName: null,
      dueDate: task.dueDate ? new Date(task.dueDate) : null,
    }))
  },

  getById(id: string): Task | null {
    const tasks = getTasks()
    return tasks.find((task) => task.id === id) || null
  },

  create(
    title: string,
    description: string = '',
    priority: TaskPriority = 'medium',
    assigneeId: string | null = null,
    dueDate: Date | null = null
  ): Task {
    const tasks = getTasks()
    const now = new Date()
    const newTask: Task = {
      id: generateId(),
      title,
      description,
      status: 'pending',
      priority,
      assigneeId,
      dueDate,
      createdAt: now,
      updatedAt: now,
      authorId: 'current_user',
    }
    tasks.push(newTask)
    saveTasks(tasks)
    return newTask
  },

  update(
    id: string,
    updates: Partial<Pick<Task, 'title' | 'description' | 'status' | 'priority' | 'assigneeId' | 'dueDate'>>
  ): Task | null {
    const tasks = getTasks()
    const index = tasks.findIndex((task) => task.id === id)
    if (index === -1) return null

    tasks[index] = {
      ...tasks[index],
      ...updates,
      updatedAt: new Date(),
    }
    saveTasks(tasks)
    return tasks[index]
  },

  updateStatus(id: string, status: TaskStatus): Task | null {
    return this.update(id, { status })
  },

  delete(id: string): boolean {
    const tasks = getTasks()
    const index = tasks.findIndex((task) => task.id === id)
    if (index === -1) return false

    tasks.splice(index, 1)
    saveTasks(tasks)
    return true
  },

  getByStatus(status: TaskStatus): TaskListItem[] {
    const tasks = getTasks()
    return tasks
      .filter((task) => task.status === status)
      .map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        assigneeName: null,
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
      }))
  },
}
