/* Hi.Life core script */
(function () {
  'use strict';
  var C = window.HL_CONFIG || {};
  var doc = document;
  function $(s, r) { return (r || doc).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem('hl_' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('hl_' + k, JSON.stringify(v)); } catch (e) { } }
  };
  var sess = {
    get: function (k) { try { return JSON.parse(sessionStorage.getItem('hl_' + k)); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem('hl_' + k, JSON.stringify(v)); } catch (e) { } }
  };
  var params = new URLSearchParams(location.search);
  function abs(rel) { return new URL(rel, doc.baseURI).href; }
  var dataCache = {};
  function data(name) {
    if (!dataCache[name]) dataCache[name] = fetch(abs('assets/data/' + name + '.json')).then(function (r) { return r.json(); });
    return dataCache[name];
  }
  function toast(msg) {
    var t = doc.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
    doc.body.appendChild(t); setTimeout(function () { t.remove(); }, 2200);
  }
  var now = new Date();
  var dayIndex = Math.floor((now.getTime() - now.getTimezoneOffset() * 6e4) / 864e5);

  window.HL = { $: $, $$: $$, esc: esc, store: store, params: params, abs: abs, data: data, toast: toast,
    cta: function (title, text, src) {
      return '<aside class="lead-cta"><div><p class="eyebrow">Free · no obligation</p><h3>' + esc(title) + '</h3><p>' + esc(text || 'Get a personalised Life Upgrade Plan and an optional intro to one vetted professional within 48 hours.') + '</p></div><a class="btn btn-sun" href="plan.html?src=' + encodeURIComponent(src || 'tool') + '">Get my free plan</a></aside>';
    }
  };

  /* Upgrade Points: small rewards for using tools, logging weeks and finishing quizzes (kept in this browser) */
  var LEVELS = [[0, 'Starter'], [50, 'Explorer'], [150, 'Builder'], [300, 'Achiever'], [600, 'High Lifer']];
  function level(p) { var l = LEVELS[0]; LEVELS.forEach(function (x) { if (p >= x[0]) l = x; }); return l[1]; }
  function renderPoints() {
    var p = store.get('pts', 0);
    $$('[data-points]').forEach(function (el) { el.innerHTML = '⭐ <strong>' + p + '</strong> Upgrade Points · ' + level(p); el.hidden = !p; });
  }
  window.HL.points = function (key, n) {
    var today = new Date().toDateString(), log = store.get('pts_log', {});
    if (log[key] === today) return;
    log[key] = today; store.set('pts_log', log);
    var before = store.get('pts', 0), after = before + n;
    store.set('pts', after);
    if (level(after) !== level(before)) toast('Level up: ' + level(after) + ' ⭐');
    renderPoints();
  };
  renderPoints();

  /* Embed mode for partner sites: tool.html?embed=1 */
  if (params.get('embed') === '1') {
    doc.body.classList.add('embed');
    var pw = doc.createElement('a');
    pw.className = 'powered'; pw.href = location.href.replace(/[?&]embed=1/, ''); pw.target = '_blank'; pw.rel = 'noopener';
    pw.innerHTML = 'Free tool by <strong>Hi.Life</strong> — open full version ↗';
    doc.body.appendChild(pw);
  }

  /* Rotating examples (plan page hero) */
  $$('[data-rotate]').forEach(function (el) {
    var items = el.getAttribute('data-rotate').split('|'), k = 0;
    el.textContent = items[0];
    setInterval(function () { k = (k + 1) % items.length; el.style.opacity = 0; setTimeout(function () { el.textContent = items[k]; el.style.opacity = 1; }, 250); }, 3200);
  });

  /* Tabs (home toolbox) */
  $$('[data-tabs]').forEach(function (box) {
    box.addEventListener('click', function (e) {
      var b = e.target.closest('[data-tab]'); if (!b) return;
      $$('[data-tab]', box).forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
      $$('[data-panel]', box).forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== b.getAttribute('data-tab'); });
    });
  });

  /* In-page anchors (pages use <base href>, so bare #links would jump to the home page) + click-to-play video */
  doc.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (a) {
      var id = a.getAttribute('href').slice(1);
      e.preventDefault();
      if (!id) return;
      var t = doc.getElementById(id);
      if (t) {
        t.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex', '-1');
        t.focus({ preventScroll: true });
        try { history.replaceState(null, '', location.pathname + location.search + '#' + id); } catch (er) { }
      }
      return;
    }
    var y = e.target.closest && e.target.closest('.yt');
    if (y) {
      var f = doc.createElement('iframe');
      f.className = 'yt-frame';
      f.src = 'https://www.youtube-nocookie.com/embed/' + y.getAttribute('data-id') + '?autoplay=1&rel=0';
      f.title = y.getAttribute('aria-label') || 'Video';
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      f.allowFullscreen = true;
      y.parentNode.replaceChild(f, y);
    }
  });

  /* Video thumbnails; a removed or wrong video ID turns into a YouTube search link automatically */
  $$('.yt[data-id]').forEach(function (y) {
    var id = y.getAttribute('data-id'), img = new Image();
    img.onload = function () {
      if (img.naturalWidth <= 120) swap(); else y.style.backgroundImage = 'url(' + img.src + ')';
    };
    img.onerror = swap;
    img.src = 'https://i.ytimg.com/vi/' + id + '/mqdefault.jpg';
    function swap() {
      var q = y.getAttribute('data-q') || y.getAttribute('aria-label') || 'Hi Life';
      var a = doc.createElement('a');
      a.className = 'btn btn-ghost';
      a.href = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q);
      a.target = '_blank'; a.rel = 'noopener';
      a.textContent = 'Watch on YouTube: ' + q;
      y.parentNode.replaceChild(a, y);
    }
  });

  /* Navigation */
  var burger = $('#burger');
  if (burger) burger.addEventListener('click', function () {
    var open = doc.body.classList.toggle('nav-open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  $$('.sub-toggle').forEach(function (b) {
    b.addEventListener('click', function () {
      var li = b.parentNode, open = li.classList.toggle('open');
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') { $$('.has-sub.open').forEach(function (li) { li.classList.remove('open'); }); doc.body.classList.remove('nav-open'); } });
  var here = location.pathname.replace(/index\.html$/, '');
  $$('#nav a').forEach(function (a) {
    var p = new URL(a.getAttribute('href'), doc.baseURI).pathname.replace(/index\.html$/, '');
    if (p.length > 1 && here.indexOf(p) === 0 && here.length - p.length < 60) a.setAttribute('aria-current', 'page');
  });

  /* Dates and config text */
  $$('[data-year]').forEach(function (el) { el.textContent = now.getFullYear(); });
  $$('[data-month]').forEach(function (el) { el.textContent = now.toLocaleString('en-US', { month: 'long', year: 'numeric' }); });
  $$('[data-today]').forEach(function (el) { el.textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }); });
  $$('[data-config]').forEach(function (el) {
    var v = el.getAttribute('data-config').split('.').reduce(function (o, k) { return o && o[k]; }, C);
    if (v) el.textContent = v;
  });
  function fmtDate(d) { return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }); }

  /* Self-updating: next life/wellbeing/money observance (fixed-date list, rolls into next year automatically) */
  data('observances').then(function (list) {
    var y = now.getFullYear(), today = new Date(y, now.getMonth(), now.getDate()), up = [];
    list.forEach(function (o) {
      [y, y + 1].forEach(function (yy) {
        var d = new Date(yy, o.m - 1, o.d);
        if (d >= today) up.push({ o: o, d: d });
      });
    });
    up.sort(function (a, b) { return a.d - b.d; });
    if (!up.length) return;
    var next = up[0], days = Math.round((next.d - today) / 864e5);
    var rb = $('#ribbon');
    if (rb && !doc.body.classList.contains('no-ribbon')) {
      rb.innerHTML = '<div class="wrap">' + (days === 0 ? '<strong>Today is ' + esc(next.o.name) + '.</strong> ' : '<strong>' + esc(next.o.name) + '</strong> is in ' + days + ' day' + (days === 1 ? '' : 's') + ' (' + fmtDate(next.d) + '). ') + '<a href="' + esc(next.o.link) + '">' + esc(next.o.cta) + ' →</a></div>';
      rb.hidden = false;
    }
    var ul = $('[data-observances]');
    if (ul) ul.innerHTML = up.slice(0, 6).map(function (x) { return '<li><a href="' + esc(x.o.link) + '">' + esc(x.o.name) + '</a><span>' + fmtDate(x.d) + ' · ' + esc(x.o.cta) + '</span></li>'; }).join('');
  }).catch(function () { });

  /* Tip and quote of the day (rotate daily) */
  var tip = $('[data-tip]');
  if (tip) data('tips').then(function (t) {
    var x = t[dayIndex % t.length];
    tip.innerHTML = '<p class="eyebrow">Upgrade of the day · <span>' + esc(x.pillar) + '</span></p><h3>' + esc(x.title) + '</h3><p>' + esc(x.text) + '</p>' + (x.link ? '<a class="btn btn-ghost btn-sm" href="' + esc(x.link) + '">' + esc(x.cta || 'Learn more') + '</a>' : '');
  }).catch(function () { });
  var qd = $('[data-quote]');
  if (qd) data('quotes').then(function (q) {
    var x = q[dayIndex % q.length];
    qd.innerHTML = '<blockquote>“' + esc(x.q) + '”</blockquote><p class="muted">— ' + esc(x.a) + '</p>';
  }).catch(function () { });

  /* Saved Life Score on home and plan pages */
  var saved = store.get('lifescore', null);
  $$('[data-saved-score]').forEach(function (el) {
    if (!saved) return;
    el.innerHTML = '<p class="eyebrow">Your last Life Score</p><p class="result-big">' + saved.total + '<small style="font-size:1rem;color:var(--muted)">/100</small></p><p>Weakest area: <strong>' + esc(saved.low === 'Love' ? 'Relationships' : saved.low) + '</strong>. <a href="life-score.html">Retake</a> or <a href="plan.html?focus=' + encodeURIComponent(saved.low === 'Love' ? 'Mind' : saved.low) + '&src=saved-score">get a plan for it</a>.</p>';
    el.hidden = false;
  });

  /* News (assets/data/news.json, refreshed daily by automation/fetch_news.py) */
  var FALLBACK = [
    ['Consumer Financial Protection Bureau: money tools and guides', 'https://www.consumerfinance.gov/consumer-tools/', 'Money'],
    ['Investor.gov: compound interest and saving basics', 'https://www.investor.gov/', 'Money'],
    ['MyMoney.gov: US government financial education', 'https://www.mymoney.gov/', 'Money'],
    ['World Health Organization: news and health topics', 'https://www.who.int/news', 'Health'],
    ['NIH News in Health', 'https://newsinhealth.nih.gov/', 'Health'],
    ['CDC: physical activity basics', 'https://www.cdc.gov/physical-activity-basics/', 'Health'],
    ['US Bureau of Labor Statistics: Occupational Outlook Handbook', 'https://www.bls.gov/ooh/', 'Career'],
    ['World Economic Forum: future of jobs', 'https://www.weforum.org/', 'Career']
  ];
  var nl = $$('[data-news]');
  nl.forEach(function (nl) { data('news').then(function (items) {
    var lim = +nl.getAttribute('data-news') || 30;
    var f = nl.getAttribute('data-filter');
    if (f) items = items.filter(function (i) { return i.pillar === f; });
    nl.innerHTML = items.length ? '<ul class="news-list">' + items.slice(0, lim).map(function (i) { return '<li><a href="' + esc(i.url) + '" target="_blank" rel="noopener nofollow">' + esc(i.title) + '</a><span>' + esc(i.source || '') + (i.pillar ? ' · ' + esc(i.pillar) : '') + (i.date ? ' · ' + esc(i.date) : '') + '</span></li>'; }).join('') + '</ul>' : FALLBACK.filter(function (x) { return !f || x[2] === f; }).map(function (x) { return '<li><a href="' + x[1] + '" target="_blank" rel="noopener">' + esc(x[0]) + '</a><span>' + esc(x[2]) + ' · trusted source</span></li>'; }).reduce(function (a, b) { return a + b; }, '<ul class="news-list">') + '</ul>';
  }).catch(function () { }); });

  /* Ad slots: filled only when slot IDs are set in config.js */
  var slots = C.adSlots || {};
  if (doc.querySelector('script[src*="adsbygoogle"]')) {
    $$('.ad-slot').forEach(function (s) {
      var id = slots[s.getAttribute('data-slot')];
      if (!id) return;
      s.innerHTML = '<p class="ad-label">Advertisement</p><ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-6620975821265271" data-ad-slot="' + esc(id) + '" data-ad-format="auto" data-full-width-responsive="true"></ins>';
      s.classList.add('on');
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) { }
    });
  }

  /* First-touch attribution for leads */
  if (!sess.get('src')) {
    var utm = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid', 'src'].forEach(function (k) { if (params.get(k)) utm[k] = params.get(k); });
    sess.set('src', { landing: location.pathname + location.search, ref: doc.referrer || '', utm: utm });
  }

  /* Forms: FormSubmit with an encoded inbox */
  function inbox() {
    return String.fromCharCode.apply(null, (C.inbox || []).slice().reverse().map(function (c) { return c ^ 23; }));
  }
  function collect(form) {
    var o = {};
    new FormData(form).forEach(function (v, k) {
      if (k === '_honey' || v === '' || (v && v.name !== undefined && v.size !== undefined)) return;
      o[k] = o[k] ? o[k] + ', ' + v : v;
    });
    return o;
  }
  function scoreLead(form) {
    var s = 0;
    $$('input[data-score]:checked, option[data-score]:checked', form).forEach(function (el) { s += parseInt(el.getAttribute('data-score'), 10) || 0; });
    var ph = form.querySelector('[name=phone]');
    if (ph && ph.value.replace(/\D/g, '').length >= 7) s += 10;
    return Math.max(0, Math.min(100, s));
  }
  function send(form) {
    var type = form.getAttribute('data-form') || 'form';
    var d = collect(form), src = sess.get('src') || {};
    if (form.hasAttribute('data-score')) {
      d.lead_score = scoreLead(form);
      d.lead_grade = d.lead_score >= 70 ? 'A (hot)' : d.lead_score >= 45 ? 'B (warm)' : 'C (nurture)';
    }
    if (saved && type === 'plan') d.life_score = saved.total + '/100 (weakest: ' + saved.low + ')';
    d._subject = 'Hi.Life: ' + (form.getAttribute('data-subject') || type) + (d.help_with ? ' (' + d.help_with + ')' : '') + (d.lead_grade ? ' | ' + d.lead_grade : '');
    d._template = 'table';
    d.form_type = type;
    d.page = location.href;
    d.landing_page = src.landing || '';
    d.referrer = src.ref || '';
    d.campaign = JSON.stringify(src.utm || {});
    d.submitted_at = new Date().toString();
    var btn = form.querySelector('[type=submit]');
    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
    function done() {
      sess.set('last_form', type);
      window.HL.points('form-' + type, 25);
      var msg = form.getAttribute('data-inline');
      if (msg) form.innerHTML = '<div class="success" role="status"><h3>Thank you!</h3><p>' + esc(msg) + '</p></div>';
      else location.href = abs('thank-you.html?f=' + encodeURIComponent(type));
    }
    function fallback() {
      var f = doc.createElement('form');
      f.method = 'POST';
      f.action = 'https://formsubmit.co/' + inbox();
      f.style.display = 'none';
      d._next = abs('thank-you.html?f=' + encodeURIComponent(type));
      d._captcha = 'false';
      Object.keys(d).forEach(function (k) {
        var i = doc.createElement('input'); i.type = 'hidden'; i.name = k; i.value = d[k]; f.appendChild(i);
      });
      doc.body.appendChild(f);
      f.submit();
    }
    fetch((C.formEndpoint || 'https://formsubmit.co/ajax/') + inbox(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(d)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (r.ok && String(j.success) !== 'false') done(); else fallback();
      });
    }).catch(fallback);
  }
  window.HL.send = send;

  /* Pre-fill from the URL, e.g. plan.html?focus=Money */
  params.forEach(function (v, k) {
    if (!/^[a-z_]{2,20}$/.test(k)) return;
    $$('form [name="' + k + '"]').forEach(function (el) {
      if (el.type === 'radio' || el.type === 'checkbox') { if (el.value === v) el.checked = true; }
      else if (el.type !== 'hidden' && !el.value) el.value = v;
    });
  });

  /* Multi-step forms */
  $$('form[data-steps]').forEach(function (form) {
    form.noValidate = true;
    var steps = $$('.step', form), i = 0;
    var bar = $('.progress span', form), lab = $('.progress-label', form);
    function show(n) {
      steps.forEach(function (s, k) { s.hidden = k !== n; });
      i = n;
      if (bar) bar.style.width = Math.round((n + 1) / steps.length * 100) + '%';
      if (lab) lab.textContent = 'Step ' + (n + 1) + ' of ' + steps.length;
      var sb = form.querySelector('[type=submit]'), pb = form.querySelector('[data-prev]');
      if (sb) { if (!sb.getAttribute('data-mid')) sb.setAttribute('data-mid', sb.textContent); sb.textContent = n === steps.length - 1 ? (form.getAttribute('data-final') || 'Send') : sb.getAttribute('data-mid'); }
      if (pb) pb.style.visibility = n === 0 ? 'hidden' : 'visible';
    }
    function valid(s) {
      var els = $$('input,select,textarea', s);
      for (var k = 0; k < els.length; k++) { if (!els[k].checkValidity()) { els[k].reportValidity(); return false; } }
      return true;
    }
    form._stepper = {
      last: function () { return i === steps.length - 1; },
      next: function () { if (valid(steps[i])) { show(Math.min(i + 1, steps.length - 1)); form.scrollIntoView({ block: 'start', behavior: 'smooth' }); } }
    };
    form.addEventListener('click', function (e) {
      var b = e.target.closest('[data-next],[data-prev]');
      if (!b) return;
      e.preventDefault();
      if (b.hasAttribute('data-next')) form._stepper.next();
      else { show(Math.max(i - 1, 0)); form.scrollIntoView({ block: 'start', behavior: 'smooth' }); }
    });
    form.addEventListener('change', function (e) {
      var st = steps[i];
      if (st && st.hasAttribute('data-auto') && e.target.type === 'radio') setTimeout(function () { form._stepper.next(); }, 200);
    });
    show(steps[0] && steps[0].hasAttribute('data-auto') && steps[0].querySelector('input:checked') ? 1 : 0);
  });

  $$('form[data-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form._stepper && !form._stepper.last()) { form._stepper.next(); return; }
      var hp = form.querySelector('[name=_honey]');
      if (hp && hp.value) { form.innerHTML = '<div class="success"><h3>Thank you!</h3></div>'; return; }
      if (!form.reportValidity()) return;
      send(form);
    });
  });

  /* Support page: amount picker */
  var dz = $('#donate');
  if (dz) {
    var amt = 25, freq = 'one-time';
    var D = C.donate || {};
    function sync() {
      $$('[data-amt]', dz).forEach(function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-amt') === amt)); });
      $$('[data-freq]', dz).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-freq') === freq)); });
      var out = $('#donateSummary'); if (out) out.textContent = 'US$' + amt + (freq === 'monthly' ? ' a month' : ' one time');
      var pa = $('#pledgeAmount'); if (pa) pa.value = amt + ' ' + freq;
      var link = freq === 'monthly' ? (D.stripeMonthly || D.paypal || D.bmc) : (D.stripe || D.paypal || D.bmc);
      var go = $('#donateGo');
      if (go) { if (link) { go.href = link; go.target = '_blank'; go.rel = 'noopener'; go.textContent = 'Continue to secure payment'; } else { go.href = '#pledge'; go.removeAttribute('target'); go.textContent = 'Pledge this amount'; } }
    }
    dz.addEventListener('click', function (e) {
      var b = e.target.closest('[data-amt],[data-freq]');
      if (!b) return;
      if (b.hasAttribute('data-amt')) amt = +b.getAttribute('data-amt');
      if (b.hasAttribute('data-freq')) freq = b.getAttribute('data-freq');
      sync();
    });
    var custom = $('#customAmt', dz);
    if (custom) custom.addEventListener('input', function () { var v = Math.round(+custom.value); if (v > 0) { amt = v; sync(); } });
    sync();
  }

  /* Contest countdown */
  $$('[data-contest-countdown]').forEach(function (el) {
    var end = new Date((C.contest && C.contest.closes || '2027-02-28') + 'T23:59:59');
    var days = Math.ceil((end - now) / 864e5);
    el.innerHTML = days > 0 ? '<b>' + days + '</b> day' + (days === 1 ? '' : 's') + ' left to enter (closes ' + fmtDate(end) + ')' : 'This round has closed. The next contest opens soon — join the newsletter to hear first.';
  });

  /* Share / copy / print / helpful */
  doc.addEventListener('click', function (e) {
    var t = e.target;
    if (t.closest('[data-share-native]')) {
      if (navigator.share) navigator.share({ title: doc.title, url: location.href }).catch(function () { });
      else { navigator.clipboard && navigator.clipboard.writeText(location.href); toast('Link copied'); }
    } else if (t.closest('[data-copy-link]')) {
      navigator.clipboard && navigator.clipboard.writeText(location.href).then(function () { toast('Link copied'); });
    } else if (t.closest('[data-print]')) {
      window.print();
    } else if (t.closest('[data-vote]')) {
      var box = t.closest('[data-helpful]');
      store.set('vote_' + box.getAttribute('data-helpful'), t.getAttribute('data-vote'));
      box.innerHTML = t.getAttribute('data-vote') === 'yes' ? '<p>Thank you! Share it with someone who would find it useful.</p>' : '<p>Thanks for telling us. <a href="contact.html?topic=Feedback">Tell us what was missing</a> and we will improve it.</p>';
    } else if (t.closest('[data-dismiss-sticky]')) {
      store.set('sticky_off', Date.now());
      $('#stickyLead').hidden = true;
    }
  });

  /* Filter chips (guides, tools, videos) */
  $$('[data-filter-group]').forEach(function (g) {
    var target = $(g.getAttribute('data-filter-group'));
    g.addEventListener('click', function (e) {
      var b = e.target.closest('[data-filter]'); if (!b || !target) return;
      $$('[data-filter]', g).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      var f = b.getAttribute('data-filter');
      $$('[data-cat]', target).forEach(function (c) { c.hidden = f !== 'all' && c.getAttribute('data-cat') !== f; });
    });
  });

  /* Guide table of contents */
  var prose = $('#prose'), toc = $('#toc');
  if (prose && toc) {
    var hs = $$('h2[id]', prose);
    if (hs.length >= 3) {
      toc.innerHTML = '<strong>On this page</strong><ol>' + hs.map(function (h) { return '<li><a href="#' + h.id + '">' + esc(h.textContent) + '</a></li>'; }).join('') + '</ol>';
      toc.hidden = false;
    }
  }

  /* Sticky lead bar */
  var sl = $('#stickyLead');
  var off = store.get('sticky_off', 0);
  if (sl && C.stickyLead !== false && !doc.body.classList.contains('no-sticky') && (Date.now() - off > 3 * 864e5)) {
    var shown = false;
    window.addEventListener('scroll', function () {
      if (shown) return;
      var pct = (window.scrollY + window.innerHeight) / doc.documentElement.scrollHeight;
      if (pct > 0.4 && window.scrollY > 700 && store.get('cookie_ok', false)) { sl.hidden = false; shown = true; }
    }, { passive: true });
  }

  /* Thank-you page message */
  var ty = $('#tyMsg');
  if (ty) {
    var f = params.get('f') || '';
    var MSG = {
      plan: 'Your Life Upgrade request is in. Within 48 hours you will get your personalised plan by email and, if you asked for one, an introduction to one vetted professional. Check your spam folder just in case.',
      pro: 'Thanks for applying to the Hi.Life Pro Network. We review every application by hand and reply within three business days.',
      pledge: 'Thank you for supporting Hi.Life. We will email you a secure payment link within one business day.',
      contest: 'You are entered! Winners are chosen after the contest closes and contacted by email.',
      careers: 'Application received. If there is a fit, we will reply within a week.',
      advertise: 'Thanks. We will send our media kit, audience numbers and availability within two business days.',
      contact: 'Message received. We reply to most messages within two business days.',
      course: 'You are enrolled! Day 1 of the 7-Day Life Upgrade arrives within a few minutes — check Promotions or Spam if you do not see it.',
      story: 'Thank you for sharing your story. Our editors read every submission and reply within a week if it is selected.',
      embed: 'Thanks! We will send your embed code and branding options within two business days.',
      results: 'Your results are on the way to your inbox.'
    };
    if (MSG[f]) ty.textContent = MSG[f];
  }

  /* Site search */
  var sBox = $('#searchInput');
  if (sBox) {
    fetch(abs('search.json')).then(function (r) { return r.json(); }).then(function (idx) {
      var out = $('#searchResults');
      function run() {
        var q = sBox.value.trim().toLowerCase();
        if (!q) { out.innerHTML = ''; return; }
        var terms = q.split(/\s+/);
        var res = idx.filter(function (p) {
          var h = (p.t + ' ' + p.d + ' ' + p.k).toLowerCase();
          return terms.every(function (t) { return h.indexOf(t) > -1; });
        }).slice(0, 40);
        out.innerHTML = res.length ? res.map(function (r) { return '<li><a href="' + esc(r.u) + '">' + esc(r.t) + '</a><p>' + esc(r.d) + '</p></li>'; }).join('') : '<li>No matches. Try "retirement", "sleep", "budget" or "insurance".</li>';
      }
      sBox.addEventListener('input', run);
      if (params.get('q')) { sBox.value = params.get('q'); run(); }
    }).catch(function () { });
  }

  /* Cookie notice */
  if (C.cookieNotice !== false && !store.get('cookie_ok', false)) {
    var cb = doc.createElement('div');
    cb.className = 'cookie';
    cb.setAttribute('role', 'region');
    cb.setAttribute('aria-label', 'Cookie notice');
    cb.innerHTML = '<p>We use cookies for ads (Google AdSense) and embedded videos. Your tool inputs stay in your browser. <a href="privacy.html">Privacy policy</a></p><button class="btn btn-sun btn-sm" type="button">OK</button>';
    doc.body.appendChild(cb);
    cb.querySelector('button').addEventListener('click', function () { store.set('cookie_ok', true); cb.parentNode.removeChild(cb); });
  }
})();
