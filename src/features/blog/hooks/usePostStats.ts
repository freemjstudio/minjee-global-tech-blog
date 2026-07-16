import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { postStatsApi } from '../api/postStatsApi'
import type { PostStats } from '../model/postStats.types'

const likedStoragePrefix = 'liked-post:'
const viewedStoragePrefix = 'viewed-post:'

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function getLiked(slug: string) {
  if (!canUseStorage()) return false
  return window.localStorage.getItem(`${likedStoragePrefix}${slug}`) === 'true'
}

function setLiked(slug: string) {
  if (!canUseStorage()) return
  window.localStorage.setItem(`${likedStoragePrefix}${slug}`, 'true')
}

function getViewed(slug: string) {
  if (!canUseStorage()) return false
  return window.sessionStorage.getItem(`${viewedStoragePrefix}${slug}`) === 'true'
}

function setViewed(slug: string) {
  if (!canUseStorage()) return
  window.sessionStorage.setItem(`${viewedStoragePrefix}${slug}`, 'true')
}

export function usePostStats(slug: string, fallback: Pick<PostStats, 'views' | 'likes'>) {
  const queryClient = useQueryClient()
  const [liked, setLikedState] = useState(() => getLiked(slug))

  const fallbackStats = useMemo<PostStats>(
    () => ({ slug, views: fallback.views, likes: fallback.likes }),
    [fallback.likes, fallback.views, slug],
  )

  const statsQuery = useQuery({
    queryKey: ['post-stats', slug],
    queryFn: () => postStatsApi.get(slug),
    enabled: postStatsApi.isEnabled && Boolean(slug),
  })

  const { mutate: incrementView, isPending: isViewing } = useMutation({
    mutationFn: () => postStatsApi.incrementView(slug),
    onSuccess: (stats) => {
      if (stats) queryClient.setQueryData(['post-stats', slug], stats)
    },
  })

  const { mutate: incrementLike, isPending: isLiking } = useMutation({
    mutationFn: () => postStatsApi.incrementLike(slug),
    onSuccess: (stats) => {
      if (stats) queryClient.setQueryData(['post-stats', slug], stats)
    },
  })

  useEffect(() => {
    setLikedState(getLiked(slug))
  }, [slug])

  useEffect(() => {
    if (!slug || !postStatsApi.isEnabled || getViewed(slug) || isViewing) return

    setViewed(slug)
    incrementView()
  }, [incrementView, isViewing, slug])

  const like = () => {
    if (!slug || liked || isLiking) return

    setLiked(slug)
    setLikedState(true)

    if (!postStatsApi.isEnabled) {
      queryClient.setQueryData<PostStats>(['post-stats', slug], (current) => ({
        ...(current ?? fallbackStats),
        likes: (current?.likes ?? fallbackStats.likes) + 1,
      }))
      return
    }

    incrementLike()
  }

  return {
    stats: statsQuery.data ?? fallbackStats,
    liked,
    like,
    isDynamic: postStatsApi.isEnabled,
    isLiking,
  }
}

export function usePostStatsMap(posts: { slug: string; viewCount: number; likeCount: number }[]) {
  const slugs = useMemo(() => posts.map((post) => post.slug), [posts])

  const statsQuery = useQuery({
    queryKey: ['post-stats-map', slugs],
    queryFn: () => postStatsApi.getMany(slugs),
    enabled: postStatsApi.isEnabled && slugs.length > 0,
  })

  return useMemo(() => {
    return Object.fromEntries(
      posts.map((post) => {
        const stats = statsQuery.data?.[post.slug]
        return [
          post.slug,
          {
            views: stats?.views ?? post.viewCount,
            likes: stats?.likes ?? post.likeCount,
          },
        ]
      }),
    )
  }, [posts, statsQuery.data])
}
