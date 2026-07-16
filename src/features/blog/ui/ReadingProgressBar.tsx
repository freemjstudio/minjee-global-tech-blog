import { useEffect, useState } from 'react'

export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0)
    }
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <div className="fixed left-0 top-0 z-[60] h-0.5 w-full bg-gray-200 dark:bg-gray-800">
      <div
        className="h-full bg-accent-400 transition-[width] duration-75"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
