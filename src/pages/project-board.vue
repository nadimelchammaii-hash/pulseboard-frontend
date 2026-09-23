<template>
  <AppShell title="Board" :workspace-id="workspaceId" :workspace-name="workspaceStore.current?.name">
    <div v-if="loading" class="d-flex justify-center py-12">
      <v-progress-circular color="primary" indeterminate />
    </div>

    <template v-else-if="projectStore.current">
      <div class="d-flex align-center ga-2 mb-1">
        <router-link
          class="text-body-2 text-on-surface-variant text-decoration-none"
          :to="{ name: 'workspace-projects', params: { workspaceId } }"
        >
          Projects
        </router-link>

        <v-icon color="on-surface-variant" size="14">mdi-chevron-right</v-icon>
        <span class="text-body-2 text-on-surface-variant">{{ projectStore.current.name }}</span>
      </div>

      <div class="d-flex align-center justify-space-between mb-4 flex-wrap ga-4">
        <h1 class="board__heading">{{ projectStore.current.name }}</h1>

        <v-btn-toggle
          class="board__tabs"
          color="primary"
          density="comfortable"
          mandatory
          variant="outlined"
        >
          <v-btn :to="{ name: 'project-board', params: { workspaceId, projectId } }">Board</v-btn>
          <v-btn :to="{ name: 'project-members', params: { workspaceId, projectId } }">Members</v-btn>
        </v-btn-toggle>
      </div>

      <v-alert
        v-if="formError"
        class="mb-4"
        closable
        color="error"
        density="compact"
        variant="tonal"
        @click:close="formError = ''"
      >
        {{ formError }}
      </v-alert>

      <div class="board__columns">
        <div v-for="column in columns" :key="column.status" class="board__column">
          <div class="d-flex align-center justify-space-between mb-3 px-1">
            <div class="d-flex align-center ga-2">
              <span class="board__dot" :style="{ background: `rgb(var(--v-theme-${column.color}))` }" />
              <span class="font-label-caps text-uppercase text-caption font-weight-bold">{{ column.label }}</span>
              <span class="text-caption text-on-surface-variant">{{ tasksByStatus(column.status).length }}</span>
            </div>

            <v-btn
              color="on-surface-variant"
              icon="mdi-plus"
              size="small"
              variant="text"
              @click="openCreate(column.status)"
            />
          </div>

          <div
            class="board__dropzone"
            @dragover.prevent
            @drop="onDrop(column.status)"
          >
            <v-card
              v-for="(task, index) in tasksByStatus(column.status)"
              :key="task.id"
              class="board__card pa-3 mb-2"
              color="surface-container-low"
              draggable="true"
              :elevation="0"
              @click="openTask(task.id)"
              @dragover.prevent="dragOverIndex = index"
              @dragstart="onDragStart(task)"
            >
              <div class="d-flex align-center justify-space-between mb-2">
                <v-chip :color="`priority-${task.priority.replace('_', '-')}`" density="comfortable" size="x-small" variant="flat">
                  {{ task.priority }}
                </v-chip>

                <v-avatar v-if="task.assignee" color="surface-container-high" size="22">
                  <span class="text-caption">{{ initialsOf(task.assignee.name) }}</span>
                </v-avatar>
              </div>

              <div class="text-body-2 font-weight-medium mb-2">{{ task.title }}</div>

              <div class="d-flex align-center justify-space-between text-caption text-on-surface-variant">
                <span v-if="task.due_date" class="d-flex align-center ga-1">
                  <v-icon size="14">mdi-calendar-outline</v-icon>
                  {{ formatDate(task.due_date) }}
                </span>

                <span v-else />

                <span v-if="task.comments_count" class="d-flex align-center ga-1">
                  <v-icon size="14">mdi-comment-outline</v-icon>
                  {{ task.comments_count }}
                </span>
              </div>
            </v-card>

            <div v-if="tasksByStatus(column.status).length === 0" class="board__empty text-caption text-on-surface-variant">
              No tasks
            </div>
          </div>
        </div>
      </div>
    </template>

    <v-dialog v-model="createDialog" max-width="480">
      <v-card class="pa-2" color="surface-container">
        <v-card-title class="text-h6">New task</v-card-title>

        <v-card-text>
          <v-text-field
            v-model="newTask.title"
            autofocus
            class="mb-2"
            :error-messages="createErrors.title"
            label="Title"
          />

          <v-textarea v-model="newTask.description" class="mb-2" label="Description" rows="3" />

          <v-select
            v-model="newTask.priority"
            class="mb-2"
            :items="priorityOptions"
            label="Priority"
          />

          <v-select
            v-model="newTask.assignee_id"
            class="mb-2"
            clearable
            :item-title="item => `${item.name} (${item.email})`"
            item-value="id"
            :items="projectStore.members.map(m => m.user)"
            label="Assignee"
          />

          <v-text-field
            v-model="newTask.due_date"
            clearable
            label="Due date"
            type="date"
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="createDialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="creating" @click="submitCreate">Create</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </AppShell>
</template>

