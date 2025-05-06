import React from 'react'
import { Bell } from 'lucide-react'
import Link from 'next/link'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '../ui/tooltip'

interface NotificationsDropdownProps {
  notifications?: any[]
}

export function NotificationsDropdown({ notifications = [] }: NotificationsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
              >
                <Bell size={20} />
                {notifications && notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-purple rounded-full text-xs text-white flex items-center justify-center p-0 border-2 border-white">
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Notifications</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <DropdownMenuLabel className="text-base font-medium m-0 p-0">
            Notifications
          </DropdownMenuLabel>
          {notifications && notifications.length > 0 && (
            <Link
              href="/notifications"
              className="text-xs text-purple hover:underline"
            >
              Mark all as read
            </Link>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {!notifications || notifications.length === 0 ? (
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
                className="py-3 px-4 hover:bg-slate-50 cursor-pointer border-b border-slate-100 transition-colors"
              >
                <div className="flex">
                  <div className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 bg-purple"></div>
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
        {notifications && notifications.length > 0 && (
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
  )
}