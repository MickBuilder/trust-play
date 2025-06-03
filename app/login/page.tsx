import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FcGoogle } from 'react-icons/fc'
import { Suspense } from 'react'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Welcome to TrustPlay
          </CardTitle>
          <CardDescription className="text-gray-600">
            Join the football community and build your digital reputation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Suspense fallback={<div>Loading...</div>}>
            <GoogleAuthButton />
          </Suspense>
          
          <div className="text-center text-sm text-gray-500">
            <p>
              By signing in, you agree to our{' '}
              <a href="/terms" className="text-blue-600 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function GoogleAuthButton() {
  const signInWithGoogle = async () => {
    const supabase = createClient()
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    })

    if (error) {
      console.error('Error signing in with Google:', error)
    }
  }

  return (
    <Button 
      onClick={signInWithGoogle}
      variant="outline" 
      className="w-full h-12 text-gray-700 border-gray-300 hover:bg-gray-50"
    >
      <FcGoogle className="w-5 h-5 mr-3" />
      Continue with Google
    </Button>
  )
} 