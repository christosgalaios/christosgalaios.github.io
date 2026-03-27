# Portfolio Polish — Full Playground Edition

**Date:** 2026-03-27
**Status:** Spec — approved, ready for implementation plan
**Repo:** `christosgalaios/christosgalaios.github.io`
**Approach:** Elevate the portfolio from "impressive project showcase" to "interactive playground that rewards curiosity." Every scroll, hover, and click should feel alive.

---

## 1. Visual Effects

### 1.1 Matrix Rain Hero (replaces particle canvas)

**Replaces:** Current `#hero-particles` canvas (green dots + connecting lines)

**Background — Raining Letters:**
- Canvas-based, full viewport behind hero content
- Characters: A-Z, 0-9, common symbols, falling top-to-bottom
- Most characters: subtle grey (`rgba(255,255,255,0.05)`), small
- ~5% "active" characters at any moment: brighter, larger, bold, glowing green (`var(--accent)`), pulse effect
- Columns of characters at varying speeds (30-80px/s), staggered start positions
- Seamless loop — characters reset to top when they exit bottom
- Adapted from 21st.dev `uniquesonu/modern-animated-hero-section` React component → vanilla JS canvas
- `prefers-reduced-motion`: static snapshot, no animation
- Light theme: invert to dark characters on light background

**Text Scramble on Hero Name:**
- Replaces blur-reveal on `.hero-name` ("CHRISTOS GALAIOS")
- Animation: each letter position rapidly cycles through random characters (A-Z, symbols) for 800ms before settling on the correct letter
- Letters settle left-to-right with 50ms stagger per character
- Total duration: ~1.5s for full name to resolve
- `Fira Code` font during scramble phase for monospace alignment, transitions to `Archivo` once settled
- Tagline and description keep existing blur-reveal (contrast between scramble hero and smooth sub-text)

### 1.2 Scroll Progress Bar

- `position: fixed`, `top: 0`, `left: 0`, `height: 3px`, `z-index: 100`
- Width = `(scrollY / (scrollHeight - innerHeight)) * 100%`
- Background: `linear-gradient(90deg, var(--accent-secondary), var(--accent))`
- Updated via `requestAnimationFrame` on scroll (debounced, no jank)
- Fades in after scrolling past hero (`opacity: 0` when `scrollY < innerHeight`)
- `prefers-reduced-motion`: still visible, just no transition on width changes

### 1.3 Rolling Digit Number Ticker

**Replaces:** Current eased-increment stat counters

**Mechanism:**
- Each digit position is a vertical strip containing 0-9 stacked
- Strip height = 10 × digit height, overflow hidden, only one digit visible
- On trigger (IntersectionObserver): `transform: translateY(-N * digitHeight)` to land on target digit
- CSS transition: `transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)` (overshoot spring)
- Rightmost digit settles first, then tens, hundreds, thousands — 150ms stagger per column
- Suffix ("+") fades in 200ms after last digit settles
- Thousands separator handled by inserting a static comma span between digit strips
- `prefers-reduced-motion`: show final values immediately

### 1.4 Spotlight Card Effect

**Adds to:** All `.project-showcase` and `.project-card` elements

- On `mousemove` over card: set CSS custom properties `--mouse-x` and `--mouse-y` (relative to card)
- CSS `::after` pseudo-element on card: `radial-gradient(300px circle at var(--mouse-x) var(--mouse-y), rgba(34,197,94,0.08), transparent 60%)`
- Fades out on `mouseleave` (transition `opacity 0.3s`)
- Layers under existing 3D tilt — both effects combine
- `pointer-events: none` on the pseudo-element
- No JS per-frame style recalc — CSS reads the custom properties

### 1.5 Magnetic CTA Buttons

**Applies to:** `.project-cta`, `.contact-link`, `#cicd-run-btn`, any primary action button

- On `mousemove` within 80px of button center: calculate offset vector, shift button up to 6px toward cursor
- `transform: translate(${dx}px, ${dy}px)` with `transition: transform 0.2s ease-out`
- On `mouseleave`: spring back to origin with `transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)` (spring overshoot)
- `will-change: transform` for GPU compositing
- Mobile: disabled (no hover)
- `prefers-reduced-motion`: disabled

