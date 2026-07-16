import { PostCardSkeleton } from '@/shared/ui/Skeleton'
import { usePostGraph } from '../hooks/usePost'
import { PostGraph } from '../ui/PostGraph'

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
          Graph
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-normal text-gray-900 dark:text-white">
          Blog knowledge map
        </h1>
      </div>

      <PostGraph graph={data} />
    </div>
  )
}
