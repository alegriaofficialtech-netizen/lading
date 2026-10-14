/* ================================
   ALEGRIA — JavaScript (clean)
   ================================ */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initMobileMenu();
    initReveal();
    initActiveNav();
    initCounters();
    initNewsletter();
    initBackToTop();
    initHeroSlider();
    initFaq();
  });

  /* Hero Slider ============================== */
  function initHeroSlider() {
    var slides = document.querySelectorAll('.hero-slide');
    var dots = document.querySelectorAll('.hero-dots .dot');
    if (slides.length === 0) return;

    var currentSlide = 0;
    var slideInterval;

    function goToSlide(index) {
      slides[currentSlide].classList.remove('active');
      dots[currentSlide].classList.remove('active');
      currentSlide = (index + slides.length) % slides.length;
      slides[currentSlide].classList.add('active');
      dots[currentSlide].classList.add('active');
    }

    function nextSlide() {
      goToSlide(currentSlide + 1);
    }

    function startSlider() {
      if (slideInterval) clearInterval(slideInterval);
      slideInterval = setInterval(nextSlide, 6000);
    }

    dots.forEach(function(dot, index) {
      dot.addEventListener('click', function() {
        goToSlide(index);
        startSlider(); // reset timer on manual click
      });
    });

    startSlider();
  }

  /* ── Sticky header ───────────────────────── */
  function initHeader() {
    var h = document.getElementById('header');
    if (!h) return;
    function check() { h.classList.toggle('scrolled', window.scrollY > 28); }
    window.addEventListener('scroll', check, { passive: true });
    check();
  }

  /* ── Mobile menu ─────────────────────────── */
  function initMobileMenu() {
    var burger = document.getElementById('hamburger');
    var nav    = document.getElementById('mobileNav');
    if (!burger || !nav) return;

    burger.addEventListener('click', function () {
      var open = burger.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
      if (open) {
        nav.style.display = 'flex';
        requestAnimationFrame(function () { nav.classList.add('open'); });
        document.body.style.overflow = 'hidden';
      } else {
        nav.classList.remove('open');
        document.body.style.overflow = '';
      }
    });

    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) closeMenu();
    });

    function closeMenu() {
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      nav.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  /* ── Scroll reveal ───────────────────────── */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ── Active nav highlight ────────────────── */
  function initActiveNav() {
    var page = (location.pathname.split('/').pop() || 'index.html');
    if (page !== 'index.html') return; // sub-pages keep their default active nav

    var sections = document.querySelectorAll('section[id], div[id].svc-strip, div[id].stats-bar');
    var links    = document.querySelectorAll('.nav-link[data-s]');
    if (!sections.length || !links.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var id = e.target.id;
          links.forEach(function (l) {
            l.classList.toggle('active', l.getAttribute('data-s') === id);
          });
        }
      });
    }, { threshold: 0.35 });
    sections.forEach(function (s) { io.observe(s); });
  }

  /* ── Animated counters ───────────────────── */
  function initCounters() {
    var els = document.querySelectorAll('[data-count]');
    if (!els.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          animateCount(e.target);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    els.forEach(function (el) { io.observe(el); });
  }

  function animateCount(el) {
    var target   = parseFloat(el.getAttribute('data-count'));
    var suffix   = el.getAttribute('data-suffix') || '';
    var duration = 1500;
    var start    = performance.now();
    var isFloat  = target !== Math.floor(target);
    function frame(now) {
      var p = Math.min((now - start) / duration, 1);
      var e = 1 - Math.pow(1 - p, 3); // ease-out cubic
      var v = target * e;
      el.textContent = (isFloat ? v.toFixed(1) : Math.round(v)) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ── Newsletter ──────────────────────────── */
  function initNewsletter() {
    var form = document.getElementById('nl-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = (document.getElementById('nl-email') || {}).value || '';
      email = email.trim();
      if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
        toast('Por favor ingresa un correo valido.', 'error');
        return;
      }
      toast('Suscripcion exitosa! Gracias por unirte.', 'ok');
      form.reset();
    });
  }

  /* ── Toast ───────────────────────────────── */
  function toast(msg, type) {
    var t = document.getElementById('ag-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'ag-toast';
      t.style.cssText = [
        'position:fixed;bottom:76px;right:24px;z-index:9999',
        'padding:14px 20px;border-radius:10px;font-size:.875rem;font-weight:600',
        'box-shadow:0 8px 24px rgba(0,0,0,.15);transition:all .3s ease',
        'max-width:320px;line-height:1.4;display:flex;align-items:center;gap:10px',
        'font-family:Inter,sans-serif;opacity:0;transform:translateY(8px);pointer-events:none'
      ].join(';');
      document.body.appendChild(t);
    }
    var isOk = type === 'ok';
    t.style.background   = isOk ? '#0D2118' : '#7F1D1D';
    t.style.borderLeft   = '4px solid ' + (isOk ? '#F59E0B' : '#EF4444');
    t.style.color        = '#fff';
    t.textContent        = msg;
    requestAnimationFrame(function () {
      t.style.opacity       = '1';
      t.style.transform     = 'translateY(0)';
      t.style.pointerEvents = 'auto';
    });
    setTimeout(function () {
      t.style.opacity       = '0';
      t.style.transform     = 'translateY(8px)';
      t.style.pointerEvents = 'none';
    }, 4000);
  }

  /* ── FAQ accordion ──────────────────────── */
  function initFaq() {
    var items = document.querySelectorAll('.lw-faq-item');
    if (!items.length) return;
    items.forEach(function (item) {
      var q = item.querySelector('.lw-faq-question');
      if (!q) return;
      q.addEventListener('click', function () {
        item.classList.toggle('open');
      });
    });
  }

  /* ── Back to top ─────────────────────────── */
  function initBackToTop() {
    var btn = document.getElementById('btt');
    if (!btn) return;
    window.addEventListener('scroll', function () {
      btn.classList.toggle('on', window.scrollY > 420);
    }, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

})();
