# Portfolio Website Design Spec

**Author:** Christos Galaios
**Date:** 2026-03-26
**Repo:** `christosgalaios/christosgalaios.github.io` (GitHub Pages user site)
**Live URL:** `christosgalaios.github.io`
**Stack:** Vanilla HTML + CSS + JS (no frameworks, no build tools)

---

## Positioning & Narrative

**Core identity:** Creative engineer who architects solutions and directs AI to build them at production scale.

**Tagline:** "Creative Engineer. AI-Directed Development."

**Key messaging:**
- 5+ years of professional engineering built architectural thinking and studio operations knowledge
- Knows how studios operate: team roles, project management, creative workflows, release pipelines
- AI is the force multiplier — he directs it, it builds production-grade software
- The CEO/Manager/Agent workflow is a direct encoding of real studio experience into AI agents
- "I vibecoded a full Node.js desktop app with 1,671 tests without touching the code" — that's the skill companies should hire for

**Audience:** Potential employers/recruiters at companies that value AI-augmented development over traditional stack-specific experience.

**Tone:** Confident, technical, understated. Let the work speak. No fluff.

---

## Design System

### Aesthetic: Dark Tech

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#0A0A0F` | Page background |
| `--bg-card` | `#111118` | Card backgrounds |
| `--bg-card-hover` | `#1A1A24` | Card hover state |
| `--border` | `#1E293B` | Card borders, dividers |
| `--border-hover` | `#334155` | Hover borders |
| `--text-primary` | `#F8FAFC` | Headings, primary text |
| `--text-secondary` | `#94A3B8` | Body text, descriptions |
| `--text-muted` | `#475569` | Labels, meta info |
| `--accent` | `#22C55E` | CTAs, highlights, links |
| `--accent-glow` | `rgba(34,197,94,0.15)` | Glow effects on accent elements |
| `--accent-secondary` | `#3B82F6` | Secondary highlights (stats, badges) |

### Typography

- **Headings:** Archivo (700, 600) — bold, geometric, technical
- **Body:** Space Grotesk (400, 500) — clean, modern, readable
- **Code/Stats:** JetBrains Mono or Fira Code — monospace for numbers and labels
- **Google Fonts import:** `Archivo:wght@400;500;600;700|Space+Grotesk:wght@300;400;500;600;700|Fira+Code:wght@400;700`

### Sizing & Spacing

- Max content width: `1200px`
- Section gaps: `120px` (desktop), `80px` (mobile)
- Card padding: `24px–32px`
- Body text: `16px` minimum, line-height `1.6`
- Heading scale: `64px` / `48px` / `32px` / `24px`

### Effects & Animation

- **Scroll reveal:** IntersectionObserver, fade-up with `translateY(20px)`, 300ms ease-out, staggered
- **Blur text reveal:** Words animate in with blur(10px) -> blur(0px), inspired by 21st.dev BlurText component
- **Counter animation:** Stats count up from 0 when scrolled into view (IntersectionObserver + requestAnimationFrame)
- **Card hover:** `translateY(-4px)`, border brightens, subtle glow appears, 200ms transition
- **Corner squares on hover:** White corner markers appear on project card hover (from Dark Grid pattern)
- **Dot grid background:** Subtle repeating dot pattern on hero section using CSS radial-gradient
- **`prefers-reduced-motion`:** All animations respect this — fall back to instant opacity transitions
- **Duration:** 150–300ms for micro-interactions, 500ms for scroll reveals

### Responsive Breakpoints

- Mobile: `< 768px` (single column, stacked cards)
- Tablet: `768px–1024px` (2-column grid)
- Desktop: `> 1024px` (full layout)

---

## Page Structure

### 1. Navigation (Fixed, Floating)

- Minimal floating nav with `top-4 left-4 right-4` spacing
- Links: Projects | Experience | Education | Contact
- Hamburger menu on mobile
- Smooth scroll to sections
- Semi-transparent background with backdrop-blur on scroll

### 2. Hero Section

- Full viewport height
- Large name: **CHRISTOS GALAIOS** in Archivo 700, letter-spaced
- Blur text reveal animation on load (word by word)
- Subtitle: "Creative Engineer. AI-Directed Development."
- One-liner: "I architect solutions and direct AI to build them at production scale."
- Subtle dot grid background
- Scroll indicator (chevron down, gentle bounce)
- No photo (let the work be the face)

### 3. Stats Bar (Scroll-triggered counters)

Horizontal row of key numbers, monospace font, count-up animation:

| Stat | Value | Label |
|------|-------|-------|
| `2,100+` | Tests across projects | Automated Tests |
| `55+` | MCP tools built | MCP Tools |
| `4` | Codebases managed autonomously | Autonomous Codebases |
| `12` | Engineers led | Engineers Led |
| `5+` | Years professional experience | Years Experience |

