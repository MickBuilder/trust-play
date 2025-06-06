'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, 
  Settings, 
  Plus,
  QrCode,
  Trophy,
  Calendar,
  User,
  Search,
  MoreHorizontal
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface MobileAppBarProps {
  className?: string
}

type ActionItem = {
  icon: React.ComponentType<{ className?: string }>
  label: string
} & (
  | { href: string; action?: never }
  | { action: string; href?: never }
)

export function MobileAppBar({ className }: MobileAppBarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const getPageConfig = (): {
    title: string
    showBack: boolean
    backHref?: string
    actions: ActionItem[]
  } => {
    switch (pathname) {
      case '/dashboard':
        return {
          title: 'TrustPlay',
          showBack: false,
          actions: [
            { icon: QrCode, href: '/scan', label: 'Scan' },
            { icon: Calendar, href: '/sessions', label: 'Sessions' }
          ]
        }
      case '/sessions':
        return {
          title: 'Sessions',
          showBack: true,
          backHref: '/dashboard',
          actions: [
            { icon: Plus, href: '/sessions/create', label: 'Create' },
            { icon: Search, action: 'search', label: 'Search' }
          ]
        }
      case '/scan':
        return {
          title: 'Join Session',
          showBack: true,
          backHref: '/dashboard',
          actions: []
        }
      case '/profile':
        return {
          title: 'Profile',
          showBack: true,
          backHref: '/dashboard',
          actions: [
            { icon: Settings, href: '/profile?edit=true', label: 'Edit' }
          ]
        }
      default:
        if (pathname.startsWith('/sessions/')) {
          return {
            title: 'Session Details',
            showBack: true,
            backHref: '/sessions',
            actions: [
              { icon: MoreHorizontal, action: 'menu', label: 'Menu' }
            ]
          }
        }
        if (pathname.startsWith('/profile') && pathname.includes('edit=true')) {
          return {
            title: 'Edit Profile',
            showBack: true,
            backHref: '/profile',
            actions: []
          }
        }
        return {
          title: 'TrustPlay',
          showBack: true,
          backHref: '/dashboard',
          actions: []
        }
    }
  }

  const config = getPageConfig()

  const handleBack = () => {
    if (config.backHref) {
      router.push(config.backHref)
    } else {
      router.back()
    }
  }

  const handleAction = (action: string) => {
    switch (action) {
      case 'search':
        // Trigger search functionality - you can emit an event or use a global state
        document.dispatchEvent(new CustomEvent('mobile-search-toggle'))
        break
      case 'menu':
        // Trigger menu functionality
        document.dispatchEvent(new CustomEvent('mobile-menu-toggle'))
        break
    }
  }

  return (
    <header className={cn(
      "bg-black/80 backdrop-blur-xl border-b border-gray-800/50 sticky top-0 z-50",
      "sm:hidden", // Only show on mobile
      className
    )}>
      <div className="px-4 h-14 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          {config.showBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-gray-400 hover:text-white p-2 h-8 w-8"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          
          {/* Logo/Icon for dashboard */}
          {!config.showBack && (
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 via-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/25">
              <Trophy className="w-4 h-4 text-white" />
            </div>
          )}
          
          {/* Title */}
          <h1 className="text-lg font-semibold text-white truncate">
            {config.title}
          </h1>
        </div>

        {/* Right Section - Actions */}
        {config.actions.length > 0 && (
          <div className="flex items-center space-x-1">
            {config.actions.map((actionItem, index) => (
              actionItem.href ? (
                <Link key={index} href={actionItem.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white p-2 h-8 w-8"
                  >
                    <actionItem.icon className="w-4 h-4" />
                  </Button>
                </Link>
              ) : actionItem.action ? (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAction(actionItem.action)}
                  className="text-gray-400 hover:text-white p-2 h-8 w-8"
                >
                  <actionItem.icon className="w-4 h-4" />
                </Button>
              ) : null
            ))}
          </div>
        )}
      </div>
    </header>
  )
} 