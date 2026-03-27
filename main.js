/* ============================================
   Portfolio — Main JS
   ============================================ */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* --- Theme Toggle --- */
function initTheme() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  function getTheme() {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    toggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    toggle.querySelector('.icon-sun').style.display = theme === 'dark' ? '' : 'none';
    toggle.querySelector('.icon-moon').style.display = theme === 'light' ? '' : 'none';
  }

  applyTheme(getTheme());

  toggle.addEventListener('click', () => {
    document.documentElement.classList.add('theme-transition');
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    applyTheme(current === 'dark' ? 'light' : 'dark');
    setTimeout(() => document.documentElement.classList.remove('theme-transition'), 500);
  });
}

/* --- Blur Text Reveal --- */
function initBlurReveal() {
  document.querySelectorAll('.blur-reveal').forEach((el, elIndex) => {
    const text = el.textContent.trim();
    el.textContent = '';
    text.split(/\s+/).forEach((word, i, arr) => {
      const span = document.createElement('span');
      span.className = 'blur-word';
      span.textContent = word;
      el.appendChild(span);
      if (i < arr.length - 1) el.appendChild(document.createTextNode('\u00A0'));
    });
    const spans = el.querySelectorAll('.blur-word');
    if (prefersReducedMotion) { spans.forEach(s => s.classList.add('blur-word--visible')); return; }
    spans.forEach((span, i) => {
      setTimeout(() => span.classList.add('blur-word--visible'), 200 + (elIndex * 400) + (i * 100));
    });
  });
}

/* --- Counter Animation --- */
function animateCounters() {
  const stats = document.querySelectorAll('.stat');
  if (!stats.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target.querySelector('.stat-number');
      const target = parseInt(entry.target.dataset.target, 10);
      const suffix = entry.target.dataset.suffix || '';
      if (prefersReducedMotion) { el.textContent = target.toLocaleString() + suffix; observer.unobserve(entry.target); return; }
      const duration = 1500, start = performance.now();
      function update(now) {
        const progress = Math.min((now - start) / duration, 1);
        el.textContent = Math.floor((1 - Math.pow(1 - progress, 3)) * target).toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.5 });
  stats.forEach(s => observer.observe(s));
}

/* --- Scroll Reveal --- */
function initScrollReveal() {
  if (prefersReducedMotion) { document.querySelectorAll('.reveal').forEach(el => el.classList.add('reveal--visible')); return; }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const siblings = Array.from(entry.target.parentElement?.querySelectorAll(':scope > .reveal') || []);
      entry.target.style.transitionDelay = `${Math.max(0, siblings.indexOf(entry.target)) * 100}ms`;
      entry.target.classList.add('reveal--visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* --- Nav --- */
function initNav() {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  if (!nav || !toggle || !links) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(() => { nav.classList.toggle('nav--scrolled', window.scrollY > 50); ticking = false; }); ticking = true; }
  });
  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('nav-links--open');
    toggle.classList.toggle('nav-toggle--active', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => { links.classList.remove('nav-links--open'); toggle.classList.remove('nav-toggle--active'); toggle.setAttribute('aria-expanded', 'false'); });
  });
}

