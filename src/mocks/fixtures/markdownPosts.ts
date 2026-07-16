import type { Category, Post, PostGraph, PostGraphEdge, PostSummary, Tag } from '@/features/blog/model/post.types'
import { categories } from './categories'
import { tags } from './tags'

type FrontmatterValue = boolean | string | number | string[] | undefined

interface MarkdownFrontmatter {
  title?: string
  slug?: string
  excerpt?: string
  description?: string
  category?: string
  tags?: string[]
  related?: string[]
  publishedAt?: string
  date?: string
  published?: boolean
  viewCount?: number
  likeCount?: number
}

type ParsedMarkdownPost = PostSummary & {
  content: string
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
  if (value === 'true') return true
  if (value === 'false') return false

  return value.replace(/^["']|["']$/g, '')
}

function parseMarkdown(raw: string): { frontmatter: MarkdownFrontmatter; content: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return { frontmatter: {}, content: raw.trim() }

  let activeArrayKey: string | undefined
  const frontmatter = match[1].split('\n').reduce<Record<string, FrontmatterValue>>((acc, line) => {
    const listItem = line.match(/^\s*-\s+(.+)$/)
    if (listItem && activeArrayKey) {
      const current = acc[activeArrayKey]
      acc[activeArrayKey] = [
        ...(Array.isArray(current) ? current : []),
        String(parseValue(listItem[1])),
      ]
      return acc
    }

    const separatorIndex = line.indexOf(':')
    if (separatorIndex === -1) return acc

    const key = line.slice(0, separatorIndex).trim()
    const value = line.slice(separatorIndex + 1)
    const parsedValue = parseValue(value)
    acc[key] = parsedValue
    activeArrayKey = value.trim() === '' ? key : undefined
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

function resolveCategoryFromTags(names: string[] = []): Category | undefined {
  return names.map(resolveCategory).find(Boolean)
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

const markdownPosts: ParsedMarkdownPost[] = Object.entries(markdownModules)
  .map(([path, raw], index) => {
    const { frontmatter, content } = parseMarkdown(raw)
    const fallbackSlug = path.split('/').pop()?.replace(/\.md$/, '') ?? `post-${index + 1}`
    const title = frontmatter.title ?? fallbackSlug
    const slug = frontmatter.slug ?? slugify(title)

    const category = resolveCategory(frontmatter.category) ?? resolveCategoryFromTags(frontmatter.tags)

    const summary: PostSummary = {
      id: index + 1,
      title,
      slug,
      excerpt: frontmatter.excerpt ?? frontmatter.description ?? excerptFromContent(content),
      status: 'PUBLISHED',
      category,
      tags: resolveTags(frontmatter.tags),
      viewCount: frontmatter.viewCount ?? 0,
      likeCount: frontmatter.likeCount ?? 0,
      commentCount: 0,
      readingTimeMinutes: estimateReadingTime(content),
      publishedAt: frontmatter.publishedAt ?? frontmatter.date ?? new Date().toISOString(),
      relatedSlugs: frontmatter.related ?? [],
    }

    return {
      ...summary,
      content,
    }
  })
  .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

function toPostSummary(post: ParsedMarkdownPost): PostSummary {
  const summary = { ...post }
  delete (summary as Partial<ParsedMarkdownPost>).content
  return summary
}

function edgeKey(source: string, target: string) {
  return [source, target].sort().join('::')
}

function addEdge(edges: Map<string, PostGraphEdge>, edge: PostGraphEdge) {
  edges.set(edgeKey(edge.source, edge.target), edge)
}

function buildPostGraph(): PostGraph {
  const nodes = markdownPosts.map((post) => ({
    id: post.slug,
    title: post.title,
    slug: post.slug,
    category: post.category,
    tags: post.tags,
    publishedAt: post.publishedAt,
    readingTimeMinutes: post.readingTimeMinutes,
  }))

  const knownSlugs = new Set(nodes.map((node) => node.slug))
  const edges = new Map<string, PostGraphEdge>()

  markdownPosts.forEach((post) => {
    post.relatedSlugs?.forEach((target) => {
      if (!knownSlugs.has(target) || target === post.slug) return
      addEdge(edges, {
        source: post.slug,
        target,
        type: 'related',
        label: 'related',
        weight: 3,
      })
    })
  })

  for (let i = 0; i < markdownPosts.length; i += 1) {
    for (let j = i + 1; j < markdownPosts.length; j += 1) {
      const source = markdownPosts[i]
      const target = markdownPosts[j]
      const key = edgeKey(source.slug, target.slug)
      if (edges.has(key)) continue

      const sourceTags = new Set(source.tags.map((tag) => tag.slug))
      const sharedTags = target.tags.filter((tag) => sourceTags.has(tag.slug))

      if (sharedTags.length > 0) {
        addEdge(edges, {
          source: source.slug,
          target: target.slug,
          type: 'tag',
          label: sharedTags.map((tag) => tag.name).join(', '),
          weight: sharedTags.length + 1,
        })
        continue
      }

      if (source.category?.slug && source.category.slug === target.category?.slug) {
        addEdge(edges, {
          source: source.slug,
          target: target.slug,
          type: 'category',
          label: source.category.name,
          weight: 1,
        })
      }
    }
  }

  return {
    nodes,
    edges: Array.from(edges.values()),
  }
}

export const markdownPostSummaries: PostSummary[] = markdownPosts.map(toPostSummary)

export const markdownPostGraph: PostGraph = buildPostGraph()

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
