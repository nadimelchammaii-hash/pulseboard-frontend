<template>
  <AppShell title="Notifications">
    <div v-if="loading" class="d-flex justify-center py-12">
      <v-progress-circular color="primary" indeterminate />
    </div>

    <template v-else>
      <div class="d-flex align-center justify-space-between mb-6">
        <div>
          <h1 class="notifications__heading mb-1">Notifications</h1>
          <p class="text-body-2 text-on-surface-variant">Mentions, assignments, and workspace updates</p>
        </div>

        <v-btn
          v-if="notificationStore.unreadCount > 0"
          color="on-surface-variant"
          prepend-icon="mdi-check-all"
          variant="text"
          @click="notificationStore.markAllRead()"
        >
          Mark all read
        </v-btn>
      </div>

      <div class="d-flex ga-2 mb-6">
        <v-chip
          v-for="option in filterOptions"
          :key="option.value"
          :color="filter === option.value ? 'primary' : 'surface-container-high'"
          :variant="filter === option.value ? 'flat' : 'tonal'"
          @click="filter = option.value"
        >
          {{ option.label }}
        </v-chip>
      </div>

      <v-card v-if="filteredNotifications.length === 0" class="pa-8 text-center" color="surface-container-low" :elevation="0">
        <v-icon class="mb-3" color="on-surface-variant" size="40">mdi-bell-outline</v-icon>
        <div class="text-body-1 font-weight-medium mb-1">Inbox zero</div>
        <p class="text-body-2 text-on-surface-variant">Nothing here yet.</p>
      </v-card>

      <div v-else class="d-flex flex-column ga-2">
        <v-card
          v-for="notification in filteredNotifications"
          :key="notification.id"
          class="notifications__item pa-3"
          :class="{ 'notifications__item--unread': !notification.read_at }"
          color="surface-container"
          :elevation="0"
          @click="openNotification(notification)"
        >
          <div class="d-flex align-start ga-3">
            <v-avatar color="surface-container-high" size="36">
              <v-icon color="primary" size="18">{{ categoryIcon(notification.category) }}</v-icon>
            </v-avatar>

            <div class="flex-1-1 min-width-0">
              <div class="d-flex align-center justify-space-between ga-2">
                <span class="text-body-2 font-weight-medium">{{ notificationTitle(notification) }}</span>
                <span class="text-caption text-on-surface-variant flex-shrink-0">{{ formatRelativeTime(notification.created_at) }}</span>
              </div>

              <p class="text-body-2 text-on-surface-variant mb-0 mt-1">
                {{ notificationBody(notification) }}
              </p>
            </div>

            <span v-if="!notification.read_at" class="notifications__dot" />
          </div>
        </v-card>
      </div>

      <div v-if="notificationStore.currentPage < notificationStore.lastPage" class="d-flex justify-center mt-4">
        <v-btn
          color="on-surface-variant"
          :loading="notificationStore.loadingMore"
          variant="text"
          @click="notificationStore.fetchNextPage()"
        >
          Load more
        </v-btn>
      </div>
    </template>
  </AppShell>
</template>

<script lang="ts" setup>
  import type { AppNotification, NotificationCategory } from '@/api/notifications'
  import { computed, onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import AppShell from '@/components/app/AppShell.vue'
  import { useNotificationStore } from '@/stores/notifications'

  const router = useRouter()
  const notificationStore = useNotificationStore()

  const loading = ref(true)
  const filter = ref<'all' | NotificationCategory>('all')

  const filterOptions: { value: 'all' | NotificationCategory, label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'mention', label: '@ Mentions' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'system', label: 'System' },
  ]

  const filteredNotifications = computed(() => {
    if (filter.value === 'all') return notificationStore.notifications
    return notificationStore.notifications.filter(n => n.category === filter.value)
  })

  function categoryIcon (category: NotificationCategory) {
    if (category === 'mention') return 'mdi-at'
    if (category === 'assigned') return 'mdi-account-arrow-right-outline'
    return 'mdi-account-multiple-plus-outline'
  }

  function notificationTitle (notification: AppNotification) {
    const d = notification.data

    switch (notification.category) {
      case 'assigned': {
        return `${d.assigner_name} assigned you a task`
      }
      case 'mention': {
        return `${d.mentioner_name} mentioned you`
      }
      case 'system': {
        return `${d.inviter_name} added you to a workspace`
      }
      default: {
        return 'Notification'
      }
    }
  }

  function notificationBody (notification: AppNotification) {
    const d = notification.data

    switch (notification.category) {
      case 'assigned': {
        return `${d.task_title} · ${d.project_name}`
      }
      case 'mention': {
        return `"${d.comment_excerpt}"`
      }
      case 'system': {
        return `You were added to ${d.workspace_name} as ${d.role}`
      }
      default: {
        return ''
      }
    }
  }

  function formatRelativeTime (isoDate: string): string {
    const seconds = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000)

    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days}d ago`
    return new Date(isoDate).toLocaleDateString()
  }

  async function openNotification (notification: AppNotification) {
    await notificationStore.markRead(notification)
    const d = notification.data

    if (notification.category === 'system') {
      await router.push({ name: 'workspace-members', params: { workspaceId: d.workspace_id } })
      return
    }

    await router.push({
      name: 'task-detail',
      params: { workspaceId: d.workspace_id, projectId: d.project_id, taskId: d.task_id },
    })
  }

  onMounted(async () => {
    loading.value = true
    try {
      await notificationStore.fetchNotifications()
      await notificationStore.fetchUnreadCount()
    } finally {
      loading.value = false
    }
  })
</script>

<style scoped>
.notifications__heading {
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 1.5rem;
  letter-spacing: -0.015em;
}

.notifications__item {
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.notifications__item--unread {
  background: rgb(var(--v-theme-surface-container-high));
}

.notifications__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgb(var(--v-theme-secondary));
  flex-shrink: 0;
  margin-top: 4px;
}
</style>
