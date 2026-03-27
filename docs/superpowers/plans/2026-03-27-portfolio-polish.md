# Portfolio Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate the portfolio from project showcase to interactive playground with visual effects, sound design, typewriter animations, loading skeletons, and 5 discoverable easter eggs.

**Architecture:** All changes go into the existing 3 files (`index.html`, `style.css`, `main.js`). No build tools, no npm, no external audio files. Sounds generated via Web Audio API. Shader via WebGL. Everything vanilla JS.

**Tech Stack:** HTML5, CSS3, Vanilla JavaScript, Web Audio API, WebGL (contact shader)

---

## File Map

All changes modify existing files:

- `C:/Users/xgal/Desktop/Portfolio/index.html` — add sound toggle button to nav, restructure stat HTML for rolling digits, add contact canvas, add footer easter egg div, add overscroll div
- `C:/Users/xgal/Desktop/Portfolio/style.css` — scroll progress bar, rolling digit styles, spotlight card effect, magnetic button transitions, hacker theme, skeleton shimmer, typewriter cursor, easter egg styles, shader canvas, layout fixes
- `C:/Users/xgal/Desktop/Portfolio/main.js` — replace `initParticles()` with `initMatrixRain()`, replace `animateCounters()` with `initRollingDigits()`, add `initScrollProgress()`, `initSpotlightCards()`, `initMagneticButtons()`, `initSoundSystem()`, `initTypewriter()` (modify sprint log), `initSkeletons()`, `initEasterEggs()`, `initContactShader()`

---

### Task 0: Layout Fixes (SocialiseApp + DevGuide)

**Files:**
- Modify: `C:/Users/xgal/Desktop/Portfolio/style.css:2723-2766` (browser mockup)
- Modify: `C:/Users/xgal/Desktop/Portfolio/style.css:3548-3550` (devguide-wide)
- Modify: `C:/Users/xgal/Desktop/Portfolio/index.html:423` (desktop iframe)

- [ ] **Step 1: Fix SocialiseApp desktop view — 16:9 aspect ratio, zoomed out**

In `style.css`, replace the browser-viewport and iframe styles:

```css
/* style.css — replace lines 2723-2766 */
.browser-mockup {
  border-radius: var(--radius-md);
  border: 2px solid #333;
  overflow: hidden;
  background: var(--bg-card);
  box-shadow: 0 12px 40px rgba(0,0,0,0.3);
  width: 560px;
  flex-shrink: 0;
}

.browser-viewport {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  overflow: hidden;
}

.browser-viewport .app-live-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 200%;
  height: 200%;
  transform: scale(0.5);
  transform-origin: top left;
  border: none;
}
```

The iframe is rendered at 2x size then scaled down to 0.5, showing the full desktop layout in a 16:9 frame.

- [ ] **Step 2: Fix DevGuide card — constrain width, center content**

In `style.css`, replace the devguide-wide rule:

```css
/* style.css — replace line 3548-3550 */
.project-card--devguide-wide {
  grid-column: 1 / -1;
  max-width: var(--container-max);
  margin-left: auto;
  margin-right: auto;
}
```

Add centering for the tags/links below the pipeline:

```css
/* style.css — add after .pipeline-counter styles */
.project-card--devguide-wide .project-tags {
  justify-content: center;
}
.project-card--devguide-wide .project-links {
  justify-content: center;
}
```

- [ ] **Step 3: Verify and commit**

```bash
cd C:/Users/xgal/Desktop/Portfolio
git add style.css
git commit -m "fix: SocialiseApp 16:9 desktop view + DevGuide centered layout"
```

---

### Task 1: Scroll Progress Bar

**Files:**
- Modify: `C:/Users/xgal/Desktop/Portfolio/style.css` (add at end, before light theme block)
- Modify: `C:/Users/xgal/Desktop/Portfolio/main.js` (add function before init block)

- [ ] **Step 1: Add scroll progress CSS**

Add to `style.css` before the `[data-theme="light"]` block (~line 3860):

```css
/* Scroll Progress Bar */
.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  width: 0%;
  background: linear-gradient(90deg, var(--accent-secondary), var(--accent));
  z-index: 100;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s;
}
.scroll-progress--visible {
  opacity: 1;
}
@media (prefers-reduced-motion: reduce) {
  .scroll-progress { transition: none; }
}
```

- [ ] **Step 2: Add scroll progress HTML**

In `index.html`, add immediately after the opening `<body>` tag (line 17):

```html
<div class="scroll-progress" id="scroll-progress"></div>
```

- [ ] **Step 3: Add scroll progress JS**

In `main.js`, add before the `/* --- Init --- */` block (~line 1804):

```javascript
/* --- Scroll Progress --- */
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  const heroHeight = document.getElementById('hero')?.offsetHeight || window.innerHeight;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const pct = maxScroll > 0 ? (scrollY / maxScroll) * 100 : 0;
      bar.style.width = pct + '%';
      bar.classList.toggle('scroll-progress--visible', scrollY > heroHeight);
      ticking = false;
    });
  });
}
```

Add `initScrollProgress();` to the DOMContentLoaded block.

- [ ] **Step 4: Verify and commit**

Scroll through the page — bar should appear after hero, grow from left to right, be green gradient.

```bash
git add index.html style.css main.js
git commit -m "feat: add scroll progress bar"
```

---

### Task 2: Matrix Rain Hero + Text Scramble

**Files:**
- Modify: `C:/Users/xgal/Desktop/Portfolio/main.js:1742-1802` (replace `initParticles`)
- Modify: `C:/Users/xgal/Desktop/Portfolio/main.js:37-55` (modify `initBlurReveal` to skip hero name)
- Modify: `C:/Users/xgal/Desktop/Portfolio/style.css:339-357` (update hero-name styles)

- [ ] **Step 1: Replace initParticles with initMatrixRain**

In `main.js`, replace the entire `initParticles()` function (lines 1742-1802) with:

