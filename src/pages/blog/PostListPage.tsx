import { useSearchParams } from 'react-router-dom'
import { usePostList } from '@/features/post/hooks/usePost'
import { PostCard } from '@/features/post/ui/PostCard'
import { PostCardSkeleton } from '@/shared/ui/Skeleton'
import { Button } from '@/shared/ui/Button'
import { Sidebar } from '@/widgets/Sidebar'

export function PostListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page') ?? 0)
  const categorySlug = searchParams.get('category') ?? undefined
  const tagSlug = searchParams.get('tag') ?? undefined

  const { data, isLoading } = usePostList({
    page,
    size: 10,
    status: 'PUBLISHED',
    categorySlug,
    tagSlug,
  })

  const setPage = (nextPage: number) => {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(nextPage))
    setSearchParams(next)
  }

  return (
    <div className="flex gap-10">
      <Sidebar />

      <main className="min-w-0 flex-1 space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-gray-200 pb-8 dark:border-gray-800">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-600 dark:text-accent-300">Blog</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-normal text-gray-900 dark:text-white">
              {categorySlug ? categorySlug : tagSlug ? tagSlug : 'All essays'}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-500 dark:text-gray-400">
              Technical writing on backend engineering, distributed systems, data engineering, architecture, and system design.
            </p>
          </div>
          {data && (
            <span className="text-sm text-gray-400 dark:text-gray-500">{data.totalElements} posts</span>
          )}
        </div>

        <div className="space-y-4">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <PostCardSkeleton key={i} />)
            : data?.content.map((post) => <PostCard key={post.id} post={post} />)}
        </div>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setPage(Math.max(page - 1, 0))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <span className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
              Page {page + 1}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={data.last}
            >
              Next
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
