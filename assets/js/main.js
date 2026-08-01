(() => {
  'use strict';

  document.documentElement.classList.add('js');

  const root = document.documentElement;
  const body = document.body;
  const themeButton = document.querySelector('.theme-toggle');
  const themeIcon = themeButton?.querySelector('i');
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.main-nav');
  const navLinks = [...document.querySelectorAll('.main-nav a')];
  const progress = document.querySelector('.scroll-progress span');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const themeStorageKey = 'portfolio-theme-v3';
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  const savedTheme = localStorage.getItem(themeStorageKey);
  const preferredTheme = systemTheme.matches ? 'dark' : 'light';

  function setTheme(theme, persist = false) {
    root.dataset.theme = theme;
    if (persist) localStorage.setItem(themeStorageKey, theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#090d0c' : '#f3f5f1');
    if (!themeButton || !themeIcon) return;
    const isDark = theme === 'dark';
    themeButton.setAttribute('aria-label', isDark ? 'Açık temaya geç' : 'Koyu temaya geç');
    themeButton.setAttribute('title', `${isDark ? 'Açık' : 'Koyu'} temaya geç · Varsayılan: cihaz teması`);
    themeIcon.className = isDark ? 'las la-sun' : 'las la-moon';
  }

  setTheme(savedTheme || preferredTheme);
  themeButton?.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true));
  systemTheme.addEventListener('change', event => {
    if (localStorage.getItem(themeStorageKey)) return;
    setTheme(event.matches ? 'dark' : 'light');
  });

  function closeMenu() {
    menu?.classList.remove('open');
    body.classList.remove('nav-open');
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Menüyü aç');
    const icon = menuButton?.querySelector('i');
    if (icon) icon.className = 'las la-bars';
  }

  menuButton?.addEventListener('click', () => {
    const willOpen = !menu?.classList.contains('open');
    menu?.classList.toggle('open', willOpen);
    body.classList.toggle('nav-open', willOpen);
    menuButton.setAttribute('aria-expanded', String(willOpen));
    menuButton.setAttribute('aria-label', willOpen ? 'Menüyü kapat' : 'Menüyü aç');
    menuButton.querySelector('i').className = willOpen ? 'las la-times' : 'las la-bars';
  });
  navLinks.forEach(link => link.addEventListener('click', closeMenu));

  const commandMenu = document.querySelector('.command-menu');
  const commandToggle = document.querySelector('.command-toggle');
  const commandClose = document.querySelector('.command-close');
  const commandBackdrop = document.querySelector('.command-backdrop');
  const commandSearch = document.querySelector('.command-search input');
  const commandLinks = [...document.querySelectorAll('.command-links a')];

  function openCommandMenu() {
    if (!commandMenu) return;
    commandMenu.hidden = false;
    body.classList.add('command-open');
    requestAnimationFrame(() => {
      commandMenu.classList.add('open');
      commandSearch?.focus();
    });
  }

  function closeCommandMenu() {
    if (!commandMenu || commandMenu.hidden) return;
    commandMenu.classList.remove('open');
    body.classList.remove('command-open');
    window.setTimeout(() => {
      commandMenu.hidden = true;
      if (commandSearch) commandSearch.value = '';
      commandLinks.forEach(link => { link.hidden = false; });
    }, reducedMotion ? 0 : 220);
    commandToggle?.focus();
  }

  commandToggle?.addEventListener('click', openCommandMenu);
  commandClose?.addEventListener('click', closeCommandMenu);
  commandBackdrop?.addEventListener('click', closeCommandMenu);
  commandLinks.forEach(link => link.addEventListener('click', closeCommandMenu));
  commandSearch?.addEventListener('input', () => {
    const query = commandSearch.value.toLocaleLowerCase('tr').trim();
    commandLinks.forEach(link => { link.hidden = !link.dataset.commandLabel.includes(query); });
  });
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase('tr') === 'k') {
      event.preventDefault();
      commandMenu?.hidden ? openCommandMenu() : closeCommandMenu();
      return;
    }
    if (event.key === 'Escape') closeCommandMenu();
    if (!commandMenu || commandMenu.hidden || !['ArrowDown', 'ArrowUp'].includes(event.key)) return;
    event.preventDefault();
    const visibleLinks = commandLinks.filter(link => !link.hidden);
    const currentIndex = visibleLinks.indexOf(document.activeElement);
    const direction = event.key === 'ArrowDown' ? 1 : -1;
    const nextIndex = (currentIndex + direction + visibleLinks.length) % visibleLinks.length;
    visibleLinks[nextIndex]?.focus();
  });

  window.addEventListener('load', () => {
    if (!window.location.hash) return;
    window.setTimeout(() => {
      const target = document.getElementById(window.location.hash.slice(1));
      if (!target) return;
      root.style.scrollBehavior = 'auto';
      target.scrollIntoView({ block: 'start' });
      requestAnimationFrame(() => { root.style.scrollBehavior = ''; });
    }, 120);
  });

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));

  const sections = [...document.querySelectorAll('main section[id]')];
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => link.classList.toggle('active', link.hash === `#${entry.target.id}`));
    });
  }, { rootMargin: '-35% 0px -55% 0px' });
  sections.forEach(section => sectionObserver.observe(section));

  window.addEventListener('scroll', () => {
    const height = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = `${height > 0 ? (window.scrollY / height) * 100 : 0}%`;
  }, { passive: true });

  const animatedRole = document.querySelector('.hero-title em');
  if (animatedRole && !reducedMotion) {
    const label = animatedRole.textContent.trim();
    animatedRole.setAttribute('aria-label', label);
    animatedRole.innerHTML = [...label].map((character, index) =>
      `<span class="letter${character === ' ' ? ' space' : ''}" style="--i:${index}" aria-hidden="true">${character === ' ' ? '&nbsp;' : character}</span>`
    ).join('');
  }

  const codeState = document.querySelector('#code-state');
  if (codeState && !reducedMotion) {
    const states = ['useful + simple;', 'fast + accessible;', 'clean + scalable;', 'idea => product;'];
    let stateIndex = 0;
    window.setInterval(() => {
      codeState.animate([{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-6px)' }], { duration: 180, fill: 'forwards' }).finished.then(() => {
        stateIndex = (stateIndex + 1) % states.length;
        codeState.textContent = states[stateIndex];
        codeState.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 260, fill: 'forwards' });
      });
    }, 2400);
  }

  const cursorGlow = document.querySelector('.cursor-glow');
  if (cursorGlow && !reducedMotion && window.matchMedia('(hover: hover)').matches) {
    window.addEventListener('pointermove', event => {
      cursorGlow.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
    }, { passive: true });
    document.addEventListener('mouseleave', () => { cursorGlow.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { cursorGlow.style.opacity = ''; });
  }

  const motionPalette = ['#9b6dff', '#38bde8', '#43c78a', '#ff9a56', '#ff6d9f'];
  if (!reducedMotion && window.matchMedia('(hover: hover)').matches) {
    let lastSpark = 0;
    window.addEventListener('pointermove', event => {
      const now = performance.now();
      if (now - lastSpark < 65) return;
      lastSpark = now;
      const spark = document.createElement('span');
      spark.className = 'spark-trail';
      spark.style.left = `${event.clientX}px`;
      spark.style.top = `${event.clientY}px`;
      spark.style.setProperty('--spark', motionPalette[Math.floor(Math.random() * motionPalette.length)]);
      spark.style.setProperty('--dx', `${Math.random() * 26 - 13}px`);
      spark.style.setProperty('--dy', `${Math.random() * 26 - 13}px`);
      body.appendChild(spark);
      spark.addEventListener('animationend', () => spark.remove());
    }, { passive: true });
  }

  const parallaxShapes = document.querySelectorAll('.parallax-shape');
  if (parallaxShapes.length && !reducedMotion) {
    let parallaxFrame;
    window.addEventListener('scroll', () => {
      if (parallaxFrame) return;
      parallaxFrame = requestAnimationFrame(() => {
        parallaxShapes.forEach((shape, index) => {
          const direction = index % 2 ? -1 : 1;
          shape.style.transform = `translate3d(0, ${window.scrollY * 0.025 * direction}px, 0)`;
        });
        parallaxFrame = null;
      });
    }, { passive: true });
  }

  if (!reducedMotion && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.work-card').forEach(card => {
      card.addEventListener('pointermove', event => {
        const box = card.getBoundingClientRect();
        const rotateY = ((event.clientX - box.left) / box.width - 0.5) * 4;
        const rotateX = ((event.clientY - box.top) / box.height - 0.5) * -4;
        card.style.transform = `perspective(1100px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });

    document.querySelectorAll('.button').forEach(button => {
      button.addEventListener('pointermove', event => {
        const box = button.getBoundingClientRect();
        const x = (event.clientX - box.left - box.width / 2) * 0.12;
        const y = (event.clientY - box.top - box.height / 2) * 0.16;
        button.style.transform = `translate(${x}px, ${y}px)`;
      });
      button.addEventListener('pointerleave', () => { button.style.transform = ''; });
    });
  }

  document.querySelectorAll('.button').forEach(button => button.addEventListener('click', event => {
    if (reducedMotion) return;
    const ripple = document.createElement('span');
    const box = button.getBoundingClientRect();
    ripple.className = 'click-ripple';
    ripple.style.left = `${event.clientX - box.left}px`;
    ripple.style.top = `${event.clientY - box.top}px`;
    ripple.style.width = ripple.style.height = `${Math.max(box.width, box.height)}px`;
    button.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  }));

  document.querySelectorAll('.lab-switch').forEach((button, index, buttons) => button.addEventListener('click', event => {
    buttons.forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    const lab = button.closest('.principle-lab');
    const output = lab?.querySelector('.lab-output');
    if (!lab || !output) return;
    lab.style.setProperty('--lab-accent', button.dataset.color);
    output.querySelector('h3').textContent = button.dataset.title;
    output.querySelector('p').textContent = button.dataset.copy;
    const icons = ['la-bolt', 'la-universal-access', 'la-expand-arrows-alt'];
    output.querySelector('.output-icon i').className = `las ${icons[index]}`;
    if (!reducedMotion) output.animate([{ transform: 'translateY(8px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }], { duration: 320, easing: 'ease-out' });

    if (!reducedMotion) {
      for (let particleIndex = 0; particleIndex < 8; particleIndex += 1) {
        const particle = document.createElement('span');
        const angle = (Math.PI * 2 * particleIndex) / 8;
        particle.className = 'click-burst';
        particle.style.left = `${event.clientX}px`;
        particle.style.top = `${event.clientY}px`;
        particle.style.setProperty('--spark', motionPalette[particleIndex % motionPalette.length]);
        particle.style.setProperty('--dx', `${Math.cos(angle) * 48}px`);
        particle.style.setProperty('--dy', `${Math.sin(angle) * 48}px`);
        body.appendChild(particle);
        particle.addEventListener('animationend', () => particle.remove());
      }
    }
  }));

  const stats = document.querySelectorAll('.hero-stats strong');
  if (!reducedMotion) {
    stats.forEach(stat => {
      const suffix = stat.textContent.includes('+') ? '+' : '';
      const target = Number.parseInt(stat.textContent, 10);
      const start = performance.now();
      const updateCounter = now => {
        const progressValue = Math.min((now - start) / 850, 1);
        stat.textContent = `${Math.round(target * (1 - Math.pow(1 - progressValue, 3)))}${suffix}`;
        if (progressValue < 1) requestAnimationFrame(updateCounter);
      };
      requestAnimationFrame(updateCounter);
    });
  }

  const filterButtons = document.querySelectorAll('.filter-button');
  const projectCards = document.querySelectorAll('.project-card');
  filterButtons.forEach(button => button.addEventListener('click', () => {
    filterButtons.forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    const filter = button.dataset.filter;
    projectCards.forEach(card => card.classList.toggle('hidden', filter !== 'all' && card.dataset.category !== filter));
  }));

  document.querySelector('#contact-form')?.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = encodeURIComponent(`${data.get('subject')} — ${data.get('name')}`);
    const message = encodeURIComponent(`Merhaba Uğur,\n\n${data.get('message')}\n\nGönderen: ${data.get('name')}\nE-posta: ${data.get('email')}`);
    window.location.href = `mailto:uusolen@gmail.com?subject=${subject}&body=${message}`;
  });

  const year = document.querySelector('#current-year');
  if (year) year.textContent = new Date().getFullYear();

})();
