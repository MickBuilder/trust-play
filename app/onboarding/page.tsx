'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createUserProfile } from '@/lib/actions/profile'
import { UserInsert } from '@/lib/types/database'
import { toast } from 'sonner'
import { Trophy } from 'lucide-react'

export default function OnboardingPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    bio: '',
    location: '',
    dateOfBirth: '',
    phoneNumber: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    startTransition(async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          throw new Error('No authenticated user found')
        }

        // Create user profile data
        const userData: UserInsert = {
          email: user.email!,
          username: formData.username,
          display_name: formData.displayName,
          bio: formData.bio || undefined,
          location: formData.location || undefined,
          date_of_birth: formData.dateOfBirth || undefined,
          phone_number: formData.phoneNumber || undefined,
          profile_image_url: user.user_metadata?.avatar_url || undefined
        }

        const result = await createUserProfile(userData)
        
        if (result.success) {
          toast.success('Profile created successfully!')
          router.push('/dashboard')
        } else {
          throw new Error('Failed to create user profile')
        }
      } catch (error) {
        console.error('Error during onboarding:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to complete onboarding. Please try again.')
      }
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900/20 via-transparent to-transparent"></div>
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
      
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-xl border-b border-gray-800/50 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 via-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/25">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">TrustPlay</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <Card className="glass-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">
              Complete Your Profile
            </CardTitle>
            <CardDescription className="text-gray-400">
              Help other players get to know you better
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-white">Username *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="e.g., football_pro123"
                    className="bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-400"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-white">Display Name *</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    placeholder="e.g., John Smith"
                    className="bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-white">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about your football experience and playing style..."
                  className="bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-400"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-white">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., London, UK"
                    className="bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-400"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-white">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="bg-gray-800/50 border-gray-700/50 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-white">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="Optional - for session organizers to contact you"
                  className="bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-400"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  disabled={isPending}
                  className="border-gray-700/50 text-gray-300 hover:bg-gray-800/50"
                >
                  Skip for now
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || !formData.username || !formData.displayName}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-medium"
                >
                  {isPending ? 'Creating Profile...' : 'Complete Setup'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
} 