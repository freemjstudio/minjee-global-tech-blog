import type { Category, Post, PostSummary, Tag } from '@/features/post/model/post.types'
import { categories } from './categories'
import { tags } from './tags'

type FrontmatterValue = string | number | string[] | undefined

interface MarkdownFrontmatter {
  title?: string
  slug?: string
  excerpt?: string
  category?: string
  tags?: string[]
  publishedAt?: string
  viewCount?: number
  likeCount?: number
}

const markdownModules = import.meta.glob('/content/posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function parseValue(raw: string): FrontmatterValue {
  const value = raw.trim()

  if (value.startsWith('[') && value.endsWith(']')) {
    return value
      .slice(1, -1)
      .split(',')
      .map((item) => item.trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean)
  }

  if (/^\d+$/.test(value)) return Number(value)

  return value.replace(/^["']|["']$/g, '')
}

function parseMarkdown(raw: string): { frontmatter: MarkdownFrontmatter; content: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return { frontmatter: {}, content: raw.trim() }

  const frontmatter = match[1].split('\n').reduce<Record<string, FrontmatterValue>>((acc, line) => {
    const separatorIndex = line.indexOf(':')
    if (separatorIndex === -1) return acc

    const key = line.slice(0, separatorIndex).trim()
    const value = line.slice(separatorIndex + 1)
    acc[key] = parseValue(value)
    return acc
  }, {})

  return {
    frontmatter: frontmatter as MarkdownFrontmatter,
    content: match[2].trim(),
  }
}

function resolveCategory(name?: string): Category | undefined {
  if (!name) return undefined
  const categorySlug = slugify(name)
  return categories.find((category) => category.slug === categorySlug || category.name === name)
}

function resolveTags(names: string[] = []): Tag[] {
  return names.map((name, index) => {
    const tagSlug = slugify(name)
    return tags.find((tag) => tag.slug === tagSlug || tag.name === name) ?? {
      id: 1000 + index,
      name,
      slug: tagSlug,
    }
  })
}

function estimateReadingTime(content: string) {
  const words = content.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 220))
}

function excerptFromContent(content: string) {
  return content
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith('#') && !line.startsWith('```'))
    ?.replace(/[*_`>#]/g, '')
    .slice(0, 180) ?? ''
}

const markdownPosts = Object.entries(markdownModules)
  .map(([path, raw], index) => {
    const { frontmatter, content } = parseMarkdown(raw)
    const fallbackSlug = path.split('/').pop()?.replace(/\.md$/, '') ?? `post-${index + 1}`
    const title = frontmatter.title ?? fallbackSlug
    const slug = frontmatter.slug ?? slugify(title)

    const summary: PostSummary = {
      id: index + 1,
      title,
      slug,
      excerpt: frontmatter.excerpt ?? excerptFromContent(content),
      status: 'PUBLISHED',
      category: resolveCategory(frontmatter.category),
      tags: resolveTags(frontmatter.tags),
      viewCount: frontmatter.viewCount ?? 0,
      likeCount: frontmatter.likeCount ?? 0,
      commentCount: 0,
      readingTimeMinutes: estimateReadingTime(content),
      publishedAt: frontmatter.publishedAt ?? new Date().toISOString(),
    }

    return {
      ...summary,
      content,
    }
  })
  .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

export const markdownPostSummaries: PostSummary[] = markdownPosts.map(({ content: _content, ...summary }) => summary)

export const markdownPostDetails: Record<string, Post> = markdownPosts.reduce<Record<string, Post>>((acc, post, index) => {
  const previous = markdownPosts[index - 1]
  const next = markdownPosts[index + 1]

  acc[post.slug] = {
    ...post,
    prevPost: previous ? { title: previous.title, slug: previous.slug } : undefined,
    nextPost: next ? { title: next.title, slug: next.slug } : undefined,
  }

  return acc
}, {})
