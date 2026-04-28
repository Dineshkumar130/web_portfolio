const THEME_STORAGE_KEY = 'site-theme';

const getStoredTheme = () => {
  try {
    const theme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return theme === 'light' || theme === 'dark' ? theme : null;
  } catch (error) {
    return null;
  }
};

const saveTheme = (theme) => {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    // Ignore storage failures.
  }
};

const getSystemTheme = () => (
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
);

const applyTheme = (theme) => {
  const resolvedTheme = theme === 'dark' ? 'dark' : 'light';
  const isDark = resolvedTheme === 'dark';
  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.setAttribute('data-theme', resolvedTheme);
  document.documentElement.style.colorScheme = resolvedTheme;

  if (document.body) {
    document.body.style.colorScheme = resolvedTheme;
  }
};

const renderThemeToggle = () => {
  const themeToggle = document.getElementById('theme-toggle');
  const icon = document.getElementById('theme-toggle-icon');
  const text = document.getElementById('theme-toggle-text');
  if (!themeToggle || !icon || !text) return;

  const isDark = document.documentElement.classList.contains('dark');
  icon.textContent = isDark ? 'SUN' : 'MON';
  text.textContent = isDark ? 'Light' : 'Dark';
  themeToggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} theme`);
  themeToggle.setAttribute('aria-pressed', String(isDark));
};

const toggleTheme = () => {
  const nextTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
  applyTheme(nextTheme);
  saveTheme(nextTheme);
  renderThemeToggle();
};

const bindThemeToggleEvents = () => {
  if (document.documentElement.dataset.themeClickBound) return;

  document.addEventListener('click', (event) => {
    const rawTarget = event.target;
    const targetElement = rawTarget instanceof Element
      ? rawTarget
      : (rawTarget && rawTarget.nodeType === Node.TEXT_NODE ? rawTarget.parentElement : null);
    if (!targetElement) return;

    const toggleButton = targetElement.closest('#theme-toggle');
    if (!toggleButton) return;
    event.preventDefault();
    toggleTheme();
  });

  document.documentElement.dataset.themeClickBound = 'true';
};

const loadComponent = async (mountId, componentPath) => {
  const mount = document.getElementById(mountId);
  if (!mount) return;

  try {
    const response = await fetch(componentPath, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Failed to load ${componentPath}`);
    mount.innerHTML = await response.text();
  } catch (error) {
    console.warn(`Could not load ${componentPath}.`, error);
  }
};

const setNavLinkState = (link, isActive) => {
  const activeClasses = ['text-[#3f5dff]', 'dark:text-[#e8ff4d]', 'font-semibold'];
  const inactiveClasses = ['text-[#59627a]', 'dark:text-slate-300'];

  if (isActive) {
    link.classList.add(...activeClasses);
    link.classList.remove(...inactiveClasses);
  } else {
    link.classList.remove(...activeClasses);
    if (!link.classList.contains('text-[#59627a]')) link.classList.add('text-[#59627a]');
    if (!link.classList.contains('dark:text-slate-300')) link.classList.add('dark:text-slate-300');
  }
};

const setMobileNavLinkState = (link, isActive) => {
  const activeClasses = ['border-[#e8ff4d]/55', 'bg-[#1a1a1a]', 'text-[#e8ff4d]', 'translate-x-1'];
  const inactiveClasses = ['border-[#e8ff4d]/55', 'bg-[#1a1a1a]', 'text-[#e8ff4d]', 'translate-x-1'];

  if (isActive) {
    link.classList.add(...activeClasses);
  } else {
    link.classList.remove(...inactiveClasses);
  }
};

const isNavHrefActiveForCurrentPage = (href, currentPage) => {
  const cleanHref = (href || '').trim();
  if (!cleanHref || cleanHref === '#') return false;

  const [pathPart, hashPart] = cleanHref.split('#');
  const targetPage = (pathPart || currentPage).toLowerCase();
  if (targetPage !== currentPage) return false;
  if (!hashPart) return true;
  return currentPage === 'index.html' && window.location.hash === `#${hashPart}`;
};

const setStaticNavActiveState = () => {
  const currentPage = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const navLinks = document.querySelectorAll('#navbar [data-nav-link]');
  const mobileNavLinks = document.querySelectorAll('#mobile-menu [data-mobile-nav-link]');
  if (!navLinks.length && !mobileNavLinks.length) return;

  navLinks.forEach((link) => {
    const href = (link.getAttribute('href') || '').trim();
    setNavLinkState(link, isNavHrefActiveForCurrentPage(href, currentPage));
  });

  mobileNavLinks.forEach((link) => {
    const href = (link.getAttribute('href') || '').trim();
    setMobileNavLinkState(link, isNavHrefActiveForCurrentPage(href, currentPage));
  });
};

