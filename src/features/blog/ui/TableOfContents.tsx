import { useEffect, useState } from 'react'

interface Heading {
  id: string
  text: string
  level: 2 | 3
}

function extractHeadings(content: string): Heading[] {
  const regex = /^(#{2,3})\s+(.+)$/gm
  const headings: Heading[] = []
  let match
  while ((match = regex.exec(content)) !== null) {
    const level = match[1].length as 2 | 3
    const text = match[2].trim()
    const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
    headings.push({ id, text, level })
  }
  return headings
}

interface TableOfContentsProps {
  content: string
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const headings = extractHeadings(content)
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        }
      },
      { rootMargin: '-80px 0px -60% 0px' },
    )
    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <nav className="sticky top-24 hidden rounded-xl border border-gray-200 bg-white/70 p-4 shadow-[0_1px_12px_rgba(31,41,55,0.03)] backdrop-blur xl:block dark:border-gray-800 dark:bg-gray-900/50">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">On this page</p>
      <ul className="space-y-1.5">
        {headings.map(({ id, text, level }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={`block rounded-lg py-1 text-sm leading-relaxed transition-colors ${
                level === 3 ? 'pl-3' : ''
              } ${
                activeId === id
                  ? 'font-medium text-accent-600 dark:text-accent-300'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
