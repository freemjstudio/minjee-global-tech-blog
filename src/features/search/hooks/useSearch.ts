import { useState, useEffect } from 'react'
import { usePostSearch } from '@/features/post/hooks/usePost'

export function useSearch(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  const result = usePostSearch(debouncedQuery)

  return { query, setQuery, debouncedQuery, ...result }
}
