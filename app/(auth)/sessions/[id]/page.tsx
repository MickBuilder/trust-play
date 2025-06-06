import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getSessionById } from '@/lib/actions/sessions'
import { SessionDetails } from '@/components/sessions/SessionDetails'
import { Card, CardContent } from '@/components/ui/card'

interface SessionPageProps {
  params: Promise<{
    id: string
  }>
}

// This component will fetch the session data server-side
async function SessionContent({ sessionId }: { sessionId: string }) {
  try {
    const session = await getSessionById(sessionId)
    
    if (!session) {
      notFound()
    }
    
    return <SessionDetails session={session} />
  } catch (error) {
    console.error('Error fetching session:', error)
    return (
      <Card className="glass-card">
        <CardContent className="p-12 text-center">
          <h3 className="text-xl font-semibold text-white mb-2">Error Loading Session</h3>
          <p className="text-gray-400">
            Unable to load session details at this time. Please try again later.
          </p>
        </CardContent>
      </Card>
    )
  }
}

// Loading skeleton component - Mobile Optimized
function SessionLoading() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header skeleton - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <div className="h-8 sm:h-9 w-32 sm:w-40 bg-gray-700/50 rounded animate-pulse"></div>
        <div className="flex gap-2">
          <div className="h-8 sm:h-9 w-16 sm:w-20 bg-gray-700/50 rounded animate-pulse"></div>
          <div className="h-8 sm:h-9 w-20 sm:w-24 bg-gray-700/50 rounded animate-pulse"></div>
        </div>
      </div>
      
      {/* Title skeleton */}
      <div className="space-y-3 sm:space-y-4">
        <div className="h-6 sm:h-8 w-64 sm:w-80 bg-gray-700/50 rounded animate-pulse"></div>
        <div className="h-3 sm:h-4 w-48 sm:w-64 bg-gray-700/30 rounded animate-pulse"></div>
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-gray-700/50 rounded animate-pulse"></div>
          <div className="h-6 w-20 bg-gray-700/50 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Content skeleton - Mobile Optimized */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <Card className="glass-card animate-pulse">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="h-5 sm:h-6 bg-gray-700/50 rounded"></div>
                <div className="h-3 sm:h-4 bg-gray-700/30 rounded"></div>
                <div className="h-3 sm:h-4 bg-gray-700/30 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4 sm:space-y-6">
          <Card className="glass-card animate-pulse">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="h-5 sm:h-6 bg-gray-700/50 rounded"></div>
                <div className="h-24 sm:h-32 bg-gray-700/30 rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { id } = await params
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900/10 via-transparent to-transparent"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
      
      {/* Main Content - Mobile Optimized */}
      <main className="relative z-10 min-h-screen p-3 sm:p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Suspense fallback={<SessionLoading />}>
            <SessionContent sessionId={id} />
          </Suspense>
        </div>
      </main>
    </div>
  )
} 