export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export interface Category {
  id: number
  name: string
  slug: string
  parent?: { id: number; name: string; slug: string }
}

export interface Tag {
  id: number
  name: string
  slug: string
}

export interface Series {
  id: number
  title: string
  slug: string
  postCount: number
}

export interface PostSummary {
  id: number
  title: string
  slug: string
  excerpt: string
  status: PostStatus
  category?: Category
  tags: Tag[]
  series?: { id: number; title: string; slug: string; order: number }
  viewCount: number
  likeCount: number
  commentCount: number
  readingTimeMinutes: number
  publishedAt: string
  thumbnailUrl?: string
  relatedSlugs?: string[]
}

export interface Post extends PostSummary {
  content: string
  prevPost?: { title: string; slug: string }
  nextPost?: { title: string; slug: string }
}

export interface PostListParams {
  page?: number
  size?: number
  categorySlug?: string
  tagSlug?: string
  seriesSlug?: string
  status?: PostStatus
  q?: string
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

export interface PostGraphNode {
  id: string
  title: string
  slug: string
  excerpt: string
  category?: Category
  tags: Tag[]
  publishedAt: string
  readingTimeMinutes: number
}

export interface PostGraphEdge {
  source: string
  target: string
  type: 'related' | 'tag' | 'category'
  label?: string
  weight: number
}

export interface PostGraph {
  nodes: PostGraphNode[]
  edges: PostGraphEdge[]
}
