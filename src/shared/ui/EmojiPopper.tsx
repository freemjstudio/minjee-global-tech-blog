import { useState, useCallback } from 'react'

interface Particle {
  id: number
  emoji: string
  dx: number
  dy: number
  rotate: number
  size: number
}

interface EmojiPopperProps {
  emoji: string
  label?: string
  count?: number
}

const BURST_COUNT = 14
const BURST_RADIUS = 80

function makeParticles(emoji: string, count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = ((360 / count) * i + Math.random() * 20) * (Math.PI / 180)
    const r = BURST_RADIUS + Math.random() * 40
    return {
      id: Date.now() + i + Math.random(),
      emoji,
      dx: Math.cos(angle) * r,
      dy: Math.sin(angle) * r,
      rotate: Math.random() * 720 - 360,
      size: 0.8 + Math.random() * 0.8,
    }
  })
}

export function EmojiPopper({ emoji, label, count = BURST_COUNT }: EmojiPopperProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const [clicks, setClicks] = useState(0)

  const handleClick = useCallback(() => {
    setClicks((c) => c + 1)
    const next = makeParticles(emoji, count)
    setParticles((p) => [...p, ...next])
    setTimeout(() => {
      setParticles((p) => p.filter((x) => !next.find((n) => n.id === x.id)))
    }, 900)
  }, [emoji, count])

  return (
    <div className="relative inline-flex flex-col items-center gap-1">
      {/* 버스트 파티클 */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="pointer-events-none absolute left-1/2 top-1/2 select-none"
          style={{
            fontSize: `${p.size}rem`,
            animation: 'emojiBurst 0.85s ease-out forwards',
            '--dx': `${p.dx}px`,
            '--dy': `${p.dy}px`,
            '--rot': `${p.rotate}deg`,
          } as React.CSSProperties}
        >
          {p.emoji}
        </span>
      ))}

      {/* 메인 버튼 */}
      <button
        onClick={handleClick}
        className="relative text-2xl transition-transform active:scale-90 hover:scale-110 duration-150 select-none"
        aria-label={label ?? emoji}
      >
        {emoji}
      </button>

      {/* 클릭 카운트 */}
      {clicks > 0 && (
        <span className="text-xs text-gray-400 dark:text-gray-500 font-mono tabular-nums">
          {clicks}
        </span>
      )}
    </div>
  )
}
