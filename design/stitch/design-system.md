---
name: Pulse Precision
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#d0bcff'
  on-secondary: '#3c0091'
  secondary-container: '#571bc1'
  on-secondary-container: '#c4abff'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#00885d'
  on-tertiary-container: '#000703'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#5516be'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-hero:
    fontFamily: hankenGrotesk
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.025em
  headline-xl:
    fontFamily: hankenGrotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: hankenGrotesk
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: hankenGrotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: hankenGrotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: hankenGrotesk
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: '0'
  body-sm:
    fontFamily: inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: '0'
  body-bold:
    fontFamily: inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: '0'
  label-code:
    fontFamily: jetbrainsMono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-caps:
    fontFamily: inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.06em
  counter-sm:
    fontFamily: jetbrainsMono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: '0'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-base: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
  space-3xl: 4rem
  gutter-mobile: 0.75rem
  gutter-desktop: 1.5rem
  kanban-column-width: 300px
  sidebar-width-collapsed: 64px
  sidebar-width-expanded: 256px
---

## Brand & Style

This design system embodies high-velocity collaboration, engineering precision, and distraction-free clarity. Tailored for high-performing product, design, and engineering teams, the interface projects quiet authority and intentionality—reminiscent of bespoke desktop-class developer tools streamlined for fluid responsive web and native-feeling mobile interaction.

### Aesthetic Direction: Modern Technical Precision
The system marries deep slate/neutral architectural foundations with a luminous, refined indigo/violet core. Visual elements rely on fine hair-line borders, subtle surface luminosity shifts, razor-sharp typography, and micro-interactions rather than heavy drop shadows or ornamental chrome. The visual tone is structured, calm, and hyper-responsive:
- **Focus over Noise:** Backgrounds remain strictly neutral to let collaborative content, dynamic timelines, and active blockers command primary attention.
- **Instrument-grade Density:** Tight, legible information hierarchy designed for scanning hundreds of task nodes without cognitive fatigue.
- **Subtle Modernism:** Frosted surface layers for floating panels and contextual menus, anchored by crisp 1px borders to maintain structure in both low-light and bright working conditions.

## Colors

The palette establishes an obsidian-slate canvas balanced with optical neon/violet highlights. The design prioritizes dark mode as the canonical state to minimize eye fatigue during extended deep-work sessions, while cleanly supporting inverted high-contrast daytime needs.

### Palette Architecture
- **Primary & Accent (`#6366F1` & `#8B5CF6`):** Electric indigo grading into refined violet. Reserved for primary interactive verbs, active selection states, drag-and-drop landing boundaries, and global system focal points.
- **Canvas & Neutrals (`#0F172A` / `#020617` base):** Deep slate-tinted blacks forming tiered layers (`bg-canvas`: `#090D16`, `bg-surface`: `#0F172A`, `bg-surface-elevated`: `#1E293B`, `border-subtle`: `#334155`).
- **Semantic Status Spectrum:**
  - **Backlog / To Do:** Slate (`#94A3B8` text, `rgba(148, 163, 184, 0.12)` fill, `#475569` border)
  - **In Progress:** Indigo-Cyan dual accent (`#38BDF8` text, `rgba(56, 189, 248, 0.12)` fill, `#0284C7` border)
  - **In Review:** Orchid Purple (`#C084FC` text, `rgba(192, 132, 252, 0.12)` fill, `#9333EA` border)
  - **Done / Closed:** Vivid Emerald (`#34D399` text, `rgba(52, 211, 153, 0.12)` fill, `#059669` border)
- **Semantic Priority Engine:**
  - **Low:** Slate/Cool Gray (`#64748B`)
  - **Medium:** Cobalt Blue (`#60A5FA`)
  - **High:** Amber (`#FBBF24`)
  - **Urgent / Blocker:** Crimson Rose (`#FB7185`)

## Typography

The typographic hierarchy implements three distinct roles:
1. **Headlines (`hankenGrotesk`):** Modern, sharp, and geometric, optimized for crisp section headers, board column titles, and modal views.
2. **Body (`inter`):** Unsurpassed legibility for dense descriptions, multi-author discussions, task criteria, and inline notifications.
3. **Labels & Metadata (`jetbrainsMono`):** Monospaced precision reserved for task keys (e.g., `PULSE-1029`), branch references, commit hashes, time-tracking outputs, and keyboard shortcut indicators.

All display titles utilize tight negative letter-spacing (`-0.02em` to `-0.01em`) to create an engineered, print-like lockup. Numbers inside tables and counters always inherit tabular figures (`tnum`).

## Layout & Spacing

The layout is constructed on an uncompromising 4px/8px mathematical basegrid, ensuring vertical rhythm between list views, Kanban boards, and nested tree structures.

