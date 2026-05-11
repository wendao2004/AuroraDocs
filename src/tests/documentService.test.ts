import { describe, it, expect, beforeEach, vi } from 'vitest'
import { documentService } from '../services/storage/documentService'
import type { Document } from '../models/Document'

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

const STORAGE_KEY = 'aurora_docs_documents'

describe('documentService', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    vi.clearAllMocks()
  })

  describe('CRUD Operations', () => {
    it('should create a new document', () => {
      const doc = documentService.create('Test Title', 'Test Content', null, [])

      expect(doc).toBeDefined()
      expect(doc.id).toBeDefined()
      expect(doc.title).toBe('Test Title')
      expect(doc.content).toBe('Test Content')
      expect(doc.categoryId).toBeNull()
      expect(doc.tags).toEqual([])
      expect(doc.authorId).toBe('current_user')
      expect(doc.createdAt).toBeInstanceOf(Date)
      expect(doc.updatedAt).toBeInstanceOf(Date)
    })

    it('should retrieve all documents', () => {
      documentService.create('Doc 1', 'Content 1')
      documentService.create('Doc 2', 'Content 2')

      const docs = documentService.getAll()

      expect(docs).toHaveLength(2)
      expect(docs[0].title).toBe('Doc 1')
      expect(docs[1].title).toBe('Doc 2')
    })

    it('should get document by id', () => {
      const created = documentService.create('Test Doc', 'Test Content')
      const retrieved = documentService.getById(created.id)

      expect(retrieved).toBeDefined()
      expect(retrieved?.id).toBe(created.id)
      expect(retrieved?.title).toBe('Test Doc')
    })

    it('should return null for non-existent document', () => {
      const result = documentService.getById('non-existent-id')
      expect(result).toBeNull()
    })

    it('should update a document', () => {
      const doc = documentService.create('Original Title', 'Original Content')
      const updated = documentService.update(doc.id, {
        title: 'Updated Title',
        content: 'Updated Content'
      })

      expect(updated).toBeDefined()
      expect(updated?.title).toBe('Updated Title')
      expect(updated?.content).toBe('Updated Content')
    })

    it('should delete a document', () => {
      const doc = documentService.create('To Delete', 'Content')
      const result = documentService.delete(doc.id)

      expect(result).toBe(true)
      expect(documentService.getById(doc.id)).toBeNull()
    })

    it('should return false when deleting non-existent document', () => {
      const result = documentService.delete('non-existent-id')
      expect(result).toBe(false)
    })
  })

  describe('Filtering', () => {
    it('should filter documents by category', () => {
      const catId = 'cat-123'
      documentService.create('Doc 1', 'Content', catId)
      documentService.create('Doc 2', 'Content', null)
      documentService.create('Doc 3', 'Content', catId)

      const docs = documentService.getByCategory(catId)

      expect(docs).toHaveLength(2)
      docs.forEach(doc => {
        expect(doc.categoryId).toBe(catId)
      })
    })

    it('should filter documents by tag', () => {
      const tagId = 'tag-456'
      documentService.create('Doc 1', 'Content', null, [tagId])
      documentService.create('Doc 2', 'Content', null, [])
      documentService.create('Doc 3', 'Content', null, [tagId, 'other'])

      const docs = documentService.getByTag(tagId)

      expect(docs).toHaveLength(2)
    })
  })

  describe('Search', () => {
    it('should search documents by title', () => {
      documentService.create('JavaScript Tutorial', 'Content about JS')
      documentService.create('Python Guide', 'Content about Python')
      documentService.create('JavaScript Advanced', 'Advanced JS concepts')

      const results = documentService.search('JavaScript')

      expect(results).toHaveLength(2)
      results.forEach(doc => {
        expect(doc.title).toContain('JavaScript')
      })
    })

    it('should search documents by content', () => {
      documentService.create('Doc 1', 'React is a great library')
      documentService.create('Doc 2', 'Vue is also great')
      documentService.create('Doc 3', 'Angular is powerful')

      const results = documentService.search('great')

      expect(results).toHaveLength(2)
    })

    it('should be case insensitive', () => {
      documentService.create('UPPERCASE TITLE', 'Some content')

      const results = documentService.search('uppercase')

      expect(results).toHaveLength(1)
    })

    it('should return empty array for no matches', () => {
      documentService.create('Doc 1', 'Content')
      const results = documentService.search('nonexistent')
      expect(results).toHaveLength(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty title', () => {
      const doc = documentService.create('', 'Content')
      expect(doc.title).toBe('')
    })

    it('should handle empty content', () => {
      const doc = documentService.create('Title', '')
      expect(doc.content).toBe('')
    })

    it('should handle very long content', () => {
      const longContent = 'a'.repeat(100000)
      const doc = documentService.create('Title', longContent)
      expect(doc.content).toHaveLength(100000)
    })

    it('should handle special characters in title', () => {
      const specialTitle = 'Title with <script>alert("xss")</script>'
      const doc = documentService.create(specialTitle, 'Content')
      expect(doc.title).toBe(specialTitle)
    })

    it('should handle unicode in content', () => {
      const unicodeContent = '中文内容 🎉 العربية'
      const doc = documentService.create('Unicode Doc', unicodeContent)
      const retrieved = documentService.getById(doc.id)
      expect(retrieved?.content).toBe(unicodeContent)
    })

    it('should handle multiple tags', () => {
      const tags = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5']
      const doc = documentService.create('Multi-tag Doc', 'Content', null, tags)
      const retrieved = documentService.getById(doc.id)
      expect(retrieved?.tags).toEqual(tags)
    })
  })

  describe('Data Persistence', () => {
    it('should persist documents to localStorage', () => {
      documentService.create('Persisted Doc', 'Content')

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        expect.any(String)
      )
    })

    it('should initialize tags array if missing', () => {
      const doc = documentService.create('Test Doc', 'Content')

      const stored = JSON.parse(mockLocalStorage.data[STORAGE_KEY])
      const found = stored.find((d: Document) => d.id === doc.id)
      found.tags = undefined

      mockLocalStorage.data[STORAGE_KEY] = JSON.stringify(stored)

      const retrieved = documentService.getById(doc.id)
      expect(retrieved?.tags).toEqual([])
    })
  })

  describe('Performance', () => {
    it('should handle large number of documents', () => {
      const start = Date.now()
      for (let i = 0; i < 100; i++) {
        documentService.create(`Doc ${i}`, `Content ${i}`)
      }
      const end = Date.now()

      expect(end - start).toBeLessThan(5000)
      expect(documentService.getAll()).toHaveLength(100)
    })
  })

  describe('Share', () => {
    it('should generate share link for document', () => {
      const doc = documentService.create('Share Test', 'Content')
      const link = documentService.share(doc.id)

      expect(link).toContain(doc.id)
    })

    it('should return null for sharing non-existent document', () => {
      const link = documentService.share('non-existent')
      expect(link).toBeNull()
    })
  })
})