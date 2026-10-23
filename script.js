/* ==========================================================================
   Solara — site behaviour & downloader
   ========================================================================== */
(function () {
  'use strict';

  // Mark the document as scripted so CSS can opt into JS-only states
  document.documentElement.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- nav */
  var nav = document.getElementById('nav');
  if (nav) {
    var stuck = false;
    var onScroll = function () {
      var next = window.scrollY > 8;
      if (next !== stuck) {
        stuck = next;
        nav.classList.toggle('is-stuck', stuck);
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  var toggle = document.getElementById('nav-toggle');
  var links = document.getElementById('nav-links');
  if (toggle && links) {
    var setMenu = function (open) {
      links.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };

    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // Close on navigation, on Escape, and on any click outside the menu.
    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && links.classList.contains('is-open')) {
        setMenu(false);
        toggle.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (!links.classList.contains('is-open')) return;
      if (!links.contains(e.target) && !toggle.contains(e.target)) setMenu(false);
    });
  }

  /* ------------------------------------------------------ scroll reveal */
  var revealables = document.querySelectorAll('[data-reveal]');
  if (revealables.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealables.forEach(function (el) { el.classList.add('is-in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry, i) {
          if (!entry.isIntersecting) return;
          entry.target.style.transitionDelay = Math.min(i * 45, 180) + 'ms';
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });

      revealables.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---------------------------------------------------------- hero tilt */
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var heroShot = document.querySelector('.hero .shot');
  var heroZone = document.querySelector('.hero');

  if (heroShot && heroZone && canHover && !reduceMotion) {
    var MAX = 6;
    var px = 0, py = 0, queued = false, active = false;

    heroZone.addEventListener('pointermove', function (e) {
      px = e.clientX; py = e.clientY;
      active = true;
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () {
        queued = false;
        if (!active) return;
        var r = heroShot.getBoundingClientRect();
        var dx = (px - r.left) / r.width - 0.5;
        var dy = (py - r.top) / r.height - 0.5;
        dx = Math.max(-1, Math.min(1, dx));
        dy = Math.max(-1, Math.min(1, dy));

        heroShot.classList.add('is-live');
        heroShot.style.setProperty('--ry', (dx * MAX).toFixed(2) + 'deg');
        heroShot.style.setProperty('--rx', (-dy * MAX + 1).toFixed(2) + 'deg');
        heroShot.style.setProperty('--sc', '1.012');
        heroShot.style.setProperty('--gx', ((dx + 0.5) * 100).toFixed(1) + '%');
        heroShot.style.setProperty('--gy', ((dy + 0.5) * 100).toFixed(1) + '%');
      });
    }, { passive: true });

    heroZone.addEventListener('pointerleave', function () {
      active = false;
      heroShot.classList.remove('is-live');
      ['--rx', '--ry', '--sc', '--gx', '--gy'].forEach(function (k) {
        heroShot.style.removeProperty(k);
      });
    });
  }

  /* --------------------------------------------------------- theme rails */
  document.querySelectorAll('[data-rail]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var rail = document.getElementById(btn.dataset.target);
      if (!rail) return;
      var tile = rail.querySelector('.tile');
      var step = tile ? tile.getBoundingClientRect().width + 16 : rail.clientWidth * 0.8;
      rail.scrollBy({
        left: btn.dataset.rail === 'prev' ? -step : step,
        behavior: reduceMotion ? 'auto' : 'smooth'
      });
    });
  });

  /* -------------------------------------------------------- footer year */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* --------------------------------------------------------- focal rail */
  document.querySelectorAll('.rail--focal').forEach(function (rail) {
    var tiles = Array.prototype.slice.call(rail.querySelectorAll('.tile'));
    if (!tiles.length || reduceMotion) return;

    var queued = false;

    function paint() {
      var r = rail.getBoundingClientRect();
      var mid = r.left + r.width / 2;
      var reach = r.width / 2;
      tiles.forEach(function (t) {
        var b = t.getBoundingClientRect();
        var d = Math.min(Math.abs(b.left + b.width / 2 - mid) / reach, 1);
        t.style.setProperty('--s', (1 - d * 0.17).toFixed(3));
        t.style.setProperty('--b', (1 - d * 0.55).toFixed(3));
        t.style.setProperty('--o', (1 - d * 0.4).toFixed(3));
      });
    }

    rail.addEventListener('scroll', function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; paint(); });
    }, { passive: true });

    window.addEventListener('resize', function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; paint(); });
    }, { passive: true });

    paint();
  });

  /* ----------------------------------------------------------- count up */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && !reduceMotion && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        cio.unobserve(el);

        var target = parseFloat(el.dataset.count);
        var suffix = el.dataset.suffix || '';
        var start = null;
        var DUR = 1100;

        function step(now) {
          if (start === null) start = now;
          var t = Math.min((now - start) / DUR, 1);
          var eased = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (t < 1) requestAnimationFrame(step);
          else el.textContent = target + suffix;
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });

    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ------------------------------------------------------- live version */
  var versionSlots = document.querySelectorAll('[data-version]');
  if (versionSlots.length && 'fetch' in window) {
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    if (ctrl) setTimeout(function () { ctrl.abort(); }, 4000);

    fetch('./manifest.json', {
      signal: ctrl ? ctrl.signal : undefined,
      cache: 'no-cache'
    })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data || !data.version) return;
        var v = String(data.version).trim();
        versionSlots.forEach(function (el) {
          el.textContent = /^v/i.test(v) ? v : 'v' + v;
        });
      })
      .catch(function () { /* keep the static fallback */ });
  }
})();

/* ------------------------------------------------------- Solara downloader */
async function downloadLatestSolara(event) {
  if (event) {
    event.preventDefault();
  }

  try {
    const owner = "solaragg";
    const repo = "solaragg.github.io";

    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/releases/latest`
    );

    if (!res.ok) {
      throw new Error("GitHub API HTTP " + res.status);
    }

    const release = await res.json();

    const asset = release.assets.find(a =>
      /^SolaraV3_\d{6}\.zip$/i.test(a.name)
    );

    if (!asset) {
      alert("Файл SolaraV3_XXXXXX.zip не найден");
      return;
    }

    // Отправляем событие статистики
    if (typeof goatcounter !== "undefined" && goatcounter.count) {
      goatcounter.count({
        path: "download-windows-zip",
        event: true
      });
    }

    // Скачать найденный последний билд
    window.location.href = asset.browser_download_url;

  } catch (error) {
    console.error("Download error:", error);

    alert(
      "Не удалось найти последний билд Solara.\n\n" +
      "Ошибка: " + error.message
    );
  }
}
window.downloadLatestSolara = downloadLatestSolara;
