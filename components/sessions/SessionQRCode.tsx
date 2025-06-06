'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  QrCode, 
  Download, 
  Share2, 
  Copy, 
  ExternalLink,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { generateSessionQR, generateSessionURL } from '@/lib/utils/qr-code'
import { Session } from '@/lib/types/database'
import { toast } from 'sonner'
import Image from 'next/image'

interface SessionQRCodeProps {
  session: Session
  className?: string
}

export function SessionQRCode({ session, className }: SessionQRCodeProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  
  const sessionUrl = generateSessionURL(session.qr_code_data)

  useEffect(() => {
    const generateQR = async () => {
      try {
        setLoading(true)
        setError('')
        const qrUrl = await generateSessionQR(session.id, session.qr_code_data)
        setQrCodeUrl(qrUrl)
      } catch (err) {
        console.error('Failed to generate QR code:', err)
        setError('Failed to generate QR code')
      } finally {
        setLoading(false)
      }
    }

    generateQR()
  }, [session.id, session.qr_code_data])

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(session.qr_code_data)
      toast.success('Session code copied to clipboard!')
    } catch {
      toast.error('Failed to copy session code')
    }
  }

  const handleCopyURL = async () => {
    try {
      await navigator.clipboard.writeText(sessionUrl)
      toast.success('Session URL copied to clipboard!')
    } catch {
      toast.error('Failed to copy session URL')
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${session.title}`,
          text: `Join this football session: ${session.title}`,
          url: sessionUrl,
        })
      } catch {
        // User cancelled sharing or sharing failed
        handleCopyURL()
      }
    } else {
      // Fallback to copying URL
      handleCopyURL()
    }
  }

  const handleDownloadQR = () => {
    if (!qrCodeUrl) return

    const link = document.createElement('a')
    link.download = `session-${session.qr_code_data}-qr.png`
    link.href = qrCodeUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('QR code downloaded!')
  }

  return (
    <Card className={`glass-card ${className}`}>
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-white flex items-center justify-center gap-2">
          <QrCode className="w-5 h-5 text-green-400" />
          Session QR Code
        </CardTitle>
        <p className="text-sm text-gray-400">
          Participants can scan this QR code to join your session
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* QR Code Display */}
        <div className="flex justify-center">
          {loading ? (
            <div className="w-64 h-64 bg-gray-800/50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-400">Generating QR code...</p>
              </div>
            </div>
          ) : error ? (
            <div className="w-64 h-64 bg-gray-800/50 rounded-lg flex items-center justify-center border-2 border-dashed border-red-600/50">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <Image
                  src={qrCodeUrl}
                  alt="Session QR Code"
                  width={256}
                  height={256}
                  className="w-64 h-64"
                />
              </div>
            </div>
          )}
        </div>

        {/* Session Code Display */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-400">Session Code</p>
          <Badge 
            variant="outline" 
            className="text-lg font-mono px-4 py-2 border-green-500/30 text-green-400 bg-green-500/10"
          >
            {session.qr_code_data}
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handleCopyCode}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-800/50"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Code
          </Button>
          
          <Button
            onClick={handleShare}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-800/50"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          
          <Button
            onClick={handleCopyURL}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-800/50"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Copy URL
          </Button>
          
          <Button
            onClick={handleDownloadQR}
            disabled={!qrCodeUrl}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-800/50 disabled:opacity-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-500 text-center space-y-1">
          <p>• Share this QR code with participants</p>
          <p>• They can scan it to join your session instantly</p>
          <p>• Or they can use the session code manually</p>
        </div>
      </CardContent>
    </Card>
  )
} 