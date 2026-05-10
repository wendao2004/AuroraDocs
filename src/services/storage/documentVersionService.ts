import { STORAGE_KEYS } from './localStorage'
import type { Document } from '../../models/Document'

export interface DocumentVersion {
  id: string
  documentId: string
  versionNumber: number
  title: string
  content: string
  createdAt: Date
  author: string
  description: string
  changes: {
    titleChanged: boolean
    contentChanged: boolean
    charsAdded: number
    charsRemoved: number
  }
}

export const documentVersionService = {
  getVersions(documentId: string): DocumentVersion[] {
    const key = `${STORAGE_KEYS.DOCUMENT_VERSIONS}_${documentId}`
    const data = localStorage.getItem(key)
    if (!data) return []
    const versions: DocumentVersion[] = JSON.parse(data)
    return versions.map((v) => ({
      ...v,
      createdAt: new Date(v.createdAt),
      author: v.author || 'User',
      description: v.description || 'No message',
      changes: v.changes || {
        titleChanged: false,
        contentChanged: false,
        charsAdded: 0,
        charsRemoved: 0,
      },
    }))
  },

  createVersion(document: Document, message?: string): DocumentVersion | null {
    const versions = this.getVersions(document.id)
    const lastVersion = versions[0]

    const changes = this.calculateChanges(document, lastVersion)

    if (!changes.titleChanged && !changes.contentChanged) {
      return null
    }

    const versionNumber = versions.length > 0 ? versions[0].versionNumber + 1 : 1
    const description = message || this.generateDescription(changes, lastVersion)

    const version: DocumentVersion = {
      id: `commit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      documentId: document.id,
      versionNumber,
      title: document.title,
      content: document.content,
      createdAt: new Date(),
      author: this.getAuthorName(),
      description,
      changes,
    }

    versions.unshift(version)

    const maxVersions = 50
    const trimmedVersions = versions.slice(0, maxVersions)

    const key = `${STORAGE_KEYS.DOCUMENT_VERSIONS}_${document.id}`
    localStorage.setItem(key, JSON.stringify(trimmedVersions))

    return version
  },

  calculateChanges(newDoc: Document, lastVersion: DocumentVersion | undefined): DocumentVersion['changes'] {
    if (!lastVersion) {
      return {
        titleChanged: true,
        contentChanged: true,
        charsAdded: newDoc.content.length,
        charsRemoved: 0,
      }
    }

    const titleChanged = newDoc.title !== lastVersion.title
    const contentChanged = newDoc.content !== lastVersion.content

    let charsAdded = 0
    let charsRemoved = 0

    if (contentChanged) {
      const oldLength = lastVersion.content.length
      const newLength = newDoc.content.length
      const diff = newLength - oldLength

      if (diff > 0) {
        charsAdded = diff
      } else {
        charsRemoved = Math.abs(diff)
      }
    }

    return {
      titleChanged,
      contentChanged,
      charsAdded,
      charsRemoved,
    }
  },

  generateDescription(changes: DocumentVersion['changes'], lastVersion: DocumentVersion | undefined): string {
    if (!lastVersion) {
      return 'Initial commit'
    }

    if (!changes.titleChanged && !changes.contentChanged) {
      return 'No changes'
    }

    const parts: string[] = []

    if (changes.titleChanged) {
      parts.push('Title updated')
    }

    if (changes.contentChanged) {
      if (changes.charsAdded > 0 && changes.charsRemoved > 0) {
        parts.push(`+${changes.charsAdded} -${changes.charsRemoved}`)
      } else if (changes.charsAdded > 0) {
        parts.push(`+${changes.charsAdded} chars`)
      } else if (changes.charsRemoved > 0) {
        parts.push(`-${changes.charsRemoved} chars`)
      } else {
        parts.push('Content modified')
      }
    }

    return parts.join(', ')
  },

  getAuthorName(): string {
    return localStorage.getItem('userName') || 'User'
  },

  getVersion(documentId: string, versionId: string): DocumentVersion | null {
    const versions = this.getVersions(documentId)
    return versions.find((v) => v.id === versionId) || null
  },

  getVersionByNumber(documentId: string, versionNumber: number): DocumentVersion | null {
    const versions = this.getVersions(documentId)
    return versions.find((v) => v.versionNumber === versionNumber) || null
  },

  deleteVersion(documentId: string, versionId: string): boolean {
    const versions = this.getVersions(documentId)
    const index = versions.findIndex((v) => v.id === versionId)
    if (index === -1) return false

    versions.splice(index, 1)
    const key = `${STORAGE_KEYS.DOCUMENT_VERSIONS}_${documentId}`
    localStorage.setItem(key, JSON.stringify(versions))
    return true
  },

  clearVersions(documentId: string): void {
    const key = `${STORAGE_KEYS.DOCUMENT_VERSIONS}_${documentId}`
    localStorage.removeItem(key)
  },

  getVersionCount(documentId: string): number {
    return this.getVersions(documentId).length
  },

  stripHtml(html: string): string {
    const temp = document.createElement('div')
    temp.innerHTML = html
    return temp.textContent || temp.innerText || ''
  },

  diffContent(oldContent: string, newContent: string): string[] {
    const oldText = this.stripHtml(oldContent)
    const newText = this.stripHtml(newContent)
    
    const oldLines = oldText.split('\n')
    const newLines = newText.split('\n')
    const result: string[] = []
    let lineNum = 1
    let hasChanges = false

    for (let i = 0; i < Math.max(oldLines.length, newLines.length); i++) {
      const oldLine = oldLines[i]
      const newLine = newLines[i]

      if (oldLine !== newLine) {
        hasChanges = true
        if (oldLine !== undefined) {
          result.push(`- ${lineNum}: ${oldLine}`)
        }
        if (newLine !== undefined) {
          result.push(`+ ${lineNum}: ${newLine}`)
        }
      }
      lineNum++
    }

    if (!hasChanges) {
      return ['No changes detected']
    }

    return result
  },

  getDiffWithPrevious(documentId: string, versionId: string): { lines: string[], titleDiff: boolean } | null {
    const versions = this.getVersions(documentId)
    const versionIndex = versions.findIndex((v) => v.id === versionId)
    if (versionIndex === -1) return null

    const currentVersion = versions[versionIndex]
    const previousVersion = versions[versionIndex + 1]

    if (!previousVersion) {
      return {
        lines: ['Initial version - no previous content'],
        titleDiff: currentVersion.title !== '',
      }
    }

    const lines = this.diffContent(previousVersion.content, currentVersion.content)
    const titleDiff = currentVersion.title !== previousVersion.title

    return { lines, titleDiff }
  },
}
