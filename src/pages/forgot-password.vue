<template>
  <AuthShell label="Recovery">
    <template #title>
      Reset your password
    </template>

    <template #subtitle>
      Enter the email address associated with your PulseBoard account and we'll send password reset instructions.
    </template>

    <v-alert
      v-if="formError"
      class="mb-4"
      color="error"
      density="compact"
      variant="tonal"
    >
      {{ formError }}
    </v-alert>

    <v-alert
      v-if="dispatched"
      class="mb-4"
      color="tertiary"
      density="comfortable"
      icon="mdi-check-circle-outline"
      variant="tonal"
    >
      <div class="font-weight-medium mb-1">Verification dispatched</div>

      <div class="text-body-2">
        If an account matches that email, password reset instructions have been sent. Check spam/junk if it doesn't arrive shortly.
      </div>
    </v-alert>

    <v-form v-else @submit.prevent="submit">
      <v-text-field
        v-model="email"
        autocomplete="email"
        class="mb-2"
        :error-messages="fieldErrors.email"
        label="Work email"
        prepend-inner-icon="mdi-email-outline"
        :rules="[rules.required, rules.email]"
        type="email"
      />

      <v-alert
        class="mb-4"
        color="secondary"
        density="compact"
        icon="mdi-information-outline"
        variant="tonal"
      >
        For security reasons, we don't disclose whether an email address is registered.
      </v-alert>

      <v-btn
        block
        color="primary"
        :loading="submitting"
        size="large"
        type="submit"
      >
        Send recovery link
        <v-icon end icon="mdi-arrow-right" />
      </v-btn>
    </v-form>

    <div class="d-flex align-center justify-center ga-1 mt-6">
      <v-icon icon="mdi-arrow-left" size="16" />

      <router-link class="text-primary font-weight-medium text-decoration-none" to="/login">
        Return to sign in
      </router-link>
    </div>
  </AuthShell>
</template>

<script lang="ts" setup>
  import { isAxiosError } from 'axios'
  import { ref } from 'vue'
  import { forgotPassword } from '@/api/auth'
  import AuthShell from '@/components/auth/AuthShell.vue'

  const email = ref('')
  const submitting = ref(false)
  const dispatched = ref(false)
  const formError = ref('')
  const fieldErrors = ref<Record<string, string[]>>({})

  const rules = {
    required: (v: string) => !!v || 'Required',
    email: (v: string) => /^\S[^\s@]*@\S[^\s.]*\.\S+$/.test(v) || 'Enter a valid email',
  }

  async function submit () {
    formError.value = ''
    fieldErrors.value = {}
    submitting.value = true

    try {
      await forgotPassword({ email: email.value })
      dispatched.value = true
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
