import { useQuery } from '@tanstack/react-query'
import { httpClient } from '@/shared/api/httpClient'
import { Button } from '@/shared/ui/Button'

interface ResumeData {
  name: string
  title: string
  summary: string
  experience: { company: string; role: string; period: string; description: string }[]
  education: { institution: string; degree: string; period: string }[]
  skills: string[]
}

interface ApiResponse<T> { success: boolean; data: T }

export function ResumePage() {
  const { data: resume } = useQuery({
    queryKey: ['resume'],
    queryFn: async () => {
      const { data } = await httpClient.get<ApiResponse<ResumeData>>('/resume')
      return data.data
    },
  })

  return (
    <div className="mx-auto max-w-3xl space-y-10 py-8">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-600 dark:text-accent-300">Career</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal text-gray-900 dark:text-white">Experience</h1>
        </div>
        <Button onClick={() => window.print()} variant="outline" size="sm">
          Print / Save PDF
        </Button>
      </div>

      {resume ? (
        <div className="space-y-10 rounded-xl border border-gray-200 bg-white p-8 text-gray-600 shadow-[0_1px_14px_rgba(31,41,55,0.04)] dark:border-gray-800 dark:bg-gray-900/70 dark:text-gray-300">
          <div>
            <h2 className="text-3xl font-semibold tracking-normal text-gray-900 dark:text-white">{resume.name}</h2>
            <p className="mt-2 text-accent-600 dark:text-accent-300">{resume.title}</p>
            <p className="mt-4 text-sm leading-7">{resume.summary}</p>
          </div>

          {resume.experience.length > 0 && (
            <div className="space-y-5">
              <h3 className="border-b border-gray-200 pb-3 text-lg font-semibold text-gray-900 dark:border-gray-800 dark:text-white">Experience</h3>
              {resume.experience.map((exp, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">{exp.role}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">{exp.period}</span>
                  </div>
                  <p className="text-sm text-accent-600 dark:text-accent-300">{exp.company}</p>
                  <p className="text-sm leading-7">{exp.description}</p>
                </div>
              ))}
            </div>
          )}

          {resume.education.length > 0 && (
            <div className="space-y-3">
              <h3 className="border-b border-gray-200 pb-3 text-lg font-semibold text-gray-900 dark:border-gray-800 dark:text-white">Education</h3>
              {resume.education.map((edu, i) => (
                <div key={i} className="flex items-baseline justify-between">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">{edu.degree}</span>
                    <span className="text-sm text-gray-400 dark:text-gray-500 ml-2">· {edu.institution}</span>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{edu.period}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-400 dark:text-gray-500">Loading resume...</p>
      )}
    </div>
  )
}
