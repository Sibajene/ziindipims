'use client'

import React, { useEffect, useState } from 'react'
import { notificationsService } from '../../lib/api/notificationsService'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

const NotificationList: React.FC<{ userId: string }> = ({ userId }) => {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await notificationsService.getUserNotifications(userId)
        setNotifications(data)
      } catch (err) {
        setError('Failed to load notifications')
      } finally {
        setLoading(false)
      }
    }
    fetchNotifications()
  }, [userId])

  if (loading) return <p>Loading notifications...</p>
  if (error) return <p className="text-red-600">{error}</p>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <p>No notifications available.</p>
        ) : (
          <ul>
            {notifications.map((notification) => (
              <li key={notification.id} className={notification.read ? 'text-gray-500' : 'font-bold'}>
                {notification.message} - {new Date(notification.date).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export default NotificationList
