(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Restore the high-resolution client media used throughout the page. The media
  // is stored in small same-origin text chunks so it can be reconstructed reliably
  // in production without depending on the broken legacy SVG sprite.
  const loadBrandMedia = async () => {
    try {
      const parts = await Promise.all(
        Array.from({ length: 8 }, (_, index) => {
          const part = String(index + 1).padStart(2, '0');
          return fetch(`/media/sprite.part${part}`, { cache: 'force-cache' }).then((response) => {
            if (!response.ok) throw new Error(`Media part ${part} failed with ${response.status}`);
            return response.text();
          });
        })
      );

      const base64 = parts.join('').replace(/\s+/g, '');
      const spriteUrl = `url(\"data:image/webp;base64,${base64}\")`;
      document.querySelectorAll('.asset-image').forEach((element) => {
        element.style.setProperty('background-image', spriteUrl, 'important');
        element.style.setProperty('background-repeat', 'no-repeat', 'important');
        element.style.setProperty('background-size', '300% 300%', 'important');
      });
      document.documentElement.classList.add('media-ready');
    } catch (error) {
      console.error('Unable to load Scent by Menina media:', error);
      document.documentElement.classList.add('media-error');
    }
  };
  loadBrandMedia();

  const officialInstagram = 'https://www.instagram.com/scentby_menina/';

  // Give visitors a direct path from the main landing page to the Linktree-style
  // hub containing the brand's website, WhatsApp, Instagram and TikTok links.
  const addLinksPageEntryPoints = () => {
    const linksHref = '/links.html';
    const heroActions = document.querySelector('.hero-actions');
    if (heroActions && !heroActions.querySelector('[data-links-page]')) {
      const link = document.createElement('a');
      link.className = 'btn btn-ghost';
      link.href = linksHref;
      link.dataset.linksPage = 'true';
      link.textContent = 'Shop, Follow & Connect ↗';
      heroActions.appendChild(link);
    }

    const mobileMenu = document.querySelector('[data-mobile-menu]');
    if (mobileMenu && !mobileMenu.querySelector('[data-links-page]')) {
      const link = document.createElement('a');
      link.href = linksHref;
      link.dataset.linksPage = 'true';
      link.textContent = 'Shop, Follow & Connect ↗';
      mobileMenu.appendChild(link);
    }
  };
  addLinksPageEntryPoints();

  // The former Bumpa storefront is inactive. Route every old storefront link
  // to the official Instagram profile so visitors never hit a dead destination.
  document.querySelectorAll('a[href]').forEach((link) => {
    const href = link.getAttribute('href') || '';
    const isOldStore = href.includes('scentbymenina1.bumpa.shop') ||
      (href.includes('l.instagram.com') && href.includes('scentbymenina1.bumpa.shop'));

    if (isOldStore) {
      link.href = officialInstagram;
      link.target = '_blank';

      const label = link.textContent.trim().toLowerCase();
      if (label.includes('shop the collection')) link.textContent = 'View Collection on Instagram ↗';
      else if (label.includes('browse current stock')) link.textContent = 'See Current Stock on Instagram ↗';
      else if (label.includes('shop retail')) link.textContent = 'Shop via Instagram ↗';
      else if (label.includes('browse collection')) link.textContent = 'Browse on Instagram ↗';
      else if (label.includes('bumpa online store')) link.textContent = 'Official Instagram ↗';
      else if (label.includes('view collection')) link.textContent = 'View on Instagram ↗';
    }

    if (link.target === '_blank') {
      link.rel = 'noopener noreferrer';
    }
  });

  // Remove stale storefront wording from visible copy as part of final QA.
  document.querySelectorAll('p').forEach((paragraph) => {
    const text = paragraph.textContent.trim();
    if (text === 'Real product imagery from Scent by Menina. For current stock and prices, enquire directly or browse the online catalogue.') {
      paragraph.textContent = 'Real product imagery from Scent by Menina. For current stock and prices, enquire directly or view the latest collection on Instagram.';
    } else if (text === 'Browse categories or the online catalogue.') {
      paragraph.textContent = 'Browse categories or see the latest collection on Instagram.';
    }
  });

  // Keep structured business metadata consistent with the live links.
  const schema = document.querySelector('script[type="application/ld+json"]');
  if (schema) {
    try {
      const data = JSON.parse(schema.textContent);
      data.url = window.location.origin;
      if (Array.isArray(data.sameAs)) {
        data.sameAs = [...new Set(
          data.sameAs
            .filter(url => !String(url).includes('scentbymenina1.bumpa.shop'))
            .concat(officialInstagram)
        )];
      }
      schema.textContent = JSON.stringify(data);
    } catch (_) {
      // Leave the page running normally if metadata is ever malformed.
    }
  }

  // Make fragrance-education cards genuine keyboard/touch interactions.
  document.querySelectorAll('.education-card').forEach((card) => {
    const title = card.querySelector('h3')?.textContent?.trim() || 'Fragrance tips';
    card.setAttribute('role', 'link');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `${title} — open Scent by Menina on Instagram`);
    card.style.cursor = 'pointer';

    const openInstagram = () => window.open(officialInstagram, '_blank', 'noopener,noreferrer');
    card.addEventListener('click', openInstagram);
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openInstagram();
      }
    });
  });

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
