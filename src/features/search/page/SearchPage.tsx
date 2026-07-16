import { useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useSearch } from '@/features/search/hooks/useSearch'
import { usePostStatsMap } from '@/features/blog/hooks/usePostStats'
import { PostCard } from '@/features/blog/ui/PostCard'
import { PostCardSkeleton } from '@/shared/ui/Skeleton'
import { Input } from '@/shared/ui/Input'

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') ?? ''
  const { query, setQuery, debouncedQuery, data, isLoading } = useSearch(initialQuery)
  const statsMap = usePostStatsMap(data?.content ?? [])

  useEffect(() => {
    if (debouncedQuery) setSearchParams({ q: debouncedQuery })
  }, [debouncedQuery, setSearchParams])

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-600 dark:text-accent-300">Search</p>
        <h1 className="text-4xl font-semibold tracking-normal text-gray-900 dark:text-white">Find an essay</h1>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search systems, architecture, Kafka..."
          className="w-full"
          autoFocus
        />
      </div>

      {debouncedQuery.length >= 2 && (
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <PostCardSkeleton key={i} />)
          ) : data?.content.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No results for "{debouncedQuery}"</p>
          ) : (
            data?.content.map((post) => <PostCard key={post.id} post={post} stats={statsMap[post.slug]} />)
          )}
        </div>
      )}
    </div>
  )
}
