import { beforeEach, afterEach, vi } from 'vitest'
import { storage, STORAGE_KEYS } from '../services/storage/localStorage'

beforeEach(() => {
  storage.clear()
})

afterEach(() => {
  storage.clear()
})

global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0,
} as any