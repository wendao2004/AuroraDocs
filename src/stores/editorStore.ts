import { defineStore } from 'pinia'
import type { Document } from '../models/Document'

interface EditorState {
  content: string
  isDirty: boolean
  lastSaved: Date | null
}

export const useEditorStore = defineStore('editor', {
  state: (): EditorState => ({
    content: '<p>欢迎使用极光文档编辑器</p>',
    isDirty: false,
    lastSaved: null,
  }),

  actions: {
    updateContent(newContent: string) {
      this.content = newContent
      this.isDirty = true
    },

    save() {
      this.lastSaved = new Date()
      this.isDirty = false
    },

    loadDocument(doc: Document) {
      this.content = doc.content
      this.isDirty = false
    },
  },
})
