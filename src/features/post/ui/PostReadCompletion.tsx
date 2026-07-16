import { useState, useEffect } from 'react'
import { EmojiPopper } from '@/shared/ui/EmojiPopper'

const REACTIONS = [
  { emoji: '👏', label: 'Clap' },
  { emoji: '🎉', label: 'Celebrate' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '💜', label: 'Love' },
  { emoji: '⭐', label: 'Star' },
]

export function PostReadCompletion() {
  const [toastVisible, setToastVisible] = useState(false)

  // 마운트 직후 토스트 등장
  useEffect(() => {
    const t = setTimeout(() => setToastVisible(true), 300)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      {/* 완독 토스트 */}
      {toastVisible && (
        <div
          className="fixed bottom-8 right-6 z-50 animate-[toastIn_0.4s_ease-out]"
          role="status"
        >
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 shadow-lg shadow-gray-200/50 dark:shadow-black/30 text-sm">
            <span>🎉</span>
            <span className="text-gray-700 dark:text-gray-300 font-medium">Finished reading!</span>
            <button
              onClick={() => setToastVisible(false)}
              className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 인라인 완독 섹션 */}
      <div className="mt-16 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-8 text-center space-y-5">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            End of post
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            You made it through!
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs mx-auto">
            Tap a reaction — click multiple times to celebrate harder 🎊
          </p>
        </div>

        <div className="flex items-end justify-center gap-6 pt-2">
          {REACTIONS.map(({ emoji, label }) => (
            <EmojiPopper key={emoji} emoji={emoji} label={label} />
          ))}
        </div>
      </div>
    </>
  )
}
