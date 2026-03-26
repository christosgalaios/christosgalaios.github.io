# Portfolio Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dark-themed developer portfolio at `christosgalaios.github.io` showcasing Christos's projects, experience, and AI-directed development approach.

**Architecture:** Single-page vanilla site. Three files: `index.html` (structure + content), `style.css` (design system + responsive layout), `main.js` (animations + interactions). No build tools, no frameworks, no npm.

**Tech Stack:** HTML5, CSS3 (custom properties, grid, flexbox), Vanilla JavaScript (IntersectionObserver, requestAnimationFrame), Google Fonts (Archivo, Space Grotesk, Fira Code)

---

### Task 1: Project Setup + Git Init

**Files:**
- Create: `C:/Users/xgal/Desktop/Portfolio/index.html`
- Create: `C:/Users/xgal/Desktop/Portfolio/style.css`
- Create: `C:/Users/xgal/Desktop/Portfolio/main.js`

- [ ] **Step 1: Initialize git repo**

```bash
cd C:/Users/xgal/Desktop/Portfolio
git init
```

- [ ] **Step 2: Create index.html with full page structure (empty sections)**

Create `index.html` with:
- DOCTYPE, lang, meta viewport, meta description, OG tags
- Google Fonts link (Archivo, Space Grotesk, Fira Code)
- Link to style.css, defer script main.js
- Skip-to-content link
- `<nav>` with floating nav (Projects | Experience | Education | Contact + mobile hamburger button)
- `<main id="main-content">` containing empty semantic `<section>` elements for: hero, stats, projects, experience, education, contact
- `<footer>`
- All sections have `id` attributes matching nav anchors

- [ ] **Step 3: Create style.css with design system foundation**

Create `style.css` with:
- CSS custom properties (all tokens from spec: colors, spacing, typography)
- CSS reset (box-sizing, margin, font smoothing)
- Base typography (Archivo headings, Space Grotesk body, Fira Code mono)
- `.container` max-width 1200px centered
- Section spacing (120px desktop, 80px mobile)
- `prefers-reduced-motion` media query (disable all transitions/animations)
- Dot grid background on hero using `radial-gradient`

- [ ] **Step 4: Create empty main.js with module structure**

Create `main.js` with commented sections for:
- Scroll reveal (IntersectionObserver)
- Blur text reveal
- Counter animation
- Nav scroll effect (backdrop-blur on scroll)
- Mobile menu toggle
- Smooth scroll for anchor links

- [ ] **Step 5: Verify and commit**

Open `index.html` in browser — should show dark background, correct fonts loading, empty sections.

```bash
git add index.html style.css main.js
git commit -m "feat: scaffold portfolio with design system and empty sections"
```

---

### Task 2: Navigation

**Files:**
- Modify: `C:/Users/xgal/Desktop/Portfolio/index.html` (nav section)
- Modify: `C:/Users/xgal/Desktop/Portfolio/style.css` (nav styles)
- Modify: `C:/Users/xgal/Desktop/Portfolio/main.js` (scroll effect + mobile menu)

- [ ] **Step 1: Add nav HTML**

Inside `<nav>`:
```html
<nav class="nav" id="nav">
  <div class="nav-inner">
    <a href="#hero" class="nav-logo">CG</a>
    <div class="nav-links" id="nav-links">
      <a href="#projects">Projects</a>
      <a href="#experience">Experience</a>
      <a href="#education">Education</a>
      <a href="#contact">Contact</a>
    </div>
    <button class="nav-toggle" id="nav-toggle" aria-label="Toggle menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>
```

- [ ] **Step 2: Style the nav**

Floating nav: `position: fixed`, `top: 1rem`, `left: 1rem`, `right: 1rem`, `z-index: 50`, `border-radius: 12px`, transparent background. On scroll, add `.nav--scrolled` class: `background: rgba(10,10,15,0.85)`, `backdrop-filter: blur(12px)`, border appears. Nav links in `Space Grotesk 500`, `14px`, uppercase, letter-spaced. Mobile: hide nav-links, show hamburger (3 spans as lines), slide-in menu on toggle. Focus rings on all interactive elements using `outline: 2px solid var(--accent)`.

- [ ] **Step 3: Add nav JS**

