import type {
  CreateWorkspacePayload,
  InviteMemberPayload,
  UpdateMemberRolePayload,
  Workspace,
  WorkspaceMember,
} from '@/api/workspaces'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as workspacesApi from '@/api/workspaces'

export const useWorkspaceStore = defineStore('workspaces', () => {
  const workspaces = ref<Workspace[]>([])
  const current = ref<Workspace | null>(null)
  const members = ref<WorkspaceMember[]>([])
  const loading = ref(false)

  async function fetchWorkspaces () {
    loading.value = true
    try {
      workspaces.value = await workspacesApi.listWorkspaces()
    } finally {
      loading.value = false
    }
  }

  async function createWorkspace (payload: CreateWorkspacePayload) {
    const workspace = await workspacesApi.createWorkspace(payload)
    workspaces.value.push(workspace)
    return workspace
  }

  async function fetchWorkspace (id: number) {
    current.value = await workspacesApi.getWorkspace(id)
    return current.value
  }

  async function deleteWorkspace (id: number) {
    await workspacesApi.deleteWorkspace(id)
    workspaces.value = workspaces.value.filter(workspace => workspace.id !== id)
    if (current.value?.id === id) {
      current.value = null
    }
  }

  async function fetchMembers (workspaceId: number) {
    members.value = await workspacesApi.listMembers(workspaceId)
  }

  async function inviteMember (workspaceId: number, payload: InviteMemberPayload) {
    const member = await workspacesApi.inviteMember(workspaceId, payload)
    members.value.push(member)
    return member
  }

  async function updateMemberRole (workspaceId: number, memberId: number, payload: UpdateMemberRolePayload) {
    const member = await workspacesApi.updateMemberRole(workspaceId, memberId, payload)
    const index = members.value.findIndex(m => m.id === memberId)
    if (index !== -1) {
      members.value[index] = member
    }
    return member
  }

  async function removeMember (workspaceId: number, memberId: number) {
    await workspacesApi.removeMember(workspaceId, memberId)
    members.value = members.value.filter(m => m.id !== memberId)
  }

  return {
    workspaces,
    current,
    members,
    loading,
    fetchWorkspaces,
    createWorkspace,
    fetchWorkspace,
    deleteWorkspace,
    fetchMembers,
    inviteMember,
    updateMemberRole,
    removeMember,
  }
})
