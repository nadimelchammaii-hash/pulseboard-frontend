<template>
  <v-app-bar
    class="px-2 px-md-6"
    color="surface"
    :elevation="0"
  >
    <v-btn
      icon="mdi-arrow-left"
      variant="text"
      @click="$router.back()"
    />

    <v-avatar
      class="ml-2 mr-3"
      color="surface-container-high"
      size="32"
    >
      <v-icon color="primary" size="18">mdi-pulse</v-icon>
    </v-avatar>

    <span class="auth-shell__brand">PulseBoard</span>

    <v-spacer />

    <span class="text-caption text-uppercase text-outline mr-3 d-none d-sm-inline">{{ label }}</span>

    <v-avatar color="primary" size="32">
      <v-icon color="on-primary" size="18">mdi-account</v-icon>
    </v-avatar>
  </v-app-bar>

  <v-container class="fill-height" fluid>
    <v-row
      align="stretch"
      class="fill-height"
      justify="center"
    >
      <v-col
        class="d-none d-md-flex flex-column justify-center pa-8 auth-shell__pitch"
        md="5"
      >
        <div class="auth-shell__eyebrow mb-4">
          <span class="auth-shell__eyebrow-dot" />
          PULSE SYNCHRONY
        </div>

        <h1 class="auth-shell__headline mb-4">
          Where high-velocity engineering teams orchestrate real-time work.
        </h1>

        <p class="text-body-1 text-on-surface-variant auth-shell__pitch-copy mb-8">
          Zero-latency board sync, workspace roles, and unified activity feeds — built for scale.
        </p>

        <div class="d-flex flex-wrap ga-4">
          <div class="d-flex align-center ga-1 text-caption text-on-surface-variant">
            <v-icon color="tertiary" size="16">mdi-shield-check-outline</v-icon>
            Secure by design
          </div>

          <div class="d-flex align-center ga-1 text-caption text-on-surface-variant">
            <v-icon color="primary" size="16">mdi-lock-outline</v-icon>
            Session-based auth
          </div>

          <div class="d-flex align-center ga-1 text-caption text-on-surface-variant">
            <v-icon color="tertiary" size="16">mdi-lightning-bolt-outline</v-icon>
            Real-time updates
          </div>
        </div>
      </v-col>

      <v-col
        class="d-flex justify-center align-center pa-4 pa-md-8"
        cols="12"
        lg="6"
        md="7"
      >
        <v-card
          class="auth-shell__card w-100"
          color="surface-container"
          :elevation="0"
          max-width="440"
        >
          <v-card-text class="pa-6 pa-sm-8">
            <div class="d-flex flex-column align-center text-center mb-6">
              <v-avatar
                class="mb-3"
                color="surface-container-high"
                size="56"
              >
                <v-icon color="primary" size="28">mdi-pulse</v-icon>
              </v-avatar>

              <h2 class="auth-shell__title mb-1">
                <slot name="title" />
              </h2>

              <p class="text-body-2 text-on-surface-variant">
                <slot name="subtitle" />
              </p>
            </div>

            <slot />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
  defineProps<{
    label: string
  }>()
</script>

<style scoped>
.auth-shell__brand {
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 1.05rem;
  letter-spacing: -0.01em;
}

.auth-shell__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  align-self: flex-start;
  padding: 0.25rem 0.625rem;
  border-radius: 0.5rem;
  background: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.04em;
}

.auth-shell__eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgb(var(--v-theme-primary));
}

.auth-shell__headline {
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 2rem;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.auth-shell__pitch-copy {
  max-width: 28rem;
}

.auth-shell__title {
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 1.5rem;
  letter-spacing: -0.015em;
}
</style>
