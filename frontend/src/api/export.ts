// Add this to your api/ folder, e.g. api/export.ts

import api from './axios'

const downloadBlob = async (url: string, fallbackFilename: string) => {
  const response = await api.get(url, { responseType: 'blob' })
  const blob = new Blob([response.data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const objectUrl = window.URL.createObjectURL(blob)
  const disposition = response.headers['content-disposition']
  const match = disposition && disposition.match(/filename="(.+)"/)
  const filename = match ? match[1] : fallbackFilename

  const link = document.createElement('a')
  link.href = objectUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(objectUrl)
}

export const downloadSnapshotApi = async (): Promise<void> => {
  await downloadBlob('/export/snapshot/', 'asome_library_snapshot.xlsx')
}

export const downloadBooksExportApi = async (): Promise<void> => {
  await downloadBlob('/export/snapshot/?sheets=books', 'asome_library_books.xlsx')
}

export const downloadMembersExportApi = async (): Promise<void> => {
  await downloadBlob('/export/snapshot/?sheets=members', 'asome_library_members.xlsx')
}

export const downloadActivityLogExportApi = async (): Promise<void> => {
  await downloadBlob('/export/activity-log/', 'asome_library_activity_log.xlsx')
}