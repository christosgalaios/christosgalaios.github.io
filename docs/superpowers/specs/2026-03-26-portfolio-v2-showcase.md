# Portfolio V2 — Interactive Showcase Edition

**Date:** 2026-03-26
**Status:** Spec — ready for implementation
**Repo:** `christosgalaios/christosgalaios.github.io`
**Approach:** The portfolio IS a sandbox playground. Every project is demonstrated live, not described. Minimise telling, maximise showing.

---

## Design Philosophy

The portfolio should feel like opening a toy box of interactive demos. Every section is something you can click, drag, watch, or play with. Nothing is static text unless it has to be. The visitor should think "this person builds things that WORK" within 10 seconds.

---

## V1 (Already Built & Live)

- [x] Hero with photo (spinning gradient ring), blur text reveal
- [x] Stats bar with counter animations
- [x] SocialiseHub: screenshots + 4-tab interactive demo (sync flow, events, analytics charts, MCP terminal)
- [x] Interactive CV: mini card battle (objection vs counter) with 3D tilt + shimmer + iframe embed
- [x] Agentic Workflow: expanded detail cards + full sprint simulation (CEO/Manager/QA/2 Devs, file watchers, MCP calls, learnings, performance reviews, mid-sprint reprioritization)
- [x] Mango mascot (draggable, 7 SVG poses, idle states)
- [x] Mango chat UI (needs edge function deployed)
- [x] Floating compass (cursor-tracking, back to top)
- [x] Dark/light theme toggle
- [x] Socialise AI-researched color palette dots
- [x] 3D card tilt on all project cards
- [x] Experience timeline, education, contact

---

## V2 — Outstanding Feature Requests

### 1. Mango AI Chat (Backend)

**What:** Click Mango → chat panel opens → ask anything about Christos → Mango answers as his advocate, always positive, always pivoting to strengths.

**Implementation:**
- Supabase Edge Function at `esifhltywxujunfvlgcc` project → `mango-chat`
- Edge function code already written at `supabase/functions/mango-chat/index.ts`
- Uses Claude Haiku 4.5 with full CV baked into system prompt
- Frontend chat UI already built
- **Blocker:** Supabase MCP was down. Deploy via CLI: `supabase functions deploy mango-chat --project-ref esifhltywxujunfvlgcc`
- **Secret needed:** `ANTHROPIC_API_KEY` as Supabase secret

**Mango personality rules:**
- Never say Christos lacks experience — always pivot to related strengths
- Warm, cheeky, concise (2-4 sentences)
- Occasional cat touches (purr, meow) but not overdone
- Third person for Christos, first person for Mango

---

### 2. Hub Demo: AI Score with Suggestions

**What:** When "AI Score All Events" is clicked, don't just show a number — show actionable AI suggestions for each event.

**Implementation:** After scoring, each event card expands to show:
- Score (already built)
- **Suggestion text** (e.g., "Add early bird pricing — similar events saw 40% more signups", "Move to Saturday — Friday events in this category underperform by 25%", "Title is too long — shorten to under 8 words for better Meetup CTR")
- **Improvement tags** (pricing, timing, copy, category)

**Data:** Hardcoded realistic suggestions based on the actual Socialise event types.

---

### 3. Hub Demo: Copy-Paste AI Integration with JSON Parsing

**What:** Show how the Hub's AI augmentation works — user copies event data, AI parses it, normalizes field names, shape-checks with typeof, applies ?? defaults and String() wrapping before rendering.

**Implementation:** Interactive demo panel:
1. Show a raw JSON blob (messy, inconsistent field names — `eventName` vs `name` vs `title`)
2. Click "AI Augment" button
3. Animated step-by-step transformation:
   - Step 1: "Normalizing field names..." → fields rename visually
   - Step 2: "Shape-checking types..." → typeof checks appear
   - Step 3: "Applying defaults..." → null/undefined values get `?? 'Unknown'`
   - Step 4: "Wrapping for JSX..." → String() wrapping appears
4. Output: clean, safe, render-ready object
5. Highlight the rule: "Never pass raw LLM responses to the frontend"

---

### 4. Hub Demo: AI Event Idea Generator

**What:** Show how the Hub generates event ideas driven by market analysis and actual community data.

**Implementation:** Interactive demo:
1. Show data inputs feeding into the generator:
   - **Market data:** "Bristol event trends", "competitor analysis", "seasonal patterns"
   - **Community data:** "3,112 members", "top categories: hiking (35 avg), speed friending (42 avg), board games (28 avg)", "Friday 7pm peak attendance"
   - **Financial data:** "avg ticket price £5.50", "paid events 3x revenue of free", "venue costs £50-150"
