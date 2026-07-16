import { httpClient } from '@/shared/api/httpClient'
import type { Post, PostSummary, PostListParams, PageResponse } from '../model/post.types'

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export const postApi = {
  list: async (params: PostListParams): Promise<PageResponse<PostSummary>> => {
    const { data } = await httpClient.get<ApiResponse<PageResponse<PostSummary>>>('/posts', { params })
    return data.data
  },

  getBySlug: async (slug: string): Promise<Post> => {
    const { data } = await httpClient.get<ApiResponse<Post>>(`/posts/${slug}`)
    return data.data
  },

  search: async (q: string, page = 0): Promise<PageResponse<PostSummary>> => {
    const { data } = await httpClient.get<ApiResponse<PageResponse<PostSummary>>>('/posts/search', {
      params: { q, page },
    })
    return data.data
  },

  like: async (postId: number): Promise<void> => {
    await httpClient.post(`/posts/${postId}/like`)
  },

  unlike: async (postId: number): Promise<void> => {
    await httpClient.delete(`/posts/${postId}/like`)
  },
}
