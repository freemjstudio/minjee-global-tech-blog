const JOURNEY = [
  {
    year: '2025',
    title: 'Software Engineer, Backend',
    organization: 'CJ OLIVE YOUNG',
    period: '2025년 6월 - 현재 · 1년 2개월',
    location: '대한민국 서울',
    detail:
      'Global IT Platform Development Team SWE. Developing OliveYoung global mall as an Order & Claim Squad backend engineer.',
    highlights: ['FAQ Translation service project', 'US Tariff and VAT calculation project'],
  },
  {
    year: '2023',
    title: 'Data Engineer',
    organization: 'MEGAZONECLOUD',
    period: '2023년 4월 - 2025년 5월 · 2년 2개월',
    location: '대면근무',
    detail: 'Worked as a data engineer across cloud data platforms, MLOps pipelines, internal data infrastructure, and API development.',
    highlights: [
      'Constructed AWS Databricks Platform: developed ETL pipelines based on medallion architecture and reduced ETL runtime through PySpark tuning.',
      'MLOps Pipeline: migrated MLOps pipeline from on-premise to Azure Cloud and optimized pipelines on Azure Data Factory.',
      'GenAI360 Platform API Development: FastAPI, AWS VPC.',
      'Maintained and optimized Megazone Cloud in-house data platform: Airflow, BigQuery, S3, Athena, Delta Lake.',
    ],
  },
  {
    year: '2022',
    title: 'Software Engineer Intern',
    organization: 'Enuma, Inc',
    period: 'Mar 2022 - Aug 2022 · 6 months',
    location: 'Berkeley, California, United States',
    detail:
      'Worked as a data engineering intern testing log events with RudderStack, Avo, and Databricks, while also contributing to iOS work in Objective-C and C++.',
  },
]

const EDUCATION = [
  {
    year: '2021',
    title: 'Japanese Language and Literature, Computer Science',
    organization: '中央大学',
    detail:
      'Exchange student for a one-year program. Took Japanese classes and an iOS web application class.',
    highlights: ['Japanese'],
  },
  {
    year: '2017',
    title: "Bachelor's degree, Computer Software Engineering (double major)",
    organization: '중앙대학교',
    period: '2017년 3월 - 2023년 2월',
    detail: 'Studied Japanese Language and Literature with a double major in Computer Software Engineering.',
    highlights: ['iOS development study group', 'Algorithm club'],
  },
]

export function JourneyPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-16 py-8">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-600 dark:text-accent-300">Journey</p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-normal text-gray-900 md:text-5xl dark:text-white">
          A quiet timeline of work, learning, and systems.
        </h1>
      </header>

      <TimelineSection items={JOURNEY} />

      <section className="space-y-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">Education</p>
        <TimelineSection items={EDUCATION} compact />
      </section>
    </div>
  )
}

interface TimelineItem {
  year: string
  title: string
  organization: string
  period?: string
  location?: string
  detail: string
  highlights?: string[]
}

function TimelineSection({ items, compact = false }: { items: TimelineItem[]; compact?: boolean }) {
  return (
    <div className="space-y-0">
      {items.map((item, index) => (
        <article key={`${item.year}-${item.title}`} className="grid grid-cols-[88px_minmax(0,1fr)] gap-8">
          <div className="pt-1 text-sm font-semibold text-accent-600 dark:text-accent-300">{item.year}</div>
          <div className={`relative border-l border-gray-200 pl-8 dark:border-gray-800 ${index === items.length - 1 ? 'pb-0' : compact ? 'pb-8' : 'pb-12'}`}>
            <span className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full border-2 border-[#FCFCFC] bg-accent-400 dark:border-gray-950" />
            <h2 className="text-2xl font-semibold tracking-normal text-gray-900 dark:text-white">{item.title}</h2>
            <p className="mt-2 text-base font-medium text-gray-600 dark:text-gray-300">{item.organization}</p>
            {(item.period || item.location) && (
              <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                {[item.period, item.location].filter(Boolean).join(' · ')}
              </p>
            )}
            <p className="mt-2 text-sm leading-7 text-gray-500 dark:text-gray-400">{item.detail}</p>
            {item.highlights && (
              <ul className="mt-3 space-y-2">
                {item.highlights.map((highlight) => (
                  <li key={highlight} className="flex gap-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </article>
      ))}
    </div>
  )
}
