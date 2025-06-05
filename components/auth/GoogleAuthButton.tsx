'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { FcGoogle } from 'react-icons/fc'
import { toast } from 'sonner'

export function GoogleAuthButton() {
  const signInWithGoogle = async () => {
    try {
      const supabase = createClient()
      
      // Get the current URL to construct the redirect URL
      const redirectUrl = `${window.location.origin}/auth/callback`
      
      console.log('Attempting Google sign in with redirect URL:', redirectUrl)
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) {
        console.error('Error signing in with Google:', error)
        toast.error(`Authentication error: ${error.message}`)
      }
    } catch (err) {
      console.error('Unexpected error during Google sign in:', err)
      toast.error('An unexpected error occurred. Please try again.')
    }
  }

  return (
    <Button 
      onClick={signInWithGoogle}
      variant="outline" 
      className="w-full h-12 bg-gray-900/50 border-gray-700/50 text-white hover:bg-gray-800/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10"
    >
      <FcGoogle className="w-5 h-5 mr-3" />
      Continue with Google
    </Button>
  )
} 