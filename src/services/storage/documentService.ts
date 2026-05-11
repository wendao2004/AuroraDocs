import { storage, STORAGE_KEYS } from '../storage/localStorage'
import type { Document, DocumentListItem } from '../../models/Document'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

function getDocuments(): Document[] {
  return storage.get<Document[]>(STORAGE_KEYS.DOCUMENTS) || []
}

function saveDocuments(documents: Document[]): void {
  storage.set(STORAGE_KEYS.DOCUMENTS, documents)
}

export const documentService = {
  getAll(): DocumentListItem[] {
    const docs = getDocuments()
    return docs.map((doc) => ({
      id: doc.id,
      title: doc.title,
      categoryId: doc.categoryId || null,
      tags: doc.tags || [],
      updatedAt: new Date(doc.updatedAt),
      authorName: '当前用户',
    }))
  },

  getById(id: string): Document | null {
    const docs = getDocuments()
    const doc = docs.find((doc) => doc.id === id) || null
    if (doc && !doc.tags) {
      doc.tags = []
    }
    return doc
  },

  create(title: string, content: string = '', categoryId: string | null = null, tags: string[] = []): Document {
    const docs = getDocuments()
    const now = new Date()
    const newDoc: Document = {
      id: generateId(),
      title,
      content,
      categoryId,
      tags,
      createdAt: now,
      updatedAt: now,
      authorId: 'current_user',
    }
    docs.push(newDoc)
    saveDocuments(docs)
    return newDoc
  },

  update(id: string, updates: Partial<Pick<Document, 'title' | 'content' | 'categoryId' | 'tags'>>): Document | null {
    const docs = getDocuments()
    const index = docs.findIndex((doc) => doc.id === id)
    if (index === -1) return null

    docs[index] = {
      ...docs[index],
      tags: docs[index].tags || [],
      ...updates,
      updatedAt: new Date(),
    }
    saveDocuments(docs)
    return docs[index]
  },

  delete(id: string): boolean {
    const docs = getDocuments()
    const index = docs.findIndex((doc) => doc.id === id)
    if (index === -1) return false

    docs.splice(index, 1)
    saveDocuments(docs)
    return true
  },

  share(id: string): string | null {
    const doc = this.getById(id)
    if (!doc) return null
    return `${window.location.origin}/#/share/${id}`
  },

  getByCategory(categoryId: string): DocumentListItem[] {
    const docs = getDocuments()
    return docs
      .filter((doc) => doc.categoryId === categoryId)
      .map((doc) => ({
        id: doc.id,
        title: doc.title,
        categoryId: doc.categoryId || null,
        tags: doc.tags || [],
        updatedAt: new Date(doc.updatedAt),
        authorName: '当前用户',
      }))
  },

  getByTag(tagId: string): DocumentListItem[] {
    const docs = getDocuments()
    return docs
      .filter((doc) => (doc.tags || []).includes(tagId))
      .map((doc) => ({
        id: doc.id,
        title: doc.title,
        categoryId: doc.categoryId || null,
        tags: doc.tags || [],
        updatedAt: new Date(doc.updatedAt),
        authorName: '当前用户',
      }))
  },

  search(keyword: string): DocumentListItem[] {
    const lowerKeyword = keyword.toLowerCase()
    const docs = getDocuments()
    return docs
      .filter((doc) => 
        doc.title.toLowerCase().includes(lowerKeyword) || 
        doc.content.toLowerCase().includes(lowerKeyword)
      )
      .map((doc) => ({
        id: doc.id,
        title: doc.title,
        categoryId: doc.categoryId || null,
        tags: doc.tags || [],
        updatedAt: new Date(doc.updatedAt),
        authorName: '当前用户',
      }))
  },
}
