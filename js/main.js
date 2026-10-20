(() => {
  const data = window.PORTFOLIO_DATA;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionPreference = new URLSearchParams(window.location.search).get('motion');
  const motionEnabled = motionPreference === 'on' || (motionPreference !== 'off' && !reducedMotion.matches);
  const motionToggle = document.querySelector('.motion-toggle');
  const motionToggleLabel = motionToggle.querySelector('.motion-toggle-label');
  const projectList = document.querySelector('#project-list');
  const certGrid = document.querySelector('#cert-grid');
  const modal = document.querySelector('#project-modal');
  const modalContent = document.querySelector('#modal-content');
  let lastFocusedElement = null;
  const binaryTimers = new WeakMap();

  function randomBinarySequence() {
    return Array.from({ length: 240 }, (_, index) => `${Math.random() < 0.5 ? '0' : '1'}${(index + 1) % 4 === 0 && index < 239 ? ' ' : ''}`).join('');
  }

  function binaryOverlayFor(title) {
    let overlay = title.querySelector('.binary-title-code');
    if (!overlay) {
      overlay = document.createElement('span');
      overlay.className = 'binary-title-code';
      overlay.setAttribute('aria-hidden', 'true');
      title.append(overlay);
    }
    return overlay;
  }

  function stopBinaryDecode(title) {
    const timer = binaryTimers.get(title);
    if (timer !== undefined) window.clearInterval(timer);
    binaryTimers.delete(title);
    title.classList.remove('is-decoding');
  }

  function startBinaryDecode(title) {
    if (title.classList.contains('is-decoding')) return;
    const overlay = binaryOverlayFor(title);
    overlay.textContent = randomBinarySequence();
    title.classList.add('is-decoding');
    binaryTimers.set(title, window.setInterval(() => {
      overlay.textContent = randomBinarySequence();
    }, 75));
  }

  document.documentElement.classList.toggle('motion-enabled', motionEnabled);
  document.documentElement.classList.toggle('motion-disabled', !motionEnabled);
  motionToggle.setAttribute('aria-pressed', String(motionEnabled));
  motionToggle.setAttribute('aria-label', motionEnabled ? 'Turn animations off' : 'Turn animations on');
  motionToggleLabel.textContent = `Motion: ${motionEnabled ? 'On' : 'Off'}`;
  motionToggle.addEventListener('click', () => {
    const url = new URL(window.location.href);
    url.searchParams.set('motion', motionEnabled ? 'off' : 'on');
    window.location.assign(url);
  });

  const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

  function projectVisual(project) {
    if (project.visual === 'edu') {
      return `<img class="edu-project-image" src="Picture1.jpg" alt="EduTech Learning app start screen">`;
    }
    return `<img class="pet-project-image" src="belupacito.png" alt="Belupacito AI pet care assistant sign-in screen">`;
  }

  function projectAccessLink(project) {
    if (!project.accessLink) return '';
    const url = escapeHTML(project.accessLink);
    return `<p class="project-access-link"><span>Access Link:</span> <a href="${url}" target="_blank" rel="noopener noreferrer"> ${url}</a></p>`;
  }

  function renderProjects() {
    projectList.innerHTML = data.projects.map((project) => `
      <article class="project-card reveal" data-project="${escapeHTML(project.slug)}">
        <div class="project-visual visual-${escapeHTML(project.visual)}" data-scroll-parallax="12" aria-hidden="true">${projectVisual(project)}<span class="visual-grain"></span></div>
        <div class="project-info"><div class="project-meta"><span>${escapeHTML(project.number)} / ${escapeHTML(project.category)}</span><span>${escapeHTML(project.role)}</span></div><h3>${escapeHTML(project.title)}</h3><p>${escapeHTML(project.description)}</p><div class="project-tags">${project.technologies.slice(0, 5).map((tag) => `<span>${escapeHTML(tag)}</span>`).join('')}<span class="tag-more">+${project.technologies.length - 5}</span></div>${projectAccessLink(project)}<button class="project-open" type="button" aria-label="Explore ${escapeHTML(project.title)}">EXPLORE PROJECT <span>↗</span></button></div>
      </article>`).join('');
    projectList.querySelectorAll('.project-card').forEach((card) => {
      const project = data.projects.find((item) => item.slug === card.dataset.project);
      card.addEventListener('click', () => openModal(project));
      card.querySelectorAll('.project-access-link a').forEach((link) => {
        link.addEventListener('click', (event) => event.stopPropagation());
      });
      card.addEventListener('pointermove', (event) => {
        if (!motionEnabled || event.pointerType !== 'mouse') return;
        const bounds = card.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width;
        const y = (event.clientY - bounds.top) / bounds.height;
        card.style.setProperty('--tilt-x', `${(0.5 - y) * 3.5}deg`);
        card.style.setProperty('--tilt-y', `${(x - 0.5) * 4}deg`);
        card.style.setProperty('--pointer-x', `${x * 100}%`);
        card.style.setProperty('--pointer-y', `${y * 100}%`);
      });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
      });
    });
  }

  function renderCertificates() {
    certGrid.innerHTML = data.certificates.map((certificate) => `<article class="cert-card reveal"><div class="cert-card-top"><span>RECORD / ${escapeHTML(certificate.number)}</span><span class="cert-lock" aria-hidden="true">◇</span></div><a class="cert-preview" href="${escapeHTML(certificate.image)}" target="_blank" rel="noopener" aria-label="Open certificate: ${escapeHTML(certificate.title)}"><img src="${escapeHTML(certificate.image)}" alt="${escapeHTML(certificate.title)} certificate" loading="lazy" decoding="async"></a><h3>${escapeHTML(certificate.title)}</h3><p>${escapeHTML(certificate.description)}</p><span class="cert-issuer">${escapeHTML(certificate.issuer)}</span><span class="cert-date">${escapeHTML(certificate.date)}</span><a class="cert-button" href="${escapeHTML(certificate.image)}" target="_blank" rel="noopener">VIEW CERTIFICATE <span aria-hidden="true">↗</span></a></article>`).join('');
  }

  function openModal(project) {
    lastFocusedElement = document.activeElement;
    modalContent.innerHTML = `<p class="eyebrow">${escapeHTML(project.number)} / ${escapeHTML(project.category)}</p><h2 id="modal-title">${escapeHTML(project.title)}</h2><p class="modal-lead">${escapeHTML(project.overview)}</p><div class="modal-role"><span>ROLE</span><strong>${escapeHTML(project.role)}</strong></div><div class="modal-detail-grid"><section><h3>Project overview</h3><p>${escapeHTML(project.description)}</p></section><section><h3>Main features</h3><ul>${project.features.map((feature) => `<li>${escapeHTML(feature)}</li>`).join('')}</ul></section><section><h3>Technologies</h3><div class="modal-tags">${project.technologies.map((technology) => `<span>${escapeHTML(technology)}</span>`).join('')}</div>${projectAccessLink(project)}</section><section><h3>Objective</h3><p>${escapeHTML(project.objectives)}</p></section><section class="modal-wide"><h3>Development contributions</h3><p>${escapeHTML(project.contributions)}</p></section></div><div class="modal-visual visual-${escapeHTML(project.visual)}" aria-label="Project screenshot for ${escapeHTML(project.title)}">${projectVisual(project)}</div><p class="modal-visual-note">Project screenshot</p>`;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    modal.querySelector('.modal-close').focus();
  }

  function closeModal() {
    if (modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    if (lastFocusedElement) lastFocusedElement.focus();
  }

  function observeReveals(root = document) {
    const elements = root.querySelectorAll('.reveal');
    if (!motionEnabled || !('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
        const title = entry.target.querySelector('[data-binary-reveal]');
        if (title) {
          if (!title.dataset.binaryReady) {
            title.addEventListener('animationend', (event) => {
              if (event.animationName === 'binary-title-scan') stopBinaryDecode(title);
            });
            title.dataset.binaryReady = 'true';
          }
          if (entry.isIntersecting) startBinaryDecode(title);
          else stopBinaryDecode(title);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    elements.forEach((element) => observer.observe(element));
  }

  function animateCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    const animationFrames = new WeakMap();
    const animate = (element) => {
      const target = Number(element.dataset.counter);
      const suffix = element.dataset.suffix || '';
      if (!motionEnabled) { element.textContent = `${target}${suffix}`; return; }
      const previousFrame = animationFrames.get(element);
      if (previousFrame !== undefined) cancelAnimationFrame(previousFrame);
      element.classList.add('is-counting');
      const start = performance.now();
      const duration = 2500;
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = progress * progress * (3 - 2 * progress);
        element.textContent = `${Math.floor(target * eased)}${progress === 1 ? suffix : ''}`;
        if (progress < 1) animationFrames.set(element, requestAnimationFrame(tick));
        else {
          animationFrames.delete(element);
          element.classList.remove('is-counting');
        }
      };
      animationFrames.set(element, requestAnimationFrame(tick));
    };
    if (!('IntersectionObserver' in window)) { counters.forEach(animate); return; }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          animate(entry.target);
          return;
        }
        const frame = animationFrames.get(entry.target);
        if (frame !== undefined) cancelAnimationFrame(frame);
        animationFrames.delete(entry.target);
        entry.target.classList.remove('is-counting');
        entry.target.textContent = '0';
      });
    }, { threshold: 0.6 });
    counters.forEach((counter) => observer.observe(counter));
  }

  function setupNavigation() {
    const menuButton = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.primary-nav');
    menuButton.addEventListener('click', () => {
      const expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!expanded));
      menuButton.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
      nav.classList.toggle('is-open', !expanded);
    });
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open navigation');
      nav.classList.remove('is-open');
    }));
    const sections = [...document.querySelectorAll('main section[id]')];
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      document.querySelectorAll('.nav-link').forEach((link) => link.classList.toggle('is-active', link.hash === `#${entry.target.id}`));
    }), { rootMargin: '-35% 0px -55% 0px' });
    sections.forEach((section) => observer.observe(section));
  }

  function setupParallax() {
    const targets = document.querySelectorAll('[data-parallax]');
    if (!motionEnabled || !window.matchMedia('(pointer: fine)').matches) return;
    let scheduled = false;
    let pointerX = 0;
    let pointerY = 0;
    document.addEventListener('pointermove', (event) => {
      pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
      pointerY = (event.clientY / window.innerHeight - 0.5) * 2;
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        targets.forEach((element) => {
          const depth = Number(element.dataset.parallax);
          element.style.transform = `translate3d(${pointerX * depth * 30}px, ${pointerY * depth * 24}px, 0)`;
        });
        scheduled = false;
      });
    }, { passive: true });
  }

  function setupProfileTilt() {
    const badge = document.querySelector('[data-profile-tilt]');
    if (!motionEnabled || !window.matchMedia('(pointer: fine)').matches) return;
    badge.addEventListener('pointermove', (event) => {
      const bounds = badge.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      badge.style.setProperty('--profile-tilt-x', `${(0.5 - y) * 16}deg`);
      badge.style.setProperty('--profile-tilt-y', `${(x - 0.5) * 16}deg`);
      badge.style.setProperty('--profile-pointer-x', `${x * 100}%`);
      badge.style.setProperty('--profile-pointer-y', `${y * 100}%`);
    }, { passive: true });
    badge.addEventListener('pointerleave', () => {
      badge.style.setProperty('--profile-tilt-x', '0deg');
      badge.style.setProperty('--profile-tilt-y', '0deg');
      badge.style.setProperty('--profile-pointer-x', '50%');
      badge.style.setProperty('--profile-pointer-y', '50%');
    });
  }

  function setupTitleBinaryHover() {
    const title = document.querySelector('#hero-title');
    const fragments = [...title.querySelectorAll('.hero-title-binary span')];
    if (!motionEnabled || !window.matchMedia('(pointer: fine)').matches) return;
    title.addEventListener('pointerenter', () => title.classList.add('is-binary-hover'));
    title.addEventListener('pointermove', (event) => {
      const bounds = title.getBoundingClientRect();
      const pointerX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      const pointerY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
      fragments.forEach((fragment, index) => {
        const direction = index % 2 === 0 ? 1 : -1;
        const depth = 1 + (index % 3) * 0.2;
        fragment.style.translate = `${pointerX * direction * depth * 7}px ${pointerY * direction * depth * 5}px`;
      });
    }, { passive: true });
    title.addEventListener('pointerleave', () => {
      title.classList.remove('is-binary-hover');
      fragments.forEach((fragment) => {
        fragment.style.translate = '0px 0px';
      });
    });
  }

  function setupScrollParallax() {
    const targets = [...document.querySelectorAll('[data-scroll-parallax]')].map((element) => ({
      element,
      depth: Number(element.dataset.scrollParallax),
      shift: 0,
      rotate: 0
    }));
    if (!motionEnabled || targets.length === 0) return;
    let scheduled = false;
    const update = () => {
      scheduled = false;
      const viewportCenter = window.innerHeight / 2;
      let needsAnotherFrame = false;
      targets.forEach((target) => {
        const { element, depth } = target;
        const bounds = element.getBoundingClientRect();
        const distance = (bounds.top + bounds.height / 2 - viewportCenter) / window.innerHeight;
        const boundedDistance = Math.max(-1, Math.min(1, distance));
        const desiredShift = -boundedDistance * depth;
        const desiredRotate = boundedDistance * depth * 0.025;
        target.shift += (desiredShift - target.shift) * 0.085;
        target.rotate += (desiredRotate - target.rotate) * 0.085;
        if (Math.abs(desiredShift - target.shift) > 0.08 || Math.abs(desiredRotate - target.rotate) > 0.005) needsAnotherFrame = true;
        else {
          target.shift = desiredShift;
          target.rotate = desiredRotate;
        }
        element.style.setProperty('--scroll-shift', `${target.shift}px`);
        element.style.setProperty('--scroll-rotate', `${target.rotate}deg`);
      });
      if (needsAnotherFrame) {
        scheduled = true;
        requestAnimationFrame(update);
      }
    };
    const scheduleUpdate = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(update);
    };
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });
    scheduleUpdate();
  }

  function setupCursor() {
    if (!motionEnabled || !window.matchMedia('(pointer: fine)').matches) return;
    const cursor = document.querySelector('.custom-cursor');
    document.body.classList.add('has-custom-cursor');
    document.addEventListener('pointermove', (event) => {
      cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    }, { passive: true });
    document.querySelectorAll('a, button, [role="button"], input').forEach((element) => {
      element.addEventListener('pointerenter', () => cursor.classList.add('is-hovering'));
      element.addEventListener('pointerleave', () => cursor.classList.remove('is-hovering'));
    });
  }

  function setupMagneticButtons() {
    if (!motionEnabled || !window.matchMedia('(pointer: fine)').matches) return;
    document.querySelectorAll('.magnetic').forEach((button) => {
      button.addEventListener('pointermove', (event) => {
        const rect = button.getBoundingClientRect();
        button.style.setProperty('--mag-x', `${(event.clientX - rect.left - rect.width / 2) * 0.08}px`);
        button.style.setProperty('--mag-y', `${(event.clientY - rect.top - rect.height / 2) * 0.12}px`);
      });
      button.addEventListener('pointerleave', () => {
        button.style.setProperty('--mag-x', '0px');
        button.style.setProperty('--mag-y', '0px');
      });
    });
  }

  renderProjects();
  renderCertificates();
  observeReveals();
  animateCounters();
  setupNavigation();
  setupParallax();
  setupProfileTilt();
  setupTitleBinaryHover();
  setupScrollParallax();
  setupCursor();
  setupMagneticButtons();

  document.querySelectorAll('[data-open-assistant]:not(.assistant-launcher)').forEach((button) => button.addEventListener('click', () => document.dispatchEvent(new Event('open-portfolio-assistant'))));
  modal.querySelector('.modal-close').addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
    if (event.key === 'Tab' && !modal.hidden) {
      const focusable = [...modal.querySelectorAll('button, a[href], input, [tabindex]:not([tabindex="-1"])')];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
})();
