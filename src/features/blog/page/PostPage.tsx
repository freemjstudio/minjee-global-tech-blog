import { useParams, Link } from 'react-router-dom'
import { usePost } from '@/features/blog/hooks/usePost'
import { PostMeta } from '@/features/blog/ui/PostMeta'
import { PostDetail } from '@/features/blog/ui/PostDetail'
import { PostReadCompletion } from '@/features/blog/ui/PostReadCompletion'
import { TableOfContents } from '@/features/blog/ui/TableOfContents'
import { ReadingProgressBar } from '@/features/blog/ui/ReadingProgressBar'
import { PostCardSkeleton } from '@/shared/ui/Skeleton'
import { useScrollCompletion } from '@/shared/hooks/useScrollCompletion'

export function PostPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: post, isLoading, isError } = usePost(slug ?? '')
  const { sentinelRef, completed } = useScrollCompletion()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>
    )
  }

  if (isError || !post) {
    return (
      <div className="py-20 text-center space-y-3">
        <p className="text-gray-500 dark:text-gray-400">Post not found.</p>
        <Link to="/blog" className="text-accent-500 dark:text-accent-300 hover:underline text-sm">
          ← Back to Blog
        </Link>
      </div>
    )
  }

  return (
    <>
      <ReadingProgressBar />
      <div className="mx-auto grid max-w-6xl gap-12 xl:grid-cols-[minmax(0,760px)_220px]">
        <article className="min-w-0">
          <PostMeta post={post} />
          <PostDetail post={post} />

          {/* Prev / Next */}
          {(post.prevPost || post.nextPost) && (
            <nav className="mt-14 grid gap-4 border-t border-gray-200 pt-8 md:grid-cols-2 dark:border-gray-800">
              {post.prevPost && (
                <Link
                  to={`/blog/${post.prevPost.slug}`}
                  className="group rounded-xl border border-gray-200 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900/70"
                >
                  <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">Previous</p>
                  <p className="text-sm leading-6 text-gray-700 transition-colors group-hover:text-accent-600 dark:text-gray-300 dark:group-hover:text-accent-300">
                    {post.prevPost.title}
                  </p>
                </Link>
              )}
              {post.nextPost && (
                <Link
                  to={`/blog/${post.nextPost.slug}`}
                  className="group rounded-xl border border-gray-200 bg-white p-5 text-right transition duration-200 hover:-translate-y-0.5 hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900/70"
                >
                  <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">Next</p>
                  <p className="text-sm leading-6 text-gray-700 transition-colors group-hover:text-accent-600 dark:text-gray-300 dark:group-hover:text-accent-300">
                    {post.nextPost.title}
                  </p>
                </Link>
              )}
            </nav>
          )}

          {/* 완독 감지 센티널 */}
          <div ref={sentinelRef} className="h-1" />

          {/* 완독 완료 섹션 */}
          {completed && <PostReadCompletion />}
        </article>

        <div>
          <TableOfContents content={post.content} />
        </div>
      </div>
    </>
  )
}