---

## 2. Sound Design

### 2.1 Sound Toggle

- Speaker icon button in `.nav-right`, between theme toggle and hamburger
- **ON by default** — state persisted in `localStorage` key `"sound"`
- Icon: speaker with waves (on) / speaker with X (off)
- First interaction creates `AudioContext` (browser autoplay policy)
- Toggle plays a soft "power on/off" confirmation sound

### 2.2 Sound Inventory

All sounds are tiny base64-encoded WAV strings inlined in `main.js`. No external audio files. Generated programmatically using `AudioContext` oscillators + noise where possible.

| Trigger | Sound | Volume | Duration |
|---------|-------|--------|----------|
| Nav link click | Soft mechanical click | 0.2 | 50ms |
| Section scroll into view | Gentle low whoosh | 0.15 | 200ms |
| Stat digit settling | Soft tick | 0.15 | 30ms |
| Theme toggle | Switch flick | 0.25 | 80ms |
| Project card hover | Subtle glass tap | 0.15 | 40ms |
| Mango chat open | Short cat purr | 0.25 | 300ms |
| Mango cannon fire | Cartoon "pew" + whoosh | 0.3 | 400ms |
| Mango idle → sleep | Tiny snore | 0.2 | 500ms |
| Sprint log character | Typewriter keystroke | 0.1 | 20ms |
| Easter egg trigger | Playful discovery chime | 0.3 | 600ms |

**Global rules:**
- All sounds play through a single `AudioContext`
- Master volume: 0.3 (adjustable)
- `prefers-reduced-motion`: sound still plays (separate concern from animation)
- Sounds are generated via `OscillatorNode` + `GainNode` envelopes — no audio file downloads

---

## 3. Typewriter + Loading States

### 3.1 Sprint Log Typewriter

- Sprint simulation log entries currently appear as full strings
- Change to character-by-character at ~40ms per character
- Blinking cursor (`|`) at end of current line, `@keyframes blink` 530ms
- After line completes: 200ms pause, then next line begins
- When sound ON: soft keystroke tick per character (see sound inventory)
- `prefers-reduced-motion`: show full lines instantly (current behavior)

### 3.2 Demo Tab Loading Skeletons

- When a Hub demo tab is clicked, show skeleton for 300ms before content renders
- Skeleton: 3-4 rounded rectangles (`border-radius: 8px`, `height: 16-24px`, varying widths)
- Shimmer animation: reuse existing `shimmer` keyframe (`background-position` sweep)
- Implementation: `.skeleton-loading` class toggled by JS on the demo content container
- CSS-only skeleton shapes using `::before` and `::after` or dedicated skeleton divs
- Removed after 300ms timeout, content fades in with `opacity` transition

---

## 4. Easter Eggs

All easter eggs play the discovery chime sound when triggered (if sound is ON).

### 4.1 CG Logo × 5 Clicks → Hacker Theme (10s)

**Trigger:** Click `.nav-logo` 5 times within 2 seconds
**Detection:** Click counter with 2s reset timer (`setTimeout`)

**Effect:**
- Add `.theme-hacker` class on `<html>`
- CSS overrides: `--bg-primary: #000`, `--bg-secondary: #0a0a0a`, `--text-primary: #00ff00`, `--accent: #00ff00`, `--accent-secondary: #00cc00`
- All fonts temporarily override to `Fira Code` (monospace everything)
- Matrix rain intensifies: 2x density, 1.5x speed, brighter active characters
- Scanline overlay: repeating horizontal lines (`repeating-linear-gradient`) at 10% opacity
- After 10s: smooth 1s transition back to current theme
- Fun detail: nav links briefly show as terminal commands (`> Projects`, `> Pipeline`)

### 4.2 Footer Hover 3s → Cheeky Message + Mango Peek

**Trigger:** `mouseenter` on `.footer`, hold 3 seconds
**Detection:** `setTimeout` on `mouseenter`, `clearTimeout` on `mouseleave`