```javascript
/* --- Matrix Rain --- */
function initMatrixRain() {
  const canvas = document.getElementById('hero-particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, columns, drops;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*(){}[]<>/\\|~';
  const fontSize = 14;
  const activeChance = 0.05; // 5% of chars glow bright
  let clickCount = 0, clickTimer = null; // for easter egg (Task 9)
  let swarming = false; // easter egg state

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    w = canvas.width = rect.width;
    h = canvas.height = rect.height;
    columns = Math.floor(w / fontSize);
    drops = new Array(columns).fill(0).map(() => Math.random() * h / fontSize | 0);
  }
  resize();
  window.addEventListener('resize', resize);

  if (prefersReducedMotion) {
    // Static snapshot: draw one frame
    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.fillRect(0, 0, w, h);
    ctx.font = fontSize + 'px monospace';
    for (let i = 0; i < columns; i++) {
      for (let j = 0; j < 5; j++) {
        const y = (drops[i] + j) * fontSize;
        const c = chars[Math.random() * chars.length | 0];
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        ctx.fillText(c, i * fontSize, y);
      }
    }
    return;
  }

  // Track clicks for easter egg
  canvas.addEventListener('click', (e) => {
    clickCount++;
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => { clickCount = 0; }, 2000);
    if (clickCount >= 3 && !swarming) {
      swarming = true;
      clickCount = 0;
      startSwarm(e.clientX - canvas.getBoundingClientRect().left, e.clientY - canvas.getBoundingClientRect().top);
    }
  });

  // Swarm easter egg state
  let swarmTarget = { x: 0, y: 0 };
  let swarmPhase = 0; // 0=none, 1=swarm, 2=orbit, 3=scatter
  let swarmStart = 0;
  let swarmChars = []; // {x, y, targetX, targetY, origCol, char, speed, angle}

  function startSwarm(tx, ty) {
    swarmTarget = { x: tx, y: ty };
    swarmPhase = 1;
    swarmStart = performance.now();
    swarmChars = [];
    // Convert current drops to swarm particles
    for (let i = 0; i < columns; i++) {
      const x = i * fontSize;
      const y = drops[i] * fontSize;
      swarmChars.push({
        x, y, origCol: i, origY: drops[i],
        char: chars[Math.random() * chars.length | 0],
        angle: Math.atan2(ty - y, tx - x) + (Math.random() - 0.5) * 0.5,
        speed: 3 + Math.random() * 4,
        orbitAngle: Math.random() * Math.PI * 2,
        orbitSpeed: 0.02 + Math.random() * 0.03,
      });
    }
    if (typeof playSound === 'function') playSound('easter');
    // Phase transitions
    setTimeout(() => { swarmPhase = 2; }, 1000);
    setTimeout(() => { swarmPhase = 3; }, 4000);
    setTimeout(() => { swarmPhase = 0; swarming = false; }, 5000);
  }

  function draw() {
    if (swarmPhase > 0) {
      drawSwarm();
    } else {
      drawRain();
    }
    requestAnimationFrame(draw);
  }

  function drawRain() {
    // Fade trail
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, w, h);
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < columns; i++) {
      const c = chars[Math.random() * chars.length | 0];
      const y = drops[i] * fontSize;
      const isActive = Math.random() < activeChance;

      if (isActive) {
        ctx.fillStyle = 'rgba(34,197,94,0.9)';
        ctx.shadowColor = '#22C55E';
        ctx.shadowBlur = 8;
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        ctx.shadowBlur = 0;
      }
      ctx.fillText(c, i * fontSize, y);
      ctx.shadowBlur = 0;

      if (y > h && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i] += 0.5 + Math.random() * 0.5;
    }
  }

  function drawSwarm() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(0, 0, w, h);
    ctx.font = fontSize + 'px monospace';
    ctx.shadowColor = '#22C55E';

    const elapsed = performance.now() - swarmStart;

    for (const p of swarmChars) {
      if (swarmPhase === 1) {
        // Move toward target
        const dx = swarmTarget.x - p.x;
        const dy = swarmTarget.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 5) {
          p.x += (dx / dist) * p.speed * 2;
          p.y += (dy / dist) * p.speed * 2;
        }
      } else if (swarmPhase === 2) {
        // Orbit
        p.orbitAngle += p.orbitSpeed;
        const radius = 50 + Math.sin(elapsed * 0.002) * 20;
        p.x = swarmTarget.x + Math.cos(p.orbitAngle) * radius;
        p.y = swarmTarget.y + Math.sin(p.orbitAngle) * radius;
      } else if (swarmPhase === 3) {
        // Scatter back to columns
        const targetX = p.origCol * fontSize;
        const targetY = p.origY * fontSize;
        p.x += (targetX - p.x) * 0.08;
        p.y += (targetY - p.y) * 0.08;
      }

      ctx.shadowBlur = swarmPhase === 2 ? 12 : 4;
      ctx.fillStyle = 'rgba(34,197,94,0.8)';
      p.char = chars[Math.random() * chars.length | 0];
      ctx.fillText(p.char, p.x, p.y);
    }
    ctx.shadowBlur = 0;
  }

  // Expose for hacker theme easter egg
  window._matrixRain = { canvas, ctx, intensify(on) {
    // Nothing needed — hacker theme just changes CSS filters on the canvas
  }};

  requestAnimationFrame(draw);
}
```

- [ ] **Step 2: Add text scramble for hero name**

In `main.js`, modify `initBlurReveal()` (line 37) to skip `.hero-name`:

```javascript
/* --- Blur Text Reveal --- */
function initBlurReveal() {
  document.querySelectorAll('.blur-reveal').forEach((el, elIndex) => {
    // Skip hero-name — handled by scramble
    if (el.classList.contains('hero-name')) return;
    const text = el.textContent.trim();
    /* ... rest unchanged ... */
```

Add a new function after `initBlurReveal`:

