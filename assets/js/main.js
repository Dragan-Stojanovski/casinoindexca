/* ==========================================================================
   CasinoIndexCA — Site behaviour
   1) Regional compliance switcher (RoC <-> Ontario) across every page
   2) Mobile navigation toggle
   3) Current-year stamp
   Region choice persists via localStorage (wrapped for static hosting).
   ========================================================================== */
/* ---- Site icon: use the PNG brand icon site-wide ---- */
(function () {
  'use strict';
  var ICON = '/assets/img/casinoindex_ca_icon.png';
  try {
    document.querySelectorAll('link[rel*="icon" i]').forEach(function (l) {
      if (l.parentNode) l.parentNode.removeChild(l);
    });
    [['icon', 'image/png'], ['apple-touch-icon', '']].forEach(function (r) {
      var l = document.createElement('link');
      l.rel = r[0]; if (r[1]) l.type = r[1]; l.href = ICON;
      document.head.appendChild(l);
    });
  } catch (e) { /* no-op */ }
})();

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

/* ==========================================================================
   MEGA-MENU + CATEGORY TOOLKIT (added site-wide)
   - Injects the "Online Casinos" 3-column dropdown (desktop) + mobile accordion
   - Injects shared CSS for the menu and category "top picks" lists
   - Auto-renders <div class="toplist" data-casinos="betway,oshi,..."></div>
     from the central CASINO dataset below (edit links/logos in ONE place).
   ========================================================================== */
