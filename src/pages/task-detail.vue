<template>
  <AppShell title="Task" :workspace-id="workspaceId" :workspace-name="workspaceStore.current?.name">
    <div v-if="loading" class="d-flex justify-center py-12">
      <v-progress-circular color="primary" indeterminate />
    </div>

    <template v-else-if="taskStore.current">
      <div class="d-flex align-center ga-2 mb-4">
        <router-link
          class="text-body-2 text-on-surface-variant text-decoration-none"
          :to="{ name: 'workspace-projects', params: { workspaceId } }"
        >
          Projects
        </router-link>

        <v-icon color="on-surface-variant" size="14">mdi-chevron-right</v-icon>

        <router-link
          class="text-body-2 text-on-surface-variant text-decoration-none"
          :to="{ name: 'project-board', params: { workspaceId, projectId } }"
        >
          {{ projectStore.current?.name }}
        </router-link>
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

      <v-row>
        <v-col cols="12" md="8">
          <v-card class="pa-6 mb-4" color="surface-container-low" :elevation="0">
            <v-text-field
              v-model="editable.title"
              class="mb-3 task-detail__title"
              density="comfortable"
              hide-details
              variant="plain"
              @blur="saveField"
            />

            <div class="text-caption text-uppercase text-on-surface-variant mb-1">Description</div>

            <v-textarea
              v-model="editable.description"
              auto-grow
              placeholder="Add a description..."
              rows="3"
              variant="outlined"
              @blur="saveField"
            />
          </v-card>

          <v-card class="pa-6" color="surface-container-low" :elevation="0">
            <div class="d-flex align-center ga-2 mb-4">
              <v-icon color="tertiary" size="18">mdi-comment-multiple-outline</v-icon>
              <span class="text-body-1 font-weight-medium">Comments ({{ taskStore.comments.length }})</span>
            </div>

            <div v-for="comment in taskStore.comments" :key="comment.id" class="d-flex align-start ga-3 mb-4">
              <v-avatar color="surface-container-high" size="32">
                <span class="text-caption font-weight-bold">{{ initialsOf(comment.user.name) }}</span>
              </v-avatar>

              <div class="flex-grow-1">
                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center ga-2">
                    <span class="text-body-2 font-weight-medium">{{ comment.user.name }}</span>
                    <span class="text-caption text-on-surface-variant">{{ formatDateTime(comment.created_at) }}</span>
                  </div>

                  <v-btn
                    color="on-surface-variant"
                    icon="mdi-close"
                    size="x-small"
                    variant="text"
                    @click="removeComment(comment.id)"
                  />
                </div>

                <p class="text-body-2 mt-1">{{ comment.body }}</p>
              </div>
            </div>

            <v-textarea
              v-model="newComment"
              auto-grow
              density="comfortable"
              placeholder="Write a comment..."
              rows="2"
              variant="outlined"
            />

            <div class="d-flex justify-end">
              <v-btn color="primary" :disabled="!newComment.trim()" :loading="commenting" @click="submitComment">
                Comment
              </v-btn>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="pa-6" color="surface-container-low" :elevation="0">
            <div class="text-caption text-uppercase text-on-surface-variant mb-1">Status</div>

            <v-select
              v-model="statusModel"
              class="mb-4"
              density="comfortable"
              hide-details
              :items="statusOptions"
              variant="outlined"
            />

            <div class="text-caption text-uppercase text-on-surface-variant mb-1">Priority</div>

            <v-select
              v-model="editable.priority"
              class="mb-4"
              density="comfortable"
              hide-details
              :items="priorityOptions"
              variant="outlined"
              @update:model-value="saveField"
            />

            <div class="text-caption text-uppercase text-on-surface-variant mb-1">Assignee</div>

            <v-select
              v-model="editable.assignee_id"
              class="mb-4"
              clearable
              density="comfortable"
              hide-details
              :item-title="item => `${item.name} (${item.email})`"
              item-value="id"
              :items="projectStore.members.map(m => m.user)"
              variant="outlined"
              @update:model-value="saveField"
            />

            <div class="text-caption text-uppercase text-on-surface-variant mb-1">Due date</div>

            <v-text-field
              v-model="editable.due_date"
              class="mb-4"
              clearable
              density="comfortable"
              hide-details
              type="date"
              variant="outlined"
              @change="saveField"
            />

            <div class="text-caption text-on-surface-variant mb-4">
              Created by {{ taskStore.current.creator.name }}
            </div>

            <v-btn block color="error" variant="tonal" @click="deleteDialog = true">
              Delete task
            </v-btn>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <v-dialog v-model="deleteDialog" max-width="420">
      <v-card class="pa-2" color="surface-container">
        <v-card-title class="text-h6">Delete task</v-card-title>
        <v-card-text>Delete <strong>{{ taskStore.current?.title }}</strong>? This can't be undone.</v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" :loading="deleting" @click="submitDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </AppShell>
