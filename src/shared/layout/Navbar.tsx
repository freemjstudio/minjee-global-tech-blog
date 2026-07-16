import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Command, GitFork, Moon, Search, Sun, X } from 'lucide-react'
import { useThemeStore } from '@/shared/store/themeStore'
import { ElenaLogo } from '@/shared/ui/ElenaLogo'

const NAV_LINKS = [
  { to: '/blog', label: 'Blog' },
  { to: '/projects', label: 'Projects' },
  { to: '/journey', label: 'Journey' },
  { to: '/now', label: 'Now' },
  { to: '/about', label: 'About' },
]

const PALETTE_ITEMS = [
  { label: 'Read technical writing', to: '/blog' },
  { label: 'Explore project case studies', to: '/projects' },
  { label: 'View the journey timeline', to: '/journey' },
  { label: 'See what is current', to: '/now' },
  { label: 'About Minjee', to: '/about' },
]

export function Navbar() {
  const { theme, toggle } = useThemeStore()
  const [searchOpen, setSearchOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen((open) => !open)
      }
      if (event.key === 'Escape') setSearchOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const q = new FormData(e.currentTarget).get('q') as string
    if (q.trim()) {
      navigate(`/search?q=${encodeURIComponent(q.trim())}`)
      setSearchOpen(false)
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-[#FCFCFC]/85 backdrop-blur-xl transition-colors duration-200 dark:border-gray-800 dark:bg-gray-950/82">
        <nav className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-5 md:px-8">
          <Link to="/" aria-label="Minjee Woo home" className="shrink-0">
            <ElenaLogo />
          </Link>

          <div className="flex-1" />

          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-accent-600 dark:text-accent-300'
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <a
              href="https://github.com/freemjstudio"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium text-gray-500 transition-colors duration-200 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <GitFork className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">GitHub</span>
            </a>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-500 shadow-[0_1px_8px_rgba(31,41,55,0.04)] transition duration-200 hover:border-gray-300 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:text-white"
              aria-label="Open command palette"
            >
              <Search className="h-4 w-4" />
              <span className="hidden lg:inline">Search</span>
              <kbd className="hidden rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 font-mono text-[11px] text-gray-400 lg:inline dark:border-gray-700 dark:bg-gray-950">
                ⌘K
              </kbd>
            </button>

            <button
              type="button"
              onClick={toggle}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <a
              href="https://github.com/freemjstudio"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900 md:hidden dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="GitHub"
            >
              <GitFork className="h-4 w-4" />
            </a>
          </div>
        </nav>
      </header>

      {searchOpen && (
        <div className="fixed inset-0 z-[70] bg-gray-950/18 px-4 pt-24 backdrop-blur-sm dark:bg-black/50">
          <div className="mx-auto max-w-xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_24px_80px_rgba(31,41,55,0.16)] dark:border-gray-800 dark:bg-gray-950">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 dark:border-gray-800">
              <Command className="h-4 w-4 text-accent-500" />
              <input
                name="q"
                autoFocus
                placeholder="Search posts, systems, architecture..."
                className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label="Close search"
              >
                <X className="h-4 w-4" />
              </button>
            </form>
            <div className="p-2">
              {PALETTE_ITEMS.map((item) => (
                <button
                  key={item.to}
                  type="button"
                  onClick={() => {
                    navigate(item.to)
                    setSearchOpen(false)
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white"
                >
                  <span>{item.label}</span>
                  <span className="font-mono text-xs text-gray-400">↵</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
