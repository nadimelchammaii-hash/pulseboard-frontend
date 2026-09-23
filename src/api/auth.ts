import client, { ensureCsrfCookie } from './client'

export interface User {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  created_at: string
  updated_at: string
}

interface UserResponse {
  data: User
}

interface MessageResponse {
  message: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export interface LoginPayload {
  email: string
  password: string
  remember?: boolean
}

export interface UpdateProfilePayload {
  name: string
  email: string
}

export interface UpdatePasswordPayload {
  current_password: string
  password: string
  password_confirmation: string
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  token: string
  email: string
  password: string
  password_confirmation: string
}

export async function register (payload: RegisterPayload): Promise<User> {
  await ensureCsrfCookie()
  const { data } = await client.post<UserResponse>('/api/v1/register', payload)
  return data.data
}

export async function login (payload: LoginPayload): Promise<User> {
  await ensureCsrfCookie()
  const { data } = await client.post<UserResponse>('/api/v1/login', payload)
  return data.data
}

export async function logout (): Promise<void> {
  await client.post('/api/v1/logout')
}

export async function fetchUser (): Promise<User> {
  const { data } = await client.get<UserResponse>('/api/v1/user')
  return data.data
}

export async function updateProfile (payload: UpdateProfilePayload): Promise<User> {
  const { data } = await client.put<UserResponse>('/api/v1/user/profile', payload)
  return data.data
}

export async function updatePassword (payload: UpdatePasswordPayload): Promise<void> {
  await client.put('/api/v1/user/password', payload)
}

export async function forgotPassword (payload: ForgotPasswordPayload): Promise<MessageResponse> {
  const { data } = await client.post<MessageResponse>('/api/v1/forgot-password', payload)
  return data
}

export async function resetPassword (payload: ResetPasswordPayload): Promise<MessageResponse> {
  const { data } = await client.post<MessageResponse>('/api/v1/reset-password', payload)
  return data
}