```javascript
/* --- Text Scramble (Hero Name) --- */
function initTextScramble() {
  const el = document.querySelector('.hero-name');
  if (!el) return;
  const finalText = el.textContent.trim();
  if (prefersReducedMotion) { el.style.opacity = '1'; return; }

  const scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*<>{}[]';
  const duration = 1500; // total time for all chars to settle
  const perChar = 50; // stagger per character
  el.style.fontFamily = 'var(--font-mono)';
  el.style.opacity = '1';
  el.textContent = '';

  // Create span per character
  const spans = [];
  for (let i = 0; i < finalText.length; i++) {
    const span = document.createElement('span');
    span.style.display = 'inline-block';
    span.style.minWidth = finalText[i] === ' ' ? '0.3em' : '';
    span.textContent = finalText[i] === ' ' ? '\u00A0' : scrambleChars[Math.random() * scrambleChars.length | 0];
    el.appendChild(span);
    spans.push({ el: span, final: finalText[i], settled: finalText[i] === ' ' });
  }

  const start = performance.now();
  function tick(now) {
    const elapsed = now - start;
    let allDone = true;
    for (let i = 0; i < spans.length; i++) {
      if (spans[i].settled) continue;
      const settleAt = i * perChar + 800; // 800ms scramble + stagger
      if (elapsed >= settleAt) {
        spans[i].el.textContent = spans[i].final;
        spans[i].settled = true;
      } else {
        spans[i].el.textContent = scrambleChars[Math.random() * scrambleChars.length | 0];
        allDone = false;
      }
    }
    if (!allDone) {
      requestAnimationFrame(tick);
    } else {
      // Switch to heading font after settle
      el.style.fontFamily = '';
    }
  }
  requestAnimationFrame(tick);
}
```

- [ ] **Step 3: Update hero-name CSS**

In `style.css`, modify `.hero-name` (lines 339-352) to start invisible:

```css
.hero-name {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: clamp(2.5rem, 8vw, 4rem);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  background: linear-gradient(110deg, var(--text-primary) 35%, var(--accent) 50%, var(--text-primary) 65%);
  background-size: 400% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shineText 4s linear infinite;
  opacity: 0; /* starts hidden, JS sets to 1 */
}
```

- [ ] **Step 4: Update DOMContentLoaded init**

In the DOMContentLoaded block, replace `initParticles();` with `initMatrixRain();` and add `initTextScramble();` after `initBlurReveal();`.

- [ ] **Step 5: Verify and commit**

Page should show: green matrix rain falling in hero background, name scrambles from random chars to "CHRISTOS GALAIOS", tagline/description blur-reveal as before.

```bash
git add index.html style.css main.js
git commit -m "feat: matrix rain hero + text scramble animation"
```

---

### Task 3: Rolling Digit Number Ticker

**Files:**
- Modify: `C:/Users/xgal/Desktop/Portfolio/index.html:65-88` (restructure stat HTML)
- Modify: `C:/Users/xgal/Desktop/Portfolio/style.css` (add rolling digit styles)
- Modify: `C:/Users/xgal/Desktop/Portfolio/main.js:57-78` (replace `animateCounters`)

- [ ] **Step 1: Add rolling digit CSS**

Add to `style.css` after existing `.stat-number` styles (~line 452):

```css
/* Rolling Digit Ticker */
.stat-number {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  height: 1.2em;
  line-height: 1.2;
}
.digit-col {
  display: inline-block;
  height: 1.2em;
  overflow: hidden;
  position: relative;
}
.digit-strip {
  display: flex;
  flex-direction: column;
  transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.digit-strip span {
  display: block;
  height: 1.2em;
  line-height: 1.2;
  text-align: center;
}
.digit-separator {
  display: inline-block;
  width: 0.3em;
}
.digit-suffix {
  opacity: 0;
  transition: opacity 0.3s ease-out;
}
.digit-suffix--visible {
  opacity: 1;
}
@media (prefers-reduced-motion: reduce) {
  .digit-strip { transition: none; }
  .digit-suffix { transition: none; opacity: 1; }
}
```

- [ ] **Step 2: Replace animateCounters with initRollingDigits**

In `main.js`, replace `animateCounters()` (lines 57-78):

```javascript
/* --- Rolling Digit Ticker --- */
function initRollingDigits() {
  const stats = document.querySelectorAll('.stat');
  if (!stats.length) return;

  stats.forEach(stat => {
    const numEl = stat.querySelector('.stat-number');
    const target = parseInt(stat.dataset.target, 10);
    const suffix = stat.dataset.suffix || '';
    const digits = target.toLocaleString().split('');

    numEl.textContent = '';
    const digitEls = [];

    digits.forEach((char, i) => {
      if (char === ',') {
        const sep = document.createElement('span');
        sep.className = 'digit-separator';
        sep.textContent = ',';
        numEl.appendChild(sep);
        return;
      }
      const col = document.createElement('span');
      col.className = 'digit-col';
      const strip = document.createElement('span');
      strip.className = 'digit-strip';
      for (let d = 0; d <= 9; d++) {
        const s = document.createElement('span');
        s.textContent = d;
        strip.appendChild(s);
      }
      col.appendChild(strip);
      numEl.appendChild(col);
      digitEls.push({ strip, target: parseInt(char, 10), index: i });
    });

    if (suffix) {
      const suf = document.createElement('span');
      suf.className = 'digit-suffix';
      suf.textContent = suffix;
      numEl.appendChild(suf);
    }

    // Scroll digits on intersection
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        if (prefersReducedMotion) {
          digitEls.forEach(d => {
            d.strip.style.transform = `translateY(-${d.target * 1.2}em)`;
          });
          const suf = numEl.querySelector('.digit-suffix');
          if (suf) suf.classList.add('digit-suffix--visible');
          observer.unobserve(entry.target);
          return;
        }
        // Stagger: rightmost settles first
        const totalDigits = digitEls.length;
        digitEls.forEach((d, idx) => {
          const delay = (totalDigits - 1 - idx) * 150;
          setTimeout(() => {
            d.strip.style.transform = `translateY(-${d.target * 1.2}em)`;
            if (typeof playSound === 'function') playSound('tick');
          }, delay);
        });
        // Show suffix after last digit settles
        const suf = numEl.querySelector('.digit-suffix');
        if (suf) {
          setTimeout(() => suf.classList.add('digit-suffix--visible'), totalDigits * 150 + 200);
        }
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.5 });
    observer.observe(stat);
  });
}
```

- [ ] **Step 3: Update DOMContentLoaded**

Replace `animateCounters();` with `initRollingDigits();`.

- [ ] **Step 4: Verify and commit**

Stats should show slot-machine rolling digits on scroll. Rightmost digit settles first.

```bash
git add style.css main.js
git commit -m "feat: rolling digit number ticker for stats"
```

---

