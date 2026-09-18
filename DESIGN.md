---
name: Warm Watercare
colors:
  surface: '#f6faff'
  surface-dim: '#d6dae0'
  surface-bright: '#f6faff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f4fa'
  surface-container: '#eaeef4'
  surface-container-high: '#e4e8ee'
  surface-container-highest: '#dee3e9'
  on-surface: '#171c20'
  on-surface-variant: '#3e4850'
  inverse-surface: '#2c3135'
  inverse-on-surface: '#edf1f7'
  outline: '#6e7881'
  outline-variant: '#bec8d2'
  surface-tint: '#006591'
  primary: '#006591'
  on-primary: '#ffffff'
  primary-container: '#0ea5e9'
  on-primary-container: '#003751'
  inverse-primary: '#89ceff'
  secondary: '#9d4300'
  on-secondary: '#ffffff'
  secondary-container: '#fd761a'
  on-secondary-container: '#5c2400'
  tertiary: '#8a5100'
  on-tertiary: '#ffffff'
  tertiary-container: '#de8712'
  on-tertiary-container: '#4d2b00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c9e6ff'
  primary-fixed-dim: '#89ceff'
  on-primary-fixed: '#001e2f'
  on-primary-fixed-variant: '#004c6e'
  secondary-fixed: '#ffdbca'
  secondary-fixed-dim: '#ffb690'
  on-secondary-fixed: '#341100'
  on-secondary-fixed-variant: '#783200'
  tertiary-fixed: '#ffdcbd'
  tertiary-fixed-dim: '#ffb86e'
  on-tertiary-fixed: '#2c1600'
  on-tertiary-fixed-variant: '#693c00'
  background: '#f6faff'
  on-background: '#171c20'
  surface-variant: '#dee3e9'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-md: 1.5rem
  gutter-lg: 2rem
  margin: 1rem
  margin-md: 1.5rem
  margin-lg: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system is crafted for a focused feline hydration tracking application, where meticulous health monitoring meets the tenderness of domestic pet care. Daily water logging is an act of affection and vigilance, especially critical for feline kidney and urinary health. The interface removes all clinical coldness, adopting a clean, warm, and gentle aesthetic that blends soft domestic warmth with clear, medical-grade clarity.

### Personality & Emotional Tenor
- **Caring & Attentive:** Soothing, gentle, and non-intrusive. It turns repetitive daily recording (measuring bowl volume, logging direct syringe drinks) into a calm, reassuring routine.
- **Trustworthy & Accurate:** Numbers, millilitre scales, timestamps, and trend lines are presented with rigorous precision and zero visual ambiguity.
- **Domestic & Organic:** Soft cream backgrounds, warm biscuit card containers, and quiet terracotta accents echo natural ceramics, wooden floorboards, and sunlit living spaces.

### Design Movement
**Soft Organic Minimalism with Tactile Comfort:** The design pairs clean modern functionalism with organic warmth. Instead of harsh hospital whites or hyper-dense spreadsheet tables, the interface uses generous breathing room, smooth pill badges, rounded ceramic-like cards, and soft ambient drop shadows that evoke physical ceramic bowls resting on a clean surface.

## Colors

The palette balances hydration clarity (crisp sky & cyan water tones) against domestic comfort (creams, warm stones, and soft terracotta).

### Color Logic
- **Primary (`#0EA5E9` / Hydration Blue):** The core active brand color representing pure water. Applied to primary actionable buttons, active navigation states, selected dates, and the trend line on graphs.
- **Secondary (`#F97316` / Warm Terracotta):** Represents the cat and pet-care dimension. Used strategically for contextual highlights, cat profile accents, bowl status alerts, and tactile interactive pills.
- **Tertiary (`#38BDF8` / Calming Cyan):** Supplementary water shimmer, applied to progress indicators, graph fill gradients, and water volume badges.
- **Neutral (`#78716C` / Warm Stone):** A stone-gray with a distinct warm undertone, replacing sterile cool grays to keep typography legible, soft, and easy on the eyes during late-night or early-morning bowl checks.

### Background & Surface Hierarchy
- **Canvas (`#FAF7F2`):** A soft, warm ivory tone evoking unbleached paper or warm linen.
- **Surface Card (`#FFFFFF`):** Crisp pure white containers floating gracefully over the ivory canvas.
- **Surface Subtle (`#F5EFEB`):** Soft beige tinted container for secondary modules, input backgrounds, or disabled states.
- **Border Gentle (`#E7DFD8`):** Low-contrast outline separating data tiles without visual noise.

## Typography

The type system blends the organic, friendly curves of **Plus Jakarta Sans** for headlines, stat callouts, and interactive controls with the clean, neutral legibility of **Inter** for descriptions, timestamps, and input values.

### Japanese & Cross-Platform Pairing
In CSS implementations, fallbacks are defined to seamlessly integrate with Japanese typography:
`font-family: 'Plus Jakarta Sans', 'Inter', 'Hiragino Sans', 'Noto Sans JP', sans-serif;`

### Numeric & Measurement Typography
Numeric values (water volume in `ml`, hours, and dates) are emphasized using tabular numbers (`font-variant-numeric: tabular-nums`) in Plus Jakarta Sans SemiBold or Bold. This guarantees that numbers within calendar grids, input stepper steppers, and time counters align vertically without jitter.

## Layout & Spacing

Hydration recording is fundamentally mobile-first, intended to be operated with one hand next to a sink or kitchen counter, yet refined when viewed on desktop and tablet dashboards.

