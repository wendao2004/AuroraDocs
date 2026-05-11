import { describe, it, expect, beforeEach, vi } from 'vitest'
import { tagService } from '../services/storage/tagService'
import type { Tag } from '../models/Document'

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

const STORAGE_KEY = 'aurora_docs_tags'

describe('tagService', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    vi.clearAllMocks()
  })

  describe('CRUD Operations', () => {
    it('should create a new tag', () => {
      const tag = tagService.create('Test Tag', '#00ff00')

      expect(tag).toBeDefined()
      expect(tag.id).toBeDefined()
      expect(tag.name).toBe('Test Tag')
      expect(tag.color).toBe('#00ff00')
      expect(tag.createdAt).toBeInstanceOf(Date)
      expect(tag.updatedAt).toBeInstanceOf(Date)
    })

    it('should use default color if not provided', () => {
      const tag = tagService.create('Tag Without Color')
      expect(tag.color).toBe('#52c41a')
    })

    it('should get all tags', () => {
      tagService.create('Tag 1')
      tagService.create('Tag 2')
      tagService.create('Tag 3')

      const tags = tagService.getAll()

      expect(tags).toHaveLength(3)
    })

    it('should get tag by id', () => {
      const created = tagService.create('Test Tag')
      const retrieved = tagService.getById(created.id)

      expect(retrieved).toBeDefined()
      expect(retrieved?.name).toBe('Test Tag')
    })

    it('should return null for non-existent tag', () => {
      const result = tagService.getById('non-existent-id')
      expect(result).toBeNull()
    })

    it('should update a tag', () => {
      const tag = tagService.create('Original Name', '#000000')
      const updated = tagService.update(tag.id, {
        name: 'Updated Name',
        color: '#ffffff'
      })

      expect(updated).toBeDefined()
      expect(updated?.name).toBe('Updated Name')
      expect(updated?.color).toBe('#ffffff')
    })

    it('should delete a tag', () => {
      const tag = tagService.create('To Delete')
      const result = tagService.delete(tag.id)

      expect(result).toBe(true)
      expect(tagService.getById(tag.id)).toBeNull()
    })

    it('should return false when deleting non-existent tag', () => {
      const result = tagService.delete('non-existent-id')
      expect(result).toBe(false)
    })
  })

  describe('Search', () => {
    it('should search tags by name', () => {
      tagService.create('JavaScript Tag')
      tagService.create('Python Tag')
      tagService.create('JavaScript Advanced')

      const results = tagService.searchByName('JavaScript')

      expect(results).toHaveLength(2)
      results.forEach(tag => {
        expect(tag.name).toContain('JavaScript')
      })
    })

    it('should be case insensitive', () => {
      tagService.create('UPPERCASE Tag')

      const results = tagService.searchByName('uppercase')

      expect(results).toHaveLength(1)
    })

    it('should return empty array for no matches', () => {
      tagService.create('Some Tag')
      const results = tagService.searchByName('nonexistent')
      expect(results).toHaveLength(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty name', () => {
      const tag = tagService.create('')
      expect(tag.name).toBe('')
    })

    it('should handle unicode characters in name', () => {
      const tag = tagService.create('标签测试 🎉')
      expect(tag.name).toBe('标签测试 🎉')
    })

    it('should handle various color formats', () => {
      const colors = ['#00ff00', '#0F0', 'rgb(0,255,0)', 'green']
      colors.forEach(color => {
        const tag = tagService.create(`Tag ${color}`, color)
        expect(tag.color).toBe(color)
      })
    })

    it('should handle many tags', () => {
      for (let i = 0; i < 50; i++) {
        tagService.create(`Tag ${i}`)
      }
      const tags = tagService.getAll()
      expect(tags).toHaveLength(50)
    })
  })

  describe('Data Persistence', () => {
    it('should persist tags to localStorage', () => {
      tagService.create('Persisted Tag')

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        expect.any(String)
      )
    })
  })
})