<script lang="ts" setup>
  import type { Task, TaskPriority, TaskStatus } from '@/api/tasks'
  import { isAxiosError } from 'axios'
  import { computed, onMounted, onUnmounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import AppShell from '@/components/app/AppShell.vue'
  import { useProjectStore } from '@/stores/projects'
  import { useTaskStore } from '@/stores/tasks'
  import { useWorkspaceStore } from '@/stores/workspaces'

  const route = useRoute()
  const router = useRouter()
  const workspaceStore = useWorkspaceStore()
  const projectStore = useProjectStore()
  const taskStore = useTaskStore()

  const workspaceId = computed(() => Number(route.params.workspaceId))
  const projectId = computed(() => Number(route.params.projectId))
  const loading = ref(true)
  const formError = ref('')

  const columns: { status: TaskStatus, label: string, color: string }[] = [
    { status: 'todo', label: 'To Do', color: 'status-todo' },
    { status: 'in_progress', label: 'In Progress', color: 'status-in-progress' },
    { status: 'review', label: 'Review', color: 'status-review' },
    { status: 'done', label: 'Done', color: 'status-done' },
  ]

  const priorityOptions: TaskPriority[] = ['low', 'medium', 'high', 'urgent']

  function tasksByStatus (status: TaskStatus) {
    // filter() already returns a fresh array, so sorting it in place here doesn't mutate the store.
    const filtered = taskStore.tasks.filter(task => task.status === status)
    // eslint-disable-next-line unicorn/no-array-sort
    return filtered.sort((a, b) => a.position - b.position)
  }

  function initialsOf (name: string) {
    return name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase()
  }

  function formatDate (value: string) {
    return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  function openTask (taskId: number) {
    router.push({ name: 'task-detail', params: { workspaceId: workspaceId.value, projectId: projectId.value, taskId } })
  }

  const draggedTask = ref<Task | null>(null)
  const dragOverIndex = ref<number | null>(null)

  function onDragStart (task: Task) {
    draggedTask.value = task
  }

  async function onDrop (status: TaskStatus) {
    if (!draggedTask.value) return
    const task = draggedTask.value
    draggedTask.value = null

    const targetPosition = dragOverIndex.value ?? tasksByStatus(status).length
    dragOverIndex.value = null

    if (task.status === status && tasksByStatus(status)[targetPosition]?.id === task.id) return

    try {
      await taskStore.moveTask(workspaceId.value, projectId.value, task.id, { status, position: targetPosition })
    } catch {
      formError.value = 'Could not move this task. Please try again.'
    }
  }

  const createDialog = ref(false)
  const creating = ref(false)
  const createErrors = ref<Record<string, string[]>>({})
  const newTask = ref<{
    title: string
    description: string
    priority: TaskPriority
    assignee_id: number | null
    due_date: string
    status: TaskStatus
  }>({
    title: '',
    description: '',
    priority: 'medium',
    assignee_id: null,
    due_date: '',
    status: 'todo',
  })

  function openCreate (status: TaskStatus) {
    newTask.value = { title: '', description: '', priority: 'medium', assignee_id: null, due_date: '', status }
    createErrors.value = {}
    createDialog.value = true
  }

  async function submitCreate () {
    createErrors.value = {}
    creating.value = true

    try {
      await taskStore.createTask(workspaceId.value, projectId.value, {
        title: newTask.value.title,
        description: newTask.value.description || null,
        priority: newTask.value.priority,
        assignee_id: newTask.value.assignee_id,
        due_date: newTask.value.due_date || null,
        status: newTask.value.status,
      })
      createDialog.value = false
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 422) {
        createErrors.value = error.response.data.errors ?? {}
      } else {
        formError.value = 'Something went wrong. Please try again.'
      }
    } finally {
      creating.value = false
    }
  }

  let unsubscribe: (() => void) | null = null

  onMounted(async () => {
    loading.value = true
    try {
      await workspaceStore.fetchWorkspace(workspaceId.value)
      await projectStore.fetchProject(workspaceId.value, projectId.value)
      await projectStore.fetchMembers(workspaceId.value, projectId.value)
      await taskStore.fetchTasks(workspaceId.value, projectId.value)
      unsubscribe = taskStore.subscribeToProjectChannel(projectId.value)
    } finally {
      loading.value = false
    }
  })

  onUnmounted(() => {
    unsubscribe?.()
  })
</script>

<style scoped>
.board__heading {
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 1.5rem;
  letter-spacing: -0.015em;
}

.board__columns {
  display: grid;
  grid-template-columns: repeat(4, minmax(260px, 1fr));
  gap: 16px;
  overflow-x: auto;
}

.board__column {
  min-width: 0;
}

.board__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.board__dropzone {
  min-height: 80px;
}

.board__card {
  cursor: grab;
}

.board__card:active {
  cursor: grabbing;
}

.board__empty {
  border: 1px dashed rgb(var(--v-theme-surface-container-high));
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}
</style>
