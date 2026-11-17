/* Hi.Life interactive tools. Every calculation runs in the visitor's browser. */
(function () {
  'use strict';
  var H = window.HL, $ = H.$, $$ = H.$$, esc = H.esc, store = H.store;
  var root = $('[data-tool]');
  if (!root) return;
  var tool = root.getAttribute('data-tool');

  /* ---------- helpers ---------- */
  var CUR = store.get('cur', 'USD');
  function money(v, dp) {
    if (!isFinite(v)) return '—';
    try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: CUR, maximumFractionDigits: dp || 0 }).format(v); }
    catch (e) { return '$' + Math.round(v).toLocaleString(); }
  }
  function num(v, dp) { return isFinite(v) ? Number(v).toLocaleString(undefined, { maximumFractionDigits: dp == null ? 0 : dp }) : '—'; }
  function val(id) { var el = $('#' + id); if (!el) return 0; var v = parseFloat(String(el.value).replace(/,/g, '')); return isFinite(v) ? v : 0; }
  function out(id, html) { var el = $('#' + id); if (el) el.innerHTML = html; }
  function kpi(label, value) { return '<div class="kpi"><span>' + esc(label) + '</span><b>' + value + '</b></div>'; }
  function persist(key) {
    var saved = store.get('t_' + key, {});
    $$('input,select', root).forEach(function (el) {
      if (!el.id || el.type === 'hidden' || el.closest('form[data-form]')) return;
      if (saved[el.id] != null) { if (el.type === 'checkbox' || el.type === 'radio') el.checked = saved[el.id]; else el.value = saved[el.id]; }
    });
    root.addEventListener('input', function () {
      var o = {};
      $$('input,select', root).forEach(function (el) { if (el.id && el.type !== 'hidden' && !el.closest('form[data-form]')) o[el.id] = (el.type === 'checkbox' || el.type === 'radio') ? el.checked : el.value; });
      store.set('t_' + key, o);
    });
  }
  function live(fn) {
    root.addEventListener('input', fn);
    root.addEventListener('change', fn);
    $$('input[type=range]', root).forEach(function (r) {
      var lab = $('[data-for="' + r.id + '"]');
      function u() { if (lab) lab.textContent = r.getAttribute('data-fmt') === 'pct' ? r.value + '%' : r.value; }
      r.addEventListener('input', u); u();
    });
    fn();
  }
  function lineChart(el, series, opts) {
    if (!el) return;
    opts = opts || {};
    var W = 600, Hh = 220, P = 34, all = [];
    series.forEach(function (s) { all = all.concat(s.data); });
    var max = Math.max.apply(null, all.concat([1])), n = series[0].data.length;
    function x(i) { return P + (W - P - 8) * (n <= 1 ? 0 : i / (n - 1)); }
    function y(v) { return Hh - 24 - (Hh - 40) * (v / max); }
    var svg = '<svg viewBox="0 0 ' + W + ' ' + Hh + '" class="chart" role="img" aria-label="' + esc(opts.label || 'Chart') + '">';
    for (var g = 0; g <= 4; g++) { var gy = y(max * g / 4); svg += '<line x1="' + P + '" x2="' + (W - 8) + '" y1="' + gy + '" y2="' + gy + '" stroke="#eee5d8"/><text x="2" y="' + (gy + 4) + '" font-size="10" fill="#6b7890">' + short(max * g / 4) + '</text>'; }
    series.forEach(function (s) {
      var d = s.data.map(function (v, i) { return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1); }).join(' ');
      if (s.fill) svg += '<path d="' + d + ' L' + x(n - 1) + ' ' + y(0) + ' L' + x(0) + ' ' + y(0) + 'Z" fill="' + s.color + '" opacity=".12"/>';
      svg += '<path d="' + d + '" fill="none" stroke="' + s.color + '" stroke-width="3" stroke-linejoin="round"/>';
    });
    if (opts.xl) svg += '<text x="' + P + '" y="' + (Hh - 6) + '" font-size="11" fill="#6b7890">' + esc(opts.xl[0]) + '</text><text x="' + (W - 8) + '" y="' + (Hh - 6) + '" font-size="11" fill="#6b7890" text-anchor="end">' + esc(opts.xl[1]) + '</text>';
    svg += '</svg>';
    if (series.length > 1) svg += '<div class="legend">' + series.map(function (s) { return '<span style="--c:' + s.color + '">' + esc(s.name) + '</span>'; }).join('') + '</div>';
    el.innerHTML = svg;
  }
  function short(v) { return v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v >= 1e3 ? Math.round(v / 1e3) + 'k' : Math.round(v); }

  /* currency picker shared by all money tools */
  $$('[data-currency]').forEach(function (s) {
    s.value = CUR;
    s.addEventListener('change', function () { CUR = s.value; store.set('cur', CUR); root.dispatchEvent(new Event('input')); });
  });

  /* "Email me my results" forms on tool pages carry the summary along */
  $$('form[data-form="results"]').forEach(function (f) {
    f.addEventListener('submit', function () {
      var s = f.querySelector('[name=summary]'), r = $('#result');
      if (s && r) s.value = r.innerText.slice(0, 1500);
    }, true);
  });

  var T = {};

  /* ---------- 1. Life Score ---------- */
  T['life-score'] = function () {
    var Q = [
      ['Money', 'If your income stopped today, how long could you cover essential bills?', ['Less than 2 weeks', 'About a month', '2–5 months', '6 months or more']],
      ['Money', 'How do you feel about your debt (excluding a mortgage)?', ['It keeps growing', 'Stuck at the same level', 'Shrinking on a plan', 'No consumer debt']],
      ['Health', 'On a typical night, how much sleep do you get?', ['Under 5 hours', '5–6 hours', '6–7 hours', '7–9 hours']],
      ['Health', 'How many days a week do you move hard enough to breathe faster for 20+ minutes?', ['0', '1–2', '3–4', '5 or more']],
      ['Career', 'How do you feel on Sunday evening about the week ahead?', ['Dread', 'Mostly meh', 'Mostly fine', 'Genuinely looking forward to it']],
      ['Career', 'When did you last learn a skill that raised (or could raise) your income?', ['Can\'t remember', 'Over 2 years ago', 'In the last 2 years', 'I\'m learning one now']],
      ['Home', 'How does your home support the life you want?', ['It drains me', 'It\'s okay', 'Mostly works', 'It\'s my recharge zone']],
      ['Home', 'Is your housing cost (rent or mortgage) under about 30% of take-home pay?', ['Way over', 'A bit over', 'Right around 30%', 'Comfortably under']],
      ['Love', 'How many people could you call at 3 a.m. in a crisis?', ['Nobody', 'One', 'Two or three', 'Four or more']],
      ['Love', 'How often do you spend real, phone-down time with people you love?', ['Rarely', 'Monthly', 'Weekly', 'Most days']],
      ['Mind', 'Over the last two weeks, how often have you felt calm and in control?', ['Almost never', 'Some days', 'Most days', 'Nearly every day']],
      ['Mind', 'Do you have a clear goal for the next 12 months that excites you?', ['No idea', 'Vague ideas', 'Yes, written down', 'Yes, and I\'m working on it weekly']]
    ];
    var PILLARS = ['Money', 'Health', 'Career', 'Home', 'Love', 'Mind'];
    var LINKS = { Money: ['guides/emergency-fund.html', 'budget.html'], Health: ['guides/sleep-better.html', 'calories.html'], Career: ['guides/raise-your-income.html', 'salary.html'], Home: ['guides/buy-vs-rent.html', 'home-affordability.html'], Love: ['guides/strong-relationships.html', 'habit-tracker.html'], Mind: ['guides/stress-reset.html', 'life-in-weeks.html'] };
    var ADVICE = {
      Money: 'Build a one-month buffer first, then attack high-interest debt. Automate both so willpower is not required.',
      Health: 'Protect a fixed wake-up time and add three 20-minute brisk walks a week. Sleep and movement lift every other score.',
      Career: 'Pick one income-raising skill and give it 3 hours a week for 90 days. Then ask for the raise or move.',
      Home: 'Fix the one thing at home that annoys you daily, and check whether housing costs are squeezing your savings.',
      Love: 'Schedule one recurring, phone-free ritual with someone who matters. Connection is the strongest predictor of a good life.',
      Mind: 'Write one 12-month goal and a 10-minute daily wind-down. Clarity and calm compound like interest.'
    };
    var ans = [], i = 0, box = $('#quiz');
    function render() {
      if (i >= Q.length) return finish();
      var q = Q[i];
      box.innerHTML = '<div class="q-card"><div class="progress"><span style="width:' + Math.round(i / Q.length * 100) + '%"></span></div><p class="progress-label">Question ' + (i + 1) + ' of ' + Q.length + ' · <span class="pill pill-' + q[0].toLowerCase() + '">' + q[0] + '</span></p><h2>' + esc(q[1]) + '</h2><div class="q-opts">' +
        q[2].map(function (o, k) { return '<button type="button" class="q-opt' + (ans[i] === k ? ' sel' : '') + '" data-k="' + k + '"><b>' + 'ABCD'[k] + '</b>' + esc(o) + '</button>'; }).join('') +
        '</div>' + (i ? '<p style="margin-top:16px"><button type="button" class="chip" data-back>← Back</button></p>' : '') + '</div>';
      var first = $('.q-opt', box); if (first && i) first.focus({ preventScroll: true });
    }
    box.addEventListener('click', function (e) {
      var b = e.target.closest('.q-opt');
      if (b) { ans[i] = +b.getAttribute('data-k'); b.classList.add('sel'); i++; setTimeout(render, 160); return; }
      if (e.target.closest('[data-back]')) { i = Math.max(0, i - 1); render(); }
      if (e.target.closest('[data-restart]')) { ans = []; i = 0; render(); box.scrollIntoView({ behavior: 'smooth' }); }
    });
    function finish() {
      var per = {};
      PILLARS.forEach(function (p) { per[p] = 0; });
      Q.forEach(function (q, k) { per[q[0]] += ans[k] || 0; });
      PILLARS.forEach(function (p) { per[p] = Math.round(per[p] / 6 * 100); });
      var total = Math.round(PILLARS.reduce(function (s, p) { return s + per[p]; }, 0) / 6);
      var sorted = PILLARS.slice().sort(function (a, b) { return per[a] - per[b]; });
      var low = sorted[0], high = sorted[5];
      store.set('lifescore', { total: total, per: per, low: low, at: Date.now() });
      var band = total >= 80 ? ['Thriving', 'You are living the high life. Your job now is protecting it and helping others.'] : total >= 60 ? ['Strong', 'A solid life with one or two areas quietly holding you back.'] : total >= 40 ? ['Building', 'Plenty of upside. Small fixes in your two lowest areas will feel big fast.'] : ['Reset time', 'Things feel heavy. Start with one area, not six. Momentum beats perfection.'];
      box.innerHTML = '<div class="q-card" id="result"><p class="eyebrow">Your Hi.Life Score</p><p class="result-big">' + total + '<small style="font-size:1.1rem;color:var(--muted)">/100 · ' + band[0] + '</small></p><p>' + band[1] + '</p>' +
        '<div class="pillar-bars">' + PILLARS.map(function (p) { return '<div><span>' + (p === 'Love' ? 'Relationships' : p) + '</span><span class="bar"><i style="width:' + per[p] + '%;background:var(--' + p.toLowerCase() + ')"></i></span><span>' + per[p] + '</span></div>'; }).join('') + '</div>' +
        '<div class="tips"><strong>Your biggest lever: ' + (low === 'Love' ? 'Relationships' : low) + ' (' + per[low] + ')</strong><p style="margin:6px 0 0">' + ADVICE[low] + '</p><p style="margin:8px 0 0"><a href="' + LINKS[low][0] + '">Read the guide</a> · <a href="' + LINKS[low][1] + '">Use the tool</a></p></div>' +
        '<p style="margin-top:14px">Your strongest area is <strong>' + (high === 'Love' ? 'Relationships' : high) + '</strong>. Second lever: <strong>' + (sorted[1] === 'Love' ? 'Relationships' : sorted[1]) + '</strong>. ' + ADVICE[sorted[1]] + '</p>' +
        '<p style="display:flex;gap:10px;flex-wrap:wrap;margin-top:18px"><a class="btn btn-sun" href="plan.html?focus=' + encodeURIComponent(low === 'Love' ? 'Mind' : low) + '&src=life-score">Get my free plan for ' + (low === 'Love' ? 'Relationships' : low) + '</a><button type="button" class="btn btn-ghost" data-share-native>Share my score</button><button type="button" class="chip" data-restart>Retake</button></p></div>';
      var em = $('#emailResults'); if (em) em.hidden = false;
    }
    render();
  };

  /* ---------- 2. Life in weeks ---------- */
  T['life-in-weeks'] = function () {
    persist('weeks');
    live(function () {
      var bd = $('#lwBirth').value, exp = val('lwExp') || 80;
      if (!bd) { out('result', '<p class="muted">Enter your birth date to see your life in weeks.</p>'); return; }
      var b = new Date(bd + 'T00:00:00'), now = new Date();
      if (b > now) { out('result', '<p>That date is in the future.</p>'); return; }
      var lived = Math.floor((now - b) / (7 * 864e5)), total = Math.round(exp * 52), left = Math.max(0, total - lived);
      var age = (now - b) / (365.25 * 864e5);
      var nb = new Date(now.getFullYear(), b.getMonth(), b.getDate()); if (nb < now) nb.setFullYear(nb.getFullYear() + 1);
      var toBd = Math.ceil((nb - now) / 864e5);
      var milestones = { 18: 1, 30: 1, 40: 1, 50: 1, 65: 1 };
      var cells = '';
      for (var w = 0; w < total; w++) {
        var cls = w < lived ? 'l' : w === lived ? 'now' : (milestones[w / 52] ? 'm' : '');
        cells += '<i class="' + cls + '"></i>';
      }
      var summers = Math.max(0, Math.floor(exp - age));
      out('result', '<p class="eyebrow">Your life so far</p><p class="result-big">' + num(lived) + ' weeks</p><p class="result-sub">' + num(age, 1) + ' years · ' + Math.min(100, (lived / total * 100)).toFixed(1) + '% of a ' + exp + '-year life</p>' +
        '<div class="kpis">' + kpi('Weeks ahead', num(left)) + kpi('Days lived', num(Math.floor((now - b) / 864e5))) + kpi('Summers ahead (approx.)', num(summers)) + kpi('Next birthday', toBd === 365 || toBd === 0 ? 'Today! 🎉' : 'in ' + toBd + ' days') + kpi('Heartbeats (approx.)', short(Math.floor((now - b) / 6e4) * 70)) + kpi('Full moons seen', num(Math.floor((now - b) / (29.53 * 864e5)))) + '</div>' +
        '<div class="weeks" aria-label="Grid of ' + total + ' weeks, ' + lived + ' lived">' + cells + '</div><div class="legend"><span style="--c:var(--ink-2)">Lived</span><span style="--c:var(--coral)">This week</span><span style="--c:var(--sun)">Milestone birthdays</span><span style="--c:#eadfcd">Ahead</span></div>' +
        '<div class="tips"><strong>Make the next 52 count.</strong> If you spent just 3 hours a week on one goal, that is ' + num(left * 3) + ' hours over the rest of your life — enough to master several skills.</div>');
    });
  };

  /* ---------- 3. Retirement & FIRE ---------- */
  T.retirement = function () {
    persist('ret');
    live(function () {
      var age = val('rAge'), ra = val('rRetire'), bal = val('rSaved'), m = val('rMonthly'), r = val('rReturn') / 100, inf = val('rInfl') / 100, spend = val('rSpend'), wr = val('rWithdraw') / 100 || 0.04;
      var yrs = Math.max(0, ra - age), data = [], need = [], b = bal;
      for (var y = 0; y <= yrs; y++) { data.push(b); need.push(spend * Math.pow(1 + inf, y) / wr); b = b * (1 + r) + m * 12; }
      var proj = data[data.length - 1] || bal;
      var target = spend * Math.pow(1 + inf, yrs) / wr;
      var real = proj / Math.pow(1 + inf, yrs);
      var gap = target - proj;
      var fv = Math.pow(1 + r, yrs), annuity = r ? (fv - 1) / r : yrs;
      var reqMonthly = gap > 0 && yrs > 0 ? Math.max(0, (target - bal * fv) / annuity / 12) : 0;
      var fireAge = null; b = bal;
      for (var k = 0; k <= 60; k++) { if (b >= spend * Math.pow(1 + inf, k) / wr) { fireAge = age + k; break; } b = b * (1 + r) + m * 12; }
      out('result', '<p class="eyebrow">At age ' + ra + ' you could have</p><p class="result-big">' + money(proj) + '</p><p class="result-sub">≈ ' + money(real) + ' in today\'s money</p>' +
        '<div class="bar"><i style="width:' + Math.min(100, proj / target * 100).toFixed(0) + '%"></i></div><p class="result-sub">' + Math.min(100, proj / target * 100).toFixed(0) + '% of your target nest egg of ' + money(target) + '</p>' +
        '<div class="kpis">' + kpi('Your FIRE number today', money(spend / wr)) + kpi('Financial independence age', fireAge ? fireAge : '60+ yrs away') + kpi(gap > 0 ? 'Shortfall' : 'Surplus', money(Math.abs(gap))) + kpi('Monthly saving needed', gap > 0 ? money(reqMonthly) : 'On track ✓') + '</div><div id="rChart"></div>' +
        '<div class="tips"><strong>What moves the needle most</strong><ul><li>Each extra ' + money(100) + '/month adds ≈ ' + money(100 * 12 * annuity) + ' by ' + ra + '.</li><li>Retiring 2 years later adds ≈ ' + money(proj * Math.pow(1 + r, 2) + m * 24 - proj) + ' and shortens the drawdown.</li><li>Fees matter: 1% a year can cost a quarter of your final balance over 30+ years.</li></ul></div>');
      lineChart($('#rChart'), [{ name: 'Projected savings', data: data, color: '#16b8a6', fill: true }, { name: 'Nest egg needed', data: need, color: '#ff5a4e' }], { label: 'Savings projection', xl: ['Age ' + age, 'Age ' + ra] });
    });
  };

  /* ---------- 4. Budget 50/30/20 ---------- */
  T.budget = function () {
    persist('budget');
    live(function () {
      var inc = val('bIncome'), needs = val('bNeeds'), wants = val('bWants'), save = val('bSave');
      var tN = inc * .5, tW = inc * .3, tS = inc * .2, used = needs + wants + save, left = inc - used;
      function row(n, a, t, c) { var pct = inc ? a / inc * 100 : 0; return '<tr><td><strong>' + n + '</strong></td><td>' + money(t) + '</td><td>' + money(a) + '</td><td style="color:' + (c(a, t) ? 'var(--mint)' : 'var(--coral)') + ';font-weight:700">' + pct.toFixed(0) + '%</td></tr>'; }
      out('result', '<p class="eyebrow">Your 50/30/20 targets</p><p class="result-big">' + money(tS) + '<small style="font-size:1rem;color:var(--muted)"> / month to savings & debt</small></p>' +
        '<div class="table-wrap"><table class="table"><tr><th>Bucket</th><th>Target</th><th>You</th><th>Share</th></tr>' + row('Needs (50%)', needs, tN, function (a, t) { return a <= t; }) + row('Wants (30%)', wants, tW, function (a, t) { return a <= t; }) + row('Savings & debt (20%)', save, tS, function (a, t) { return a >= t; }) + '</table></div>' +
        '<div class="kpis">' + kpi('Unassigned money', money(left)) + kpi('Savings rate', inc ? (save / inc * 100).toFixed(0) + '%' : '—') + kpi('Yearly savings', money(save * 12)) + kpi('Saved in 10 yrs at 6%', money(save * 12 * ((Math.pow(1.06, 10) - 1) / .06))) + '</div>' +
        '<div class="tips"><strong>Quick read</strong><ul>' + (needs > tN ? '<li>Needs are ' + money(needs - tN) + ' over target: housing, transport and insurance are the big three to renegotiate.</li>' : '<li>Needs are within target. Nice.</li>') + (wants > tW ? '<li>Wants are ' + money(wants - tW) + ' over: cancel one subscription and set a weekly fun budget.</li>' : '') + (save < tS ? '<li>Automate ' + money(tS - save) + ' more on payday so savings happen first.</li>' : '<li>You are saving at least 20%. Point the extra at investments or debt.</li>') + (left < 0 ? '<li>You are spending ' + money(-left) + ' more than you earn each month. Fix this first.</li>' : '') + '</ul></div>');
    });
  };

  /* ---------- 5. Net worth ---------- */
  T['net-worth'] = function () {
    persist('nw');
    live(function () {
      var A = ['nwCash', 'nwInvest', 'nwRetire', 'nwHome', 'nwCar', 'nwOther'].reduce(function (s, id) { return s + val(id); }, 0);
      var L = ['nwMortgage', 'nwCarLoan', 'nwStudent', 'nwCards', 'nwOtherDebt'].reduce(function (s, id) { return s + val(id); }, 0);
      var nw = A - L, age = val('nwAge'), inc = val('nwIncome');
      var stanley = age && inc ? age * inc / 10 : 0;
      var hist = store.get('nw_hist', []);
      out('result', '<p class="eyebrow">Your net worth</p><p class="result-big" style="color:' + (nw < 0 ? 'var(--coral)' : 'var(--ink)') + '">' + money(nw) + '</p>' +
        '<div class="kpis">' + kpi('Total assets', money(A)) + kpi('Total debts', money(L)) + kpi('Debt-to-asset ratio', A ? (L / A * 100).toFixed(0) + '%' : '—') + kpi('"Wealth benchmark" (age × income ÷ 10)', stanley ? money(stanley) : 'add age & income') + '</div>' +
        (stanley ? '<div class="bar"><i style="width:' + Math.max(0, Math.min(100, nw / stanley * 100)).toFixed(0) + '%"></i></div><p class="result-sub">' + Math.max(0, nw / stanley * 100).toFixed(0) + '% of the classic benchmark from <em>The Millionaire Next Door</em>.</p>' : '') +
        '<p><button type="button" class="btn btn-ink btn-sm" id="nwSave">Save this snapshot</button></p>' +
        (hist.length ? '<div class="table-wrap"><table class="table"><tr><th>Date</th><th>Net worth</th></tr>' + hist.slice(-8).reverse().map(function (h) { return '<tr><td>' + esc(h.d) + '</td><td>' + money(h.v) + '</td></tr>'; }).join('') + '</table></div>' : '<p class="fine">Save a snapshot each month to track your progress. Snapshots stay in this browser only.</p>'));
      var sb = $('#nwSave');
      if (sb) sb.onclick = function () { hist.push({ d: new Date().toLocaleDateString(), v: nw }); store.set('nw_hist', hist.slice(-36)); H.toast('Snapshot saved'); root.dispatchEvent(new Event('input')); };
    });
  };

  /* ---------- 6. Debt payoff ---------- */
  T['debt-payoff'] = function () {
    persist('debt');
    function simulate(debts, extra, order) {
      debts = debts.map(function (d) { return { n: d.n, b: d.b, r: d.r / 1200, m: d.m }; });
      var month = 0, interest = 0, payoffOrder = [];
      while (debts.some(function (d) { return d.b > 0.01; }) && month < 600) {
        month++;
        var pool = extra;
        debts.forEach(function (d) { if (d.b <= 0) { pool += d.m; return; } var i = d.b * d.r; interest += i; d.b += i; var p = Math.min(d.m, d.b); d.b -= p; pool += d.m - p; });
        var live = debts.filter(function (d) { return d.b > 0.01; }).sort(order);
        live.forEach(function (d) { var p = Math.min(pool, d.b); d.b -= p; pool -= p; });
        debts.forEach(function (d) { if (d.b <= 0.01 && payoffOrder.indexOf(d.n) < 0) { payoffOrder.push(d.n); d.b = 0; } });
      }
      return { months: month, interest: interest, order: payoffOrder };
    }
    live(function () {
      var debts = [];
      for (var k = 1; k <= 5; k++) { var b = val('d' + k + 'b'); if (b > 0) debts.push({ n: ($('#d' + k + 'n').value || 'Debt ' + k), b: b, r: val('d' + k + 'r'), m: Math.max(val('d' + k + 'm'), 1) }); }
      var extra = val('dExtra');
      if (!debts.length) { out('result', '<p class="muted">Add at least one debt.</p>'); return; }
      var stuck = debts.filter(function (d) { return d.m <= d.b * d.r / 1200; });
      if (stuck.length && !extra) { out('result', '<p>The minimum payment on <strong>' + esc(stuck[0].n) + '</strong> does not cover its interest, so it will never be paid off. Raise the payment or add an extra amount.</p>'); return; }
      var av = simulate(debts, extra, function (a, b) { return b.r - a.r; });
      var sn = simulate(debts, extra, function (a, b) { return a.b - b.b; });
      var base = simulate(debts, 0, function (a, b) { return b.r - a.r; });
      var total = debts.reduce(function (s, d) { return s + d.b; }, 0);
      var df = new Date(); df.setMonth(df.getMonth() + av.months);
      out('result', '<p class="eyebrow">Debt-free date (avalanche)</p><p class="result-big">' + df.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) + '</p><p class="result-sub">' + Math.floor(av.months / 12) + ' yrs ' + (av.months % 12) + ' mos to clear ' + money(total) + '</p>' +
        '<div class="table-wrap"><table class="table"><tr><th>Method</th><th>Months</th><th>Total interest</th><th>Payoff order</th></tr><tr><td><strong>Avalanche</strong> (highest rate first)</td><td>' + av.months + '</td><td>' + money(av.interest) + '</td><td>' + esc(av.order.join(' → ')) + '</td></tr><tr><td><strong>Snowball</strong> (smallest balance first)</td><td>' + sn.months + '</td><td>' + money(sn.interest) + '</td><td>' + esc(sn.order.join(' → ')) + '</td></tr><tr><td>Minimums only</td><td>' + (base.months >= 600 ? '50+ yrs' : base.months) + '</td><td>' + money(base.interest) + '</td><td>—</td></tr></table></div>' +
        '<div class="tips"><strong>Verdict</strong><ul><li>Avalanche saves ' + money(Math.max(0, sn.interest - av.interest)) + ' versus snowball.</li>' + (extra ? '<li>Your extra ' + money(extra) + '/month saves ' + money(Math.max(0, base.interest - av.interest)) + ' in interest and ' + Math.max(0, base.months - av.months) + ' months.</li>' : '<li>Add even ' + money(50) + '/month extra to see how much faster you finish.</li>') + '<li>If you need quick wins to stay motivated, snowball is fine — finishing beats optimising.</li></ul></div>');
    });
  };

  /* ---------- 7. Compound interest ---------- */
  T['compound-interest'] = function () {
    persist('ci');
    live(function () {
      var P = val('ciP'), M = val('ciM'), r = val('ciR') / 100, y = Math.min(80, Math.round(val('ciY'))), n = +$('#ciN').value || 12;
      var bal = P, contrib = P, rows = [], data = [P], cdata = [P];
      for (var yr = 1; yr <= y; yr++) {
        for (var p = 0; p < n; p++) { bal = bal * (1 + r / n) + M * 12 / n; }
        contrib += M * 12; data.push(bal); cdata.push(contrib);
        rows.push('<tr><td>' + yr + '</td><td>' + money(contrib) + '</td><td>' + money(bal - contrib) + '</td><td><strong>' + money(bal) + '</strong></td></tr>');
      }
      var dbl = r ? Math.log(2) / Math.log(1 + r / n) / n : 0;
      out('result', '<p class="eyebrow">After ' + y + ' years</p><p class="result-big">' + money(bal) + '</p><div class="kpis">' + kpi('You put in', money(contrib)) + kpi('Interest earned', money(bal - contrib)) + kpi('Money doubles every', dbl ? num(dbl, 1) + ' yrs' : '—') + kpi('Interest share of total', bal ? ((bal - contrib) / bal * 100).toFixed(0) + '%' : '—') + '</div><div id="ciChart"></div><details><summary>Year-by-year table</summary><div class="table-wrap"><table class="table"><tr><th>Year</th><th>Contributed</th><th>Interest</th><th>Balance</th></tr>' + rows.join('') + '</table></div></details>');
      lineChart($('#ciChart'), [{ name: 'Balance', data: data, color: '#16b8a6', fill: true }, { name: 'Your contributions', data: cdata, color: '#ffb703' }], { label: 'Growth chart', xl: ['Year 0', 'Year ' + y] });
    });
  };

  /* ---------- 8. Emergency fund ---------- */
  T['emergency-fund'] = function () {
    persist('ef');
    live(function () {
      var exp = val('efExp'), have = val('efHave'), save = val('efSave');
      var months = 3 + (+$('#efJob').value) + (+$('#efDeps').value) + (+$('#efEarners').value);
      months = Math.max(3, Math.min(12, months));
      var target = exp * months, gap = Math.max(0, target - have), t = save > 0 ? Math.ceil(gap / save) : null;
      out('result', '<p class="eyebrow">Your emergency fund target</p><p class="result-big">' + money(target) + '</p><p class="result-sub">' + months + ' months of essential costs</p><div class="bar"><i style="width:' + Math.min(100, target ? have / target * 100 : 0).toFixed(0) + '%"></i></div><p class="result-sub">' + (target ? Math.min(100, have / target * 100).toFixed(0) : 0) + '% funded</p>' +
        '<div class="kpis">' + kpi('Still to save', money(gap)) + kpi('Time to fully funded', gap === 0 ? 'Done ✓' : t ? (t >= 12 ? Math.floor(t / 12) + ' yr ' + (t % 12) + ' mo' : t + ' months') : 'add a monthly amount') + kpi('Starter goal (1 month)', money(exp)) + kpi('You are covered for', exp ? num(have / exp, 1) + ' months' : '—') + '</div>' +
        '<div class="tips"><strong>Where to keep it</strong><ul><li>A separate high-yield savings account you can reach in 1–2 days, not invested in stocks.</li><li>Automate the transfer on payday and name the account "Do not touch".</li><li>Once funded, redirect the same amount to investing.</li></ul></div>');
    });
  };

  /* ---------- 9. Life insurance needs (DIME) ---------- */
  T['life-insurance'] = function () {
    persist('li');
    live(function () {
      var debts = val('liDebts'), inc = val('liIncome'), yrs = val('liYears'), mort = val('liMortgage'), edu = val('liEdu'), fin = val('liFinal'), have = val('liHave'), sav = val('liSavings');
      var need = debts + inc * yrs + mort + edu + fin, gap = Math.max(0, need - have - sav);
      var age = val('liAge'), term = Math.max(10, Math.min(30, Math.ceil(yrs / 5) * 5));
      out('result', '<p class="eyebrow">Estimated coverage gap</p><p class="result-big">' + money(gap) + '</p><p class="result-sub">Total need ' + money(need) + ' − existing cover and savings ' + money(have + sav) + '</p>' +
        '<div class="table-wrap"><table class="table"><tr><th>DIME component</th><th>Amount</th></tr><tr><td>Debts & final expenses</td><td>' + money(debts + fin) + '</td></tr><tr><td>Income replacement (' + yrs + ' yrs)</td><td>' + money(inc * yrs) + '</td></tr><tr><td>Mortgage</td><td>' + money(mort) + '</td></tr><tr><td>Education</td><td>' + money(edu) + '</td></tr></table></div>' +
        '<div class="kpis">' + kpi('Suggested policy type', gap ? term + '-year term' : 'Review in 2 yrs') + kpi('Rule-of-thumb check (10× income)', money(inc * 10)) + '</div>' +
        '<div class="tips"><strong>Next steps</strong><ul><li>Term life is usually the cheapest way to cover a temporary need like a mortgage or raising kids.' + (age && age < 45 ? ' Rates rise with age, so locking in sooner is usually cheaper.' : '') + '</li><li>Compare quotes from at least three insurers; health, smoking and term length drive price.</li><li>Check any cover through work — it often ends when you leave the job.</li></ul></div>');
    });
  };

  /* ---------- 10. Home affordability ---------- */
  T['home-affordability'] = function () {
    persist('home');
    live(function () {
      var inc = val('hIncome') / 12, debts = val('hDebts'), down = val('hDown'), r = val('hRate') / 1200, n = val('hTerm') * 12, tax = val('hTax') / 100 / 12, ins = val('hIns') / 12, hoa = val('hHoa');
      var maxHousing = Math.min(inc * .28, inc * .36 - debts);
      function paymentFor(price) { var L = Math.max(0, price - down); var pi = r ? L * r / (1 - Math.pow(1 + r, -n)) : L / n; return pi + price * tax + ins + hoa; }
      var lo = 0, hi = 1e8;
      for (var k = 0; k < 80; k++) { var mid = (lo + hi) / 2; if (paymentFor(mid) > maxHousing) hi = mid; else lo = mid; }
      var price = maxHousing > 0 ? lo : 0, pay = paymentFor(price);
      var cons = 0; lo = 0; hi = 1e8; var consMax = Math.min(inc * .25, inc * .33 - debts);
      for (k = 0; k < 80; k++) { mid = (lo + hi) / 2; if (paymentFor(mid) > consMax) hi = mid; else lo = mid; } cons = consMax > 0 ? lo : 0;
      out('result', '<p class="eyebrow">You can likely afford up to</p><p class="result-big">' + money(price) + '</p><p class="result-sub">Monthly payment ≈ ' + money(pay) + ' (28/36 rule)</p>' +
        '<div class="kpis">' + kpi('Comfortable price (25/33)', money(cons)) + kpi('Loan amount', money(Math.max(0, price - down))) + kpi('Down payment share', price ? (down / price * 100).toFixed(1) + '%' : '—') + kpi('Total interest over loan', money(Math.max(0, (pay - price * tax - ins - hoa) * n - Math.max(0, price - down)))) + '</div>' +
        '<div class="tips"><strong>Before you shop</strong><ul>' + (price && down / price < .2 ? '<li>Under 20% down usually means mortgage insurance; budget for it or save longer.</li>' : '') + '<li>Keep 3–6 months of expenses in cash after closing.</li><li>A 0.5% lower rate on this loan changes the payment by roughly ' + money(Math.abs(paymentFor(price) - (function () { var r2 = r - .005 / 12, L = Math.max(0, price - down); return (r2 > 0 ? L * r2 / (1 - Math.pow(1 + r2, -n)) : L / n) + price * tax + ins + hoa; })())) + ' a month — compare at least three lenders.</li></ul></div>');
    });
  };

  /* ---------- 11. Salary converter ---------- */
  T.salary = function () {
    persist('sal');
    live(function () {
      var amt = val('sAmt'), per = $('#sPer').value, hrs = val('sHours') || 40, wks = val('sWeeks') || 52, tax = val('sTax') / 100;
      var yr = per === 'hour' ? amt * hrs * wks : per === 'day' ? amt * 5 * wks : per === 'week' ? amt * wks : per === 'month' ? amt * 12 : amt;
      var rows = [['Hourly', yr / wks / hrs], ['Daily (5-day week)', yr / wks / 5], ['Weekly', yr / wks], ['Bi-weekly', yr / 26], ['Monthly', yr / 12], ['Yearly', yr]];
      out('result', '<p class="eyebrow">Annual equivalent</p><p class="result-big">' + money(yr) + '</p><div class="table-wrap"><table class="table"><tr><th>Period</th><th>Gross</th><th>After ~' + (tax * 100).toFixed(0) + '% tax</th></tr>' + rows.map(function (x) { return '<tr><td>' + x[0] + '</td><td>' + money(x[1], x[1] < 1000 ? 2 : 0) + '</td><td>' + money(x[1] * (1 - tax), x[1] < 1000 ? 2 : 0) + '</td></tr>'; }).join('') + '</table></div><div class="tips">A 5% raise on this salary is worth ' + money(yr * .05) + ' a year, and about ' + money(yr * .05 * ((Math.pow(1.03, 20) - 1) / .03)) + ' over 20 years with normal 3% raises on top. Always negotiate.</div>');
    });
  };

  /* ---------- 12. Calories & BMI ---------- */
  T.calories = function () {
    persist('cal');
    live(function () {
      var metric = $('#cUnits').value === 'metric';
      $$('.imp', root).forEach(function (e) { e.hidden = metric; });
      $$('.met', root).forEach(function (e) { e.hidden = !metric; });
      var age = val('cAge'), male = $('#cSex').value === 'm', act = +$('#cAct').value;
      var cm = metric ? val('cCm') : (val('cFt') * 12 + val('cIn')) * 2.54;
      var kg = metric ? val('cKg') : val('cLb') * 0.4536;
      if (!cm || !kg || !age) { out('result', '<p class="muted">Fill in age, height and weight.</p>'); return; }
      var bmi = kg / Math.pow(cm / 100, 2);
      var bmr = 10 * kg + 6.25 * cm - 5 * age + (male ? 5 : -161), tdee = bmr * act;
      var cat = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Healthy range' : bmi < 30 ? 'Overweight' : 'Obesity range';
      var lo = 18.5 * Math.pow(cm / 100, 2), hi = 24.9 * Math.pow(cm / 100, 2);
      function w(k) { return metric ? num(k, 1) + ' kg' : num(k / 0.4536, 0) + ' lb'; }
      out('result', '<p class="eyebrow">Maintenance calories</p><p class="result-big">' + num(tdee) + ' kcal/day</p><div class="kpis">' + kpi('BMI', num(bmi, 1) + ' · ' + cat) + kpi('Healthy weight range', w(lo) + ' – ' + w(hi)) + kpi('Gentle loss (~0.25 kg/wk)', num(tdee - 275) + ' kcal') + kpi('Steady loss (~0.5 kg/wk)', num(Math.max(male ? 1500 : 1200, tdee - 550)) + ' kcal') + kpi('Lean gain', num(tdee + 250) + ' kcal') + kpi('Protein target (1.6 g/kg)', num(kg * 1.6) + ' g') + '</div><p class="fine">Estimates use the Mifflin–St Jeor equation. BMI does not account for muscle, age or ethnicity. Not medical advice — speak with a doctor or registered dietitian about your goals, especially if you are pregnant, under 18 or have a health condition.</p>');
    });
  };

  /* ---------- 13. Sleep cycles ---------- */
  T.sleep = function () {
    persist('sleep');
    live(function () {
      var mode = $('#slMode').value, t = $('#slTime').value || '07:00', fall = val('slFall') || 15;
      var p = t.split(':'), base = new Date(); base.setHours(+p[0], +p[1], 0, 0);
      function f(d) { return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); }
      var list = [];
      for (var c = 6; c >= 3; c--) {
        var d = new Date(base.getTime() + (mode === 'wake' ? -1 : 1) * (c * 90 + fall) * 6e4);
        list.push('<div class="kpi"><span>' + c + ' cycles · ' + (c * 1.5) + ' h sleep' + (c >= 5 ? ' · recommended' : '') + '</span><b>' + f(d) + '</b></div>');
      }
      out('result', '<p class="eyebrow">' + (mode === 'wake' ? 'To wake at ' + f(base) + ', fall asleep by…' : 'Going to bed at ' + f(base) + '? Set an alarm for…') + '</p><div class="kpis">' + list.join('') + '</div><div class="tips"><strong>Why cycles?</strong> Sleep runs in roughly 90-minute cycles. Waking at the end of a cycle, rather than in deep sleep, usually feels easier. Adults need 7–9 hours; a fixed wake-up time matters more than a perfect bedtime.</div>');
    });
  };

  /* ---------- 14. Habit tracker ---------- */
  T['habit-tracker'] = function () {
    var habits = store.get('habits', [{ n: 'Walk 20 minutes', d: {} }, { n: 'Read 10 pages', d: {} }, { n: 'No phone in bed', d: {} }]);
    function key(d) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
    function save() { store.set('habits', habits); }
    function streak(h) { var s = 0, d = new Date(); if (!h.d[key(d)]) d.setDate(d.getDate() - 1); while (h.d[key(d)]) { s++; d.setDate(d.getDate() - 1); } return s; }
    function draw() {
      var days = [], d = new Date(); d.setDate(d.getDate() - 13);
      for (var k = 0; k < 14; k++) { days.push(new Date(d)); d.setDate(d.getDate() + 1); }
      out('result', '<div class="table-wrap"><table class="table"><tr><th>Habit</th>' + days.map(function (x) { return '<th style="text-align:center;padding:6px 2px">' + 'SMTWTFS'[x.getDay()] + '<br>' + x.getDate() + '</th>'; }).join('') + '<th>Streak</th><th></th></tr>' +
        habits.map(function (h, i) { return '<tr><td><strong>' + esc(h.n) + '</strong></td>' + days.map(function (x) { var on = h.d[key(x)]; return '<td style="text-align:center;padding:4px 2px"><button type="button" data-h="' + i + '" data-d="' + key(x) + '" aria-pressed="' + !!on + '" aria-label="' + esc(h.n) + ' ' + x.toDateString() + '" style="width:26px;height:26px;border-radius:8px;border:1.5px solid ' + (on ? 'var(--mint)' : 'var(--line)') + ';background:' + (on ? 'var(--mint)' : '#fff') + ';color:#fff;cursor:pointer">' + (on ? '✓' : '') + '</button></td>'; }).join('') + '<td><strong>' + streak(h) + '🔥</strong></td><td><button type="button" class="chip" data-del="' + i + '" aria-label="Delete ' + esc(h.n) + '">×</button></td></tr>'; }).join('') + '</table></div>' +
        '<p class="fine">Habits are saved in this browser only. Tap a square to mark a day done.</p>');
    }
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-h]');
      if (b) { var h = habits[+b.getAttribute('data-h')], k = b.getAttribute('data-d'); if (h.d[k]) delete h.d[k]; else h.d[k] = 1; save(); draw(); return; }
      var x = e.target.closest('[data-del]');
      if (x) { habits.splice(+x.getAttribute('data-del'), 1); save(); draw(); }
    });
    var add = $('#habitAdd');
    if (add) add.addEventListener('submit', function (e) { e.preventDefault(); var i = $('#habitName'); if (i.value.trim()) { habits.push({ n: i.value.trim().slice(0, 60), d: {} }); i.value = ''; save(); draw(); } });
    draw();
  };

  if (T[tool]) T[tool]();
})();
