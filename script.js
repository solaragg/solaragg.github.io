(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Sticky header background on scroll */
  var header = document.getElementById("siteHeader");
  function onScroll() {
    if (window.scrollY > 8) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Mobile nav toggle */
  var navToggle = document.getElementById("navToggle");
  var mobileNav = document.getElementById("mobileNav");
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      var expanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!expanded));
      mobileNav.classList.toggle("open");
    });
    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navToggle.setAttribute("aria-expanded", "false");
        mobileNav.classList.remove("open");
      });
    });
  }

  /* Accordion (FAQ) */
  var triggers = document.querySelectorAll(".accordion-trigger");
  triggers.forEach(function (trigger) {
    var panel = document.getElementById(trigger.getAttribute("aria-controls"));
    if (!panel) return;

    trigger.addEventListener("click", function () {
      var isOpen = trigger.getAttribute("aria-expanded") === "true";

      // Close all other panels
      triggers.forEach(function (t) {
        if (t !== trigger) {
          t.setAttribute("aria-expanded", "false");
          var p = document.getElementById(t.getAttribute("aria-controls"));
          if (p) p.style.maxHeight = null;
        }
      });

      if (isOpen) {
        trigger.setAttribute("aria-expanded", "false");
        panel.style.maxHeight = null;
      } else {
        trigger.setAttribute("aria-expanded", "true");
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  });

  /* Scroll-triggered entrance animations */
  var animatedEls = document.querySelectorAll("[data-animate]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    animatedEls.forEach(function (el) { observer.observe(el); });
  } else {
    animatedEls.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* Subtle ambient glow parallax, desktop pointer only */
  var glow = document.getElementById("bgGlow");
  if (glow && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    var ticking = false;
    var targetX = 0;
    var targetY = 0;

    window.addEventListener(
      "mousemove",
      function (e) {
        targetX = (e.clientX / window.innerWidth - 0.5) * 60;
        targetY = (e.clientY / window.innerHeight - 0.5) * 40;
        if (!ticking) {
          window.requestAnimationFrame(function () {
            glow.style.transform =
              "translate(calc(-50% + " + targetX + "px), " + targetY + "px)";
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  /* Recalculate open accordion panel height on resize */
  window.addEventListener("resize", function () {
    triggers.forEach(function (t) {
      if (t.getAttribute("aria-expanded") === "true") {
        var p = document.getElementById(t.getAttribute("aria-controls"));
        if (p) p.style.maxHeight = p.scrollHeight + "px";
      }
    });
  });
})();
