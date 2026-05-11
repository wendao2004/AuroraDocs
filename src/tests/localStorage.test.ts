import { describe, it, expect, beforeEach, vi } from 'vitest'
import { storage, STORAGE_KEYS } from '../services/storage/localStorage'

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

describe('localStorage Service', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    vi.clearAllMocks()
  })

  describe('Basic Operations', () => {
    it('should store and retrieve string data', () => {
      storage.set('test_key', 'test_value')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test_key', '"test_value"')
    })

    it('should return null for non-existent key', () => {
      const result = storage.get<string>('non_existent')
      expect(result).toBeNull()
    })

    it('should handle complex objects', () => {
      const obj = { name: 'test', value: 123, nested: { a: 1 } }
      storage.set('complex_key', obj)
      const result = storage.get<typeof obj>('complex_key')
      expect(result).toEqual(obj)
    })

    it('should handle arrays', () => {
      const arr = [1, 2, 3, 'test', { key: 'value' }]
      storage.set('array_key', arr)
      const result = storage.get<typeof arr>('array_key')
      expect(result).toEqual(arr)
    })
  })

  describe('Error Handling', () => {
    it('should return null when JSON parsing fails', () => {
      mockLocalStorage.data['invalid_json'] = '{ invalid json }'
      const result = storage.get('invalid_json')
      expect(result).toBeNull()
    })

    it('should handle null values gracefully', () => {
      storage.set('null_value', null as any)
      const result = storage.get('null_value')
      expect(result).toBeNull()
    })

    it('should handle undefined gracefully', () => {
      storage.set('undefined_value', undefined as any)
      const result = storage.get('undefined_value')
      expect(result).toBeNull()
    })
  })

  describe('Remove Operations', () => {
    it('should remove item by key', () => {
      storage.set('to_remove', 'value')
      storage.remove('to_remove')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('to_remove')
    })
  })

  describe('Clear Operations', () => {
    it('should clear all storage keys', () => {
      storage.set('key1', 'value1')
      storage.set('key2', 'value2')
      storage.clear()
      expect(mockLocalStorage.removeItem).toHaveBeenCalled()
    })
  })

  describe('STORAGE_KEYS', () => {
    it('should have all required keys', () => {
      expect(STORAGE_KEYS.DOCUMENTS).toBe('aurora_docs_documents')
      expect(STORAGE_KEYS.TEAMS).toBe('aurora_docs_teams')
      expect(STORAGE_KEYS.TASKS).toBe('aurora_docs_tasks')
      expect(STORAGE_KEYS.CURRENT_USER).toBe('aurora_docs_current_user')
      expect(STORAGE_KEYS.APP_SETTINGS).toBe('aurora_docs_settings')
      expect(STORAGE_KEYS.DOCUMENT_VERSIONS).toBe('aurora_docs_document_versions')
      expect(STORAGE_KEYS.CATEGORIES).toBe('aurora_docs_categories')
      expect(STORAGE_KEYS.TAGS).toBe('aurora_docs_tags')
    })
  })

  describe('Data Integrity', () => {
    it('should preserve date values as ISO strings', () => {
      const now = new Date()
      storage.set('date_value', now)
      const result = storage.get<string>('date_value')
      expect(result).toBe(now.toISOString())
    })

    it('should handle special characters in strings', () => {
      const specialChars = '测试中文 🎉 "quotes" & ampersand'
      storage.set('special', specialChars)
      const result = storage.get<string>('special')
      expect(result).toBe(specialChars)
    })

    it('should handle empty string', () => {
      storage.set('empty', '')
      const result = storage.get<string>('empty')
      expect(result).toBe('')
    })

    it('should handle unicode characters', () => {
      const unicode = '日本語 한국어 العربية 🔥'
      storage.set('unicode', unicode)
      const result = storage.get<string>('unicode')
      expect(result).toBe(unicode)
    })
  })
})