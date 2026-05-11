import { describe, it, expect, beforeEach, vi } from 'vitest'
import { taskService } from '../services/storage/taskService'
import type { Task, TaskStatus, TaskPriority } from '../models/Task'

const mockLocalStorage = {
  data: {} as Record<string, string>,
  getItem: vi.fn((key: string) => mockLocalStorage.data[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    mockLocalStorage.data[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete mockLocalStorage.data[key]
  }),
  clear: vi.fn(() => {
    mockLocalStorage.data = {}
  }),
}

Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

const STORAGE_KEY = 'aurora_docs_tasks'

describe('taskService', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    vi.clearAllMocks()
  })

  describe('CRUD Operations', () => {
    it('should create a new task', () => {
      const task = taskService.create('Test Task', 'Test Description', 'high')

      expect(task).toBeDefined()
      expect(task.id).toBeDefined()
      expect(task.title).toBe('Test Task')
      expect(task.description).toBe('Test Description')
      expect(task.status).toBe('pending')
      expect(task.priority).toBe('high')
      expect(task.createdAt).toBeInstanceOf(Date)
      expect(task.updatedAt).toBeInstanceOf(Date)
    })

    it('should create task with default priority', () => {
      const task = taskService.create('Task')
      expect(task.priority).toBe('medium')
    })

    it('should get all tasks', () => {
      taskService.create('Task 1')
      taskService.create('Task 2')
      taskService.create('Task 3')

      const tasks = taskService.getAll()
      expect(tasks).toHaveLength(3)
    })

    it('should get task by id', () => {
      const created = taskService.create('Test Task')
      const retrieved = taskService.getById(created.id)

      expect(retrieved).toBeDefined()
      expect(retrieved?.title).toBe('Test Task')
    })

    it('should return null for non-existent task', () => {
      const result = taskService.getById('non-existent-id')
      expect(result).toBeNull()
    })

    it('should update a task', () => {
      const task = taskService.create('Original Title')
      const updated = taskService.update(task.id, {
        title: 'Updated Title',
        description: 'Updated Description'
      })

      expect(updated).toBeDefined()
      expect(updated?.title).toBe('Updated Title')
    })

    it('should update task status', () => {
      const task = taskService.create('Task')
      const updated = taskService.updateStatus(task.id, 'in_progress')

      expect(updated?.status).toBe('in_progress')
    })

    it('should delete a task', () => {
      const task = taskService.create('To Delete')
      const result = taskService.delete(task.id)

      expect(result).toBe(true)
      expect(taskService.getById(task.id)).toBeNull()
    })

    it('should return false when deleting non-existent task', () => {
      const result = taskService.delete('non-existent-id')
      expect(result).toBe(false)
    })
  })

  describe('Filtering', () => {
    it('should filter tasks by status', () => {
      taskService.create('Pending Task', '', 'medium', null, null)
      taskService.create('In Progress Task', '', 'medium', null, null)
      taskService.updateStatus(taskService.getAll()[1].id, 'in_progress')
      taskService.create('Completed Task', '', 'medium', null, null)
      taskService.updateStatus(taskService.getAll()[2].id, 'completed')

      const pendingTasks = taskService.getByStatus('pending')
      const inProgressTasks = taskService.getByStatus('in_progress')
      const completedTasks = taskService.getByStatus('completed')

      expect(pendingTasks).toHaveLength(1)
      expect(inProgressTasks).toHaveLength(1)
      expect(completedTasks).toHaveLength(1)
    })

    it('should filter tasks by assignee', () => {
      const assigneeId = 'user-1'
      taskService.create('Assigned Task', '', 'medium', assigneeId, null)
      taskService.create('Unassigned Task', '', 'medium', null, null)

      const assigned = taskService.getByAssignee(assigneeId)
      const unassigned = taskService.getByAssignee(null)

      expect(assigned).toHaveLength(1)
      expect(unassigned).toHaveLength(1)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty title', () => {
      const task = taskService.create('')
      expect(task.title).toBe('')
    })

    it('should handle empty description', () => {
      const task = taskService.create('Title', '')
      expect(task.description).toBe('')
    })

    it('should handle different priorities', () => {
      const priorities: TaskPriority[] = ['low', 'medium', 'high']
      priorities.forEach(priority => {
        const task = taskService.create(`Task ${priority}`, '', priority)
        expect(task.priority).toBe(priority)
      })
    })

    it('should handle due dates', () => {
      const dueDate = new Date('2025-12-31')
      const task = taskService.create('Task with due date', '', 'medium', null, dueDate)
      expect(task.dueDate?.toISOString()).toBe(dueDate.toISOString())
    })

    it('should handle null due date', () => {
      const task = taskService.create('Task without due date', '', 'medium', null, null)
      expect(task.dueDate).toBeNull()
    })

    it('should handle many tasks', () => {
      for (let i = 0; i < 50; i++) {
        taskService.create(`Task ${i}`)
      }
      const tasks = taskService.getAll()
      expect(tasks).toHaveLength(50)
    })

    it('should handle special characters', () => {
      const task = taskService.create('Task with <script>alert("xss")</script>', 'Special chars 🎉')
      expect(task.title).toBe('Task with <script>alert("xss")</script>')
      expect(task.description).toBe('Special chars 🎉')
    })
  })

  describe('Data Persistence', () => {
    it('should persist tasks to localStorage', () => {
      taskService.create('Persisted Task')

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        expect.any(String)
      )
    })
  })
})