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
      if (i < words.length - 1) {
        el.appendChild(document.createTextNode('\u00A0'));
      }
    });

    const spans = el.querySelectorAll('.blur-word');
    if (prefersReducedMotion) {
      spans.forEach(s => s.classList.add('blur-word--visible'));
      return;
    }
    spans.forEach((span, i) => {
      setTimeout(() => {
        span.classList.add('blur-word--visible');
      }, 200 + (elIndex * 400) + (i * 100));
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

      if (prefersReducedMotion) {
        el.textContent = target.toLocaleString() + suffix;
        observer.unobserve(entry.target);
        return;
      }

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
  if (prefersReducedMotion) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('reveal--visible'));
    return;
  }

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

/* --- Nav Scroll Effect --- */
function initNav() {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');

  if (!nav || !toggle || !links) return;

  // Scroll effect
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        nav.classList.toggle('nav--scrolled', window.scrollY > 50);
        ticking = false;
      });
      ticking = true;
    }
  });

  // Mobile toggle
  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('nav-links--open');
    toggle.classList.toggle('nav-toggle--active', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close on link click
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('nav-links--open');
      toggle.classList.remove('nav-toggle--active');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* --- Init --- */
document.addEventListener('DOMContentLoaded', () => {
  initBlurReveal();
  animateCounters();
  initScrollReveal();
  initNav();
});
