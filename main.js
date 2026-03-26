/* ============================================
   Portfolio — Main JS
   ============================================ */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* --- Blur Text Reveal --- */
function initBlurReveal() {
  document.querySelectorAll('.blur-reveal').forEach((el, elIndex) => {
    const text = el.textContent.trim();
    el.textContent = '';
    const words = text.split(/\s+/);
    words.forEach((word, i) => {
      const span = document.createElement('span');
      span.className = 'blur-word';
      span.textContent = word;
      el.appendChild(span);
      if (i < words.length - 1) el.appendChild(document.createTextNode('\u00A0'));
    });
    const spans = el.querySelectorAll('.blur-word');
    if (prefersReducedMotion) {
      spans.forEach(s => s.classList.add('blur-word--visible'));
      return;
    }
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
      const duration = 1500;
      const start = performance.now();
      function update(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target).toLocaleString() + suffix;
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
      const parent = entry.target.parentElement;
      const siblings = parent ? Array.from(parent.querySelectorAll(':scope > .reveal')) : [];
      const index = siblings.indexOf(entry.target);
      entry.target.style.transitionDelay = `${Math.max(0, index) * 100}ms`;
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

/* --- 3D Card Tilt on Project Cards --- */
function initCardTilt() {
  document.querySelectorAll('.project-card').forEach(card => {
    const inner = card.querySelector('.project-card-inner');
    if (!inner) return;
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -4;
      const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 4;
      inner.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      inner.style.transform = '';
    });
  });
}

/* --- Interactive CV Mini Cards --- */
function initCVCards() {
  const cards = document.querySelectorAll('.cv-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -10;
      const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 10;
      card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* --- Mango Mascot (Vanilla JS) --- */
function initMango() {
  const mango = document.getElementById('mango');
  if (!mango) return;

  let isDragging = false;
  let startX, startY, currentX = 0, currentY = 0;
  let pose = 'wave';
  let idleTimer = null;
  let sleepTimer = null;
  const svg = mango.querySelector('.mango-svg');

  function setPose(newPose) {
    pose = newPose;
    mango.querySelectorAll('.mango-pose').forEach(p => p.style.display = 'none');
    const target = mango.querySelector(`.mango-pose-${newPose}`);
    if (target) target.style.display = '';
  }

  function resetIdleTimer() {
    clearTimeout(idleTimer);
    clearTimeout(sleepTimer);
    if (isDragging) return;
    idleTimer = setTimeout(() => {
      setPose('clean');
      sleepTimer = setTimeout(() => setPose('sleep'), 20000);
    }, 15000);
  }

  // Dragging
  mango.addEventListener('pointerdown', (e) => {
    isDragging = true;
    mango.setPointerCapture(e.pointerId);
    startX = e.clientX - currentX;
    startY = e.clientY - currentY;
    setPose('carried');
    mango.style.cursor = 'grabbing';
    mango.style.transition = 'none';
    e.preventDefault();
  });

  document.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    currentX = e.clientX - startX;
    currentY = e.clientY - startY;
    mango.style.transform = `translate(${currentX}px, ${currentY}px)`;
  });

  document.addEventListener('pointerup', () => {
    if (!isDragging) return;
    isDragging = false;
    mango.style.cursor = 'grab';

    // Spring back to bottom
    mango.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
    currentY = 0;
    mango.style.transform = `translate(${currentX}px, 0px)`;

    setPose('playful');
    setTimeout(() => {
      setPose('wave');
      resetIdleTimer();
    }, 800);
  });

  // Click = toggle between poses
  mango.addEventListener('click', (e) => {
    if (Math.abs(e.clientX - (startX + currentX)) > 5) return; // was a drag
    const poses = ['wave', 'playful', 'curious', 'celebrate'];
    const next = poses[(poses.indexOf(pose) + 1) % poses.length];
    setPose(next);
    resetIdleTimer();
  });

  setPose('wave');
  resetIdleTimer();
}

/* --- Embedded Demo Lazy Load --- */
function initLazyIframes() {
  document.querySelectorAll('.demo-placeholder').forEach(placeholder => {
    placeholder.addEventListener('click', () => {
      const url = placeholder.dataset.src;
      const iframe = document.createElement('iframe');
      iframe.src = url;
      iframe.className = 'demo-iframe';
      iframe.setAttribute('loading', 'lazy');
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('title', placeholder.dataset.title || 'Demo');
      placeholder.replaceWith(iframe);
    });
  });
}

/* --- Init --- */
document.addEventListener('DOMContentLoaded', () => {
  initBlurReveal();
  animateCounters();
  initScrollReveal();
  initNav();
  initCardTilt();
  initCVCards();
  initMango();
  initLazyIframes();
});