### Grid Models & Adaptive Behavior
- **Fluid Task Canvas:** The core workspace expands fluidly to leverage wide and ultra-wide desktop monitors, employing virtualized horizontal scrolling for Kanban boards and full-bleed tabular layouts for list engines.
- **Desktop (>= 1024px):** Dual-tier navigation consisting of a collapsible 256px contextual sidebar, sticky board toolbars (`48px` height), and infinite-feel split-pane detail trays.
- **Tablet (768px - 1023px):** Collapses the primary sidebar to an icon-only rail (`64px`), transitions Kanban boards to touch-swipable single-column views with pagination dots, and switches task detail sheets into anchored bottom drawers.
- **Mobile (< 768px):** Viewport-locked app shell with a floating frosted bottom tab bar, swipeable cards, quick-filter chips horizontally scrollable at the top, and sheet overlays for task creation and editing.

## Elevation & Depth

This system avoids heavy, muddy drop shadows. Depth is achieved via **tonal stratification**, **luminescent ghost borders**, and **subtle surface blurs**.

### Elevation Tiers
1. **Tier 0 (Backdrop Canvas):** Absolute dark base `#090D16`. Used behind boards and list views.
2. **Tier 1 (Surface / Swimlane / Column):** `#0F172A` with a 1px border of `rgba(255, 255, 255, 0.05)`.
3. **Tier 2 (Cards & Active Items):** `#1E293B` resting state.
   - Hover state: Background elevates to `#243248` with a top edge internal highlight `box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1)`.
   - Resting shadow: `0 1px 2px rgba(0, 0, 0, 0.35)`.
4. **Tier 3 (Floating Overlays / Menus / Command Palettes):** `#0F172A` with `backdrop-filter: blur(16px)`, surrounded by an accent-aware perimeter `1px solid rgba(99, 102, 241, 0.25)` and a directional glow `0 12px 32px -4px rgba(0, 0, 0, 0.6)`.
5. **Drag State Elevation:** When an item is dragged across swimlanes, it scales to `1.02`, gains an indigo highlight boundary (`#6366F1`), and casts an ambient shadow: `0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)`.

## Shapes

The design uses a restrained, architectural curvature level (`1` / Soft). This keeps the interface structured, professional, and dense without feeling sterile or aggressive.

### Corner Radii Application
- **Small Radii (4px):** Badges, status tags, monospaced metadata pills, key combo indicators, and contextual dropdown menu items.
- **Medium Radii (8px):** Task cards, interactive form fields, buttons, and segmented control buttons.
- **Large Radii (12px):** Modal dialogs, floating command bars (`CMD+K`), contextual flyouts, and mobile pull-up bottom sheets.
- **Full Pill (9999px):** User avatars and active presence ring indicators only.

## Components

### Buttons
- **Primary:** Gradient-infused solid surface (`#6366F1` to `#4F46E5`), high-contrast white text, subtle top-edge border highlight (`rgba(255, 255, 255, 0.2)`), 8px border radius. Hover adds an indigo bloom: `box-shadow: 0 0 16px rgba(99, 102, 241, 0.4)`.
- **Secondary / Ghost:** Transparent surface, 1px perimeter `rgba(255, 255, 255, 0.12)`, text `#E2E8F0`. Hover shifts background to `rgba(255, 255, 255, 0.05)`.
- **Destructive:** Soft crimson background `rgba(244, 63, 94, 0.12)`, border `rgba(244, 63, 94, 0.3)`, text `#FB7185`.

### Chips & Badges
- **Status Badges:** 4px radius, compact padding (`2px 6px`), containing a 6px circular dot indicator matching the status color followed by capitalized/semibold label text.
- **Priority Indicators:** Minimalistic icon-plus-code indicator using JetBrains Mono (e.g., `▲ URGENT`, `● MED`, `▽ LOW`) with saturated priority tint on black-slate chip fills.

### Cards (Task Nodes)
- Flat, highly organized containers with an internal 12px padding structure.
- Top row: Monospaced ID link (`PULSE-42`) in muted slate alongside assignee avatar cluster.
- Middle row: Semibold title with two-line max truncation.
- Bottom row: Fluid metadata tray featuring priority glyph, tag pills, subtask completion tally (`3/5`), and overdue date warnings in muted rose when expired.

### Input Fields & Search
- Surface: `#0B1120`, border: `1px solid #334155`.
- Focus state: Zero browser default ring; applies a crisp `1px solid #6366F1` border coupled with a soft `0 0 0 3px rgba(99, 102, 241, 0.15)` focus glow.
- Quick filters & command search feature inline keyboard hotkeys (`⌘K`, `/`) set in faint monospaced keycap shapes on the trailing side.

### Selection Controls (Checkboxes & Radios)
- Custom 16px squares with 3px border radius.
- Unchecked: `1px solid #475569`, background transparent.
- Checked: `#6366F1` fill with an ultra-crisp white SVG checkmark. Smooth 120ms ease-out scale transition on state toggle.

### Task Detail Sheet & Command Center (Product-Specific)
- **Detail Drawer:** Slides in from the right viewport boundary on desktop or pops up as a 90vh bottom drawer on mobile. Features inline editable titles, real-time collaborator presence indicators, and activity timelines with markdown rendering.
- **Command Palette:** Centered, floating modal with frosted glass backdrop, instant search indexing across tasks, documents, and workspace members.
