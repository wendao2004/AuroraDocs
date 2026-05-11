import { storage, STORAGE_KEYS } from '../storage/localStorage'
import type { Tag } from '../../models/Document'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

function getTags(): Tag[] {
  return storage.get<Tag[]>(STORAGE_KEYS.TAGS) || []
}

function saveTags(tags: Tag[]): void {
  storage.set(STORAGE_KEYS.TAGS, tags)
}

export const tagService = {
  getAll(): Tag[] {
    return getTags()
  },

  getById(id: string): Tag | null {
    const tags = getTags()
    return tags.find((t) => t.id === id) || null
  },

  create(name: string, color: string = '#52c41a'): Tag {
    const tags = getTags()
    const now = new Date()
    const newTag: Tag = {
      id: generateId(),
      name,
      color,
      createdAt: now,
      updatedAt: now,
    }
    tags.push(newTag)
    saveTags(tags)
    return newTag
  },

  update(id: string, updates: Partial<Pick<Tag, 'name' | 'color'>>): Tag | null {
    const tags = getTags()
    const index = tags.findIndex((t) => t.id === id)
    if (index === -1) return null

    tags[index] = {
      ...tags[index],
      ...updates,
      updatedAt: new Date(),
    }
    saveTags(tags)
    return tags[index]
  },

  searchByName(name: string): Tag[] {
    const tags = getTags()
    return tags.filter((t) => t.name.toLowerCase().includes(name.toLowerCase()))
  },

  delete(id: string): boolean {
    const tags = getTags()
    const index = tags.findIndex((t) => t.id === id)
    if (index === -1) return false

    tags.splice(index, 1)
    saveTags(tags)
    return true
  },
}
