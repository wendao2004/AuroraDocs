import { invoke } from '@tauri-apps/api/core'

export const tauriService = {
  async saveDocument(content: string): Promise<{ success: boolean; error?: string }> {
    try {
      await invoke('save_document', { content })
      return { success: true }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  },

  async loadDocument(id: string): Promise<{ success: boolean; data?: string; error?: string }> {
    try {
      const data = await invoke<string>('load_document', { id })
      return { success: true, data }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  },
}
