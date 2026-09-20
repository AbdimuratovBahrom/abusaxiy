import { useState } from 'react'
import { useDebounce } from '../hooks/useDebounce.js'
import { useEffect } from 'react'
import { iconForType } from './StoreMarker.jsx'

function matches(point, query) {
  const q = query.trim().toLowerCase()
  if (!q) return false
  return (
    point.name.toLowerCase().includes(q) ||
    point.id.toLowerCase().includes(q) ||
    (point.block || '').toLowerCase().includes(q) ||
    (point.row || '').toLowerCase().includes(q)
  )
}

function SearchBar({ points, onQueryChange, onSelect }) {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    onQueryChange(debouncedQuery)
  }, [debouncedQuery, onQueryChange])

  const results = debouncedQuery.trim() ? points.filter((p) => matches(p, debouncedQuery)) : []

  return (
    <div className="w-full max-w-md">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Поиск: название, номер, блок, ряд..."
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 shadow-md focus:border-blue-500 focus:outline-none"
      />
      {results.length > 0 && (
        <ul className="mt-1 max-h-72 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-md">
          {results.map((point) => (
            <li key={point.id}>
              <button
                type="button"
                onClick={() => onSelect(point)}
                className="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-blue-50"
              >
                <span>{iconForType(point.type)}</span>
                <span className="flex-1">{point.name}</span>
                {point.block && (
                  <span className="text-xs text-gray-500">
                    {point.block}
                    {point.row ? `-${point.row}` : ''}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default SearchBar
