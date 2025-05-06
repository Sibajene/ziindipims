import React from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../../lib/stores/authStore'
import { 
  User, 
  Settings, 
  LogOut, 
  CreditCard,
  ChevronDown 
} from 'lucide-react'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '../ui/dropdown-menu'

interface UserDropdownProps {
  onLogout: () => void
}

export function UserDropdown({ onLogout }: UserDropdownProps) {
  const router = useRouter()
  const { user } = useAuthStore()
  
  // Role flags
  const userRole = user?.role?.toUpperCase() || ''
  const isAdmin = userRole === 'ADMIN' || userRole === 'OWNER'
  
  // Get user initials for avatar
  const getInitials = () => {
    if (!user?.name) return 'U'
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
  }
  
  const navigateToProfile = () => {
    router.push('/profile')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center space-x-2 ml-1 hover:bg-slate-50 rounded-full pr-2"
        >
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple to-blue-500 flex items-center justify-center text-white text-sm font-medium shadow-sm">
            {getInitials()}
          </div>
          <div className="flex items-center">
            <span className="text-sm font-medium mr-1 hidden md:inline-block max-w-[120px] truncate">
              {user?.name}
            </span>
            <ChevronDown size={16} className="text-slate-400" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-4 py-3 border-b border-slate-100">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-slate-500 mt-0.5 truncate">
            {user?.email}
          </p>
          {user?.role && (
            <p className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded mt-1 inline-block">
              {user.role}
            </p>
          )}
        </div>
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={navigateToProfile}
            className="cursor-pointer hover:bg-slate-50 hover:text-purple focus:bg-slate-50 focus:text-purple"
          >
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="cursor-pointer hover:bg-slate-50 hover:text-purple focus:bg-slate-50 focus:text-purple"
            onClick={() => router.push('/settings')}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          {/* Add Subscriptions option to dropdown menu as well */}
          {isAdmin && (
            <DropdownMenuItem
              onClick={() => router.push('/subscriptions')}
              className="cursor-pointer hover:bg-slate-50 hover:text-purple focus:bg-slate-50 focus:text-purple"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Subscriptions</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onLogout}
          className="cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-50 focus:text-red-600 focus:bg-red-50"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}