const initializeThemeToggle = () => {
  let themeToggle = document.getElementById('theme-toggle');
  let icon = document.getElementById('theme-toggle-icon');
  let text = document.getElementById('theme-toggle-text');

  if (!themeToggle || !icon || !text) {
    const fallback = document.createElement('button');
    fallback.id = 'theme-toggle';
    fallback.type = 'button';
    fallback.className = 'fixed bottom-4 right-4 z-[60] inline-flex items-center gap-2 rounded-full border border-[#d3dced] bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#59627a] shadow-lg transition hover:border-[#3f5dff] hover:text-[#151b2d] dark:border-[#222222] dark:bg-[#111111] dark:text-slate-300 dark:hover:border-[#e8ff4d] dark:hover:text-[#f0f0f0]';
    fallback.innerHTML = '<span id="theme-toggle-icon" aria-hidden="true" class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#edf2fb] text-[10px] text-[#3f5dff] dark:bg-[#1a1a1a] dark:text-[#e8ff4d]">MON</span><span id="theme-toggle-text">Dark</span>';
    document.body.appendChild(fallback);

    themeToggle = document.getElementById('theme-toggle');
    icon = document.getElementById('theme-toggle-icon');
    text = document.getElementById('theme-toggle-text');
  }

  if (!themeToggle || !icon || !text) return;

  bindThemeToggleEvents();

  const themeQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  if (themeQuery) {
    const handleThemeChange = (event) => {
      if (!getStoredTheme()) {
        applyTheme(event.matches ? 'dark' : 'light');
        renderThemeToggle();
      }
    };

    if (typeof themeQuery.addEventListener === 'function') {
      themeQuery.addEventListener('change', handleThemeChange);
    } else if (typeof themeQuery.addListener === 'function') {
      themeQuery.addListener(handleThemeChange);
    }
  }

  renderThemeToggle();
};

const initializeNavbar = () => {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const updateNavbarOnScroll = () => {
    const isScrolled = window.scrollY > 30;
    navbar.classList.toggle('bg-[#f4f7fc]/90', isScrolled);
    navbar.classList.toggle('dark:bg-[#0a0a0a]/85', isScrolled);
    navbar.classList.toggle('backdrop-blur-xl', isScrolled);
    navbar.classList.toggle('border-[#d3dced]', isScrolled);
    navbar.classList.toggle('dark:border-[#222222]', isScrolled);
    navbar.classList.toggle('shadow-[0_10px_30px_-20px_rgba(15,23,42,0.45)]', isScrolled);
    navbar.classList.toggle('bg-transparent', !isScrolled);
  };

  window.addEventListener('scroll', updateNavbarOnScroll, { passive: true });
  updateNavbarOnScroll();

  const hamburger = document.getElementById('hamburger');
  const hamburgerIcon = document.getElementById('hamburger-icon');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuPanel = document.getElementById('mobile-menu-panel');
  const mobileMenuBackdrop = document.getElementById('mobile-menu-backdrop');

  if (hamburger && mobileMenu && mobileMenuPanel) {
    const setHamburgerState = (isOpen) => {
      hamburger.setAttribute('aria-expanded', String(isOpen));
      hamburger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
      if (hamburgerIcon) {
        hamburgerIcon.innerHTML = isOpen ? '&times;' : '&#9776;';
        hamburgerIcon.style.fontSize = isOpen ? '2rem' : '1.25rem';
        hamburgerIcon.style.lineHeight = '1';
      }
    };

    const closeMenu = () => {
      mobileMenu.classList.remove('opacity-100', 'pointer-events-auto');
      mobileMenu.classList.add('opacity-0', 'pointer-events-none');
      mobileMenuPanel.classList.remove('translate-x-0');
      mobileMenuPanel.classList.add('translate-x-full');
      mobileMenu.setAttribute('aria-hidden', 'true');
      setHamburgerState(false);
      document.body.style.overflow = '';
    };

    const openMenu = () => {
      mobileMenu.classList.remove('opacity-0', 'pointer-events-none');
      mobileMenu.classList.add('opacity-100', 'pointer-events-auto');
      mobileMenuPanel.classList.remove('translate-x-full');
      mobileMenuPanel.classList.add('translate-x-0');
      mobileMenu.setAttribute('aria-hidden', 'false');
      setHamburgerState(true);
      document.body.style.overflow = 'hidden';
    };

    hamburger.addEventListener('click', () => {
      if (mobileMenu.classList.contains('pointer-events-none')) {
        openMenu();
      } else {
        closeMenu();
      }
    });

    if (mobileMenuBackdrop) {
      mobileMenuBackdrop.addEventListener('click', closeMenu);
    }

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !mobileMenu.classList.contains('pointer-events-none')) {
        closeMenu();
      }
    });

    mobileMenu.querySelectorAll('a').forEach((anchor) => {
      anchor.addEventListener('click', closeMenu);
    });

    setHamburgerState(false);
  }

  const links = navbar.querySelectorAll('[data-nav-link]');
  const sections = document.querySelectorAll('section[id]');
  if (links.length && sections.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        links.forEach((link) => {
          const href = link.getAttribute('href');
          if (!href || !href.includes('#')) return;
          const [pathPart, hashPart] = href.split('#');
          const isHomeSectionLink = href.startsWith('#') || pathPart.toLowerCase() === 'index.html';
          if (!isHomeSectionLink || !hashPart) return;
          setNavLinkState(link, hashPart === entry.target.id);
        });
      });
    }, { threshold: 0.45 });

    sections.forEach((section) => observer.observe(section));
  }
};