/* --- 3D Card Tilt --- */
function initCardTilt() {
  document.querySelectorAll('.project-card, .project-showcase').forEach(card => {
    const inner = card.querySelector('.project-card-inner') || card;
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const rotateX = ((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -2;
      const rotateY = ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 2;
      inner.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    card.addEventListener('mouseleave', () => { inner.style.transform = ''; });
  });
}

/* --- Interactive CV Mini Cards --- */
function initCVCards() {
  document.querySelectorAll('.cv-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const rotateX = ((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -10;
      const rotateY = ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 10;
      card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

/* --- Floating Compass (cursor-tracking + back to top) --- */
function initCompass() {
  const compass = document.getElementById('compass');
  const needle = document.getElementById('compass-needle');
  if (!compass || !needle) return;

  let rotation = 0, target = 0, isTracking = false, idleTimeout;

  // Show/hide based on scroll
  window.addEventListener('scroll', () => {
    compass.classList.toggle('floating-compass--visible', window.scrollY > 400);
  }, { passive: true });

  function updateTarget(cx, cy) {
    const rect = compass.getBoundingClientRect();
    const compassCx = rect.left + rect.width / 2;
    const compassCy = rect.top + rect.height / 2;
    target = Math.atan2(cx - compassCx, -(cy - compassCy)) * (180 / Math.PI);
    isTracking = true;
    clearTimeout(idleTimeout);
    idleTimeout = setTimeout(() => { isTracking = false; }, 3000);
  }

  window.addEventListener('mousemove', (e) => updateTarget(e.clientX, e.clientY));
  window.addEventListener('touchmove', (e) => { if (e.touches[0]) updateTarget(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });

  function animate() {
    if (isTracking) {
      let delta = target - rotation;
      while (delta > 180) delta -= 360;
      while (delta < -180) delta += 360;
      rotation += delta * 0.1;
    } else {
      const t = performance.now() / 1000;
      const sway = Math.sin(t * 0.6) * 10 + Math.cos(t * 0.35) * 5;
      rotation += (sway - rotation) * 0.03;
    }
    needle.style.transform = `rotate(${rotation}deg)`;
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);

  compass.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* --- Mango Mascot --- */
function initMango() {
  const mango = document.getElementById('mango');
  if (!mango) return;

  let isDragging = false, startX, startY, currentX = 0, currentY = 0;
  let pose = 'wave', idleTimer, sleepTimer;

  function setPose(newPose) {
    pose = newPose;
    mango.querySelectorAll('.mango-pose').forEach(p => p.style.display = 'none');
    const t = mango.querySelector(`.mango-pose-${newPose}`);
    if (t) t.style.display = '';
  }

  function resetIdleTimer() {
    clearTimeout(idleTimer); clearTimeout(sleepTimer);
    if (isDragging) return;
    idleTimer = setTimeout(() => { setPose('clean'); sleepTimer = setTimeout(() => setPose('sleep'), 20000); }, 15000);
  }

  const mangoSvg = mango.querySelector('.mango-svg');
  const mangoLabel = mango.querySelector('.mango-label');
  const chatPanel = document.getElementById('mango-chat');

  // Stop chat panel from triggering mango interactions
  if (chatPanel) {
    chatPanel.addEventListener('pointerdown', (e) => e.stopPropagation());
    chatPanel.addEventListener('click', (e) => e.stopPropagation());
  }

  let downX = 0, downY = 0, downTime = 0, hasMoved = false;

  function onMangoDown(e) {
    downX = e.clientX;
    downY = e.clientY;
    downTime = Date.now();
    hasMoved = false;
    startX = e.clientX - currentX;
    startY = e.clientY - currentY;
    mango.setPointerCapture(e.pointerId);
    e.preventDefault();
  }

  if (mangoSvg) mangoSvg.addEventListener('pointerdown', onMangoDown);
  if (mangoLabel) mangoLabel.addEventListener('pointerdown', onMangoDown);

  document.addEventListener('pointermove', (e) => {
    if (!downTime) return;
    const dx = e.clientX - downX;
    const dy = e.clientY - downY;
    // Only start drag after 5px movement
    if (!isDragging && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      isDragging = true;
      hasMoved = true;
      setPose('carried');
      mango.style.cursor = 'grabbing';
      mango.style.transition = 'none';
    }
    if (isDragging) {
      currentX = e.clientX - startX;
      currentY = e.clientY - startY;
      mango.style.transform = `translate(${currentX}px, ${currentY}px)`;
    }
  });

  document.addEventListener('pointerup', () => {
    if (isDragging) {
      isDragging = false;
      mango.style.cursor = 'grab';
      mango.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
      currentY = 0;
      mango.style.transform = `translate(${currentX}px, 0px)`;
      setPose('playful');
      setTimeout(() => { setPose('wave'); resetIdleTimer(); }, 800);
    } else if (downTime && !hasMoved && Date.now() - downTime < 300) {
      // Short tap = toggle chat
      if (chatPanel) chatPanel.classList.toggle('mango-chat--open');
      resetIdleTimer();
    }
    downTime = 0;
  });

  // === Compass Cannon Easter Egg ===
  const compass = document.getElementById('compass');
  let cannonTimeout = null, isFlying = false;

  function isOverCompass() {
    if (!compass) return false;
    const mr = mango.getBoundingClientRect();
    const cr = compass.getBoundingClientRect();
    const mx = mr.left + mr.width / 2;
    const my = mr.top + mr.height / 2;
    return mx > cr.left - 20 && mx < cr.right + 20 && my > cr.top - 20 && my < cr.bottom + 20;
  }

  // Check during drag
  const origMove = document.onpointermove;
  document.addEventListener('pointermove', () => {
    if (!isDragging || isFlying) return;
    if (isOverCompass()) {
      if (!mango.classList.contains('mango--cannon-ready')) {
        mango.classList.add('mango--cannon-ready');
        compass.classList.add('floating-compass--loaded');
        setPose('curious');
      }
    } else {
      if (mango.classList.contains('mango--cannon-ready')) {
        mango.classList.remove('mango--cannon-ready');
        compass.classList.remove('floating-compass--loaded');
        setPose('carried');
      }
    }
  });

  // On drop over compass = fire!
  const origUp = document.onpointerup;
  document.addEventListener('pointerup', () => {
    if (!mango.classList.contains('mango--cannon-ready') || isFlying) return;

    // Lock mango in compass position
    isFlying = true;
    isDragging = false;
    mango.classList.remove('mango--cannon-ready');
    setPose('celebrate');

    // Charge for 1.5s
    compass.classList.add('floating-compass--loaded');
    const compassRect = compass.getBoundingClientRect();
    const needle = document.getElementById('compass-needle');
    const needleRotation = needle ? parseFloat(needle.style.transform.replace(/[^-\d.]/g, '')) || 0 : 0;

    setTimeout(() => {
      compass.classList.remove('floating-compass--loaded');
      compass.classList.add('floating-compass--firing');
      setPose('playful');

      // Calculate launch direction from compass needle angle
      const angleRad = (needleRotation - 90) * (Math.PI / 180);
      const launchDist = Math.min(window.innerWidth, window.innerHeight) * 0.6;
      const targetX = Math.cos(angleRad) * launchDist;
      const targetY = Math.sin(angleRad) * launchDist;

      // Animate mango flying in an arc
      mango.classList.add('mango--flying');
      const startX = currentX;
      const startY = currentY;
      const duration = 800;
      const start = performance.now();

      function fly(now) {
        const t = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - t, 2);
        // Arc: parabolic vertical offset
        const arcHeight = -200 * Math.sin(t * Math.PI);
        const x = startX + targetX * ease;
        const y = startY + targetY * ease + arcHeight;
        mango.style.transform = `translate(${x}px, ${y}px) rotate(${t * 720}deg)`;
        if (t < 1) {
          requestAnimationFrame(fly);
        } else {
          // Land — spring back to bottom
          mango.classList.remove('mango--flying');
          compass.classList.remove('floating-compass--firing');
          currentX = x;
          currentY = 0;
          mango.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
          mango.style.transform = `translate(${currentX}px, 0px)`;
          setPose('wave');
          isFlying = false;
          resetIdleTimer();
        }
      }
      requestAnimationFrame(fly);
    }, 1500);
  });

  setPose('wave'); resetIdleTimer();
}

/* --- Mango Chat --- */
function initMangoChat() {
  const chat = document.getElementById('mango-chat');
  const form = document.getElementById('mango-chat-form');
  const field = document.getElementById('mango-chat-field');
  const messages = document.getElementById('mango-chat-messages');
  const close = document.getElementById('mango-chat-close');
  if (!chat || !form || !field || !messages || !close) return;

  close.addEventListener('click', () => chat.classList.remove('mango-chat--open'));

  function addMsg(text, type) {
    const div = document.createElement('div');
    div.className = `mango-msg mango-msg--${type}`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  // Smart keyword-matched demo responses
  const responses = [
    { keys: ['node', 'nodejs', 'backend', 'express', 'server'], reply: "Purrr, great question! Chris never wrote Node.js by hand — he directed AI to build an entire Electron + Express desktop app with 1,671 tests. He understands the architecture deeply because he architected it. That's actually more impressive than typing it out manually." },
    { keys: ['react', 'frontend', 'ui'], reply: "Chris built SocialiseApp in React 19 with Framer Motion, Zustand, real-time chat, and a gamification system — 548 tests! Plus he hand-coded the Socialise marketing site in pure vanilla JS. The guy thinks in components and UX." },
    { keys: ['python', 'ml', 'ai', 'machine learning'], reply: "Chris built the DevGuide content pipeline in Python — zero external dependencies, runs autonomously daily via GitHub Actions. He's also building an LLM-brained robot on Raspberry Pi 5 with a Hailo neural accelerator. Edge AI is his playground! *purrs*" },
    { keys: ['unity', 'c#', 'csharp', 'game', 'games'], reply: "Meow! Games are where Chris started — 5 years of C#, Unity DOTS/Burst, 10,000+ concurrent entities, shipped 2 commercial titles. His BSc thesis on educational games for children with ADHD was published by IEEE. Games built his engineering brain." },
    { keys: ['team', 'lead', 'management', 'manage'], reply: "Chris led 12 engineers (4 senior!) at Koffee Cup in the Meta VR ecosystem. He owned the 6-environment release pipeline, was primary technical contact for Meta, and helped secure 'Elite' vendor status. He doesn't just code — he runs teams. *proud purr*" },
    { keys: ['agent', 'agentic', 'autonomous', 'multi-agent', 'workflow'], reply: "THIS is where Chris really shines! He built a full CEO/Manager/Agent system where AI agents run sprints autonomously — code review, QA via MCP, night shift mode, permanent learnings. It's literally a studio encoded into AI. No one else is doing this." },
    { keys: ['mcp', 'tool', 'tools'], reply: "Chris built a production MCP server with 55+ tools over SSE! LLMs can query databases, trigger browser automation, capture screenshots, validate UI state — all through structured tool calls. The QA agent literally operates the app autonomously." },
    { keys: ['test', 'testing', 'tdd', 'quality'], reply: "2,100+ tests across all projects! 1,671 in SocialiseHub alone across 33 test suites. Chris doesn't just write code — he proves it works. And remember, all of this was AI-directed. The tests are real, the coverage is real. *impressed meow*" },
    { keys: ['experience', 'years', 'background', 'history'], reply: "5+ years: Virtually Sports (Unity, shipped 2 titles), Koffee Cup (promoted to Tech Lead in 12 months, led 12 engineers for Meta VR), then independent building the Socialise platform with autonomous AI agents. First Class Honours BSc, IEEE published. The trajectory speaks for itself!" },
    { keys: ['hire', 'why', 'should', 'value', 'bring'], reply: "Here's the thing — Chris spent 5 years learning how studios ACTUALLY work. Then he encoded all of that into AI agents that ship production code autonomously. You're not hiring a developer. You're hiring someone who multiplies output by directing AI at scale. That's the future. *confident purr*" },
    { keys: ['salary', 'pay', 'money', 'cost', 'rate'], reply: "Mrrp! I'm just a kitten, I don't do salary negotiations! But I can tell you — someone who ships production apps with 1,671 tests without touching the code? That's a force multiplier. Reach out to Chris directly to chat numbers!" },
    { keys: ['vr', 'meta', 'quest', 'horizon'], reply: "Chris spent 3 years in the Meta VR ecosystem at Koffee Cup — client-side authoritative networking for zero-latency feedback, haptic proximity systems, locked 72Hz on constrained hardware. The client cited his haptic system as THE key factor in expanding the prototype to a full product!" },
    { keys: ['typescript', 'ts'], reply: "Chris mastered TypeScript and the proprietary Meta Horizon engine from zero prior experience — earned a promotion to Tech Lead within 12 months! He learns fast because he uses AI to accelerate onboarding. That's the pattern: unknown stack → AI-assisted mastery → ship production code." },
    { keys: ['hello', 'hi', 'hey', 'sup', 'yo'], reply: "Mrrp! Hey there! I'm Mango, Chris's kitten assistant. Ask me anything about his experience, skills, or projects — I'll give you the real scoop! *waves paw*" },
    { keys: ['who', 'about', 'christos', 'chris'], reply: "Chris is a Creative Engineer based in Bristol, UK. 5+ years shipping production software, from Unity games to Meta VR to full-stack web platforms. Now he directs AI agents to build at scale — 2,100+ tests, 55+ MCP tools, 4 autonomous codebases. He thinks different. *purrs proudly*" },
    { keys: ['socialise', 'events', 'platform', 'startup'], reply: "Socialise is Chris's own platform — a social events community in Bristol with 3,100+ members. He built the entire tech stack: desktop operations app (Hub), consumer web platform (App), marketing site, content generation pipeline, and the AI agent system that manages it all. One person. Full stack. AI-powered." },
    { keys: ['education', 'degree', 'university', 'study'], reply: "BSc Computer Games Programming with First Class Honours from Middlesex University! His thesis on educational games for children with ADHD was published by IEEE. Before that, he studied Mechanical Engineering of Automation in Athens — the automation DNA runs deep! *scholarly meow*" },
  ];

  const fallbacks = [
    "Mrrp! I'm not sure about that specific thing, but I can tell you Chris ships production software at a pace most teams can't match. Ask me about his projects, skills, or experience!",
    "Interesting question! While I don't have the exact answer, I know Chris picks up new things incredibly fast — he went from zero TypeScript to Tech Lead in 12 months. Whatever the challenge, he'll figure it out. *confident purr*",
    "Hmm, that's a new one for this kitten! But here's what I know: Chris has 2,100+ tests across his projects, leads AI agents autonomously, and thinks about UX details like compass needles tracking your cursor. Ask me something specific about his work!",
  ];

  let fallbackIdx = 0;

  function getReply(msg) {
    const lower = msg.toLowerCase();
    for (const r of responses) {
      if (r.keys.some(k => lower.includes(k))) return r.reply;
    }
    return fallbacks[fallbackIdx++ % fallbacks.length];
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = field.value.trim();
    if (!msg) return;
    field.value = '';
    addMsg(msg, 'user');

    const loading = addMsg('Mango is thinking...', 'loading');
    // Simulate AI thinking delay
    setTimeout(() => {
      loading.remove();
      addMsg(getReply(msg), 'bot');
    }, 600 + Math.random() * 800);
  });
}

/* --- Lazy Iframes --- */
function initLazyIframes() {
  document.querySelectorAll('.demo-placeholder').forEach(p => {
    p.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = p.dataset.src;
      iframe.className = 'demo-iframe';
      iframe.setAttribute('loading', 'lazy');
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('title', p.dataset.title || 'Demo');
      p.replaceWith(iframe);
    });
  });
}

/* --- Hub Interactive Demo --- */
function initHubDemo() {
  // Tab switching
  document.querySelectorAll('.hub-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.hub-tab').forEach(t => t.classList.remove('hub-tab--active'));
      document.querySelectorAll('.hub-panel').forEach(p => p.classList.remove('hub-panel--active'));
      tab.classList.add('hub-tab--active');
      document.getElementById(`hub-panel-${tab.dataset.tab}`)?.classList.add('hub-panel--active');
    });
  });

  // === SYNC TAB ===
  const syncBtn = document.getElementById('sync-btn');
  const syncLog = document.getElementById('sync-log');
  const syncStatus = document.getElementById('sync-status');
  // Sync event list (populates as events arrive)
  const syncEventList = document.getElementById('sync-event-list');

  const meetupEvents = [
    'Speed Friending Social — Fri 7pm',
    'Sunday Hike — Leigh Woods',
    'Board Games Night — Wed 7pm',
    'Pub Quiz at The Lanes',
    'Comedy Open Mic Night',
    'Welcome Night — First Event',
    'Yoga in the Park — Sunday',
    'Photography Walk — Harbourside',
  ];
  const eventbriteEvents = [
    'Pottery Workshop — Sat 2pm',
    'Wine Tasting Social',
    'Salsa Night — Beginners',
  ];
  const headfirstEvents = [
    'Live Jazz Evening — The Louisiana',
    'Spoken Word Night — Stokes Croft',
  ];

  if (syncBtn) {
    syncBtn.addEventListener('click', () => {
      syncBtn.disabled = true;
      syncLog.innerHTML = '';
      if (syncEventList) syncEventList.innerHTML = '';
      syncStatus.textContent = 'Syncing...';
      const platforms = document.querySelectorAll('.sync-platform');
      const arrows = document.querySelectorAll('.sync-arrow');
      let eventCount = 0;

      function addEvent(name, platform, delay) {
        setTimeout(() => {
          if (!syncEventList) return;
          eventCount++;
          const row = document.createElement('div');
          row.className = 'sync-event-row';
          row.innerHTML = `<span class="sync-event-name">${name}</span><span class="sync-event-src sync-event-src--${platform}">${platform}</span>`;
          syncEventList.appendChild(row);
          syncEventList.scrollTop = syncEventList.scrollHeight;
        }, delay);
      }

      // Meetup batch
      setTimeout(() => {
        const line = document.createElement('div');
        line.className = 'sync-log-line sync-log-line--info';
        line.textContent = '> Connecting to Meetup GraphQL API...';
        syncLog.appendChild(line);
        platforms[0]?.classList.add('sync-platform--active');
        arrows.forEach((a, i) => { if (i < 3) { setTimeout(() => { a.classList.add('sync-arrow--pulse'); setTimeout(() => a.classList.remove('sync-arrow--pulse'), 500); }, i * 150); }});
      }, 0);

      meetupEvents.forEach((ev, i) => addEvent(ev, 'meetup', 400 + i * 250));

      setTimeout(() => {
        platforms[0]?.classList.remove('sync-platform--active');
        const line = document.createElement('div');
        line.className = 'sync-log-line sync-log-line--success';
        line.textContent = `  ✓ Fetched ${meetupEvents.length} events via graphql.meetup.com`;
        syncLog.appendChild(line);
        syncLog.scrollTop = syncLog.scrollHeight;
      }, 400 + meetupEvents.length * 250 + 200);

      // Eventbrite batch
      const ebStart = 400 + meetupEvents.length * 250 + 600;
      setTimeout(() => {
        const line = document.createElement('div');
        line.className = 'sync-log-line sync-log-line--info';
        line.textContent = '> Launching Eventbrite DOM automation...';
        syncLog.appendChild(line);
        syncLog.scrollTop = syncLog.scrollHeight;
        platforms[3]?.classList.add('sync-platform--active');
        [3,4].forEach((a, i) => { setTimeout(() => { arrows[a]?.classList.add('sync-arrow--pulse'); setTimeout(() => arrows[a]?.classList.remove('sync-arrow--pulse'), 500); }, i * 150); });
      }, ebStart);

      eventbriteEvents.forEach((ev, i) => addEvent(ev, 'eventbrite', ebStart + 300 + i * 350));

      setTimeout(() => {
        platforms[3]?.classList.remove('sync-platform--active');
        const line = document.createElement('div');
        line.className = 'sync-log-line sync-log-line--success';
        line.textContent = `  ✓ Scraped ${eventbriteEvents.length} events via Electron WebContentsView`;
        syncLog.appendChild(line);
        syncLog.scrollTop = syncLog.scrollHeight;
      }, ebStart + 300 + eventbriteEvents.length * 350 + 200);

      // Headfirst batch
      const hfStart = ebStart + 300 + eventbriteEvents.length * 350 + 600;
      setTimeout(() => {
        const line = document.createElement('div');
        line.className = 'sync-log-line sync-log-line--info';
        line.textContent = '> Scraping Headfirst Bristol...';
        syncLog.appendChild(line);
        syncLog.scrollTop = syncLog.scrollHeight;
        platforms[4]?.classList.add('sync-platform--active');
      }, hfStart);

      headfirstEvents.forEach((ev, i) => addEvent(ev, 'headfirst', hfStart + 300 + i * 350));

      setTimeout(() => {
        platforms[4]?.classList.remove('sync-platform--active');
        const line = document.createElement('div');
        line.className = 'sync-log-line sync-log-line--success';
        line.textContent = `  ✓ Parsed ${headfirstEvents.length} events from headfirstbristol.co.uk`;
        syncLog.appendChild(line);
        syncLog.scrollTop = syncLog.scrollHeight;
      }, hfStart + 300 + headfirstEvents.length * 350 + 200);

      // Conflict detection + done
      const endStart = hfStart + 300 + headfirstEvents.length * 350 + 600;
      setTimeout(() => {
        const l1 = document.createElement('div');
        l1.className = 'sync-log-line sync-log-line--info';
        l1.textContent = '> Running conflict detection...';
        syncLog.appendChild(l1);
      }, endStart);
      setTimeout(() => {
        const l2 = document.createElement('div');
        l2.className = 'sync-log-line sync-log-line--info';
        l2.textContent = '  2 cross-platform conflicts detected (title mismatch)';
        syncLog.appendChild(l2);
        // Highlight conflicted events
        const rows = syncEventList?.querySelectorAll('.sync-event-row');
        if (rows && rows[0]) rows[0].classList.add('sync-event-row--conflict');
        if (rows && rows[5]) rows[5].classList.add('sync-event-row--conflict');
      }, endStart + 400);
      setTimeout(() => {
        const total = meetupEvents.length + eventbriteEvents.length + headfirstEvents.length;
        const l3 = document.createElement('div');
        l3.className = 'sync-log-line sync-log-line--success';
        l3.textContent = `> Sync complete: ${total} events pulled, 2 conflicts, ${total - 2} clean`;
        syncLog.appendChild(l3);
        syncLog.scrollTop = syncLog.scrollHeight;
        syncStatus.textContent = `${total} synced`;
        syncBtn.disabled = false;
        syncBtn.textContent = 'Run Again';
      }, endStart + 800);
    });
  }

  // === EVENTS TAB ===
  const eventsList = document.getElementById('hub-events-list');
  const scoreBtn = document.getElementById('score-btn');
  const events = [
    { name: 'Speed Friending Social', date: 'Mar 28', platform: 'meetup', attendees: 42, price: '£5' },
    { name: 'Board Games Night', date: 'Mar 29', platform: 'meetup', attendees: 28, price: 'Free' },
    { name: 'Comedy Open Mic', date: 'Mar 30', platform: 'eventbrite', attendees: 65, price: '£8' },
    { name: 'Sunday Hike — Leigh Woods', date: 'Mar 31', platform: 'meetup', attendees: 35, price: 'Free' },
    { name: 'Pub Quiz Night', date: 'Apr 2', platform: 'headfirst', attendees: 50, price: '£3' },
    { name: 'Pottery Workshop', date: 'Apr 5', platform: 'eventbrite', attendees: 12, price: '£25' },
  ];
  if (eventsList) {
    events.forEach(ev => {
      const div = document.createElement('div');
      div.className = 'hub-event';
      div.innerHTML = `<div class="hub-event-name">${ev.name}</div>
        <div class="hub-event-meta">
          <span class="hub-event-badge">${ev.platform}</span>
          <span>${ev.date}</span>
          <span>${ev.attendees} going</span>
          <span>${ev.price}</span>
          <span class="hub-event-score" data-event></span>
        </div>`;
      eventsList.appendChild(div);
    });
  }
  if (scoreBtn) {
    scoreBtn.addEventListener('click', () => {
      scoreBtn.disabled = true;
      scoreBtn.textContent = 'Scoring...';
      const scoreEls = document.querySelectorAll('[data-event]');
      scoreEls.forEach((el, i) => {
        setTimeout(() => {
          const score = Math.floor(Math.random() * 40) + 60;
          el.textContent = `AI: ${score}%`;
          el.classList.add('hub-event-score--visible');
          el.classList.add(score >= 80 ? 'hub-event-score--high' : score >= 65 ? 'hub-event-score--mid' : 'hub-event-score--low');
          el.parentElement.parentElement.style.borderColor = score >= 80 ? 'rgba(34,197,94,0.4)' : score >= 65 ? 'rgba(245,158,11,0.4)' : 'rgba(239,68,68,0.4)';
        }, i * 400 + 300);
      });
      setTimeout(() => { scoreBtn.textContent = 'AI Score All Events'; scoreBtn.disabled = false; }, events.length * 400 + 600);
    });
  }

  // === ANALYTICS TAB ===
  const membersChart = document.getElementById('hub-members-chart');
  const revenueChart = document.getElementById('hub-revenue-chart');
  const memberData = [753,925,1150,1275,1364,1449,1536,1707,1824,2070,2610,2922,3112];
  const revenueData = [0,0,0,0,0,57.5,229,261,258.5,35,7,7,3.5];
  const months = ['Apr','Jun','Aug','Oct','Jan','Mar','May','Jul','Sep','Dec','Jan','Feb','Mar'];

  function renderChart(container, data, color, label) {
    if (!container) return;
    const max = Math.max(...data);
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        container.querySelectorAll('.hub-bar').forEach((bar, i) => {
          setTimeout(() => { bar.style.height = `${(data[i] / max) * 100}%`; }, i * 60);
        });
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.3 });
    data.forEach((val, i) => {
      const bar = document.createElement('div');
      bar.className = 'hub-bar';
      bar.style.background = color;
      bar.style.height = '0%';
      bar.dataset.tooltip = `${months[i]}: ${label === '£' ? '£' + val : val.toLocaleString()}`;
      container.appendChild(bar);
    });
    observer.observe(container);
  }
  renderChart(membersChart, memberData, 'var(--accent)', '');
  renderChart(revenueChart, revenueData, 'var(--accent-secondary)', '£');

  // === HEATMAP ===
  const heatmap = document.getElementById('heatmap');
  if (heatmap) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = ['8am', '10am', '12pm', '2pm', '4pm', '6pm', '7pm', '8pm', '9pm', '10pm', '11pm', '12am'];
    // Real-shaped data: [day][hour] avg attendance
    const data = [
      [0,3,0,7,8,7,0,0,0,0,0,0],   // Mon
      [1,1,0,0,0,7,10,0,0,0,0,0],   // Tue
      [0,0,0,0,4,8,10,6,0,0,0,0],   // Wed
      [0,0,0,0,0,8,15,11,0,0,0,0],  // Thu
      [0,0,0,1,14,9,21,11,4,0,4,0], // Fri
      [12,2,37,19,8,14,21,5,0,1,0,0],// Sat
      [7,8,15,49,10,3,19,3,0,0,0,2],// Sun
    ];
    // Column headers
    const spacer = document.createElement('div');
    heatmap.appendChild(spacer);
    hours.forEach(h => {
      const lbl = document.createElement('div');
      lbl.className = 'heatmap-col-label';
      lbl.textContent = h;
      heatmap.appendChild(lbl);
    });
    // Rows
    const maxVal = 49;
    days.forEach((day, di) => {
      const rowLabel = document.createElement('div');
      rowLabel.className = 'heatmap-row-label';
      rowLabel.textContent = day;
      heatmap.appendChild(rowLabel);
      data[di].forEach((val, hi) => {
        const cell = document.createElement('div');
        cell.className = 'heatmap-cell';
        const intensity = val / maxVal;
        cell.style.background = val === 0 ? 'rgba(255,255,255,0.02)' : `rgba(34,197,94,${0.1 + intensity * 0.7})`;
        cell.dataset.tooltip = `${day} ${hours[hi]}: avg ${val} attendees`;
        heatmap.appendChild(cell);
      });
    });
  }

  // === CATEGORY BARS ===
  const catContainer = document.getElementById('category-bars');
  if (catContainer) {
    const categories = [
      { name: 'Speed Friending', fill: 88, color: 'var(--accent)' },
      { name: 'Hiking', fill: 70, color: '#22C55E' },
      { name: 'Comedy', fill: 65, color: '#3B82F6' },
      { name: 'Pub Quiz', fill: 55, color: '#a855f7' },
      { name: 'Board Games', fill: 50, color: '#f59e0b' },
      { name: 'Pottery', fill: 32, color: '#ef4444' },
    ];
    categories.forEach(cat => {
      const row = document.createElement('div');
      row.className = 'category-bar-row';
      row.innerHTML = `<span class="category-bar-label">${cat.name}</span>
        <div class="category-bar"><div class="category-bar-fill" style="width:0;background:${cat.color}"></div></div>
        <span class="category-bar-value">${cat.fill}%</span>`;
      catContainer.appendChild(row);
    });
    const catObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        catContainer.querySelectorAll('.category-bar-fill').forEach((fill, i) => {
          setTimeout(() => { fill.style.width = categories[i].fill + '%'; }, i * 150);
        });
        catObs.unobserve(entry.target);
      });
    }, { threshold: 0.3 });
    catObs.observe(catContainer);
  }

  // === RANGE SELECTOR ===
  document.querySelectorAll('.analytics-range').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.analytics-range').forEach(b => b.classList.remove('analytics-range--active'));
      btn.classList.add('analytics-range--active');
      // Re-render charts with filtered data
      const range = parseInt(btn.dataset.range);
      const mSlice = range > 0 ? memberData.slice(-range) : memberData;
      const rSlice = range > 0 ? revenueData.slice(-range) : revenueData;
      const mSliceMonths = range > 0 ? months.slice(-range) : months;
      if (membersChart) { membersChart.innerHTML = ''; renderChart(membersChart, mSlice, 'var(--accent)', ''); }
      if (revenueChart) { revenueChart.innerHTML = ''; renderChart(revenueChart, rSlice, 'var(--accent-secondary)', '£'); }
      // Trigger animation
      membersChart?.querySelectorAll('.hub-bar').forEach((bar, i) => {
        const max = Math.max(...mSlice);
        setTimeout(() => { bar.style.height = `${(mSlice[i] / max) * 100}%`; }, i * 60);
      });
      revenueChart?.querySelectorAll('.hub-bar').forEach((bar, i) => {
        const max = Math.max(...rSlice);
        setTimeout(() => { bar.style.height = `${(rSlice[i] / max) * 100}%`; }, i * 60);
      });
    });
  });

  // === MCP TAB ===
  const terminal = document.getElementById('mcp-terminal');
  const toolsGrid = document.getElementById('mcp-tools-grid');
  const tools = [
    { name: 'get-events', result: '→ 282 events returned (47ms)' },
    { name: 'sync-meetup', result: '→ Synced 282 events, 6 conflicts detected' },
    { name: 'score-event', result: '→ Score: 87% (high demand, low competition, good timing)' },
    { name: 'get-analytics', result: '→ { members: 3112, revenue: £855, avg_fill: 45% }' },
    { name: 'publish-event', result: '→ Published to Meetup + Eventbrite (2 platforms)' },
    { name: 'capture-screenshot', result: '→ Screenshot saved: /tmp/hub-capture-001.png' },
    { name: 'get-member-stats', result: '→ 540 new members in Jan 2026, 190 in Mar 2026' },
    { name: 'detect-conflicts', result: '→ 6 cross-platform field mismatches found' },
    { name: 'generate-event-idea', result: '→ "Sunset Kayaking Social" — projected: 35 attendees, £175 revenue' },
    { name: 'augment-description', result: '→ Description enhanced with AI (tone: warm, inclusive, cheeky)' },
  ];
  if (toolsGrid && terminal) {
    tools.forEach(tool => {
      const btn = document.createElement('button');
      btn.className = 'mcp-tool-btn';
      btn.textContent = tool.name;
      btn.addEventListener('click', () => {
        const cmd = document.createElement('div');
        cmd.className = 'mcp-line mcp-line--cmd';
        cmd.textContent = `> mcp.call("${tool.name}")`;
        terminal.appendChild(cmd);
        setTimeout(() => {
          const res = document.createElement('div');
          res.className = 'mcp-line mcp-line--result';
          res.textContent = tool.result;
          terminal.appendChild(res);
          terminal.scrollTop = terminal.scrollHeight;
        }, 300 + Math.random() * 400);
        terminal.scrollTop = terminal.scrollHeight;
      });
      toolsGrid.appendChild(btn);
    });
  }
}

