import { PostCardSkeleton } from '@/shared/ui/Skeleton'
import { usePostGraph } from '../hooks/usePost'
import { PostCard } from '../ui/PostCard'

export function GraphPage() {
  const { data, isLoading, isError } = usePostGraph()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">Graph is unavailable.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-8 dark:border-gray-800">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-600 dark:text-accent-300">
          Knowledge Garden
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-normal text-gray-900 dark:text-white">
          Explore topics through writing.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-500 dark:text-gray-400">
          Start from a topic, follow the connected articles, and discover related ideas without leaving the map.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {data.nodes.map((node) => (
          <PostCard
            key={node.slug}
            post={{
              id: data.nodes.findIndex((item) => item.slug === node.slug) + 1,
              title: node.title,
              slug: node.slug,
              excerpt: `${data.edges.filter((edge) => edge.source === node.slug || edge.target === node.slug).length} connected posts`,
              status: 'PUBLISHED',
              category: node.category,
              tags: node.tags,
              viewCount: 0,
              likeCount: 0,
              commentCount: 0,
              readingTimeMinutes: node.readingTimeMinutes,
              publishedAt: node.publishedAt,
            }}
          />
        ))}
      </div>
    </div>
  )
}