### Layout Philosophy
- **Container Constrained:** Because this is an intimate 2-user shared household tool, dashboards and forms do not stretch into endless wide horizontal bands. The core application wrapper is clamped to a centered max-width of `640px` for recording flows and `960px` for the calendar/graph analytical dashboard.
- **Rhythm & Grid:** Built on an 8px base rhythm (`space-xs` = 4px, `space-sm` = 8px, `space-md` = 16px, `space-lg` = 24px, `space-xl` = 32px, `space-2xl` = 48px).

### Responsive Adaptation
- **Mobile (< 640px):** Single-column stack. Outer margins are `1rem` (16px), allowing maximum usable real estate for full-width numeric input pads, large tap targets, and vertical bowl status cards. Sticky bottom actions provide thumb-accessible submission.
- **Tablet & Desktop (≥ 640px):** Layout centers with `1.5rem` to `2.5rem` safe margin. Form fields for cycle operations (Start vs. End time & volume) align into balanced 2-column comparison panels.

## Elevation & Depth

Visual hierarchy uses **tonal layering** reinforced by **gentle warm ambient diffusion**. Harsh, pitch-black shadows are avoided in favor of warm stone-tinted drop shadows that simulate sunlight on clean ceramic.

### Surface Tiers
1. **Background Layer (Level 0):** Canvas background (`#FAF7F2`).
2. **Resting Container Layer (Level 1):** Main content cards, calendar day grids, and water bowl monitoring widgets (`#FFFFFF` with border `1px solid #E7DFD8` and subtle shadow `0 2px 8px -2px rgba(120, 113, 108, 0.06)`).
3. **Floating & Hover Layer (Level 2):** Elevated cards, dropdown popovers, active calendar cell highlights (`#FFFFFF` with shadow `0 8px 20px -4px rgba(120, 113, 108, 0.12)`).
4. **Modal / Action Sheet Layer (Level 3):** Bottom recording sheets on mobile and confirmation dialogs (`#FFFFFF` with shadow `0 16px 36px -6px rgba(41, 37, 36, 0.16)`).

### Atmospheric Glow
Interactive water elements (primary action buttons and active cycle indicators) utilize a very subtle tinted halo: `box-shadow: 0 4px 14px 0 rgba(14, 165, 233, 0.25)`.

## Shapes

The design system embraces a **Soft (Level 1)** geometry to reinforce clean, refined edges while maintaining tactile approachability.

### Corner Radii Guidelines
- **Base Components (Inputs, Small Badges, Chips):** `0.25rem` (4px)
- **Cards, Bowl Panels, Table Modules:** `0.5rem` (8px)
- **Modal Sheets, Alert Banners:** `0.75rem` (12px)
- **Buttons, Status Pills, Segmented Controls:** Fully pill-shaped (`9999px`) to create an inviting, human-friendly feel.

### Border Treatment
Subtle border thickness is fixed at `1px solid #E7DFD8` on white cards. Never use hard borders or stark black outlines.

## Components

### 1. Buttons
- **Primary Action (Hydration Water Action):** Pill-shaped (`rounded-full`), background `#0EA5E9`, text `#FFFFFF`, font `Plus Jakarta Sans SemiBold`. Hover state `#0284C7` with `box-shadow: 0 4px 14px rgba(14, 165, 233, 0.25)`. Height: 48px on mobile for effortless single-hand tap accuracy.
- **Secondary (Terracotta/Warm Action):** Pill-shaped, background `#FFEDD5`, text `#EA580C`, border `1px solid #FED7AA`. Ideal for supplemental recording, editing bowl definitions, or secondary actions.
- **Subtle / Ghost:** Transparent background, text `#78716C`, hover background `#F5EFEB`. Used for navigation toggles and date steppers.

### 2. Form Inputs & Number Fields
- Built specifically for quick entry of water amounts (`ml`) and times.
- Background `#FFFFFF` (or `#F5EFEB` when nested inside white cards), border `1.5px solid #E7DFD8`, text color `#292524`.
- Focused state: Border transitions to `#0EA5E9` accompanied by a `0 0 0 3px rgba(14, 165, 233, 0.15)` focus ring.
- Numeric inputs feature integrated `ml` unit suffix labels fixed at the right side in `Plus Jakarta Sans SemiBold #78716C`.

### 3. Cycle Status Cards (Water Bowl Status)
- Specialized card for each bowl. Displays bowl name (e.g., "リビング陶器皿", "寝室自動給水器").
- **When Active Cycle In Progress:** Features an ocean water badge (`bg: #E0F2FE`, `text: #0284C7`) indicating "給水中 (In Cycle)" with elapsed duration and start volume.
- **When Completed / Awaiting Start:** Features a neutral warm badge (`bg: #F5EFEB`, `text: #78716C`) indicating "空・交換待ち".
- Includes dynamic calculation previews: showing `開始容量 − 終了容量 ＝ [X] ml` in real-time as users type.

### 4. Alert & Anomaly Banner
- For handling cycle validation errors (such as `終了容量 > 開始容量`):
- Background `#FEF3C7`, border `1px solid #FDE68A`, text `#92400E`. Rounded `0.5rem` with an amber warning icon and friendly explanatory copy suggesting a typo check or accidental refill.

### 5. Hydration Calendar Cell
- Clean square or rounded-rect aspect ratio.
- Top: Small day number (`font-size: 12px`, `#78716C`).
- Center: Hydration metric display (e.g., `185 ml`). If 0 or unrecorded, a quiet dash `—` in `#A8A29E`.
- Today's date is indicated by an inner subtle ring of `#0EA5E9`.

### 6. View Switcher (Segmented Control)
- Switches between "カレンダー (Calendar)" and "グラフ (Line Chart)".
- Pill container (`bg: #F5EFEB`, padding `4px`).
- Active item slides as an elevated white pill (`bg: #FFFFFF`, shadow `0 2px 6px rgba(0,0,0,0.06)`, text `#292524`, font `Plus Jakarta Sans SemiBold`).