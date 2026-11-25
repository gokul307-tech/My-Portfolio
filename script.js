(() => {
  const loader = document.querySelector('.loader');
  if (loader) {
    window.addEventListener('load', () => {
      window.setTimeout(() => loader.classList.add('done'), 850);
    });
  }

  // ==========================================
  // SCROLL PROGRESS
  // ==========================================
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

  // ==========================================
  // TOP NAVIGATION
  // ==========================================
  const topbar = document.querySelector('.topbar');
  const heroEl = document.querySelector('#home');

  const updateTopbar = () => {
    if (!topbar) return;
    const threshold = heroEl
      ? heroEl.offsetHeight * 0.82
      : window.innerHeight * 0.75;
    topbar.classList.toggle('scrolled', window.scrollY > threshold);
  };

  window.addEventListener('scroll', updateTopbar, { passive: true });
  updateTopbar();

  // ==========================================
  // REVEAL ANIMATIONS
  // ==========================================
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });

  document.querySelectorAll('.reveal').forEach(el => {
    revealObserver.observe(el);
  });

  // ==========================================
  // ACTIVE SECTION NAVIGATION
  // ==========================================
  const sceneObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => {
        link.classList.toggle(
          'active',
          link.getAttribute('href') === `#${entry.target.id}`
        );
      });
    });
  }, { threshold: 0.52 });

  scenes.forEach(scene => sceneObserver.observe(scene));

  // ==========================================
  // MOBILE NAVIGATION
  // ==========================================
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

  // ==========================================
  // MAGIC BOX -> PACK -> ONE-BY-ONE CARD DEAL
  // ==========================================
  const projectSection = document.querySelector('.work');
  const magicStage = document.querySelector('#workMagicStage') || projectSection;
  const boxBtn =
    document.querySelector('#magicBoxBtn') ||
    projectSection?.querySelector('.mystery-box');
  const resetBtn = document.querySelector('#magicResetBtn');
  const groups = [
    ...(projectSection?.querySelectorAll('.project-group, .work-group') || [])
  ];
  const cards = [
    ...(magicStage?.querySelectorAll('[data-project-card], .project-card') || [])
  ];

  const timers = [];
  const clearTimers = () => {
    while (timers.length) {
      window.clearTimeout(timers.pop());
    }
  };

  const setPackOffsets = () => {
    const deckEl =
      projectSection?.querySelector('.reveal-deck') ||
      projectSection?.querySelector('.work-vault');
    const deckRect = deckEl?.getBoundingClientRect();
    const centerX = deckRect
      ? deckRect.left + deckRect.width / 2
      : window.innerWidth / 2;
    const centerY = deckRect
      ? deckRect.top + Math.min(deckRect.height / 2, 220)
      : window.innerHeight * 0.45;

    cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const cardX = rect.left + rect.width / 2;
      const cardY = rect.top + rect.height / 2;
      const fanSpread = (index - (cards.length - 1) / 2) * 5;

      card.style.setProperty('--i', String(index));
      card.style.setProperty('--card-from-x', `${centerX - cardX + fanSpread}px`);
      card.style.setProperty('--card-from-y', `${centerY - cardY}px`);
      card.style.setProperty('--card-delay', `${index * 85}ms`);
    });
  };

  const unboxSequence = () => {
    if (!magicStage || !boxBtn || !cards.length) return;
    clearTimers();

    cards.forEach(card => {
      card.classList.remove('is-dealing', 'is-dealt', 'is-arrived');
    });
    projectSection?.classList.remove(
      'box-opening',
      'revealing',
      'deck-visible',
      'cards-flight',
      'cards-arrived',
      'deck-dismissed'
    );

    groups.forEach(group => group.removeAttribute('inert'));
    boxBtn.setAttribute('aria-expanded', 'true');

    // Step 1: Open box & show the stacked pack of cards clearly
    projectSection?.classList.add('box-opening', 'revealing');
    magicStage.setAttribute('data-state', 'packing');

    timers.push(window.setTimeout(() => {
      projectSection?.classList.add('deck-visible');
      setPackOffsets();

      // Step 2: Deal cards one by one in fast, clear succession
      timers.push(window.setTimeout(() => {
        magicStage.setAttribute('data-state', 'dealing');
        projectSection?.classList.add('cards-flight');

        const stepMs = 85;
        cards.forEach((card, idx) => {
          timers.push(window.setTimeout(() => {
            card.classList.add('is-dealing');

            timers.push(window.setTimeout(() => {
              card.classList.remove('is-dealing');
              card.classList.add('is-dealt', 'is-arrived');
            }, 260));
          }, idx * stepMs));
        });

        const settleMs = cards.length * stepMs + 300;
        timers.push(window.setTimeout(() => {
          magicStage.setAttribute('data-state', 'open');
          projectSection?.classList.add('cards-arrived', 'deck-dismissed');
          projectSection?.classList.remove('revealing');
        }, settleMs));
      }, 360));
    }, 280));
  };

  const closeSequence = () => {
    clearTimers();
    if (magicStage) magicStage.setAttribute('data-state', 'closed');
    if (boxBtn) boxBtn.setAttribute('aria-expanded', 'false');
    projectSection?.classList.remove(
      'box-opening',
      'revealing',
      'deck-visible',
      'cards-flight',
      'cards-arrived',
      'deck-dismissed'
    );
    cards.forEach(card => {
      card.classList.remove('is-dealing', 'is-dealt', 'is-arrived');
    });
  };

  if (boxBtn) {
    boxBtn.addEventListener('click', () => {
      const currentState = magicStage?.getAttribute('data-state');
      if (!currentState || currentState === 'closed') {
        unboxSequence();
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', closeSequence);
  }

  // ==========================================
  // PROJECT CARD POINTER INTERACTIONS
  // ==========================================
  cards.forEach(card => {
    card.addEventListener(
      'pointerdown',
      () => card.classList.add('is-touched'),
      { passive: true }
    );

    ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => {
      card.addEventListener(
        ev,
        () => card.classList.remove('is-touched'),
        { passive: true }
      );
    });
  });

  // ==========================================
  // CUSTOM CURSOR GLOW
  // ==========================================
  const glow = document.querySelector('.cursor-glow');

  if (glow && window.matchMedia('(pointer:fine)').matches) {
    window.addEventListener('pointermove', event => {
      glow.style.left = `${event.clientX}px`;
      glow.style.top = `${event.clientY}px`;
    }, { passive: true });
  }

  // ==========================================
  // HERO PARALLAX
  // ==========================================
  const parallax = document.querySelector('[data-parallax]');
  const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  const updateParallax = () => {
    if (
      !parallax ||
      !heroEl ||
      reduceQuery.matches ||
      document.body.classList.contains('reduce-motion')
    ) {
      return;
    }

    const rect = heroEl.getBoundingClientRect();
    parallax.style.setProperty(
      '--parallax',
      `${Math.max(-30, Math.min(30, -rect.top * 0.08))}px`
    );
  };

  window.addEventListener('scroll', updateParallax, { passive: true });
  updateParallax();

  // ==========================================
  // FLOATING CARD 3D INTERACTIONS
  // ==========================================
  document.querySelectorAll('[data-float]').forEach(card => {
    card.addEventListener('pointermove', event => {
      if (
        reduceQuery.matches ||
        document.body.classList.contains('reduce-motion') ||
        window.innerWidth < 641
      ) {
        return;
      }

      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      card.style.transform =
        `translateY(-8px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg)`;
    });

    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });

  // ==========================================
  // REDUCED MOTION TOGGLE
  // ==========================================
  const motionToggle = document.querySelector('.motion-toggle');

  if (motionToggle) {
    motionToggle.addEventListener('click', () => {
      const active = document.body.classList.toggle('reduce-motion');
      motionToggle.setAttribute('aria-pressed', String(active));
      const label = motionToggle.querySelector('span');
      if (label) {
        label.textContent = active ? 'MOTION REDUCED' : 'REDUCE MOTION';
      }
    });
  }
})();