### Task 4: Spotlight Card Effect

**Files:**
- Modify: `C:/Users/xgal/Desktop/Portfolio/style.css` (add spotlight pseudo-element)
- Modify: `C:/Users/xgal/Desktop/Portfolio/main.js` (add spotlight function)

- [ ] **Step 1: Add spotlight CSS**

Add to `style.css` after project card styles (~line 572):

```css
/* Spotlight Card Effect */
.project-showcase,
.project-card {
  --mouse-x: 50%;
  --mouse-y: 50%;
  position: relative;
}
.project-showcase::before,
.project-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(300px circle at var(--mouse-x) var(--mouse-y), rgba(34,197,94,0.08), transparent 60%);
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
  z-index: 1;
}
.project-showcase:hover::before,
.project-card:hover::before {
  opacity: 1;
}
```

Note: If `.project-card` or `.project-showcase` already have a `::before` pseudo-element, use `::after` instead and verify no conflict.

- [ ] **Step 2: Add spotlight JS**

In `main.js`, add before the init block:

```javascript
/* --- Spotlight Cards --- */
function initSpotlightCards() {
  const cards = document.querySelectorAll('.project-showcase, .project-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px');
      card.style.setProperty('--mouse-y', (e.clientY - rect.top) + 'px');
    });
  });
}
```

Add `initSpotlightCards();` to DOMContentLoaded.

- [ ] **Step 3: Verify and commit**

Hover over project cards — green radial glow should follow cursor.

```bash
git add style.css main.js
git commit -m "feat: spotlight card effect on project cards"
```

---

### Task 5: Magnetic CTA Buttons

**Files:**
- Modify: `C:/Users/xgal/Desktop/Portfolio/style.css` (add magnetic transitions)
- Modify: `C:/Users/xgal/Desktop/Portfolio/main.js` (add magnetic function)

- [ ] **Step 1: Add magnetic button CSS**

Add to `style.css`:

```css
/* Magnetic Buttons */
.magnetic-btn {
  will-change: transform;
  transition: transform 0.2s ease-out;
}
.magnetic-btn.releasing {
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@media (prefers-reduced-motion: reduce) {
  .magnetic-btn { transition: none !important; }
}
```

- [ ] **Step 2: Add magnetic button JS**

In `main.js`, add before the init block:

```javascript
/* --- Magnetic Buttons --- */
function initMagneticButtons() {
  if (prefersReducedMotion) return;
  const isMobile = window.matchMedia('(hover: none)').matches;
  if (isMobile) return;

  const selectors = '.project-cta, .contact-link, #cicd-run-btn, #pipeline-run-btn, #sprint-start';
  document.querySelectorAll(selectors).forEach(btn => {
    btn.classList.add('magnetic-btn');
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 80;
      if (dist < maxDist) {
        const pull = (1 - dist / maxDist) * 6;
        const nx = (dx / dist) * pull;
        const ny = (dy / dist) * pull;
        btn.classList.remove('releasing');
        btn.style.transform = `translate(${nx}px, ${ny}px)`;
      }
    });
    btn.addEventListener('mouseleave', () => {
      btn.classList.add('releasing');
      btn.style.transform = '';
    });
  });
}
```

Add `initMagneticButtons();` to DOMContentLoaded.

- [ ] **Step 3: Verify and commit**

Hover near CTA buttons — they should subtly pull toward cursor, spring back on leave.

```bash
git add style.css main.js
git commit -m "feat: magnetic CTA buttons"
```

---

### Task 6: Sound System

**Files:**
- Modify: `C:/Users/xgal/Desktop/Portfolio/index.html` (add sound toggle to nav)
- Modify: `C:/Users/xgal/Desktop/Portfolio/style.css` (style sound toggle)
- Modify: `C:/Users/xgal/Desktop/Portfolio/main.js` (add full sound system)

- [ ] **Step 1: Add sound toggle button to nav HTML**

In `index.html`, inside `.nav-right` (after the theme toggle button, before the nav-toggle button — between lines 35 and 36):

```html
<button class="sound-toggle" id="sound-toggle" aria-label="Toggle sound">
  <svg class="icon-sound-on" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
  <svg class="icon-sound-off" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
</button>
```

- [ ] **Step 2: Style the sound toggle**

Add to `style.css` after the `.theme-toggle` styles (~line 3926):

```css
/* Sound Toggle */
.sound-toggle {
  background: none;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.4rem;
  cursor: pointer;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s, border-color 0.2s;
}
.sound-toggle:hover {
  color: var(--accent);
  border-color: var(--border-hover);
}
```

- [ ] **Step 3: Add the sound system JS**

In `main.js`, add after `initTheme()` function (~line 34):

