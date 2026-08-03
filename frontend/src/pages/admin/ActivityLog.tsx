import React, { useEffect, useState, useCallback } from 'react'
import { History, Plus, Pencil, Trash2, Download } from 'lucide-react'
import { getActivityLogApi, ActivityEntry } from '../../api/admin'
import { downloadActivityLogExportApi } from '../../api/export'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import Alert from '../../components/ui/Alert'

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

const ACTION_STYLE: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  Created: { icon: <Plus className="w-3.5 h-3.5" />, color: 'text-green-700', bg: 'bg-green-100' },
  Updated: { icon: <Pencil className="w-3.5 h-3.5" />, color: 'text-blue-700', bg: 'bg-blue-100' },
  Deleted: { icon: <Trash2 className="w-3.5 h-3.5" />, color: 'text-red-700', bg: 'bg-red-100' },
}

const ActivityLog: React.FC = () => {
  const [entries, setEntries] = useState<ActivityEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadEntries = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getActivityLogApi()
      setEntries(data)
    } catch (err) {
      setError('Failed to load activity log.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadEntries() }, [loadEntries])

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <History className="w-6 h-6 text-blue-600" />
            Activity Log
          </h1>
          <p className="text-gray-500 mt-1">
            Who changed what, and when — across books, genres, borrow
            records, and fines.
          </p>
        </div>
        <Button variant="secondary" onClick={() => downloadActivityLogExportApi()}>
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {error && (
        <div className="mb-4">
          <Alert type="error" message={error} onClose={() => setError(null)} />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          {entries.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {entries.map((entry, i) => {
                const style = ACTION_STYLE[entry.action] || ACTION_STYLE.Updated
                return (
                  <div key={i} className="flex items-start gap-3 p-4 hover:bg-gray-50">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${style.bg} ${style.color}`}>
                      {style.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{entry.changed_by}</span>
                        {' '}{entry.action.toLowerCase()}{' '}
                        <span className="text-gray-500">{entry.model.toLowerCase()}</span>
                        {' '}<span className="font-medium">{entry.description}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDateTime(entry.date)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <History className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p>No activity recorded yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ActivityLog