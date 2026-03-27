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

  mango.addEventListener('pointerdown', (e) => {
    isDragging = true; mango.setPointerCapture(e.pointerId);
    startX = e.clientX - currentX; startY = e.clientY - currentY;
    setPose('carried'); mango.style.cursor = 'grabbing'; mango.style.transition = 'none';
    e.preventDefault();
  });

  document.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    currentX = e.clientX - startX; currentY = e.clientY - startY;
    mango.style.transform = `translate(${currentX}px, ${currentY}px)`;
  });

  document.addEventListener('pointerup', () => {
    if (!isDragging) return;
    isDragging = false; mango.style.cursor = 'grab';
    mango.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
    currentY = 0; mango.style.transform = `translate(${currentX}px, 0px)`;
    setPose('playful');
    setTimeout(() => { setPose('wave'); resetIdleTimer(); }, 800);
  });

  // Click opens chat
  let lastPointerDown = 0;
  mango.addEventListener('pointerdown', () => { lastPointerDown = Date.now(); });
  mango.addEventListener('click', (e) => {
    if (Date.now() - lastPointerDown > 300) return; // was a drag
    const chat = document.getElementById('mango-chat');
    if (chat) chat.classList.toggle('mango-chat--open');
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

  const ENDPOINT = 'https://esifhltywxujunfvlgcc.supabase.co/functions/v1/mango-chat';
  let history = [];

  close.addEventListener('click', () => chat.classList.remove('mango-chat--open'));

  function addMsg(text, type) {
    const div = document.createElement('div');
    div.className = `mango-msg mango-msg--${type}`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = field.value.trim();
    if (!msg) return;
    field.value = '';
    addMsg(msg, 'user');
    history.push({ role: 'user', content: msg });

    const loading = addMsg('Mango is thinking...', 'loading');

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history: history.slice(-6) }),
      });
      const data = await res.json();
      loading.remove();
      const reply = data.reply || data.error || 'Mrrp! Something went wrong.';
      addMsg(reply, 'bot');
      history.push({ role: 'assistant', content: reply });
    } catch {
      loading.remove();
      addMsg('Mrrp! I couldn\'t connect. Try again later!', 'bot');
    }
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
  if (syncBtn) {
    syncBtn.addEventListener('click', () => {
      syncBtn.disabled = true;
      syncLog.innerHTML = '';
      syncStatus.textContent = 'Syncing...';
      const platforms = document.querySelectorAll('.sync-platform');
      const arrows = document.querySelectorAll('.sync-arrow');
      const steps = [
        { delay: 0, log: '> Connecting to Meetup GraphQL API...', type: 'info' },
        { delay: 600, log: '  Fetched 282 events via graphql.meetup.com', type: 'info', platform: 0, arrows: [0,1,2] },
        { delay: 1200, log: '> Launching Eventbrite DOM automation...', type: 'info' },
        { delay: 1800, log: '  Scraped 47 events via Electron WebContentsView', type: 'info', platform: 3, arrows: [3,4] },
        { delay: 2400, log: '> Scraping Headfirst Bristol...', type: 'info' },
        { delay: 2800, log: '  Parsed 23 events from headfirstbristol.co.uk', type: 'info', platform: 4 },
        { delay: 3400, log: '> Running conflict detection...', type: 'info' },
        { delay: 3800, log: '  6 cross-platform conflicts detected', type: 'info' },
        { delay: 4200, log: '> Sync complete: 282 pulled, 6 updated, 276 skipped', type: 'success' },
      ];
      steps.forEach(step => {
        setTimeout(() => {
          const line = document.createElement('div');
          line.className = `sync-log-line sync-log-line--${step.type}`;
          line.textContent = step.log;
          syncLog.appendChild(line);
          syncLog.scrollTop = syncLog.scrollHeight;
          if (step.platform !== undefined) {
            platforms[step.platform]?.classList.add('sync-platform--active');
            setTimeout(() => platforms[step.platform]?.classList.remove('sync-platform--active'), 800);
          }
          if (step.arrows) {
            step.arrows.forEach((a, i) => {
              setTimeout(() => arrows[a]?.classList.add('sync-arrow--pulse'), i * 150);
              setTimeout(() => arrows[a]?.classList.remove('sync-arrow--pulse'), i * 150 + 500);
            });
          }
        }, step.delay);
      });
      setTimeout(() => { syncBtn.disabled = false; syncStatus.textContent = 'Synced'; }, 4500);
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
});
