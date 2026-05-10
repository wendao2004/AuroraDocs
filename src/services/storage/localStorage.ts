const STORAGE_KEYS = {
  DOCUMENTS: 'aurora_docs_documents',
  TEAMS: 'aurora_docs_teams',
  TASKS: 'aurora_docs_tasks',
  CURRENT_USER: 'aurora_docs_current_user',
  APP_SETTINGS: 'aurora_docs_settings',
  DOCUMENT_VERSIONS: 'aurora_docs_document_versions',
}

export const storage = {
  get<T>(key: string): T | null {
    try {
      const data = localStorage.getItem(key)
      if (data) {
        const parsed = JSON.parse(data)
        return parsed
      }
      return null
    } catch {
      return null
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Storage set error:', error)
    }
  },

  remove(key: string): void {
    localStorage.removeItem(key)
  },

  clear(): void {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key)
    })
  },
}

export { STORAGE_KEYS }