const initializeRevealAnimations = () => {
  const revealElements = document.querySelectorAll('[data-reveal]');
  if (!revealElements.length) return;

  if (typeof window.IntersectionObserver !== 'function') {
    revealElements.forEach((el) => {
      el.classList.remove('opacity-0', 'translate-y-6', 'scale-95');
      el.classList.add('opacity-100', 'translate-y-0', 'scale-100');
    });
    return;
  }

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (!entry.isIntersecting) return;
      setTimeout(() => {
        entry.target.classList.remove('opacity-0', 'translate-y-6', 'scale-95');
        entry.target.classList.add('opacity-100', 'translate-y-0', 'scale-100');
      }, index * 70);
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.15 });

  revealElements.forEach((el) => {
    if (!el.classList.contains('scale-100') && !el.classList.contains('scale-95')) {
      el.classList.add('scale-95');
    }
    revealObserver.observe(el);
  });
};

const initializeUniformButtonText = () => {
  const buttonLikeElements = document.querySelectorAll('button, a.rounded-full');
  if (!buttonLikeElements.length) return;

  buttonLikeElements.forEach((element) => {
    element.style.fontSize = '0.95rem';
    element.style.lineHeight = '1.25rem';
  });
};

const initializeHoverEffects = () => {
  const cards = document.querySelectorAll('section article, section aside, section .hover-card');
  if (!cards.length) return;

  cards.forEach((card) => {
    card.classList.add(
      'transition-transform',
      'transition-colors',
      'transition-shadow',
      'duration-300',
      'ease-out',
      'hover:-translate-y-1',
      'hover:scale-105',
      'hover:border-[#3f5dff]',
      'dark:hover:border-[#e8ff4d]',
      'hover:shadow-[0_18px_38px_-18px_rgba(63,93,255,0.45)]',
      'dark:hover:shadow-[0_18px_38px_-18px_rgba(232,255,77,0.55)]'
    );
  });
};

