import React, { useState, useRef } from 'react'
import { Upload, Download, CheckCircle, AlertCircle, X } from 'lucide-react'
import api from '../../api/axios'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'

interface ImportResult {
  message:  string
  created:  number
  skipped:  number
  errors:   string[]
}

const BookImport: React.FC = () => {
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile]         = useState<File | null>(null)
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState<ImportResult | null>(null)
  const [error, setError]       = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      if (!f.name.endsWith('.csv')) {
        setError('Please select a CSV file.')
        return
      }
      setFile(f)
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a CSV file first.')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post('/books/import-csv/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setResult(response.data)
      setFile(null)
      if (fileRef.current) fileRef.current.value = ''
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        'Import failed. Please check your CSV file.'
      )
    } finally {
      setLoading(false)
    }
  }

  // Download sample CSV
  const downloadSample = () => {
    const sample = [
      'isbn,title,author,publisher,year,genre,description,copies',
      '9780743273565,The Great Gatsby,F. Scott Fitzgerald,Scribner,1925,Fiction,A story of the fabulously wealthy Jay Gatsby,3',
      '9780061120084,To Kill a Mockingbird,Harper Lee,HarperCollins,1960,Fiction,The unforgettable novel of a childhood in a sleepy Southern town,2',
      '9780451524935,1984,George Orwell,Signet Classic,1949,Science Fiction,A dystopian social science fiction novel,4',
    ].join('\n')

    const blob = new Blob([sample], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'sample_books.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Import Books via CSV
      </h1>
      <p className="text-gray-500 mb-6">
        Upload a CSV file to add multiple books at once.
        Duplicate ISBNs will be skipped automatically.
      </p>

      {/* CSV Format info */}
      <div className="card mb-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3">
          CSV Format
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-blue-800">
            <thead>
              <tr className="border-b border-blue-200">
                {['isbn', 'title*', 'author*', 'publisher',
                  'year', 'genre', 'description', 'copies'].map(h => (
                  <th key={h}
                      className="text-left py-1 px-2 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-1 px-2">9780743273565</td>
                <td className="py-1 px-2">Great Gatsby</td>
                <td className="py-1 px-2">Fitzgerald</td>
                <td className="py-1 px-2">Scribner</td>
                <td className="py-1 px-2">1925</td>
                <td className="py-1 px-2">Fiction</td>
                <td className="py-1 px-2">A story...</td>
                <td className="py-1 px-2">3</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-blue-700 mt-2">
          * Required fields. All others are optional.
        </p>
      </div>

      {error && (
        <div className="mb-4">
          <Alert type="error" message={error}
                 onClose={() => setError(null)} />
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="card mb-6 border-green-200 bg-green-50">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-green-900">
              Import Complete
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-3">
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {result.created}
              </p>
              <p className="text-xs text-gray-500">Created</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">
                {result.skipped}
              </p>
              <p className="text-xs text-gray-500">Skipped</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-2xl font-bold text-red-600">
                {result.errors.length}
              </p>
              <p className="text-xs text-gray-500">Errors</p>
            </div>
          </div>
          {result.errors.length > 0 && (
            <div className="bg-red-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-red-700 mb-1">
                Errors:
              </p>
              {result.errors.map((err, i) => (
                <p key={i} className="text-xs text-red-600">
                  {err}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upload area */}
      <div className="card">
        <div
          onClick={() => fileRef.current?.click()}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center
            cursor-pointer transition-colors mb-4
            ${file
              ? 'border-green-300 bg-green-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
            }
          `}
        >
          <Upload className={`w-10 h-10 mx-auto mb-3
            ${file ? 'text-green-500' : 'text-gray-400'}`} />

          {file ? (
            <div>
              <p className="font-medium text-green-700">{file.name}</p>
              <p className="text-sm text-green-600 mt-1">
                {(file.size / 1024).toFixed(1)} KB — ready to import
              </p>
            </div>
          ) : (
            <div>
              <p className="font-medium text-gray-700">
                Click to select CSV file
              </p>
              <p className="text-sm text-gray-500 mt-1">
                or drag and drop here
              </p>
            </div>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex gap-3">
          <Button
            onClick={handleUpload}
            loading={loading}
            disabled={!file}
            className="flex-1"
          >
            <Upload className="w-4 h-4" />
            {loading ? 'Importing...' : 'Import Books'}
          </Button>
          <Button
            variant="secondary"
            onClick={downloadSample}
          >
            <Download className="w-4 h-4" />
            Sample CSV
          </Button>
        </div>
      </div>
    </div>
  )
}

export default BookImport