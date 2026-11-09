<template>
  <AppShell title="Workspaces">
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="index__heading mb-1">Your workspaces</h1>

        <p class="text-body-2 text-on-surface-variant">
          Open a workspace to see its boards, or create a new one.
        </p>
      </div>

      <v-btn color="primary" prepend-icon="mdi-plus" @click="createDialog = true">
        New workspace
      </v-btn>
    </div>

    <v-alert
      v-if="formError"
      class="mb-4"
      color="error"
      density="compact"
      variant="tonal"
    >
      {{ formError }}
    </v-alert>

    <div v-if="workspaceStore.loading" class="d-flex justify-center py-12">
      <v-progress-circular color="primary" indeterminate />
    </div>

    <v-card v-else-if="workspaceStore.workspaces.length === 0" class="pa-8 text-center" color="surface-container-low" :elevation="0">
      <v-icon class="mb-3" color="on-surface-variant" size="40">mdi-view-grid-plus-outline</v-icon>
      <div class="text-body-1 font-weight-medium mb-1">No workspaces yet</div>

      <p class="text-body-2 text-on-surface-variant mb-4">
        Create your first workspace to start inviting teammates.
      </p>

      <v-btn color="primary" @click="createDialog = true">Create a workspace</v-btn>
    </v-card>

    <v-row v-else>
      <v-col
        v-for="workspace in workspaceStore.workspaces"
        :key="workspace.id"
        cols="12"
        md="4"
        sm="6"
      >
        <!-- The whole card opens the workspace's boards; the name is the keyboard-focusable link. -->
        <v-card
          class="pa-4 index__card"
          color="surface-container-low"
          :elevation="0"
          link
          :ripple="false"
          @click="goToProjects(workspace.id)"
        >
          <div class="d-flex align-start justify-space-between mb-3">
            <v-avatar color="surface-container-high" rounded="lg" size="40">
              <v-icon color="primary">mdi-view-grid-outline</v-icon>
            </v-avatar>

            <v-btn
              v-if="workspace.role === 'owner'"
              color="on-surface-variant"
              icon="mdi-delete-outline"
              size="small"
              variant="text"
              @click.stop="confirmDelete(workspace)"
            />
          </div>

          <router-link
            class="index__name d-block text-body-1 font-weight-medium text-truncate text-decoration-none mb-1"
            :to="{ name: 'workspace-projects', params: { workspaceId: workspace.id } }"
            @click.stop
          >
            {{ workspace.name }}
          </router-link>

          <div class="d-flex align-center ga-2 mb-4">
            <v-chip color="primary" density="comfortable" size="small" variant="tonal">
              {{ roleLabel(workspace.role) }}
            </v-chip>

            <span class="text-caption text-on-surface-variant">
              {{ workspace.members_count }} member{{ workspace.members_count === 1 ? '' : 's' }}
            </span>
          </div>

          <div class="d-flex align-center justify-space-between">
            <span class="text-body-2 text-primary font-weight-medium">
              Open boards <v-icon size="16">mdi-arrow-right</v-icon>
            </span>

            <v-btn
              color="on-surface-variant"
              prepend-icon="mdi-account-group-outline"
              size="small"
              variant="text"
              @click.stop="goToMembers(workspace.id)"
            >
              View members
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="createDialog" max-width="420">
      <v-card class="pa-2" color="surface-container">
        <v-card-title class="text-h6">Create workspace</v-card-title>

        <v-card-text>
          <v-text-field
            v-model="newWorkspaceName"
            autofocus
            :error-messages="nameError"
            label="Workspace name"
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
        <v-card-title class="text-h6">Delete workspace</v-card-title>

        <v-card-text>
          Delete <strong>{{ workspaceToDelete?.name }}</strong>? This removes all its members and can't be undone.
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
  import type { Workspace, WorkspaceRole } from '@/api/workspaces'
  import { isAxiosError } from 'axios'
  import { onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { apiErrorMessage } from '@/api/client'
  import AppShell from '@/components/app/AppShell.vue'
  import { useWorkspaceStore } from '@/stores/workspaces'

  const router = useRouter()
  const workspaceStore = useWorkspaceStore()

  const createDialog = ref(false)
  const newWorkspaceName = ref('')
  const creating = ref(false)
  const nameError = ref<string[]>([])
  const formError = ref('')

  const deleteDialog = ref(false)
  const workspaceToDelete = ref<Workspace | null>(null)
  const deleting = ref(false)

  const roleLabels: Record<WorkspaceRole, string> = {
    owner: 'Owner',
    admin: 'Admin',
    member: 'Member',
  }

  function roleLabel (role: WorkspaceRole) {
    return roleLabels[role]
  }

  function goToProjects (workspaceId: number) {
    router.push({ name: 'workspace-projects', params: { workspaceId } })
  }

  function goToMembers (workspaceId: number) {
    router.push({ name: 'workspace-members', params: { workspaceId } })
  }

  async function submitCreate () {
    nameError.value = []
    creating.value = true

    try {
      const workspace = await workspaceStore.createWorkspace({ name: newWorkspaceName.value })
      createDialog.value = false
      newWorkspaceName.value = ''
      goToMembers(workspace.id)
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 422) {
        nameError.value = error.response.data.errors?.name ?? []
      } else {
        // Close the dialog so the page's alert (e.g. a demo limit) is visible.
        createDialog.value = false
        formError.value = apiErrorMessage(error, 'Something went wrong. Please try again.')
      }
    } finally {
      creating.value = false
    }
  }

  function confirmDelete (workspace: Workspace) {
    workspaceToDelete.value = workspace
    deleteDialog.value = true
  }

  async function submitDelete () {
    if (!workspaceToDelete.value) return
    deleting.value = true

    try {
      await workspaceStore.deleteWorkspace(workspaceToDelete.value.id)
      deleteDialog.value = false
    } catch {
      formError.value = 'Could not delete this workspace. Please try again.'
    } finally {
      deleting.value = false
    }
  }

  onMounted(() => {
    workspaceStore.fetchWorkspaces()
  })
</script>

<style scoped>
.index__card {
  cursor: pointer;
}

.index__name {
  color: rgb(var(--v-theme-on-surface));
}

.index__card:hover .index__name {
  color: rgb(var(--v-theme-primary));
}

.index__heading {
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 1.5rem;
  letter-spacing: -0.015em;
}
</style>