```javascript
/* --- Sound System --- */
let audioCtx = null;
let soundEnabled = true;
const masterVolume = 0.3;

function initSoundSystem() {
  const toggle = document.getElementById('sound-toggle');
  if (!toggle) return;

  // Default ON, persisted in localStorage
  const stored = localStorage.getItem('sound');
  soundEnabled = stored !== 'off'; // ON by default
  updateSoundToggle(toggle);

  toggle.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    localStorage.setItem('sound', soundEnabled ? 'on' : 'off');
    updateSoundToggle(toggle);
    ensureAudioCtx();
    if (soundEnabled) playSound('toggle');
  });

  // Create AudioContext on first user interaction
  document.addEventListener('click', ensureAudioCtx, { once: true });
  document.addEventListener('keydown', ensureAudioCtx, { once: true });
}

function updateSoundToggle(toggle) {
  toggle.querySelector('.icon-sound-on').style.display = soundEnabled ? '' : 'none';
  toggle.querySelector('.icon-sound-off').style.display = soundEnabled ? 'none' : '';
  toggle.setAttribute('aria-label', soundEnabled ? 'Mute sound' : 'Unmute sound');
}

function ensureAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

function playSound(type) {
  if (!soundEnabled || !audioCtx) return;
  const t = audioCtx.currentTime;
  const vol = audioCtx.createGain();
  vol.connect(audioCtx.destination);

  switch (type) {
    case 'click': {
      // Short mechanical click
      vol.gain.setValueAtTime(0.2 * masterVolume, t);
      vol.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      const osc = audioCtx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(400, t + 0.05);
      osc.connect(vol);
      osc.start(t);
      osc.stop(t + 0.05);
      break;
    }
    case 'whoosh': {
      // Gentle low whoosh using noise
      vol.gain.setValueAtTime(0, t);
      vol.gain.linearRampToValueAtTime(0.15 * masterVolume, t + 0.05);
      vol.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      const bufferSize = audioCtx.sampleRate * 0.2;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.3;
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, t);
      filter.frequency.exponentialRampToValueAtTime(200, t + 0.2);
      noise.connect(filter);
      filter.connect(vol);
      noise.start(t);
      noise.stop(t + 0.2);
      break;
    }
    case 'tick': {
      // Soft tick for digit settling
      vol.gain.setValueAtTime(0.15 * masterVolume, t);
      vol.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
      const osc = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, t);
      osc.connect(vol);
      osc.start(t);
      osc.stop(t + 0.03);
      break;
    }
    case 'toggle': {
      // Switch flick
      vol.gain.setValueAtTime(0.25 * masterVolume, t);
      vol.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      const osc = audioCtx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(1200, t + 0.04);
      osc.frequency.exponentialRampToValueAtTime(800, t + 0.08);
      osc.connect(vol);
      osc.start(t);
      osc.stop(t + 0.08);
      break;
    }
    case 'glass': {
      // Subtle glass tap for card hover
      vol.gain.setValueAtTime(0.15 * masterVolume, t);
      vol.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      const osc = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2000, t);
      osc.frequency.exponentialRampToValueAtTime(1500, t + 0.04);
      osc.connect(vol);
      osc.start(t);
      osc.stop(t + 0.04);
      break;
    }
    case 'purr': {
      // Short cat purr
      vol.gain.setValueAtTime(0.25 * masterVolume, t);
      vol.gain.linearRampToValueAtTime(0.2 * masterVolume, t + 0.15);
      vol.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      const osc = audioCtx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, t);
      // Vibrato for purr
      const lfo = audioCtx.createOscillator();
      const lfoGain = audioCtx.createGain();
      lfo.frequency.value = 25;
      lfoGain.gain.value = 15;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(t);
      lfo.stop(t + 0.3);
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 300;
      osc.connect(filter);
      filter.connect(vol);
      osc.start(t);
      osc.stop(t + 0.3);
      break;
    }
    case 'pew': {
      // Cartoon pew for cannon
      vol.gain.setValueAtTime(0.3 * masterVolume, t);
      vol.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      const osc = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, t);
      osc.frequency.exponentialRampToValueAtTime(200, t + 0.3);
      osc.connect(vol);
      osc.start(t);
      osc.stop(t + 0.4);
      break;
    }
    case 'typewriter': {
      // Keystroke tick
      vol.gain.setValueAtTime(0.1 * masterVolume, t);
      vol.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
      const osc = audioCtx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(600 + Math.random() * 400, t);
      osc.connect(vol);
      osc.start(t);
      osc.stop(t + 0.02);
      break;
    }
    case 'easter': {
      // Playful discovery chime
      vol.gain.setValueAtTime(0.3 * masterVolume, t);
      vol.gain.linearRampToValueAtTime(0.2 * masterVolume, t + 0.3);
      vol.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      const notes = [523, 659, 784]; // C5, E5, G5 — major chord arpeggio
      notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const g = audioCtx.createGain();
        g.gain.setValueAtTime(0, t + i * 0.1);
        g.gain.linearRampToValueAtTime(0.3 * masterVolume, t + i * 0.1 + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.4);
        osc.connect(g);
        g.connect(audioCtx.destination);
        osc.start(t + i * 0.1);
        osc.stop(t + i * 0.1 + 0.4);
      });
      break;
    }
    case 'glitch': {
      // Static/interference for hero text glitch
      vol.gain.setValueAtTime(0.2 * masterVolume, t);
      vol.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      const bufferSize = audioCtx.sampleRate * 0.2;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1);
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 2000;
      noise.connect(filter);
      filter.connect(vol);
      noise.start(t);
      noise.stop(t + 0.2);
      break;
    }
  }
}

// Expose globally so other functions can call it
window.playSound = playSound;
```

- [ ] **Step 4: Wire sounds into existing interactions**

Add sound hooks to existing functions. In `initNav()` — add `playSound('click')` on nav link clicks. In `initCardTilt()` — add `playSound('glass')` on mouseenter (with a 300ms cooldown to prevent spam). In `initTheme()` — add `playSound('toggle')` on theme switch. In `initScrollReveal()` — add `playSound('whoosh')` when element reveals (with cooldown). In `initMangoChat()` — add `playSound('purr')` on chat open. In the cannon fire code in `initMango()` — add `playSound('pew')`.

Each sound hook is a single line addition in the relevant event handler.

- [ ] **Step 5: Update DOMContentLoaded**

Add `initSoundSystem();` as the FIRST call in DOMContentLoaded (before `initTheme()`), so the sound system is available when other init functions try to play sounds.

- [ ] **Step 6: Verify and commit**

Toggle sound on/off. Click nav links, hover cards, open Mango chat, fire cannon — all should have sounds. Sounds should be subtle, not annoying.

```bash
git add index.html style.css main.js
git commit -m "feat: sound system with Web Audio API — 10 procedural sounds"
```

---

### Task 7: Typewriter Sprint Log + Loading Skeletons

**Files:**
- Modify: `C:/Users/xgal/Desktop/Portfolio/style.css` (typewriter cursor, skeleton styles)
- Modify: `C:/Users/xgal/Desktop/Portfolio/main.js:947-954` (modify `addLog` function)

- [ ] **Step 1: Add typewriter + skeleton CSS**

Add to `style.css`:

```css
/* Typewriter Cursor */
.sprint-log-line--typing::after {
  content: '|';
  animation: blink 530ms step-end infinite;
  color: var(--accent);
  font-weight: bold;
}
@keyframes blink {
  50% { opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .sprint-log-line--typing::after { animation: none; }
}

/* Loading Skeletons */
.skeleton-loading {
  position: relative;
  overflow: hidden;
}
.skeleton-loading > * {
  visibility: hidden;
}
.skeleton-loading::before,
.skeleton-loading::after {
  content: '';
  position: absolute;
  background: var(--bg-card-hover);
  border-radius: 8px;
  visibility: visible;
}
.skeleton-loading::before {
  top: 1rem; left: 1rem; right: 30%; height: 16px;
}
.skeleton-loading::after {
  top: 2.5rem; left: 1rem; right: 50%; height: 16px;
  animation: shimmer 1.5s ease-in-out infinite;
}
```