2. Click "Generate Ideas"
3. Animated idea cards appear with:
   - Event name (e.g., "Sunset Kayaking Social")
   - Projected attendees, revenue, fill rate
   - Reasoning: "Based on: outdoor events peak in summer + 35 avg for hiking + kayaking trending in Bristol meetup scene"
   - Financial projection breakdown
4. Shows this is data-driven, not random

---

### 5. Hub Demo: AI Image Prompt Generation

**What:** Show how the content pipeline generates image/video prompts based on event context.

**Implementation:** Interactive demo:
1. Show an event card (e.g., "Speed Friending Social — Fri 7pm, The Lanes, 42 going")
2. Click "Generate Content"
3. Animated prompt construction:
   - Context extraction: "category: social, venue: pub, time: evening, attendees: 42, brand: warm/inclusive"
   - Prompt assembly: "Warm candlelit pub interior, diverse group of 6 people laughing around a table, speed friending cards visible, cozy evening atmosphere, terracotta and teal color palette, shot from slight above"
   - Platform adaptation: "TikTok (9:16, punchy, hook in 0.5s)" / "Instagram (1:1, aesthetic)" / "Story (9:16, poll overlay)"
4. Show 3 composition variants generated from the same event data

---

### 6. Agentic Sprint Demo Enhancements

**Already built:** Full CEO/Manager/QA/Dev simulation with file watchers, MCP calls, learnings, performance reviews.

**Enhancements needed:**
- CEO idle thinking: Show the CEO reasoning about business opportunities between sprints (content gen pipeline, pricing experiments, member retention)
- Manager planning ahead: While devs work, Manager researches next sprint's tickets, estimates complexity, assigns model tiers
- More realistic performance review: CEO compares sprint velocity across weeks, identifies patterns
- Permanent learnings shown accumulating: visual counter + the actual rules appearing

---

### 7. DevGuide Compass (Exact Replica)

**What:** The floating compass from devguide.co.uk that tracks the cursor and acts as back-to-top.

**Status:** Partially built — compass HTML/SVG and basic JS are in place. Need to:
- Verify cursor tracking works correctly
- Add idle sway animation (sine/cosine waves when cursor inactive for 3s)
- Match the exact gradient colors (currently green, DevGuide uses teal — keep green for portfolio brand)
- Touch support for mobile

---

### 8. DevGuide Dark Mode Toggle (Exact Replica)

**Status:** Partially built — theme toggle button is in nav, light/dark CSS variables are defined.

**Need to:**
- Verify toggle works end-to-end
- Test light mode appearance across all sections
- Add the 45° SVG rotation on click
- FOUC prevention script already added

---

### 9. Interactive Demos for ALL Projects

Each project should have a live interactive element, not just a description:

**SocialiseApp:**
- Mango is already on the page (drag him around)
- Add: mini gamification demo — click to earn XP, watch level bar fill, unlock a title
- Add: micro-meet matching animation — show 6 user avatars, click "Match", watch them sort into groups of 4 based on shared interests

**DevGuide:**
- Add: **Autonomous pipeline simulation** — the full daily cycle animated:
  1. GitHub Actions cron fires at 03:00 UTC
  2. DiscoveryAgent scans 3 niches (dev tools comparisons, micro-niche compatibility, JP/CN tech news)
  3. ContentAgent generates 1,200+ word article with SEO structure
  4. ValidationAgent runs quality gate (word count, structure, tone, keyword safety checks — show pass/fail)
  5. DistributionAgent publishes to site/, updates index + sitemap + RSS
  6. Show article appearing on the live site
  7. Counter: "44 articles published. Zero human intervention. Zero ongoing cost."
- **Inline compass demo** — a large compass (120px+) centered in the DevGuide project card, impossible to miss. Visitor moves their mouse and the needle follows. Below it: "This compass tracks your cursor. On devguide.co.uk it doubles as a back-to-top button. I think about UX details like this." The floating compass in the bottom-right is subtle by design — this one is the showcase version, big and obvious.
- Show the "built in 2 hours" timeline — fast-forward through the build process
- Show real article titles from the live site to prove it works

**Socialise Website:**
- Embed iframe of the live site
- Add: mouse-tracking spotlight effect demo — a small area where the visitor can see the effect working

**Edge AI Robot:**
- Add: simulated camera feed with object detection boxes overlaid
- Show the LLM decision loop: "I see a cup → pick_up(cup) → navigate_to(table) → place(cup)"

---

### 10. 21st.dev Components to Add

Research and integrate more animated components from 21st.dev:

- **Animated text gradient** — for section headers
- **Particle background** — subtle, behind hero (replace dot grid)
- **Spotlight card effect** — mouse-tracking radial glow on project cards
- **Magnetic buttons** — CTAs that subtly pull toward cursor
- **Staggered grid animation** — project cards enter with staggered spring physics
- **Scroll progress indicator** — thin bar at top showing scroll position
- **Typewriter effect** — for the sprint simulation log
- **Number ticker** — smoother version of the stat counters (rolling digits)

