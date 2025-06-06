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
        <CardContent className="p-8 sm:p-12 text-center">
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">Error Loading Sessions</h3>
          <p className="text-gray-400 text-sm sm:text-base">
            Unable to load sessions at this time. Please try again later.
          </p>
        </CardContent>
      </Card>
    )
  }
}

// Loading skeleton component - Mobile Optimized
function SessionsLoading() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="h-6 sm:h-8 w-48 sm:w-64 bg-gray-700/50 rounded animate-pulse mb-2"></div>
          <div className="h-3 sm:h-4 w-64 sm:w-80 bg-gray-700/30 rounded animate-pulse"></div>
        </div>
        <div className="h-9 sm:h-10 w-28 sm:w-32 bg-gray-700/50 rounded animate-pulse"></div>
      </div>

      {/* Filters skeleton */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="h-9 sm:h-10 bg-gray-700/50 rounded animate-pulse flex-1"></div>
        <div className="h-9 sm:h-10 bg-gray-700/50 rounded animate-pulse w-28 sm:w-32"></div>
        <div className="h-9 sm:h-10 bg-gray-700/50 rounded animate-pulse w-28 sm:w-32"></div>
      </div>

      {/* Grid skeleton - Mobile Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="glass-card animate-pulse">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="h-5 sm:h-6 bg-gray-700/50 rounded"></div>
                <div className="h-3 sm:h-4 bg-gray-700/30 rounded"></div>
                <div className="h-3 sm:h-4 bg-gray-700/30 rounded w-3/4"></div>
                <div className="h-3 sm:h-4 bg-gray-700/30 rounded w-1/2"></div>
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
      
      {/* Header - Mobile Optimized */}
      <header className="bg-black/50 backdrop-blur-xl border-b border-gray-800/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between py-3 sm:py-4 gap-3">
            <div className="flex items-center space-x-2 min-w-0">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2 h-8 sm:h-9">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline text-xs sm:text-sm">Back</span>
                </Button>
              </Link>
              <div className="h-4 w-px bg-gray-700 hidden sm:block"></div>
              <div className="flex items-center space-x-2 min-w-0">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500 via-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/25 flex-shrink-0">
                  <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <span className="text-base sm:text-lg lg:text-xl font-bold gradient-text truncate">Sessions</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content - Mobile Optimized */}
      <main className="relative z-10 min-h-screen p-3 sm:p-4 pt-4 sm:pt-8">
        <div className="max-w-7xl mx-auto">
          <Suspense fallback={<SessionsLoading />}>
            <SessionsContent />
          </Suspense>
        </div>
      </main>
    </div>
  )
} 