/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com
 *
 * Theme colors are the "Pulse Precision" design system exported from Stitch
 * (design/stitch/design-system.md) — dark mode is the only theme designed
 * so far, so it is also the only one and the default.
 */

import type { ThemeDefinition } from 'vuetify'
import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

const pulsePrecision: ThemeDefinition = {
  dark: true,
  colors: {
    'background': '#0b1326',
    'on-background': '#dae2fd',

    'surface': '#0b1326',
    'on-surface': '#dae2fd',
    'surface-dim': '#0b1326',
    'surface-bright': '#31394d',
    'surface-variant': '#2d3449',
    'on-surface-variant': '#c7c4d7',
    'surface-container-lowest': '#060e20',
    'surface-container-low': '#131b2e',
    'surface-container': '#171f33',
    'surface-container-high': '#222a3d',
    'surface-container-highest': '#2d3449',

    'inverse-surface': '#dae2fd',
    'inverse-on-surface': '#283044',

    'outline': '#908fa0',
    'outline-variant': '#464554',

    'primary': '#c0c1ff',
    'on-primary': '#1000a9',
    'primary-container': '#8083ff',
    'on-primary-container': '#0d0096',
    'primary-fixed': '#e1e0ff',
    'primary-fixed-dim': '#c0c1ff',
    'on-primary-fixed': '#07006c',
    'on-primary-fixed-variant': '#2f2ebe',
    'inverse-primary': '#494bd6',

    'secondary': '#d0bcff',
    'on-secondary': '#3c0091',
    'secondary-container': '#571bc1',
    'on-secondary-container': '#c4abff',
    'secondary-fixed': '#e9ddff',
    'secondary-fixed-dim': '#d0bcff',
    'on-secondary-fixed': '#23005c',
    'on-secondary-fixed-variant': '#5516be',

    'tertiary': '#4edea3',
    'on-tertiary': '#003824',
    'tertiary-container': '#00885d',
    'on-tertiary-container': '#000703',
    'tertiary-fixed': '#6ffbbe',
    'tertiary-fixed-dim': '#4edea3',
    'on-tertiary-fixed': '#002113',
    'on-tertiary-fixed-variant': '#005236',

    'error': '#ffb4ab',
    'on-error': '#690005',
    'error-container': '#93000a',
    'on-error-container': '#ffdad6',

    'info': '#38bdf8',
    'on-info': '#0b1326',
    'success': '#34d399',
    'on-success': '#0b1326',
    'warning': '#fbbf24',
    'on-warning': '#0b1326',

    // Kanban status/priority accents, for the board phase (design-system.md
    // "Semantic Status Spectrum" / "Semantic Priority Engine")
    'status-todo': '#94a3b8',
    'status-in-progress': '#38bdf8',
    'status-review': '#c084fc',
    'status-done': '#34d399',
    'priority-low': '#64748b',
    'priority-medium': '#60a5fa',
    'priority-high': '#fbbf24',
    'priority-urgent': '#fb7185',
  },
}

export default createVuetify({
  theme: {
    defaultTheme: 'pulsePrecision',
    themes: {
      pulsePrecision,
    },
  },
  display: {
    mobileBreakpoint: 'md',
    thresholds: {
      xs: 0,
      sm: 600,
      md: 840,
      lg: 1145,
      xl: 1545,
      xxl: 2138,
    },
  },
  defaults: {
    VBtn: {
      rounded: 'lg',
    },
    VTextField: {
      variant: 'solo-filled',
      flat: true,
      rounded: 'lg',
    },
    VCard: {
      rounded: 'xl',
    },
  },
})
