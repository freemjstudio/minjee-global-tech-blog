import { Navigate, Routes, Route } from 'react-router-dom'
import { Navbar } from '@/shared/layout/Navbar'
import { HomePage } from '@/features/home/page/HomePage'
import { BlogPage } from '@/features/blog/page/BlogPage'
import { PostPage } from '@/features/blog/page/PostPage'
import { SearchPage } from '@/features/search/page/SearchPage'
import { AboutPage } from '@/features/about/page/AboutPage'
import { ProjectsPage } from '@/features/projects/page/ProjectsPage'
import { JourneyPage } from '@/features/journey/page/JourneyPage'
import { NowPage } from '@/features/now/page/NowPage'
import { ProtectedRoute } from '@/features/auth/ui/ProtectedRoute'

function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FCFCFC] text-gray-900 transition-colors duration-200 dark:bg-gray-950 dark:text-gray-100">
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
        {children}
      </main>
      <footer className="border-t border-gray-200/80 px-5 py-10 text-center text-xs text-gray-500 dark:border-gray-800 dark:text-gray-500">
        © {new Date().getFullYear()} Minjee Woo · Think deeply. Engineer broadly.
      </footer>
    </div>
  )
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200">
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 py-10">{children}</main>
      </div>
    </ProtectedRoute>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
      <Route path="/blog" element={<MainLayout><BlogPage /></MainLayout>} />
      <Route path="/blog/:slug" element={<MainLayout><PostPage /></MainLayout>} />
      <Route path="/projects" element={<MainLayout><ProjectsPage /></MainLayout>} />
      <Route path="/journey" element={<MainLayout><JourneyPage /></MainLayout>} />
      <Route path="/now" element={<MainLayout><NowPage /></MainLayout>} />
      <Route path="/search" element={<MainLayout><SearchPage /></MainLayout>} />
      <Route path="/about" element={<MainLayout><AboutPage /></MainLayout>} />
      <Route path="/resume" element={<Navigate to="/journey" replace />} />
      <Route path="/career" element={<Navigate to="/journey" replace />} />
      <Route
        path="/admin/*"
        element={
          <AdminLayout>
            <div className="text-gray-500 dark:text-gray-400">Admin — coming soon</div>
          </AdminLayout>
        }
      />
    </Routes>
  )
}
