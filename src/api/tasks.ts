import type { User } from './auth'
import client from './client'

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Task {
  id: number
  project_id: number
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  position: number
  assignee: User | null
  creator: User
  comments_count: number | null
  created_at: string
  updated_at: string
}

export interface TaskComment {
  id: number
  task_id: number
  user: User
  body: string
  created_at: string
}

interface TaskResponse {
  data: Task
}

interface TaskListResponse {
  data: Task[]
}

interface TaskCommentResponse {
  data: TaskComment
}

interface TaskCommentListResponse {
  data: TaskComment[]
}

export interface CreateTaskPayload {
  title: string
  description?: string | null
  status?: TaskStatus
  priority?: TaskPriority
  assignee_id?: number | null
  due_date?: string | null
}

export interface UpdateTaskPayload {
  title: string
  description?: string | null
  priority?: TaskPriority
  assignee_id?: number | null
  due_date?: string | null
}

export interface MoveTaskPayload {
  status: TaskStatus
  position: number
}

export async function listTasks (workspaceId: number, projectId: number): Promise<Task[]> {
  const { data } = await client.get<TaskListResponse>(`/api/v1/workspaces/${workspaceId}/projects/${projectId}/tasks`)
  return data.data
}

export async function createTask (workspaceId: number, projectId: number, payload: CreateTaskPayload): Promise<Task> {
  const { data } = await client.post<TaskResponse>(`/api/v1/workspaces/${workspaceId}/projects/${projectId}/tasks`, payload)
  return data.data
}

export async function getTask (workspaceId: number, projectId: number, taskId: number): Promise<Task> {
  const { data } = await client.get<TaskResponse>(`/api/v1/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`)
  return data.data
}

export async function updateTask (workspaceId: number, projectId: number, taskId: number, payload: UpdateTaskPayload): Promise<Task> {
  const { data } = await client.put<TaskResponse>(`/api/v1/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`, payload)
  return data.data
}

export async function moveTask (workspaceId: number, projectId: number, taskId: number, payload: MoveTaskPayload): Promise<Task> {
  const { data } = await client.patch<TaskResponse>(`/api/v1/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/move`, payload)
  return data.data
}

export async function deleteTask (workspaceId: number, projectId: number, taskId: number): Promise<void> {
  await client.delete(`/api/v1/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`)
}

export async function listComments (workspaceId: number, projectId: number, taskId: number): Promise<TaskComment[]> {
  const { data } = await client.get<TaskCommentListResponse>(`/api/v1/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments`)
  return data.data
}

export async function addComment (workspaceId: number, projectId: number, taskId: number, body: string): Promise<TaskComment> {
  const { data } = await client.post<TaskCommentResponse>(`/api/v1/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments`, { body })
  return data.data
}

export async function deleteComment (workspaceId: number, projectId: number, taskId: number, commentId: number): Promise<void> {
  await client.delete(`/api/v1/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments/${commentId}`)
}
