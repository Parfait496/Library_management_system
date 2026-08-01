import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, BookOpen, Filter, Upload, Tag } from 'lucide-react'
import { getBooksApi, getGenresApi } from '../../api/books'
import { Book, Genre } from '../../types'
import useAuth from '../../hooks/useAuth'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import { Badge } from '../../components/ui/Badge'

const BookList: React.FC = () => {
  const navigate = useNavigate()
  const { isLibrarian, isAdmin } = useAuth()

  const [books, setBooks]           = useState<Book[]>([])
  // Top-level categories, each with .subcategories nested
  const [categories, setCategories] = useState<Genre[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedGenre, setSelectedGenre]       = useState<string>('')
  const [totalCount, setTotalCount] = useState(0)

  const subcategoriesForSelected =
    categories.find(c => c.id.toString() === selectedCategory)
      ?.subcategories ?? []

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [booksData, genresData] = await Promise.all([
        getBooksApi({
          search:   search || undefined,
          // If a subcategory is picked, filter to exactly that.
          // Otherwise, if only a category is picked, filter to
          // any book under any of its subcategories.
          genre:    selectedGenre ? Number(selectedGenre) : undefined,
          category: (!selectedGenre && selectedCategory)
            ? Number(selectedCategory) : undefined,
        }),
        getGenresApi({ top_level: true }),
      ])
      setBooks(booksData.results)
      setTotalCount(booksData.count)
      setCategories(genresData)
    } catch (err) {
      console.error('Failed to load books:', err)
    } finally {
      setLoading(false)
    }
  }, [search, selectedCategory, selectedGenre])

  useEffect(() => {
    const timer = setTimeout(() => { loadData() }, 400)
    return () => clearTimeout(timer)
  }, [loadData])

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value)
    setSelectedGenre('') // reset subcategory when category changes
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Book Catalogue
          </h1>
          <p className="text-gray-500 mt-1">
            {totalCount} book{totalCount !== 1 ? 's' : ''} available
          </p>
        </div>
        {(isLibrarian || isAdmin) && (
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => navigate('/books/import')}>
              <Upload className="w-4 h-4" />
              Import
            </Button>
            <Button variant="secondary" onClick={() => navigate('/genres')}>
              <Tag className="w-4 h-4" />
              Genres
            </Button>
            <Button onClick={() => navigate('/books/add')}>
              <Plus className="w-4 h-4" />
              Add Book
            </Button>
          </div>
        )}
      </div>

      {/* Search and filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2
                             w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, author, ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2
                             w-4 h-4 text-gray-400" />
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="input-field pl-9 pr-8 w-full sm:w-48"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="input-field pr-8 w-full sm:w-48"
            disabled={!selectedCategory}
          >
            <option value="">
              {selectedCategory ? 'All Subcategories' : 'Pick category first'}
            </option>
            {subcategoriesForSelected.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Books grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : books.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2
                        lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onClick={() => navigate(`/books/${book.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No books found
          </h3>
          <p className="text-gray-500">
            {search ? `No results for "${search}"` : 'No books yet.'}
          </p>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="mt-3 text-blue-600 hover:underline text-sm"
            >
              Clear search
            </button>
          )}
        </div>
      )}
    </div>
  )
}

interface BookCardProps {
  book: Book
  onClick: () => void
}

const BookCard: React.FC<BookCardProps> = ({ book, onClick }) => (
  <div
    onClick={onClick}
    className="card p-0 overflow-hidden cursor-pointer
               hover:shadow-md transition-shadow duration-200"
  >
    <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200
                    flex items-center justify-center overflow-hidden">
      {/* Use cover_image_url (full URL) not cover_image (relative path) */}
      {(book as any).cover_image_url ? (
        <img
          src={(book as any).cover_image_url}
          alt={book.title}
          className="h-full w-full object-cover"
          onError={(e) => {
            // If image fails to load show placeholder
            (e.target as HTMLImageElement).style.display = 'none'
          }}
        />
      ) : (
        <BookOpen className="w-16 h-16 text-blue-400" />
      )}
    </div>

    <div className="p-4">
      <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">
        {book.title}
      </h3>
      <p className="text-sm text-gray-500 mb-3">by {book.author}</p>
      <div className="flex items-center justify-between flex-wrap gap-1">
        {/* genre_full_path e.g. "Medical Sciences > Anatomy" */}
        {book.genre_full_path && (
          <Badge variant="info">{book.genre_full_path}</Badge>
        )}
        {book.is_available ? (
          <Badge variant="success">{book.availability_status}</Badge>
        ) : (
          <Badge variant="danger">Unavailable</Badge>
        )}
      </div>
    </div>
  </div>
)

export default BookList