'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { updateUser, createUser } from '@/lib/database/users'
import { UserUpdate, UserInsert } from '@/lib/types/database'

export async function updateUserProfile(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Extract form data
  const updateData: UserUpdate = {
    username: formData.get('username') as string,
    display_name: formData.get('display_name') as string,
    bio: formData.get('bio') as string || undefined,
    location: formData.get('location') as string || undefined,
    phone_number: formData.get('phone_number') as string || undefined,
    date_of_birth: formData.get('date_of_birth') as string || undefined,
  }

  // Remove undefined values
  Object.keys(updateData).forEach(key => {
    if (updateData[key as keyof UserUpdate] === undefined) {
      delete updateData[key as keyof UserUpdate]
    }
  })

  try {
    const updatedUser = await updateUser(user.id, updateData)
    
    if (!updatedUser) {
      throw new Error('Failed to update user profile')
    }

    revalidatePath('/profile')
    return { success: true, user: updatedUser }
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw new Error('Failed to update profile')
  }
}

export async function uploadProfileImage(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  const file = formData.get('file') as File
  
  if (!file) {
    throw new Error('No file provided')
  }

  // Validate file
  if (file.size > 5 * 1024 * 1024) { // 5MB limit
    throw new Error('File size must be less than 5MB')
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('File must be a JPEG, PNG, or WebP image')
  }

  try {
const fileExt = file.name.includes('.') ? file.name.split('.').pop() : 'png'
const fileName = `${user.id}/profile.${fileExt}`
    
    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(fileName, file, {
        upsert: true
      })

    if (uploadError) {
      throw uploadError
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl(fileName)

    // Update user profile with new image URL
    const updatedUser = await updateUser(user.id, {
      profile_image_url: publicUrl
    })

    if (!updatedUser) {
      throw new Error('Failed to update user profile with image')
    }

    revalidatePath('/profile')
    return { success: true, imageUrl: publicUrl }
  } catch (error) {
    console.error('Error uploading profile image:', error)
    throw new Error('Failed to upload image')
  }
}

export async function createUserProfile(userData: UserInsert) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  try {
    const newUser = await createUser(userData)
    
    if (!newUser) {
      throw new Error('Failed to create user profile')
    }

    revalidatePath('/dashboard')
    return { success: true, user: newUser }
  } catch (error) {
    console.error('Error creating user profile:', error)
    throw new Error('Failed to create profile')
  }
} 