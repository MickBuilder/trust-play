import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserById } from '@/lib/database/users'
import { ProfileView } from '@/components/profile/ProfileView'
import { ProfileEdit } from '@/components/profile/ProfileEdit'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Settings } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

interface ProfilePageProps {
  searchParams: { edit?: string }
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get user profile data
  const userProfile = await getUserById(user.id)
  
  if (!userProfile) {
    // If no profile exists, redirect to onboarding
    redirect('/onboarding')
  }

  const isEditing = searchParams.edit === 'true'

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900/10 via-transparent to-transparent"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
      
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-xl border-b border-gray-800/50 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-700"></div>
              <h1 className="text-2xl font-bold gradient-text">
                {isEditing ? 'Edit Profile' : 'My Profile'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {!isEditing ? (
                <Link href="/profile?edit=true">
                  <Button variant="outline" size="sm" className="bg-gray-900/50 border-gray-700/50 text-white hover:bg-gray-800/50">
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
              ) : (
                <Link href="/profile">
                  <Button variant="outline" size="sm" className="bg-gray-900/50 border-gray-700/50 text-white hover:bg-gray-800/50">
                    Cancel
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <Suspense fallback={<ProfileSkeleton />}>
          {isEditing ? (
            <ProfileEdit user={userProfile} />
          ) : (
            <ProfileView user={userProfile} />
          )}
        </Suspense>
      </main>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gray-700/50 rounded-full animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-6 w-32 bg-gray-700/50 rounded animate-pulse"></div>
              <div className="h-4 w-24 bg-gray-700/50 rounded animate-pulse"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 w-full bg-gray-700/50 rounded animate-pulse"></div>
            <div className="h-4 w-3/4 bg-gray-700/50 rounded animate-pulse"></div>
            <div className="h-4 w-1/2 bg-gray-700/50 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 