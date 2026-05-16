# Hero — Editorial Minimal Refactor

**Date:** 2026-05-16
**Status:** Approved
**Scope:** `src/components/static/Hero.astro`, `src/styles/global.css` (hero-scoped rules only)

## Intent

The name is the visual. Strip every colored light, glow, and animation that competes with the headline. Portrait stays but quietly. One accent moment survives: the "available for select work" status pulse and the rotating `FocusChip`. Everything else is type.

## Removals

In `src/components/static/Hero.astro`:

- `<div class="hero-atmosphere">` and all its children (4 blob spans + starfield).
- Build-time `STAR_COUNT`, `PALETTE`, `stars` array.
- `<div data-edition-stamp>` block (Edition stamp).
- `<div class="portrait-halo">` and `<div class="portrait-spotlight">`.
- `.hero-role` shine gradient + `hero-role-shine` keyframes + dark override.
- `.hero-name-dot` markup change: remove the `<span class="hero-name-dot">.</span>` entirely so the headline ends with a plain `.` glyph after the last name, in the foreground color.
- `.portrait-img` `portrait-float` animation + keyframes.
- All `hero-star*` scoped CSS, `portrait-halo`, `portrait-spotlight` scoped CSS and their keyframes.

In `src/styles/global.css`:

- `.hero-atmosphere`, `.hero-blob`, `.hero-blob--*`, `.dark .hero-blob`, `hero-drift-*` keyframes.
- `.hero-atmosphere::after` + dark variant.
- `.hero-name-dot` definition + animated gradient + dark variant.
- Any `prefers-reduced-motion` references that target the now-deleted classes.

## What stays

- Name, role, tagline, two CTAs, three social icons, scroll cue.
- "Available for select work" status pill **with** its pulsing accent dot.
- Eyebrow line `— Portfolio / 001`.
- Rotating `FocusChip` **unchanged** (kept as the one moment of color/motion).
- Portrait photo with its rounded-bottom mask.
- `hero-rise` staggered entrance (one-shot on load — not a continuous loop).

## Sizing

| Element  | Before                                    | After                                          |
|----------|-------------------------------------------|------------------------------------------------|
| Headline | `clamp(44px, min(12.5vw, 15vh), 188px)`   | `clamp(64px, min(18vw, 19vh), 260px)`          |
| Headline tracking | `-0.05em`                        | `-0.055em`                                     |
| Headline leading  | `0.92`                           | `0.88`                                         |
| Headline max-width| `14ch`                           | `16ch`                                         |
| Role     | `clamp(20px, min(3vw, 3.6vh), 36px)`      | `clamp(24px, min(3.4vw, 4.2vh), 44px)`         |
| Tagline  | `clamp(14.5px, 1.85vh, 18px)`             | `clamp(15.5px, 2vh, 20px)`, line-height `1.6` |
| Portrait column | `lg: max-w-[320px]`                | `lg: max-w-[280px]`                            |

Eyebrow + status pill keep current sizes — they should feel small against the larger name.

## Portrait treatment

Replace `portrait-halo` + `portrait-spotlight` with one static element rendered behind the photo:

- Single circular radial gradient, ~110% of photo size, centered.
- Light: `radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--color-fg) 8%, transparent) 0%, transparent 70%)`.
- Dark: `radial-gradient(circle at 50% 50%, color-mix(in srgb, white 10%, transparent) 0%, transparent 70%)`.
- `filter: blur(60px)`. No animation. No `mix-blend-mode`.

## Role-line color

Static `color: var(--color-fg-muted)`. No gradient, no `background-clip: text`, no animation. Dark variant inherits.

## Reduced-motion

After removals, the only motion left in the hero is:
- `hero-rise` entrance (already gated for `prefers-reduced-motion`).
- `scroll-cue-line` pulse (already gated).
- Status pill's `animate-ping` (Tailwind built-in, browser-respected).
- `FocusChip` rotation (component handles its own gating).

No new reduced-motion rules needed; deleted rules go with their selectors.

## Mobile (≤768px) cleanup

The current `@media (max-width: 768px)` block in `Hero.astro` disables blobs, stars, halo, spotlight, role shine, and name-dot animations. After this refactor, all those selectors no longer exist — the entire mobile block can be removed.

## Files

- `src/components/static/Hero.astro` — markup + scoped styles.
- `src/styles/global.css` — global hero-scoped rules.
- `src/components/islands/FocusChip.tsx` — **untouched**.

## Out of scope

- Any change to `Masthead.astro`, navigation, or downstream sections.
- Light/dark token changes.
- Typography or font swaps.
