/*!
 * C Spire Authorized Retailer — static HTML runtime
 * Vanilla port of the Next.js client components:
 *   MotionRuntime (Lenis, reveals, stagger, clip-path wipe, parallax,
 *   3D tilt, magnetic CTAs), Header (scroll state, scroll-spy, mobile menu),
 *   ZipCheck (validation + result), Faq (accordion).
 * Requires assets/js/lenis.min.js (window.Lenis) to be loaded first.
 */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var swap = function (el, add, remove) {
    if (!el) return;
    remove.split(' ').forEach(function (c) { if (c) el.classList.remove(c); });
    add.split(' ').forEach(function (c) { if (c) el.classList.add(c); });
  };

  /* ------------------------------------------------------------------ */
  /* Lenis smooth scrolling                                             */
  /* ------------------------------------------------------------------ */
  if (!reduce && window.Lenis) {
    new window.Lenis({ autoRaf: true, lerp: 0.1, anchors: { offset: -88 } });
  }

  /* ------------------------------------------------------------------ */
  /* Reveal / stagger / wipe                                            */
  /* ------------------------------------------------------------------ */
  var revealEls = $$('[data-reveal], [data-stagger], [data-wipe]');
  if (reduce || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------------ */
  /* Parallax                                                           */
  /* ------------------------------------------------------------------ */
  var parallaxEls = $$('[data-parallax]');
  // Parallax is skipped on small screens: less jank, better battery on phones.
  var wideEnough = window.matchMedia('(min-width: 768px)').matches;
  if (!reduce && wideEnough && parallaxEls.length) {
    var ticking = false;
    var updateParallax = function () {
      ticking = false;
      var vh = window.innerHeight;
      parallaxEls.forEach(function (el) {
        var host = el.parentElement || el;
        var r = host.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var speed = parseFloat(el.getAttribute('data-parallax') || '0.15');
        var offset = (r.top + r.height / 2 - vh / 2) * -speed;
        el.style.transform = 'translate3d(0, ' + offset.toFixed(1) + 'px, 0)';
      });
    };
    var onParallax = function () {
      if (!ticking) { ticking = true; requestAnimationFrame(updateParallax); }
    };
    updateParallax();
    window.addEventListener('scroll', onParallax, { passive: true });
    window.addEventListener('resize', onParallax);
  }

  /* ------------------------------------------------------------------ */
  /* 3D tilt + magnetic buttons (fine pointers only)                    */
  /* ------------------------------------------------------------------ */
  if (!reduce && finePointer) {
    var MAX_TILT = 7;
    $$('[data-tilt]').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        card.classList.add('is-tilting');
        card.style.setProperty('--ry', ((px - 0.5) * MAX_TILT * 2).toFixed(2) + 'deg');
        card.style.setProperty('--rx', ((0.5 - py) * MAX_TILT * 2).toFixed(2) + 'deg');
        card.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
        card.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
      });
      card.addEventListener('pointerleave', function () {
        card.classList.remove('is-tilting');
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });

    var bindMagnetic = function (btn) {
      var strength = parseFloat(btn.getAttribute('data-magnetic') || '0.35');
      var inner = btn.querySelector('.magnetic-inner');
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        btn.classList.add('is-magnet');
        btn.style.transform = 'translate3d(' + dx * strength + 'px, ' + dy * strength + 'px, 0)';
        if (inner) inner.style.transform = 'translate3d(' + dx * strength * 0.35 + 'px, ' + dy * strength * 0.35 + 'px, 0)';
      });
      btn.addEventListener('pointerleave', function () {
        btn.classList.remove('is-magnet');
        btn.style.transform = '';
        if (inner) inner.style.transform = '';
      });
    };
    $$('[data-magnetic]').forEach(bindMagnetic);
  }

  /* ------------------------------------------------------------------ */
  /* Header: scrolled state, scroll-spy, mobile drawer                  */
  /* ------------------------------------------------------------------ */
  var header = $('header.sticky');
  if (header) {
    var onHeaderScroll = function () {
      if (window.scrollY > 24) {
        swap(header, 'bg-white/85 shadow-[0_10px_40px_-24px_rgb(19_30_41/0.45)] backdrop-blur-xl', 'bg-white');
      } else {
        swap(header, 'bg-white', 'bg-white/85 shadow-[0_10px_40px_-24px_rgb(19_30_41/0.45)] backdrop-blur-xl');
      }
    };
    onHeaderScroll();
    window.addEventListener('scroll', onHeaderScroll, { passive: true });

    var navLinks = $$('nav[aria-label="Primary"] a[href^="#"]');
    var setActive = function (id) {
      navLinks.forEach(function (a) {
        var on = a.getAttribute('href') === '#' + id;
        var bar = a.querySelector('span');
        if (on) {
          swap(a, 'text-midnight', 'text-slate hover:text-midnight');
          a.setAttribute('aria-current', 'true');
          swap(bar, 'scale-x-100', 'scale-x-0');
        } else {
          swap(a, 'text-slate hover:text-midnight', 'text-midnight');
          a.removeAttribute('aria-current');
          swap(bar, 'scale-x-0', 'scale-x-100');
        }
      });
    };
    if ('IntersectionObserver' in window) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) setActive(e.target.id); });
      }, { rootMargin: '-45% 0px -50% 0px' });
      navLinks.forEach(function (a) {
        var target = document.getElementById(a.getAttribute('href').slice(1));
        if (target) spy.observe(target);
      });
    }
  }

  var drawer = $('#mobile-nav');
  var menuBtn = $('button[aria-controls="mobile-nav"]');
  if (drawer && menuBtn) {
    var setMenu = function (open) {
      if (open) swap(drawer, 'visible opacity-100', 'invisible opacity-0');
      else swap(drawer, 'invisible opacity-0', 'visible opacity-100');
      menuBtn.setAttribute('aria-expanded', String(open));
      document.documentElement.style.overflow = open ? 'hidden' : '';
    };
    menuBtn.addEventListener('click', function () {
      setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
    });
    $$('button[aria-label="Close menu"], a', drawer).forEach(function (el) {
      el.addEventListener('click', function () { setMenu(false); });
    });
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }

  /* ------------------------------------------------------------------ */
  /* ZIP availability checker (frontend only — no network calls)        */
  /* ------------------------------------------------------------------ */
  var telLink = $('a[href^="tel:"]');
  var telHref = telLink ? telLink.getAttribute('href') : '#';
  var phoneSvg = telLink && telLink.querySelector('svg') ? telLink.querySelector('svg').outerHTML : '';
  // C Spire's core Mississippi & Alabama ZIP prefixes (hint only).
  var isFootprint = function (zip) {
    var p = parseInt(zip.slice(0, 3), 10);
    return (p >= 386 && p <= 397) || (p >= 350 && p <= 369);
  };

  $$('form').forEach(function (form) {
    var input = $('input[autocomplete="postal-code"]', form);
    if (!input) return;
    var msg = document.getElementById(input.getAttribute('aria-describedby'));

    input.addEventListener('input', function () {
      input.value = input.value.replace(/\D/g, '').slice(0, 5);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var zip = input.value;
      if (!msg) return;
      if (!/^\d{5}$/.test(zip)) {
        input.setAttribute('aria-invalid', 'true');
        msg.innerHTML = '<p class="text-sm text-red-700">Please enter a valid 5-digit ZIP code.</p>';
        return;
      }
      input.setAttribute('aria-invalid', 'false');
      var text = isFootprint(zip)
        ? '<strong class="text-midnight">Good news:</strong> ' + zip +
          ' is in C Spire’s service region. A specialist can confirm fiber at your exact address in minutes.'
        : '<strong class="text-midnight">Let’s check your address.</strong> C Spire availability for ' + zip +
          ' is confirmed by street address. A specialist can look it up for you right away.';
      var icon = phoneSvg.replace(/class="[^"]*"/, 'class="h-4 w-4"');
      msg.innerHTML =
        '<div class="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-cyan/50 shadow-[0_16px_40px_-28px_rgb(7_70_127/0.6)] sm:flex-row sm:items-center sm:justify-between">' +
        '<p class="text-[0.95rem] leading-snug text-midnight/85">' + text + '</p>' +
        '<a href="' + telHref + '" class="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-violet px-5 font-display font-semibold text-white">' +
        icon + 'Call to order</a></div>';
    });
  });

  /* ------------------------------------------------------------------ */
  /* FAQ accordion (one open at a time)                                 */
  /* ------------------------------------------------------------------ */
  var faqItems = $$('#faq li').filter(function (li) { return $('button[aria-controls]', li); });
  var setFaq = function (li, open) {
    var btn = $('button[aria-controls]', li);
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    var icon = btn.querySelector(':scope > span:last-child');
    btn.setAttribute('aria-expanded', String(open));
    panel.setAttribute('data-open', String(open));
    if (open) panel.removeAttribute('inert');
    else panel.setAttribute('inert', '');
    if (open) swap(icon, 'rotate-45 bg-cyan text-midnight ring-cyan', 'text-ocean ring-cloud');
    else swap(icon, 'text-ocean ring-cloud', 'rotate-45 bg-cyan text-midnight ring-cyan');
  };
  faqItems.forEach(function (li) {
    $('button[aria-controls]', li).addEventListener('click', function () {
      var wasOpen = this.getAttribute('aria-expanded') === 'true';
      faqItems.forEach(function (other) { setFaq(other, false); });
      if (!wasOpen) setFaq(li, true);
    });
  });
})();
