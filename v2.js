(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  const menuButton = document.querySelector('[data-menu-button]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  if (menuButton && mobileMenu) {
    const closeMenu = () => {
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open menu');
      mobileMenu.hidden = true;
    };

    menuButton.addEventListener('click', () => {
      const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeMenu();
      } else {
        menuButton.setAttribute('aria-expanded', 'true');
        menuButton.setAttribute('aria-label', 'Close menu');
        mobileMenu.hidden = false;
      }
    });

    mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu();
    });
  }

  const reveals = [...document.querySelectorAll('.reveal')];
  if (reducedMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const siblings = entry.target.parentElement?.querySelectorAll(':scope > .reveal');
        let index = 0;
        if (siblings) index = [...siblings].indexOf(entry.target);
        entry.target.style.transitionDelay = `${Math.max(0, index) * 55}ms`;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(el => observer.observe(el));
  }

  const header = document.querySelector('[data-header]');
  let lastY = window.scrollY;
  let ticking = false;
  const updateHeader = () => {
    const y = window.scrollY;
    if (header) {
      if (y > 100 && y > lastY + 5) header.style.transform = 'translateY(-95px)';
      else if (y < lastY - 5 || y < 100) header.style.transform = 'translateY(0)';
    }
    lastY = y;
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });

  const showcase = document.querySelector('[data-showcase]');
  const prev = document.querySelector('[data-scroll-prev]');
  const next = document.querySelector('[data-scroll-next]');
  if (showcase && prev && next) {
    const amount = () => Math.min(showcase.clientWidth * .78, 430);
    prev.addEventListener('click', () => showcase.scrollBy({ left: -amount(), behavior: reducedMotion ? 'auto' : 'smooth' }));
    next.addEventListener('click', () => showcase.scrollBy({ left: amount(), behavior: reducedMotion ? 'auto' : 'smooth' }));
  }

  if (!reducedMotion) {
    const parallaxEls = [...document.querySelectorAll('[data-parallax]')];
    let parallaxTick = false;
    const updateParallax = () => {
      const vh = window.innerHeight;
      parallaxEls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        const strength = Number(el.dataset.parallax || 0.02);
        const offset = (vh / 2 - (rect.top + rect.height / 2)) * strength;
        el.style.transform = `translate3d(0, ${offset}px, 0)`;
      });
      parallaxTick = false;
    };
    window.addEventListener('scroll', () => {
      if (!parallaxTick) {
        requestAnimationFrame(updateParallax);
        parallaxTick = true;
      }
    }, { passive: true });
    updateParallax();
  }
})();
