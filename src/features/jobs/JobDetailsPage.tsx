import { useParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout'

export default function JobDetailsPage() {
  const { id } = useParams<{ id: string }>()
  return <PageHeader title={`Job ${id}`} description="Детали задачи." />
}