### 4. Projects Section

**Section header:** `[ PROJECTS ]` in small caps, muted text — then a larger heading like "What I've Built"

#### Project Card Design

Each card has:
- Project name (Archivo 600)
- One-line role description
- 2-3 sentence description (what it proves)
- Tech tags (small pills: `Electron` `React` `SQLite` etc.)
- Key stat badge (e.g., "1,671 tests")
- Link: GitHub repo and/or live demo
- Hover: card lifts, border brightens, corner squares appear

#### Project Hierarchy (ordered by impact)

**Large Cards (2-column span on desktop):**

1. **SocialiseHub** — AI-Powered Business Operations Platform
   - "Full production Electron desktop app with 55+ MCP tools, AI augmentation, multi-platform sync, and browser automation. 1,671 automated tests across 33 suites. Entirely AI-directed development."
   - Tags: `Electron` `React 19` `Express 5` `SQLite` `MCP` `TypeScript`
   - Stat badge: **1,671 tests**
   - Link: GitHub only (no live demo — it's a desktop app)
   - **Note:** Don't reveal Socialise business details. Frame as engineering achievement.

2. **Interactive CV** — Card Battle Game as a CV
   - "A Hand of Fate-inspired card battle game where recruiters play objection cards and the CV counters with achievements. Procedural audio synthesis, multiplayer via WebSocket, 3D CSS transforms. Zero frameworks, zero audio files."
   - Tags: `Vanilla JS` `Canvas API` `Web Audio` `Socket.io` `Express`
   - Stat badge: **4-player multiplayer**
   - CTA: **"Play It"** button (prominent, accent colored) linking to `christosgalaios.github.io/InteractiveCV`
   - Link: GitHub + Live Demo

**Medium Cards:**

3. **SocialiseApp** — Social Event Discovery Platform
   - "Full-stack web platform with real-time chat, AI-matched micro-meets, gamification (XP + levels), communities, and an interactive mascot. PWA-ready."
   - Tags: `React 19` `Supabase` `Express` `Framer Motion` `Zustand`
   - Stat badge: **548 tests**
   - Link: GitHub

4. **Agentic Workflow System** — AI Agent Orchestration Framework
   - "A multi-agent system modeled after real studio operations: CEO (strategy), Manager (code review + task dispatch), Agent (implementation). Autonomous sprint management, model-tier routing (Haiku/Sonnet/Opus), inter-agent signaling. Manages 4 codebases continuously."
   - Tags: `Claude API` `MCP` `TypeScript` `Multi-Agent` `GitHub Actions`
   - Stat badge: **4 codebases autonomous**
   - Note: This IS the "I know how studios work and I encoded that knowledge into AI" story.

**Small Cards:**

5. **DevGuide** — Autonomous Content Pipeline
   - "Multi-agent Python system that discovers topics, generates SEO articles, validates quality, and publishes daily. Built in 2 hours. 44 articles live, zero ongoing cost. The website features a compass navigation element doubling as back-to-top — designed with intention."
   - Tags: `Python` `GitHub Actions` `Next.js` `Zero Dependencies`
   - Stat badge: **Built in 2 hours**
   - Link: GitHub + Live site (`devguide.co.uk`)

6. **Socialise Website** — Marketing Landing Page
   - "Pure vanilla HTML/CSS/JS (~1,100 lines). Mouse-tracking spotlight effects, scroll reveal animations, parallax depth. Custom domain, no frameworks needed."
   - Tags: `HTML` `CSS` `JavaScript` `GitHub Pages`
   - Link: GitHub + Live site (`socialise.events`)

7. **Edge AI Robot** — Physical Computing with LLMs (WIP)
   - "LLM-brained autonomous robot on Raspberry Pi 5 with Hailo 10H neural accelerator. Computer vision, object detection, autonomous navigation."
   - Tags: `Python` `Raspberry Pi` `Hailo 10H` `Computer Vision`
   - Stat badge: **Work in Progress**

### 5. Experience Section

**Section header:** `[ EXPERIENCE ]` — "Where I Learned How Teams, Pipelines, and Products Actually Work"

Vertical timeline with glowing nodes and connecting line. Each entry:

```
[dot] ---- Card ----
       Title | Company | Date
       Key achievement bullets (2-3 max)
       ---- End Card ----
```

**Timeline entries:**

1. **Independent Automation Engineer** | Socialise Platform | Feb 2026 – Present
   - Multi-agent orchestration across 4 codebases with autonomous sprint management
   - Production MCP server with 55+ tools enabling LLMs to execute business operations
   - Programmatic video pipeline: 32 social media compositions from event data

2. **Technical Lead (Interactive)** | Koffee Cup Ltd | Jan 2024 – Feb 2026
   - Led 12 engineers (4 senior) in Meta VR ecosystem
   - Automation framework: 50% faster artist workflows, ~10x testing velocity
   - Primary technical contact for Meta — contributed to "Elite" vendor status
   - 6-environment release pipeline with dual-lane parallel development

3. **Interactive Developer** | Koffee Cup Ltd | Jan 2023 – Jan 2024
   - Promoted to Technical Lead within 12 months
   - Client-side authoritative networking for zero-latency VR feedback
   - Haptic proximity system cited by client as key factor in prototype expansion to full product

4. **Software Engineer (Unity)** | Virtually Sports | Jan 2021 – Jan 2023
   - 10,000+ concurrent entity logic via high-performance state machines
   - Shipped 2 commercial titles, 99.9% uptime on cloud-rendered servers

### 6. Education Section

**Section header:** `[ EDUCATION ]`

Two entries, simple cards:

1. **BSc (Hons) Computer Games Programming** — First Class Honours
   - Middlesex University, London
   - IEEE Published Thesis: Educational programming game for children with ADHD
   - Key Project: Combat AI using Behaviour Trees and Finite State Machines

2. **Undergraduate Coursework — Mechanical Engineering of Automation** (2014–2016)
   - University of West Attica, Athens

### 7. Contact Section

- **Email:** christosgaleos@gmail.com
- **LinkedIn:** linkedin.com/in/christos-galaios
- **GitHub:** github.com/christosgalaios
- Simple, clean. SVG icons for each (Lucide-style, inline SVG — no icon library dependency).
- "Let's build something" or similar understated CTA.

---

## 21st.dev Components to Use (Vanilla JS Adaptations)

These React components from 21st.dev will be adapted to vanilla JS:

1. **BlurText** — Hero text reveal animation. Adapt the IntersectionObserver + per-word blur/opacity/translateY pattern to vanilla JS.

2. **Dark Grid Card Pattern** — Project cards with gradient background, subtle hover glow, and white corner squares appearing on hover. Pure CSS + minimal JS.

3. **Animated Counter** — Stats section. IntersectionObserver triggers a count-up loop using requestAnimationFrame. Display in monospace.

4. **Timeline with Glowing Nodes** — Experience section. Vertical line with CSS gradient (blue-to-green), glowing dot nodes, glass-style cards. All achievable with CSS + scroll-triggered class toggling.

5. **Scroll Reveal** — Generic fade-up animation on all sections/cards via IntersectionObserver with staggered delays.

---

## Accessibility Checklist

- [ ] Color contrast: 4.5:1 minimum for all text (verified: `#F8FAFC` on `#0A0A0F` = 18.1:1, `#94A3B8` on `#0A0A0F` = 7.2:1)
- [ ] All interactive elements have visible focus rings
- [ ] Keyboard navigation: tab order matches visual order
- [ ] `prefers-reduced-motion` disables all animations
- [ ] Semantic HTML: `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`
- [ ] Skip-to-content link
- [ ] All links have descriptive text (no "click here")
- [ ] SVG icons have `aria-label` or `aria-hidden`
- [ ] Touch targets: 44x44px minimum
- [ ] No horizontal scroll on any viewport

---

## Performance Targets

- **Zero build tools.** Single `index.html` + `style.css` + `main.js`. Fonts loaded from Google Fonts.
- **No npm, no node_modules, no framework.** This is a vanilla site.
- **Images:** WebP format, lazy-loaded, with explicit width/height to prevent layout shift. Consider using project screenshots/thumbnails.
- **Total page weight target:** < 500KB (excluding fonts)
- **First paint:** < 1s on 3G

---

## File Structure

```
christosgalaios.github.io/
  index.html          # Single page, all sections
  style.css           # All styles, CSS custom properties
  main.js             # Animations, counters, scroll effects, mobile menu
  assets/
    og-image.png      # Open Graph preview image
    (project screenshots if added later)
  CNAME               # If custom domain is set up later
```

---

## Open Graph / SEO

```html
<title>Christos Galaios — Creative Engineer | AI-Directed Development</title>
<meta name="description" content="Portfolio of Christos Galaios. Creative engineer who architects solutions and directs AI to build them at production scale. 2,100+ automated tests, 55+ MCP tools, 4 autonomous codebases.">
<meta property="og:title" content="Christos Galaios — Creative Engineer">
<meta property="og:description" content="I architect solutions and direct AI to build them at production scale.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://christosgalaios.github.io">
```

---

## What NOT to Include

- No photo/headshot (the work is the identity)
- No "About Me" paragraph — the narrative is woven through projects and experience
- No skills bar/percentage chart (cringe, meaningless)
- No testimonials (we don't have them)
- No blog section
- No contact form (email link is sufficient)
- No framework dependencies
