import { useAuthStore } from '../../lib/stores/authStore'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
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
  X
} from 'lucide-react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuGroup
} from '../ui/dropdown-menu'
import Link from 'next/link'
import { notificationsService } from '../../lib/api/notificationsService'
import { pharmacyService } from '../../lib/api/pharmacyService'
import Image from 'next/image'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '../ui/tooltip'
import { Sidebar } from './sidebar'

export function Header() {
  const { user, logout, isLoading, refreshTokenFunc } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const [notifications, setNotifications] = useState([])
  const [pharmacyName, setPharmacyName] = useState<string | null>(null)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserLoaded, setIsUserLoaded] = useState(false)
  const searchRef = useRef(null)
  const sidebarRef = useRef(null)

  const { token, validateTokenOnInit } = useAuthStore();

  // Check token validity on component mount, only after hydration
  const isHydrated = useAuthStore(state => state.isHydrated);

  useEffect(() => {
    if (!isHydrated) return;

    // If we're on the login page, don't validate token
    if (pathname === '/login' || pathname === '/register') {
      return;
    }
    
    // Delay redirect if user is loading or user object is null
    if (isLoading || !user) {
      return;
    }

    // Check if token exists but is invalid
    if (!token) {
      logout();
      router.push('/login');
      return;
    }

    const isValid = validateTokenOnInit();
    if (!isValid) {
      logout();
      router.push('/login');
    }
  }, [pathname, validateTokenOnInit, logout, router, isHydrated, token, isLoading, user]);

  // Ensure logout and redirect on token refresh failure
  useEffect(() => {
    const handleRefreshFailure = async () => {
      const success = await refreshTokenFunc();
      if (!success) {
        logout();
        router.push('/login');
      }
    };

    return () => {};
  }, [refreshTokenFunc, logout, router]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id || !token) return
      try {
        const data = await notificationsService.getUserNotifications(user.id)
        setNotifications(data)
      } catch (error) {
        console.error('Failed to fetch notifications', error)
      }
    }
    
    // Only fetch notifications if we have a valid user
    if (user?.id && token) {
      fetchNotifications();
      
      // Set up interval to fetch notifications every minute
      const intervalId = setInterval(fetchNotifications, 60000);
      setIsUserLoaded(true);
      return () => clearInterval(intervalId);
    }
  }, [user?.id, token]);

  useEffect(() => {
    if (!user?.pharmacyId) return;
  
    const fetchPharmacyName = async () => {
      try {
        // First, try the direct method
        const pharmacy = await pharmacyService.getPharmacyById(user.pharmacyId);
  
        if (pharmacy && pharmacy.name) {
          setPharmacyName(pharmacy.name);
        } else {
          // If we got a response but no name, try the fallback
          try {
            const fallbackName = await pharmacyService.getPharmacyNameFallback(user.pharmacyId);
            if (fallbackName) {
              setPharmacyName(fallbackName);
            } else {
              setPharmacyName('Unnamed Pharmacy');
            }
          } catch (fallbackError) {
            setPharmacyName('Unnamed Pharmacy');
          }
        }
      } catch (error) {
        // For OWNER/ADMIN users, provide a more helpful message only if 404 error
        if (error.response && error.response.status === 404) {
          if (user.role?.toUpperCase() === 'OWNER' || user.role?.toUpperCase() === 'ADMIN') {
            setPharmacyName('No Pharmacy Assigned - Create One');
          } else {
            setPharmacyName('Unknown Pharmacy');
          }
        } else {
          // For other errors or no error response, show generic message
          setPharmacyName('Unnamed Pharmacy');
        }
      }
    };
  
    fetchPharmacyName();
  }, [user?.pharmacyId]);
  
  useEffect(() => {
    // Skip this check on login and register pages
    if (pathname === '/login' || pathname === '/register') {
      return;
    }
    
    if (!user?.pharmacyId) {
      // Allow ADMIN users to bypass pharmacyId check
      if (user?.role?.toUpperCase() === 'ADMIN') {
        return;
      }
      if (!isLoading && pathname !== '/register') {
        router.push('/register');
      }
    }
  }, [user?.pharmacyId, user?.role, pathname, router, isLoading]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu when window is resized to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobileMenuOpen]);
  
  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const navigateToProfile = () => {
    router.push('/profile')
  }
  
  // Check if user is admin
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'OWNER'

  // Get user initials for avatar
  const getInitials = () => {
    if (!user?.name) return 'U'
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
  }

  // Get current date in nice format
  const formattedDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })
  
  // Don't render header on login or register pages
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }
  
  return (
    <TooltipProvider>
      <header className="h-16 px-4 md:px-6 border-b flex items-center justify-between bg-white shadow-sm sticky top-0 z-50">
        <div className="flex items-center">
          {/* Mobile menu button - Toggle sidebar instead of showing duplicate menu */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden mr-2 transition-transform duration-200 hover:bg-slate-100"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? 
              <X size={20} className="text-slate-600" /> : 
              <Menu size={20} className="text-slate-600" />
            }
          </Button>
          
          {/* Logo - visible on mobile */}
          <Link href="/dashboard" className="md:hidden flex items-center group">
            <div className="relative overflow-hidden rounded-lg mr-1">
              <Image 
                src="/images/ziindiSoft.png" 
                alt="ZiindiPro Logo" 
                width={32} 
                height={32} 
                className="transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-purple/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <span className="font-bold text-navy text-lg">Ziindi<span className="text-purple">Pro</span></span>
          </Link>
          
          {/* Search bar with improved UX */}
          <div className={`relative ml-4 transition-all duration-300 ${isSearchFocused ? 'w-80' : 'w-64'}`}>
            <Search 
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${isSearchFocused ? 'text-purple' : 'text-slate-400'}`} 
              size={18} 
            />
            <Input 
              placeholder="Search products, patients..." 
              className="pl-10 pr-12 py-2 w-full border-slate-200 focus:border-purple focus:ring-purple transition-all duration-200"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              ref={searchRef}
            />
            <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 transition-opacity duration-200 ${isSearchFocused ? 'opacity-100' : 'opacity-0'}`}>
              ⌘K
            </div>
          </div>
        </div>

        <div className="hidden md:block flex-1 text-center">
          <h1 className="text-xl font-semibold text-slate-800">
            {pharmacyName || 'ZiindiPro Pharmacy Management'}
          </h1>
        </div>
        
        <div className="flex items-center space-x-1 md:space-x-4">
          {/* Date display with improved styling */}
          <div className="hidden md:flex items-center text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100">
            <Calendar className="h-4 w-4 mr-2 text-slate-400" />
            {formattedDate}
          </div>
          
          {/* Subscriptions link - only visible to admins */}
          {isAdmin && (
            <Link 
            href="/subscriptions" 
            className="hidden md:flex items-center text-sm text-slate-600 hover:text-purple px-3 py-2 rounded-md hover:bg-slate-50 transition-colors duration-200 border border-transparent hover:border-slate-100"
            title="Manage subscription"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            <span className="hidden lg:inline">Upgrade</span>
          </Link>
        )}
        
        {/* Notifications with improved dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative hover:bg-slate-50 transition-colors duration-200"
              title="Notifications"
            >
              <Bell size={20} className="text-slate-600" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center p-0 animate-pulse">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden rounded-lg border border-slate-200 shadow-lg">
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
              <DropdownMenuLabel className="text-base font-medium m-0 p-0 text-slate-800">
                Notifications
              </DropdownMenuLabel>
              {notifications.length > 0 && (
                <Link
                  href="/notifications"
                  className="text-xs text-purple hover:text-purple-600 hover:underline transition-colors"
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
                    className="py-3 px-4 hover:bg-slate-50 cursor-pointer border-b border-slate-100 transition-colors duration-200"
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

        {/* Help button with tooltip */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover:bg-slate-50 transition-colors duration-200"
            >
              <HelpCircle size={20} className="text-slate-600" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Help & Resources</p>
          </TooltipContent>
        </Tooltip>

        {/* User profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center space-x-2 ml-1 hover:bg-slate-50 transition-colors duration-200"
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
          <DropdownMenuContent align="end" className="w-56 p-0 overflow-hidden rounded-lg border border-slate-200 shadow-lg">
            <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <p className="text-sm font-medium text-slate-800">{user?.name}</p>
              <p className="text-xs text-slate-500 mt-0.5 truncate">
                {user?.email}
              </p>
            </div>
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={navigateToProfile}
                className="cursor-pointer hover:bg-slate-50 transition-colors duration-200"
              >
                <User className="h-4 w-4 mr-2 text-slate-500" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link 
                  href="/settings" 
                  className="cursor-pointer hover:bg-slate-50 transition-colors duration-200"
                >
                  <Settings className="h-4 w-4 mr-2 text-slate-500" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
    
    {/* Mobile sidebar */}
    {isMobileMenuOpen && (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div 
          ref={sidebarRef}
          className="fixed inset-y-0 left-0 w-64 bg-slate-800 shadow-xl transform transition-transform duration-300 ease-in-out"
          onClick={(e) => e.stopPropagation()}
        >
          <Sidebar />
        </div>
      </div>
    )}
  </TooltipProvider>
)
}