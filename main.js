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
});