/* --- Sprint Simulation --- */
function initSprintSim() {
  const startBtn = document.getElementById('sprint-start');
  const log = document.getElementById('sprint-log');
  if (!startBtn || !log) return;

  const cols = { backlog: document.getElementById('col-backlog'), progress: document.getElementById('col-progress'), review: document.getElementById('col-review'), done: document.getElementById('col-done') };
  const agents = { ceo: document.getElementById('agent-ceo'), qa: document.getElementById('agent-qa'), dev1: document.getElementById('agent-dev1'), dev2: document.getElementById('agent-dev2'), manager: document.getElementById('agent-manager') };
  const statusEls = { ceo: document.getElementById('ceo-status'), qa: document.getElementById('qa-status'), dev1: document.getElementById('dev1-status'), dev2: document.getElementById('dev2-status'), manager: document.getElementById('manager-status') };
  const bugOverlay = document.getElementById('app-bug-overlay');
  const fileCeo = document.getElementById('file-ceo-content');
  const fileManager = document.getElementById('file-manager-content');
  const fileLearnings = document.getElementById('file-learnings-content');
  const fileEls = { ceo: document.getElementById('file-ceo'), manager: document.getElementById('file-manager'), learnings: document.getElementById('file-learnings') };

  let running = false, ticketId = 0, timers = [], learningsCount = 0;

  const bugTickets = [
    { title: 'Price shows £0 for paid events', type: 'bug' },
    { title: 'Sync fails on events with emojis in title', type: 'bug' },
    { title: 'Calendar shows wrong date for multi-day events', type: 'bug' },
  ];
  const featureTickets = [
    { title: 'Add bulk publish to all platforms', type: 'feature' },
    { title: 'Export analytics as CSV', type: 'feature' },
  ];
  const improvementTickets = [
    { title: 'Reduce sync time from 12s to <5s', type: 'improvement' },
    { title: 'Add loading skeleton to event cards', type: 'improvement' },
    { title: 'Improve conflict detection accuracy', type: 'improvement' },
  ];

  function addLog(text, type) {
    const line = document.createElement('div');
    line.className = `sprint-log-line sprint-log-line--${type}`;
    const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    line.textContent = `[${time}] ${text}`;
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
  }

  function setAgentState(name, state, statusText) {
    const el = agents[name];
    const sEl = statusEls[name];
    if (!el || !sEl) return;
    el.classList.remove('sprint-agent--active', 'sprint-agent--busy');
    if (state === 'active') el.classList.add('sprint-agent--active');
    if (state === 'busy') el.classList.add('sprint-agent--busy');
    sEl.textContent = statusText;
    sEl.style.color = state === 'active' ? 'var(--accent)' : state === 'busy' ? 'var(--accent-secondary)' : '';
  }

  function flashFile(name, cls) {
    const el = fileEls[name];
    if (!el) return;
    el.classList.add(cls || 'sprint-file--flash');
    setTimeout(() => el.classList.remove(cls || 'sprint-file--flash'), 1500);
  }

  function updateFile(name, content) {
    const map = { ceo: fileCeo, manager: fileManager, learnings: fileLearnings };
    if (map[name]) map[name].textContent = content;
  }

  function addLearning(rule) {
    learningsCount++;
    updateFile('learnings', `${learningsCount} rule${learningsCount > 1 ? 's' : ''} — latest: "${rule}"`);
    flashFile('learnings');
  }

  function createTicket(data) {
    ticketId++;
    const div = document.createElement('div');
    div.className = `sprint-ticket sprint-ticket--${data.type}`;
    div.id = `ticket-${ticketId}`;
    div.innerHTML = `<div class="sprint-ticket-title">${data.title}</div><div class="sprint-ticket-meta">#${ticketId} · ${data.type}</div>`;
    div.dataset.id = ticketId;
    return { el: div, id: ticketId, ...data };
  }

  function moveTicket(ticket, colName) {
    const col = cols[colName];
    if (!col) return;
    ticket.el.classList.add('sprint-ticket--moving');
    setTimeout(() => {
      ticket.el.classList.remove('sprint-ticket--moving');
      col.appendChild(ticket.el);
    }, 200);
  }

  function highlightApp(idx, cls) {
    const ev = document.getElementById(`app-event-${idx}`);
    if (ev) { ev.classList.add(cls); setTimeout(() => ev.classList.remove(cls), 2000); }
  }

  function delay(ms) { return new Promise(r => { const t = setTimeout(r, ms); timers.push(t); }); }

  async function runSprint() {
    running = true;
    startBtn.disabled = true;
    startBtn.textContent = 'Running...';
    learningsCount = 0;

    // Clear board
    ['backlog', 'progress', 'review', 'done'].forEach(c => {
      cols[c].querySelectorAll('.sprint-ticket').forEach(t => t.remove());
    });
    updateFile('ceo', 'No active directives');
    updateFile('manager', 'No active tasks');
    updateFile('learnings', '0 rules');

    // === PHASE 1: CEO evaluates business state ===
    addLog('CEO: Reading status-log.md... evaluating what shipped last sprint', 'system');
    setAgentState('ceo', 'busy', 'reviewing results');
    await delay(1000);
    addLog('CEO: Revenue is £855 total. Growth is 540 new members in Jan but slowing. Need to ship faster.', 'system');
    await delay(800);
    updateFile('ceo', 'DIRECTIVE: Fix all sync bugs. Revenue depends on accurate event data.');
    flashFile('ceo', 'sprint-file--flash-ceo');
    addLog('CEO: Writing directive → "Fix all sync bugs. Revenue depends on accurate event data."', 'system');
    await delay(600);
    addLog('CEO: Evaluating efficiency — last sprint took 3 feedback rounds on emoji bug. Too many.', 'system');
    setAgentState('ceo', 'active', 'wrote directive');

    // === PHASE 2: Manager reads directive, plans sprint ===
    addLog('Manager: Reading ceo-directives.md...', 'manager');
    setAgentState('manager', 'busy', 'reading CEO directive');
    flashFile('ceo', 'sprint-file--flash');
    await delay(800);
    addLog('Manager: CEO wants sync bugs prioritized. Reprioritizing backlog.', 'manager');
    await delay(500);

    // QA scans app via MCP
    addLog('QA: Connecting to MCP server at localhost:3000/mcp/sse', 'qa');
    setAgentState('qa', 'busy', 'connecting to MCP');
    await delay(800);
    addLog('QA: mcp.call("get-events") → 282 events loaded', 'mcp');
    await delay(500);
    addLog('QA: mcp.call("capture-screenshot") → inspecting event list...', 'mcp');
    setAgentState('qa', 'busy', 'testing via MCP');
    highlightApp(1, 'sprint-app-event--highlight');
    await delay(700);
    highlightApp(3, 'sprint-app-event--error');
    if (bugOverlay) bugOverlay.style.display = '';
    addLog('QA: BUG — Price shows £0 for Comedy Open Mic (paid event)', 'error');
    await delay(500);

    // QA files bugs
    const allTickets = [];
    for (const b of bugTickets) {
      const t = createTicket(b);
      allTickets.push(t);
      moveTicket(t, 'backlog');
      addLog(`QA: Filed #${t.id} "${t.title}"`, 'qa');
      await delay(300);
    }
    for (const f of [...featureTickets, ...improvementTickets]) {
      const t = createTicket(f);
      allTickets.push(t);
      moveTicket(t, 'backlog');
      addLog(`Manager: Queued #${t.id} "${t.title}"`, 'manager');
      await delay(200);
    }

    // Manager writes sprint plan
    updateFile('manager', 'TASK: #1 price bug (Dev1)\nTASK: #2 emoji sync (Dev2)');
    flashFile('manager');
    setAgentState('manager', 'active', 'sprint planned');
    addLog('Manager: Sprint planned — 8 tickets, bugs first per CEO directive. Writing .manager-feedback.md', 'manager');
    await delay(500);

    // === PHASE 3: Devs pick up work ===
    setAgentState('dev1', 'busy', 'working on #1');
    setAgentState('dev2', 'busy', 'working on #2');
    moveTicket(allTickets[0], 'progress');
    moveTicket(allTickets[1], 'progress');
    addLog('Dev1: File watcher triggered — new task in .manager-feedback.md → picking up #1', 'dev1');
    addLog('Dev2: File watcher triggered — picking up #2 "Sync fails on emoji titles"', 'dev2');
    await delay(600);

    // CEO thinks while devs work
    addLog('CEO: While devs work... evaluating business opportunities', 'system');
    setAgentState('ceo', 'busy', 'strategic thinking');
    await delay(800);
    addLog('CEO: Idea — auto-generate social media content from event data. Would 10x marketing reach.', 'system');
    updateFile('ceo', 'DIRECTIVE: Explore content generation pipeline from event data');
    flashFile('ceo', 'sprint-file--flash-ceo');
    await delay(600);
    addLog('Manager: Noted CEO directive — will add to next sprint after current bugs are fixed', 'manager');

    // Dev1 finishes #1
    await delay(800);
    addLog('Dev1: Fixed — added ?? 0 fallback on ticket_price, parseFloat guard', 'dev1');
    addLog('Dev1: Tests passing: 1,671/1,671 ✓', 'dev1');
    addLog('Dev1: git commit -m "fix: price null guard for paid events"', 'dev1');
    moveTicket(allTickets[0], 'review');
    setAgentState('dev1', 'active', 'committed #1');
    if (bugOverlay) bugOverlay.style.display = 'none';
    highlightApp(3, 'sprint-app-event--highlight');
    const st3 = document.getElementById('app-status-3');
    if (st3) st3.textContent = '£8';
    await delay(500);

    // Manager dispatches code review subagent
    addLog('Manager: Dispatching code-reviewer subagent (haiku) for #1...', 'manager');
    setAgentState('manager', 'busy', 'code review #1');
    await delay(1000);
    addLog('Manager: Review PASSED ✓ — clean diff, no side effects', 'manager');
    updateFile('manager', 'VERIFIED: #1 price bug\nTASK: #2 emoji (Dev2 WIP)');
    flashFile('manager');

    // QA validates via MCP
    addLog('QA: mcp.call("get-events", { filter: "paid" }) → verifying prices...', 'mcp');
    setAgentState('qa', 'busy', 'validating #1');
    await delay(800);
    addLog('QA: #1 VERIFIED ✓ — all paid events show correct prices', 'qa');
    moveTicket(allTickets[0], 'done');

    // LEARNING from fix
    addLearning('Always use ?? defaults on price fields from external APIs');
    addLog('Manager: LEARNING recorded → "Always use ?? defaults on price fields from external APIs"', 'manager');
    await delay(400);

    // Dev2 finishes #2
    addLog('Dev2: Fixed — encodeURIComponent on sync, decode on display', 'dev2');
    addLog('Dev2: git commit -m "fix: encode emoji titles for sync API"', 'dev2');
    moveTicket(allTickets[1], 'review');
    await delay(700);

    // QA REJECTS
    addLog('QA: mcp.call("sync-meetup", { title: "Game Night 🎲" })', 'mcp');
    await delay(800);
    addLog('QA: #2 REJECTED — sync works but display shows %F0%9F%8E%B2 instead of 🎲', 'error');
    moveTicket(allTickets[1], 'progress');
    setAgentState('dev2', 'busy', 'reworking #2');
    updateFile('manager', 'FEEDBACK #2: decode on display side, not just encode for API');
    flashFile('manager');
    await delay(500);

    // CEO does performance review mid-sprint
    addLog('CEO: Performance check — Dev2 needed rework on #2. Was the spec clear enough?', 'system');
    setAgentState('ceo', 'busy', 'performance review');
    await delay(600);
    addLog('CEO: Verdict — Manager should specify both encode AND decode in task spec. Adding process rule.', 'system');
    addLearning('Task specs for encoding must specify both encode path AND decode path');
    await delay(400);
    addLog('CEO: Dev2 response time is good. No action needed on agent side.', 'system');
    setAgentState('ceo', 'active', 'review complete');

    // Dev1 picks up #3, Dev2 reworks #2
    addLog('Dev1: File watcher triggered → picking up #3 "Calendar wrong date"', 'dev1');
    setAgentState('dev1', 'busy', 'working on #3');
    moveTicket(allTickets[2], 'progress');
    await delay(1000);
    addLog('Dev2: Fixed — decode on display, encode only for API. Added test for round-trip.', 'dev2');
    moveTicket(allTickets[1], 'review');
    await delay(600);
    addLog('QA: Re-testing #2... mcp.call("sync-meetup", { title: "🎲 Game Night" })', 'mcp');
    await delay(700);
    addLog('QA: #2 VERIFIED ✓ — emoji round-trip works perfectly', 'qa');
    moveTicket(allTickets[1], 'done');
    addLearning('Always test string encoding round-trips: encode → store → decode → display');
    await delay(400);

    // Dev1 finishes #3
    addLog('Dev1: Fixed timezone offset — using UTC everywhere, convert on display only', 'dev1');
    moveTicket(allTickets[2], 'review');
    await delay(500);
    addLog('QA: #3 VERIFIED ✓', 'qa');
    moveTicket(allTickets[2], 'done');

    // Manager reprioritizes based on CEO content generation directive
    addLog('Manager: All bugs fixed. Reprioritizing — CEO wants content gen exploration.', 'manager');
    setAgentState('manager', 'busy', 'reprioritizing');
    updateFile('manager', 'PRIORITY CHANGE: #6 reduce sync time moved up (enables content gen pipeline)');
    flashFile('manager');
    await delay(600);

    // Remaining tickets — fast parallel
    addLog('Dev1: Picking up #4 "Bulk publish"', 'dev1');
    addLog('Dev2: Picking up #6 "Reduce sync time" (priority bumped by Manager)', 'dev2');
    setAgentState('dev1', 'busy', 'working on #4');
    setAgentState('dev2', 'busy', 'working on #6');
    moveTicket(allTickets[3], 'progress');
    moveTicket(allTickets[5], 'progress');
    await delay(1200);

    for (let i = 3; i < allTickets.length; i++) {
      const dev = i % 2 === 0 ? 'dev1' : 'dev2';
      addLog(`${dev === 'dev1' ? 'Dev1' : 'Dev2'}: Completed #${allTickets[i].id} "${allTickets[i].title}"`, dev);
      moveTicket(allTickets[i], 'review');
      await delay(400);
      addLog(`QA: #${allTickets[i].id} VERIFIED ✓`, 'qa');
      moveTicket(allTickets[i], 'done');
      await delay(250);
    }

    // === PHASE 4: CEO evaluates sprint results ===
    addLog('CEO: Sprint complete. Reviewing results...', 'system');
    setAgentState('ceo', 'busy', 'evaluating sprint');
    await delay(800);
    addLog('CEO: 8/8 tickets shipped. 1 rework cycle (acceptable). Sync time reduced — content gen is unblocked.', 'system');
    addLog('CEO: Process improvement — 3 permanent learnings added this sprint. Knowledge compounds.', 'system');
    updateFile('ceo', 'SPRINT REVIEW: 8/8 shipped. Next priority: content generation pipeline.');
    flashFile('ceo', 'sprint-file--flash-ceo');
    await delay(600);

    // QA proactive mode
    addLog('QA: Entering proactive testing... mcp.call("capture-screenshot")', 'mcp');
    setAgentState('qa', 'busy', 'proactive testing');
    await delay(600);
    addLog('QA: Running full regression... no new issues found', 'qa');
    await delay(400);
    addLog('QA: Testing edge cases — empty event titles, past dates, duplicate IDs...', 'qa');
    await delay(500);
    addLog('QA: All clean. Continuing to monitor. File watcher active.', 'qa');

    // Final state
    setAgentState('ceo', 'active', 'planning next sprint');
    setAgentState('manager', 'active', 'writing next tasks');
    setAgentState('dev1', 'active', 'file watcher active');
    setAgentState('dev2', 'active', 'file watcher active');
    setAgentState('qa', 'active', 'monitoring app');
    updateFile('learnings', `${learningsCount} permanent rules — knowledge compounds across all projects`);
    addLog('System: All agents on standby. File watchers active. CEO planning next sprint. The loop never ends.', 'system');

    startBtn.disabled = false;
    startBtn.textContent = 'Restart Sprint';
    running = false;
  }

  startBtn.addEventListener('click', () => {
    if (running) return;
    // Clear log
    log.innerHTML = '';
    timers.forEach(clearTimeout);
    timers = [];
    ticketId = 0;
    if (bugOverlay) bugOverlay.style.display = 'none';
    const st3 = document.getElementById('app-status-3');
    if (st3) st3.textContent = 'draft';
    runSprint();
  });
}

