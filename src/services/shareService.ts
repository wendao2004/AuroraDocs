import { documentService } from './storage/documentService'

export const shareService = {
  generateShareLink(documentId: string): string {
    const baseUrl = window.location.origin
    return `${baseUrl}/#/share/${documentId}`
  },

  getShareUrl(documentId: string): string | null {
    const doc = documentService.getById(documentId)
    if (!doc) return null
    return this.generateShareLink(documentId)
  },

  copyToClipboard(text: string): Promise<boolean> {
    return navigator.clipboard
      .writeText(text)
      .then(() => true)
      .catch(() => false)
  },
}
