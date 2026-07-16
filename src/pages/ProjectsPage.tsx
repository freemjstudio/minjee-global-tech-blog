import { ArrowUpRight, GitBranch, Globe2, RefreshCcw } from 'lucide-react'
import { Badge } from '@/shared/ui/Badge'

const PROJECTS = [
  {
    title: 'Global Tax Engine',
    problem: 'Global commerce flows need tax rules that can change by region without making checkout logic fragile.',
    architecture: 'Separated tax policy, calculation, and audit boundaries behind a backend service contract.',
    techStack: ['Kotlin', 'Spring Boot', 'PostgreSQL', 'Redis'],
    result: 'Reduced coupling between checkout and regional tax rules while preserving clear operational traces.',
    lessons: 'Rules engines work best when business exceptions are modeled explicitly instead of hidden in conditionals.',
    icon: Globe2,
  },
  {
    title: 'Kafka DLQ',
    problem: 'Consumer failures were hard to inspect, classify, and replay without risking duplicate side effects.',
    architecture: 'Designed a dead-letter flow with error metadata, replay states, and owner-oriented recovery paths.',
    techStack: ['Kafka', 'Docker', 'Spring Boot', 'Observability'],
    result: 'Made failures visible and replayable while keeping normal consumer paths simple.',
    lessons: 'A DLQ is not a trash bin. It is a product surface for production recovery.',
    icon: GitBranch,
  },
  {
    title: 'Outbox Pattern',
    problem: 'Database writes and event publication needed consistency without relying on distributed transactions.',
    architecture: 'Persisted domain changes and outbound events together, then published asynchronously with retry semantics.',
    techStack: ['Java', 'Spring Boot', 'PostgreSQL', 'Kafka'],
    result: 'Improved event reliability and made message publication easier to reason about during incidents.',
    lessons: 'Reliability often comes from making intermediate states durable and observable.',
    icon: RefreshCcw,
  },
]

export function ProjectsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-14 py-8">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-600 dark:text-accent-300">Projects</p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-normal text-gray-900 md:text-5xl dark:text-white">
          Backend case studies, written as engineering decisions.
        </h1>
        <p className="mt-5 text-lg leading-8 text-gray-500 dark:text-gray-400">
          Selected systems and patterns I use to think through reliability, boundaries, and operational clarity.
        </p>
      </header>

      <div className="space-y-6">
        {PROJECTS.map((project) => {
          const Icon = project.icon
          return (
            <article key={project.title} className="rounded-xl border border-gray-200 bg-white p-7 shadow-[0_1px_14px_rgba(31,41,55,0.04)] dark:border-gray-800 dark:bg-gray-900/70">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-950 text-white dark:bg-white dark:text-gray-950">
                    <Icon className="h-5 w-5 text-accent-400" />
                  </div>
                  <h2 className="text-2xl font-semibold tracking-normal text-gray-900 dark:text-white">{project.title}</h2>
                </div>
                <ArrowUpRight className="h-5 w-5 text-gray-400" />
              </div>

              <div className="mt-8 grid gap-6 md:grid-cols-2">
                <CaseStudyBlock label="Problem" value={project.problem} />
                <CaseStudyBlock label="Architecture" value={project.architecture} />
                <CaseStudyBlock label="Result" value={project.result} />
                <CaseStudyBlock label="Lessons Learned" value={project.lessons} />
              </div>

              <div className="mt-7 border-t border-gray-100 pt-5 dark:border-gray-800">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">Tech Stack</p>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech) => (
                    <Badge key={tech} variant="default">{tech}</Badge>
                  ))}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

function CaseStudyBlock({ label, value }: { label: string; value: string }) {
  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-600 dark:text-accent-300">{label}</p>
      <p className="mt-3 text-sm leading-7 text-gray-500 dark:text-gray-400">{value}</p>
    </section>
  )
}
