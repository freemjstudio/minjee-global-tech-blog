import { Link } from 'react-router-dom'
import { ArrowRight, Boxes, GitBranch, Globe2 } from 'lucide-react'
import { usePostList } from '@/features/blog/hooks/usePost'
import { usePostStatsMap } from '@/features/blog/hooks/usePostStats'
import { PostCard } from '@/features/blog/ui/PostCard'
import { PostCardSkeleton } from '@/shared/ui/Skeleton'
import { Badge } from '@/shared/ui/Badge'
import { formatDateShort } from '@/shared/lib/formatDate'

const FEATURED_PROJECTS = [
  {
    title: 'Global Tax Engine',
    description: 'Tax calculation boundaries for multi-region commerce with auditable rules and operational fallbacks.',
    icon: Globe2,
    tags: ['Spring Boot', 'PostgreSQL', 'Architecture'],
  },
  {
    title: 'Kafka DLQ',
    description: 'A dead-letter workflow for replayable failures, clear ownership, and safer consumer recovery.',
    icon: GitBranch,
    tags: ['Kafka', 'Docker', 'Observability'],
  },
]

export function HomePage() {
  const { data, isLoading } = usePostList({ size: 6, status: 'PUBLISHED' })
  const posts = data?.content ?? []
  const featuredArticles = posts.slice(0, 3)
  const latestWriting = posts.slice(3, 6)
  const statsMap = usePostStatsMap(posts)

  return (
    <div className="space-y-28">
      <section className="flex min-h-[calc(100vh-12rem)] items-center py-10">
        <div className="max-w-4xl">
          <div className="mb-8 space-y-2">
            <p className="text-2xl font-semibold tracking-normal text-gray-900 md:text-3xl dark:text-white">
              Minjee Woo
            </p>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Software Engineer</p>
          </div>

          <h1 className="max-w-4xl text-5xl font-semibold leading-[1.05] tracking-normal text-gray-900 md:text-7xl dark:text-white">
            Think deeply.
            <span className="block text-gray-500 dark:text-gray-400">Engineer broadly.</span>
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-gray-500 dark:text-gray-400">
            Building reliable software through backend engineering, distributed systems, and data.
          </p>
        </div>
      </section>

      <section>
        <div className="mb-8 flex items-end justify-between gap-4">
          <SectionHeader eyebrow="Featured Articles" title="Technical writing selected for depth and clarity." />
          <Link to="/blog" className="hidden items-center gap-2 text-sm font-semibold text-accent-600 transition-colors hover:text-accent-500 md:inline-flex dark:text-accent-300">
            Blog
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <PostCardSkeleton key={i} />)
            : featuredArticles.map((post) => <PostCard key={post.id} post={post} stats={statsMap[post.slug]} />)}
        </div>
      </section>

      <section>
        <div className="mb-8 flex items-end justify-between gap-4">
          <SectionHeader eyebrow="Featured Projects" title="Case studies in backend and distributed systems." />
          <Link to="/projects" className="hidden items-center gap-2 text-sm font-semibold text-accent-600 transition-colors hover:text-accent-500 md:inline-flex dark:text-accent-300">
            Projects
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {FEATURED_PROJECTS.map((project) => {
            const Icon = project.icon
            return (
              <Link
                key={project.title}
                to="/projects"
                className="group rounded-xl border border-gray-200 bg-white p-6 shadow-[0_1px_12px_rgba(31,41,55,0.03)] transition duration-200 hover:-translate-y-0.5 hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900/70"
              >
                <div className="flex items-start justify-between gap-4">
                  <Icon className="h-5 w-5 text-gray-900 dark:text-white" />
                  <ArrowRight className="h-4 w-4 text-gray-400 transition-colors group-hover:text-accent-500" />
                </div>
                <h3 className="mt-6 text-xl font-semibold leading-snug tracking-normal text-gray-900 dark:text-white">
                  {project.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-gray-500 dark:text-gray-400">{project.description}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="default">{tag}</Badge>
                  ))}
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <section>
        <div className="mb-8 flex items-end justify-between gap-4">
          <SectionHeader eyebrow="Latest Writing" title="Recently published notes and essays." />
          <Boxes className="hidden h-5 w-5 text-accent-500 md:block" />
        </div>
        <div className="space-y-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <PostCardSkeleton key={i} />)
            : latestWriting.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="group flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-gray-300 md:flex-row md:items-center md:justify-between dark:border-gray-800 dark:bg-gray-900/70"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-medium text-accent-600 dark:text-accent-300">{post.category?.name}</span>
                      <span>·</span>
                      <time dateTime={post.publishedAt}>{formatDateShort(post.publishedAt)}</time>
                      <span>·</span>
                      <span>{post.readingTimeMinutes} min read</span>
                    </div>
                    <h3 className="mt-2 text-lg font-semibold tracking-normal text-gray-900 transition-colors group-hover:text-accent-600 dark:text-white dark:group-hover:text-accent-300">
                      {post.title}
                    </h3>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-gray-400 transition-colors group-hover:text-accent-500" />
                </Link>
              ))}
        </div>
      </section>
    </div>
  )
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-600 dark:text-accent-300">{eyebrow}</p>
      <h2 className="mt-3 max-w-2xl text-2xl font-semibold leading-tight tracking-normal text-gray-900 md:text-3xl dark:text-white">{title}</h2>
    </div>
  )
}
