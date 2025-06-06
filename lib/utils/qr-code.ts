import QRCode from 'qrcode'

export interface SessionQRData {
  sessionId: string
  sessionCode: string
  timestamp: number
  type: 'session_join'
}

/**
 * Generate QR code data URL for a session
 * @param sessionId - The unique session ID
 * @param sessionCode - The session's QR code data (short code)
 * @returns Promise<string> - Data URL for the QR code image
 */
export async function generateSessionQR(sessionId: string, sessionCode: string): Promise<string> {
  const qrData: SessionQRData = {
    sessionId,
    sessionCode,
    timestamp: Date.now(),
    type: 'session_join'
  }
  
  const dataString = JSON.stringify(qrData)
  
  try {
    const qrCodeDataURL = await QRCode.toDataURL(dataString, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    })
    return qrCodeDataURL
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

/**
 * Parse QR code data to extract session information
 * @param qrData - The raw QR code data string
 * @returns SessionQRData | null - Parsed session data or null if invalid
 */
export function parseSessionQRData(qrData: string): SessionQRData | null {
  try {
    const parsed = JSON.parse(qrData)
    
    // Validate the structure
    if (
      parsed &&
      typeof parsed === 'object' &&
      parsed.type === 'session_join' &&
      typeof parsed.sessionId === 'string' &&
      typeof parsed.sessionCode === 'string' &&
      typeof parsed.timestamp === 'number'
    ) {
      return parsed as SessionQRData
    }
    
    return null
  } catch (error) {
    console.error('Error parsing QR data:', error)
    return null
  }
}

/**
 * Validate if QR code data is still valid (not too old)
 * @param qrData - The parsed QR data
 * @param maxAgeHours - Maximum age in hours (default: 24 hours)
 * @returns boolean - Whether the QR code is still valid
 */
export function isQRDataValid(qrData: SessionQRData, maxAgeHours: number = 24): boolean {
  const now = Date.now()
  const maxAge = maxAgeHours * 60 * 60 * 1000 // Convert hours to milliseconds
  
  return (now - qrData.timestamp) <= maxAge
}

/**
 * Generate a shareable session URL with the session code
 * @param sessionCode - The session's QR code data
 * @returns string - Full URL to join the session
 */
export function generateSessionURL(sessionCode: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${baseUrl}/join/${sessionCode}`
}

/**
 * Create QR code for session URL (alternative to direct session data)
 * @param sessionCode - The session's QR code data
 * @returns Promise<string> - Data URL for the QR code image
 */
export async function generateSessionURLQR(sessionCode: string): Promise<string> {
  const sessionUrl = generateSessionURL(sessionCode)
  
  try {
    const qrCodeDataURL = await QRCode.toDataURL(sessionUrl, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    })
    return qrCodeDataURL
  } catch (error) {
    console.error('Error generating URL QR code:', error)
    throw new Error('Failed to generate URL QR code')
  }
} 