/* ============================================================
   PURELANE PRODUCTION THEME JS
   Handles scroll reveals, dynamic scene transitions, hero product stage,
   product rotator, infinite reviews marquee, mouse parallax,
   and Shopify Theme Editor event lifecycle listeners.
   ============================================================ */

(function () {
  'use strict';

  function initPurelaneEngine(scope) {
    var context = scope || document;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* 1. SCROLL REVEALS */
    var revs = context.querySelectorAll('.rv');
    var isDesignMode = Boolean(window.Shopify && window.Shopify.designMode);
    if ('IntersectionObserver' in window && !reduce && !isDesignMode) {
      var ro = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            ro.unobserve(e.target);
          }
        });
      }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
      revs.forEach(function (el) { ro.observe(el); });
    } else {
      revs.forEach(function (el) { el.classList.add('in'); });
    }

    /* 2. HERO PRODUCT STAGE */
    var hstage = context.querySelector('.hstage');
    if (hstage && !hstage.dataset.initialized) {
      hstage.dataset.initialized = 'true';
      var hs = [].slice.call(hstage.querySelectorAll('.hslide'));
      var hd = [].slice.call(context.querySelectorAll('.hdots button'));
      var hi = 0, htimer = null;

      function hgo(n) {
        hi = (n + hs.length) % hs.length;
        hs.forEach(function (s, i) { s.classList.toggle('on', i === hi); });
        hd.forEach(function (d, i) { d.classList.toggle('on', i === hi); });
      }

      function hplay() {
        if (!htimer && !reduce) {
          htimer = setInterval(function () { hgo(hi + 1); }, 3800);
        }
      }

      function hstop() {
        if (htimer) { clearInterval(htimer); htimer = null; }
      }

      hd.forEach(function (d, i) {
        d.addEventListener('click', function () { hstop(); hgo(i); hplay(); });
      });

      hstage.addEventListener('mouseenter', hstop);
      hstage.addEventListener('mouseleave', hplay);

      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) {
          es.forEach(function (e) { e.isIntersecting ? hplay() : hstop(); });
        }, { threshold: 0.2 }).observe(hstage);
      } else {
        hplay();
      }
    }

    /* 3. PRODUCT ROTATOR ("Why it works") */
    var rot = context.querySelector('#rot');
    if (rot && !rot.dataset.initialized) {
      rot.dataset.initialized = 'true';
      var rimgs = [].slice.call(rot.querySelectorAll('.frame .pimg'));
      var rdots = [].slice.call(rot.querySelectorAll('.dots i'));
      var rcapB = rot.querySelector('.cap b');
      var rcapS = rot.querySelector('.cap span');
      var ri = 0, rtimer = null;

      function rstep() {
        if (!rimgs.length) return;
        rimgs[ri].classList.remove('on');
        if (rdots[ri]) rdots[ri].classList.remove('on');
        ri = (ri + 1) % rimgs.length;
        rimgs[ri].classList.add('on');
        if (rdots[ri]) rdots[ri].classList.add('on');
        if (rcapB) rcapB.innerHTML = rimgs[ri].getAttribute('data-name') || '';
        if (rcapS) rcapS.textContent = rimgs[ri].getAttribute('data-note') || '';
      }

      if (!reduce && rimgs.length > 0) {
        var rio = new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            if (e.isIntersecting && !rtimer) rtimer = setInterval(rstep, 2900);
            else if (!e.isIntersecting && rtimer) { clearInterval(rtimer); rtimer = null; }
          });
        }, { threshold: 0.25 });
        rio.observe(rot);
      }
    }
  }

  /* GLOBAL SCROLL & PARALLAX SYNC */
  function initGlobalScroll() {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var scenes = [].slice.call(document.querySelectorAll('.scene'));
    var zones = [].slice.call(document.querySelectorAll('[data-scene]'));
    var stage = document.getElementById('scenes');
    var railLinks = [].slice.call(document.querySelectorAll('.rail a'));
    var targets = railLinks.map(function (a) { return document.querySelector(a.getAttribute('href')); });
    var current = 0;
    var zoneCache = [];
    var targetCache = [];

    function setScene(n) {
      if (n === current) return;
      current = n;
      scenes.forEach(function (s, i) { s.classList.toggle('on', i + 1 === n); });
      if (stage) stage.setAttribute('data-d', String(n));
    }

    function updateCache() {
      zoneCache = zones.map(function (z) {
        var top = 0, el = z;
        while (el) { top += el.offsetTop; el = el.offsetParent; }
        return { top: top, scene: parseInt(z.getAttribute('data-scene'), 10) || 1 };
      });
      targetCache = targets.map(function (t) {
        if (!t) return 0;
        var top = 0, el = t;
        while (el) { top += el.offsetTop; el = el.offsetParent; }
        return top;
      });
    }
    updateCache();
    window.addEventListener('resize', updateCache, { passive: true });

    function pickScene(y) {
      var focus = y + window.innerHeight * 0.5, n = 1;
      for (var i = 0; i < zoneCache.length; i++) {
        if (zoneCache[i].top <= focus) n = zoneCache[i].scene;
      }
      setScene(n);
    }

    function syncRail(y) {
      var mid = y + window.innerHeight * 0.42, idx = 0;
      for (var i = 0; i < targetCache.length; i++) {
        if (targetCache[i] <= mid) idx = i;
      }
      railLinks.forEach(function (a, i) { a.classList.toggle('on', i === idx); });
    }

    var hdr = document.getElementById('hdr');
    var prod = document.getElementById('heroProd');
    var wl = [].slice.call(document.querySelectorAll('#water .wl'));
    var raf = null, mx = 0, my = 0;

    function frame() {
      raf = null;
      var y = window.scrollY || window.pageYOffset;
      if (hdr) hdr.classList.toggle('up', y > 90);
      if (!reduce) {
        for (var i = 0; i < wl.length; i++) {
          var d = [0.05, 0.09, 0.03, 0.02][i] || 0.05;
          wl[i].style.transform = 'translate3d(' + (mx * d * 130).toFixed(1) + 'px,' + (-y * d + my * d * 90).toFixed(1) + 'px,0)';
        }
        if (prod) {
          var f = Math.min(y / 700, 1);
          prod.style.transform = 'translate3d(' + (mx * -16).toFixed(2) + 'px,' + (-f * 54 + my * -10).toFixed(2) + 'px,0) scale(' + (1 - f * 0.06).toFixed(3) + ')';
          prod.style.opacity = (1 - f * 0.55).toFixed(3);
        }
      }
      syncRail(y);
      pickScene(y);
    }

    function onScroll() { if (!raf) raf = requestAnimationFrame(frame); }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    if (!reduce && window.matchMedia('(min-width: 1024px)').matches) {
      window.addEventListener('mousemove', function (e) {
        mx = (e.clientX / window.innerWidth - 0.5) * 2;
        my = (e.clientY / window.innerHeight - 0.5) * 2;
        onScroll();
      }, { passive: true });
    }

    frame();
  }

  /* 4. AJAX CART DRAWER CONTROLLER */
  function initCartDrawer() {
    var drawer = document.getElementById('purelaneCartDrawer');
    var overlay = document.getElementById('purelaneCartOverlay');
    var closeBtn = document.getElementById('purelaneCartClose');
    var cartTriggers = document.querySelectorAll('a[href="/cart"], button.ico[aria-label*="Cart"]');

    function openCart() {
      if (drawer) drawer.classList.add('active');
      if (overlay) overlay.classList.add('active');
    }

    function closeCart() {
      if (drawer) drawer.classList.remove('active');
      if (overlay) overlay.classList.remove('active');
    }

    cartTriggers.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        openCart();
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeCart);
    if (overlay) overlay.addEventListener('click', closeCart);

    /* Intercept Quick Add Forms for Instant Drawer Experience */
    document.addEventListener('submit', function (e) {
      if (e.target && e.target.classList.contains('purelane-quick-add-form')) {
        e.preventDefault();
        openCart();
      }
    });
  }

  /* DOM READY ATTACHMENT & SHOPIFY THEME EDITOR LISTENERS */
  document.addEventListener('DOMContentLoaded', function () {
    initPurelaneEngine(document);
    initGlobalScroll();
    initCartDrawer();
  });

  /* Shopify Theme Editor Event Lifecycle Handlers */
  document.addEventListener('shopify:section:load', function (e) {
    initPurelaneEngine(e.target);
    initCartDrawer();
  });

  document.addEventListener('shopify:section:select', function (e) {
    var revs = e.target.querySelectorAll('.rv');
    revs.forEach(function (el) { el.classList.add('in'); });
  });

})();
