import { storage, STORAGE_KEYS } from '../storage/localStorage'
import type { Category } from '../../models/Document'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

function getCategories(): Category[] {
  return storage.get<Category[]>(STORAGE_KEYS.CATEGORIES) || []
}

function saveCategories(categories: Category[]): void {
  storage.set(STORAGE_KEYS.CATEGORIES, categories)
}

export const categoryService = {
  getAll(): Category[] {
    return getCategories()
  },

  getById(id: string): Category | null {
    const categories = getCategories()
    return categories.find((c) => c.id === id) || null
  },

  create(name: string, color: string = '#1890ff'): Category {
    const categories = getCategories()
    const now = new Date()
    const newCategory: Category = {
      id: generateId(),
      name,
      color,
      createdAt: now,
      updatedAt: now,
    }
    categories.push(newCategory)
    saveCategories(categories)
    return newCategory
  },

  update(id: string, updates: Partial<Pick<Category, 'name' | 'color'>>): Category | null {
    const categories = getCategories()
    const index = categories.findIndex((c) => c.id === id)
    if (index === -1) return null

    categories[index] = {
      ...categories[index],
      ...updates,
      updatedAt: new Date(),
    }
    saveCategories(categories)
    return categories[index]
  },

  searchByName(name: string): Category[] {
    const categories = getCategories()
    return categories.filter((c) => c.name.toLowerCase().includes(name.toLowerCase()))
  },

  delete(id: string): boolean {
    const categories = getCategories()
    const index = categories.findIndex((c) => c.id === id)
    if (index === -1) return false

    categories.splice(index, 1)
    saveCategories(categories)
    return true
  },
}
