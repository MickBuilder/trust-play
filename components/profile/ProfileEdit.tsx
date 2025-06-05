'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { User } from '@/lib/types/database'
import { updateUserProfile, uploadProfileImage } from '@/lib/actions/profile'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Camera, Save, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const profileEditSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must not exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  display_name: z.string()
    .min(2, 'Display name must be at least 2 characters')
    .max(100, 'Display name must not exceed 100 characters'),
  bio: z.string()
    .max(500, 'Bio must not exceed 500 characters')
    .optional(),
  location: z.string()
    .max(100, 'Location must not exceed 100 characters')
    .optional(),
  phone_number: z.string()
    .max(20, 'Phone number must not exceed 20 characters')
    .optional(),
  date_of_birth: z.string()
    .optional()
    .refine((val) => {
      if (!val) return true
      const date = new Date(val)
      const now = new Date()
const age =
  (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
return age >= 13 && age <= 100
    }, 'Age must be between 13 and 100 years'),
})

type ProfileEditForm = z.infer<typeof profileEditSchema>

interface ProfileEditProps {
  user: User
}

export function ProfileEdit({ user }: ProfileEditProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)

  const form = useForm<ProfileEditForm>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      username: user.username,
      display_name: user.display_name,
      bio: user.bio || '',
      location: user.location || '',
      phone_number: user.phone_number || '',
      date_of_birth: user.date_of_birth || '',
    }
  })

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2)
  }

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size must be less than 5MB')
        return
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        return
      }

      setProfileImage(file)
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target?.result as string)
      reader.readAsDataURL(file)

      // Upload image immediately
      try {
        const formData = new FormData()
        formData.append('file', file)
        
        const result = await uploadProfileImage(formData)
        if (result.success) {
          setUploadedImageUrl(result.url)
          toast.success('Image uploaded successfully!')
        }
      } catch (error) {
        toast.error('Failed to upload image')
        console.error('Upload error:', error)
      }
    }
  }

  const onSubmit = async (data: ProfileEditForm) => {
    startTransition(async () => {
      try {
        const formData = new FormData()
        
        // Add form fields to FormData
        formData.append('username', data.username)
        formData.append('display_name', data.display_name)
        formData.append('bio', data.bio || '')
        formData.append('location', data.location || '')
        formData.append('phone_number', data.phone_number || '')
        formData.append('date_of_birth', data.date_of_birth || '')
        
        // Add uploaded image URL if available
        if (uploadedImageUrl) {
          formData.append('profile_image_url', uploadedImageUrl)
        }

        const result = await updateUserProfile(formData)
        
        if (result.success) {
          toast.success('Profile updated successfully!')
          router.push('/profile')
        }
      } catch (error) {
        console.error('Error updating profile:', error)
        toast.error('An error occurred while updating your profile')
      }
    })
  }

  const handleCancel = () => {
    router.push('/profile')
  }

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Profile Image */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="w-24 h-24 border-2 border-green-500/20">
                    <AvatarImage 
                      src={imagePreview || uploadedImageUrl || user.profile_image_url} 
                      alt={user.display_name} 
                    />
                    <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white text-lg font-bold">
                      {getInitials(user.display_name)}
                    </AvatarFallback>
                  </Avatar>
                  <Label 
                    htmlFor="profile-image" 
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <Camera className="w-4 h-4 text-white" />
                  </Label>
                  <Input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-gray-400 text-center">
                  Click the camera icon to change your profile picture
                  <br />
                  Maximum file size: 5MB
                </p>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Username</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-gray-800/50 border-gray-700/50 text-white"
                          placeholder="e.g., football_pro123"
                        />
                      </FormControl>
                      <FormDescription className="text-gray-500 text-xs">
                        This is your unique username that others will see
                      </FormDescription>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="display_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Display Name</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-gray-800/50 border-gray-700/50 text-white"
                          placeholder="e.g., John Smith"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Bio</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        className="bg-gray-800/50 border-gray-700/50 text-white min-h-[100px]"
                        placeholder="Tell us about your football experience and playing style..."
                      />
                    </FormControl>
                    <FormDescription className="text-gray-500 text-xs">
                      Share something about yourself and your football journey
                    </FormDescription>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Location</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-gray-800/50 border-gray-700/50 text-white"
                          placeholder="e.g., London, UK"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date_of_birth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Date of Birth</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="date"
                          className="bg-gray-800/50 border-gray-700/50 text-white"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Phone Number</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        className="bg-gray-800/50 border-gray-700/50 text-white"
                        placeholder="Optional - for session organizers to contact you"
                      />
                    </FormControl>
                    <FormDescription className="text-gray-500 text-xs">
                      This is optional and will only be visible to session organizers
                    </FormDescription>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isPending}
                  className="bg-gray-900/50 border-gray-700/50 text-white hover:bg-gray-800/50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
} 