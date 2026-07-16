import { useEffect, useRef, useState } from 'react'

export function useScrollCompletion() {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !completed) setCompleted(true)
      },
      { threshold: 0.5 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [completed])

  return { sentinelRef, completed }
}
