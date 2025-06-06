import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Users, Star, Zap, Calendar, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900/10 via-transparent to-transparent"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
      
      {/* Header - Mobile Optimized */}
      <header className="bg-black/50 backdrop-blur-xl border-b border-gray-800/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 gap-4 sm:gap-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 via-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/25">
                <Trophy className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold gradient-text">TrustPlay Dashboard</h1>
                <p className="text-gray-400 text-sm">Welcome back, {user.user_metadata?.full_name || user.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/sessions">
                <Button variant="outline" size="sm" className="border-gray-700/50 text-gray-300 hover:bg-gray-800/50 text-xs sm:text-sm px-3 py-2">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Sessions
                </Button>
              </Link>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Mobile Optimized */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8 relative z-10">
        {/* Stats Grid - Mobile First */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* User Stats */}
          <Card className="glass-card group hover:shadow-green-500/10 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="text-base sm:text-lg font-semibold text-white">Your Rating</CardTitle>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="text-2xl sm:text-3xl font-bold gradient-text">8.5</div>
              <CardDescription className="text-gray-400 mb-3 text-sm">Current overall rating</CardDescription>
              <div className="flex gap-1 sm:gap-2 flex-wrap">
                <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs px-2 py-1">Technical</Badge>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs px-2 py-1">Fair Play</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Sessions Played */}
          <Card className="glass-card group hover:shadow-blue-500/10 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="text-base sm:text-lg font-semibold text-white">Sessions Played</CardTitle>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="text-2xl sm:text-3xl font-bold text-blue-400">12</div>
              <CardDescription className="text-gray-400 text-sm">Total football sessions</CardDescription>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">3 this month</p>
            </CardContent>
          </Card>

          {/* Ratings Given */}
          <Card className="glass-card group hover:shadow-purple-500/10 transition-all duration-300 sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
              <CardTitle className="text-base sm:text-lg font-semibold text-white">Ratings Given</CardTitle>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="text-2xl sm:text-3xl font-bold text-purple-400">24</div>
              <CardDescription className="text-gray-400 text-sm">Total ratings provided</CardDescription>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">Keep rating others!</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Activity - Mobile Optimized */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="glass-card">
            <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
              <CardTitle className="text-white text-lg sm:text-xl">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-2 sm:space-y-3">
              <Link href="/sessions" className="block">
                <Button className="w-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 hover:from-green-600 hover:via-blue-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-green-500/25 h-12 sm:h-auto text-sm sm:text-base">
                  <Calendar className="w-4 h-4 mr-2" />
                  Browse Sessions
                </Button>
              </Link>
              <Link href="/sessions/create" className="block">
                <Button className="w-full bg-gray-900/50 border-gray-700/50 text-white hover:bg-gray-800/50 backdrop-blur-sm transition-all duration-300 h-12 sm:h-auto text-sm sm:text-base">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Session
                </Button>
              </Link>
              <Link href="/profile" className="block">
                <Button className="w-full bg-gray-900/50 border-gray-700/50 text-white hover:bg-gray-800/50 backdrop-blur-sm transition-all duration-300 h-12 sm:h-auto text-sm sm:text-base">
                  View My Profile
                </Button>
              </Link>
              <Link href="/realtime-demo" className="block">
                <Button className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-600 hover:from-blue-600 hover:via-purple-600 hover:to-pink-700 text-white border-0 shadow-lg shadow-blue-500/25 h-12 sm:h-auto text-sm sm:text-base">
                  View Real-time Demo
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
              <CardTitle className="text-white text-lg sm:text-xl">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-900/30 border border-gray-800/30 rounded-lg">
                  <span className="text-sm text-gray-300">Played at Central Park</span>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-2">2 days ago</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-900/30 border border-gray-800/30 rounded-lg">
                  <span className="text-sm text-gray-300">Rated John D.</span>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-2">1 week ago</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-900/30 border border-gray-800/30 rounded-lg">
                  <span className="text-sm text-gray-300">Created session "Sunday Kickoff"</span>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-2">2 weeks ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

function SignOutButton() {
  const signOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <form action={signOut}>
      <Button 
        variant="outline" 
        type="submit"
        size="sm"
        className="bg-gray-900/50 border-gray-700/50 text-white hover:bg-gray-800/50 backdrop-blur-sm transition-all duration-300 text-xs sm:text-sm px-3 py-2"
      >
        Sign Out
      </Button>
    </form>
  )
} 