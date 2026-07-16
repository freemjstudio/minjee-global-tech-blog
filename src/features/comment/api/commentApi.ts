import { httpClient } from '@/shared/api/httpClient'
import type { Comment, CreateCommentRequest } from '../model/comment.types'

interface ApiResponse<T> {
  success: boolean
  data: T
}

export const commentApi = {
  list: async (postId: number): Promise<Comment[]> => {
    const { data } = await httpClient.get<ApiResponse<Comment[]>>(`/posts/${postId}/comments`)
    return data.data
  },

  create: async (postId: number, body: CreateCommentRequest): Promise<Comment> => {
    const { data } = await httpClient.post<ApiResponse<Comment>>(`/posts/${postId}/comments`, body)
    return data.data
  },

  delete: async (commentId: number, guestPassword?: string): Promise<void> => {
    await httpClient.delete(`/comments/${commentId}`, {
      data: guestPassword ? { guestPassword } : undefined,
    })
  },
}