- [ ] **Step 2: Modify addLog for typewriter effect**

In `main.js`, replace the `addLog` function inside `initSprintSim()` (lines 947-954):

```javascript
  let typewriterQueue = [];
  let isTyping = false;

  function addLog(text, type) {
    typewriterQueue.push({ text, type });
    if (!isTyping) processTypewriterQueue();
  }

  function processTypewriterQueue() {
    if (!typewriterQueue.length) { isTyping = false; return; }
    isTyping = true;
    const { text, type } = typewriterQueue.shift();
    const line = document.createElement('div');
    line.className = `sprint-log-line sprint-log-line--${type} sprint-log-line--typing`;
    const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const fullText = `[${time}] ${text}`;

    if (prefersReducedMotion) {
      line.textContent = fullText;
      line.classList.remove('sprint-log-line--typing');
      log.appendChild(line);
      log.scrollTop = log.scrollHeight;
      processTypewriterQueue();
      return;
    }

    line.textContent = '';
    log.appendChild(line);
    let i = 0;
    function typeChar() {
      if (i < fullText.length) {
        line.textContent += fullText[i];
        log.scrollTop = log.scrollHeight;
        if (typeof playSound === 'function') playSound('typewriter');
        i++;
        setTimeout(typeChar, 25 + Math.random() * 15); // 25-40ms per char
      } else {
        line.classList.remove('sprint-log-line--typing');
        setTimeout(processTypewriterQueue, 200); // pause between lines
      }
    }
    typeChar();
  }
```

- [ ] **Step 3: Add skeleton toggle for hub demo tabs**

In `main.js`, find the hub demo tab switching logic inside `initHubDemo()`. When a tab is clicked, before showing the content, add:

```javascript
// Inside tab click handler, before showing content:
const content = /* the content panel */;
content.classList.add('skeleton-loading');
setTimeout(() => {
  content.classList.remove('skeleton-loading');
}, 300);
```

This needs to be placed in the existing tab-click handler within `initHubDemo()`. The skeleton class hides children and shows placeholder rectangles for 300ms.

- [ ] **Step 4: Verify and commit**

Start the sprint simulation — log entries should type out character by character with a blinking cursor. Switch hub demo tabs — brief skeleton flash before content appears.

```bash
git add style.css main.js
git commit -m "feat: typewriter sprint log + loading skeletons"
```

---

### Task 8: Easter Eggs

**Files:**
- Modify: `C:/Users/xgal/Desktop/Portfolio/index.html` (footer easter egg div, overscroll div)
- Modify: `C:/Users/xgal/Desktop/Portfolio/style.css` (hacker theme, easter egg styles)
- Modify: `C:/Users/xgal/Desktop/Portfolio/main.js` (easter egg functions)

Note: Easter egg #5 (canvas swarm) is already implemented in Task 2 inside `initMatrixRain()`.

- [ ] **Step 1: Add easter egg HTML**

In `index.html`, add inside `.footer` after the `<p>` (after line 1330):

```html
<p class="footer-easter" id="footer-easter" aria-hidden="true">While you're still overthinking it, someone else is scheduling my interview.</p>
```

Add after the closing `</footer>` tag (after line 1332):

```html
<!-- Overscroll Easter Egg -->
<div class="overscroll-msg" id="overscroll-msg" aria-hidden="true">
  <p>While you're still overthinking it, someone else is scheduling my interview.</p>
</div>
<div class="mango-peek" id="mango-peek" aria-hidden="true">
  <svg width="60" height="40" viewBox="0 0 60 40"><ellipse cx="30" cy="25" rx="20" ry="15" fill="#f5a623"/><circle cx="22" cy="20" r="4" fill="#333"/><circle cx="38" cy="20" r="4" fill="#333"/><circle cx="23" cy="19" r="1.5" fill="#fff"/><circle cx="39" cy="19" r="1.5" fill="#fff"/><polygon points="18,8 12,18 24,18" fill="#f5a623"/><polygon points="42,8 36,18 48,18" fill="#f5a623"/><ellipse cx="30" cy="28" rx="3" ry="2" fill="#ff9a9a"/></svg>
</div>
```

- [ ] **Step 2: Add easter egg CSS**

Add to `style.css`:

```css
/* === EASTER EGGS === */

/* Hacker Theme */
html.theme-hacker {
  --bg-primary: #000;
  --bg-secondary: #0a0a0a;
  --bg-card: #0a0f0a;
  --bg-card-hover: #0a1a0a;
  --text-primary: #00ff00;
  --text-secondary: #00cc00;
  --text-muted: #008800;
  --accent: #00ff00;
  --accent-glow: rgba(0, 255, 0, 0.2);
  --accent-secondary: #00cc00;
  --border: #003300;
  --border-hover: #00ff00;
}
html.theme-hacker * {
  font-family: var(--font-mono) !important;
}
html.theme-hacker .hero-particles {
  filter: brightness(2) saturate(2);
}
html.theme-hacker .nav-links a::before {
  content: '> ';
  color: var(--accent);
}
html.theme-hacker::after {
  content: '';
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0,255,0,0.03) 2px,
    rgba(0,255,0,0.03) 4px
  );
  pointer-events: none;
  z-index: 9999;
}
html.theme-hacker-exit {
  transition: all 1s ease-out;
}

/* Footer Easter Egg */
.footer-easter {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-muted);
  font-style: italic;
  opacity: 0;
  max-height: 0;
  overflow: hidden;
  transition: opacity 0.5s, max-height 0.5s;
}
.footer-easter--visible {
  opacity: 1;
  max-height: 2rem;
  margin-top: 0.5rem;
}

/* Overscroll Easter Egg */
.overscroll-msg {
  text-align: center;
  padding: 2rem 1rem;
  opacity: 0;
  transition: opacity 0.5s;
}
.overscroll-msg--visible {
  opacity: 1;
}
.overscroll-msg p {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--text-muted);
  font-style: italic;
}

/* Mango Peek */
.mango-peek {
  position: fixed;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  transition: bottom 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 60;
  pointer-events: none;
}
.mango-peek--visible {
  bottom: 0;
}

/* Hero Glitch */
.hero-content--glitch {
  animation: heroGlitch 200ms steps(3);
}
@keyframes heroGlitch {
  0%, 100% { transform: translate(0); }
  25% { transform: translate(-2px, 1px); }
  50% { transform: translate(2px, -1px); }
  75% { transform: translate(-1px, -2px); }
}
```

