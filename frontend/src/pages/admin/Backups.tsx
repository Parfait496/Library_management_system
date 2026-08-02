import React, { useEffect, useState, useCallback } from 'react'
import { Database, Download, RefreshCw, HardDrive } from 'lucide-react'
import { getBackupsApi, createBackupApi, downloadBackupApi, BackupInfo } from '../../api/admin'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import Alert from '../../components/ui/Alert'

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

const Backups: React.FC = () => {
  const [backups, setBackups] = useState<BackupInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const loadBackups = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getBackupsApi()
      setBackups(data)
    } catch (err) {
      setError('Failed to load backups.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadBackups() }, [loadBackups])

  const handleCreateBackup = async () => {
    setCreating(true)
    setError(null)
    setSuccess(null)
    try {
      await createBackupApi()
      setSuccess('Backup created successfully.')
      await loadBackups()
    } catch (err) {
      setError('Failed to create backup. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  const handleDownload = async (filename: string) => {
    setDownloadingFile(filename)
    try {
      await downloadBackupApi(filename)
    } catch (err) {
      setError('Failed to download backup.')
    } finally {
      setDownloadingFile(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-600" />
            Backups
          </h1>
          <p className="text-gray-500 mt-1">
            A snapshot of every book, member, borrow record, and fine —
            saved as a plain file you can keep, no technical steps needed.
          </p>
        </div>
        <Button onClick={handleCreateBackup} loading={creating}>
          <RefreshCw className="w-4 h-4" />
          Backup Now
        </Button>
      </div>

      {error && (
        <div className="mb-4">
          <Alert type="error" message={error} onClose={() => setError(null)} />
        </div>
      )}
      {success && (
        <div className="mb-4">
          <Alert type="success" message={success} onClose={() => setSuccess(null)} />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          {backups.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">File</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Size</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Created</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {backups.map((b) => (
                  <tr key={b.filename} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{b.filename}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{b.size_kb} KB</td>
                    <td className="py-3 px-4 text-gray-500">{formatDateTime(b.created_at)}</td>
                    <td className="py-3 px-4">
                      <Button
                        size="sm"
                        variant="secondary"
                        loading={downloadingFile === b.filename}
                        onClick={() => handleDownload(b.filename)}
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Database className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p>No backups yet. Click "Backup Now" to create the first one.</p>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-4">
        Note: backups stored here live on the server's storage. For an
        extra layer of safety, an automated copy is also kept off-server
        on a daily schedule.
      </p>
    </div>
  )
}

export default Backups