import type { AppNotification } from '@/api/notifications'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getUnreadCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/api/notifications'
import echo from '@/plugins/echo'

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref<AppNotification[]>([])
  const loading = ref(false)
  const loadingMore = ref(false)
  const currentPage = ref(1)
  const lastPage = ref(1)
  const unreadCount = ref(0)

  async function fetchNotifications () {
    loading.value = true
    try {
      const page = await listNotifications(1)
      notifications.value = page.notifications
      currentPage.value = page.currentPage
      lastPage.value = page.lastPage
    } finally {
      loading.value = false
    }
  }

  async function fetchNextPage () {
    if (currentPage.value >= lastPage.value) {
      return
    }
    loadingMore.value = true
    try {
      const page = await listNotifications(currentPage.value + 1)
      notifications.value = [...notifications.value, ...page.notifications]
      currentPage.value = page.currentPage
      lastPage.value = page.lastPage
    } finally {
      loadingMore.value = false
    }
  }

  async function fetchUnreadCount () {
    unreadCount.value = await getUnreadCount()
  }

  async function markRead (notification: AppNotification) {
    if (notification.read_at) {
      return
    }
    await markNotificationRead(notification.id)
    notification.read_at = new Date().toISOString()
    unreadCount.value = Math.max(0, unreadCount.value - 1)
  }

  async function markAllRead () {
    await markAllNotificationsRead()
    const now = new Date().toISOString()
    for (const notification of notifications.value) {
      notification.read_at ??= now
    }
    unreadCount.value = 0
  }

  function subscribeToLiveNotifications (userId: number) {
    echo.private(`App.Models.User.${userId}`)
      .notification((notification: AppNotification) => {
        if (!notifications.value.some(n => n.id === notification.id)) {
          notifications.value = [notification, ...notifications.value]
        }
        unreadCount.value += 1
      })

    return () => echo.leave(`App.Models.User.${userId}`)
  }

  return {
    notifications,
    loading,
    loadingMore,
    currentPage,
    lastPage,
    unreadCount,
    fetchNotifications,
    fetchNextPage,
    fetchUnreadCount,
    markRead,
    markAllRead,
    subscribeToLiveNotifications,
  }
})
