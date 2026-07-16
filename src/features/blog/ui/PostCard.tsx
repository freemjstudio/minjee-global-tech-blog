import { Link } from 'react-router-dom'
import { Badge } from '@/shared/ui/Badge'
import { formatDateShort } from '@/shared/lib/formatDate'
import type { PostSummary } from '../model/post.types'

interface PostCardProps {
  post: PostSummary
  stats?: {
    views: number
    likes: number
  }
}

export function PostCard({ post, stats }: PostCardProps) {
  const viewCount = stats?.views ?? post.viewCount
  const likeCount = stats?.likes ?? post.likeCount

  return (
    <article className="group rounded-xl border border-gray-200 bg-white p-6 shadow-[0_1px_12px_rgba(31,41,55,0.03)] transition duration-200 hover:-translate-y-0.5 hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900/70">
      <Link to={`/blog/${post.slug}`} className="block space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          {post.category && (
            <span className="font-medium text-accent-600 dark:text-accent-300">{post.category.name}</span>
          )}
          <span>·</span>
          <span>{formatDateShort(post.publishedAt)}</span>
          <span>·</span>
          <span>{post.readingTimeMinutes} min read</span>
        </div>

        <h2 className="text-xl font-semibold leading-snug tracking-normal text-gray-900 transition-colors group-hover:text-accent-600 dark:text-white dark:group-hover:text-accent-300">
          {post.title}
        </h2>

        <p className="line-clamp-2 text-sm leading-7 text-gray-500 dark:text-gray-400">
          {post.excerpt}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div className="flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map((tag) => (
              <Badge key={tag.id} variant="default">{tag.name}</Badge>
            ))}
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
            <span>{viewCount.toLocaleString()} views</span>
            <span>♥ {likeCount.toLocaleString()}</span>
          </div>
        </div>
      </Link>
    </article>
  )
}