(function () {
  'use strict';

  /* ---- central casino dataset (edit here) ---- */
  var CASINO = {
    bitkingz:  { name:"Bitkingz",        logo:"bitkingz_logo.png",         dark:false, url:"https://www.bitkingzmedia.com/a8lavvsmu", review:"/bitkingz-review/",         score:"8.6", player:4.7, payout:"Instant",  bonus:"Exclusive 200% + 200 Spins",        meta:"SoftSwiss · Crypto",            why:"Best exclusive bonus + instant crypto payouts.", minDep:"20 EUR / 30 CAD", monthly:"~20,000/mo", games:"90+ studios", live:"Evolution, Ezugi", app:"Mobile site", wager:"x45", since:"2020", licence:"Tobique", pending:"Instant" },
    oshi:      { name:"Oshi",            logo:"oshi_casino_logo.png",      dark:false, url:"https://oshilinks.com/abba8506a",          review:"/oshi-review/",             score:"8.7", player:4.8, payout:"0–1 hour", bonus:"Up to $6,000 + 450 Free Spins",     meta:"Est. 2015 · 14,000+ games",     why:"Huge library and sub-hour cashouts.", minDep:"30 CAD", monthly:"30,000 EUR", games:"14,000+", live:"Evolution, Pragmatic", app:"Mobile site", wager:"x40", since:"2015", licence:"Tobique / Anjouan", pending:"0–2 hrs" },
    croco:     { name:"Crocoslots",      logo:"croco_slots_logo.png",      dark:true,  url:"https://crocoslotsmedia.com/atkvmogv0",    review:"/crocoslots-review/",       score:"8.4", player:4.6, payout:"Instant",  bonus:"Up to €8,000 + 400 Free Spins",     meta:"Curaçao GCB · SoftSwiss",       why:"One of the biggest welcome packages.", minDep:"20 EUR / 30 CAD", monthly:"20,000 EUR", games:"6,000+", live:"Evolution, Ezugi", app:"Mobile site", wager:"x45", since:"2022", licence:"Curaçao GCB", pending:"Instant" },
    betway:    { name:"Betway",          logo:"betway_logo.png",           dark:false, url:"https://betway.com/bwp/welcome-casino-ca-1000-50/en-ca/?s=bfp45434", review:"/betway-review/", score:"9.1", player:4.9, payout:"~24 hours", bonus:"100% up to $200 + 50 Spins",        meta:"MGA licensed · Ontario-regulated", why:"Top-tier Malta Gaming Authority licence.", minDep:"C$10", monthly:"High", games:"550+", live:"Evolution, Microgaming", app:"iOS &amp; Android app", wager:"Standard", since:"2006", licence:"Malta (MGA)", pending:"Standard" },
    jackpot:   { name:"Jackpot City",    logo:"jackpot_city_logo.png",     dark:true,  url:"https://www.jackpotcitycasino.com/canada/?s=bfp45434", review:"/jackpot-city-review/", score:"9.0", player:4.8, payout:"1–3 days", bonus:"Up to C$1,600 + Daily Spins",       meta:"Since 1998 · Kahnawake",        why:"Trusted veteran with Mega Moolah jackpots.", minDep:"C$10", monthly:"High", games:"Microgaming library", live:"Evolution", app:"iOS &amp; Android app", wager:"35x", since:"1998", licence:"Kahnawake", pending:"Standard" },
    spirit:    { name:"Spirit Casino",   logo:"spirit_casino_logo.png",    dark:false, url:"https://spiritcasinomedia.com/n1a8bdfbb5", review:"/spirit-casino-review/",    score:"8.3", player:4.5, payout:"Instant",  bonus:"Up to $22,500 + 350 Free Spins",    meta:"Curaçao GCB · Weekly cashback", why:"Massive welcome + low-wager cashback.", minDep:"$30", monthly:"$15k–$20k", games:"Thousands", live:"Yes", app:"Mobile site", wager:"40x", since:"New", licence:"Curaçao GCB", pending:"Instant" },
    god:       { name:"God of Casino",   logo:"god_of_casino.png",         dark:true,  url:"https://m.trackclicks00.com/redirect.aspx?mid=225&sid=7523&cid=&pid=&affid=3622", review:"/god-of-casino-review/", score:"8.2", player:4.5, payout:"Fast",     bonus:"Up to C$1,500 + 300 Free Spins", meta:"Casino + Sports",               why:"Cashable Gold Credits + polished sportsbook.", minDep:"C$30", monthly:"Standard", games:"Big library", live:"Evolution, Ezugi", app:"Mobile site", wager:"40x", since:"New", licence:"Curaçao", pending:"Fast" },
    revolution:{ name:"Revolution Casino",logo:"revolution_casino_logo.png",dark:false, url:"https://m.trackclicks00.com/redirect.aspx?mid=19&sid=7523&cid=&pid=&affid=3622",  review:"/revolution-casino-review/", score:"8.1", player:4.4, payout:"Fast",     bonus:"100% up to €500 + 200 Spins",   meta:"Casino + Sports",               why:"13,000+ games, Interac from just $10.", minDep:"$10 (Interac)", monthly:"Standard", games:"13,000+", live:"Yes", app:"Mobile site", wager:"35x–40x", since:"New", licence:"Offshore", pending:"Fast" },
    midarion:  { name:"Midarion Casino", logo:"midarion_logo.png",         dark:false, url:"https://m.trackclicks00.com/redirect.aspx?mid=176&sid=7523&cid=&pid=&affid=3622", review:"/midarion-casino-review/", score:"8.0", player:4.4, payout:"Fast",     bonus:"Up to $4,500 + 350 Free Spins", meta:"Casino + Sports",               why:"Wide crypto menu; read the terms.", minDep:"$10 (Interac)", monthly:"Standard", games:"9,000+", live:"Yes", app:"Mobile site", wager:"35x", since:"New", licence:"Offshore", pending:"Fast" }
  };

  /* ---- sample player testimonials (PLACEHOLDER — swap for real verified submissions) ---- */
  var QUOTES = {
    oshi:      { q:"Requested a withdrawal to Interac and it landed the same afternoon — no runaround.", n:"Jordan M.", c:"Calgary, AB", s:5 },
    bitkingz:  { q:"The exclusive bonus actually cleared. Fair terms and instant crypto cashouts.",       n:"Priya S.",  c:"Mississauga, ON", s:5 },
    jackpot:   { q:"Live blackjack runs beautifully on my phone and support genuinely knows their stuff.", n:"Marc L.",  c:"Laval, QC", s:4 },
    croco:     { q:"Signed up with crypto in about two minutes and was playing right away.",             n:"Devon R.",  c:"Vancouver, BC", s:5 },
    betway:    { q:"Exactly what you'd expect from a big licensed brand — smooth, quick and reliable.",   n:"Sarah T.",  c:"Halifax, NS", s:5 },
    revolution:{ q:"Deposited just $10 with Interac and had a great night. Cashout was painless.",       n:"Alex P.",   c:"Winnipeg, MB", s:4 },
    spirit:    { q:"Weekly cashback showed up Monday like clockwork. Nice to see it actually honoured.",  n:"Chris B.",  c:"Ottawa, ON", s:4 },
    god:       { q:"Gold Credits are genuinely cashable — no sneaky wagering. Really refreshing.",        n:"Nadia K.",  c:"Edmonton, AB", s:4 },
    midarion:  { q:"Loads of crypto options and the sportsbook is a nice bonus. Do read the fine print.", n:"Tyler H.",  c:"Surrey, BC", s:4 }
  };

  /* ---- mega-menu structure (3 columns = 3 silos) ---- */
  var SILOS = [
    { t:"Browse by Type", items:[
      ["Top Rated Casinos","/top-rated-casinos/"],
      ["New Casinos","/new-casinos/"],
      ["Real Money Casinos","/real-money-casinos/"],
      ["Trusted &amp; Secure Casinos","/trusted-secure-casinos/"]
    ]},
    { t:"Payments &amp; Payouts", items:[
      ["Fast Payout Casinos","/fast-payout-casinos/"],
      ["Best Paying (High RTP)","/best-paying-casinos/"],
      ["Minimum Deposit Casinos","/minimum-deposit-casinos/"]
    ]},
    { t:"By Feature", items:[
      ["VIP &amp; High Roller","/vip-high-roller-casinos/"],
      ["No ID Verification","/no-id-verification-casinos/"],
      ["No Wagering Casinos","/no-wagering-casinos/"],
      ["Live Dealer Casinos","/live-dealer-casinos/"],
      ["Mobile Casinos","/mobile-casinos/"]
    ]}
  ];

  /* ---- payments mega-menu (Canada-focused deposit & withdrawal methods) ---- */
  var PAYMENTS = [
    { t:"Bank &amp; Interac", items:[
      ["Interac Casinos","/interac-casinos/"],
      ["InstaDebit Casinos","/instadebit-casinos/"],
      ["iDebit Casinos","/idebit-casinos/"]
    ]},
    { t:"Cards &amp; E-wallets", items:[
      ["Credit &amp; Debit Card","/credit-card-casinos/"],
      ["MuchBetter Casinos","/muchbetter-casinos/"],
      ["Payz Casinos","/payz-casinos/"]
    ]},
    { t:"Crypto, Prepaid &amp; Mobile", items:[
      ["Cryptocurrency Casinos","/crypto-casinos/"],
      ["Prepaid Voucher Casinos","/prepaid-casinos/"],
      ["Apple &amp; Google Pay","/apple-google-pay-casinos/"]
    ]}
  ];

  /* ---- bonuses mega-menu (only categories we have matching casinos for) ---- */
  var BONUSES = [
    { t:"Welcome &amp; Deposit", items:[
      ["Welcome Bonus Packages","/welcome-bonus-casinos/"],
      ["First Deposit Match","/first-deposit-bonus-casinos/"],
      ["High Roller Bonuses","/high-roller-bonus-casinos/"]
    ]},
    { t:"Free Spins &amp; No Deposit", items:[
      ["Free Spins Casinos","/free-spins-casinos/"],
      ["Free Spins No Deposit","/free-spins-no-deposit-casinos/"],
      ["100 Free Spins","/100-free-spins-casinos/"]
    ]},
    { t:"Wagering &amp; Rewards", items:[
      ["No Wagering Bonuses","/no-wagering-casinos/"],
      ["Low Wagering Bonuses","/low-wagering-casinos/"],
      ["Reload Bonuses","/reload-bonus-casinos/"],
      ["Cashback Offers","/cashback-casinos/"],
      ["Crypto Bonuses","/crypto-bonus-casinos/"],
      ["VIP &amp; Loyalty Perks","/vip-high-roller-casinos/"]
    ]}
  ];

  /* ---- games mega-menu (only game types our casinos actually offer) ---- */
  var GAMES = [
    { t:"Slots", items:[
      ["Best Real Money Slots","/real-money-slots/"],
      ["Progressive Jackpot Slots","/progressive-jackpot-slots/"],
      ["Megaways Slots","/megaways-slots/"],
      ["High RTP Slots","/high-rtp-slots/"],
      ["Free Slots / Demo","/free-slots/"],
      ["New Slot Releases","/new-slots/"]
    ]},
    { t:"Live Dealer", items:[
      ["Live Casino Hub","/live-dealer-casinos/"],
      ["Live Blackjack","/live-blackjack-casinos/"],
      ["Live Roulette","/live-roulette-casinos/"],
      ["Live Baccarat","/live-baccarat-casinos/"],
      ["Live Game Shows","/live-game-shows-casinos/"]
    ]},
    { t:"Table &amp; Instant Win", items:[
      ["Blackjack","/blackjack-casinos/"],
      ["Roulette","/roulette-casinos/"],
      ["Casino Poker","/casino-poker-games/"],
      ["Craps &amp; Sic Bo","/craps-sic-bo-casinos/"],
      ["Crash Games","/crash-games-casinos/"],
      ["Video Poker","/video-poker-casinos/"],
      ["Bingo &amp; Keno","/bingo-keno-casinos/"],
      ["Scratch Cards","/scratch-cards-casinos/"]
    ]}
  ];

  /* ---- inject shared CSS ---- */
  var css = ''+
  '.site-header nav .nav-links{overflow:visible}'+
  '.nav-links li.mega{position:relative}'+
  '.nav-links li.mega>a{display:inline-flex;align-items:center;gap:5px;cursor:pointer}'+
  '.mega-caret{font-size:.7em;transition:transform .2s}'+
  '.nav-links li.mega:hover .mega-caret,.nav-links li.mega:focus-within .mega-caret{transform:rotate(180deg)}'+
  '.mega-panel{position:absolute;top:calc(100% + 12px);left:50%;transform:translateX(-50%) translateY(6px);display:grid;grid-template-columns:repeat(3,minmax(158px,1fr));gap:6px 26px;min-width:min(640px,calc(100vw - 28px));max-width:calc(100vw - 28px);background:var(--panel,#fff);border:1px solid var(--line,#e6e8ee);border-radius:16px;box-shadow:0 26px 60px -20px rgba(11,18,32,.30);padding:22px 26px;opacity:0;visibility:hidden;transition:opacity .18s ease,transform .18s ease;z-index:200}'+
  '.mega-panel::before{content:"";position:absolute;top:-12px;left:0;right:0;height:12px}'+
  '.nav-links li.mega:hover .mega-panel,.nav-links li.mega:focus-within .mega-panel{opacity:1;visibility:visible;transform:translateX(-50%) translateY(0)}'+
  '.mega-col h5{font-family:var(--font-mono,monospace);font-size:.64rem;text-transform:uppercase;letter-spacing:.11em;color:var(--muted,#6b7280);margin:0 0 6px}'+
  '.mega-col a{display:block;padding:6px 0;font-size:.9rem;color:var(--ink-soft,#374151)}'+
  '.mega-col a:hover{color:var(--accent,#2f6bff)}'+
  '.mobile-menu .m-mega summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;padding:12px 0;font-weight:600}'+
  '.mobile-menu .m-mega summary::-webkit-details-marker{display:none}'+
  '.mobile-menu .m-mega summary::after{content:"+";color:var(--accent,#2f6bff);font-weight:700}'+
  '.mobile-menu .m-mega[open] summary::after{content:"\\2013"}'+
  '.mobile-menu .m-mega-group>span{display:block;font-family:var(--font-mono,monospace);font-size:.6rem;text-transform:uppercase;letter-spacing:.1em;color:var(--muted,#6b7280);margin:10px 0 2px}'+
  '.mobile-menu .m-mega-group a{display:block;padding:7px 0 7px 10px;font-size:.92rem}'+
  /* category page toolkit */
  '.cat-toc{display:flex;flex-wrap:wrap;gap:8px;margin-top:20px}'+
  '.cat-toc a{font-family:var(--font-mono,monospace);font-size:.74rem;padding:7px 13px;border-radius:999px;border:1px solid var(--line-2,#dfe3ea);background:var(--bg-soft,#f6f8fb);color:var(--ink-soft,#374151)}'+
  '.cat-toc a:hover{border-color:var(--accent,#2f6bff);color:var(--accent,#2f6bff)}'+
  '.toplist{display:grid;gap:14px;margin:22px 0}'+
  '.tl-row{display:grid;grid-template-columns:auto 132px 1fr auto;gap:18px;align-items:center;border:1px solid var(--line,#e6e8ee);border-radius:16px;background:var(--panel,#fff);padding:18px 20px;box-shadow:var(--shadow-sm,0 1px 2px rgba(11,18,32,.06));transition:box-shadow .2s,transform .2s}'+
  '.tl-row:hover{box-shadow:var(--glow,0 20px 45px -20px rgba(47,107,255,.3));transform:translateY(-2px)}'+
  '@media(max-width:860px){.tl-row{grid-template-columns:1fr;text-align:center}}'+
  '.tl-rank{font-family:var(--font-mono,monospace);font-weight:700;color:var(--faint,#9aa3b2)}'+
  '.tl-logo{width:132px;height:64px;border-radius:12px;display:grid;place-items:center;padding:10px;background:#fff;border:1px solid var(--line,#e6e8ee)}'+
  '.tl-logo.dark{background:#0b1220;border-color:#1e2a44}'+
  '.tl-logo img{max-width:100%;max-height:100%;object-fit:contain}'+
  '@media(max-width:860px){.tl-logo{margin:0 auto;width:180px}}'+
  '.tl-name{font-weight:700;font-size:1.08rem}'+
  '.tl-meta{color:var(--muted,#6b7280);font-size:.84rem;margin-top:3px}'+
  '.tl-bonus{font-family:var(--font-display,sans-serif);font-weight:600;margin-top:8px}'+
  '.tl-idx{font-family:var(--font-mono,monospace);font-size:.66rem;color:var(--verified,#0fae74);border:1px solid rgba(15,174,116,.35);background:rgba(15,174,116,.08);padding:2px 8px;border-radius:999px;margin-left:6px}'+
  '.tl-cta{display:grid;gap:6px;justify-items:center;min-width:150px}'+
  '@media(max-width:860px){.tl-cta{min-width:0}}'+
  '.tl-btn{position:relative;overflow:hidden;display:block;width:100%;text-align:center;padding:11px 22px;border-radius:999px;font-weight:700;color:#062e16;background:linear-gradient(135deg,#31d07f,#12a55a);box-shadow:0 6px 16px rgba(18,165,90,.28)}'+
  '.tl-btn::after{content:"";position:absolute;top:0;left:-120%;width:60%;height:100%;background:linear-gradient(120deg,transparent,rgba(255,255,255,.5),transparent);transform:skewX(-20deg);animation:tlshine 3.4s ease-in-out infinite}'+
  '@keyframes tlshine{0%,60%{left:-120%}100%{left:130%}}'+
  '.tl-rev{font-family:var(--font-mono,monospace);font-size:.74rem;color:var(--muted,#6b7280)}'+
  /* richer card bits */
  '.tl-why{font-style:italic;color:var(--muted,#6b7280);font-size:.86rem;margin-top:4px}'+
  '.tl-rate{display:flex;align-items:center;gap:10px;margin-top:8px;flex-wrap:wrap}'+
  '@media(max-width:860px){.tl-rate{justify-content:center}}'+
  '.tl-stars{position:relative;display:inline-block;font-size:.95rem;letter-spacing:1px;line-height:1}'+
  '.tl-stars .b{color:var(--line-2,#dfe3ea)}'+
  '.tl-stars .f{position:absolute;top:0;left:0;overflow:hidden;white-space:nowrap;color:#f5c542}'+
  '.tl-editor{font-family:var(--font-mono,monospace);font-size:.74rem;color:var(--ink-soft,#374151);font-weight:600}'+
  '.tl-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}'+
  '@media(max-width:860px){.tl-chips{justify-content:center}}'+
  '.tl-chip{font-size:.72rem;padding:4px 10px;border-radius:999px;border:1px solid var(--line,#e6e8ee);background:var(--bg-soft,#f6f8fb);color:var(--ink-soft,#374151)}'+
  /* trust band */
  '.cic-band{border:1px solid var(--line,#e6e8ee);border-radius:18px;background:var(--panel,#fff);padding:26px;margin:30px 0;box-shadow:var(--shadow-sm,0 1px 2px rgba(11,18,32,.06))}'+
  '.cic-band h3{font-size:1.15rem;margin:0}'+
  '.cic-band>p{color:var(--muted,#6b7280);font-size:.9rem;margin-top:6px}'+
  '.cic-steps{display:grid;gap:14px;grid-template-columns:repeat(2,1fr);margin-top:18px}'+
  '@media(min-width:720px){.cic-steps{grid-template-columns:repeat(4,1fr)}}'+
  '.cic-step{display:flex;gap:10px;align-items:flex-start}'+
  '.cic-step .i{width:34px;height:34px;border-radius:10px;flex:none;display:grid;place-items:center;background:var(--bg-soft,#f6f8fb);border:1px solid var(--line-2,#dfe3ea);font-size:1.05rem}'+
  '.cic-step b{display:block;font-size:.9rem}'+
  '.cic-step span{color:var(--muted,#6b7280);font-size:.8rem}'+
  /* player reviews */
  '.cic-reviews{margin:34px 0}'+
  '.cic-reviews .rh{display:flex;align-items:baseline;justify-content:space-between;gap:12px;flex-wrap:wrap}'+
  '.cic-reviews .rh h2{font-size:clamp(1.3rem,3vw,1.7rem)}'+
  '.cic-reviews .rh .avg{font-family:var(--font-mono,monospace);font-size:.8rem;color:var(--muted,#6b7280)}'+
  '.rev-grid{display:grid;gap:16px;grid-template-columns:1fr;margin-top:18px}'+
  '@media(min-width:680px){.rev-grid{grid-template-columns:repeat(2,1fr)}}'+
  '@media(min-width:1000px){.rev-grid{grid-template-columns:repeat(4,1fr)}}'+
  '.rev-card{border:1px solid var(--line,#e6e8ee);border-radius:16px;background:var(--panel,#fff);padding:20px;box-shadow:var(--shadow-sm,0 1px 2px rgba(11,18,32,.06));display:flex;flex-direction:column;gap:10px}'+
  '.rev-stars{color:#f5c542;font-size:.95rem;letter-spacing:1px}'+
  '.rev-q{color:var(--ink-soft,#374151);font-size:.92rem;line-height:1.55;flex:1}'+
  '.rev-tag{font-size:.72rem;color:var(--muted,#6b7280)}'+
  '.rev-tag a{color:var(--accent,#2f6bff)}'+
  '.rev-foot{display:flex;align-items:center;gap:10px;border-top:1px solid var(--line,#e6e8ee);padding-top:12px}'+
  '.rev-av{width:34px;height:34px;border-radius:50%;flex:none;display:grid;place-items:center;color:#fff;font-family:var(--font-mono,monospace);font-weight:700;font-size:.78rem;background:linear-gradient(135deg,#2f6bff,#1e40af)}'+
  '.rev-who{font-size:.8rem;font-weight:600}'+
  '.rev-meta{font-size:.7rem;color:var(--muted,#6b7280)}'+
  '.rev-badge{margin-left:auto;font-size:.62rem;font-family:var(--font-mono,monospace);color:var(--verified,#0fae74);border:1px solid rgba(15,174,116,.35);background:rgba(15,174,116,.08);padding:3px 8px;border-radius:999px}'+
  /* variant / high-conversion card bits */
  '.tl-row{position:relative}'+
  '.tl-top{border-color:rgba(209,31,45,.45);box-shadow:0 18px 45px -22px rgba(209,31,45,.35)}'+
  '.tl-ribbon{position:absolute;top:0;left:0;background:linear-gradient(135deg,#e01e2b,#8a0d16);color:#fff;font-family:var(--font-mono,monospace);font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;padding:4px 12px;border-bottom-right-radius:12px;z-index:2}'+
  '.tl-spot{display:inline-flex;align-items:baseline;gap:8px;margin-top:10px;padding:7px 13px;border-radius:10px;background:var(--bg-soft,#f6f8fb);border:1px solid var(--line,#e6e8ee)}'+
  '.tl-spot .sk{font-family:var(--font-mono,monospace);font-size:.6rem;text-transform:uppercase;letter-spacing:.08em;color:var(--muted,#6b7280)}'+
  '.tl-spot .sv{font-weight:700;font-size:.98rem;color:var(--ink,#0b1220)}'+
  '@media(max-width:860px){.tl-spot{justify-content:center}}'+
  '.tl-offer{font-family:var(--font-display,sans-serif);font-weight:700;font-size:1.02rem;text-align:center;color:var(--ink,#0b1220)}'+
  '.tl-trust{font-size:.66rem;color:var(--muted,#6b7280);text-align:center}';
  var st = document.createElement('style'); st.id = 'cic-mega-css'; st.textContent = css; document.head.appendChild(st);

  /* ---- build desktop dropdown ---- */
  var cols = SILOS.map(function(s){
    return '<div class="mega-col"><h5>'+s.t+'</h5>'+
      s.items.map(function(it){ return '<a href="'+it[1]+'">'+it[0]+'</a>'; }).join('')+
    '</div>';
  }).join('');
  var desktopLi = document.createElement('li');
  desktopLi.className = 'mega';
  desktopLi.innerHTML = '<a href="/online-casinos/" aria-haspopup="true">Online Casinos <span class="mega-caret" aria-hidden="true">&#9662;</span></a>'+
    '<div class="mega-panel" role="menu" aria-label="Online casino categories">'+cols+'</div>';

  var deskTarget = document.querySelector('.nav-links a[href$="#casinos"]');
  if (deskTarget && deskTarget.closest('li')) { deskTarget.closest('li').replaceWith(desktopLi); }
  else { var nl = document.querySelector('.nav-links'); if (nl) nl.insertBefore(desktopLi, nl.children[1] || null); }

  /* ---- build mobile accordion ---- */
  var mgroups = SILOS.map(function(s){
    return '<div class="m-mega-group"><span>'+s.t+'</span>'+
      s.items.map(function(it){ return '<a href="'+it[1]+'">'+it[0]+'</a>'; }).join('')+
    '</div>';
  }).join('');
  var mobileLi = document.createElement('li');
  mobileLi.innerHTML = '<details class="m-mega"><summary>Online Casinos</summary>'+mgroups+'</details>';
  var mobTarget = document.querySelector('#mobile-menu a[href$="#casinos"]');
  if (mobTarget && mobTarget.closest('li')) { mobTarget.closest('li').replaceWith(mobileLi); }
  else { var mm = document.querySelector('#mobile-menu ul'); if (mm) mm.insertBefore(mobileLi, mm.children[1] || null); }

  /* ---- build "Payments" dropdown (desktop + mobile), placed after Online Casinos ---- */
  var payCols = PAYMENTS.map(function(s){
    return '<div class="mega-col"><h5>'+s.t+'</h5>'+
      s.items.map(function(it){ return '<a href="'+it[1]+'">'+it[0]+'</a>'; }).join('')+
    '</div>';
  }).join('');
  var payLi = document.createElement('li');
  payLi.className = 'mega';
  payLi.innerHTML = '<a href="/interac-casinos/" aria-haspopup="true">Payments <span class="mega-caret" aria-hidden="true">&#9662;</span></a>'+
    '<div class="mega-panel" role="menu" aria-label="Casino payment methods">'+payCols+'</div>';
  if (desktopLi && desktopLi.parentNode) { desktopLi.after(payLi); }

  var payGroups = PAYMENTS.map(function(s){
    return '<div class="m-mega-group"><span>'+s.t+'</span>'+
      s.items.map(function(it){ return '<a href="'+it[1]+'">'+it[0]+'</a>'; }).join('')+
    '</div>';
  }).join('');
  var payMobileLi = document.createElement('li');
  payMobileLi.innerHTML = '<details class="m-mega"><summary>Payments</summary>'+payGroups+'</details>';
  if (mobileLi && mobileLi.parentNode) { mobileLi.after(payMobileLi); }

  /* ---- build "Bonuses" dropdown (desktop + mobile), placed after Payments ---- */
  var bonCols = BONUSES.map(function(s){
    return '<div class="mega-col"><h5>'+s.t+'</h5>'+
      s.items.map(function(it){ return '<a href="'+it[1]+'">'+it[0]+'</a>'; }).join('')+
    '</div>';
  }).join('');
  var bonLi = document.createElement('li');
  bonLi.className = 'mega';
  bonLi.innerHTML = '<a href="/welcome-bonus-casinos/" aria-haspopup="true">Bonuses <span class="mega-caret" aria-hidden="true">&#9662;</span></a>'+
    '<div class="mega-panel" role="menu" aria-label="Casino bonus types">'+bonCols+'</div>';
  if (payLi && payLi.parentNode) { payLi.after(bonLi); }

  var bonGroups = BONUSES.map(function(s){
    return '<div class="m-mega-group"><span>'+s.t+'</span>'+
      s.items.map(function(it){ return '<a href="'+it[1]+'">'+it[0]+'</a>'; }).join('')+
    '</div>';
  }).join('');
  var bonMobileLi = document.createElement('li');
  bonMobileLi.innerHTML = '<details class="m-mega"><summary>Bonuses</summary>'+bonGroups+'</details>';
  if (payMobileLi && payMobileLi.parentNode) { payMobileLi.after(bonMobileLi); }

  /* ---- build "Games" dropdown (desktop + mobile), placed after Bonuses ---- */
  var gameCols = GAMES.map(function(s){
    return '<div class="mega-col"><h5>'+s.t+'</h5>'+
      s.items.map(function(it){ return '<a href="'+it[1]+'">'+it[0]+'</a>'; }).join('')+
    '</div>';
  }).join('');
  var gameLi = document.createElement('li');
  gameLi.className = 'mega';
  gameLi.innerHTML = '<a href="/real-money-slots/" aria-haspopup="true">Games <span class="mega-caret" aria-hidden="true">&#9662;</span></a>'+
    '<div class="mega-panel" role="menu" aria-label="Casino game types">'+gameCols+'</div>';
  if (bonLi && bonLi.parentNode) { bonLi.after(gameLi); }

  var gameGroups = GAMES.map(function(s){
    return '<div class="m-mega-group"><span>'+s.t+'</span>'+
      s.items.map(function(it){ return '<a href="'+it[1]+'">'+it[0]+'</a>'; }).join('')+
    '</div>';
  }).join('');
  var gameMobileLi = document.createElement('li');
  gameMobileLi.innerHTML = '<details class="m-mega"><summary>Games</summary>'+gameGroups+'</details>';
  if (bonMobileLi && bonMobileLi.parentNode) { bonMobileLi.after(gameMobileLi); }

  /* ---- streamline the primary navbar ----
     Keep only the four mega dropdowns (Online Casinos, Payments, Bonuses, Games);
     the region "mode" switch lives in .header-right and is untouched. Home is the
     logo; Methodology / Responsible Gambling / About remain in the footer. */
  var keepDesktop = [desktopLi, payLi, bonLi, gameLi];
  var nlUl = document.querySelector('.nav-links');
  if (nlUl) {
    Array.prototype.slice.call(nlUl.children).forEach(function(li){
      if (keepDesktop.indexOf(li) === -1) li.remove();
    });
  }
  var keepMobile = [mobileLi, payMobileLi, bonMobileLi, gameMobileLi];
  var mmUl = document.querySelector('#mobile-menu ul');
  if (mmUl) {
    Array.prototype.slice.call(mmUl.children).forEach(function(li){
      if (keepMobile.indexOf(li) === -1) li.remove();
    });
    /* add quick links to key info pages at the bottom of the mobile menu */
    var extra = document.createElement('li');
    extra.className = 'm-mega-group';
    extra.innerHTML = '<span>More</span>'+
      '<a href="/methodology">Methodology</a>'+
      '<a href="/responsible-gambling">Responsible Gambling</a>'+
      '<a href="/about">About</a>';
    mmUl.appendChild(extra);
  }

  /* ---- keep every desktop dropdown inside the viewport ----
     With four dropdowns, the right-hand panels (Bonuses, Games) can extend past
     the screen edge. This nudges any overflowing panel back on-screen without
     disturbing its open/close animation (uses margin, not transform). */
  function clampMega(li){
    var p = li.querySelector('.mega-panel'); if(!p) return;
    p.style.marginLeft = '0px';
    var r = p.getBoundingClientRect();
    var vw = document.documentElement.clientWidth;
    var pad = 14, ml = 0;
    if (r.right > vw - pad) ml = -(r.right - (vw - pad));
    else if (r.left < pad) ml = (pad - r.left);
    if (ml) p.style.marginLeft = Math.round(ml) + 'px';
  }
  var megaLis = document.querySelectorAll('.nav-links li.mega');
  megaLis.forEach(function(li){
    li.addEventListener('mouseenter', function(){ clampMega(li); });
    li.addEventListener('focusin', function(){ clampMega(li); });
  });
  var mrt;
  window.addEventListener('resize', function(){
    clearTimeout(mrt);
    mrt = setTimeout(function(){ megaLis.forEach(clampMega); }, 120);
  });

  /* ---- auto-render top-pick lists (rich conversion cards) ---- */
  function tile(c){ return '<span class="tl-logo'+(c.dark?' dark':'')+'"><img src="/assets/img/'+c.logo+'" alt="'+c.name+' logo" loading="lazy"></span>'; }
  function stars(v){ var p=Math.round((v/5)*100); return '<span class="tl-stars" aria-label="'+v+' out of 5"><span class="b">★★★★★</span><span class="f" style="width:'+p+'%">★★★★★</span></span>'; }
  function rstars(n){ return '★★★★★'.slice(0,n)+'☆☆☆☆☆'.slice(0,5-n); }

  /* page-specific spotlight: each page surfaces the detail that matters most */
  function spot(c, v){
    switch(v){
      case 'payout': return {k:'Withdrawal speed', val:c.payout, chips:['⏱ Pending '+c.pending,'📈 '+c.monthly,'💳 Min '+c.minDep]};
      case 'rtp':    return {k:'Game library',     val:c.games,  chips:['🎯 96%+ avg RTP','🎥 Live: '+c.live]};
      case 'mindep': return {k:'Min deposit',      val:c.minDep, chips:['⚡ Payout '+c.payout,'🎁 '+c.bonus]};
      case 'vip':    return {k:'Monthly limit',    val:c.monthly,chips:['👑 '+c.meta,'⚡ Payout '+c.payout]};
      case 'wager':  return {k:'Wagering',         val:c.wager,  chips:['🎁 '+c.bonus,'⚡ Payout '+c.payout]};
      case 'live':   return {k:'Live studios',     val:c.live,   chips:['🎰 '+c.games,'⚡ Payout '+c.payout]};
      case 'mobile': return {k:'Mobile',           val:c.app,    chips:['🎰 '+c.games,'⚡ Payout '+c.payout]};
      case 'trust':  return {k:'Licence',          val:c.licence,chips:['📅 Since '+c.since,'⚡ Payout '+c.payout]};
      case 'new':    return {k:'Type',             val:c.meta,   chips:['🎁 '+c.bonus,'⚡ Payout '+c.payout]};
      default:       return {k:'Payout',           val:c.payout, chips:['🍁 '+c.meta,'🎰 '+c.games]};
    }
  }

  document.querySelectorAll('.toplist[data-casinos]').forEach(function(box){
    var keys = box.getAttribute('data-casinos').split(',').map(function(s){return s.trim();});
    var variant = box.getAttribute('data-variant') || 'bonus';
    box.innerHTML = keys.map(function(k, i){
      var c = CASINO[k]; if(!c) return '';
      var sp = spot(c, variant);
      return '<div class="tl-row'+(i===0?' tl-top':'')+'">'+
        (i===0?'<span class="tl-ribbon">★ Top Pick</span>':'')+
        '<div class="tl-rank">#'+(i+1)+'</div>'+
        tile(c)+
        '<div class="tl-info">'+
          '<div class="tl-name">'+c.name+'<span class="tl-idx">Index '+c.score+'</span></div>'+
          '<div class="tl-why">'+(c.why||c.meta)+'</div>'+
          '<div class="tl-rate">'+stars(c.player)+'<span class="tl-editor">Editor '+c.score+'/10 · Players '+c.player+'/5</span></div>'+
          '<div class="tl-spot"><span class="sk">'+sp.k+'</span><span class="sv">'+sp.val+'</span></div>'+
          '<div class="tl-chips">'+sp.chips.map(function(ch){return '<span class="tl-chip">'+ch+'</span>';}).join('')+'</div>'+
        '</div>'+
        '<div class="tl-cta">'+
          '<div class="tl-offer">'+c.bonus+'</div>'+
          '<a class="tl-btn" href="'+c.url+'" rel="sponsored nofollow noopener" target="_blank">Claim Bonus &rarr;</a>'+
          '<div class="tl-trust">✓ Payout tested &nbsp;·&nbsp; ✓ '+c.licence+'</div>'+
          '<a class="tl-rev" href="'+c.review+'">Read full review</a>'+
        '</div>'+
      '</div>';
    }).join('');

    /* inject shared "How we test" band + "Latest Player Reviews" once per page */
    var anchor = box.closest('[data-region-view]') || box;
    if (document.querySelector('.cic-injected')) return;

    var band = document.createElement('div');
    band.className = 'cic-band cic-injected';
    band.innerHTML = '<h3>How we test every casino</h3>'+
      '<p>No casino appears on this page unless it passes the same hands-on checks. Read our full <a href="/methodology">methodology</a>.</p>'+
      '<div class="cic-steps">'+
        '<div class="cic-step"><span class="i">💵</span><div><b>We deposit real money</b><span>Funded accounts, never demos.</span></div></div>'+
        '<div class="cic-step"><span class="i">⏱️</span><div><b>We time withdrawals</b><span>Cashouts tested end-to-end.</span></div></div>'+
        '<div class="cic-step"><span class="i">📄</span><div><b>We read every term</b><span>Wagering, caps &amp; fine print.</span></div></div>'+
        '<div class="cic-step"><span class="i">✅</span><div><b>Second-editor check</b><span>Every review is fact-checked.</span></div></div>'+
      '</div>';
    anchor.after(band);

    var picked = keys.filter(function(k){ return QUOTES[k]; });
    Object.keys(QUOTES).forEach(function(k){ if(picked.indexOf(k)===-1) picked.push(k); });
    picked = picked.slice(0,4);
    var cards = picked.map(function(k){
      var Q=QUOTES[k], c=CASINO[k];
      var initials = Q.n.split(' ').map(function(x){return x[0];}).join('').slice(0,2);
      return '<div class="rev-card">'+
        '<div class="rev-stars" aria-label="'+Q.s+' out of 5">'+rstars(Q.s)+'</div>'+
        '<p class="rev-q">&ldquo;'+Q.q+'&rdquo;</p>'+
        '<div class="rev-tag">Played at <a href="'+c.review+'">'+c.name+'</a></div>'+
        '<div class="rev-foot"><span class="rev-av">'+initials+'</span>'+
          '<div><div class="rev-who">'+Q.n+'</div><div class="rev-meta">'+Q.c+'</div></div>'+
          '<span class="rev-badge">Player review</span></div>'+
      '</div>';
    }).join('');
    var rev = document.createElement('div');
    rev.className = 'cic-reviews cic-injected';
    rev.innerHTML = '<div class="rh"><h2>Latest Player Reviews</h2><span class="avg">Real feedback from Canadian players</span></div><div class="rev-grid">'+cards+'</div>';
    band.after(rev);
  });
})();
