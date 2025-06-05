import { Suspense } from 'react'
import { getActiveSessions } from '@/lib/actions/sessions'
import { SessionsList } from '@/components/sessions/SessionsList'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trophy, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

// This component will fetch the sessions server-side
async function SessionsContent() {
  try {
    const sessions = await getActiveSessions()
    return <SessionsList sessions={sessions} />
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return (
      <Card className="glass-card">
        <CardContent className="p-12 text-center">
          <h3 className="text-xl font-semibold text-white mb-2">Error Loading Sessions</h3>
          <p className="text-gray-400">
            Unable to load sessions at this time. Please try again later.
          </p>
        </CardContent>
      </Card>
    )
  }
}

// Loading skeleton component
function SessionsLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="h-8 w-64 bg-gray-700/50 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-80 bg-gray-700/30 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-32 bg-gray-700/50 rounded animate-pulse"></div>
      </div>

      {/* Filters skeleton */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="h-10 bg-gray-700/50 rounded animate-pulse flex-1"></div>
        <div className="h-10 bg-gray-700/50 rounded animate-pulse w-32"></div>
        <div className="h-10 bg-gray-700/50 rounded animate-pulse w-32"></div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="glass-card animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="h-6 bg-gray-700/50 rounded"></div>
                <div className="h-4 bg-gray-700/30 rounded"></div>
                <div className="h-4 bg-gray-700/30 rounded w-3/4"></div>
                <div className="h-4 bg-gray-700/30 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function SessionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900/10 via-transparent to-transparent"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
      
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-xl border-b border-gray-800/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-700"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 via-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/25">
                  <Trophy className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">Sessions</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="relative z-10 min-h-screen p-4 pt-8">
        <div className="max-w-7xl mx-auto">
          <Suspense fallback={<SessionsLoading />}>
            <SessionsContent />
          </Suspense>
        </div>
      </main>
    </div>
  )
} 