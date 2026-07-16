import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import type { ReactNode } from 'react'
import { CodeBlock } from '@/shared/ui/CodeBlock'
import type { Post } from '../model/post.types'

interface PostDetailProps {
  post: Post
}

function slugify(value: ReactNode) {
  return String(value)
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
}

export function PostDetail({ post }: PostDetailProps) {
  return (
    <div className="article-prose prose prose-gray max-w-none dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={{
          h2({ children }) {
            return <h2 id={slugify(children)}>{children}</h2>
          },
          h3({ children }) {
            return <h3 id={slugify(children)}>{children}</h3>
          },
          code({ className, children, ...props }) {
            const isBlock = className?.startsWith('language-')
            if (isBlock) {
              return <CodeBlock className={className}>{children}</CodeBlock>
            }
            return (
              <code
                className="rounded-md bg-gray-100 px-1.5 py-0.5 font-mono text-[0.875em] text-accent-600 dark:bg-gray-800 dark:text-accent-300"
                {...props}
              >
                {children}
              </code>
            )
          },
          a({ href, children }) {
            const isExternal = href?.startsWith('http')
            return (
              <a
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="text-accent-600 dark:text-accent-300 hover:text-accent-500 dark:hover:text-accent-200 underline underline-offset-4"
              >
                {children}
              </a>
            )
          },
          blockquote({ children }) {
            return <blockquote>{children}</blockquote>
          },
          img({ src, alt }) {
            return (
              <img
                src={src}
                alt={alt}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-800"
                loading="lazy"
              />
            )
          },
        }}
      >
        {post.content}
      </ReactMarkdown>
    </div>
  )
}
