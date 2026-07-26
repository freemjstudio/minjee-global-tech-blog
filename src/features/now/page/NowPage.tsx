import { BookOpen, BriefcaseBusiness, Globe2 } from 'lucide-react'

const CURRENTLY = [
  {
    text: 'Building global e-commerce core systems at CJ OliveYoung global mall & US local mall',
    icon: BriefcaseBusiness,
  },
  {
    text: 'Reading Designing Domain-Driven Design & Kotlin In Action',
    icon: BookOpen,
  },
  {
    text: 'Working toward an international software engineering career.',
    icon: Globe2,
  },
]

export function NowPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-14 py-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-600 dark:text-accent-300">Now</p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-normal text-gray-900 md:text-5xl dark:text-white">
          Currently
        </h1>
        <p className="mt-5 text-lg leading-8 text-gray-500 dark:text-gray-400">
          A small, living snapshot of what I am building, reading, and preparing for.
        </p>
      </header>

      <section className="rounded-xl border border-gray-200 bg-white p-7 shadow-[0_1px_14px_rgba(31,41,55,0.04)] dark:border-gray-800 dark:bg-gray-900/70">
        <div className="space-y-5">
          {CURRENTLY.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.text} className="flex gap-4">
                <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-accent-600 dark:bg-gray-950 dark:text-accent-300">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-base leading-7 text-gray-600 dark:text-gray-300">{item.text}</p>
              </div>
            )
          })}
        </div>
      </section>

    </div>
  )
}
