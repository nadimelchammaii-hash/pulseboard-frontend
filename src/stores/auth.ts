import type {
  LoginPayload,
  RegisterPayload,
  UpdatePasswordPayload,
  UpdateProfilePayload,
  User,
} from '@/api/auth'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import * as authApi from '@/api/auth'

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'guest'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const status = ref<AuthStatus>('idle')

  const isAuthenticated = computed(() => status.value === 'authenticated')
  /** Signed in to a temporary "Try the demo" account. */
  const isDemo = computed(() => user.value?.is_demo === true)

  async function fetchUser () {
    status.value = 'loading'

    try {
      user.value = await authApi.fetchUser()
      status.value = 'authenticated'
    } catch {
      user.value = null
      status.value = 'guest'
    }
  }

  async function login (payload: LoginPayload) {
    user.value = await authApi.login(payload)
    status.value = 'authenticated'
  }

  async function register (payload: RegisterPayload) {
    user.value = await authApi.register(payload)
    status.value = 'authenticated'
  }

  /** Starts a demo and returns the sample board to open. */
  async function startDemo () {
    const demo = await authApi.startDemo()
    user.value = demo.user
    status.value = 'authenticated'
    return demo.landing
  }

  async function logout () {
    await authApi.logout()
    user.value = null
    status.value = 'guest'
  }

  async function updateProfile (payload: UpdateProfilePayload) {
    user.value = await authApi.updateProfile(payload)
  }

  async function updatePassword (payload: UpdatePasswordPayload) {
    await authApi.updatePassword(payload)
  }

  return {
    user,
    status,
    isAuthenticated,
    isDemo,
    fetchUser,
    login,
    register,
    startDemo,
    logout,
    updateProfile,
    updatePassword,
  }
})
