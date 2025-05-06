import React, { ReactNode, useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '../../lib/stores/authStore'
import { pharmacyService } from '../../lib/api/pharmacyService'
import { notificationsService } from '../../lib/api/notificationsService'
import Image from 'next/image'
import {
  Bell,
  Calendar,
  ChevronDown,
  HelpCircle,
  LogOut,
  Search,
  Settings,
  User,
  CreditCard,
  Menu,
  X,
  Home,
  Package,
  Users,
  ShoppingCart,
  FileText,
  Shield,
  BarChart,
} from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '../ui/dropdown-menu'
import { cn } from '../../lib/utils'

interface MainLayoutConsolidatedProps {
  children: ReactNode
}

export function MainLayoutConsolidated({ children }: MainLayoutConsolidatedProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [pharmacyName, setPharmacyName] = useState<string | null>(null)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserLoaded, setIsUserLoaded] = useState(false)
  const searchRef = useRef(null)

  // Role flags
  const userRole = user?.role?.toUpperCase() || ''
  const isAdmin = userRole === 'ADMIN' || userRole === 'OWNER'
  const isManager = userRole === 'MANAGER'
  const isPharmacist = userRole === 'PHARMACIST'

  // Navigation items
  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, show: true },
    { name: 'Pharmacy', href: '/dashboard/pharmacy', icon: Package, show: isAdmin || isManager || isPharmacist },
    { name: 'Branches', href: '/branches', icon: Package, show: isAdmin || isManager || isPharmacist },
    { name: 'Suppliers', href: '/suppliers', icon: Package, show: isAdmin || isManager || isPharmacist },
    { name: 'Products', href: '/products', icon: Package, show: true },
    { name: 'Inventory', href: '/inventory', icon: Package, show: true },
    { name: 'Sales', href: '/sales', icon: ShoppingCart, show: true },
    { name: 'Patients', href: '/patients', icon: Users, show: isPharmacist || isAdmin || isManager },
    { name: 'Prescriptions', href: '/prescriptions', icon: FileText, show: isPharmacist || isAdmin || isManager },
    { name: 'Insurance', href: '/insurance', icon: Shield, show: isPharmacist || isAdmin || isManager },
    { name: 'Reports', href: '/reports', icon: BarChart, show: isAdmin || isManager },
    { name: 'Users', href: '/users', icon: Users, show: isAdmin },
    { name: 'Subscriptions', href: '/subscriptions', icon: CreditCard, show: isAdmin },
    { name: 'Settings', href: '/settings', icon: Settings, show: isAdmin || isManager },
  ]

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id) return
      try {
        const data = await notificationsService.getUserNotifications(user.id)
        setNotifications(data)
      } catch (error) {
        console.error('Failed to fetch notifications', error)
      }
    }
    fetchNotifications()
    const intervalId = setInterval(fetchNotifications, 60000)
    return () => clearInterval(intervalId)
  }, [user?.id])

  // Fetch pharmacy name
  useEffect(() => {
    if (!user?.pharmacyId) {
      setPharmacyName(null)
      return
    }
    const fetchPharmacyName = async () => {
      try {
        const pharmacy = await pharmacyService.getPharmacyById(user.pharmacyId)
        if (pharmacy?.name) {
          setPharmacyName(pharmacy.name)
        } else {
          const fallbackName = await pharmacyService.getPharmacyNameFallback(user.pharmacyId)
          setPharmacyName(fallbackName || 'Unnamed Pharmacy')
        }
      } catch (error) {
        if (isAdmin) {
          setPharmacyName('No Pharmacy Assigned - Create One')
        } else {
          setPharmacyName('Unknown Pharmacy')
        }
      }
    }
    fetchPharmacyName()
  }, [user?.pharmacyId, isAdmin])

  // Redirect if no pharmacyId and not on setup page
  useEffect(() => {
    const { isLoading } = useAuthStore.getState()
    if (!user?.pharmacyId) {
      if (!isLoading && pathname !== '/setup-pharmacy') {
        router.push('/setup-pharmacy')
      }
      return
    }
  }, [user?.pharmacyId, pathname])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const navigateToProfile = () => {
    router.push('/profile')
  }

  // Get user initials for avatar
  const getInitials = () => {
    if (!user?.name) return 'U'
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className={cn('flex flex-col bg-slate-800 text-white', collapsed ? 'w-16' : 'w-64')}>
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          {!collapsed && <h1 className="text-xl font-bold">ZiindiPro</h1>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-md hover:bg-slate-700"
          >
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navItems.filter(item => item.show).map(item => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 rounded-md transition-colors',
                    pathname === item.href
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  )}
                >
                  <item.icon size={20} className="shrink-0" />
                  {!collapsed && <span className="ml-3">{item.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-slate-300 rounded-md hover:bg-slate-700 hover:text-white transition-colors"
          >
            <LogOut size={20} className="shrink-0" />
            {!collapsed && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 px-4 md:px-6 border-b flex items-center justify-between bg-white shadow-sm sticky top-0 z-50">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden mr-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu size={20} />
              <span className="sr-only">Toggle menu</span>
            </Button>

            {/* Logo - visible on mobile */}
            <Link href="/dashboard" className="md:hidden flex items-center">
              <Image
                src="/images/ziindiSoft.png"
                alt="ZiindiPro Logo"
                width={32}
                height={32}
                className="mr-1"
              />
              <span className="font-bold text-navy text-lg">
                Ziindi<span className="text-purple">Pro</span>
              </span>
            </Link>

            {/* Search bar */}
            <div
              className={`relative ml-4 transition-all duration-300 ${
                isSearchFocused ? 'w-80' : 'w-64'
              }`}
            >
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                size={18}
              />
              <Input
                placeholder="Search products, patients..."
                className="pl-10 pr-4 py-2 w-full border-slate-200 focus:border-purple focus:ring-purple"
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                ref={searchRef}
              />
              {isSearchFocused && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-slate-400">
                  ⌘K
                </div>
              )}
            </div>
          </div>

          <div className="hidden md:block flex-1 text-center">
            <h1 className="text-xl font-semibold text-slate-800">
              ZiindiPro Pharmacy Management
            </h1>
          </div>

          <div className="flex items-center space-x-1 md:space-x-4">
            {/* Date display */}
            <div className="hidden md:flex items-center text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-md">
              <Calendar className="h-4 w-4 mr-2 text-slate-400" />
              {new Date().toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>

            {/* Subscriptions link - only visible to admins */}
            {isAdmin && (
              <Link
                href="/subscriptions"
                className="hidden md:flex items-center text-sm text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md hover:bg-slate-100"
                title="Manage subscription"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                <span className="hidden lg:inline">Upgrade</span>
              </Link>
            )}

            {/* Pharmacy name display */}
            {user?.pharmacyId && pharmacyName && (
              <div className="hidden md:flex items-center text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-md">
                <span className="font-medium mr-2">Pharmacy:</span>
                <span>{pharmacyName}</span>
              </div>
            )}

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  title="Notifications"
                >
                  <Bell size={20} />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center p-0">
                      {notifications.length > 9 ? '9+' : notifications.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <DropdownMenuLabel className="text-base font-medium m-0 p-0">
                    Notifications
                  </DropdownMenuLabel>
                  {notifications.length > 0 && (
                    <Link
                      href="/notifications"
                      className="text-xs text-purple hover:underline"
                    >
                      Mark all as read
                    </Link>
                  )}
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-8 px-4 text-center">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-3">
                        <Bell size={24} className="text-slate-400" />
                      </div>
                      <p className="text-sm text-slate-500">No notifications yet</p>
                      <p className="text-xs text-slate-400 mt-1">
                        We'll notify you when something arrives
                      </p>
                    </div>
                  ) : (
                    notifications.map(notification => (
                      <div
                        key={notification.id}
                        className="py-3 px-4 hover:bg-slate-50 cursor-pointer border-b border-slate-100"
                      >
                        <div className="flex">
                          <div className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 bg-blue-500"></div>
                          <div>
                            <div className="font-medium text-sm">{notification.message}</div>
                            <div className="text-xs text-slate-400 mt-1">
                              {new Date(notification.date).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link
                        href="/notifications"
                        className="justify-center text-purple font-medium py-2"
                      >
                        View all notifications
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Help button */}
            <Button variant="ghost" size="icon" title="Help & Resources">
              <HelpCircle size={20} />
            </Button>

            {/* User profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 ml-1"
                >
                  <div className="h-8 w-8 rounded-full bg-purple/10 flex items-center justify-center text-purple text-sm font-medium">
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
                </div>
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={navigateToProfile}
                    className="cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  {/* Add Subscriptions option to dropdown menu as well */}
                  {isAdmin && (
                    <DropdownMenuItem
                      onClick={() => router.push('/subscriptions')}
                      className="cursor-pointer"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Subscriptions</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-500 hover:text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
