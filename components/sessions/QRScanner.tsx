'use client'

import { useEffect, useRef, useState } from 'react'
import QrScanner from 'qr-scanner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Camera, 
  CameraOff, 
  Loader2,
  AlertCircle,
  CheckCircle,
  RotateCw,
  X
} from 'lucide-react'
import { parseSessionQRData, isQRDataValid } from '@/lib/utils/qr-code'
import { toast } from 'sonner'

interface QRScannerProps {
  onScanSuccess: (sessionId: string, sessionCode: string) => void
  onScanError?: (error: string) => void
  onClose?: () => void
  className?: string
}

export function QRScanner({ onScanSuccess, onScanError, onClose, className }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const qrScannerRef = useRef<QrScanner | null>(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string>('')
  const [hasCamera, setHasCamera] = useState(true)
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt')

  useEffect(() => {
    const initializeScanner = async () => {
      if (!videoRef.current) return

      try {
        // Check if QR scanner is supported
        const hasQrScanner = await QrScanner.hasCamera()
        setHasCamera(hasQrScanner)

        if (!hasQrScanner) {
          setError('No camera available on this device')
          return
        }

        // Create QR scanner instance
        const qrScanner = new QrScanner(
          videoRef.current,
          (result) => handleScanResult(result.data),
          {
            returnDetailedScanResult: true,
            highlightScanRegion: true,
            highlightCodeOutline: true,
            preferredCamera: 'environment', // Use back camera if available
          }
        )

        qrScannerRef.current = qrScanner

        // Start scanning
        await startScanning()
      } catch (err) {
        console.error('Failed to initialize QR scanner:', err)
        setError('Failed to initialize camera')
        setHasCamera(false)
      }
    }

    initializeScanner()

    // Cleanup on unmount
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop()
        qrScannerRef.current.destroy()
      }
    }
  }, [])

  const startScanning = async () => {
    if (!qrScannerRef.current) return

    try {
      setScanning(true)
      setError('')
      await qrScannerRef.current.start()
      setCameraPermission('granted')
    } catch (err) {
      console.error('Failed to start scanning:', err)
      setScanning(false)
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setCameraPermission('denied')
          setError('Camera permission denied. Please allow camera access to scan QR codes.')
        } else if (err.name === 'NotFoundError') {
          setError('No camera found on this device')
          setHasCamera(false)
        } else {
          setError('Failed to start camera')
        }
      } else {
        setError('Failed to start camera')
      }
    }
  }

  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop()
      setScanning(false)
    }
  }
  const lastScannedRef = useRef<string>('')
  const lastScanTimeRef = useRef<number>(0)

   const handleScanResult = (data: string) => {
    // Prevent duplicate scans within 3 seconds
    const now = Date.now()
    if (data === lastScannedRef.current && now - lastScanTimeRef.current < 3000) {
      return
    }
    lastScannedRef.current = data
    lastScanTimeRef.current = now

     try {
       // First try to parse as session QR data
       const sessionData = parseSessionQRData(data)
      
      if (sessionData) {
        // Validate QR code is not too old
        if (!isQRDataValid(sessionData)) {
          const errorMsg = 'QR code is expired. Please ask for a new one.'
          setError(errorMsg)
          onScanError?.(errorMsg)
          return
        }

        toast.success('QR code scanned successfully!')
        onScanSuccess(sessionData.sessionId, sessionData.sessionCode)
        stopScanning()
        return
      }

      // Try to parse as session URL
      const urlMatch = data.match(/\/join\/([a-zA-Z0-9]+)$/)
      if (urlMatch) {
        const sessionCode = urlMatch[1]
        toast.success('Session URL scanned successfully!')
        // For URL scans, we'll use the session code as both ID and code
        onScanSuccess(sessionCode, sessionCode)
        stopScanning()
        return
      }

      // If neither format matches
      const errorMsg = 'Invalid QR code. Please scan a valid session QR code.'
      setError(errorMsg)
      onScanError?.(errorMsg)
    } catch (err) {
      console.error('Error processing QR scan result:', err)
      const errorMsg = 'Failed to process QR code'
      setError(errorMsg)
      onScanError?.(errorMsg)
    }
  }

const requestCameraPermission = async () => {
     try {
       await navigator.mediaDevices.getUserMedia({ video: true })
      setCameraPermission('granted')
       await startScanning()
     } catch (err) {
       setCameraPermission('denied')
       setError('Camera permission is required to scan QR codes')
      if (onScanError) {
        onScanError('Camera permission denied')
      }
     }
   }
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0)

   const switchCamera = async () => {
     if (!qrScannerRef.current) return

     try {
       const cameras = await QrScanner.listCameras(true)
       if (cameras.length > 1) {
        const nextIndex = (currentCameraIndex + 1) % cameras.length
        await qrScannerRef.current.setCamera(cameras[nextIndex].id)
        setCurrentCameraIndex(nextIndex)
       }
     } catch (err) {
       console.error('Failed to switch camera:', err)
       toast.error('Failed to switch camera')
     }
   }

  return (
    <Card className={`glass-card ${className}`}>
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-white flex items-center justify-center gap-2">
          <Camera className="w-5 h-5 text-green-400" />
          Scan QR Code
        </CardTitle>
        <p className="text-sm text-gray-400">
          Point your camera at a session QR code to join
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Camera View */}
        <div className="relative">
          <div className="aspect-square bg-black rounded-lg overflow-hidden relative">
            {hasCamera ? (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                {scanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-green-400 rounded-lg relative">
                      <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-green-400"></div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-green-400"></div>
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-green-400"></div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-green-400"></div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <CameraOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No camera available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert className="border-red-600/50 bg-red-600/10">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-400">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Camera Permission */}
        {cameraPermission === 'denied' && (
          <Alert className="border-yellow-600/50 bg-yellow-600/10">
            <AlertCircle className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-400">
              Camera access is required to scan QR codes. Please enable it in your browser settings.
            </AlertDescription>
          </Alert>
        )}

        {/* Control Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {!scanning && hasCamera && cameraPermission !== 'denied' && (
            <Button
              onClick={startScanning}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Camera className="w-4 h-4 mr-2" />
              Start Scanning
            </Button>
          )}

          {scanning && (
            <Button
              onClick={stopScanning}
              variant="outline"
              className="border-red-600/50 text-red-400 hover:bg-red-600/10"
            >
              <CameraOff className="w-4 h-4 mr-2" />
              Stop Scanning
            </Button>
          )}

          {cameraPermission === 'denied' && (
            <Button
              onClick={requestCameraPermission}
              variant="outline"
              className="border-yellow-600/50 text-yellow-400 hover:bg-yellow-600/10"
            >
              <Camera className="w-4 h-4 mr-2" />
              Enable Camera
            </Button>
          )}

          {scanning && (
            <Button
              onClick={switchCamera}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800/50"
            >
              <RotateCw className="w-4 h-4 mr-2" />
              Switch Camera
            </Button>
          )}

          {onClose && (
            <Button
              onClick={onClose}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800/50 col-span-2"
            >
              <X className="w-4 h-4 mr-2" />
              Close Scanner
            </Button>
          )}
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-500 text-center space-y-1">
          <p>• Hold your device steady</p>
          <p>• Make sure the QR code fits within the scanning area</p>
          <p>• Ensure good lighting for best results</p>
        </div>
      </CardContent>
    </Card>
  )
} 