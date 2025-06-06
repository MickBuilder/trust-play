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
      
      {/* Header - Mobile Optimized */}
      <header className="bg-black/50 backdrop-blur-xl border-b border-gray-800/50 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-center items-center py-4 sm:py-6">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500 via-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/25">
                <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold gradient-text">TrustPlay</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Mobile Optimized */}
      <main className="max-w-2xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8 relative z-10">
        <Card className="glass-card">
          <CardHeader className="text-center px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-6">
            <CardTitle className="text-xl sm:text-2xl font-bold text-white">
              Complete Your Profile
            </CardTitle>
            <CardDescription className="text-gray-400 text-sm sm:text-base">
              Help other players get to know you better
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-6 sm:pb-8">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Username and Display Name - Stack on mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-white text-sm font-medium">Username *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="e.g., football_pro123"
                    className="bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-400 h-11 sm:h-10"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-white text-sm font-medium">Display Name *</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    placeholder="e.g., John Smith"
                    className="bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-400 h-11 sm:h-10"
                    required
                  />
                </div>
              </div>

              {/* Bio - Full width */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-white text-sm font-medium">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about your football experience and playing style..."
                  className="bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-400 min-h-[80px] sm:min-h-[100px] resize-none"
                  rows={3}
                />
              </div>

              {/* Location and Date of Birth - Stack on mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-white text-sm font-medium">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., London, UK"
                    className="bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-400 h-11 sm:h-10"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-white text-sm font-medium">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="bg-gray-800/50 border-gray-700/50 text-white h-11 sm:h-10"
                  />
                </div>
              </div>

              {/* Phone Number - Full width */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-white text-sm font-medium">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="Optional - for session organizers to contact you"
                  className="bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-400 h-11 sm:h-10"
                />
                <p className="text-xs text-gray-500">This helps organizers reach you about sessions</p>
              </div>

              {/* Action Buttons - Stack on mobile */}
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  disabled={isPending}
                  className="border-gray-700/50 text-gray-300 hover:bg-gray-800/50 h-11 sm:h-10 text-sm sm:text-base order-2 sm:order-1"
                >
                  Skip for now
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || !formData.username || !formData.displayName}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-medium h-11 sm:h-10 text-sm sm:text-base order-1 sm:order-2"
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