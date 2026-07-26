import type { Post, PostGraph, PostSummary, PostListParams, PageResponse } from '../model/post.types'
import { postDetails, postGraph, postSummaries } from '@/mocks/fixtures/posts'

function paginate<T>(content: T[], page = 0, size = 10): PageResponse<T> {
  const start = page * size
  const sliced = content.slice(start, start + size)

  return {
    content: sliced,
    page,
    size,
    totalElements: content.length,
    totalPages: Math.ceil(content.length / size),
    last: start + size >= content.length,
  }
}

function filterPosts(params: PostListParams) {
  let results = [...postSummaries]

  if (params.categorySlug) {
    results = results.filter((post) => post.category?.slug === params.categorySlug)
  }

  if (params.tagSlug) {
    results = results.filter((post) => post.tags.some((tag) => tag.slug === params.tagSlug))
  }

  if (params.q) {
    const query = params.q.toLowerCase()
    results = results.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query),
    )
  }

  return results
}

export const postApi = {
  list: async (params: PostListParams): Promise<PageResponse<PostSummary>> => {
    return paginate(filterPosts(params), params.page, params.size)
  },

  getBySlug: async (slug: string): Promise<Post> => {
    const post = postDetails[slug]
    if (!post) throw new Error(`Post not found: ${slug}`)
    return post
  },

  search: async (q: string, page = 0): Promise<PageResponse<PostSummary>> => {
    return paginate(filterPosts({ q }), page, 10)
  },

  graph: async (): Promise<PostGraph> => {
    return postGraph
  },

  like: async (postId: number): Promise<void> => {
    void postId
  },

  unlike: async (postId: number): Promise<void> => {
    void postId
  },
}
