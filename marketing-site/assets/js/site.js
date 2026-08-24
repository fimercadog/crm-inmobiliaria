// ---- Mobile nav toggle ----
const navToggle = document.querySelector('[data-nav-toggle]');
const navDrawer = document.querySelector('[data-nav-drawer]');
if (navToggle && navDrawer) {
  navToggle.addEventListener('click', () => {
    const isOpen = navDrawer.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
  navDrawer.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navDrawer.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

// ---- Scroll reveal ----
const revealTargets = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window && revealTargets.length) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );
  revealTargets.forEach((el) => io.observe(el));
} else {
  revealTargets.forEach((el) => el.classList.add('is-visible'));
}

// ---- FAQ accordion ----
document.querySelectorAll('.faq-item').forEach((item) => {
  const trigger = item.querySelector('.faq-q');
  if (!trigger) return;
  trigger.addEventListener('click', () => {
    const isOpen = item.getAttribute('data-open') === 'true';
    item.parentElement.querySelectorAll('.faq-item').forEach((other) => {
      other.setAttribute('data-open', 'false');
      other.querySelector('.faq-q')?.setAttribute('aria-expanded', 'false');
    });
    item.setAttribute('data-open', String(!isOpen));
    trigger.setAttribute('aria-expanded', String(!isOpen));
  });
});

// ---- Number reveal: counts up once on viewport entry ----
const countTargets = document.querySelectorAll("[data-count-to]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (countTargets.length) {
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const runCount = (el) => {
    const target = parseInt(el.dataset.countTo, 10);
    const suffix = el.dataset.countSuffix || "";
    if (prefersReducedMotion) {
      el.textContent = target + suffix;
      return;
    }
    const duration = 1400;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.round(target * easeOut(progress));
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  };
  if ("IntersectionObserver" in window) {
    const countIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCount(entry.target);
            countIo.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    countTargets.forEach((el) => countIo.observe(el));
  } else {
    countTargets.forEach((el) => runCount(el));
  }
}

// ---- Demo form (prototype — no backend wired yet) ----
const demoForm = document.querySelector('[data-demo-form]');
if (demoForm) {
  demoForm.addEventListener('submit', (event) => {
    event.preventDefault();
    let valid = true;
    demoForm.querySelectorAll('[required]').forEach((field) => {
      const wrapper = field.closest('.field');
      if (!field.value.trim()) {
        wrapper?.classList.add('has-error');
        valid = false;
      } else {
        wrapper?.classList.remove('has-error');
      }
    });
    if (!valid) return;

    demoForm.style.display = 'none';
    const successPanel = document.querySelector('[data-success-panel]');
    successPanel?.classList.add('is-visible');
  });
}
