import { useMemo } from 'react'
import { useKonamiCode } from '@/shared/hooks/useKonamiCode'

const PETALS = ['🌸', '🌺', '✨', '🌷', '💮', '🪷']
const PETAL_COUNT = 40

interface Petal {
  id: number
  emoji: string
  left: number      // vw
  size: number      // rem
  duration: number  // s
  delay: number     // s
  sway: number      // px, horizontal drift
  rotation: number  // deg
}

function makePetals(): Petal[] {
  return Array.from({ length: PETAL_COUNT }, (_, i) => ({
    id: i,
    emoji: PETALS[Math.floor(Math.random() * PETALS.length)],
    left: Math.random() * 100,
    size: 0.9 + Math.random() * 1.4,
    duration: 2.5 + Math.random() * 2.5,
    delay: Math.random() * 1.8,
    sway: (Math.random() - 0.5) * 120,
    rotation: Math.random() * 360,
  }))
}

export function KonamiEasterEgg() {
  const activated = useKonamiCode()
  const petals = useMemo(() => (activated ? makePetals() : []), [activated])

  if (!activated) return null

  return (
    <>
      {/* 벚꽃 파티클 */}
      <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
        {petals.map((p) => (
          <span
            key={p.id}
            className="absolute top-0 select-none"
            style={{
              left: `${p.left}vw`,
              fontSize: `${p.size}rem`,
              animation: `petalFall ${p.duration}s ${p.delay}s ease-in forwards`,
              '--sway': `${p.sway}px`,
              '--rot': `${p.rotation}deg`,
            } as React.CSSProperties}
          >
            {p.emoji}
          </span>
        ))}
      </div>

      {/* 토스트 */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[101] animate-[toastIn_0.4s_ease-out]">
        <div className="flex items-center gap-2 rounded-full border border-accent-300/40 bg-gray-950/90 dark:bg-gray-950/90 backdrop-blur-md px-5 py-3 text-sm text-accent-300 shadow-lg shadow-accent-900/20">
          <span>🎮</span>
          <span className="font-medium">Konami Code unlocked!</span>
          <span className="text-gray-500 text-xs">you found the secret 🌸</span>
        </div>
      </div>
    </>
  )
}
