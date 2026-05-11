import { describe, it, expect, beforeEach, vi } from 'vitest'
import { categoryService } from '../services/storage/categoryService'
import type { Category } from '../models/Document'

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

const STORAGE_KEY = 'aurora_docs_categories'

describe('categoryService', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    vi.clearAllMocks()
  })

  describe('CRUD Operations', () => {
    it('should create a new category', () => {
      const cat = categoryService.create('Test Category', '#ff0000')

      expect(cat).toBeDefined()
      expect(cat.id).toBeDefined()
      expect(cat.name).toBe('Test Category')
      expect(cat.color).toBe('#ff0000')
      expect(cat.createdAt).toBeInstanceOf(Date)
      expect(cat.updatedAt).toBeInstanceOf(Date)
    })

    it('should use default color if not provided', () => {
      const cat = categoryService.create('Category Without Color')
      expect(cat.color).toBe('#1890ff')
    })

    it('should get all categories', () => {
      categoryService.create('Category 1')
      categoryService.create('Category 2')
      categoryService.create('Category 3')

      const categories = categoryService.getAll()

      expect(categories).toHaveLength(3)
    })

    it('should get category by id', () => {
      const created = categoryService.create('Test Category')
      const retrieved = categoryService.getById(created.id)

      expect(retrieved).toBeDefined()
      expect(retrieved?.name).toBe('Test Category')
    })

    it('should return null for non-existent category', () => {
      const result = categoryService.getById('non-existent-id')
      expect(result).toBeNull()
    })

    it('should update a category', () => {
      const cat = categoryService.create('Original Name', '#000000')
      const updated = categoryService.update(cat.id, {
        name: 'Updated Name',
        color: '#ffffff'
      })

      expect(updated).toBeDefined()
      expect(updated?.name).toBe('Updated Name')
      expect(updated?.color).toBe('#ffffff')
    })

    it('should delete a category', () => {
      const cat = categoryService.create('To Delete')
      const result = categoryService.delete(cat.id)

      expect(result).toBe(true)
      expect(categoryService.getById(cat.id)).toBeNull()
    })

    it('should return false when deleting non-existent category', () => {
      const result = categoryService.delete('non-existent-id')
      expect(result).toBe(false)
    })
  })

  describe('Search', () => {
    it('should search categories by name', () => {
      categoryService.create('JavaScript Category')
      categoryService.create('Python Category')
      categoryService.create('JavaScript Advanced')

      const results = categoryService.searchByName('JavaScript')

      expect(results).toHaveLength(2)
      results.forEach(cat => {
        expect(cat.name).toContain('JavaScript')
      })
    })

    it('should be case insensitive', () => {
      categoryService.create('UPPERCASE Category')

      const results = categoryService.searchByName('uppercase')

      expect(results).toHaveLength(1)
    })

    it('should return empty array for no matches', () => {
      categoryService.create('Some Category')
      const results = categoryService.searchByName('nonexistent')
      expect(results).toHaveLength(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty name', () => {
      const cat = categoryService.create('')
      expect(cat.name).toBe('')
    })

    it('should handle unicode characters in name', () => {
      const cat = categoryService.create('分类测试 🎉')
      expect(cat.name).toBe('分类测试 🎉')
    })

    it('should handle various color formats', () => {
      const colors = ['#ff0000', '#F00', 'rgb(255,0,0)', 'red']
      colors.forEach(color => {
        const cat = categoryService.create(`Cat ${color}`, color)
        expect(cat.color).toBe(color)
      })
    })

    it('should handle many categories', () => {
      for (let i = 0; i < 50; i++) {
        categoryService.create(`Category ${i}`)
      }
      const categories = categoryService.getAll()
      expect(categories).toHaveLength(50)
    })
  })

  describe('Data Persistence', () => {
    it('should persist categories to localStorage', () => {
      categoryService.create('Persisted Category')

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        expect.any(String)
      )
    })
  })
})