/**
 * router/index.ts
 *
 * Manual routes for ./src/pages/*.vue
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router'
import ForgotPassword from '@/pages/forgot-password.vue'
import Index from '@/pages/index.vue'
import Login from '@/pages/login.vue'
import ProjectBoard from '@/pages/project-board.vue'
import ProjectMembers from '@/pages/project-members.vue'
import Register from '@/pages/register.vue'
import ResetPassword from '@/pages/reset-password.vue'
import TaskDetail from '@/pages/task-detail.vue'
import WorkspaceActivity from '@/pages/workspace-activity.vue'
import WorkspaceMembers from '@/pages/workspace-members.vue'
import WorkspaceProjects from '@/pages/workspace-projects.vue'
import { useAuthStore } from '@/stores/auth'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    guestOnly?: boolean
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Index,
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
      meta: { guestOnly: true },
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPassword,
      meta: { guestOnly: true },
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: ResetPassword,
      meta: { guestOnly: true },
    },
    {
      path: '/workspaces/:workspaceId/members',
      name: 'workspace-members',
      component: WorkspaceMembers,
      meta: { requiresAuth: true },
    },
    {
      path: '/workspaces/:workspaceId/projects',
      name: 'workspace-projects',
      component: WorkspaceProjects,
      meta: { requiresAuth: true },
    },
    {
      path: '/workspaces/:workspaceId/activities',
      name: 'workspace-activity',
      component: WorkspaceActivity,
      meta: { requiresAuth: true },
    },
    {
      path: '/workspaces/:workspaceId/projects/:projectId/members',
      name: 'project-members',
      component: ProjectMembers,
      meta: { requiresAuth: true },
    },
    {
      path: '/workspaces/:workspaceId/projects/:projectId/board',
      name: 'project-board',
      component: ProjectBoard,
      meta: { requiresAuth: true },
    },
    {
      path: '/workspaces/:workspaceId/projects/:projectId/tasks/:taskId',
      name: 'task-detail',
      component: TaskDetail,
      meta: { requiresAuth: true },
    },
  ],
})

let authBootstrapped = false

router.beforeEach(async to => {
  const authStore = useAuthStore()

  if (!authBootstrapped) {
    authBootstrapped = true
    await authStore.fetchUser()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login' }
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { name: 'home' }
  }
})

export default router
