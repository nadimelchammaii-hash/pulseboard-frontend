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
    fetchUser,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
  }
})
