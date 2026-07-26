import { ArrowUpRight } from 'lucide-react'
import { Badge } from '@/shared/ui/Badge'

const STACK = [
  {
    category: 'Backend',
    items: ['Kotlin', 'Java', 'Spring Boot', 'PostgreSQL', 'Redis'],
  },
  {
    category: 'Distributed Systems',
    items: ['Kafka', 'Docker', 'Kubernetes', 'System Design', 'Architecture'],
  },
  {
    category: 'Data Engineering',
    items: ['Python', 'Apache Spark', 'Airflow', 'SQL'],
  },
]

const STORY = [
  {
    title: 'Who I am',
    body: 'I am Minjee Woo, a software engineer interested in backend systems, distributed workflows, and the quiet details that make software dependable.',
  },
  {
    title: 'Why I write',
    body: 'Writing helps me turn scattered debugging notes into reusable understanding. I write to explain what I wish had been clearer when I first met a problem.',
  },
  {
    title: 'Engineering philosophy',
    body: 'I value explicit boundaries, boring reliability, and systems that remain understandable when something goes wrong.',
  },
  {
    title: 'Current interests',
    body: 'I am studying domain-driven design, Kafka-based recovery patterns, Kubernetes operations, and backend architecture for global commerce.',
  },
]

export function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-20 py-8">
      <section className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-600 dark:text-accent-300">About</p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-normal text-gray-900 md:text-5xl dark:text-white">
          I build software by thinking carefully about systems, boundaries, and change.
        </h1>
        <div className="mt-6 flex gap-4">
          <a
            href="https://github.com/freemjstudio"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-semibold text-accent-600 transition-colors hover:text-accent-500 dark:text-accent-300"
          >
            GitHub
            <ArrowUpRight className="h-4 w-4" />
          </a>
          <a
            href="https://www.linkedin.com/in/minjiwoodev/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-semibold text-accent-600 transition-colors hover:text-accent-500 dark:text-accent-300"
          >
            LinkedIn
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {STORY.map((item) => (
          <article key={item.title} className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900/70">
            <h2 className="text-lg font-semibold tracking-normal text-gray-900 dark:text-white">{item.title}</h2>
            <p className="mt-3 text-sm leading-7 text-gray-500 dark:text-gray-400">{item.body}</p>
          </article>
        ))}
      </section>

      <section className="space-y-7">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-600 dark:text-accent-300">Stack</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-normal text-gray-900 dark:text-white">Technologies I use to build and reason about systems.</h2>
        </div>
        <div className="space-y-7">
          {STACK.map(({ category, items }) => (
            <div key={category}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">{category}</p>
              <div className="flex flex-wrap gap-2">
                {items.map((skill) => (
                  <Badge key={skill} variant="outline" className="bg-white px-3 py-1.5 dark:bg-gray-900">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
