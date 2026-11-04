(() => {
  'use strict';

  const root = document.documentElement;
  const header = document.querySelector('.site-header');
  const headerInner = document.querySelector('.header-inner');
  const navigation = document.querySelector('#primary-nav');
  const menuToggle = document.querySelector('.menu-toggle');
  const backdrop = document.querySelector('.menu-backdrop');
  const main = document.querySelector('main');
  const footer = document.querySelector('.site-footer');
  const compact = window.matchMedia('(max-width: 1050px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Save the existing preference key so returning visitors retain their theme.
  const themeToggle = document.querySelector('.theme-toggle');
  function updateThemeControl() {
    const dark = root.dataset.theme === 'dark';
    themeToggle?.setAttribute('aria-pressed', String(dark));
    themeToggle?.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
  }
  themeToggle?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('presszilaTheme', root.dataset.theme); } catch { /* Storage is optional. */ }
    updateThemeControl();
  });
  updateThemeControl();
  if (themeToggle) themeToggle.hidden = false;

  // A small navigation drawer keeps native links and a usable no-script layout.
  if (menuToggle && headerInner && navigation && backdrop) {
    let isOpen = false;
    function setMenu(open, restoreFocus = false) {
      isOpen = Boolean(open && compact.matches);
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
      navigation.classList.toggle('is-open', isOpen);
      navigation.inert = compact.matches && !isOpen;
      backdrop.hidden = !isOpen;
      document.body.toggleAttribute('data-menu-open', isOpen);
      if (main) main.inert = isOpen;
      if (footer) footer.inert = isOpen;
      if (restoreFocus) menuToggle.focus();
    }
    menuToggle.addEventListener('click', () => {
      setMenu(!isOpen);
      if (isOpen) navigation.querySelector('a')?.focus();
    });
    backdrop.addEventListener('click', () => setMenu(false, true));
    navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', event => {
      if (!isOpen) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        setMenu(false, true);
      }
      if (event.key === 'Tab') {
        const focusable = [...headerInner.querySelectorAll('a[href],button:not(:disabled)')].filter(element => element.getClientRects().length > 0);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
    compact.addEventListener('change', () => setMenu(false));
    setMenu(false);
    headerInner.dataset.menuEnhanced = '';
    header.dataset.navigationReady = '';
    root.classList.remove('nav-pending');
  }

  // Keep drawer and backdrop geometry aligned with the compact floating header.
  function updateHeaderHeight() {
    if (header) root.style.setProperty('--header-height', `${Math.ceil(header.getBoundingClientRect().height)}px`);
  }
  if (header && 'ResizeObserver' in window) new ResizeObserver(updateHeaderHeight).observe(header);
  else window.addEventListener('resize', updateHeaderHeight, { passive: true });
  updateHeaderHeight();

  // Keep the mobile inquiry shortcut available while reading the middle of a page.
  const inquiryBar = document.querySelector('.mobile-inquiry');
  const opening = document.querySelector('.hero,.page-intro,.article-header');
  if (inquiryBar && opening && 'IntersectionObserver' in window) {
    const mobile = window.matchMedia('(max-width: 650px)');
    let openingVisible = true;
    const endingVisibility = new Map();
    const updateInquiry = () => {
      const show = mobile.matches && !openingVisible && ![...endingVisibility.values()].some(Boolean);
      if (!show && inquiryBar.contains(document.activeElement)) return;
      inquiryBar.hidden = !show;
    };
    const openingObserver = new IntersectionObserver(entries => {
      openingVisible = entries[0].isIntersecting;
      updateInquiry();
    });
    openingObserver.observe(opening);
    const endingObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => endingVisibility.set(entry.target, entry.isIntersecting));
      updateInquiry();
    });
    document.querySelectorAll('.final-cta,.site-footer').forEach(element => {
      endingVisibility.set(element, false);
      endingObserver.observe(element);
    });
    mobile.addEventListener('change', updateInquiry);
    inquiryBar.addEventListener('focusout', () => queueMicrotask(updateInquiry));
    updateInquiry();
  }

  let scrollScheduled = false;
  function updateHeader() {
    header?.classList.toggle('is-scrolled', window.scrollY > 16);
    scrollScheduled = false;
  }
  window.addEventListener('scroll', () => {
    if (!scrollScheduled) { scrollScheduled = true; window.requestAnimationFrame(updateHeader); }
  }, { passive: true });
  updateHeader();

  // Enhance the static logo list only after an accessible pause control is ready.
  const publicationSlider = document.querySelector('.publication-logos');
  const publicationToggle = document.querySelector('.publication-toggle');
  if (publicationSlider && publicationToggle) {
    let paused = false;
    function updatePublications() {
      const animate = !reducedMotion.matches;
      publicationSlider.toggleAttribute('data-animated', animate);
      publicationSlider.toggleAttribute('data-paused', paused);
      publicationSlider.tabIndex = animate ? 0 : -1;
      publicationToggle.hidden = !animate;
      publicationToggle.setAttribute('aria-pressed', String(paused));
      publicationToggle.setAttribute('aria-label', `${paused ? 'Play' : 'Pause'} publication slider`);
    }
    publicationToggle.addEventListener('click', () => {
      paused = !paused;
      updatePublications();
    });
    reducedMotion.addEventListener('change', updatePublications);
    updatePublications();
  }

  // Keep the final values readable and replay the count when the figures return to view.
  const impact = document.querySelector('.impact-section');
  if (impact && 'IntersectionObserver' in window) {
    const counters = [...impact.querySelectorAll('[data-count-to]')].map(element => {
      const decimals = Number(element.dataset.countDecimals || 0);
      return { element, target:Number(element.dataset.countTo), format:new Intl.NumberFormat('en-US', { minimumFractionDigits:decimals, maximumFractionDigits:decimals }) };
    });
    let frame = 0;
    const finish = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      counters.forEach(counter => { counter.element.textContent = counter.format.format(counter.target); });
      impact.removeAttribute('data-counting');
    };
    let countedInView = false;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) { countedInView = false; finish(); return; }
        if (countedInView || entry.intersectionRatio < 0.2 || reducedMotion.matches) return;
        countedInView = true;
        impact.setAttribute('data-counting', '');
        let start;
        const step = time => {
          if (reducedMotion.matches) { finish(); return; }
          if (start === undefined) start = time;
          const progress = Math.min((time - start) / 1250, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          counters.forEach(counter => { counter.element.textContent = counter.format.format(counter.target * eased); });
          if (progress < 1) frame = requestAnimationFrame(step);
          else finish();
        };
        frame = requestAnimationFrame(step);
      });
    }, { threshold:[0,0.2] });
    observer.observe(impact.querySelector('.impact-grid'));
    reducedMotion.addEventListener('change', event => {
      if (event.matches) finish();
    });
  }

  // Animate each section once, including inner pages. Keep the default DOM visible.
  // Web Animations releases transform after entrance, so card hover effects stay free.
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const selectors = [
      '[data-reveal]', '.section-heading', '.media-section>.container',
      '.page-intro .eyebrow', '.intro-grid>h1', '.intro-copy',
      '.perspective-art', '.perspective-copy', '.manifesto-art',
      '.service-row', '.process-list>li', '.journal-card', '.faq',
      '.principles-grid>article', '.service-index>a', '.service-detail',
      '.approach-art', '.approach-copy', '.experience-quote', '.experience-values>article',
      '.article-header>.back-link', '.article-header>.breadcrumbs', '.article-header>.eyebrow', '.article-header>.article-meta', '.article-header>h1',
      '.article-header>.article-deck', '.article-sidebar', '.article-body>section', '.article-end',
      '.contact-copy', '.inquiry-form', '.footer-intro', '.footer-links>div', '.footer-signature', '.footer-bottom',
    ];
    const candidates = [...document.querySelectorAll(selectors.join(','))];
    candidates.forEach(element => element.setAttribute('data-reveal', ''));
    const activeAnimations = new Set();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          observer.unobserve(element);
          element.classList.add('is-revealed');
          if (reducedMotion.matches || typeof element.animate !== 'function') return;
          const declaredDelay = parseFloat(element.style.getPropertyValue('--reveal-delay'));
          const siblings = [...element.parentElement.children].filter(sibling => sibling.hasAttribute('data-reveal'));
          const delay = Number.isFinite(declaredDelay) ? declaredDelay : Math.max(0, siblings.indexOf(element) % 4) * 60;
          const animation = element.animate([
            { opacity: 0, transform: 'translateY(22px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ], { duration: 650, delay, easing: 'cubic-bezier(.2,.65,.3,1)', fill: 'backwards' });
          activeAnimations.add(animation);
          const forget = () => activeAnimations.delete(animation);
          animation.addEventListener('finish', forget, { once: true });
          animation.addEventListener('cancel', forget, { once: true });
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -18px 0px' });
    candidates.filter(element => !element.parentElement.closest('[data-reveal]')).forEach(element => observer.observe(element));

    // Bring photography gently into focus once, without hiding content before JS runs.
    const photos = document.querySelectorAll('.service-row-photo img,.perspective-photo,.manifesto-photo,.journal-photo,.approach-photo,.article-feature-image,.intro-photo img,.experience-photo img,.contact-photo img');
    const photoObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const photo = entry.target;
        photoObserver.unobserve(photo);
        if (reducedMotion.matches || typeof photo.animate !== 'function') return;
        const animation = photo.animate([
          { opacity: .72, transform: 'scale(1.055)' },
          { opacity: 1, transform: 'scale(1)' },
        ], { duration: 700, easing: 'cubic-bezier(.2,.65,.3,1)' });
        activeAnimations.add(animation);
        const forget = () => activeAnimations.delete(animation);
        animation.addEventListener('finish', forget, { once: true });
        animation.addEventListener('cancel', forget, { once: true });
      });
    }, { threshold: 0.1 });
    photos.forEach(photo => photoObserver.observe(photo));

    // Pause decorative loops offscreen rather than spending frames below the fold.
    const scenes = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.classList.toggle('motion-paused', !entry.isIntersecting));
    }, { rootMargin: '80px' });
    document.querySelectorAll('.editorial-visual,.perspective-art,.manifesto-art,.approach-art,.final-cta,.publication-logos').forEach(element => scenes.observe(element));
    reducedMotion.addEventListener('change', event => {
      if (event.matches) activeAnimations.forEach(animation => animation.cancel());
    });
  }

  document.querySelectorAll('.faq').forEach(details => {
    const summary = details.querySelector('summary');
    const update = () => summary?.setAttribute('aria-expanded', String(details.open));
    details.addEventListener('toggle', update);
    update();
  });

  // A service link can prefill the form without accepting arbitrary option values.
  const serviceField = document.querySelector('select[name="service"]');
  const requestedService = new URLSearchParams(window.location.search).get('service');
  if (serviceField && requestedService && [...serviceField.options].some(option => option.value === requestedService)) serviceField.value = requestedService;

  const forms = document.querySelectorAll('.inquiry-form');
  forms.forEach(form => {
    const submit = form.querySelector('[type="submit"]');
    const submitText = submit.querySelector('span');
    const originalText = submitText.textContent;
    const status = form.querySelector('.form-status');
    const fields = [...form.querySelectorAll('input:not([type="hidden"]):not([name="botcheck"]),select,textarea')];
    let submitting = false;

    function showStatus(message, type = '') {
      status.textContent = message;
      status.className = `form-status${type ? ` is-${type}` : ''}`;
      status.setAttribute('role', type === 'error' ? 'alert' : 'status');
    }
    function setBusy(busy) {
      submitting = busy;
      submit.disabled = busy;
      submitText.textContent = busy ? 'Sending…' : originalText;
      form.setAttribute('aria-busy', String(busy));
    }
    function validateField(field) {
      const error = document.getElementById(`${field.id}-error`);
      let message = '';
      if (field.required && !field.value.trim()) message = field.tagName === 'SELECT' ? 'Please select an option.' : 'Please complete this field.';
      else if (field.type === 'email' && field.value && !field.validity.valid) message = 'Please enter a valid email address.';
      else if (!field.validity.valid) message = 'Please check this field.';
      field.setAttribute('aria-invalid', String(Boolean(message)));
      if (error) error.textContent = message;
      return !message;
    }
    fields.forEach(field => {
      field.addEventListener('input', () => {
        if (field.getAttribute('aria-invalid') === 'true') validateField(field);
      });
      field.addEventListener('change', () => {
        if (field.getAttribute('aria-invalid') === 'true') validateField(field);
      });
    });

    form.addEventListener('submit', async event => {
      if (submitting) { event.preventDefault(); return; }
      const results = fields.map(validateField);
      if (results.some(valid => !valid)) {
        event.preventDefault();
        showStatus('Please check the marked fields before sending.', 'error');
        fields[results.indexOf(false)].focus();
        return;
      }

      // FormSubmit handles its own verification, CAPTCHA and confirmation.
      // Its native submission also works without JavaScript.
      if (form.dataset.provider !== 'web3forms') {
        setBusy(true);
        showStatus('Connecting to our form service to send your message…');
        return;
      }

      event.preventDefault();
      const data = new FormData(form);
      // The redirect is for native, no-JavaScript submissions only.
      data.delete('redirect');
      setBusy(true);
      showStatus('Sending your message…');
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 20000);
      try {
        const response = await fetch(form.action, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: data,
          signal: controller.signal
        });
        const result = await response.json().catch(() => null);
        if (!response.ok || result?.success !== true) {
          showStatus('Your message could not be sent. Please try again or email contact@presszila.com.', 'error');
        } else {
          form.reset();
          showStatus('Thank you. Your message has been sent.', 'success');
        }
      } catch {
        // A timeout can happen after the service accepted a message, so never
        // retry automatically or claim that a submission definitely failed.
        showStatus('We could not confirm your message was sent. Please check before retrying or email contact@presszila.com.', 'error');
      } finally {
        window.clearTimeout(timer);
        setBusy(false);
        status.focus();
      }
    });
    // Custom validation is installed before disabling the native UI.
    form.noValidate = true;
    setBusy(false);
    window.addEventListener('pageshow', () => { setBusy(false); showStatus(''); });
  });
})();
