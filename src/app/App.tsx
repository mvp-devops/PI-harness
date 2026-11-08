import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout'
import { ToastHost } from '@/components/ui'
import { ThemeProvider } from '@/features/settings/ThemeProvider'
import { useJobEventsSync } from '@/lib/api/useJobEventsSync'
import DashboardPage from '@/features/jobs/DashboardPage'
import JobsPage from '@/features/jobs/JobsPage'
import NewJobPage from '@/features/jobs/NewJobPage'
import JobDetailsPage from '@/features/jobs/JobDetailsPage'
import TasksPage from '@/features/tasks/TasksPage'
import LogsPage from '@/features/logs/LogsPage'
import SettingsPage from '@/features/settings/SettingsPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 3000,
      retry: 1,
    },
  },
})

function EventSync() {
  useJobEventsSync()
  return null
}

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <EventSync />
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/jobs/new" element={<NewJobPage />} />
              <Route path="/jobs/:id" element={<JobDetailsPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/logs" element={<LogsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </AppLayout>
          <ToastHost />
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
