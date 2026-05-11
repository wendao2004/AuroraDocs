export interface Category {
  id: string
  name: string
  color: string
  createdAt: Date
  updatedAt: Date
}

export interface Tag {
  id: string
  name: string
  color: string
  createdAt: Date
  updatedAt: Date
}

export interface Document {
  id: string
  title: string
  content: string
  categoryId: string | null
  tags: string[]
  createdAt: Date
  updatedAt: Date
  authorId: string
}

export interface DocumentListItem {
  id: string
  title: string
  categoryId: string | null
  tags: string[]
  updatedAt: Date
  authorName: string
}
