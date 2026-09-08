import type { User } from './auth'
import client from './client'

export type WorkspaceRole = 'owner' | 'admin' | 'member'

export interface Workspace {
  id: number
  name: string
  slug: string
  role: WorkspaceRole
  members_count: number
  created_at: string
  updated_at: string
}

export interface WorkspaceMember {
  id: number
  user: User
  role: WorkspaceRole
  joined_at: string
}

interface WorkspaceResponse {
  data: Workspace
}

interface WorkspaceListResponse {
  data: Workspace[]
}

interface MemberResponse {
  data: WorkspaceMember
}

interface MemberListResponse {
  data: WorkspaceMember[]
}

export interface CreateWorkspacePayload {
  name: string
}

export interface UpdateWorkspacePayload {
  name: string
}

export interface InviteMemberPayload {
  email: string
  role: Exclude<WorkspaceRole, 'owner'>
}

export interface UpdateMemberRolePayload {
  role: WorkspaceRole
}

export async function listWorkspaces (): Promise<Workspace[]> {
  const { data } = await client.get<WorkspaceListResponse>('/api/v1/workspaces')
  return data.data
}

export async function createWorkspace (payload: CreateWorkspacePayload): Promise<Workspace> {
  const { data } = await client.post<WorkspaceResponse>('/api/v1/workspaces', payload)
  return data.data
}

export async function getWorkspace (id: number): Promise<Workspace> {
  const { data } = await client.get<WorkspaceResponse>(`/api/v1/workspaces/${id}`)
  return data.data
}

export async function updateWorkspace (id: number, payload: UpdateWorkspacePayload): Promise<Workspace> {
  const { data } = await client.put<WorkspaceResponse>(`/api/v1/workspaces/${id}`, payload)
  return data.data
}

export async function deleteWorkspace (id: number): Promise<void> {
  await client.delete(`/api/v1/workspaces/${id}`)
}

export async function listMembers (workspaceId: number): Promise<WorkspaceMember[]> {
  const { data } = await client.get<MemberListResponse>(`/api/v1/workspaces/${workspaceId}/members`)
  return data.data
}

export async function inviteMember (workspaceId: number, payload: InviteMemberPayload): Promise<WorkspaceMember> {
  const { data } = await client.post<MemberResponse>(`/api/v1/workspaces/${workspaceId}/members`, payload)
  return data.data
}

export async function updateMemberRole (workspaceId: number, memberId: number, payload: UpdateMemberRolePayload): Promise<WorkspaceMember> {
  const { data } = await client.patch<MemberResponse>(`/api/v1/workspaces/${workspaceId}/members/${memberId}`, payload)
  return data.data
}

export async function removeMember (workspaceId: number, memberId: number): Promise<void> {
  await client.delete(`/api/v1/workspaces/${workspaceId}/members/${memberId}`)
}
