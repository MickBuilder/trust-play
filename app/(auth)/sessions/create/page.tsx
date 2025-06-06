import { Suspense } from 'react'
import { CreateSessionForm } from '@/components/sessions/CreateSessionForm'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trophy, ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'

export default function CreateSessionPage() {
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
              <Link href="/sessions">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sessions
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-700"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 via-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/25">
                  <Plus className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">Create Session</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <Suspense fallback={
            <Card className="glass-card w-full max-w-2xl mx-auto">
              <CardContent className="p-8">
                <div className="space-y-4">
                  <div className="h-8 bg-gray-700/50 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-700/30 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-700/30 rounded animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          }>
            <CreateSessionForm />
          </Suspense>
        </div>
      </main>
    </div>
  )
} 