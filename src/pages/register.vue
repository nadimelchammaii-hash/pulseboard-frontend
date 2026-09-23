<template>
  <AuthShell label="Register">
    <template #title>
      Create your account
    </template>

    <template #subtitle>
      Start collaborating on projects with your team in seconds.
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

    <v-form @submit.prevent="submit">
      <v-text-field
        v-model="name"
        autocomplete="name"
        class="mb-3"
        :error-messages="fieldErrors.name"
        label="Full name"
        prepend-inner-icon="mdi-account-outline"
        :rules="[rules.required]"
      />

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
        autocomplete="new-password"
        :error-messages="fieldErrors.password"
        label="Password"
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
        class="mb-3"
        label="Confirm password"
        :rules="[rules.required, rules.matchesPassword]"
        :type="showPassword ? 'text' : 'password'"
      />

      <v-checkbox
        v-model="acceptedTerms"
        class="mb-2"
        density="compact"
        hide-details
        :rules="[rules.required]"
      >
        <template #label>
          <span class="text-body-2 text-on-surface-variant">I agree to the Terms of Service and Privacy Policy.</span>
        </template>
      </v-checkbox>

      <v-btn
        block
        class="mt-2"
        color="primary"
        :disabled="!acceptedTerms"
        :loading="submitting"
        size="large"
        type="submit"
      >
        Create free account
        <v-icon end icon="mdi-arrow-right" />
      </v-btn>
    </v-form>

    <div class="d-flex align-center justify-center ga-1 mt-6">
      <span class="text-body-2 text-on-surface-variant">Already have an account?</span>

      <router-link class="text-primary font-weight-medium text-decoration-none" to="/login">
        Sign in
      </router-link>
    </div>
  </AuthShell>
</template>

<script lang="ts" setup>
  import { isAxiosError } from 'axios'
  import { computed, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import AuthShell from '@/components/auth/AuthShell.vue'
  import { useAuthStore } from '@/stores/auth'

  const router = useRouter()
  const authStore = useAuthStore()

  const name = ref('')
  const email = ref('')
  const password = ref('')
  const passwordConfirmation = ref('')
  const acceptedTerms = ref(false)
  const showPassword = ref(false)
  const submitting = ref(false)
  const formError = ref('')
  const fieldErrors = ref<Record<string, string[]>>({})

  const rules = {
    required: (v: unknown) => !!v || 'Required',
    email: (v: string) => /.[^\n\r@\u2028\u2029]*@.+\..+/.test(v) || 'Enter a valid email',
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
      await authStore.register({
        name: name.value,
        email: email.value,
        password: password.value,
        password_confirmation: passwordConfirmation.value,
      })
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
