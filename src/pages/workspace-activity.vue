<template>
  <AppShell title="Activity" :workspace-id="workspaceId" :workspace-name="workspaceStore.current?.name">
    <div v-if="loading" class="d-flex justify-center py-12">
      <v-progress-circular color="primary" indeterminate />
    </div>

    <template v-else>
      <div class="mb-6">
        <h1 class="activity__heading mb-1">Activity</h1>
        <p class="text-body-2 text-on-surface-variant">Recent events across {{ workspaceStore.current?.name }}</p>
      </div>

      <v-card v-if="activityStore.activities.length === 0" class="pa-8 text-center" color="surface-container-low" :elevation="0">
        <v-icon class="mb-3" color="on-surface-variant" size="40">mdi-pulse</v-icon>
        <div class="text-body-1 font-weight-medium mb-1">No activity yet</div>

        <p class="text-body-2 text-on-surface-variant">
          Actions across this workspace's projects and tasks will show up here.
        </p>
      </v-card>

      <div v-else class="activity__timeline">
        <div v-for="activity in activityStore.activities" :key="activity.id" class="activity__item">
          <v-avatar class="activity__avatar" color="surface-container-high" size="32">
            <v-icon color="primary" size="16">{{ actionIcon(activity.action) }}</v-icon>
          </v-avatar>

          <v-card class="activity__card pa-3" color="surface-container" :elevation="0">
            <div class="d-flex align-center justify-space-between ga-2 mb-1">
              <span class="text-body-2 font-weight-medium text-truncate">{{ activity.causer.name }}</span>
              <span class="text-caption text-on-surface-variant flex-shrink-0">{{ formatRelativeTime(activity.created_at) }}</span>
            </div>

            <p class="text-body-2 text-on-surface-variant mb-0">
              {{ describeActivity(activity) }}

              <v-chip
                v-if="activity.action === 'task.moved'"
                class="ml-1"
                :color="statusColor(activity.data.to_status)"
                density="comfortable"
                size="x-small"
                variant="flat"
              >
                {{ statusLabel(activity.data.to_status) }}
              </v-chip>
            </p>

            <div v-if="activity.project" class="d-flex align-center ga-1 mt-2 text-on-surface-variant">
              <v-icon size="13">mdi-folder-outline</v-icon>
              <span class="text-caption">{{ activity.project.name }}</span>
            </div>
          </v-card>
        </div>
      </div>

      <div v-if="activityStore.currentPage < activityStore.lastPage" class="d-flex justify-center mt-4">
        <v-btn
          color="on-surface-variant"
          :loading="activityStore.loadingMore"
          variant="text"
          @click="activityStore.fetchNextPage(workspaceId)"
        >
          Load more
        </v-btn>
      </div>
    </template>
  </AppShell>
</template>

<script lang="ts" setup>
  import type { Activity } from '@/api/activities'
  import { computed, onMounted, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import AppShell from '@/components/app/AppShell.vue'
  import { useActivityStore } from '@/stores/activities'
  import { useWorkspaceStore } from '@/stores/workspaces'

  const route = useRoute()
  const workspaceStore = useWorkspaceStore()
  const activityStore = useActivityStore()

  const workspaceId = computed(() => Number(route.params.workspaceId))
  const loading = ref(true)

  const statusLabels: Record<string, string> = {
    todo: 'To Do',
    in_progress: 'In Progress',
    review: 'Review',
    done: 'Done',
  }

  const statusColors: Record<string, string> = {
    todo: 'status-todo',
    in_progress: 'status-in-progress',
    review: 'status-review',
    done: 'status-done',
  }

  function statusLabel (status: string) {
    return statusLabels[status] ?? status
  }

  function statusColor (status: string) {
    return statusColors[status] ?? 'surface-container-high'
  }

  function actionIcon (action: string) {
    if (action.startsWith('task_comment')) return 'mdi-comment-outline'
    if (action.startsWith('task')) return 'mdi-checkbox-marked-circle-outline'
    if (action.startsWith('project')) return 'mdi-view-column-outline'
    return 'mdi-account-group-outline'
  }

  function describeActivity (activity: Activity): string {
    const d = activity.data

    switch (activity.action) {
      case 'task.created': {
        return `created task "${d.task_title}"`
      }
      case 'task.moved': {
        return `moved "${d.task_title}" from ${statusLabel(d.from_status)} to`
      }
      case 'task.deleted': {
        return `deleted task "${d.task_title}"`
      }
      case 'task_comment.added': {
        return `commented on "${d.task_title}": "${d.comment_excerpt}"`
      }
      case 'project.created': {
        return `created project "${d.project_name}"`
      }
      case 'project.member_added': {
        return `added ${d.user_name} to ${d.project_name}`
      }
      case 'project.member_removed': {
        return `removed ${d.user_name} from ${d.project_name}`
      }
      case 'workspace.member_invited': {
        return `invited ${d.user_name} as ${d.role}`
      }
      case 'workspace.member_removed': {
        return `removed ${d.user_name} from the workspace`
      }
      case 'workspace.member_role_changed': {
        return `changed ${d.user_name}'s role from ${d.old_role} to ${d.new_role}`
      }
      default: {
        return activity.action
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

  onMounted(async () => {
    loading.value = true
    try {
      await workspaceStore.fetchWorkspace(workspaceId.value)
      await activityStore.fetchActivities(workspaceId.value)
    } finally {
      loading.value = false
    }
  })
</script>

<style scoped>
.activity__heading {
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 1.5rem;
  letter-spacing: -0.015em;
}

.activity__timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity__item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.activity__avatar {
  margin-top: 0.25rem;
  flex-shrink: 0;
}

.activity__card {
  flex: 1;
  min-width: 0;
}
</style>