const initializeSkillBars = () => {
  const skillBars = document.querySelectorAll('[data-skill-bar]');
  if (!skillBars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const width = entry.target.getAttribute('data-width') || '0%';
      entry.target.style.width = width;
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  skillBars.forEach((bar) => observer.observe(bar));
};

const initializeCounters = () => {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const target = parseInt(entry.target.dataset.count || '0', 10);
      const suffix = entry.target.dataset.suffix || '';
      let current = 0;
      const step = target / 60;

      const update = () => {
        current = Math.min(current + step, target);
        entry.target.textContent = `${Math.round(current)}${suffix}`;
        if (current < target) requestAnimationFrame(update);
      };

      requestAnimationFrame(update);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  counters.forEach((counter) => observer.observe(counter));
};

const initializeProjectsSlider = () => {
  const projectsSlider = document.querySelector('.projects-slider');
  const projectsTrack = projectsSlider ? projectsSlider.querySelector('.projects-grid') : null;
  if (!projectsSlider || !projectsTrack) return;

  let currentTranslate = 0;
  let targetTranslate = 0;
  let maxTranslate = 0;
  let autoDir = 1;
  let dragging = false;
  let dragStartX = 0;
  let dragStartTranslate = 0;
  let rafId = null;
  let lastFrameTime = 0;
  let manualPauseUntil = Date.now() + 900;

  const autoSpeed = 34;
  const autoResumeDelay = 1600;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const pauseAuto = (duration = autoResumeDelay) => {
    manualPauseUntil = Date.now() + duration;
  };

  const syncLayout = () => {
    const viewportWidth = projectsSlider.clientWidth;
    const trackWidth = projectsTrack.scrollWidth;
    maxTranslate = Math.max(0, trackWidth - viewportWidth);
    currentTranslate = clamp(currentTranslate, 0, maxTranslate);
    targetTranslate = clamp(targetTranslate, 0, maxTranslate);

    if (maxTranslate === 0) {
      autoDir = 1;
    } else if (targetTranslate >= maxTranslate) {
      autoDir = -1;
    } else if (targetTranslate <= 0) {
      autoDir = 1;
    }

    projectsTrack.style.transform = `translate3d(${-currentTranslate}px, 0, 0)`;
  };

  const animate = (time) => {
    if (!lastFrameTime) lastFrameTime = time;
    const deltaSeconds = Math.min(64, Math.max(0, time - lastFrameTime)) / 1000;
    lastFrameTime = time;

    if (!dragging && maxTranslate > 0 && !document.hidden && Date.now() > manualPauseUntil) {
      targetTranslate = clamp(targetTranslate + autoDir * autoSpeed * deltaSeconds, 0, maxTranslate);

      if (targetTranslate >= maxTranslate) {
        targetTranslate = maxTranslate;
        autoDir = -1;
        pauseAuto(280);
      } else if (targetTranslate <= 0) {
        targetTranslate = 0;
        autoDir = 1;
        pauseAuto(280);
      }
    }

    currentTranslate += (targetTranslate - currentTranslate) * 0.16;
    if (Math.abs(targetTranslate - currentTranslate) < 0.1) {
      currentTranslate = targetTranslate;
    }

    projectsTrack.style.transform = `translate3d(${-currentTranslate}px, 0, 0)`;
    rafId = window.requestAnimationFrame(animate);
  };

  projectsSlider.addEventListener('wheel', (event) => {
    if (maxTranslate <= 0) return;
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (!delta) return;

    const nextTarget = clamp(targetTranslate + delta, 0, maxTranslate);
    if (nextTarget === targetTranslate) return;

    event.preventDefault();
    targetTranslate = nextTarget;
    pauseAuto();
  }, { passive: false });

  projectsSlider.addEventListener('pointerdown', (event) => {
    if (maxTranslate <= 0) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    dragging = true;
    manualPauseUntil = Number.POSITIVE_INFINITY;
    dragStartX = event.clientX;
    dragStartTranslate = targetTranslate;
    projectsSlider.classList.add('cursor-grabbing');
    projectsSlider.classList.remove('cursor-grab');

    if (projectsSlider.setPointerCapture) {
      projectsSlider.setPointerCapture(event.pointerId);
    }
  });

  projectsSlider.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    const deltaX = event.clientX - dragStartX;
    targetTranslate = clamp(dragStartTranslate - deltaX, 0, maxTranslate);
    currentTranslate = targetTranslate;
    projectsTrack.style.transform = `translate3d(${-currentTranslate}px, 0, 0)`;
  });

  const endDrag = (event) => {
    if (!dragging) return;

    dragging = false;
    pauseAuto();
    projectsSlider.classList.remove('cursor-grabbing');
    projectsSlider.classList.add('cursor-grab');

    if (projectsSlider.releasePointerCapture && event.pointerId !== undefined) {
      try {
        projectsSlider.releasePointerCapture(event.pointerId);
      } catch (error) {
        // Ignore stale pointer capture release attempts.
      }
    }
  };

  projectsSlider.addEventListener('pointerup', endDrag);
  projectsSlider.addEventListener('pointercancel', endDrag);
  projectsSlider.addEventListener('pointerleave', endDrag);

  syncLayout();
  rafId = window.requestAnimationFrame(animate);

  window.addEventListener('resize', syncLayout);
  window.addEventListener('beforeunload', () => {
    if (rafId) window.cancelAnimationFrame(rafId);
  }, { once: true });
};

