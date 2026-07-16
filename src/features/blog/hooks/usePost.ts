import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { postApi } from '../api/postApi'
import type { PostListParams } from '../model/post.types'

export const postKeys = {
  all: ['posts'] as const,
  list: (params: PostListParams) => ['posts', 'list', params] as const,
  detail: (slug: string) => ['posts', 'detail', slug] as const,
  search: (q: string, page: number) => ['posts', 'search', q, page] as const,
  graph: ['posts', 'graph'] as const,
}

export function usePostList(params: PostListParams) {
  return useQuery({
    queryKey: postKeys.list(params),
    queryFn: () => postApi.list(params),
  })
}

export function usePost(slug: string) {
  return useQuery({
    queryKey: postKeys.detail(slug),
    queryFn: () => postApi.getBySlug(slug),
    enabled: !!slug,
  })
}

export function usePostSearch(q: string, page = 0) {
  return useQuery({
    queryKey: postKeys.search(q, page),
    queryFn: () => postApi.search(q, page),
    enabled: q.length >= 2,
  })
}

export function usePostGraph() {
  return useQuery({
    queryKey: postKeys.graph,
    queryFn: postApi.graph,
  })
}

export function usePostLike(postId: number) {
  const queryClient = useQueryClient()

  const like = useMutation({
    mutationFn: () => postApi.like(postId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: postKeys.all }),
  })

  const unlike = useMutation({
    mutationFn: () => postApi.unlike(postId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: postKeys.all }),
  })

  return { like, unlike }
}