---

### 11. Overall Sandbox Feel

- Navigation between demos should feel seamless — everything is on one page but each demo is a "world" you enter
- Subtle sound effects on interactions (optional, toggleable) — click sounds, Mango chirps
- Easter eggs — hidden interactions that reward curious visitors
- Loading states for demos — skeleton screens, not blank spaces
- Every clickable element should feel alive — hover states, micro-animations, cursor changes

---

## Implementation Priority

| Priority | Feature | Complexity | Impact |
|----------|---------|-----------|--------|
| 1 | Deploy Mango AI chat | Low (CLI deploy) | High — visitors can ask questions |
| 2 | AI Score with suggestions | Medium | High — shows AI reasoning |
| 3 | JSON parsing demo | Medium | High — shows engineering discipline |
| 4 | Event idea generator | Medium | High — shows data-driven thinking |
| 5 | Image prompt generation | Medium | High — shows content pipeline |
| 6 | Sprint demo enhancements | Low | Medium — already strong |
| 7 | SocialiseApp mini demos | Medium | Medium — Mango already there |
| 8 | DevGuide pipeline viz | Medium | Medium |
| 9 | More 21st.dev components | Low each | Medium — polish |
| 10 | Edge AI robot sim | Medium | Lower — WIP project |

---

### 12. Interactive Analytics Graphs

**What:** The Hub's analytics charts should be fully interactive, not just animated bars. Visitors should be able to play with the data like it's a real dashboard.

**Implementation:**
- **Member Growth Chart:** Hover to see exact numbers per month. Click a bar to "drill down" — show new vs returning members, top event categories that month, growth rate %
- **Revenue Chart:** Hover for monthly breakdown. Toggle between revenue, avg ticket price, paid vs free event ratio
- **Attendance Heatmap:** Day-of-week × time-of-day grid colored by average attendance. Based on real data shape (Saturday afternoons = peak, Tuesday mornings = dead). Click a cell to see "Best performing events at this time"
- **Fill Rate by Category:** Horizontal bar chart showing avg fill rate for hiking, speed friending, board games, comedy, pub quiz etc.
- **Venue Performance:** Scatter plot or ranked list showing venue × avg attendance × avg revenue
- **Chart controls:** Time range selector (3mo / 6mo / 1yr / all), chart type toggle where appropriate
- All built in vanilla JS using Canvas API or pure SVG — no Chart.js or D3 dependency
- Tooltips, hover states, click interactions on every data point
- Data is hardcoded but shaped from the real Socialise analytics (we have the actual numbers from the trends.json files)

### 13. CI/CD Pipeline Demo

**What:** Show the full automated pipeline — not just "we have CI" but the entire flow animated and interactive.

**Implementation:** Interactive pipeline visualization:
1. **Git Workflow:** Show the rebase-before-push flow animated:
   - `git fetch origin develop`
   - `git rebase origin/develop`
   - Conflict detected → resolve → lint → `git rebase --continue`
   - `git push --force-with-lease`
   - Show why: "bare git push causes divergence. This is a permanent learned rule."

2. **Pre-commit Hooks:** Show hooks firing on commit:
   - Auto type-check on `.ts`/`.tsx` edits
   - Block `.env` edits (security gate)
   - Lint check before commit passes
   - Self-reflect on merge (hook reviews the diff)

3. **CI Pipeline:** Animated GitHub Actions workflow:
   - Push triggers CI → lint → tsc → test (1,671 passing) → build
   - Show test results streaming in
   - Green checkmark → auto-merge to develop
   - Deploy workflow fires → build → deploy to GitHub Pages
   - Show the gotcha: "Workflow changes must land on TARGET branch to take effect"

4. **6-Environment Release Pipeline** (from Koffee Cup):
   - Dev → Shared → QA → Review → Partner QA → Live
   - Show dual-lane parallel development (LiveOps + Features)
   - Animated flow with gates between each environment

5. **Test Coverage:**
   - Show test count accumulating: 1,671 (Hub) + 548 (App) + 40 (DevGuide) = 2,259 total
   - Show test categories: stores, routes, validation, automation, analytics
   - Click a category to see example test names

**Key messaging:** "Every commit is guarded. Every push is rebased. Every merge is reviewed. The pipeline enforces discipline — humans make mistakes, automation doesn't."

---

### 14. Mango position: left, Compass position: right

**Status:** Done in this commit.

---

## Technical Notes

- All demos are vanilla JS — no React, no build tools
- Keep total page weight under 1MB including images
- All animations respect `prefers-reduced-motion`
- Every interactive element needs keyboard accessibility
- Test at 375px, 768px, 1024px, 1440px
- Supabase Edge Function for Mango chat is the only external dependency
