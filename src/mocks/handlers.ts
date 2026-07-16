import { http, HttpResponse } from 'msw'
import { postSummaries, postDetails, postGraph } from './fixtures/posts'
import { categories } from './fixtures/categories'
import { tags } from './fixtures/tags'
import { resume } from './fixtures/resume'

const BASE = '/api/v1'

function ok<T>(data: T) {
  return HttpResponse.json({ success: true, data })
}

export const handlers = [
  // Posts — 목록
  http.get(`${BASE}/posts`, ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 10)
    const categorySlug = url.searchParams.get('categorySlug')
    const tagSlug = url.searchParams.get('tagSlug')
    const q = url.searchParams.get('q')

    let results = [...postSummaries]
    if (categorySlug) results = results.filter((p) => p.category?.slug === categorySlug)
    if (tagSlug) results = results.filter((p) => p.tags.some((t) => t.slug === tagSlug))
    if (q) results = results.filter((p) => p.title.toLowerCase().includes(q.toLowerCase()))

    const sliced = results.slice(page * size, page * size + size)
    return ok({
      content: sliced,
      page,
      size,
      totalElements: results.length,
      totalPages: Math.ceil(results.length / size),
      last: (page + 1) * size >= results.length,
    })
  }),

  // Posts — 검색
  http.get(`${BASE}/posts/search`, ({ request }) => {
    const q = new URL(request.url).searchParams.get('q') ?? ''
    const results = postSummaries.filter(
      (p) =>
        p.title.toLowerCase().includes(q.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(q.toLowerCase()),
    )
    return ok({ content: results, page: 0, size: 10, totalElements: results.length, totalPages: 1, last: true })
  }),

  // Posts — relation graph
  http.get(`${BASE}/posts/graph`, () => ok(postGraph)),

  // Posts — 상세 (slug)
  http.get(`${BASE}/posts/:slug`, ({ params }) => {
    const { slug } = params as { slug: string }
    const post = postDetails[slug] ?? postSummaries.find((p) => p.slug === slug)
    if (!post) return HttpResponse.json({ success: false, message: 'Not found' }, { status: 404 })
    // 조회수 +1 시뮬레이션
    const withView = { ...post, viewCount: (post.viewCount ?? 0) + 1 }
    return ok(withView)
  }),

  // Categories
  http.get(`${BASE}/categories`, () => ok(categories)),

  // Tags
  http.get(`${BASE}/tags`, () => ok(tags)),

  // Comments — 빈 배열
  http.get(`${BASE}/posts/:postId/comments`, () => ok([])),
  http.post(`${BASE}/posts/:postId/comments`, () =>
    ok({ id: 99, content: 'Mock comment', authorName: 'Guest', isGuest: true, status: 'ACTIVE', children: [], createdAt: new Date().toISOString() }),
  ),

  // Likes
  http.post(`${BASE}/posts/:postId/like`, () => ok(null)),
  http.delete(`${BASE}/posts/:postId/like`, () => ok(null)),

  // Resume
  http.get(`${BASE}/resume`, () => ok(resume)),

  // Auth — 항상 실패 (로그인 안 된 상태)
  http.get(`${BASE}/auth/me`, () =>
    HttpResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }),
  ),
]
