/* ==========================================================================
   CasinoIndexCA — Site behaviour
   1) Regional compliance switcher (RoC <-> Ontario) across every page
   2) Mobile navigation toggle
   3) Current-year stamp
   Region choice persists via localStorage (wrapped for static hosting).
   ========================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'cic_region';

  /* ---------------------------- Year stamp ------------------------------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ------------------------- Mobile navigation --------------------------- */
  var navToggle = document.querySelector('[data-nav-toggle]');
  var mobileMenu = document.getElementById('mobile-menu');
  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* --------------------- Regional compliance switch ---------------------- */
  var toggleBtns = document.querySelectorAll('.seg-btn[data-region]');
  var select     = document.getElementById('region-select');
  var geoBadge   = document.getElementById('geo-badge');
  var agcoBanner = document.getElementById('agco-banner');
  var views      = document.querySelectorAll('[data-region-view]');

  function setRegion(region) {
    if (region !== 'on') { region = 'roc'; }

    // Show/hide every region-scoped block (matrix cards, footer support, etc.)
    views.forEach(function (el) {
      el.classList.toggle('hidden', el.getAttribute('data-region-view') !== region);
    });

    // Segmented toggle state
    toggleBtns.forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-region') === region ? 'true' : 'false');
    });

    // Accessible <select> fallback stays in sync
    if (select) { select.value = region; }

    // Geolocation badge + AGCO banner
    if (geoBadge)  { geoBadge.textContent = region === 'on' ? 'Ontario · AGCO Mode' : 'Canada · Standard'; }
    if (agcoBanner){ agcoBanner.classList.toggle('hidden', region !== 'on'); }

    // Persist (safe on static hosts / preview sandboxes)
    try { localStorage.setItem(STORAGE_KEY, region); } catch (e) { /* no-op */ }
  }

  toggleBtns.forEach(function (btn) {
    btn.addEventListener('click', function () { setRegion(btn.getAttribute('data-region')); });
  });
  if (select) {
    select.addEventListener('change', function () { setRegion(select.value); });
  }

  // Initial region: stored preference, else default to Rest of Canada.
  // To auto-detect Ontario, resolve region from a server-side geo-IP lookup
  // and pass the result to setRegion() instead of the stored value.
  var initial = 'roc';
  try {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'on' || saved === 'roc') { initial = saved; }
  } catch (e) { /* no-op */ }

  setRegion(initial);
})();
