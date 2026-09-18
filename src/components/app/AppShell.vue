<template>
  <v-navigation-drawer color="surface-container-lowest" :elevation="0" permanent width="256">
    <router-link class="app-shell__brand d-flex align-center ga-2 pa-4 text-decoration-none" to="/">
      <v-avatar color="surface-container-high" size="32">
        <v-icon color="primary" size="18">mdi-pulse</v-icon>
      </v-avatar>

      <span class="app-shell__brand-name">PulseBoard</span>
    </router-link>

    <div v-if="workspaceName" class="px-4 pb-2">
      <router-link class="app-shell__workspace d-flex align-center justify-space-between text-decoration-none pa-2 rounded-lg" to="/">
        <div class="d-flex align-center ga-2 text-truncate">
          <span class="app-shell__dot" />
          <span class="text-body-2 font-weight-medium text-on-surface text-truncate">{{ workspaceName }}</span>
        </div>

        <v-icon color="on-surface-variant" size="16">mdi-chevron-down</v-icon>
      </router-link>
    </div>

    <v-list class="px-2" density="compact" nav>
      <v-list-subheader class="text-uppercase">Workspace</v-list-subheader>

      <v-list-item prepend-icon="mdi-view-grid-outline" rounded="xl" title="Workspaces" to="/" />

      <v-list-item prepend-icon="mdi-bell-outline" rounded="xl" title="Notifications" :to="{ name: 'notifications' }" />

      <template v-if="workspaceId">
        <v-list-item
          prepend-icon="mdi-account-group-outline"
          rounded="xl"
          title="Members"
          :to="{ name: 'workspace-members', params: { workspaceId } }"
        />

        <v-list-item
          prepend-icon="mdi-view-column-outline"
          rounded="xl"
          title="Projects / Boards"
          :to="{ name: 'workspace-projects', params: { workspaceId } }"
        />

        <v-list-item
          prepend-icon="mdi-pulse"
          rounded="xl"
          title="Activity Feed"
          :to="{ name: 'workspace-activity', params: { workspaceId } }"
        />
      </template>

      <v-list-item
        v-else
        disabled
        prepend-icon="mdi-view-column-outline"
        rounded="xl"
        title="Projects / Boards"
      >
        <template #append>
          <span class="text-caption text-outline">Soon</span>
        </template>
      </v-list-item>

      <v-list-item
        v-for="item in comingSoonNav"
        :key="item.title"
        disabled
        :prepend-icon="item.icon"
        rounded="xl"
        :title="item.title"
      >
        <template #append>
          <span class="text-caption text-outline">Soon</span>
        </template>
      </v-list-item>
    </v-list>

    <template #append>
      <div class="pa-2">
        <v-menu>
          <template #activator="{ props: menuProps }">
            <v-list-item rounded="xl" v-bind="menuProps" :subtitle="authStore.user?.email" :title="authStore.user?.name">
              <template #prepend>
                <v-avatar color="primary" size="32">
                  <span class="text-caption font-weight-bold">{{ initials }}</span>
                </v-avatar>
              </template>
            </v-list-item>
          </template>

          <v-list density="compact">
            <v-list-item prepend-icon="mdi-logout" title="Log out" @click="handleLogout" />
          </v-list>
        </v-menu>
      </div>
    </template>
  </v-navigation-drawer>

  <v-app-bar color="surface" :elevation="0">
    <v-app-bar-title class="app-shell__page-title">{{ title }}</v-app-bar-title>

    <template #append>
      <v-btn icon :to="{ name: 'notifications' }" variant="text">
        <v-badge color="primary" :content="notificationStore.unreadCount" :model-value="notificationStore.unreadCount > 0">
          <v-icon>mdi-bell-outline</v-icon>
        </v-badge>
      </v-btn>
    </template>
  </v-app-bar>

  <v-container class="pa-6" fluid>
    <slot />
  </v-container>
</template>

<script lang="ts" setup>
  import { computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'
  import { useNotificationStore } from '@/stores/notifications'

  defineProps<{
    title: string
    workspaceName?: string
    workspaceId?: number
  }>()

  const router = useRouter()
  const authStore = useAuthStore()
  const notificationStore = useNotificationStore()

  onMounted(() => {
    notificationStore.fetchUnreadCount()
  })

  const initials = computed(() => {
    const name = authStore.user?.name ?? ''
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  })

  const comingSoonNav = [
    { title: 'Dashboard', icon: 'mdi-view-dashboard-outline' },
    { title: 'My Tasks', icon: 'mdi-check-circle-outline' },
    { title: 'Settings', icon: 'mdi-cog-outline' },
  ]

  async function handleLogout () {
    await authStore.logout()
    await router.push({ name: 'login' })
  }
</script>

<style scoped>
.app-shell__brand-name {
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 1.05rem;
  letter-spacing: -0.01em;
  color: rgb(var(--v-theme-on-surface));
}

.app-shell__workspace {
  background: rgb(var(--v-theme-surface-container-low));
  transition: background-color 0.15s ease;
}

.app-shell__workspace:hover {
  background: rgb(var(--v-theme-surface-container));
}

.app-shell__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgb(var(--v-theme-tertiary));
  flex-shrink: 0;
}

.app-shell__page-title {
  font-family: var(--font-heading);
  font-weight: 600;
}
</style>
