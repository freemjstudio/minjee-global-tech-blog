import { useEffect, useState } from 'react'

const KONAMI = [
  'ArrowUp', 'ArrowUp',
  'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight',
  'ArrowLeft', 'ArrowRight',
  'b', 'a',
]

export function useKonamiCode() {
  const [activated, setActivated] = useState(false)

  useEffect(() => {
    let progress = 0

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === KONAMI[progress]) {
        progress += 1
        if (progress === KONAMI.length) {
          progress = 0
          setActivated(true)
          setTimeout(() => setActivated(false), 5000)
        }
      } else {
        // 첫 키와 일치하면 1로 재시작, 아니면 0
        progress = e.key === KONAMI[0] ? 1 : 0
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  return activated
}