In `main.js`:
- `scroll` listener: toggle `.nav--scrolled` when `scrollY > 50`
- Mobile toggle: click `#nav-toggle` toggles `.nav--open` on `#nav-links`, updates `aria-expanded`
- Smooth scroll: all `a[href^="#"]` use `scrollIntoView({ behavior: 'smooth' })`
- Close mobile menu on link click

- [ ] **Step 4: Verify and commit**

Check: nav floats, becomes glassy on scroll, mobile menu opens/closes, smooth scroll works, keyboard accessible.

```bash
git add -A
git commit -m "feat: add floating nav with scroll effect and mobile menu"
```

---

### Task 3: Hero Section

**Files:**
- Modify: `C:/Users/xgal/Desktop/Portfolio/index.html` (hero section)
- Modify: `C:/Users/xgal/Desktop/Portfolio/style.css` (hero styles)
- Modify: `C:/Users/xgal/Desktop/Portfolio/main.js` (blur text reveal)

- [ ] **Step 1: Add hero HTML**

```html
<section class="hero" id="hero">
  <div class="hero-content">
    <h1 class="hero-name blur-reveal">CHRISTOS GALAIOS</h1>
    <p class="hero-tagline blur-reveal">Creative Engineer. AI-Directed Development.</p>
    <p class="hero-description blur-reveal">I architect solutions and direct AI to build them at production scale.</p>
  </div>
  <a href="#projects" class="hero-scroll" aria-label="Scroll to projects">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
  </a>
</section>
```

- [ ] **Step 2: Style the hero**

Full viewport height (`min-height: 100vh`), flex column centered. Name: `Archivo 700`, `clamp(2.5rem, 8vw, 4rem)`, letter-spacing `0.15em`, `text-transform: uppercase`. Tagline: `Space Grotesk 500`, `clamp(1.1rem, 2.5vw, 1.5rem)`, `var(--accent)` color. Description: `Space Grotesk 400`, `var(--text-secondary)`. Dot grid background: `radial-gradient(circle, var(--border) 1px, transparent 1px)` with `background-size: 24px 24px`. Scroll indicator: absolute bottom, gentle bounce animation (`@keyframes bounce`), `var(--text-muted)`.

- [ ] **Step 3: Implement blur text reveal in JS**

For each `.blur-reveal` element:
1. Split `textContent` into `<span>` per word, wrap each
2. Set initial style on each span: `opacity: 0`, `filter: blur(10px)`, `transform: translateY(10px)`, `transition: all 0.5s ease-out`
3. On `DOMContentLoaded`, stagger-animate each span with increasing delay (100ms per word): set `opacity: 1`, `filter: blur(0)`, `transform: translateY(0)`
4. Respect `prefers-reduced-motion`: skip blur/transform, just set opacity instantly

- [ ] **Step 4: Verify and commit**

Check: hero fills viewport, text animates on load, dot grid visible, scroll chevron bounces, responsive at 375px/768px/1440px.

```bash
git add -A
git commit -m "feat: add hero section with blur text reveal animation"
```

---

### Task 4: Stats Bar

**Files:**
- Modify: `C:/Users/xgal/Desktop/Portfolio/index.html` (stats section)
- Modify: `C:/Users/xgal/Desktop/Portfolio/style.css` (stats styles)
- Modify: `C:/Users/xgal/Desktop/Portfolio/main.js` (counter animation)

- [ ] **Step 1: Add stats HTML**

