import type { Activity } from '@/api/activities'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { listActivities } from '@/api/activities'
import echo from '@/plugins/echo'

export const useActivityStore = defineStore('activities', () => {
  const activities = ref<Activity[]>([])
  const loading = ref(false)
  const loadingMore = ref(false)
  const currentPage = ref(1)
  const lastPage = ref(1)

  async function fetchActivities (workspaceId: number) {
    loading.value = true
    try {
      const page = await listActivities(workspaceId, 1)
      activities.value = page.activities
      currentPage.value = page.currentPage
      lastPage.value = page.lastPage
    } finally {
      loading.value = false
    }
  }

  async function fetchNextPage (workspaceId: number) {
    if (currentPage.value >= lastPage.value) {
      return
    }
    loadingMore.value = true
    try {
      const page = await listActivities(workspaceId, currentPage.value + 1)
      activities.value = [...activities.value, ...page.activities]
      currentPage.value = page.currentPage
      lastPage.value = page.lastPage
    } finally {
      loadingMore.value = false
    }
  }

  function subscribeToWorkspaceChannel (workspaceId: number) {
    const applyRealtimeActivity = (event: Omit<Activity, 'id'>) => {
      activities.value = [{ ...event, id: -Date.now() }, ...activities.value]
    }

    echo.private(`workspace.${workspaceId}`)
      .listen('.workspace.member_invited', applyRealtimeActivity)
      .listen('.workspace.member_removed', applyRealtimeActivity)
      .listen('.workspace.member_role_changed', applyRealtimeActivity)

    return () => echo.leave(`workspace.${workspaceId}`)
  }

  return {
    activities,
    loading,
    loadingMore,
    currentPage,
    lastPage,
    fetchActivities,
    fetchNextPage,
    subscribeToWorkspaceChannel,
  }
})
