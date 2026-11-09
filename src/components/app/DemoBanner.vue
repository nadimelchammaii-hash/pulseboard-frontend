<template>
  <!--
    Shown at the top of every in-app page while signed in to a "Try the demo"
    account. No Stitch screen exists for it: it reuses the tonal alert style of
    the other pages.
  -->
  <v-alert
    color="secondary"
    density="comfortable"
    icon="mdi-play-circle-outline"
    variant="tonal"
  >
    <div class="d-flex flex-column flex-md-row align-md-center justify-space-between ga-3">
      <div>
        <div class="font-weight-medium mb-1">You are exploring the PulseBoard demo</div>

        <div class="text-body-2">
          Everything here is private to you and deleted after 24 hours<span v-if="endsAt"> (on {{ endsAt }})</span>.
          Maya, Sam and Priya are fictional teammates; inviting people and changing account details are turned off.
        </div>
      </div>

      <v-btn
        class="flex-shrink-0"
        color="secondary"
        :loading="leaving"
        variant="flat"
        @click="createAccount"
      >
        Create your own account
      </v-btn>
    </div>
  </v-alert>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'

  const authStore = useAuthStore()
  const router = useRouter()
  const leaving = ref(false)

  const endsAt = computed(() => {
    const iso = authStore.user?.demo_expires_at
    return iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : null
  })

  /** Ends the demo (a demo account cannot be signed in to again) and opens registration. */
  async function createAccount () {
    leaving.value = true
    try {
      await authStore.logout()
    } finally {
      leaving.value = false
    }
    await router.push({ name: 'register' })
  }
</script>
