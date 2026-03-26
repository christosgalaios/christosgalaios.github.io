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
  const agents = { qa: document.getElementById('agent-qa'), dev1: document.getElementById('agent-dev1'), dev2: document.getElementById('agent-dev2'), manager: document.getElementById('agent-manager') };
  const statusEls = { qa: document.getElementById('qa-status'), dev1: document.getElementById('dev1-status'), dev2: document.getElementById('dev2-status'), manager: document.getElementById('manager-status') };
  const appBody = document.getElementById('sprint-app-main');
  const bugOverlay = document.getElementById('app-bug-overlay');

  let running = false, ticketId = 0, timers = [];

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

    // Clear board
    ['backlog', 'progress', 'review', 'done'].forEach(c => {
      const col = cols[c];
      col.querySelectorAll('.sprint-ticket').forEach(t => t.remove());
    });

    addLog('Manager: Reading sprint backlog...', 'manager');
    setAgentState('manager', 'active', 'reading backlog');
    await delay(800);

    // Phase 1: QA scans the app via MCP and finds bugs
    addLog('QA: Connecting to MCP server at localhost:3000/mcp/sse', 'qa');
    setAgentState('qa', 'busy', 'connecting to MCP');
    await delay(1000);
    addLog('QA: mcp.call("get-events") → 282 events loaded', 'mcp');
    await delay(600);
    addLog('QA: mcp.call("capture-screenshot") → inspecting event list...', 'mcp');
    setAgentState('qa', 'busy', 'testing app via MCP');
    highlightApp(1, 'sprint-app-event--highlight');
    await delay(800);
    highlightApp(3, 'sprint-app-event--error');
    if (bugOverlay) bugOverlay.style.display = '';
    addLog('QA: BUG FOUND — Price shows £0 for paid events on Comedy Open Mic', 'error');
    await delay(600);

    // QA files bugs to backlog
    const allTickets = [];
    for (const b of bugTickets) {
      const t = createTicket(b);
      allTickets.push(t);
      moveTicket(t, 'backlog');
      addLog(`QA: Filed #${t.id} "${t.title}" to backlog`, 'qa');
      await delay(400);
    }
    addLog('QA: mcp.call("get-analytics") → checking data accuracy...', 'mcp');
    await delay(500);
    for (const f of [...featureTickets, ...improvementTickets]) {
      const t = createTicket(f);
      allTickets.push(t);
      moveTicket(t, 'backlog');
      addLog(`Manager: Added #${t.id} "${t.title}" to sprint`, 'manager');
      await delay(300);
    }

    setAgentState('manager', 'active', 'assigning work');
    addLog('Manager: Sprint loaded — 8 tickets. Assigning to dev agents.', 'manager');
    await delay(600);

    // Phase 2: Devs pick up tickets
    addLog('Manager: .manager-feedback.md updated → Dev1 picks up #1, Dev2 picks up #2', 'manager');
    setAgentState('dev1', 'busy', `working on #1`);
    setAgentState('dev2', 'busy', `working on #2`);
    moveTicket(allTickets[0], 'progress');
    moveTicket(allTickets[1], 'progress');
    await delay(600);
    addLog('Dev1: Reading .manager-feedback.md... picked up #1 "Price shows £0"', 'dev1');
    addLog('Dev2: Reading .manager-feedback.md... picked up #2 "Sync fails on emoji titles"', 'dev2');
    await delay(1500);

    // Dev1 finishes, moves to review
    addLog('Dev1: Fixed price guard — added null coalescing on ticket_price field', 'dev1');
    addLog('Dev1: Running tests... 1,671 passing', 'dev1');
    await delay(800);
    addLog('Dev1: git commit -m "fix: add price null guard for paid events"', 'dev1');
    moveTicket(allTickets[0], 'review');
    setAgentState('dev1', 'active', 'committed #1');
    if (bugOverlay) bugOverlay.style.display = 'none';
    highlightApp(3, 'sprint-app-event--highlight');
    const st3 = document.getElementById('app-status-3');
    if (st3) st3.textContent = '£8';
    await delay(600);

    // Manager dispatches code review
    addLog('Manager: Dispatching code-reviewer subagent for #1...', 'manager');
    setAgentState('manager', 'busy', 'reviewing #1');
    await delay(1200);
    addLog('Manager: Code review PASSED ✓ — clean diff, tests green', 'manager');
    addLog('QA: Picking up #1 for validation via MCP...', 'qa');
    setAgentState('qa', 'busy', 'validating #1 via MCP');
    await delay(1000);
    addLog('QA: mcp.call("get-events", { filter: "paid" }) → prices correct ✓', 'mcp');
    addLog('QA: #1 VERIFIED ✓ — moving to Done', 'qa');
    moveTicket(allTickets[0], 'done');
    setAgentState('qa', 'active', 'verified #1');
    await delay(500);

    // Dev2 finishes
    addLog('Dev2: Fixed emoji encoding — wrapped title in encodeURIComponent', 'dev2');
    addLog('Dev2: git commit -m "fix: encode event titles for sync API"', 'dev2');
    moveTicket(allTickets[1], 'review');
    setAgentState('dev2', 'active', 'committed #2');
    await delay(800);

    // QA rejects one
    addLog('QA: Testing #2 via MCP... mcp.call("sync-meetup", { title: "Game Night 🎲" })', 'mcp');
    await delay(1000);
    addLog('QA: #2 FAILED — sync works but display still shows encoded chars', 'error');
    addLog('QA: Sending #2 back to Dev2 with feedback', 'qa');
    moveTicket(allTickets[1], 'progress');
    setAgentState('dev2', 'busy', 'reworking #2');
    await delay(600);

    // Dev1 picks up next ticket
    addLog('Dev1: Checking .manager-feedback.md... picking up #3 "Calendar wrong date"', 'dev1');
    setAgentState('dev1', 'busy', 'working on #3');
    moveTicket(allTickets[2], 'progress');
    await delay(1000);

    // Dev2 fixes and resubmits
    addLog('Dev2: Fixed — decode on display side, encode only for API calls', 'dev2');
    addLog('Dev2: git commit -m "fix: decode emoji titles for display after sync"', 'dev2');
    moveTicket(allTickets[1], 'review');
    await delay(800);
    addLog('QA: Re-testing #2... mcp.call("sync-meetup", { title: "Game Night 🎲" })', 'mcp');
    await delay(700);
    addLog('QA: #2 VERIFIED ✓ — emoji displays correctly, sync works', 'qa');
    moveTicket(allTickets[1], 'done');

    // Dev1 finishes #3
    addLog('Dev1: Fixed calendar offset — timezone-aware date parsing', 'dev1');
    moveTicket(allTickets[2], 'review');
    setAgentState('dev1', 'active', 'committed #3');
    await delay(700);
    addLog('QA: #3 VERIFIED ✓', 'qa');
    moveTicket(allTickets[2], 'done');

    // Both devs pick up remaining tickets in parallel
    addLog('Dev1: Picking up #4 "Bulk publish"', 'dev1');
    addLog('Dev2: Picking up #5 "Export CSV"', 'dev2');
    setAgentState('dev1', 'busy', 'working on #4');
    setAgentState('dev2', 'busy', 'working on #5');
    moveTicket(allTickets[3], 'progress');
    moveTicket(allTickets[4], 'progress');
    await delay(1500);

    // Quick completions
    for (let i = 3; i < allTickets.length; i++) {
      const dev = i % 2 === 0 ? 'dev1' : 'dev2';
      addLog(`${dev === 'dev1' ? 'Dev1' : 'Dev2'}: Completed #${allTickets[i].id} "${allTickets[i].title}"`, dev);
      moveTicket(allTickets[i], 'review');
      await delay(500);
      addLog(`QA: #${allTickets[i].id} VERIFIED ✓`, 'qa');
      moveTicket(allTickets[i], 'done');
      await delay(300);
    }

    // QA goes into proactive testing
    addLog('QA: All tickets done. Entering proactive testing mode...', 'qa');
    setAgentState('qa', 'busy', 'proactive testing');
    await delay(800);
    addLog('QA: mcp.call("capture-screenshot") → scanning for visual regressions...', 'mcp');
    await delay(600);
    addLog('QA: mcp.call("get-member-stats") → verifying data accuracy...', 'mcp');
    await delay(600);
    addLog('QA: No new issues found. Continuing to monitor...', 'qa');

    // Idle state
    setAgentState('dev1', 'active', 'watching for tasks');
    setAgentState('dev2', 'active', 'watching for tasks');
    setAgentState('qa', 'active', 'monitoring');
    setAgentState('manager', 'active', 'sprint complete');
    addLog('Manager: Sprint complete — 8/8 tickets done. Agents remain on standby.', 'manager');
    addLog('System: Agents run autonomously forever. File watchers active. Waiting for next task...', 'system');

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
  initMango();
  initMangoChat();
  initLazyIframes();
  initHubDemo();
  initSprintSim();
});