**Effect:**
- Below copyright, fade in (0.5s): *"While you're still overthinking it, someone else is scheduling my interview."*
- Styled: `Fira Code`, `var(--text-muted)`, `font-size: 0.8rem`, slight italic
- Simultaneously: Mango peeks up from below viewport edge — just head and paws visible
- `transform: translateY(100%) → translateY(30%)` on the Mango peek element
- `mouseleave`: fade out text, Mango slides back down

### 4.3 Select/Copy Hero Text → Glitch Scramble

**Trigger:** `mouseup` event on `.hero-content` when `window.getSelection().toString().length > 0`

**Effect:**
- All visible hero text (name, tagline, description) glitches for 200ms
- Glitch: each character swaps to a random symbol (from `!@#$%^&*<>{}[]`) every 30ms (6-7 swaps total)
- After 200ms: all characters snap back to original text
- Subtle screen-shake: `transform: translate(${random(-2,2)}px, ${random(-1,1)}px)` on `.hero-content` during glitch
- Static/interference sound effect if sound ON
- Only triggers once per page load (prevent annoyance on repeated selections)

### 4.4 Overscroll Past Footer → Hire-Me Message

**Trigger:** Scroll position where `scrollY + innerHeight > document.body.scrollHeight + 20` (overscroll detection) OR scroll to the absolute bottom and keep trying to scroll (wheel event at max scroll)

**Effect:**
- Hidden div below footer (initially `display: none`, `height: 0`)
- On trigger: expand to `height: auto`, fade in text:
  *"While you're still overthinking it, someone else is scheduling my interview."*
- Mango head peeks up from bottom of screen (fixed position, bottom: 0, slides up 60px)
- Mango pose: smug/cheeky (new pose or reuse "celebrate")
- Scroll back up: message fades, Mango slides back down
- Works on mobile via `touchmove` overscroll detection

### 4.5 Click Hero Canvas × 3 → Character Swarm

**Trigger:** 3 clicks on the Matrix rain canvas within 2 seconds
**Detection:** Click counter with 2s reset timer

**Effect (3 phases, 5s total):**
1. **Swarm (0-1s):** All falling characters break from their columns, accelerate toward the click position. Characters curve inward with slight randomization so they don't all arrive at once. Trail effect: characters leave fading afterimages.
2. **Orbit (1-4s):** Characters orbit the click point in a tight spiral. Radius oscillates (60px → 40px → 60px). Characters spin faster, glow intensifies. The orbit point slowly drifts toward cursor if cursor moves.
3. **Scatter (4-5s):** Characters explode outward in all directions with randomized velocity. As they reach their original column x-positions, they decelerate and resume normal falling behavior. 0.5s transition back to normal rain.

---

## 5. Shader — Contact Section

### 5.1 WebGL Shader Background

**Location:** Behind the contact section ("Let's Build Something")

**Visual:**
- Animated gradient mesh / fluid shader — organic, slowly morphing color blobs
- Colors: `var(--accent)` green + `var(--accent-secondary)` teal/blue, dark base
- Low opacity (0.3-0.4) so contact text remains readable
- Smooth, hypnotic movement — not distracting, just alive
- Adapted from 21st.dev `aliimam/shader-animation` component → vanilla WebGL

**Implementation:**
- `<canvas>` element behind contact section content
- WebGL fragment shader with time-based uniforms
- Fallback: CSS `background: radial-gradient(...)` for browsers without WebGL
- `prefers-reduced-motion`: show static gradient, no animation
- Lazy-init: only create WebGL context when contact section enters viewport (IntersectionObserver)

---

## Technical Constraints

- **All vanilla JS** — no React, no npm, no build tools
- **21st.dev components adapted to vanilla** — extract shader/animation logic, discard React wrapper
- **Page weight budget:** total JS + CSS should stay under 200KB gzipped (sounds are tiny oscillator-generated, not audio files)
- **All animations respect `prefers-reduced-motion`**
- **All interactive elements keyboard accessible**
- **Sound generated via Web Audio API oscillators** — no audio file downloads
- **Test at:** 375px, 768px, 1024px, 1440px
- **Performance target:** 60fps on mid-range hardware. Use `will-change` sparingly, prefer CSS custom properties over per-frame JS style writes
