'use client'

import { MobileBottomNav } from '@/components/ui/mobile-bottom-nav'
import { MobileAppBar } from '@/components/ui/mobile-app-bar'
import { usePathname } from 'next/navigation'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Pages where we don't want the mobile bottom nav (like login, onboarding, etc.)
  const excludedPages = [
    '/login',
    '/onboarding',
    '/join',
    '/auth'
  ]
  
  // Check if current page should show bottom nav
  const shouldShowBottomNav = !excludedPages.some(page => 
    pathname.startsWith(page)
  )

  return (
    <div className="min-h-screen relative">
      {/* Mobile App Bar - only show on auth pages */}
      {shouldShowBottomNav && <MobileAppBar />}
      
      {/* Main content with mobile bottom nav padding when nav is shown */}
      <div className={shouldShowBottomNav ? 'pb-16 sm:pb-0' : ''}>
        {children}
      </div>
      
      {/* Mobile Bottom Navigation - only show on auth pages */}
      {shouldShowBottomNav && <MobileBottomNav />}
    </div>
  )
} 