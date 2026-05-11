import type { Document, DocumentListItem } from '../../models/Document'

export const documentApi = {
  async getDocuments(): Promise<DocumentListItem[]> {
    return [
      {
        id: '1',
        title: '项目计划书',
        categoryId: null,
        tags: [],
        updatedAt: new Date(),
        authorName: '张三',
      },
    ]
  },

  async getDocument(_id: string): Promise<Document | null> {
    return null
  },

  async saveDocument(doc: Partial<Document>): Promise<Document> {
    return {
      id: '1',
      title: doc.title || '未命名',
      content: doc.content || '',
      categoryId: null,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      authorId: '1',
    }
  },

  async deleteDocument(_id: string): Promise<boolean> {
    return true
  },
}