- [ ] **Step 3: Add easter egg JS**

In `main.js`, add before the init block:

```javascript
/* --- Easter Eggs --- */
function initEasterEggs() {
  // === 1. CG Logo × 5 → Hacker Theme (10s) ===
  const logo = document.querySelector('.nav-logo');
  if (logo) {
    let logoClicks = 0, logoTimer = null;
    logo.addEventListener('click', (e) => {
      // Don't prevent default nav — just track extra clicks
      logoClicks++;
      clearTimeout(logoTimer);
      logoTimer = setTimeout(() => { logoClicks = 0; }, 2000);
      if (logoClicks >= 5) {
        logoClicks = 0;
        e.preventDefault();
        playSound('easter');
        document.documentElement.classList.add('theme-hacker');
        setTimeout(() => {
          document.documentElement.classList.add('theme-hacker-exit');
          document.documentElement.classList.remove('theme-hacker');
          setTimeout(() => document.documentElement.classList.remove('theme-hacker-exit'), 1000);
        }, 10000);
      }
    });
  }

  // === 2. Footer Hover 3s → Cheeky Message ===
  const footer = document.querySelector('.footer');
  const footerEaster = document.getElementById('footer-easter');
  const mangoPeek = document.getElementById('mango-peek');
  if (footer && footerEaster) {
    let footerTimer = null;
    footer.addEventListener('mouseenter', () => {
      footerTimer = setTimeout(() => {
        footerEaster.classList.add('footer-easter--visible');
        if (mangoPeek) mangoPeek.classList.add('mango-peek--visible');
        playSound('easter');
      }, 3000);
    });
    footer.addEventListener('mouseleave', () => {
      clearTimeout(footerTimer);
      footerEaster.classList.remove('footer-easter--visible');
      if (mangoPeek) mangoPeek.classList.remove('mango-peek--visible');
    });
  }

  // === 3. Select Hero Text → Glitch ===
  const heroContent = document.querySelector('.hero-content');
  let glitchFired = false;
  if (heroContent) {
    heroContent.addEventListener('mouseup', () => {
      if (glitchFired) return;
      const sel = window.getSelection();
      if (!sel || sel.toString().trim().length === 0) return;
      glitchFired = true;
      playSound('glitch');
      // Scramble all visible text in hero
      const textEls = heroContent.querySelectorAll('.hero-name, .hero-tagline, .hero-description');
      const originals = [];
      const scrambleChars = '!@#$%^&*<>{}[]~|/\\';
      textEls.forEach(el => {
        originals.push({ el, text: el.textContent });
      });
      const glitchInterval = setInterval(() => {
        originals.forEach(({ el }) => {
          el.textContent = el.textContent.split('').map(c =>
            c === ' ' ? ' ' : scrambleChars[Math.random() * scrambleChars.length | 0]
          ).join('');
        });
      }, 30);
      heroContent.classList.add('hero-content--glitch');
      setTimeout(() => {
        clearInterval(glitchInterval);
        originals.forEach(({ el, text }) => { el.textContent = text; });
        heroContent.classList.remove('hero-content--glitch');
      }, 200);
    });
  }

  // === 4. Overscroll Past Footer ===
  const overscrollMsg = document.getElementById('overscroll-msg');
  if (overscrollMsg) {
    let overscrollShown = false;
    window.addEventListener('scroll', () => {
      const atBottom = (window.innerHeight + window.scrollY) >= document.body.scrollHeight - 5;
      if (atBottom && !overscrollShown) {
        overscrollShown = true;
        overscrollMsg.classList.add('overscroll-msg--visible');
        if (mangoPeek) mangoPeek.classList.add('mango-peek--visible');
        playSound('easter');
      } else if (!atBottom && overscrollShown) {
        overscrollShown = false;
        overscrollMsg.classList.remove('overscroll-msg--visible');
        if (mangoPeek) mangoPeek.classList.remove('mango-peek--visible');
      }
    });
  }

  // === 5. Canvas Swarm — already in initMatrixRain() ===
}
```

Add `initEasterEggs();` to DOMContentLoaded.

- [ ] **Step 4: Verify and commit**

Test all 5:
1. Click CG logo 5 times fast → hacker theme for 10s
2. Hover footer for 3s → cheeky text + Mango peek
3. Select hero text → 200ms glitch
4. Scroll to absolute bottom → overscroll message + Mango
5. Click hero canvas 3 times → character swarm (from Task 2)

```bash
git add index.html style.css main.js
git commit -m "feat: 5 easter eggs — hacker theme, footer, glitch, overscroll, swarm"
```

---

### Task 9: Contact Section Shader

**Files:**
- Modify: `C:/Users/xgal/Desktop/Portfolio/index.html:1091` (add canvas)
- Modify: `C:/Users/xgal/Desktop/Portfolio/style.css` (shader canvas styles)
- Modify: `C:/Users/xgal/Desktop/Portfolio/main.js` (WebGL shader)

- [ ] **Step 1: Add shader canvas to contact section**

In `index.html`, inside `.contact` section (line 1091), add a canvas as the first child:

```html
<section class="contact" id="contact">
  <canvas class="contact-shader" id="contact-shader"></canvas>
  <div class="container contact-inner">
```

- [ ] **Step 2: Add shader CSS**

Add to `style.css`:

```css
/* Contact Shader */
.contact {
  position: relative;
  overflow: hidden;
}
.contact-shader {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.35;
  pointer-events: none;
}
.contact-inner {
  position: relative;
  z-index: 1;
}
```

- [ ] **Step 3: Add WebGL shader JS**