/* --- DevGuide Inline Compass --- */
function initDevGuideCompass() {
  const needle = document.querySelector('.devguide-compass-needle');
  const wrap = document.querySelector('.devguide-compass-wrap');
  if (!needle || !wrap) return;
  let rotation = 0, target = 0, tracking = false, idleTimeout;

  function updateTarget(cx, cy) {
    const rect = wrap.getBoundingClientRect();
    const ccx = rect.left + rect.width / 2, ccy = rect.top + rect.height / 2;
    target = Math.atan2(cx - ccx, -(cy - ccy)) * (180 / Math.PI);
    tracking = true;
    clearTimeout(idleTimeout);
    idleTimeout = setTimeout(() => { tracking = false; }, 3000);
  }

  window.addEventListener('mousemove', e => updateTarget(e.clientX, e.clientY));
  window.addEventListener('touchmove', e => { if (e.touches[0]) updateTarget(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });

  function animate() {
    if (tracking) {
      let d = target - rotation;
      while (d > 180) d -= 360;
      while (d < -180) d += 360;
      rotation += d * 0.08;
    } else {
      const t = performance.now() / 1000;
      rotation += (Math.sin(t * 0.6) * 15 + Math.cos(t * 0.35) * 8 - rotation) * 0.02;
    }
    needle.style.transform = `rotate(${rotation}deg)`;
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}

/* --- DevGuide Pipeline Sim --- */
function initPipelineSim() {
  const btn = document.getElementById('pipeline-run-btn');
  const logEl = document.getElementById('pipeline-log');
  const counter = document.getElementById('pipeline-article-count');
  if (!btn) return;
  const nodes = ['pipe-cron', 'pipe-discover', 'pipe-content', 'pipe-validate', 'pipe-publish'].map(id => document.getElementById(id));

  let timers = [];
  function d(ms) { return new Promise(r => { timers.push(setTimeout(r, ms)); }); }
  function log(t, cls) {
    const l = document.createElement('div');
    l.className = `sync-log-line sync-log-line--${cls}`;
    l.textContent = t;
    logEl.appendChild(l);
    logEl.scrollTop = logEl.scrollHeight;
  }
  function activate(i) { nodes.forEach((n,j) => { n.classList.toggle('pipeline-node--active', j === i); if (j < i) n.classList.add('pipeline-node--done'); }); }

  btn.addEventListener('click', async () => {
    btn.disabled = true;
    logEl.innerHTML = '';
    nodes.forEach(n => n.classList.remove('pipeline-node--active', 'pipeline-node--done'));
    timers.forEach(clearTimeout); timers = [];

    activate(0);
    log('GitHub Actions cron triggered at 03:00 UTC', 'info');
    await d(800);
    activate(1);
    log('DiscoveryAgent: Scanning 3 niches — dev tools, compatibility, JP/CN tech news...', 'info');
    await d(1000);
    log('DiscoveryAgent: Found topic → "Bun vs Deno 2.0: Package Manager Speed Comparison"', 'success');
    await d(600);
    activate(2);
    log('ContentAgent: Generating 1,200+ word SEO article...', 'info');
    await d(1200);
    log('ContentAgent: Article complete — 1,847 words, 6 sections, FAQ, comparison table', 'success');
    await d(600);
    activate(3);
    log('ValidationAgent: Checking word count... ✓ (1,847 > 1,200)', 'success');
    await d(400);
    log('ValidationAgent: Checking structure... ✓ (H2s, intro, FAQ, table)', 'success');
    await d(400);
    log('ValidationAgent: Keyword safety check... ✓ (no stuffing detected)', 'success');
    await d(400);
    log('ValidationAgent: Tone check... ✓ (human-like, developer-focused)', 'success');
    await d(500);
    activate(4);
    log('DistributionAgent: Writing to site/posts/bun-vs-deno-2-0.md', 'info');
    await d(400);
    log('DistributionAgent: Updating index.json + sitemap.xml + RSS feed', 'info');
    await d(400);
    log('DistributionAgent: Published ✓ — live at devguide.co.uk/posts/bun-vs-deno-2-0', 'success');
    if (counter) { let c = 44; const iv = setInterval(() => { c++; counter.textContent = c; if (c >= 45) clearInterval(iv); }, 100); }
    await d(500);
    nodes.forEach(n => { n.classList.remove('pipeline-node--active'); n.classList.add('pipeline-node--done'); });
    log('Pipeline complete. Next run: tomorrow 03:00 UTC. Zero human intervention.', 'info');
    btn.disabled = false;
    btn.textContent = 'Run Again';
  });
}

/* --- Hub: AI Augment Demo --- */
function initAugmentDemo() {
  const btn = document.getElementById('augment-btn');
  const safeEl = document.getElementById('augment-safe');
  const stepsEl = document.getElementById('augment-steps');
  if (!btn || !safeEl || !stepsEl) return;

  btn.addEventListener('click', async () => {
    btn.disabled = true;
    safeEl.textContent = '';
    stepsEl.innerHTML = '';
    const d = ms => new Promise(r => setTimeout(r, ms));
    function step(t, cls) {
      const s = document.createElement('div');
      s.className = `augment-step augment-step--${cls}`;
      s.textContent = t;
      stepsEl.appendChild(s);
    }

    step('Step 1: Normalizing field names...', 'normalize');
    await d(600);
    safeEl.textContent = '{\n  "name": "Speed Friending",\n  "date": ...,\n  "price": ...,\n  "description": ...,\n  "attendees": ...,\n  "venue": ...\n}';
    step('  eventName → name, Event_Date → date, PRICE → price, desc → description', 'normalize');
    await d(800);

    step('Step 2: Shape-checking types (typeof === "object")...', 'check');
    await d(600);
    step('  venue: typeof === "object" ✓ — extracting venue.name', 'check');
    step('  price: typeof === "string" — needs parseInt()', 'check');
    step('  attendee_count: typeof === "string" — needs parseInt()', 'check');
    await d(800);

    step('Step 3: Applying ?? defaults for null/undefined...', 'default');
    await d(600);
    step('  date: null ?? "TBD"', 'default');
    step('  description: undefined ?? "No description provided"', 'default');
    await d(800);

    step('Step 4: String() wrapping for safe JSX render...', 'wrap');
    await d(600);
    safeEl.textContent = `{
  "name": String("Speed Friending"),
  "date": String("TBD"),
  "price": 5,
  "description": String("No description"),
  "attendees": 42,
  "venue": String("The Lanes")
}`;
    step('  All values safe for React render. No runtime crashes. ✓', 'wrap');
    btn.disabled = false;
  });
}

/* --- Hub: Idea Generator --- */
function initIdeaGenerator() {
  const btn = document.getElementById('ideas-btn');
  const results = document.getElementById('ideas-results');
  if (!btn || !results) return;

  const ideas = [
    { name: 'Sunset Kayaking Social', attendees: 28, revenue: '£196', fill: '93%', reasoning: 'Outdoor +40% trend + kayaking rising in Bristol + Saturday afternoon peak slot + paid (£7) above break-even at 15' },
    { name: 'Midweek Climbing Taster', attendees: 20, revenue: '£200', fill: '80%', reasoning: 'Competitor gap: no weekday daytime socials + climbing trending + higher ticket (£10) justified by venue costs + targets remote workers' },
    { name: 'Friday Night Comedy + Dinner', attendees: 45, revenue: '£360', fill: '90%', reasoning: 'Friday 7pm = peak attendance + comedy avg 65 attendees + bundled dinner upsell + speed friending warm-up fills early slots' },
    { name: 'Sunday Morning Park Yoga', attendees: 15, revenue: 'Free', fill: '60%', reasoning: 'Low-cost acquisition: free events drive 3x member signups + Sunday morning underserved + builds community loyalty for paid events' },
  ];

  btn.addEventListener('click', () => {
    btn.disabled = true;
    btn.textContent = 'Analyzing data...';
    results.innerHTML = '';
    ideas.forEach((idea, i) => {
      setTimeout(() => {
        const card = document.createElement('div');
        card.className = 'idea-card';
        card.innerHTML = `<div class="idea-card-name">${idea.name}</div>
          <div class="idea-card-stats">
            <div class="idea-stat"><strong>${idea.attendees}</strong> projected</div>
            <div class="idea-stat"><strong>${idea.revenue}</strong> revenue</div>
            <div class="idea-stat"><strong>${idea.fill}</strong> fill rate</div>
          </div>
          <div class="idea-card-reasoning">Based on: ${idea.reasoning}</div>`;
        results.appendChild(card);
        if (i === ideas.length - 1) { btn.disabled = false; btn.textContent = 'Generate Ideas'; }
      }, (i + 1) * 600);
    });
  });
}

/* --- Hub: Content Prompts --- */
function initContentPrompts() {
  const btn = document.getElementById('prompts-btn');
  const output = document.getElementById('prompts-output');
  if (!btn || !output) return;

  const prompts = [
    { platform: 'TikTok / Reels (9:16)', context: 'category: social · venue: pub · time: evening · 42 going · brand: warm, inclusive', prompt: 'Warm candlelit pub interior, diverse group of 6 people laughing around a small table, speed friending question cards visible between drinks, cozy Friday evening atmosphere, fairy lights in background, terracotta and teal color palette, shot from slightly above, 9:16 vertical, cinematic shallow depth of field' },
    { platform: 'Instagram Post (1:1)', context: 'hook: "90% come alone" · social proof · FOMO · brand voice: cheeky', prompt: 'Split-screen: left side shows person scrolling phone alone on couch (blue/cold tones), right side shows same person laughing in group at pub (warm terracotta tones). Text overlay space at top. 1:1 square crop, high contrast, editorial style photography' },
    { platform: 'Instagram Story (9:16)', context: 'event promo · countdown · poll overlay · swipe-up CTA', prompt: 'Close-up of hands holding speed friending cards with fun questions visible, blurred pub background with warm bokeh lights, space for poll sticker ("Coming Friday?") and countdown timer, terracotta accent border, 9:16 vertical, lifestyle photography' },
  ];

  btn.addEventListener('click', () => {
    btn.disabled = true;
    btn.textContent = 'Generating...';
    output.innerHTML = '';
    prompts.forEach((p, i) => {
      setTimeout(() => {
        const card = document.createElement('div');
        card.className = 'prompt-card';
        card.innerHTML = `<div class="prompt-card-platform">${p.platform}</div>
          <div class="prompt-card-context">Context: ${p.context}</div>
          <div class="prompt-card-text">${p.prompt}</div>`;
        output.appendChild(card);
        if (i === prompts.length - 1) { btn.disabled = false; btn.textContent = 'Generate Content'; }
      }, (i + 1) * 800);
    });
  });
}

/* --- Hub: Enhanced AI Score with Suggestions --- */
function initEnhancedScoring() {
  const btn = document.getElementById('score-btn');
  if (!btn) return;

  const suggestions = [
    { score: 87, text: 'Add early bird pricing — similar events saw 40% more pre-signups', tag: 'pricing' },
    { score: 72, text: 'Move to Saturday — Friday board games underperform by 25% vs weekends', tag: 'timing' },
    { score: 94, text: 'Strong performer. Consider raising price to £10 — demand supports it', tag: 'pricing' },
    { score: 81, text: 'Title is 6 words — optimal for Meetup CTR. Add "Bristol" for SEO', tag: 'copy' },
    { score: 68, text: 'Pub quiz market saturated. Differentiate: add themed rounds or live music', tag: 'competition' },
    { score: 45, text: 'Low projected fill. £25 price point needs stronger value proposition or lower to £15', tag: 'pricing' },
  ];

  // Override the original score button behavior
  const originalHandler = btn.onclick;
  btn.onclick = null;
  btn.replaceWith(btn.cloneNode(true));
  const newBtn = document.getElementById('score-btn');

  newBtn.addEventListener('click', () => {
    newBtn.disabled = true;
    newBtn.textContent = 'AI Analyzing...';
    const scoreEls = document.querySelectorAll('[data-event]');
    scoreEls.forEach((el, i) => {
      setTimeout(() => {
        const s = suggestions[i] || suggestions[0];
        el.textContent = `AI: ${s.score}%`;
        el.classList.add('hub-event-score--visible');
        el.classList.add(s.score >= 80 ? 'hub-event-score--high' : s.score >= 65 ? 'hub-event-score--mid' : 'hub-event-score--low');

        // Add suggestion below event
        const event = el.closest('.hub-event');
        if (event && !event.querySelector('.hub-event-suggestion')) {
          const sug = document.createElement('div');
          sug.className = 'hub-event-suggestion';
          sug.innerHTML = `<span class="hub-event-sug-tag">${s.tag}</span> ${s.text}`;
          sug.style.cssText = 'font-size:0.65rem;color:var(--text-muted);margin-top:0.4rem;padding-top:0.4rem;border-top:1px solid var(--border);line-height:1.4;opacity:0;animation:fadeIn 0.3s ease forwards';
          const sugTag = sug.querySelector('.hub-event-sug-tag');
          if (sugTag) sugTag.style.cssText = 'font-family:var(--font-mono);font-size:0.6rem;background:rgba(255,255,255,0.05);border:1px solid var(--border);border-radius:3px;padding:0.1rem 0.3rem;margin-right:0.3rem';
          event.appendChild(sug);
        }
      }, i * 500 + 300);
    });
    setTimeout(() => { newBtn.textContent = 'AI Score All Events'; newBtn.disabled = false; }, suggestions.length * 500 + 600);
  });
}

/* --- CI/CD Pipeline Demo --- */
function initCICDDemo() {
  const section = document.getElementById('cicd-demo');
  if (!section) return;

  // Animate git flow on scroll
  const gitSteps = document.querySelectorAll('.cicd-git-step');
  const gitObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      gitSteps.forEach((s, i) => {
        setTimeout(() => {
          s.classList.add('cicd-git-step--active');
          setTimeout(() => {
            s.classList.remove('cicd-git-step--active');
            s.classList.add('cicd-git-step--done');
            s.querySelector('.cicd-git-check').textContent = i === 2 ? '⚠ → ✓' : '✓';
          }, 500);
        }, i * 600);
      });
      gitObs.unobserve(entry.target);
    });
  }, { threshold: 0.3 });
  if (gitSteps[0]?.parentElement) gitObs.observe(gitSteps[0].parentElement);

  // Animate hooks on scroll
  const hooks = document.querySelectorAll('.cicd-hook');
  const hookResults = ['✓ passed', '✗ blocked', '✓ passed', '✓ passed'];
  const hookStates = ['active', 'blocked', 'active', 'active'];
  const hookObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      hooks.forEach((h, i) => {
        setTimeout(() => {
          h.classList.add(`cicd-hook--${hookStates[i]}`);
          h.querySelector('.cicd-hook-status').textContent = hookResults[i];
        }, i * 500 + 300);
      });
      hookObs.unobserve(entry.target);
    });
  }, { threshold: 0.3 });
  if (hooks[0]?.parentElement) hookObs.observe(hooks[0].parentElement);

  // CI Pipeline button
  const ciBtn = document.getElementById('cicd-run-btn');
  const ciNodes = ['ci-push', 'ci-lint', 'ci-tsc', 'ci-test', 'ci-build', 'ci-deploy'].map(id => document.getElementById(id));
  const testCount = document.getElementById('ci-test-count');

  if (ciBtn) {
    ciBtn.addEventListener('click', async () => {
      ciBtn.disabled = true;
      ciNodes.forEach(n => n.classList.remove('cicd-pipe-node--active', 'cicd-pipe-node--done'));
      if (testCount) testCount.textContent = '0/1,671';

      for (let i = 0; i < ciNodes.length; i++) {
        ciNodes[i].classList.add('cicd-pipe-node--active');
        if (i === 3 && testCount) {
          // Animate test counter
          let count = 0;
          const iv = setInterval(() => {
            count += Math.floor(Math.random() * 80) + 40;
            if (count > 1671) count = 1671;
            testCount.textContent = `${count.toLocaleString()}/1,671`;
            if (count >= 1671) clearInterval(iv);
          }, 50);
          await new Promise(r => setTimeout(r, 1200));
        } else {
          await new Promise(r => setTimeout(r, 600));
        }
        ciNodes[i].classList.remove('cicd-pipe-node--active');
        ciNodes[i].classList.add('cicd-pipe-node--done');
      }
      ciBtn.disabled = false;
      ciBtn.textContent = 'Run Again';
    });
  }

  // Test coverage bars — animate on scroll
  const testBars = { hub: document.getElementById('test-hub'), app: document.getElementById('test-app'), dg: document.getElementById('test-dg') };
  const totalEl = document.getElementById('cicd-total');
  const testObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      setTimeout(() => { if (testBars.hub) testBars.hub.style.width = '100%'; }, 200);
      setTimeout(() => { if (testBars.app) testBars.app.style.width = '32.8%'; }, 400);
      setTimeout(() => { if (testBars.dg) testBars.dg.style.width = '2.4%'; }, 600);
      // Count up total
      if (totalEl) {
        let c = 0;
        const iv = setInterval(() => {
          c += Math.floor(Math.random() * 100) + 50;
          if (c > 2259) c = 2259;
          totalEl.textContent = c.toLocaleString();
          if (c >= 2259) clearInterval(iv);
        }, 30);
      }
      testObs.unobserve(entry.target);
    });
  }, { threshold: 0.3 });
  if (testBars.hub?.parentElement?.parentElement) testObs.observe(testBars.hub.parentElement.parentElement);

  // Night shift timeline — animate on scroll
  const nsEvents = document.querySelectorAll('.nightshift-event');
  if (nsEvents.length) {
    const nsObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        nsEvents.forEach((ev, i) => {
          setTimeout(() => ev.classList.add('nightshift-event--visible'), i * 400);
        });
        nsObs.unobserve(entry.target);
      });
    }, { threshold: 0.2 });
    nsObs.observe(nsEvents[0].parentElement);
  }

  // 6-env pipeline — animate on scroll
  const envNodes = document.querySelectorAll('.cicd-env');
  const envObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      envNodes.forEach((n, i) => {
        setTimeout(() => {
          n.classList.add('cicd-env--active');
          setTimeout(() => {
            n.classList.remove('cicd-env--active');
            n.classList.add('cicd-env--done');
          }, 800);
        }, i * 500);
      });
      envObs.unobserve(entry.target);
    });
  }, { threshold: 0.3 });
  if (envNodes[0]?.parentElement) envObs.observe(envNodes[0].parentElement);
}