const initializeContactForm = () => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const fields = {
    name: {
      el: document.getElementById('f-name'),
      err: document.getElementById('e-name'),
      validate: (value) => (value.trim().length >= 2 ? '' : 'Please enter your full name.')
    },
    email: {
      el: document.getElementById('f-email'),
      err: document.getElementById('e-email'),
      validate: (value) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Please enter a valid email address.')
    },
    subject: {
      el: document.getElementById('f-subject'),
      err: document.getElementById('e-subject'),
      validate: (value) => (value.trim().length >= 3 ? '' : 'Subject must be at least 3 characters.')
    },
    message: {
      el: document.getElementById('f-message'),
      err: document.getElementById('e-message'),
      validate: (value) => (value.trim().length >= 20 ? '' : 'Message must be at least 20 characters.')
    }
  };

  const subjectInput = fields.subject.el;
  const messageInput = fields.message.el;
  const topicChips = form.querySelectorAll('[data-topic-chip]');
  const messageCount = document.getElementById('f-message-count');

  const setChipState = (chip, isActive) => {
    chip.classList.toggle('bg-[#3f5dff]', isActive);
    chip.classList.toggle('text-white', isActive);
    chip.classList.toggle('border-[#3f5dff]', isActive);
    chip.classList.toggle('dark:bg-[#e8ff4d]', isActive);
    chip.classList.toggle('dark:text-[#111111]', isActive);
    chip.classList.toggle('dark:border-[#e8ff4d]', isActive);
  };

  if (topicChips.length && subjectInput) {
    topicChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const topic = chip.getAttribute('data-topic-chip') || '';
        if (!topic) return;

        subjectInput.value = topic;
        subjectInput.dispatchEvent(new Event('input', { bubbles: true }));
        subjectInput.dispatchEvent(new Event('blur', { bubbles: true }));

        topicChips.forEach((topicChip) => {
          setChipState(topicChip, topicChip === chip);
        });
      });
    });
  }

  const updateMessageCount = () => {
    if (!messageInput || !messageCount) return;
    const maxLength = Number(messageInput.getAttribute('maxlength')) || 500;
    const currentLength = messageInput.value.length;
    const nearLimit = currentLength >= Math.floor(maxLength * 0.9);

    messageCount.textContent = `${currentLength}/${maxLength}`;
    messageCount.classList.toggle('text-rose-500', nearLimit);
    messageCount.classList.toggle('text-[#59627a]', !nearLimit);
    messageCount.classList.toggle('dark:text-slate-400', !nearLimit);
  };

  if (messageInput && messageCount) {
    messageInput.addEventListener('input', updateMessageCount);
    updateMessageCount();
  }

  const setFieldError = (field, message) => {
    if (!field.el || !field.err) return;
    field.el.classList.toggle('border-rose-500', Boolean(message));
    field.el.classList.toggle('focus:border-rose-500', Boolean(message));
    field.err.textContent = message;
    field.err.classList.toggle('hidden', !message);
  };

  Object.values(fields).forEach((field) => {
    if (!field.el || !field.err) return;

    field.el.addEventListener('blur', () => {
      const message = field.validate(field.el.value);
      setFieldError(field, message);
    });

    field.el.addEventListener('input', () => {
      if (!field.err.classList.contains('hidden')) {
        const message = field.validate(field.el.value);
        setFieldError(field, message);
      }
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    let valid = true;

    Object.values(fields).forEach((field) => {
      if (!field.el || !field.err) return;
      const message = field.validate(field.el.value);
      setFieldError(field, message);
      if (message) valid = false;
    });

    if (!valid) return;

    const button = form.querySelector('button[type="submit"]');
    const success = document.getElementById('form-success');
    if (!button || !success) return;

    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = 'Sending...';

    setTimeout(() => {
      form.reset();
      topicChips.forEach((chip) => setChipState(chip, false));
      updateMessageCount();
      button.disabled = false;
      button.textContent = originalText;
      success.classList.remove('hidden');
      setTimeout(() => success.classList.add('hidden'), 4500);
    }, 1200);
  });
};

const initializeSmoothAnchors = () => {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const href = anchor.getAttribute('href');
      if (!href) return;
      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
};

applyTheme(getStoredTheme() || getSystemTheme());

document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([
    loadComponent('site-header', 'components/header.html'),
    loadComponent('site-footer', 'components/footer.html')
  ]);

  applyTheme(getStoredTheme() || getSystemTheme());
  initializeThemeToggle();
  setStaticNavActiveState();
  initializeNavbar();
  initializeRevealAnimations();
  initializeHoverEffects();
  initializeSkillBars();
  initializeCounters();
  initializeProjectsSlider();
  initializeContactForm();
  initializeSmoothAnchors();
  initializeUniformButtonText();

  window.addEventListener('hashchange', setStaticNavActiveState);
});
