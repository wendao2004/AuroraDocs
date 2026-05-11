import { describe, it, expect, beforeEach, vi } from 'vitest'
import { documentVersionService, type DocumentVersion } from '../services/storage/documentVersionService'
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

const STORAGE_PREFIX = 'aurora_docs_document_versions_'

function createMockDocument(overrides: Partial<Document> = {}): Document {
  return {
    id: 'doc-123',
    title: 'Test Document',
    content: 'Test content',
    categoryId: null,
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    authorId: 'user-1',
    ...overrides,
  }
}

describe('documentVersionService', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    vi.clearAllMocks()
  })

  describe('createVersion', () => {
    it('should create first version for new document', () => {
      const doc = createMockDocument()

      const version = documentVersionService.createVersion(doc)

      expect(version).toBeDefined()
      expect(version?.versionNumber).toBe(1)
      expect(version?.title).toBe(doc.title)
      expect(version?.content).toBe(doc.content)
      expect(version?.author).toBe('User')
      expect(version?.description).toBe('Initial commit')
      expect(version?.changes.titleChanged).toBe(true)
      expect(version?.changes.contentChanged).toBe(true)
    })

    it('should not create version if no changes', () => {
      const doc = createMockDocument()
      documentVersionService.createVersion(doc)

      const version = documentVersionService.createVersion(doc)

      expect(version).toBeNull()
    })

    it('should increment version number on subsequent saves', () => {
      const doc = createMockDocument({ content: 'Initial content' })
      documentVersionService.createVersion(doc)

      doc.content = 'Updated content'
      const version2 = documentVersionService.createVersion(doc)

      expect(version2?.versionNumber).toBe(2)
    })

    it('should track content changes correctly', () => {
      const doc = createMockDocument({ content: 'Hello' })
      documentVersionService.createVersion(doc)

      doc.content = 'Hello World'
      const version = documentVersionService.createVersion(doc)

      expect(version?.changes.charsAdded).toBe(6)
      expect(version?.changes.charsRemoved).toBe(0)
    })

    it('should track title changes', () => {
      const doc = createMockDocument({ title: 'Original Title' })
      documentVersionService.createVersion(doc)

      doc.title = 'New Title'
      const version = documentVersionService.createVersion(doc)

      expect(version?.changes.titleChanged).toBe(true)
      expect(version?.description).toContain('Title updated')
    })

    it('should limit versions to 50', () => {
      const doc = createMockDocument()

      for (let i = 0; i < 60; i++) {
        doc.content = `Content version ${i}`
        doc.updatedAt = new Date()
        documentVersionService.createVersion(doc)
      }

      const versions = documentVersionService.getVersions(doc.id)
      expect(versions.length).toBe(50)
    })

    it('should use custom message when provided', () => {
      const doc = createMockDocument()
      const customMessage = 'Custom commit message'

      const version = documentVersionService.createVersion(doc, customMessage)

      expect(version?.description).toBe(customMessage)
    })
  })

  describe('getVersions', () => {
    it('should return empty array for document with no versions', () => {
      const versions = documentVersionService.getVersions('non-existent-doc')
      expect(versions).toEqual([])
    })

    it('should return all versions for document', () => {
      const doc = createMockDocument()

      for (let i = 0; i < 5; i++) {
        doc.content = `Version ${i}`
        doc.updatedAt = new Date()
        documentVersionService.createVersion(doc)
      }

      const versions = documentVersionService.getVersions(doc.id)
      expect(versions.length).toBe(5)
    })

    it('should parse dates correctly', () => {
      const doc = createMockDocument()
      documentVersionService.createVersion(doc)

      const versions = documentVersionService.getVersions(doc.id)
      expect(versions[0].createdAt).toBeInstanceOf(Date)
    })
  })

  describe('getVersion', () => {
    it('should get specific version by id', () => {
      const doc = createMockDocument()
      const created = documentVersionService.createVersion(doc)

      const version = documentVersionService.getVersion(doc.id, created!.id)

      expect(version).toBeDefined()
      expect(version?.id).toBe(created?.id)
    })

    it('should return null for non-existent version', () => {
      const doc = createMockDocument()
      documentVersionService.createVersion(doc)

      const version = documentVersionService.getVersion(doc.id, 'non-existent-id')

      expect(version).toBeNull()
    })
  })

  describe('getVersionByNumber', () => {
    it('should get version by number', () => {
      const doc = createMockDocument()

      for (let i = 0; i < 5; i++) {
        doc.content = `Version ${i}`
        doc.updatedAt = new Date()
        documentVersionService.createVersion(doc)
      }

      const version = documentVersionService.getVersionByNumber(doc.id, 3)

      expect(version?.versionNumber).toBe(3)
    })
  })

  describe('deleteVersion', () => {
    it('should delete specific version', () => {
      const doc = createMockDocument()
      const version = documentVersionService.createVersion(doc)

      const result = documentVersionService.deleteVersion(doc.id, version!.id)

      expect(result).toBe(true)
      expect(documentVersionService.getVersion(doc.id, version!.id)).toBeNull()
    })

    it('should return false for non-existent version', () => {
      const doc = createMockDocument()
      documentVersionService.createVersion(doc)

      const result = documentVersionService.deleteVersion(doc.id, 'non-existent-id')

      expect(result).toBe(false)
    })
  })

  describe('clearVersions', () => {
    it('should clear all versions for document', () => {
      const doc = createMockDocument()

      for (let i = 0; i < 5; i++) {
        doc.content = `Version ${i}`
        doc.updatedAt = new Date()
        documentVersionService.createVersion(doc)
      }

      documentVersionService.clearVersions(doc.id)

      expect(documentVersionService.getVersions(doc.id)).toEqual([])
    })
  })

  describe('getVersionCount', () => {
    it('should return correct version count', () => {
      const doc = createMockDocument()

      for (let i = 0; i < 10; i++) {
        doc.content = `Version ${i}`
        doc.updatedAt = new Date()
        documentVersionService.createVersion(doc)
      }

      const count = documentVersionService.getVersionCount(doc.id)

      expect(count).toBe(10)
    })
  })

  describe('calculateChanges', () => {
    it('should detect content additions', () => {
      const oldDoc = createMockDocument({ content: 'Hello' })
      documentVersionService.createVersion(oldDoc)

      const newDoc = createMockDocument({ content: 'Hello World' })
      const changes = documentVersionService.calculateChanges(newDoc, oldDoc as any)

      expect(changes.charsAdded).toBe(6)
    })

    it('should detect content removals', () => {
      const oldDoc = createMockDocument({ content: 'Hello World' })
      documentVersionService.createVersion(oldDoc)

      const newDoc = createMockDocument({ content: 'Hello' })
      const changes = documentVersionService.calculateChanges(newDoc, oldDoc as any)

      expect(changes.charsRemoved).toBe(6)
    })

    it('should detect title changes', () => {
      const oldDoc = createMockDocument({ title: 'Old Title' })
      documentVersionService.createVersion(oldDoc)

      const newDoc = createMockDocument({ title: 'New Title' })
      const changes = documentVersionService.calculateChanges(newDoc, oldDoc as any)

      expect(changes.titleChanged).toBe(true)
    })
  })

  describe('diffContent', () => {
    it('should show diff between contents', () => {
      const oldContent = 'Line 1\nLine 2\nLine 3'
      const newContent = 'Line 1\nModified Line 2\nLine 3'

      const diff = documentVersionService.diffContent(oldContent, newContent)

      expect(diff.some(line => line.startsWith('-'))).toBe(true)
      expect(diff.some(line => line.startsWith('+'))).toBe(true)
    })

    it('should handle empty content', () => {
      const diff = documentVersionService.diffContent('', 'New content')
      expect(diff.length).toBeGreaterThan(0)
    })
  })

  describe('getDiffWithPrevious', () => {
    it('should get diff with previous version', () => {
      const doc = createMockDocument({ content: 'Original' })
      documentVersionService.createVersion(doc)

      doc.content = 'Updated'
      const version = documentVersionService.createVersion(doc)

      const diff = documentVersionService.getDiffWithPrevious(doc.id, version!.id)

      expect(diff).toBeDefined()
      expect(diff?.lines).toBeDefined()
    })

    it('should return null for non-existent version', () => {
      const diff = documentVersionService.getDiffWithPrevious('doc', 'non-existent')
      expect(diff).toBeNull()
    })
  })

  describe('generateDescription', () => {
    it('should generate description for initial commit', () => {
      const doc = createMockDocument()
      const changes = documentVersionService.calculateChanges(doc, undefined as any)
      const description = documentVersionService.generateDescription(changes, undefined as any)

      expect(description).toBe('Initial commit')
    })

    it('should generate description for content changes', () => {
      const changes = {
        titleChanged: false,
        contentChanged: true,
        charsAdded: 10,
        charsRemoved: 0,
      }
      const description = documentVersionService.generateDescription(changes, {} as any)

      expect(description).toContain('+10 chars')
    })

    it('should handle mixed additions and removals', () => {
      const changes = {
        titleChanged: false,
        contentChanged: true,
        charsAdded: 5,
        charsRemoved: 3,
      }
      const description = documentVersionService.generateDescription(changes, {} as any)

      expect(description).toContain('+5')
      expect(description).toContain('-3')
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long content', () => {
      const doc = createMockDocument({ content: 'a'.repeat(100000) })
      const version = documentVersionService.createVersion(doc)

      expect(version).toBeDefined()
      expect(version?.content.length).toBe(100000)
    })

    it('should handle special characters in content', () => {
      const specialContent = '<script>alert("xss")</script> & "quotes" #hashtag'
      const doc = createMockDocument({ content: specialContent })
      const version = documentVersionService.createVersion(doc)

      expect(version?.content).toBe(specialContent)
    })

    it('should handle unicode content', () => {
      const unicodeContent = '中文内容 🎉 العربية'
      const doc = createMockDocument({ content: unicodeContent })
      const version = documentVersionService.createVersion(doc)

      expect(version?.content).toBe(unicodeContent)
    })

    it('should handle empty title and content', () => {
      const doc = createMockDocument({ title: '', content: '' })
      const version = documentVersionService.createVersion(doc)

      expect(version?.title).toBe('')
      expect(version?.content).toBe('')
    })
  })
})