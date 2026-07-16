import { isSupabaseConfigured, supabase } from '@/shared/api/supabaseClient'
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

export const postStatsApi = {
  isEnabled: isSupabaseConfigured,

  get: async (slug: string): Promise<PostStats | null> => {
    if (!supabase) return null

    const { data, error } = await supabase
      .from('post_stats')
      .select('slug, views, likes, updated_at')
      .eq('slug', slug)
      .maybeSingle<PostStatsRow>()

    if (error) throw error
    return data ? fromRow(data) : null
  },

  getMany: async (slugs: string[]): Promise<Record<string, PostStats>> => {
    if (!supabase || slugs.length === 0) return {}

    const { data, error } = await supabase
      .from('post_stats')
      .select('slug, views, likes, updated_at')
      .in('slug', slugs)
      .returns<PostStatsRow[]>()

    if (error) throw error

    return Object.fromEntries((data ?? []).map((row) => [row.slug, fromRow(row)]))
  },

  incrementView: async (slug: string): Promise<PostStats | null> => {
    if (!supabase) return null

    const { data, error } = await supabase
      .rpc('increment_post_view', { post_slug: slug })
      .single<PostStatsRow>()

    if (error) throw error
    return data ? fromRow(data) : null
  },

  incrementLike: async (slug: string): Promise<PostStats | null> => {
    if (!supabase) return null

    const { data, error } = await supabase
      .rpc('increment_post_like', { post_slug: slug })
      .single<PostStatsRow>()

    if (error) throw error
    return data ? fromRow(data) : null
  },
}
