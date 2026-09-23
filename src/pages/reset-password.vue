<template>
  <AuthShell label="Recovery">
    <template #title>
      Set a new password
    </template>

    <template #subtitle>
      Choose a new password for your PulseBoard account.
    </template>

    <v-alert
      v-if="!token || !email"
      class="mb-4"
      color="error"
      density="comfortable"
      icon="mdi-alert-circle-outline"
      variant="tonal"
    >
      <div class="font-weight-medium mb-1">Invalid reset link</div>

      <div class="text-body-2">
        This password reset link is missing or malformed. Request a new one below.
      </div>
    </v-alert>

    <template v-else>
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
        v-if="reset"
        class="mb-4"
        color="tertiary"
        density="comfortable"
        icon="mdi-check-circle-outline"
        variant="tonal"
      >
        <div class="font-weight-medium mb-1">Password updated</div>

        <div class="text-body-2">
          Your password has been reset. You can now sign in with your new password.
        </div>
      </v-alert>

      <v-form v-else @submit.prevent="submit">
        <v-text-field
          v-model="password"
          :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
          autocomplete="new-password"
          :error-messages="fieldErrors.password"
          label="New password"
          prepend-inner-icon="mdi-lock-outline"
          :rules="[rules.required, rules.minLength]"
          :type="showPassword ? 'text' : 'password'"
          @click:append-inner="showPassword = !showPassword"
        />

        <div v-if="password" class="d-flex ga-1 mb-4 mt-n2">
          <div
            v-for="segment in 4"
            :key="segment"
            class="auth-strength-segment"
            :class="{ 'auth-strength-segment--filled': segment <= passwordStrength }"
          />
        </div>

        <v-text-field
          v-model="passwordConfirmation"
          autocomplete="new-password"
          class="mb-4"
          label="Confirm new password"
          :rules="[rules.required, rules.matchesPassword]"
          :type="showPassword ? 'text' : 'password'"
        />

        <v-btn
          block
          color="primary"
          :loading="submitting"
          size="large"
          type="submit"
        >
          Reset password
          <v-icon end icon="mdi-arrow-right" />
        </v-btn>
      </v-form>
    </template>

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
  import { computed, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import { resetPassword } from '@/api/auth'
  import AuthShell from '@/components/auth/AuthShell.vue'

  const route = useRoute()

  const token = computed(() => String(route.query.token ?? ''))
  const email = computed(() => String(route.query.email ?? ''))

  const password = ref('')
  const passwordConfirmation = ref('')
  const showPassword = ref(false)
  const submitting = ref(false)
  const reset = ref(false)
  const formError = ref('')
  const fieldErrors = ref<Record<string, string[]>>({})

  const rules = {
    required: (v: string) => !!v || 'Required',
    minLength: (v: string) => v.length >= 8 || 'At least 8 characters',
    matchesPassword: (v: string) => v === password.value || 'Passwords do not match',
  }

  const passwordStrength = computed(() => {
    const value = password.value
    let score = 0
    if (value.length >= 8) score++
    if (/\d/.test(value)) score++
    if (/[A-Z]/.test(value)) score++
    if (/[^A-Z0-9]/i.test(value)) score++
    return score
  })

  async function submit () {
    formError.value = ''
    fieldErrors.value = {}
    submitting.value = true

    try {
      await resetPassword({
        token: token.value,
        email: email.value,
        password: password.value,
        password_confirmation: passwordConfirmation.value,
      })
      reset.value = true
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

<style scoped>
.auth-strength-segment {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: rgb(var(--v-theme-surface-variant));
}

.auth-strength-segment--filled {
  background: rgb(var(--v-theme-tertiary));
}
</style>
