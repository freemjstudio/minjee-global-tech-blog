import { useState, type ReactNode } from 'react'

interface CodeBlockProps {
  children: ReactNode
  className?: string
}

export function CodeBlock({ children, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const language = className
    ?.split(' ')
    .find((name) => name.startsWith('language-'))
    ?.replace('language-', '') ?? ''

  const handleCopy = async () => {
    const text = typeof children === 'string' ? children : ''
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group relative my-8 overflow-hidden rounded-xl border border-gray-800 bg-[#111827] shadow-[0_18px_60px_rgba(17,24,39,0.16)]">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-2">
        <span className="font-mono text-xs text-accent-300">{language}</span>
        <button
          onClick={handleCopy}
          className="text-xs text-gray-400 opacity-0 transition-colors hover:text-white group-hover:opacity-100"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto bg-[#111827] p-5 text-sm leading-relaxed text-gray-100">
        <code className={className}>{children}</code>
      </pre>
    </div>
  )
}
