<template>
  <AppShell title="Projects" :workspace-id="workspaceId" :workspace-name="workspaceStore.current?.name">
    <div v-if="loading" class="d-flex justify-center py-12">
      <v-progress-circular color="primary" indeterminate />
    </div>

    <template v-else>
      <div class="d-flex align-center justify-space-between mb-6">
        <div>
          <h1 class="projects__heading mb-1">Projects</h1>

          <p class="text-body-2 text-on-surface-variant">
            {{ workspaceStore.current?.name }}
          </p>
        </div>

        <v-btn v-if="canManage" color="primary" prepend-icon="mdi-plus" @click="createDialog = true">
          New project
        </v-btn>
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

      <v-card v-if="projectStore.projects.length === 0" class="pa-8 text-center" color="surface-container-low" :elevation="0">
        <v-icon class="mb-3" color="on-surface-variant" size="40">mdi-view-column-outline</v-icon>
        <div class="text-body-1 font-weight-medium mb-1">No projects yet</div>

        <p class="text-body-2 text-on-surface-variant mb-4">
          {{ canManage ? 'Create a project to start organizing work.' : 'You have not been added to any projects in this workspace yet.' }}
        </p>

        <v-btn v-if="canManage" color="primary" @click="createDialog = true">Create a project</v-btn>
      </v-card>

      <v-row v-else>
        <v-col
          v-for="project in projectStore.projects"
          :key="project.id"
          cols="12"
          md="4"
          sm="6"
        >
          <v-card class="pa-4" color="surface-container-low" :elevation="0">
            <div class="d-flex align-start justify-space-between mb-3">
              <v-avatar color="surface-container-high" rounded="lg" size="40">
                <v-icon color="primary">mdi-view-column-outline</v-icon>
              </v-avatar>

              <v-btn
                v-if="canManage"
                color="on-surface-variant"
                icon="mdi-delete-outline"
                size="small"
                variant="text"
                @click="confirmDelete(project)"
              />
            </div>

            <div class="text-body-1 font-weight-medium text-truncate mb-1">{{ project.name }}</div>

            <div class="d-flex align-center ga-2 mb-4">
              <v-chip
                v-if="project.is_member"
                color="tertiary"
                density="comfortable"
                size="small"
                variant="tonal"
              >
                Member
              </v-chip>

              <span class="text-caption text-on-surface-variant">
                {{ project.members_count }} member{{ project.members_count === 1 ? '' : 's' }}
              </span>
            </div>

            <v-btn block color="primary" variant="tonal" @click="goToBoard(project.id)">
              Open
            </v-btn>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <v-dialog v-model="createDialog" max-width="420">
      <v-card class="pa-2" color="surface-container">
        <v-card-title class="text-h6">Create project</v-card-title>

        <v-card-text>
          <v-text-field
            v-model="newProjectName"
            autofocus
            :error-messages="nameError"
            label="Project name"
            @keydown.enter="submitCreate"
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="createDialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="creating" @click="submitCreate">Create</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="420">
      <v-card class="pa-2" color="surface-container">
        <v-card-title class="text-h6">Delete project</v-card-title>

        <v-card-text>
          Delete <strong>{{ projectToDelete?.name }}</strong>? This removes all its members and can't be undone.
        </v-card-text>

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
  import type { Project } from '@/api/projects'
  import { isAxiosError } from 'axios'
  import { computed, onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import AppShell from '@/components/app/AppShell.vue'
  import { useProjectStore } from '@/stores/projects'
  import { useWorkspaceStore } from '@/stores/workspaces'

  const route = useRoute()
  const router = useRouter()
  const workspaceStore = useWorkspaceStore()
  const projectStore = useProjectStore()

  const workspaceId = computed(() => Number(route.params.workspaceId))
  const loading = ref(true)
  const formError = ref('')

  const canManage = computed(() => {
    const role = workspaceStore.current?.role
    return role === 'owner' || role === 'admin'
  })

  const createDialog = ref(false)
  const newProjectName = ref('')
  const creating = ref(false)
  const nameError = ref<string[]>([])

  const deleteDialog = ref(false)
  const projectToDelete = ref<Project | null>(null)
  const deleting = ref(false)

  function goToBoard (projectId: number) {
    router.push({ name: 'project-board', params: { workspaceId: workspaceId.value, projectId } })
  }

  async function submitCreate () {
    nameError.value = []
    creating.value = true

    try {
      const project = await projectStore.createProject(workspaceId.value, { name: newProjectName.value })
      createDialog.value = false
      newProjectName.value = ''
      goToBoard(project.id)
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 422) {
        nameError.value = error.response.data.errors?.name ?? []
      } else {
        formError.value = 'Something went wrong. Please try again.'
      }
    } finally {
      creating.value = false
    }
  }

  function confirmDelete (project: Project) {
    projectToDelete.value = project
    deleteDialog.value = true
  }

  async function submitDelete () {
    if (!projectToDelete.value) return
    deleting.value = true

    try {
      await projectStore.deleteProject(workspaceId.value, projectToDelete.value.id)
      deleteDialog.value = false
    } catch {
      formError.value = 'Could not delete this project. Please try again.'
    } finally {
      deleting.value = false
    }
  }

  onMounted(async () => {
    loading.value = true
    try {
      await workspaceStore.fetchWorkspace(workspaceId.value)
      await projectStore.fetchProjects(workspaceId.value)
    } finally {
      loading.value = false
    }
  })
</script>

<style scoped>
.projects__heading {
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 1.5rem;
  letter-spacing: -0.015em;
}
</style>
