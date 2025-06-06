'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Home, 
  Calendar, 
  QrCode, 
  User, 
  Search,
  Trophy
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    shortName: 'Home'
  },
  {
    name: 'Sessions',
    href: '/sessions',
    icon: Calendar,
    shortName: 'Sessions'
  },
  {
    name: 'Scan QR',
    href: '/scan',
    icon: QrCode,
    shortName: 'Scan'
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: User,
    shortName: 'Profile'
  }
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-t border-gray-800/50 sm:hidden">
      <div className="grid grid-cols-4 h-16">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href === '/sessions' && pathname.startsWith('/sessions'))
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 text-xs transition-colors duration-200",
                isActive 
                  ? "text-green-400" 
                  : "text-gray-500 hover:text-gray-300"
              )}
            >
              <item.icon 
                className={cn(
                  "h-5 w-5 transition-all duration-200",
                  isActive && "scale-110"
                )}
              />
              <span className={cn(
                "font-medium transition-all duration-200",
                isActive && "text-green-400"
              )}>
                {item.shortName}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-green-400 rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
      
      {/* Safe area padding for phones with home indicators */}
      <div className="h-safe-area-inset-bottom bg-black/95" />
    </div>
  )
} 