<template>
  <AppShell title="Team Members" :workspace-id="workspaceId" :workspace-name="workspaceStore.current?.name">
    <div v-if="loading" class="d-flex justify-center py-12">
      <v-progress-circular color="primary" indeterminate />
    </div>

    <template v-else-if="workspaceStore.current">
      <div class="d-flex align-start justify-space-between mb-6 flex-wrap ga-4">
        <div>
          <h1 class="members__heading mb-1">Team Members &amp; Permissions</h1>

          <p class="text-body-2 text-on-surface-variant">
            {{ workspaceStore.members.length }} member{{ workspaceStore.members.length === 1 ? '' : 's' }} in {{ workspaceStore.current.name }}
          </p>
        </div>

        <v-btn v-if="canManage" color="primary" prepend-icon="mdi-account-plus-outline" @click="openInvite">
          Invite member
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
              <th>Role</th>
              <th>Joined</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="member in workspaceStore.members" :key="member.id">
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

              <td>
                <v-chip :color="roleColor(member.role)" density="comfortable" size="small" variant="tonal">
                  {{ roleLabel(member.role) }}
                </v-chip>
              </td>

              <td class="text-caption text-on-surface-variant">
                {{ formatDate(member.joined_at) }}
              </td>

              <td class="text-right">
                <v-menu v-if="canChangeRole(member)">
                  <template #activator="{ props: menuProps }">
                    <v-btn icon="mdi-account-cog-outline" size="small" v-bind="menuProps" variant="text" />
                  </template>

                  <v-list density="compact">
                    <v-list-item
                      v-if="member.role !== 'admin'"
                      title="Make admin"
                      @click="changeRole(member, 'admin')"
                    />

                    <v-list-item
                      v-if="member.role !== 'member'"
                      title="Make member"
                      @click="changeRole(member, 'member')"
                    />

                    <v-list-item title="Transfer ownership" @click="changeRole(member, 'owner')" />
                  </v-list>
                </v-menu>

                <v-btn
                  v-if="canRemove(member)"
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

    <v-dialog v-model="inviteDialog" max-width="440">
      <v-card class="pa-2" color="surface-container">
        <v-card-title class="text-h6">Invite a teammate</v-card-title>

        <v-card-text class="d-flex flex-column ga-4">
          <v-text-field
            v-model="inviteEmail"
            autofocus
            :error-messages="inviteErrors.email"
            label="Email address"
            type="email"
          />

          <v-select
            v-model="inviteRole"
            :error-messages="inviteErrors.role"
            :items="[{ title: 'Member (standard access)', value: 'member' }, { title: 'Admin (manage settings)', value: 'admin' }]"
            label="Role"
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="inviteDialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="inviting" @click="submitInvite">Send invite</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="removeDialog" max-width="420">
      <v-card class="pa-2" color="surface-container">
        <v-card-title class="text-h6">Remove member</v-card-title>

        <v-card-text>
          Remove <strong>{{ memberToRemove?.user.name }}</strong> from {{ workspaceStore.current?.name }}?
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
  import type { InviteMemberPayload, WorkspaceMember, WorkspaceRole } from '@/api/workspaces'
  import { isAxiosError } from 'axios'
  import { computed, onMounted, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import AppShell from '@/components/app/AppShell.vue'
  import { useAuthStore } from '@/stores/auth'
  import { useWorkspaceStore } from '@/stores/workspaces'

  const route = useRoute()
  const authStore = useAuthStore()
  const workspaceStore = useWorkspaceStore()

  const workspaceId = computed(() => Number(route.params.workspaceId))
  const loading = ref(true)
  const formError = ref('')

  const myRole = computed(() => workspaceStore.current?.role)
  const canManage = computed(() => myRole.value === 'owner' || myRole.value === 'admin')
  const isOwner = computed(() => myRole.value === 'owner')

  const roleLabels: Record<WorkspaceRole, string> = {
    owner: 'Owner',
    admin: 'Admin',
    member: 'Member',
  }

  const roleColors: Record<WorkspaceRole, string> = {
    owner: 'tertiary',
    admin: 'primary',
    member: 'secondary',
  }

  function roleLabel (role: WorkspaceRole) {
    return roleLabels[role]
  }

  function roleColor (role: WorkspaceRole) {
    return roleColors[role]
  }

  function initialsOf (name: string) {
    return name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase()
  }

  function formatDate (value: string) {
    return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  }

  function isSelf (member: WorkspaceMember) {
    return member.user.id === authStore.user?.id
  }

  function canChangeRole (member: WorkspaceMember) {
    return isOwner.value && member.role !== 'owner' && !isSelf(member)
  }

  function canRemove (member: WorkspaceMember) {
    if (member.role === 'owner') return false
    if (isSelf(member)) return true
    if (isOwner.value) return true
    return myRole.value === 'admin' && member.role === 'member'
  }

  const inviteDialog = ref(false)
  const inviteEmail = ref('')
  const inviteRole = ref<InviteMemberPayload['role']>('member')
  const inviting = ref(false)
  const inviteErrors = ref<Record<string, string[]>>({})

  function openInvite () {
    inviteEmail.value = ''
    inviteRole.value = 'member'
    inviteErrors.value = {}
    inviteDialog.value = true
  }

  async function submitInvite () {
    inviteErrors.value = {}
    inviting.value = true

    try {
      await workspaceStore.inviteMember(workspaceId.value, {
        email: inviteEmail.value,
        role: inviteRole.value,
      })
      inviteDialog.value = false
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 422) {
        inviteErrors.value = error.response.data.errors ?? {}
      } else {
        formError.value = 'Something went wrong. Please try again.'
      }
    } finally {
      inviting.value = false
    }
  }

  async function changeRole (member: WorkspaceMember, role: WorkspaceRole) {
    try {
      await workspaceStore.updateMemberRole(workspaceId.value, member.id, { role })
      if (role === 'owner') {
        await workspaceStore.fetchWorkspace(workspaceId.value)
        await workspaceStore.fetchMembers(workspaceId.value)
      }
    } catch (error) {
      formError.value = isAxiosError(error) && error.response?.status === 422 ? error.response.data.message ?? 'That role change is not allowed.' : 'Something went wrong. Please try again.'
    }
  }

  const removeDialog = ref(false)
  const memberToRemove = ref<WorkspaceMember | null>(null)
  const removing = ref(false)

  function confirmRemove (member: WorkspaceMember) {
    memberToRemove.value = member
    removeDialog.value = true
  }

  async function submitRemove () {
    if (!memberToRemove.value) return
    removing.value = true

    try {
      await workspaceStore.removeMember(workspaceId.value, memberToRemove.value.id)
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
    } finally {
      loading.value = false
    }
  })
</script>

<style scoped>
.members__heading {
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 1.5rem;
  letter-spacing: -0.015em;
}
</style>
