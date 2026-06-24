---
name: LiftLog Design System
description: Tactile, high-glanceability dark design system for focused gym-goers.
colors:
  primary: "#00E5FF"
  secondary: "#C3F400"
  neutral-bg: "#0F0F10"
  neutral-surface: "#1A1A1C"
  neutral-surface-container: "#252527"
  border: "#2C2C2E"
  text-primary: "#F1F5F9"
  text-secondary: "#94A3B8"
  danger: "#ffb4ab"
  warn: "#FFC107"
  success: "#C3F400"
typography:
  display:
    fontFamily: "Hanken Grotesk, sans-serif"
    fontWeight: 800
    lineHeight: 1.2
  body:
    fontFamily: "Inter, sans-serif"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "JetBrains Mono, monospace"
    fontWeight: 600
    lineHeight: 1
rounded:
  sm: "4px"
  md: "8px"
  lg: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  xxl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#000000"
    rounded: "{rounded.md}"
    padding: "10px 18px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.md}"
    padding: "10px 18px"
  card:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "20px"
---

# Design System: LiftLog

## 1. Overview

**Creative North Star: "The High-Performance Cockpit"**

LiftLog uses a tactile, high-glanceability, high-contrast dark theme optimized for active gym-goers. The design serves the immediate task of logging workout sets and tracking progress. Every detail is structured to minimize distraction and maximize legibility under bright overhead gym lights or when the device is resting on the floor. 

The aesthetic rejects generic SaaS light modes, warm cream or beige gradients, and heavy glassmorphism. It establishes a highly functional environment using flat surfaces, solid borders, clean fonts, and strong color signals.

**Key Characteristics:**
- **Extreme Contrast:** Near-black backgrounds combined with vibrant cyan and lime accents.
- **Glanceable Hierarchy:** Bold headers for structural grouping, with monospace values for data logs.
- **Sweat-Friendly Touch targets:** Large buttons and inputs (height ≥44px, targets ≥48px) to reduce touch error during intense activity.

## 2. Colors

The LiftLog palette is Restrained, relying on high-contrast neutrals with strategic, vibrant color sparks to focus the user's attention.

### Primary
- **Neon Ice** (#00E5FF): Used exclusively for primary buttons, progress accents, current page indicators, and active input highlights.

### Secondary
- **Acid Green** (#C3F400): Used for success indicators, logged workout days, and personal record (PR) indicators.

### Neutral
- **Deep Space** (#0F0F10): The core canvas background color.
- **Neutral Surface** (#1A1A1C): The background color for cards, panels, and drawer elements.
- **Neutral Surface 2** (#252527): The background color for input fields, tabs, and inactive controls.
- **Brake Line Border** (#2C2C2E): The solid, flat border color used to separate sections.
- **Ink Primary** (#F1F5F9): Primary reading color for headings, button labels, and logged numbers.
- **Ink Secondary** (#94A3B8): Supporting description color for guidelines, alternative exercises, and placeholder text.

### Named Rules
**The Glow Rarity Rule.** Neon Ice is reserved for primary actions, current states, and focus states. It must never cover more than 10% of any screen surface. Let its rarity guide the eye.
**The State Clarity Rule.** Acid Green (success) and Coral Pink (danger) must represent functional application state (e.g. workout logged, day checked, element removed) and never be used decoratively.

## 3. Typography

**Display Font:** Hanken Grotesk (sans-serif)
**Body Font:** Inter (sans-serif)
**Label/Mono Font:** JetBrains Mono (monospace)

The system pairs a heavy geometric display font for headings with a highly legible sans-serif for UI labels and description text, utilizing a monospace font for numeric values to keep data columns aligned.

### Hierarchy
- **Display** (800, 20px - 26px, 1.2): Used for primary headers and section grouping.
- **Headline** (700, 16px - 18px, 1.3): Used for exercise card names and calendar titles.
- **Title** (600, 14px - 15px, 1.4): Used for sidebar menu headings and modal titles.
- **Body** (400, 13px - 14px, 1.5): Used for general instructions, alternative lists, and descriptors.
- **Label** (600, 11px - 12px, 1.0, uppercase / tracked): Used for category eyebrows, column headers, and data metrics.

### Named Rules
**The Monospace Data Rule.** Every logged weight, rep count, streak number, and calendar date must render in `JetBrains Mono` to prevent layout shift and maintain rigid vertical alignment.

## 4. Elevation

LiftLog employs a hybrid elevation model. Surfaces are flat at rest, relying on tonal steps and solid border outlines to separate layers. Ambient depth is reserved strictly for active feedback states.

### Named Rules
**The Flat-By-Default Rule.** Layout elements rest completely flat on the canvas background. Drop shadows are forbidden on idle cards, header bars, and drawer containers.
**The Focus Elevation Rule.** Subtle ambient shadows (`box-shadow: 0 4px 12px rgba(0,0,0,0.5)`) appear only on focus states, hover states, or active overlays (like the drawer or modal overlays).

## 5. Components

Components are built to feel tactile and instantly reactive, utilizing large touch zones.

### Buttons
- **Shape:** Softly curved corners (8px radius).
- **Primary:** Background Neon Ice (#00E5FF), text black (#000000), padding 10px 18px, height 44px.
- **Outline:** Background transparent, border 1px solid #2C2C2E, text secondary (#94A3B8), height 44px.
- **Hover / Active:** Slight opacity scaling (opacity: 0.9) and micro-transform (scale: 0.96) on click.

### Cards / Containers
- **Corner Style:** Large radius (16px radius for page cards; 8px radius for exercise cards).
- **Background:** Neutral Surface (#1A1A1C).
- **Border:** Solid separator (1px solid #2C2C2E).
- **Internal Padding:** Spaced layout (20px).

### Inputs / Fields
- **Style:** Background Neutral Surface 2 (#252527), border 1px solid #2C2C2E, radius 8px.
- **Focus:** Border shifts to Neon Ice (#00E5FF).
- **Touch Targets:** Height is fixed to 44px.

### Navigation
- **Tabs:** Flat layout, background Neutral Surface 2 (#252527) for inactive tabs, transitioning to Neon Ice (#00E5FF) with black text for the active tab.

## 6. Do's and Don'ts

### Do:
- **Do** use `JetBrains Mono` for all logging metrics (weights, reps, streaks, dates).
- **Do** ensure every interactive input or button has a touch height of at least 44px.
- **Do** restrict Neon Ice highlights to active elements only.

### Don't:
- **Don't** use purple-to-blue gradients or glassmorphic blur effects on card backgrounds.
- **Don't** use thick border stripes (left/right border > 1px) to accent alert states or cards.
- **Don't** allow body text to drop below a contrast ratio of 4.5:1 against the neutral surfaces.