In `main.js`, add before the init block:

```javascript
/* --- Contact Shader --- */
function initContactShader() {
  const canvas = document.getElementById('contact-shader');
  if (!canvas || prefersReducedMotion) return;

  // Lazy init: only start when contact section is visible
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      observer.disconnect();
      startShader(canvas);
    }
  }, { threshold: 0.1 });
  observer.observe(canvas.parentElement);
}

function startShader(canvas) {
  const gl = canvas.getContext('webgl');
  if (!gl) {
    // Fallback: CSS gradient is already on the section
    return;
  }

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener('resize', resize);

  const vertSrc = `
    attribute vec2 pos;
    void main() { gl_Position = vec4(pos, 0, 1); }
  `;
  const fragSrc = `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_res;

    void main() {
      vec2 uv = gl_FragCoord.xy / u_res;
      float t = u_time * 0.3;

      // Organic blobs
      float d1 = length(uv - vec2(0.3 + sin(t * 0.7) * 0.2, 0.5 + cos(t * 0.5) * 0.3));
      float d2 = length(uv - vec2(0.7 + cos(t * 0.6) * 0.2, 0.4 + sin(t * 0.8) * 0.3));
      float d3 = length(uv - vec2(0.5 + sin(t * 0.4) * 0.3, 0.6 + cos(t * 0.9) * 0.2));

      float blob = smoothstep(0.4, 0.0, d1) + smoothstep(0.35, 0.0, d2) + smoothstep(0.3, 0.0, d3);
      blob = clamp(blob, 0.0, 1.0);

      // Green + teal palette
      vec3 green = vec3(0.133, 0.773, 0.369); // #22C55E
      vec3 teal = vec3(0.231, 0.510, 0.957);  // #3B82F6
      vec3 col = mix(teal, green, blob * 0.8 + sin(t + uv.x * 3.0) * 0.2);

      gl_FragColor = vec4(col * blob * 0.6, blob * 0.5);
    }
  `;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('Shader compile error:', gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  const vert = compile(gl.VERTEX_SHADER, vertSrc);
  const frag = compile(gl.FRAGMENT_SHADER, fragSrc);
  if (!vert || !frag) return;

  const prog = gl.createProgram();
  gl.attachShader(prog, vert);
  gl.attachShader(prog, frag);
  gl.linkProgram(prog);
  gl.useProgram(prog);

  // Full-screen quad
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const posLoc = gl.getAttribLocation(prog, 'pos');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(prog, 'u_time');
  const uRes = gl.getUniformLocation(prog, 'u_res');

  function render(t) {
    gl.uniform1f(uTime, t * 0.001);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}
```

Add `initContactShader();` to DOMContentLoaded.

- [ ] **Step 4: Verify and commit**

Scroll to contact section — should see slowly morphing green/teal blobs behind "Let's Build Something" text.

```bash
git add index.html style.css main.js
git commit -m "feat: WebGL shader background on contact section"
```

---

### Task 10: Final Wiring + Integration Pass

**Files:**
- Modify: `C:/Users/xgal/Desktop/Portfolio/main.js` (DOMContentLoaded block)

- [ ] **Step 1: Update DOMContentLoaded init order**

Replace the entire DOMContentLoaded block:

```javascript
document.addEventListener('DOMContentLoaded', () => {
  initSoundSystem();       // Must be first — others call playSound
  initTheme();
  initTextScramble();      // New — hero name scramble
  initBlurReveal();        // Modified — skips hero-name
  initRollingDigits();     // Replaces animateCounters
  initScrollReveal();
  initScrollProgress();    // New
  initNav();
  initCardTilt();
  initCVCards();
  initSpotlightCards();    // New
  initMagneticButtons();   // New
  initCompass();
  initDevGuideCompass();
  initPipelineSim();
  initMango();
  initMangoChat();
  initLazyIframes();
  initHubDemo();
  initSprintSim();         // Modified — typewriter log
  initAugmentDemo();
  initIdeaGenerator();
  initContentPrompts();
  initEnhancedScoring();
  initCICDDemo();
  initMatrixRain();        // Replaces initParticles
  initContactShader();     // New
  initLightbox();
  initEasterEggs();        // New — must be last (depends on other elements)
});
```

- [ ] **Step 2: Remove old animateCounters and initParticles functions**

Delete the old `animateCounters()` function body (replaced by `initRollingDigits`) and the old `initParticles()` function body (replaced by `initMatrixRain`). Ensure no references to the old function names remain.

- [ ] **Step 3: Smoke test full page**

Open the page and verify:
- Matrix rain in hero, name scrambles on load
- Stats roll like slot machine digits
- Scroll progress bar appears after hero
- Cards have spotlight glow + 3D tilt
- Buttons pull toward cursor
- Sound toggle works, sounds play on interactions
- Sprint log types character-by-character
- Hub demo tabs show skeleton flash
- All 5 easter eggs work
- Contact section has shader background
- SocialiseApp desktop is 16:9
- DevGuide section is centered
- Light theme still works
- Mobile responsive works (no horizontal scroll)

- [ ] **Step 4: Commit**

```bash
git add index.html style.css main.js
git commit -m "feat: wire all polish features + final integration"
```

---

## Task Dependency Graph

```
Task 0 (layout fixes) ─── independent
Task 1 (scroll progress) ─── independent
Task 2 (matrix rain + scramble) ─── independent (includes easter egg #5)
Task 3 (rolling digits) ─── independent
Task 4 (spotlight cards) ─── independent
Task 5 (magnetic buttons) ─── independent
Task 6 (sound system) ─── independent (but other tasks reference playSound)
Task 7 (typewriter + skeletons) ─── depends on Task 6 (playSound)
Task 8 (easter eggs) ─── depends on Task 2 (swarm), Task 6 (playSound)
Task 9 (contact shader) ─── independent
Task 10 (wiring) ─── depends on ALL above
```

**Parallelizable groups:**
- `[PARALLEL]` Tasks 0, 1, 2, 3, 4, 5, 6, 9 — all independent
- `[SEQUENTIAL]` Task 7 after Task 6
- `[SEQUENTIAL]` Task 8 after Tasks 2 + 6
- `[SEQUENTIAL]` Task 10 after ALL
