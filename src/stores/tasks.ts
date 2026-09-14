import type {
  CreateTaskPayload,
  MoveTaskPayload,
  Task,
  TaskComment,
  UpdateTaskPayload,
} from '@/api/tasks'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as tasksApi from '@/api/tasks'

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const current = ref<Task | null>(null)
  const comments = ref<TaskComment[]>([])
  const loading = ref(false)

  async function fetchTasks (workspaceId: number, projectId: number) {
    loading.value = true
    try {
      tasks.value = await tasksApi.listTasks(workspaceId, projectId)
    } finally {
      loading.value = false
    }
  }

  async function createTask (workspaceId: number, projectId: number, payload: CreateTaskPayload) {
    const task = await tasksApi.createTask(workspaceId, projectId, payload)
    tasks.value.push(task)
    return task
  }

  async function fetchTask (workspaceId: number, projectId: number, taskId: number) {
    current.value = await tasksApi.getTask(workspaceId, projectId, taskId)
    return current.value
  }

  async function updateTask (workspaceId: number, projectId: number, taskId: number, payload: UpdateTaskPayload) {
    const task = await tasksApi.updateTask(workspaceId, projectId, taskId, payload)
    current.value = task
    tasks.value = tasks.value.map(t => t.id === task.id ? task : t)
    return task
  }

  async function moveTask (workspaceId: number, projectId: number, taskId: number, payload: MoveTaskPayload) {
    const task = await tasksApi.moveTask(workspaceId, projectId, taskId, payload)
    tasks.value = tasks.value.map(t => t.id === task.id ? task : t)
    return task
  }

  async function deleteTask (workspaceId: number, projectId: number, taskId: number) {
    await tasksApi.deleteTask(workspaceId, projectId, taskId)
    tasks.value = tasks.value.filter(t => t.id !== taskId)
    if (current.value?.id === taskId) {
      current.value = null
    }
  }

  async function fetchComments (workspaceId: number, projectId: number, taskId: number) {
    comments.value = await tasksApi.listComments(workspaceId, projectId, taskId)
  }

  async function addComment (workspaceId: number, projectId: number, taskId: number, body: string) {
    const comment = await tasksApi.addComment(workspaceId, projectId, taskId, body)
    comments.value.push(comment)
    return comment
  }

  async function removeComment (workspaceId: number, projectId: number, taskId: number, commentId: number) {
    await tasksApi.deleteComment(workspaceId, projectId, taskId, commentId)
    comments.value = comments.value.filter(c => c.id !== commentId)
  }

  return {
    tasks,
    current,
    comments,
    loading,
    fetchTasks,
    createTask,
    fetchTask,
    updateTask,
    moveTask,
    deleteTask,
    fetchComments,
    addComment,
    removeComment,
  }
})