/* --- SocialiseApp Phone Demo --- */
function initAppDemo() {
  const navBtns = document.querySelectorAll('.phone-nav-btn');
  const pages = document.querySelectorAll('.app-page');
  if (!navBtns.length) return;

  // Tab navigation
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      navBtns.forEach(b => b.classList.remove('phone-nav-btn--active'));
      pages.forEach(p => p.classList.remove('app-page--active'));
      btn.classList.add('phone-nav-btn--active');
      const page = document.getElementById(`app-page-${btn.dataset.page}`);
      if (page) page.classList.add('app-page--active');
    });
  });

  // Join events + earn XP
  let totalXP = 280;
  const xpBadge = document.getElementById('app-xp-badge');
  const levels = [
    { xp: 0, title: 'Newcomer' }, { xp: 50, title: 'Rising Star' },
    { xp: 150, title: 'Social Explorer' }, { xp: 450, title: 'Scene Regular' },
    { xp: 800, title: 'Socialite' },
  ];

  function updateXP() {
    const level = levels.filter(l => totalXP >= l.xp).pop();
    const lvNum = levels.indexOf(level) + 1;
    if (xpBadge) xpBadge.textContent = `Lv.${lvNum} ★ ${totalXP} XP`;
    // Update profile too
    const profileBar = document.querySelector('.app-profile-bar-fill');
    const profileText = document.querySelector('.app-profile-xp-text');
    const profileLevel = document.querySelector('.app-profile-level');
    const nextLevel = levels[levels.indexOf(level) + 1];
    if (profileBar && nextLevel) {
      const progress = ((totalXP - level.xp) / (nextLevel.xp - level.xp)) * 100;
      profileBar.style.width = Math.min(progress, 100) + '%';
    }
    if (profileText) profileText.textContent = `${totalXP} / ${nextLevel ? nextLevel.xp : '???'} XP`;
    if (profileLevel) profileLevel.textContent = `Level ${lvNum} — ${level.title}`;
  }

  document.querySelectorAll('.app-event-card').forEach(card => {
    card.addEventListener('click', () => {
      if (card.classList.contains('app-event-card--joined')) return;
      card.classList.add('app-event-card--joined');
      const xp = parseInt(card.dataset.xp) || 20;
      totalXP += xp;
      updateXP();
    });
  });

  // Clickable reactions
  document.querySelectorAll('.app-reaction').forEach(r => {
    r.addEventListener('click', () => {
      r.classList.toggle('app-reaction--active');
      const num = parseInt(r.textContent.match(/\d+/)?.[0] || '0');
      const emoji = r.textContent.match(/[^\d\s]+/)?.[0] || '';
      r.textContent = `${emoji} ${r.classList.contains('app-reaction--active') ? num + 1 : Math.max(0, num - 1)}`;
    });
  });
}

/* --- Hero Particles --- */
function initParticles() {
  const canvas = document.getElementById('hero-particles');
  if (!canvas || prefersReducedMotion) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles = [];
  const count = 80;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    w = canvas.width = rect.width;
    h = canvas.height = rect.height;
  }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2 + 0.5,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      o: Math.random() * 0.5 + 0.1,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(34,197,94,${p.o})`;
      ctx.fill();
    }
    // Draw lines between close particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(34,197,94,${0.08 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}

/* --- Init --- */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initBlurReveal();
  animateCounters();
  initScrollReveal();
  initNav();
  initCardTilt();
  initCVCards();
  initCompass();
  initDevGuideCompass();
  initPipelineSim();
  initMango();
  initMangoChat();
  initLazyIframes();
  initHubDemo();
  initSprintSim();
  initAugmentDemo();
  initIdeaGenerator();
  initContentPrompts();
  initEnhancedScoring();
  initCICDDemo();
  initParticles();
  initAppDemo();
});
