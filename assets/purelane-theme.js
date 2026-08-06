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
    if ('IntersectionObserver' in window && !reduce) {
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
    var current = 0;

    function setScene(n) {
      if (n === current) return;
      current = n;
      scenes.forEach(function (s, i) { s.classList.toggle('on', i + 1 === n); });
      if (stage) stage.setAttribute('data-d', String(n));
    }

    function pickScene() {
      var focus = window.scrollY + window.innerHeight * 0.5, n = 1;
      for (var i = 0; i < zones.length; i++) {
        var z = zones[i], top = 0, el = z;
        while (el) { top += el.offsetTop; el = el.offsetParent; }
        if (top <= focus) n = parseInt(z.getAttribute('data-scene'), 10) || n;
      }
      setScene(n);
    }

    var railLinks = [].slice.call(document.querySelectorAll('.rail a'));
    var targets = railLinks.map(function (a) { return document.querySelector(a.getAttribute('href')); });

    function syncRail() {
      var mid = window.scrollY + window.innerHeight * 0.42, idx = 0;
      targets.forEach(function (t, i) { if (t && t.offsetTop <= mid) idx = i; });
      railLinks.forEach(function (a, i) { a.classList.toggle('on', i === idx); });
    }

    var hdr = document.getElementById('hdr');
    var prod = document.getElementById('heroProd');
    var raf = null, mx = 0, my = 0;

    function frame() {
      raf = null;
      var y = window.scrollY || window.pageYOffset;
      if (hdr) hdr.classList.toggle('up', y > 90);
      if (!reduce) {
        var wl = document.querySelectorAll('#water .wl');
        for (var i = 0; i < wl.length; i++) {
          var d = [0.05, 0.09, 0.03, 0.02][i] || 0.05;
          wl[i].style.setProperty('--px', (mx * d * 130).toFixed(1) + 'px');
          wl[i].style.setProperty('--py', (-y * d + my * d * 90).toFixed(1) + 'px');
        }
        if (prod) {
          var f = Math.min(y / 700, 1);
          prod.style.transform = 'translate3d(' + (mx * -16).toFixed(2) + 'px,' + (-f * 54 + my * -10).toFixed(2) + 'px,0) scale(' + (1 - f * 0.06).toFixed(3) + ')';
          prod.style.opacity = (1 - f * 0.55).toFixed(3);
        }
      }
      syncRail();
      pickScene();
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

  /* DOM READY ATTACHMENT & SHOPIFY THEME EDITOR LISTENERS */
  document.addEventListener('DOMContentLoaded', function () {
    initPurelaneEngine(document);
    initGlobalScroll();
  });

  /* Shopify Theme Editor Event Lifecycle Handlers */
  document.addEventListener('shopify:section:load', function (e) {
    initPurelaneEngine(e.target);
  });

  document.addEventListener('shopify:section:select', function (e) {
    var revs = e.target.querySelectorAll('.rv');
    revs.forEach(function (el) { el.classList.add('in'); });
  });

})();
