<template>
  <AppShell title="Project Members" :workspace-id="workspaceId" :workspace-name="workspaceStore.current?.name">
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

      <div class="d-flex align-start justify-space-between mb-6 flex-wrap ga-4">
        <div>
          <h1 class="project-members__heading mb-1">{{ projectStore.current.name }}</h1>

          <p class="text-body-2 text-on-surface-variant">
            {{ projectStore.members.length }} member{{ projectStore.members.length === 1 ? '' : 's' }}
          </p>
        </div>

        <v-btn v-if="canManage" color="primary" prepend-icon="mdi-account-plus-outline" @click="openAdd">
          Add member
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

      <v-card color="surface-container-low" :elevation="0">
        <v-table>
          <thead>
            <tr>
              <th>Member</th>
              <th>Joined</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="member in projectStore.members" :key="member.id">
              <td>
                <div class="d-flex align-center ga-3 py-2">
                  <v-avatar color="surface-container-high" size="36">
                    <span class="text-caption font-weight-bold">{{ initialsOf(member.user.name) }}</span>
                  </v-avatar>

                  <div>
                    <div class="d-flex align-center ga-2">
                      <span class="text-body-2 font-weight-medium">{{ member.user.name }}</span>

                      <v-chip
                        v-if="isSelf(member)"
                        color="primary"
                        density="comfortable"
                        size="x-small"
                        variant="tonal"
                      >YOU</v-chip>
                    </div>

                    <span class="text-caption text-on-surface-variant">{{ member.user.email }}</span>
                  </div>
                </div>
              </td>

              <td class="text-caption text-on-surface-variant">
                {{ formatDate(member.joined_at) }}
              </td>

              <td class="text-right">
                <v-btn
                  v-if="canManage"
                  color="error"
                  icon="mdi-account-remove-outline"
                  size="small"
                  variant="text"
                  @click="confirmRemove(member)"
                />
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card>
    </template>

    <v-dialog v-model="addDialog" max-width="440">
      <v-card class="pa-2" color="surface-container">
        <v-card-title class="text-h6">Add a project member</v-card-title>

        <v-card-text>
          <v-select
            v-model="selectedUserId"
            :error-messages="addErrors.user_id"
            :item-title="item => `${item.name} (${item.email})`"
            item-value="id"
            :items="eligibleWorkspaceMembers"
            label="Workspace member"
            :no-data-text="eligibleWorkspaceMembers.length === 0 ? 'Everyone in the workspace is already on this project' : 'No matches'"
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="addDialog = false">Cancel</v-btn>
          <v-btn color="primary" :disabled="!selectedUserId" :loading="adding" @click="submitAdd">Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="removeDialog" max-width="420">
      <v-card class="pa-2" color="surface-container">
        <v-card-title class="text-h6">Remove member</v-card-title>

        <v-card-text>
          Remove <strong>{{ memberToRemove?.user.name }}</strong> from {{ projectStore.current?.name }}?
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="removeDialog = false">Cancel</v-btn>
          <v-btn color="error" :loading="removing" @click="submitRemove">Remove</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </AppShell>
</template>

<script lang="ts" setup>
  import type { User } from '@/api/auth'
  import type { ProjectMember } from '@/api/projects'
  import { isAxiosError } from 'axios'
  import { computed, onMounted, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import AppShell from '@/components/app/AppShell.vue'
  import { useAuthStore } from '@/stores/auth'
  import { useProjectStore } from '@/stores/projects'
  import { useWorkspaceStore } from '@/stores/workspaces'

  const route = useRoute()
  const authStore = useAuthStore()
  const workspaceStore = useWorkspaceStore()
  const projectStore = useProjectStore()

  const workspaceId = computed(() => Number(route.params.workspaceId))
  const projectId = computed(() => Number(route.params.projectId))
  const loading = ref(true)
  const formError = ref('')

  const canManage = computed(() => {
    const role = workspaceStore.current?.role
    return role === 'owner' || role === 'admin'
  })

  const eligibleWorkspaceMembers = computed<User[]>(() => {
    const currentMemberIds = new Set(projectStore.members.map(member => member.user.id))
    return workspaceStore.members
      .map(member => member.user)
      .filter(user => !currentMemberIds.has(user.id))
  })

  function initialsOf (name: string) {
    return name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase()
  }

  function formatDate (value: string) {
    return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  }

  function isSelf (member: ProjectMember) {
    return member.user.id === authStore.user?.id
  }

  const addDialog = ref(false)
  const selectedUserId = ref<number | null>(null)
  const adding = ref(false)
  const addErrors = ref<Record<string, string[]>>({})

  function openAdd () {
    selectedUserId.value = null
    addErrors.value = {}
    addDialog.value = true
  }

  async function submitAdd () {
    if (!selectedUserId.value) return
    addErrors.value = {}
    adding.value = true

    try {
      await projectStore.addMember(workspaceId.value, projectId.value, { user_id: selectedUserId.value })
      addDialog.value = false
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 422) {
        addErrors.value = error.response.data.errors ?? {}
      } else {
        formError.value = 'Something went wrong. Please try again.'
      }
    } finally {
      adding.value = false
    }
  }

  const removeDialog = ref(false)
  const memberToRemove = ref<ProjectMember | null>(null)
  const removing = ref(false)

  function confirmRemove (member: ProjectMember) {
    memberToRemove.value = member
    removeDialog.value = true
  }

  async function submitRemove () {
    if (!memberToRemove.value) return
    removing.value = true

    try {
      await projectStore.removeMember(workspaceId.value, projectId.value, memberToRemove.value.id)
      removeDialog.value = false
    } catch {
      formError.value = 'Could not remove this member. Please try again.'
    } finally {
      removing.value = false
    }
  }

  onMounted(async () => {
    loading.value = true
    try {
      await workspaceStore.fetchWorkspace(workspaceId.value)
      await workspaceStore.fetchMembers(workspaceId.value)
      await projectStore.fetchProject(workspaceId.value, projectId.value)
      await projectStore.fetchMembers(workspaceId.value, projectId.value)
    } finally {
      loading.value = false
    }
  })
</script>

<style scoped>
.project-members__heading {
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 1.5rem;
  letter-spacing: -0.015em;
}
</style>
