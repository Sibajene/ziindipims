'use client'

import React from 'react'
import { useAuthStore } from '../../lib/stores/authStore'
import NotificationList from '../../components/notifications/NotificationList'

const NotificationsPage: React.FC = () => {
  const { user } = useAuthStore()

  if (!user) {
    return <p>Please log in to view notifications.</p>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      <NotificationList userId={user.id} />
    </div>
  )
}

export default NotificationsPage
