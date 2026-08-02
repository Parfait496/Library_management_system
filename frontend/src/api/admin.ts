import api from './axios'

export interface BackupInfo {
  filename:   string
  size_kb:    number
  created_at: string
}

export const getBackupsApi = async (): Promise<BackupInfo[]> => {
  const response = await api.get<BackupInfo[]>('/backups/')
  return response.data
}

export const createBackupApi = async (): Promise<BackupInfo> => {
  const response = await api.post<BackupInfo>('/backups/')
  return response.data
}

export const downloadBackupApi = async (filename: string): Promise<void> => {
  const response = await api.get(`/backups/${filename}/download/`, {
    responseType: 'blob',
  })
  const blob = new Blob([response.data], { type: 'application/json' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export interface ActivityEntry {
  model:       string
  object_id:   number
  description: string
  action:      'Created' | 'Updated' | 'Deleted' | string
  changed_by:  string
  date:        string
}

export const getActivityLogApi = async (): Promise<ActivityEntry[]> => {
  const response = await api.get<ActivityEntry[]>('/activity-log/')
  return response.data
}