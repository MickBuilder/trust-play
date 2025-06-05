import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Suspense } from 'react'
import { Trophy } from 'lucide-react'
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900/20 via-transparent to-transparent"></div>
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
      
      <Card className="w-full max-w-md glass-card relative z-10">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 via-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/25">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">TrustPlay</span>
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-gray-400">
            Join the football community and build your digital reputation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Suspense fallback={
            <div className="w-full h-12 bg-gray-800/50 border border-gray-700/50 rounded-lg animate-pulse"></div>
          }>
            <GoogleAuthButton />
          </Suspense>
          
          <div className="text-center text-sm text-gray-500">
            <p>
              By signing in, you agree to our{' '}
              <a href="/terms" className="text-green-400 hover:text-green-300 hover:underline transition-colors">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-green-400 hover:text-green-300 hover:underline transition-colors">
                Privacy Policy
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 