```html
<section class="stats" id="stats">
  <div class="container stats-grid">
    <div class="stat" data-target="2100" data-suffix="+">
      <span class="stat-number">0</span>
      <span class="stat-label">Automated Tests</span>
    </div>
    <div class="stat" data-target="55" data-suffix="+">
      <span class="stat-number">0</span>
      <span class="stat-label">MCP Tools</span>
    </div>
    <div class="stat" data-target="4">
      <span class="stat-number">0</span>
      <span class="stat-label">Autonomous Codebases</span>
    </div>
    <div class="stat" data-target="12">
      <span class="stat-number">0</span>
      <span class="stat-label">Engineers Led</span>
    </div>
    <div class="stat" data-target="5" data-suffix="+">
      <span class="stat-number">0</span>
      <span class="stat-label">Years Experience</span>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Style the stats bar**

Grid: `grid-template-columns: repeat(5, 1fr)` on desktop, `repeat(3, 1fr)` tablet, `repeat(2, 1fr)` mobile (last item spans 2 on mobile or center). Each stat: text-align center, `stat-number` in `Fira Code 700`, `clamp(2rem, 4vw, 3rem)`, `var(--accent)`. `stat-label` in `Space Grotesk 400`, `0.75rem`, uppercase, letter-spaced, `var(--text-muted)`. Subtle top/bottom border on the stats section using `var(--border)`.

- [ ] **Step 3: Implement counter animation in JS**

```javascript
function animateCounters() {
  const stats = document.querySelectorAll('.stat');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target.querySelector('.stat-number');
        const target = parseInt(entry.target.dataset.target);
        const suffix = entry.target.dataset.suffix || '';
        const duration = 1500;
        const start = performance.now();
        function update(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          el.textContent = Math.floor(eased * target).toLocaleString() + suffix;
          if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  stats.forEach(s => observer.observe(s));
}
```

For `prefers-reduced-motion`: set final values immediately, no animation.

- [ ] **Step 4: Verify and commit**

Check: counters start at 0, animate when scrolled into view, only fire once, responsive grid.

```bash
git add -A
git commit -m "feat: add stats bar with scroll-triggered counter animation"
```

---

### Task 5: Project Cards

**Files:**
- Modify: `C:/Users/xgal/Desktop/Portfolio/index.html` (projects section)
- Modify: `C:/Users/xgal/Desktop/Portfolio/style.css` (card styles)

- [ ] **Step 1: Add projects section HTML**

Section header: `[ PROJECTS ]` label + "What I've Built" heading. Then a grid of 7 project cards using this structure per card:

```html
<article class="project-card project-card--large reveal">
  <div class="project-card-inner">
    <div class="project-corner project-corner--tl"></div>
    <div class="project-corner project-corner--tr"></div>
    <div class="project-corner project-corner--bl"></div>
    <div class="project-corner project-corner--br"></div>
    <div class="project-header">
      <h3 class="project-name">SocialiseHub</h3>
      <span class="project-stat">1,671 tests</span>
    </div>
    <p class="project-role">AI-Powered Business Operations Platform</p>
    <p class="project-desc">Full production Electron desktop app with 55+ MCP tools, AI augmentation, multi-platform sync, and browser automation. 1,671 automated tests across 33 suites. Entirely AI-directed development.</p>
    <div class="project-tags">
      <span class="tag">Electron</span>
      <span class="tag">React 19</span>
      <span class="tag">Express 5</span>
      <span class="tag">SQLite</span>
      <span class="tag">MCP</span>
      <span class="tag">TypeScript</span>
    </div>
    <div class="project-links">
      <a href="https://github.com/christosgalaios/SocialiseHub" target="_blank" rel="noopener noreferrer">GitHub</a>
    </div>
  </div>
</article>
```

All 7 projects from spec. Use `project-card--large` for SocialiseHub and Interactive CV, `project-card--medium` for SocialiseApp and Agentic Workflow, `project-card--small` for DevGuide, Socialise Website, Edge AI Robot. Interactive CV gets a prominent `<a class="project-cta">Play It</a>` button.

- [ ] **Step 2: Style project cards**

Projects grid: CSS grid with `grid-template-columns: repeat(2, 1fr)` desktop. Large cards: `grid-column: span 1` (two large cards side by side). Medium cards: `grid-column: span 1` (row of 2). Small cards: row of 3 (`grid-template-columns: repeat(3, 1fr)` sub-grid or third row). Mobile: all single column.

Card styles: `background: var(--bg-card)`, `border: 1px solid var(--border)`, `border-radius: 12px`, `padding: 2rem`. Hover: `transform: translateY(-4px)`, `border-color: var(--border-hover)`, `box-shadow: 0 0 30px var(--accent-glow)`, transition 200ms. Corner squares: 4 absolutely positioned `8x8px` white squares at corners, `opacity: 0` by default, `opacity: 1` on card hover.

`project-name`: `Archivo 600`, `1.5rem`. `project-role`: `Space Grotesk 500`, `var(--text-secondary)`, italic. `project-desc`: `Space Grotesk 400`, `var(--text-secondary)`, `line-height: 1.6`. `project-stat`: `Fira Code 700`, `var(--accent)` background pill. Tags: small pills, `background: rgba(255,255,255,0.05)`, `border: 1px solid var(--border)`, `border-radius: 999px`, `font-size: 0.75rem`, `padding: 0.25rem 0.75rem`. Links: `var(--accent)` color, underline on hover. "Play It" CTA: `background: var(--accent)`, `color: var(--bg-primary)`, `padding: 0.5rem 1.5rem`, `border-radius: 8px`, `font-weight: 600`.

- [ ] **Step 3: Add scroll reveal class**

Add `.reveal` class to all project cards. In `main.js`, the scroll reveal observer (Task 7) will handle the animation.

- [ ] **Step 4: Verify and commit**

Check: card grid layout correct on desktop/tablet/mobile, hover effects work, corner squares appear, "Play It" button prominent, all links correct, tags readable.

```bash
git add -A
git commit -m "feat: add project cards with hover effects and corner markers"
```

---

### Task 6: Experience Timeline + Education + Contact

**Files:**
- Modify: `C:/Users/xgal/Desktop/Portfolio/index.html` (experience, education, contact, footer)
- Modify: `C:/Users/xgal/Desktop/Portfolio/style.css` (timeline, education, contact styles)

- [ ] **Step 1: Add experience timeline HTML**

```html
<section class="experience" id="experience">
  <div class="container">
    <span class="section-label">[ EXPERIENCE ]</span>
    <h2 class="section-title">Where I Learned How Teams, Pipelines, and Products Actually Work</h2>
    <div class="timeline">
      <div class="timeline-line"></div>
      <!-- Repeat for each of 4 entries -->
      <div class="timeline-item reveal">
        <div class="timeline-dot"></div>
        <div class="timeline-card">
          <span class="timeline-date">Feb 2026 – Present</span>
          <h3 class="timeline-title">Independent Automation Engineer</h3>
          <span class="timeline-company">Socialise Platform</span>
          <ul class="timeline-achievements">
            <li>Multi-agent orchestration across 4 codebases with autonomous sprint management</li>
            <li>Production MCP server with 55+ tools enabling LLMs to execute business operations</li>
            <li>Programmatic video pipeline: 32 social media compositions from event data</li>
          </ul>
        </div>
      </div>
      <!-- ... 3 more timeline-items with data from spec -->
    </div>
  </div>
</section>
```

All 4 experience entries from spec.

- [ ] **Step 2: Add education HTML**

```html
<section class="education" id="education">
  <div class="container">
    <span class="section-label">[ EDUCATION ]</span>
    <div class="education-grid">
      <div class="education-card reveal">
        <h3>BSc (Hons) Computer Games Programming</h3>
        <span class="education-meta">First Class Honours — Middlesex University, London</span>
        <p>IEEE Published Thesis: Educational programming game for children with ADHD</p>
        <p>Key Project: Combat AI using Behaviour Trees and Finite State Machines</p>
      </div>
      <div class="education-card reveal">
        <h3>Mechanical Engineering of Automation</h3>
        <span class="education-meta">Undergraduate Coursework (2014–2016) — University of West Attica, Athens</span>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Add contact + footer HTML**

```html
<section class="contact" id="contact">
  <div class="container contact-inner">
    <h2 class="section-title">Let's Build Something</h2>
    <div class="contact-links">
      <a href="mailto:christosgaleos@gmail.com" class="contact-link">
        <!-- inline SVG: mail icon -->
        <span>christosgaleos@gmail.com</span>
      </a>
      <a href="https://linkedin.com/in/christos-galaios" target="_blank" rel="noopener noreferrer" class="contact-link">
        <!-- inline SVG: linkedin icon -->
        <span>LinkedIn</span>
      </a>
      <a href="https://github.com/christosgalaios" target="_blank" rel="noopener noreferrer" class="contact-link">
        <!-- inline SVG: github icon -->
        <span>GitHub</span>
      </a>
    </div>
  </div>
</section>
<footer class="footer">
  <div class="container">
    <p>&copy; 2026 Christos Galaios</p>
  </div>
</footer>
```

Use inline SVGs for mail, LinkedIn, GitHub icons (simple 24x24 Lucide-style paths). Each icon has `aria-hidden="true"`.

- [ ] **Step 4: Style the timeline**

Timeline: `position: relative`, `padding-left: 3rem`. `.timeline-line`: absolute left, `width: 2px`, full height, `background: linear-gradient(to bottom, var(--accent-secondary), var(--accent))`. `.timeline-dot`: `width: 14px`, `height: 14px`, `border-radius: 50%`, `background: var(--accent)`, `box-shadow: 0 0 12px var(--accent-glow)`, absolute left aligned with line. `.timeline-card`: `background: var(--bg-card)`, `border: 1px solid var(--border)`, `border-radius: 12px`, `padding: 1.5rem`, hover shadow. `.timeline-date`: `Fira Code`, `var(--accent-secondary)`, `0.8rem`. `.timeline-title`: `Archivo 600`. `.timeline-company`: `var(--text-muted)`. `.timeline-achievements li`: `var(--text-secondary)`, bullet style using `::before` with `var(--accent)` dot.

- [ ] **Step 5: Style education + contact**

Education grid: 2 columns desktop, 1 column mobile. Cards same style as timeline cards. `education-meta`: `var(--text-muted)`, `0.875rem`.

Contact: centered text, large heading. Contact links: flex row (column on mobile), gap `2rem`. Each link: flex items center, gap `0.75rem`, `var(--text-secondary)`, hover `var(--accent)`. SVG icons `24x24`.

Footer: `var(--text-muted)`, `0.875rem`, centered, `padding: 2rem 0`, `border-top: 1px solid var(--border)`.

- [ ] **Step 6: Verify and commit**

Check: timeline renders with glowing line and dots, cards aligned, education cards display, contact icons/links work, footer shows. All responsive.

```bash
git add -A
git commit -m "feat: add experience timeline, education, contact, and footer"
```

---

### Task 7: Scroll Reveal + Polish

**Files:**
- Modify: `C:/Users/xgal/Desktop/Portfolio/main.js` (scroll reveal, all animations init)
- Modify: `C:/Users/xgal/Desktop/Portfolio/style.css` (reveal animation classes)

- [ ] **Step 1: Add scroll reveal CSS**

```css
.reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease-out, transform 0.5s ease-out;
}
.reveal--visible {
  opacity: 1;
  transform: translateY(0);
}
@media (prefers-reduced-motion: reduce) {
  .reveal { opacity: 1; transform: none; transition: none; }
}
```

- [ ] **Step 2: Implement scroll reveal in JS**

```javascript
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings
        const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal'));
        const index = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = `${index * 100}ms`;
        entry.target.classList.add('reveal--visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  reveals.forEach(el => observer.observe(el));
}
```

- [ ] **Step 3: Wire up all JS initialization**

At bottom of `main.js`:
```javascript
document.addEventListener('DOMContentLoaded', () => {
  initBlurReveal();
  animateCounters();
  initScrollReveal();
  initNav();
});
```

Ensure all functions are defined and called. Add `.reveal` class to: all project cards, all timeline items, education cards, stats (if not already animated by counter), section headers.

- [ ] **Step 4: Final polish pass**

- Verify no horizontal scroll at any breakpoint (375px, 768px, 1024px, 1440px)
- Check all focus states are visible
- Test keyboard navigation (tab through nav, cards, links)
- Verify `prefers-reduced-motion` works (disable animations in browser dev tools)
- Check all external links open in new tab

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add scroll reveal animations and final polish"
```

---

### Task 8: GitHub Pages Deployment

**Files:**
- No new files (unless creating CNAME)

- [ ] **Step 1: Create GitHub repo**

Create `christosgalaios/christosgalaios.github.io` repo on GitHub (public). This is a GitHub Pages user site — deploys from `main` branch root automatically.

- [ ] **Step 2: Push to GitHub**

```bash
cd C:/Users/xgal/Desktop/Portfolio
git remote add origin https://github.com/christosgalaios/christosgalaios.github.io.git
git branch -M main
git push -u origin main
```

- [ ] **Step 3: Verify deployment**

Wait 1-2 minutes, then check `https://christosgalaios.github.io`. Verify all sections load, animations play, responsive works.

- [ ] **Step 4: Final commit with any fixes**

If anything needs fixing after seeing it live, fix and push.
