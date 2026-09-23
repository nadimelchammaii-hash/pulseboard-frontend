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
import echo from '@/plugins/echo'

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
    applyRealtimeTask(task)
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
    applyRealtimeComment(taskId, comment)
    return comment
  }

  async function removeComment (workspaceId: number, projectId: number, taskId: number, commentId: number) {
    await tasksApi.deleteComment(workspaceId, projectId, taskId, commentId)
    comments.value = comments.value.filter(c => c.id !== commentId)
  }

  function applyRealtimeTask (task: Task) {
    const exists = tasks.value.some(t => t.id === task.id)
    tasks.value = exists ? tasks.value.map(t => t.id === task.id ? task : t) : [...tasks.value, task]

    if (current.value?.id === task.id) {
      current.value = task
    }
  }

  function removeRealtimeTask (taskId: number) {
    tasks.value = tasks.value.filter(t => t.id !== taskId)
    if (current.value?.id === taskId) {
      current.value = null
    }
  }

  function applyRealtimeComment (taskId: number, comment: TaskComment) {
    // The REST response and the broadcast echo can both deliver the same comment
    // (the broadcast fires synchronously and may beat the HTTP response back to
    // the sender's own browser), so treat this as an idempotent upsert.
    const alreadySeen = current.value?.id === taskId && comments.value.some(c => c.id === comment.id)
    if (alreadySeen) {
      return
    }

    tasks.value = tasks.value.map(t => t.id === taskId && t.comments_count !== null
      ? { ...t, comments_count: t.comments_count + 1 }
      : t)

    if (current.value?.id === taskId) {
      comments.value = [...comments.value, comment]
    }
  }

  function subscribeToProjectChannel (projectId: number) {
    echo.private(`project.${projectId}`)
      .listen('.task.created', (event: { task: Task }) => applyRealtimeTask(event.task))
      .listen('.task.moved', (event: { task: Task }) => applyRealtimeTask(event.task))
      .listen('.task.assignee_changed', (event: { task: Task }) => applyRealtimeTask(event.task))
      .listen('.task.deleted', (event: { task_id: number }) => removeRealtimeTask(event.task_id))
      .listen('.task_comment.added', (event: { task_id: number, comment: TaskComment }) => applyRealtimeComment(event.task_id, event.comment))

    return () => echo.leave(`project.${projectId}`)
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
    subscribeToProjectChannel,
  }
})
