import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { commentApi } from '../api/commentApi'
import type { CreateCommentRequest } from '../model/comment.types'

const commentKeys = {
  list: (postId: number) => ['comments', postId] as const,
}

export function useComments(postId: number) {
  return useQuery({
    queryKey: commentKeys.list(postId),
    queryFn: () => commentApi.list(postId),
    enabled: !!postId,
  })
}

export function useCreateComment(postId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateCommentRequest) => commentApi.create(postId, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: commentKeys.list(postId) }),
  })
}

export function useDeleteComment(postId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ commentId, guestPassword }: { commentId: number; guestPassword?: string }) =>
      commentApi.delete(commentId, guestPassword),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: commentKeys.list(postId) }),
  })
}
