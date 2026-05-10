export interface Document {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  authorId: string
}

export interface DocumentListItem {
  id: string
  title: string
  updatedAt: Date
  authorName: string
}
