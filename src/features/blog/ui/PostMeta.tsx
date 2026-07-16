import { Link } from 'react-router-dom'
import { Badge } from '@/shared/ui/Badge'
import { formatDate } from '@/shared/lib/formatDate'
import type { Post } from '../model/post.types'

interface PostMetaProps {
  post: Post
}

export function PostMeta({ post }: PostMetaProps) {
  return (
    <header className="mb-12 space-y-6">
      <nav className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500" aria-label="Breadcrumb">
        <Link to="/" className="transition-colors hover:text-gray-700 dark:hover:text-gray-300">Home</Link>
        <span>/</span>
        <Link to="/blog" className="transition-colors hover:text-gray-700 dark:hover:text-gray-300">Blog</Link>
      </nav>

      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        {post.category && (
          <>
            <span className="font-medium text-accent-600 dark:text-accent-300">{post.category.name}</span>
            <span>·</span>
          </>
        )}
        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
        <span>·</span>
        <span>{post.readingTimeMinutes} min read</span>
        <span>·</span>
        <span>{post.viewCount.toLocaleString()} views</span>
      </div>

      <h1 className="max-w-3xl text-4xl font-semibold leading-[1.1] tracking-normal text-gray-900 md:text-5xl dark:text-white">
        {post.title}
      </h1>

      {post.excerpt && (
        <p className="max-w-3xl text-lg leading-8 text-gray-500 dark:text-gray-400">{post.excerpt}</p>
      )}

      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Badge key={tag.id} variant="outline">{tag.name}</Badge>
          ))}
        </div>
      )}
    </header>
  )
}
