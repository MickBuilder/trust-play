'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QRScanner } from '@/components/sessions/QRScanner'
import { 
  QrCode, 
  Keyboard,
  ArrowLeft,
  Search
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function ScanPage() {
  const router = useRouter()
  const [manualCode, setManualCode] = useState('')
  const [isJoining, setIsJoining] = useState(false)

  const handleScanSuccess = (sessionId: string, sessionCode: string) => {
    // Navigate to join page with the scanned code
    router.push(`/join/${sessionCode}`)
  }

  const handleScanError = (error: string) => {
    console.error('QR scan error:', error)
    // Error is already handled by the QRScanner component
  }

  const handleManualJoin = async () => {
    if (!manualCode.trim()) {
      toast.error('Please enter a session code')
      return
    }

    const code = manualCode.trim().toUpperCase()
    setIsJoining(true)
    
    try {
      // Navigate to join page with manual code
      router.push(`/join/${code}`)
    } catch (error) {
      console.error('Error with manual code:', error)
      toast.error('Failed to process session code')
    } finally {
      setIsJoining(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleManualJoin()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900/10 via-transparent to-transparent"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
          {/* Header - Mobile Optimized */}
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white p-2 sm:px-4 sm:py-2"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          </div>

          {/* Title Section - Mobile Optimized */}
          <div className="text-center space-y-2 px-2 sm:px-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Join Session</h1>
            <p className="text-gray-400 text-sm sm:text-base">Scan a QR code or enter a session code manually</p>
          </div>

          {/* Tabs for QR Scan vs Manual Entry - Mobile Optimized */}
          <Tabs defaultValue="scan" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 h-12 sm:h-10">
              <TabsTrigger 
                value="scan" 
                className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-green-600/20 data-[state=active]:text-green-400 text-xs sm:text-sm py-2"
              >
                <QrCode className="w-4 h-4" />
                <span className="hidden sm:inline">Scan QR Code</span>
                <span className="sm:hidden">Scan</span>
              </TabsTrigger>
              <TabsTrigger 
                value="manual"
                className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400 text-xs sm:text-sm py-2"
              >
                <Keyboard className="w-4 h-4" />
                <span className="hidden sm:inline">Enter Code</span>
                <span className="sm:hidden">Code</span>
              </TabsTrigger>
            </TabsList>

            {/* QR Scanner Tab - Mobile Optimized */}
            <TabsContent value="scan" className="mt-4 sm:mt-6">
              <div className="px-2 sm:px-0">
                <QRScanner
                  onScanSuccess={handleScanSuccess}
                  onScanError={handleScanError}
                  className="w-full"
                />
              </div>
            </TabsContent>

            {/* Manual Code Entry Tab - Mobile Optimized */}
            <TabsContent value="manual" className="mt-4 sm:mt-6">
              <Card className="glass-card mx-2 sm:mx-0">
                <CardHeader className="text-center pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
                  <CardTitle className="text-white flex items-center justify-center gap-2 text-lg sm:text-xl">
                    <Keyboard className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                    Enter Session Code
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-gray-400">
                    Enter the session code provided by the organizer
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-6">
                  {/* Code Input - Mobile Optimized */}
                  <div className="space-y-2">
                    <Label htmlFor="session-code" className="text-white text-sm font-medium">
                      Session Code
                    </Label>
                    <div className="relative">
                      <Input
                        id="session-code"
                        type="text"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="e.g. ABC123"
                        className="text-center text-base sm:text-lg font-mono tracking-widest uppercase bg-gray-800/50 border-gray-600 text-white placeholder-gray-500 focus:border-green-500 h-12 sm:h-11"
                        maxLength={10}
                      />
                    </div>
                  </div>

                  {/* Join Button - Mobile Optimized */}
                  <Button 
                    onClick={handleManualJoin}
                    disabled={!manualCode.trim() || isJoining}
                    className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 disabled:opacity-50 h-12 sm:h-10 text-sm sm:text-base"
                  >
                    {isJoining ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Joining...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Find Session
                      </>
                    )}
                  </Button>

                  {/* Instructions - Mobile Optimized */}
                  <div className="text-xs text-gray-500 text-center space-y-1 px-2 sm:px-0">
                    <p>• Session codes are usually 6-8 characters</p>
                    <p>• Codes are not case-sensitive</p>
                    <p>• Ask the organizer if you don't have the code</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Additional Options - Mobile Optimized */}
          <div className="text-center space-y-4 px-2 sm:px-0">
            <div className="text-sm text-gray-500">
              Don't have a session to join?
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="outline" className="border-gray-600 text-gray-300 h-11 sm:h-10 text-sm sm:text-base">
                <Link href="/sessions">Browse Active Sessions</Link>
              </Button>
              <Button asChild variant="outline" className="border-gray-600 text-gray-300 h-11 sm:h-10 text-sm sm:text-base">
                <Link href="/sessions/create">Create New Session</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 