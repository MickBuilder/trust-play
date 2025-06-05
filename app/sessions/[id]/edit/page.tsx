import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getSessionById } from '@/lib/actions/sessions'
import { EditSessionForm } from '@/components/sessions/EditSessionForm'
import { Card, CardContent } from '@/components/ui/card'

interface EditSessionPageProps {
  params: {
    id: string
  }
}

// This component will fetch the session data server-side
async function EditSessionContent({ sessionId }: { sessionId: string }) {
  try {
    const session = await getSessionById(sessionId)
    
    if (!session) {
      notFound()
    }
    
    return <EditSessionForm session={session} />
  } catch (error) {
    console.error('Error fetching session:', error)
    return (
      <Card className="glass-card">
        <CardContent className="p-12 text-center">
          <h3 className="text-xl font-semibold text-white mb-2">Error Loading Session</h3>
          <p className="text-gray-400">
            Unable to load session details for editing. Please try again later.
          </p>
        </CardContent>
      </Card>
    )
  }
}

// Loading skeleton component
function EditSessionLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-4">
        <div className="h-8 w-64 bg-gray-700/50 rounded animate-pulse"></div>
        <div className="h-4 w-96 bg-gray-700/30 rounded animate-pulse"></div>
      </div>

      <Card className="glass-card animate-pulse">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="h-6 bg-gray-700/50 rounded"></div>
            <div className="h-10 bg-gray-700/30 rounded"></div>
            <div className="h-6 bg-gray-700/50 rounded"></div>
            <div className="h-20 bg-gray-700/30 rounded"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-gray-700/30 rounded"></div>
              <div className="h-10 bg-gray-700/30 rounded"></div>
            </div>
            <div className="h-10 bg-gray-700/30 rounded"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function EditSessionPage({ params }: EditSessionPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900/10 via-transparent to-transparent"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
      
      {/* Main Content */}
      <main className="relative z-10 min-h-screen p-4 pt-8">
        <div className="max-w-7xl mx-auto">
          <Suspense fallback={<EditSessionLoading />}>
            <EditSessionContent sessionId={params.id} />
          </Suspense>
        </div>
      </main>
    </div>
  )
} 