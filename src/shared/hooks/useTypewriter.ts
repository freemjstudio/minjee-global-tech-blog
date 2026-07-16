import { useState, useEffect } from 'react'

interface Options {
  texts: string[]
  typeSpeed?: number
  deleteSpeed?: number
  pauseMs?: number
  loop?: boolean
}

export function useTypewriter({
  texts,
  typeSpeed = 75,
  deleteSpeed = 40,
  pauseMs = 2200,
  loop = true,
}: Options) {
  const [displayed, setDisplayed] = useState('')
  const [textIndex, setTextIndex] = useState(0)
  const [phase, setPhase] = useState<'typing' | 'pausing' | 'deleting'>('typing')

  useEffect(() => {
    const current = texts[textIndex]

    if (phase === 'typing') {
      if (displayed === current) {
        // 마지막 텍스트이고 loop=false면 멈춤
        if (!loop && textIndex === texts.length - 1) return
        const t = setTimeout(() => setPhase('pausing'), pauseMs)
        return () => clearTimeout(t)
      }
      const t = setTimeout(
        () => setDisplayed(current.slice(0, displayed.length + 1)),
        typeSpeed,
      )
      return () => clearTimeout(t)
    }

    if (phase === 'pausing') {
      const t = setTimeout(() => setPhase('deleting'), 0)
      return () => clearTimeout(t)
    }

    if (phase === 'deleting') {
      if (displayed === '') {
        const t = setTimeout(() => {
          setTextIndex((i) => (i + 1) % texts.length)
          setPhase('typing')
        }, 0)
        return () => clearTimeout(t)
      }
      const t = setTimeout(
        () => setDisplayed((d) => d.slice(0, -1)),
        deleteSpeed,
      )
      return () => clearTimeout(t)
    }
  }, [displayed, phase, textIndex, texts, typeSpeed, deleteSpeed, pauseMs, loop])

  return { displayed, isTyping: phase === 'typing' }
}
