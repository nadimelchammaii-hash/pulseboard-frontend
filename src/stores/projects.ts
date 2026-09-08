import type {
  AddProjectMemberPayload,
  CreateProjectPayload,
  Project,
  ProjectMember,
  UpdateProjectPayload,
} from '@/api/projects'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as projectsApi from '@/api/projects'

export const useProjectStore = defineStore('projects', () => {
  const projects = ref<Project[]>([])
  const current = ref<Project | null>(null)
  const members = ref<ProjectMember[]>([])
  const loading = ref(false)

  async function fetchProjects (workspaceId: number) {
    loading.value = true
    try {
      projects.value = await projectsApi.listProjects(workspaceId)
    } finally {
      loading.value = false
    }
  }

  async function createProject (workspaceId: number, payload: CreateProjectPayload) {
    const project = await projectsApi.createProject(workspaceId, payload)
    projects.value.push(project)
    return project
  }

  async function fetchProject (workspaceId: number, projectId: number) {
    current.value = await projectsApi.getProject(workspaceId, projectId)
    return current.value
  }

  async function updateProject (workspaceId: number, projectId: number, payload: UpdateProjectPayload) {
    current.value = await projectsApi.updateProject(workspaceId, projectId, payload)
    return current.value
  }

  async function deleteProject (workspaceId: number, projectId: number) {
    await projectsApi.deleteProject(workspaceId, projectId)
    projects.value = projects.value.filter(project => project.id !== projectId)
    if (current.value?.id === projectId) {
      current.value = null
    }
  }

  async function fetchMembers (workspaceId: number, projectId: number) {
    members.value = await projectsApi.listProjectMembers(workspaceId, projectId)
  }

  async function addMember (workspaceId: number, projectId: number, payload: AddProjectMemberPayload) {
    const member = await projectsApi.addProjectMember(workspaceId, projectId, payload)
    members.value.push(member)
    return member
  }

  async function removeMember (workspaceId: number, projectId: number, memberId: number) {
    await projectsApi.removeProjectMember(workspaceId, projectId, memberId)
    members.value = members.value.filter(m => m.id !== memberId)
  }

  return {
    projects,
    current,
    members,
    loading,
    fetchProjects,
    createProject,
    fetchProject,
    updateProject,
    deleteProject,
    fetchMembers,
    addMember,
    removeMember,
  }
})
