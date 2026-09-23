import client from './client'

export type NotificationCategory = 'assigned' | 'mention' | 'system'

export interface AppNotification {
  id: string
  category: NotificationCategory
  data: Record<string, string | number>
  read_at: string | null
  created_at: string
}

interface NotificationListResponse {
  data: AppNotification[]
  meta: {
    current_page: number
    last_page: number
  }
}

export interface NotificationPage {
  notifications: AppNotification[]
  currentPage: number
  lastPage: number
}

export async function listNotifications (page = 1): Promise<NotificationPage> {
  const { data } = await client.get<NotificationListResponse>('/api/v1/notifications', { params: { page } })

  return {
    notifications: data.data,
    currentPage: data.meta.current_page,
    lastPage: data.meta.last_page,
  }
}

export async function getUnreadCount (): Promise<number> {
  const { data } = await client.get<{ count: number }>('/api/v1/notifications/unread-count')
  return data.count
}

export async function markNotificationRead (id: string): Promise<void> {
  await client.patch(`/api/v1/notifications/${id}/read`)
}

export async function markAllNotificationsRead (): Promise<void> {
  await client.post('/api/v1/notifications/read-all')
}
