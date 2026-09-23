import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import client from '@/api/client'

declare global {
  interface Window {
    Pusher: typeof Pusher
  }
}

window.Pusher = Pusher

interface AuthorizerChannel {
  name: string
}

interface ChannelAuthorizationData {
  auth: string
  channel_data?: string
  shared_secret?: string
}

type ChannelAuthorizationCallback = (error: Error | null, authData: ChannelAuthorizationData | null) => void

const echo = new Echo({
  broadcaster: 'reverb',
  key: import.meta.env.VITE_REVERB_APP_KEY,
  wsHost: import.meta.env.VITE_REVERB_HOST,
  wsPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
  wssPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
  forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
  enabledTransports: ['ws', 'wss'],
  authorizer: (channel: AuthorizerChannel) => ({
    authorize (socketId: string, callback: ChannelAuthorizationCallback) {
      client
        .post<ChannelAuthorizationData>('/api/v1/broadcasting/auth', { socket_id: socketId, channel_name: channel.name })
        .then(response => callback(null, response.data))
        .catch((error: Error) => callback(error, null))
    },
  }),
})

export default echo
