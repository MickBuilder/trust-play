import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">TrustPlay Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.user_metadata?.full_name || user.email}</p>
            </div>
            <div className="flex items-center space-x-4">
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* User Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Your Rating</CardTitle>
              <CardDescription>Current overall rating</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">8.5</div>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary">Technical</Badge>
                <Badge variant="secondary">Fair Play</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Sessions Played */}
          <Card>
            <CardHeader>
              <CardTitle>Sessions Played</CardTitle>
              <CardDescription>Total football sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">12</div>
              <p className="text-sm text-gray-600 mt-2">3 this month</p>
            </CardContent>
          </Card>

          {/* Ratings Given */}
          <Card>
            <CardHeader>
              <CardTitle>Ratings Given</CardTitle>
              <CardDescription>Total ratings provided</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">24</div>
              <p className="text-sm text-gray-600 mt-2">Keep rating others!</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="default">
                Join a Session
              </Button>
              <Button className="w-full" variant="outline">
                Create New Session
              </Button>
              <Button className="w-full" variant="outline">
                View My Profile
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Played at Central Park</span>
                  <span className="text-xs text-gray-500">2 days ago</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Rated John D.</span>
                  <span className="text-xs text-gray-500">1 week ago</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Created session "Sunday Kickoff"</span>
                  <span className="text-xs text-gray-500">2 weeks ago</span>
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
      <Button variant="outline" type="submit">
        Sign Out
      </Button>
    </form>
  )
} 