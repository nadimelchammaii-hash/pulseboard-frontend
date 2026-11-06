<template>
  <AuthShell label="Login">
    <template #title>
      Welcome back
    </template>

    <template #subtitle>
      Sign in to access your workspaces, boards, and team activity.
    </template>

    <!-- Try the demo: the first thing a visitor sees, above the sign-in form. -->
    <v-alert
      v-if="demoError"
      class="mb-4"
      color="error"
      density="compact"
      role="alert"
      variant="tonal"
    >
      {{ demoError }}
    </v-alert>

    <v-btn
      block
      color="primary"
      :loading="startingDemo"
      prepend-icon="mdi-play-circle-outline"
      size="large"
      variant="outlined"
      @click="tryDemo"
    >
      Try the demo
    </v-btn>

    <p class="mt-2 text-center text-caption text-on-surface-variant">
      No sign-up needed: a private demo with sample data, deleted after 24 hours.
    </p>

    <div class="d-flex align-center ga-3 my-5" role="presentation">
      <v-divider />
      <span class="text-caption text-on-surface-variant text-no-wrap">or sign in</span>
      <v-divider />
    </div>

    <v-alert
      v-if="formError"
      class="mb-4"
      color="error"
      density="compact"
      variant="tonal"
    >
      {{ formError }}
    </v-alert>

    <v-form @submit.prevent="submit">
      <v-text-field
        v-model="email"
        autocomplete="email"
        class="mb-3"
        :error-messages="fieldErrors.email"
        label="Work email"
        prepend-inner-icon="mdi-email-outline"
        :rules="[rules.required, rules.email]"
        type="email"
      />

      <v-text-field
        v-model="password"
        :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
        autocomplete="current-password"
        :error-messages="fieldErrors.password"
        label="Password"
        prepend-inner-icon="mdi-lock-outline"
        :rules="[rules.required]"
        :type="showPassword ? 'text' : 'password'"
        @click:append-inner="showPassword = !showPassword"
      />

      <div class="d-flex align-center justify-space-between mt-1 mb-4">
        <v-checkbox
          v-model="remember"
          density="compact"
          hide-details
          label="Remember me"
        />

        <router-link class="text-caption text-primary text-decoration-none" to="/forgot-password">
          Forgot password?
        </router-link>
      </div>

      <v-btn
        block
        color="primary"
        :loading="submitting"
        size="large"
        type="submit"
      >
        Sign in to PulseBoard
        <v-icon end icon="mdi-arrow-right" />
      </v-btn>
    </v-form>

    <div class="d-flex align-center justify-center ga-1 mt-6">
      <span class="text-body-2 text-on-surface-variant">Don't have an account?</span>

      <router-link class="text-primary font-weight-medium text-decoration-none" to="/register">
        Sign up
      </router-link>
    </div>
  </AuthShell>
</template>

<script lang="ts" setup>
  import { isAxiosError } from 'axios'
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { apiErrorMessage } from '@/api/client'
  import AuthShell from '@/components/auth/AuthShell.vue'
  import { useAuthStore } from '@/stores/auth'

  const router = useRouter()
  const authStore = useAuthStore()

  const startingDemo = ref(false)
  const demoError = ref('')

  async function tryDemo () {
    if (startingDemo.value) return
    startingDemo.value = true
    demoError.value = ''

    try {
      await authStore.startDemo()
      await router.push({ name: 'home' })
    } catch (error) {
      // The API's limit messages (too many demos, demo switched off) are written for the visitor.
      demoError.value = apiErrorMessage(error, 'Could not start the demo. Please try again.')
    } finally {
      startingDemo.value = false
    }
  }

  const email = ref('')
  const password = ref('')
  const remember = ref(false)
  const showPassword = ref(false)
  const submitting = ref(false)
  const formError = ref('')
  const fieldErrors = ref<Record<string, string[]>>({})

  const rules = {
    required: (v: string) => !!v || 'Required',
    email: (v: string) => /.[^\n\r@\u2028\u2029]*@.+\..+/.test(v) || 'Enter a valid email',
  }

  async function submit () {
    formError.value = ''
    fieldErrors.value = {}
    submitting.value = true

    try {
      await authStore.login({ email: email.value, password: password.value, remember: remember.value })
      await router.push({ name: 'home' })
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 422) {
        fieldErrors.value = error.response.data.errors ?? {}
      } else {
        formError.value = 'Something went wrong. Please try again.'
      }
    } finally {
      submitting.value = false
    }
  }
</script>
