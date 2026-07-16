import { BrowserRouter } from 'react-router-dom'
import { QueryProvider } from './app/providers/QueryProvider'
import { ThemeProvider } from './app/providers/ThemeProvider'
import { AppRoutes } from './app/routes'
import { KonamiEasterEgg } from './shared/ui/KonamiEasterEgg'

function App() {
  return (
    <QueryProvider>
      <BrowserRouter>
        <ThemeProvider>
          <AppRoutes />
          <KonamiEasterEgg />
        </ThemeProvider>
      </BrowserRouter>
    </QueryProvider>
  )
}

export default App
