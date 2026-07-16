import { isSupabaseConfigured, supabaseRequest } from '@/shared/api/supabaseClient'
import type { PostStats } from '../model/postStats.types'

interface PostStatsRow {
  slug: string
  views: number
  likes: number
  updated_at?: string
}

function fromRow(row: PostStatsRow): PostStats {
  return {
    slug: row.slug,
    views: row.views,
    likes: row.likes,
    updatedAt: row.updated_at,
  }
}

function normalizeRpcRow(data: PostStatsRow | PostStatsRow[] | null): PostStats | null {
  if (!data) return null
  return fromRow(Array.isArray(data) ? data[0] : data)
}

function encodeInFilter(values: string[]) {
  return values.map((value) => `"${value.replaceAll('"', '\\"')}"`).join(',')
}

export const postStatsApi = {
  isEnabled: isSupabaseConfigured,

  get: async (slug: string): Promise<PostStats | null> => {
    const params = new URLSearchParams({
      select: 'slug,views,likes,updated_at',
      slug: `eq.${slug}`,
    })
    const rows = await supabaseRequest<PostStatsRow[]>(`/rest/v1/post_stats?${params.toString()}`)
    return rows?.[0] ? fromRow(rows[0]) : null
  },

  getMany: async (slugs: string[]): Promise<Record<string, PostStats>> => {
    if (slugs.length === 0) return {}

    const params = new URLSearchParams({
      select: 'slug,views,likes,updated_at',
      slug: `in.(${encodeInFilter(slugs)})`,
    })
    const rows = await supabaseRequest<PostStatsRow[]>(`/rest/v1/post_stats?${params.toString()}`)

    return Object.fromEntries((rows ?? []).map((row) => [row.slug, fromRow(row)]))
  },

  incrementView: async (slug: string): Promise<PostStats | null> => {
    const row = await supabaseRequest<PostStatsRow | PostStatsRow[]>('/rest/v1/rpc/increment_post_view', {
      method: 'POST',
      body: { post_slug: slug },
    })
    return normalizeRpcRow(row)
  },

  incrementLike: async (slug: string): Promise<PostStats | null> => {
    const row = await supabaseRequest<PostStatsRow | PostStatsRow[]>('/rest/v1/rpc/increment_post_like', {
      method: 'POST',
      body: { post_slug: slug },
    })
    return normalizeRpcRow(row)
  },
}