</template>

<script lang="ts" setup>
  import type { TaskPriority, TaskStatus } from '@/api/tasks'
  import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
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
  const taskId = computed(() => Number(route.params.taskId))
  const loading = ref(true)
  const formError = ref('')

  const statusOptions: TaskStatus[] = ['todo', 'in_progress', 'review', 'done']
  const priorityOptions: TaskPriority[] = ['low', 'medium', 'high', 'urgent']

  const editable = ref({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    assignee_id: null as number | null,
    due_date: '',
  })

  const statusModel = ref<TaskStatus>('todo')

  function syncEditableFromCurrent () {
    const task = taskStore.current
    if (!task) return
    editable.value = {
      title: task.title,
      description: task.description ?? '',
      priority: task.priority,
      assignee_id: task.assignee?.id ?? null,
      due_date: task.due_date ?? '',
    }
    statusModel.value = task.status
  }

  async function saveField () {
    if (!taskStore.current || !editable.value.title.trim()) return
    try {
      await taskStore.updateTask(workspaceId.value, projectId.value, taskId.value, {
        title: editable.value.title,
        description: editable.value.description || null,
        priority: editable.value.priority,
        assignee_id: editable.value.assignee_id,
        due_date: editable.value.due_date || null,
      })
    } catch {
      formError.value = 'Could not save that change. Please try again.'
    }
  }

  watch(statusModel, async newStatus => {
    if (!taskStore.current || newStatus === taskStore.current.status) return
    try {
      await taskStore.moveTask(workspaceId.value, projectId.value, taskId.value, { status: newStatus, position: 0 })
    } catch {
      formError.value = 'Could not change the status. Please try again.'
    }
  })

  function initialsOf (name: string) {
    return name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase()
  }

  function formatDateTime (value: string) {
    return new Date(value).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  }

  const newComment = ref('')
  const commenting = ref(false)

  async function submitComment () {
    if (!newComment.value.trim()) return
    commenting.value = true
    try {
      await taskStore.addComment(workspaceId.value, projectId.value, taskId.value, newComment.value.trim())
      newComment.value = ''
    } catch {
      formError.value = 'Could not post that comment. Please try again.'
    } finally {
      commenting.value = false
    }
  }

  async function removeComment (commentId: number) {
    try {
      await taskStore.removeComment(workspaceId.value, projectId.value, taskId.value, commentId)
    } catch {
      formError.value = 'Could not remove that comment.'
    }
  }

  const deleteDialog = ref(false)
  const deleting = ref(false)

  async function submitDelete () {
    deleting.value = true
    try {
      await taskStore.deleteTask(workspaceId.value, projectId.value, taskId.value)
      router.push({ name: 'project-board', params: { workspaceId: workspaceId.value, projectId: projectId.value } })
    } catch {
      formError.value = 'Could not delete this task.'
      deleting.value = false
    }
  }

  let unsubscribe: (() => void) | null = null

  onMounted(async () => {
    loading.value = true
    try {
      await workspaceStore.fetchWorkspace(workspaceId.value)
      await projectStore.fetchProject(workspaceId.value, projectId.value)
      await projectStore.fetchMembers(workspaceId.value, projectId.value)
      await taskStore.fetchTask(workspaceId.value, projectId.value, taskId.value)
      await taskStore.fetchComments(workspaceId.value, projectId.value, taskId.value)
      syncEditableFromCurrent()
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
.task-detail__title :deep(input) {
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 1.4rem;
}
</style>
