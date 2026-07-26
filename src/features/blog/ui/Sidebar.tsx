import { NavLink, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import type { Category, Tag } from '@/features/blog/model/post.types'
import { postSummaries } from '@/mocks/fixtures/posts'

function uniqueBySlug<T extends { slug: string }>(items: T[]) {
  return Array.from(new Map(items.map((item) => [item.slug, item])).values())
}

function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () =>
      uniqueBySlug(postSummaries.map((post) => post.category).filter(Boolean) as Category[]),
  })
}

function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async () => uniqueBySlug(postSummaries.flatMap((post) => post.tags) as Tag[]),
  })
}

export function Sidebar() {
  const { data: categories } = useCategories()
  const { data: tags } = useTags()
  const [searchParams] = useSearchParams()
  const activeCategory = searchParams.get('category')
  const activeTag = searchParams.get('tag')

  return (
    <aside className="hidden w-60 shrink-0 lg:block">
      <div className="sticky top-24 space-y-7 rounded-xl border border-gray-200 bg-white/70 p-4 shadow-[0_1px_12px_rgba(31,41,55,0.03)] backdrop-blur dark:border-gray-800 dark:bg-gray-900/50">
        {categories && categories.length > 0 && (
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
              Categories
            </p>
            <ul className="space-y-1">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <NavLink
                    to={`/blog?category=${cat.slug}`}
                    className={() =>
                      `block rounded-lg px-3 py-2 text-sm transition-colors ${
                        activeCategory === cat.slug
                          ? 'bg-accent-50 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                      }`
                    }
                  >
                    {cat.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tags && tags.length > 0 && (
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
              Tags
            </p>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <NavLink
                  key={tag.id}
                  to={`/blog?tag=${tag.slug}`}
                  className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
                    activeTag === tag.slug
                      ? 'bg-accent-50 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100'
                  }`}
                >
                  {tag.name}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
