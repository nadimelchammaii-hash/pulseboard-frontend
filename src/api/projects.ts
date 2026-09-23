import type { User } from './auth'
import client from './client'

export interface Project {
  id: number
  workspace_id: number
  name: string
  slug: string
  is_member: boolean
  members_count: number
  created_at: string
  updated_at: string
}

export interface ProjectMember {
  id: number
  user: User
  joined_at: string
}

interface ProjectResponse {
  data: Project
}

interface ProjectListResponse {
  data: Project[]
}

interface ProjectMemberResponse {
  data: ProjectMember
}

interface ProjectMemberListResponse {
  data: ProjectMember[]
}

export interface CreateProjectPayload {
  name: string
}

export interface UpdateProjectPayload {
  name: string
}

export interface AddProjectMemberPayload {
  user_id: number
}

export async function listProjects (workspaceId: number): Promise<Project[]> {
  const { data } = await client.get<ProjectListResponse>(`/api/v1/workspaces/${workspaceId}/projects`)
  return data.data
}

export async function createProject (workspaceId: number, payload: CreateProjectPayload): Promise<Project> {
  const { data } = await client.post<ProjectResponse>(`/api/v1/workspaces/${workspaceId}/projects`, payload)
  return data.data
}

export async function getProject (workspaceId: number, projectId: number): Promise<Project> {
  const { data } = await client.get<ProjectResponse>(`/api/v1/workspaces/${workspaceId}/projects/${projectId}`)
  return data.data
}

export async function updateProject (workspaceId: number, projectId: number, payload: UpdateProjectPayload): Promise<Project> {
  const { data } = await client.put<ProjectResponse>(`/api/v1/workspaces/${workspaceId}/projects/${projectId}`, payload)
  return data.data
}

export async function deleteProject (workspaceId: number, projectId: number): Promise<void> {
  await client.delete(`/api/v1/workspaces/${workspaceId}/projects/${projectId}`)
}

export async function listProjectMembers (workspaceId: number, projectId: number): Promise<ProjectMember[]> {
  const { data } = await client.get<ProjectMemberListResponse>(`/api/v1/workspaces/${workspaceId}/projects/${projectId}/members`)
  return data.data
}

export async function addProjectMember (workspaceId: number, projectId: number, payload: AddProjectMemberPayload): Promise<ProjectMember> {
  const { data } = await client.post<ProjectMemberResponse>(`/api/v1/workspaces/${workspaceId}/projects/${projectId}/members`, payload)
  return data.data
}

export async function removeProjectMember (workspaceId: number, projectId: number, memberId: number): Promise<void> {
  await client.delete(`/api/v1/workspaces/${workspaceId}/projects/${projectId}/members/${memberId}`)
}
