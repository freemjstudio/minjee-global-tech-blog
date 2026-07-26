import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { postStatsApi } from '../api/postStatsApi'
import type { PostStats } from '../model/postStats.types'

const likedStoragePrefix = 'liked-post:'
const viewedStoragePrefix = 'viewed-post:'
const localStatsStoragePrefix = 'local-post-stats:'

interface LocalStats {
  views: number
  likes: number
}

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

function getLocalStats(slug: string): LocalStats {
  if (!canUseStorage()) return { views: 0, likes: 0 }

  try {
    const raw = window.localStorage.getItem(`${localStatsStoragePrefix}${slug}`)
    return raw ? { views: 0, likes: 0, ...JSON.parse(raw) } : { views: 0, likes: 0 }
  } catch {
    return { views: 0, likes: 0 }
  }
}

function setLocalStats(slug: string, stats: LocalStats) {
  if (!canUseStorage()) return
  window.localStorage.setItem(`${localStatsStoragePrefix}${slug}`, JSON.stringify(stats))
}

function incrementLocalStat(slug: string, key: keyof LocalStats) {
  const current = getLocalStats(slug)
  const next = {
    ...current,
    [key]: current[key] + 1,
  }
  setLocalStats(slug, next)
  return next
}

function mergeFallbackWithLocal(
  slug: string,
  fallbackViews: number,
  fallbackLikes: number,
  localStats: LocalStats,
): PostStats {
  return {
    slug,
    views: fallbackViews + localStats.views,
    likes: fallbackLikes + localStats.likes,
  }
}

export function usePostStats(slug: string, fallback: Pick<PostStats, 'views' | 'likes'>) {
  const queryClient = useQueryClient()
  const [likedOverrides, setLikedOverrides] = useState<Record<string, boolean>>({})
  const [localStatsVersion, setLocalStatsVersion] = useState(0)
  const liked = likedOverrides[slug] ?? getLiked(slug)
  const localStats = useMemo(
    () => {
      void localStatsVersion
      return postStatsApi.isEnabled ? { views: 0, likes: 0 } : getLocalStats(slug)
    },
    [localStatsVersion, slug],
  )

  const fallbackStats = useMemo<PostStats>(
    () => mergeFallbackWithLocal(slug, fallback.views, fallback.likes, localStats),
    [fallback.likes, fallback.views, localStats, slug],
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
    if (!slug || getViewed(slug) || isViewing) return

    setViewed(slug)

    if (!postStatsApi.isEnabled) {
      incrementLocalStat(slug, 'views')
      const timer = setTimeout(() => setLocalStatsVersion((version) => version + 1), 0)
      return () => clearTimeout(timer)
    }

    incrementView()
  }, [incrementView, isViewing, slug])

  const like = () => {
    if (!slug || liked || isLiking) return

    setLiked(slug)
    setLikedOverrides((current) => ({ ...current, [slug]: true }))

    if (!postStatsApi.isEnabled) {
      incrementLocalStat(slug, 'likes')
      setLocalStatsVersion((version) => version + 1)
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
            views: stats?.views ?? post.viewCount + getLocalStats(post.slug).views,
            likes: stats?.likes ?? post.likeCount + getLocalStats(post.slug).likes,
          },
        ]
      }),
    )
  }, [posts, statsQuery.data])
}
