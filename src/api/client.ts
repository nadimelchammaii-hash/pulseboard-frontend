import axios, { isAxiosError } from 'axios'

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

const client = axios.create({
  baseURL,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
  },
})

export async function ensureCsrfCookie () {
  await client.get('/sanctum/csrf-cookie')
}

/**
 * The API's own message for errors that come with one written for people: a refused
 * action (403, e.g. a demo limit), too many requests (429) or a feature that is
 * temporarily unavailable (503). Anything else gets the caller's fallback.
 */
export function apiErrorMessage (error: unknown, fallback: string): string {
  if (isAxiosError(error) && [403, 429, 503].includes(error.response?.status ?? 0)) {
    const message = error.response?.data?.message
    if (typeof message === 'string' && message !== '') {
      return message
    }
  }

  return fallback
}

export default client
