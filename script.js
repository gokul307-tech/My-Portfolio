(() => {
  const loader = document.querySelector('.loader');
  if (loader) {
    window.addEventListener('load', () => {
      setTimeout(() => loader.classList.add('done'), 850);
    });
  }

  const progress = document.querySelector('.scroll-progress span');
  const nav = document.querySelector('.floating-nav');
  const navLinks = [...document.querySelectorAll('.floating-nav a')];
  const scenes = [...document.querySelectorAll('main .scene')];

  const updateProgress = () => {
    if (!progress) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  const topbar = document.querySelector('.topbar');
  const heroEl = document.querySelector('#home');
  const updateTopbar = () => {
    if (!topbar) return;
    const threshold = heroEl ? heroEl.offsetHeight * 0.82 : window.innerHeight * 0.75;
    topbar.classList.toggle('scrolled', window.scrollY > threshold);
  };
  window.addEventListener('scroll', updateTopbar, { passive: true });
  updateTopbar();

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  const sceneObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
      });
    });
  }, { threshold: 0.52 });
  scenes.forEach(scene => sceneObserver.observe(scene));

  const menuToggle = document.querySelector('.menu-toggle');
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(open));
    });
  }
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (!nav || !menuToggle) return;
      nav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });

  const track = document.querySelector('.project-track');
  if (track) {
    track.addEventListener('wheel', event => {
      if (Math.abs(event.deltaY) > Math.abs(event.deltaX) && window.innerWidth > 640) {
        event.preventDefault();
        track.scrollLeft += event.deltaY;
      }
    }, { passive: false });
  }

  document.querySelectorAll('.work .project-card').forEach(card => {
    card.addEventListener('pointerdown', () => card.classList.add('is-touched'), { passive: true });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => {
      card.addEventListener(ev, () => card.classList.remove('is-touched'), { passive: true });
    });
  });

  const glow = document.querySelector('.cursor-glow');
  if (glow && window.matchMedia('(pointer:fine)').matches) {
    window.addEventListener('pointermove', event => {
      glow.style.left = `${event.clientX}px`;
      glow.style.top = `${event.clientY}px`;
    }, { passive: true });
  }

  const parallax = document.querySelector('[data-parallax]');
  const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const updateParallax = () => {
    if (!parallax || !heroEl || reduceQuery.matches || document.body.classList.contains('reduce-motion')) return;
    const rect = heroEl.getBoundingClientRect();
    parallax.style.setProperty('--parallax', `${Math.max(-30, Math.min(30, -rect.top * 0.08))}px`);
  };
  window.addEventListener('scroll', updateParallax, { passive: true });

  document.querySelectorAll('[data-float]').forEach(card => {
    card.addEventListener('pointermove', event => {
      if (reduceQuery.matches || window.innerWidth < 641) return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `translateY(-8px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg)`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });

  const motionToggle = document.querySelector('.motion-toggle');
  if (motionToggle) {
    motionToggle.addEventListener('click', () => {
      const active = document.body.classList.toggle('reduce-motion');
      motionToggle.setAttribute('aria-pressed', String(active));
      const label = motionToggle.querySelector('span');
      if (label) label.textContent = active ? 'MOTION REDUCED' : 'REDUCE MOTION';
    });
  }
})();