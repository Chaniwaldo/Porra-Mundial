document.addEventListener('DOMContentLoaded', () => {
  const matchesCol = db.collection('matches');
  const predictionsCol = db.collection('predictions');
  const metaCol = db.collection('meta');
  let matchesCache = [];
  let bonusOfficial = {};

  const STATIC_DAYS = [
    { key: 'bonus', label: 'Jornada 0 · Bonus del torneo', sort: '2026-06-01' },
    { key: '2026-06-11', label: 'Jornada 1: 11/06/2026', sort: '2026-06-11' },
    { key: '2026-06-12', label: 'Jornada 1: 12/06/2026', sort: '2026-06-12' },
    { key: '2026-06-13', label: 'Jornada 1: 13/06/2026', sort: '2026-06-13' },
    { key: '2026-06-14', label: 'Jornada 1: 14/06/2026', sort: '2026-06-14' },
    { key: '2026-06-15', label: 'Jornada 1: 15/06/2026', sort: '2026-06-15' },
    { key: '2026-06-16', label: 'Jornada 1: 16/06/2026', sort: '2026-06-16' },
    { key: '2026-06-17', label: 'Jornada 1: 17/06/2026', sort: '2026-06-17' },
    { key: '2026-06-18', label: 'Jornada 1: 18/06/2026', sort: '2026-06-18' },
    { key: '2026-06-19', label: 'Jornada 2: 19/06/2026', sort: '2026-06-19' },
    { key: '2026-06-20', label: 'Jornada 2: 20/06/2026', sort: '2026-06-20' },
    { key: '2026-06-21', label: 'Jornada 2: 21/06/2026', sort: '2026-06-21' },
    { key: '2026-06-22', label: 'Jornada 2: 22/06/2026', sort: '2026-06-22' },
    { key: '2026-06-23', label: 'Jornada 2: 23/06/2026', sort: '2026-06-23' },
    { key: '2026-06-24', label: 'Jornada 2: 24/06/2026', sort: '2026-06-24' },
    { key: '2026-06-25', label: 'Jornada 3: 25/06/2026', sort: '2026-06-25' },
    { key: '2026-06-26', label: 'Jornada 3: 26/06/2026', sort: '2026-06-26' },
    { key: '2026-06-27', label: 'Jornada 3: 27/06/2026', sort: '2026-06-27' },
    { key: '2026-06-28', label: 'Jornada 4: 28/06/2026', sort: '2026-06-28' },
    { key: '2026-06-29', label: 'Jornada 4: 29/06/2026', sort: '2026-06-29' },
    { key: '2026-06-30', label: 'Jornada 4: 30/06/2026', sort: '2026-06-30' },
    { key: '2026-07-01', label: 'Jornada 4: 01/07/2026', sort: '2026-07-01' },
    { key: '2026-07-03', label: 'Jornada 5: 03/07/2026', sort: '2026-07-03' },
    { key: '2026-07-04', label: 'Jornada 5: 04/07/2026', sort: '2026-07-04' },
    { key: '2026-07-05', label: 'Jornada 5: 05/07/2026', sort: '2026-07-05' },
    { key: '2026-07-06', label: 'Jornada 5: 06/07/2026', sort: '2026-07-06' },
    { key: '2026-07-09', label: 'Jornada 6: 09/07/2026', sort: '2026-07-09' },
    { key: '2026-07-10', label: 'Jornada 6: 10/07/2026', sort: '2026-07-10' },
    { key: '2026-07-14', label: 'Jornada 7: 14/07/2026', sort: '2026-07-14' },
    { key: '2026-07-15', label: 'Jornada 7: 15/07/2026', sort: '2026-07-15' },
    { key: '2026-07-18', label: 'Jornada 8: 18/07/2026', sort: '2026-07-18' },
    { key: '2026-07-19', label: 'Jornada 8: 19/07/2026', sort: '2026-07-19' }
  ];

  function resultSign(a, b) {
    if (a == null || b == null) return null;
    if (a > b) return 'A'; if (b > a) return 'B'; return 'D';
  }
  function norm(s) {
    return (s || '').toString().trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
  function containsApprox(a, b) {
    const x = norm(a), y = norm(b);
    if (!x || !y) return false;
    if (x === y) return true;
    const short = x.length <= y.length ? x : y;
    const long  = x.length <= y.length ? y : x;
    if (short.length < 4) return short === long;
    for (let i = 0; i <= short.length - 4; i++) {
      if (long.includes(short.slice(i, i + 4))) return true;
    }
    return false;
  }
  function showStatus(msg, type = 'info') {
    const el = document.getElementById('db-status');
    if (!el) return;
    el.textContent = msg; el.style.display = 'block';
    el.style.background = type === 'error' ? '#fee2e2' : '#d1fae5';
    setTimeout(() => { el.style.display = 'none'; }, 3500);
  }
  function sortedMatches(arr) {
    return [...arr].sort((a, b) =>
      ((a.date || '') + ' ' + (a.time || '00:00'))
        .localeCompare((b.date || '') + ' ' + (b.time || '00:00')));
  }

  async function seedMatchesIfEmpty() {
    const snap = await matchesCol.limit(1).get();
    if (!snap.empty) return;
    const batch = db.batch();
    INITIAL_MATCHES.forEach(m => batch.set(matchesCol.doc(m.id), m));
    await batch.commit();
  }

  async function loadBonusOfficial() {
    const doc = await metaCol.doc('bonusOfficial').get();
    bonusOfficial = doc.exists ? (doc.data() || {}) : {};
    ['mvp','topscorer','finalist1','finalist2','champion','gk','topteam'].forEach(k => {
      const el = document.getElementById('official-' + k);
      if (el) el.value = bonusOfficial[k] || '';
    });
    for (let i = 1; i <= 10; i++) {
      const el = document.getElementById('official-best11-' + i);
      if (el) el.value = (bonusOfficial.best11 && bonusOfficial.best11[i - 1]) || '';
    }
  }

  function getDayOptions(matches) {
    const map = new Map();
    STATIC_DAYS.forEach(d => map.set(d.key, { label: d.label, sort: d.sort }));
    matches.forEach(m => {
      if (!m.date) return;
      const dateLabel  = m.date.split('-').reverse().join('/');
      const jornada    = m.matchday != null ? 'Jornada ' + m.matchday : 'Jornada -';
      const roundLabel = m.roundLabel || m.round || '';
      const label = (roundLabel && roundLabel !== 'group')
        ? jornada + ': ' + dateLabel + ' \xb7 ' + roundLabel
        : jornada + ': ' + dateLabel;
      if (!map.has(m.date)) {
        map.set(m.date, { label, sort: m.date });
      } else {
        const prev = map.get(m.date);
        if (roundLabel && roundLabel !== 'group' && !prev.label.includes(roundLabel))
          map.set(m.date, { label: prev.label + ' \xb7 ' + roundLabel, sort: m.date });
      }
    });
    return Array.from(map.entries())
      .map(([key, v]) => ({ key, label: v.label, sort: v.sort }))
      .sort((a, b) => a.sort.localeCompare(b.sort));
  }

  function populateDaySelect(matches) {
    const select = document.getElementById('day-select');
    if (!select) return;
    const options = getDayOptions(matches);
    const current = select.value;
    select.innerHTML = '<option value="">Selecciona d\xeda o jornada</option>';
    options.forEach(opt => {
      const o = document.createElement('option');
      o.value = opt.key; o.textContent = opt.label; select.appendChild(o);
    });
    if (options.some(o => o.key === current)) select.value = current;
    else if (options.length) select.value = options[0].key;
  }

  function renderBonusForm(container) {
    container.innerHTML = '<div class="bonus-box">'
      + '<h3>Jornada 0 \xb7 Bonus del torneo</h3>'
      + '<p class="small">Cl\xe1sicos: MVP 10, Pichichi 10, Finalista 1 y 2 (10 c/u), Campe\xf3n 20.<br>'
      + 'Nuevos: Mejor portero 5, Selecci\xf3n m\xe1s goleadora 5, Mejor once 3 por jugador acertado.<br>'
      + 'Portero, selecci\xf3n y jugadores admiten coincidencia aproximada (cadena de 4 letras).</p>'
      + '<div class="grid-2"><div class="field"><label for="bonus-mvp">MVP</label><input type="text" id="bonus-mvp" required /></div>'
      + '<div class="field"><label for="bonus-topscorer">Pichichi</label><input type="text" id="bonus-topscorer" required /></div></div>'
      + '<div class="grid-2"><div class="field"><label for="bonus-finalist1">Finalista 1</label><input type="text" id="bonus-finalist1" required /></div>'
      + '<div class="field"><label for="bonus-finalist2">Finalista 2</label><input type="text" id="bonus-finalist2" required /></div></div>'
      + '<div class="field"><label for="bonus-champion">Campe\xf3n</label><input type="text" id="bonus-champion" required /></div>'
      + '<div class="grid-2"><div class="field"><label for="bonus-gk">Mejor portero</label><input type="text" id="bonus-gk" required /></div>'
      + '<div class="field"><label for="bonus-topteam">Selecci\xf3n m\xe1s goleadora</label><input type="text" id="bonus-topteam" required /></div></div>'
      + '<div class="field"><label>Mejor once (sin portero \xb7 10 jugadores de campo)</label></div>'
      + [1,2,3,4,5,6,7,8,9,10].reduce((acc, i) => {
          const pair = i % 2 === 1;
          if (pair) acc += '<div class="grid-2">';
          acc += '<div class="field"><input type="text" id="bonus-best11-' + i + '" placeholder="Jugador ' + i + '" required /></div>';
          if (!pair) acc += '</div>';
          return acc;
        }, '')
      + '</div>';
  }

  function renderSelectedDay(matches) {
    const container = document.getElementById('next-matches-container');
    const select    = document.getElementById('day-select');
    if (!container || !select) return;
    container.innerHTML = '';
    const selected = select.value;
    if (!selected) { container.innerHTML = '<p class="small">Selecciona un d\xeda.</p>'; return; }
    if (selected === 'bonus') { renderBonusForm(container); return; }
    const dayMatches = sortedMatches(matches).filter(m => m.date === selected);
    if (!dayMatches.length) {
      container.innerHTML = '<p class="small">A\xfan no hay partidos para ese d\xeda. El administrador los a\xf1adir\xe1 cuando se conozcan.</p>';
      return;
    }
    const dayOption = getDayOptions(matches).find(o => o.key === selected);
    const head = document.createElement('p');
    head.className = 'small';
    head.textContent = (dayOption ? dayOption.label : selected) + ' \xb7 '
      + dayMatches.length + ' partido' + (dayMatches.length !== 1 ? 's' : '');
    container.appendChild(head);
    dayMatches.forEach(match => {
      const row = document.createElement('div');
      row.className = 'match-row';
      const lbl = document.createElement('div');
      lbl.innerHTML = '<div class="teams">' + match.teamA + ' vs ' + match.teamB + '</div>'
        + '<div class="meta">' + (match.time || '') + ' \xb7 ' + (match.roundLabel || match.round || 'group') + '</div>';
      row.appendChild(lbl);
      ['A', 'B'].forEach(side => {
        const input = document.createElement('input');
        input.type = 'number'; input.min = '0'; input.required = true;
        input.name = 'pred_' + match.id + '_' + side;
        row.appendChild(input);
      });
      container.appendChild(row);
    });
  }

  function renderOfficialResultsForm(matches) {
    const container = document.getElementById('official-results-container');
    if (!container) return;
    container.innerHTML = '';
    const table = document.createElement('table');
    table.innerHTML = '<thead><tr><th>Partido</th><th>Local</th><th>Visit.</th><th></th></tr></thead>';
    const tbody = document.createElement('tbody');
    sortedMatches(matches).forEach(m => {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td><div class="teams">' + m.teamA + ' vs ' + m.teamB + '</div>'
        + '<div class="meta">' + (m.date || '') + ' ' + (m.time || '') + ' \xb7 ' + (m.roundLabel || m.round || 'group') + '</div></td>';
      ['A', 'B'].forEach(side => {
        const td = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'number'; input.min = '0'; input.style.width = '55px';
        input.value = m['score' + side] != null ? m['score' + side] : '';
        input.addEventListener('change', async () => {
          const val = input.value === '' ? null : Number(input.value);
          await matchesCol.doc(m.id).update({ ['score' + side]: val });
          showStatus('Resultado guardado \u2713');
          const fp = document.getElementById('filter-player');
          if (fp && fp.value.trim()) await renderPlayerPredictions(fp.value);
        });
        td.appendChild(input); tr.appendChild(td);
      });
      const td = document.createElement('td');
      td.innerHTML = (m.scoreA != null && m.scoreB != null)
        ? '<span class="badge">Cerrado</span>'
        : '<span class="small muted">Pendiente</span>';
      tr.appendChild(td); tbody.appendChild(tr);
    });
    table.appendChild(tbody); container.appendChild(table);
  }

  async function renderPlayerPredictions(nameFilter) {
    const container = document.getElementById('my-predictions-container');
    if (!container) return;
    const name = (nameFilter || '').trim().toLowerCase();
    if (!name) { container.innerHTML = ''; return; }
    const snap = await predictionsCol.get();
    const rows = [];
    snap.forEach(doc => {
      const d = doc.data();
      if (d.player && d.player.toLowerCase().includes(name)) rows.push(d);
    });
    if (!rows.length) { container.innerHTML = '<p class="small">No se encontraron pron\xf3sticos.</p>'; return; }
    const matchMap = new Map(matchesCache.map(m => [m.id, m]));
    const hasBonus = bonusOfficial && Object.keys(bonusOfficial).length > 0;
    const offFinals = [bonusOfficial.finalist1, bonusOfficial.finalist2].filter(Boolean);
    const bonusKeys = { 'MVP': 'mvp', 'Pichichi': 'topscorer', 'Campe\xf3n': 'champion',
      'Mejor portero': 'gk', 'Selecci\xf3n goleadora': 'topteam' };

    let html = '<table class="pred-table"><thead><tr>'
      + '<th>Tipo</th><th>Pron\xf3stico</th><th>Resultado oficial</th><th>Estado</th>'
      + '</tr></thead><tbody>';

    rows.forEach(r => {
      if (r.type === 'bonus-full') {
        const bonusRows = [
          { label: 'MVP',           val: r.mvp,       officialKey: 'mvp',       pts: 10,
            hit: hasBonus && !!bonusOfficial.mvp && containsApprox(r.mvp, bonusOfficial.mvp),
            pending: !hasBonus || !bonusOfficial.mvp, official: bonusOfficial.mvp || '\u2014' },
          { label: 'Pichichi',      val: r.topscorer, officialKey: 'topscorer', pts: 10,
            hit: hasBonus && !!bonusOfficial.topscorer && containsApprox(r.topscorer, bonusOfficial.topscorer),
            pending: !hasBonus || !bonusOfficial.topscorer, official: bonusOfficial.topscorer || '\u2014' },
          { label: 'Finalista 1',   val: r.finalist1, pts: 10,
            hit: hasBonus && offFinals.length > 0 && offFinals.some(f => containsApprox(r.finalist1, f)),
            pending: !hasBonus || offFinals.length === 0, official: offFinals.join(' / ') || '\u2014' },
          { label: 'Finalista 2',   val: r.finalist2, pts: 10,
            hit: hasBonus && offFinals.length > 0 && offFinals.some(f => containsApprox(r.finalist2, f)),
            pending: !hasBonus || offFinals.length === 0, official: offFinals.join(' / ') || '\u2014' },
          { label: 'Campe\xf3n',        val: r.champion,  officialKey: 'champion',  pts: 20,
            hit: hasBonus && !!bonusOfficial.champion && containsApprox(r.champion, bonusOfficial.champion),
            pending: !hasBonus || !bonusOfficial.champion, official: bonusOfficial.champion || '\u2014' },
          { label: 'Mejor portero', val: r.gk,         officialKey: 'gk',         pts: 5,
            hit: hasBonus && !!bonusOfficial.gk && containsApprox(r.gk, bonusOfficial.gk),
            pending: !hasBonus || !bonusOfficial.gk, official: bonusOfficial.gk || '\u2014' },
          { label: 'Selecci\xf3n goleadora', val: r.topteam, officialKey: 'topteam', pts: 5,
            hit: hasBonus && !!bonusOfficial.topteam && containsApprox(r.topteam, bonusOfficial.topteam),
            pending: !hasBonus || !bonusOfficial.topteam, official: bonusOfficial.topteam || '\u2014' },
        ];
        bonusRows.forEach(f => {
          const cls = f.pending ? '' : (f.hit ? 'pred-hit' : 'pred-miss');
          const badge = f.pending
            ? '<span class="badge-pending">Pendiente</span>'
            : (f.hit ? '<span class="badge-hit">\u2713 +' + f.pts + ' pts</span>' : '<span class="badge-miss">\u2717 0 pts</span>');
          html += '<tr class="' + cls + '"><td>Bonus</td>'
            + '<td>' + f.label + ': <strong>' + f.val + '</strong></td>'
            + '<td>' + f.official + '</td>'
            + '<td>' + badge + '</td></tr>';
        });
        (r.best11 || []).forEach((name11, idx) => {
          const officialOnce = bonusOfficial.best11 || [];
          const hit = hasBonus && officialOnce.length > 0 && officialOnce.some(of => containsApprox(name11, of));
          const pending = !hasBonus || officialOnce.length === 0;
          const cls = pending ? '' : (hit ? 'pred-hit' : 'pred-miss');
          const badge = pending
            ? '<span class="badge-pending">Pendiente</span>'
            : (hit ? '<span class="badge-hit">\u2713 +3 pts</span>' : '<span class="badge-miss">\u2717 0 pts</span>');
          html += '<tr class="' + cls + '"><td>Bonus</td>'
            + '<td>Once #' + (idx + 1) + ': <strong>' + name11 + '</strong></td>'
            + '<td>' + (pending ? '\u2014' : officialOnce.join(', ')) + '</td>'
            + '<td>' + badge + '</td></tr>';
        });
      } else {
        const m = matchMap.get(r.matchId);
        const hasResult = m && m.scoreA != null && m.scoreB != null;
        let cls = '', badge = '', official = '\u2014';
        if (hasResult) {
          official = m.scoreA + ' - ' + m.scoreB;
          if (r.predA === m.scoreA && r.predB === m.scoreB) {
            cls = 'pred-hit'; badge = '<span class="badge-hit">\u2713 Exacto +5</span>';
          } else if (resultSign(r.predA, r.predB) === resultSign(m.scoreA, m.scoreB)) {
            cls = 'pred-hit-partial'; badge = '<span class="badge-hit-partial">\u007e Signo +2</span>';
          } else {
            cls = 'pred-miss'; badge = '<span class="badge-miss">\u2717 0 pts</span>';
          }
        } else {
          badge = '<span class="badge-pending">Pendiente</span>';
        }
        html += '<tr class="' + cls + '"><td>Partido</td>'
          + '<td>' + (m ? m.teamA + ' vs ' + m.teamB : r.matchId) + '<br><strong>' + r.predA + ' - ' + r.predB + '</strong></td>'
          + '<td>' + official + '</td>'
          + '<td>' + badge + '</td></tr>';
      }
    });
    html += '</tbody></table>';
    container.innerHTML = html;
  }

  async function renderStandings(matches) {
    const container = document.getElementById('standings-container');
    if (!container) return;
    const playerScores = new Map();
    const matchMap = new Map(
      matches.filter(m => m.scoreA != null && m.scoreB != null).map(m => [m.id, m])
    );
    const snap = await predictionsCol.get();
    snap.forEach(doc => {
      const pred = doc.data();
      const key  = (pred.player || '').trim();
      if (!key) return;
      if (!playerScores.has(key)) playerScores.set(key, { player: key, points: 0, exact: 0, winner: 0, bonus: 0 });
      const row = playerScores.get(key);
      if (pred.type === 'bonus-full') {
        let pts = 0;
        if (bonusOfficial.mvp && containsApprox(pred.mvp, bonusOfficial.mvp)) pts += 10;
        if (bonusOfficial.topscorer && containsApprox(pred.topscorer, bonusOfficial.topscorer)) pts += 10;
        const offF = [bonusOfficial.finalist1, bonusOfficial.finalist2].filter(Boolean);
        [pred.finalist1, pred.finalist2].forEach(f => { if (f && offF.some(of => containsApprox(f, of))) pts += 10; });
        if (bonusOfficial.champion && containsApprox(pred.champion, bonusOfficial.champion)) pts += 20;
        if (bonusOfficial.gk && containsApprox(pred.gk, bonusOfficial.gk)) pts += 5;
        if (bonusOfficial.topteam && containsApprox(pred.topteam, bonusOfficial.topteam)) pts += 5;
        (pred.best11 || []).forEach(n => { if (n && (bonusOfficial.best11 || []).some(of => containsApprox(n, of))) pts += 3; });
        row.points += pts; row.bonus += pts; return;
      }
      const match = matchMap.get(pred.matchId);
      if (!match) return;
      if (pred.predA === match.scoreA && pred.predB === match.scoreB) { row.points += 5; row.exact += 1; }
      else {
        const os = resultSign(match.scoreA, match.scoreB);
        const ps = resultSign(pred.predA, pred.predB);
        if (os && ps && os === ps) { row.points += 2; row.winner += 1; }
      }
    });
    const rows = Array.from(playerScores.values())
      .sort((a, b) => b.points - a.points || b.exact - a.exact || a.player.localeCompare(b.player, 'es'));
    if (!rows.length) { container.innerHTML = '<p class="small">A\xfan no hay pron\xf3sticos guardados.</p>'; return; }
    const table = document.createElement('table');
    table.innerHTML = '<thead><tr><th>#</th><th>Participante</th><th>Puntos</th><th>Exactos</th><th>Signo</th><th>Bonus</th></tr></thead>';
    const tbody = document.createElement('tbody');
    rows.forEach((r, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td>' + (i + 1) + '</td><td>' + r.player + '</td><td><strong>' + r.points
        + '</strong></td><td>' + r.exact + '</td><td>' + r.winner + '</td><td>' + r.bonus + '</td>';
      tbody.appendChild(tr);
    });
    table.appendChild(tbody); container.innerHTML = ''; container.appendChild(table);
  }

  document.getElementById('prediction-form')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    const player      = document.getElementById('player-name').value.trim();
    const selectedDay = document.getElementById('day-select').value;
    if (!player || !selectedDay) { alert('Completa nombre y d\xeda'); return; }
    const btn = document.getElementById('submit-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Guardando\u2026'; }
    try {
      if (selectedDay === 'bonus') {
        const best11 = [];
        for (let i = 1; i <= 10; i++) best11.push(document.getElementById('bonus-best11-' + i).value.trim());
        const payload = {
          type: 'bonus-full', player,
          mvp: document.getElementById('bonus-mvp').value.trim(),
          topscorer: document.getElementById('bonus-topscorer').value.trim(),
          finalist1: document.getElementById('bonus-finalist1').value.trim(),
          finalist2: document.getElementById('bonus-finalist2').value.trim(),
          champion: document.getElementById('bonus-champion').value.trim(),
          gk: document.getElementById('bonus-gk').value.trim(),
          topteam: document.getElementById('bonus-topteam').value.trim(),
          best11, createdAt: new Date().toISOString()
        };
        if (!payload.mvp || !payload.topscorer || !payload.finalist1 || !payload.finalist2
          || !payload.champion || !payload.gk || !payload.topteam || best11.some(v => !v)) {
          alert('Rellena todos los campos de la jornada 0'); return;
        }
        await predictionsCol.doc(player + '_bonus_full').set(payload);
      } else {
        const inputs = this.querySelectorAll('#next-matches-container input[type="number"]');
        const temp = {};
        inputs.forEach(input => {
          const parts = input.name.split('_');
          const side  = parts[parts.length - 1];
          const matchId = parts.slice(1, parts.length - 1).join('_');
          if (!temp[matchId]) temp[matchId] = { matchId };
          const val = Number(input.value);
          if (side === 'A') temp[matchId].predA = val;
          if (side === 'B') temp[matchId].predB = val;
        });
        const batch = db.batch();
        for (const matchId in temp) {
          const m = temp[matchId];
          if (m.predA == null || m.predB == null || isNaN(m.predA) || isNaN(m.predB)) {
            alert('Rellena todos los resultados'); return;
          }
          batch.set(predictionsCol.doc(player + '_' + matchId), {
            player, matchId, date: selectedDay,
            predA: m.predA, predB: m.predB, createdAt: new Date().toISOString()
          });
        }
        await batch.commit();
      }
      showStatus('Pron\xf3sticos guardados \u2713');
      this.reset();
      document.getElementById('day-select').value = selectedDay;
      renderSelectedDay(matchesCache);
      await renderStandings(matchesCache);
      const fp = document.getElementById('filter-player');
      if (fp && fp.value.trim()) await renderPlayerPredictions(fp.value);
    } catch (err) {
      console.error(err); showStatus('Error al guardar: ' + err.message, 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Guardar pron\xf3sticos'; }
    }
  });

  document.getElementById('add-match-form')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    const id    = 'm_' + Date.now();
    const round = document.getElementById('round-admin').value;
    await matchesCol.doc(id).set({
      id,
      date: document.getElementById('match-date').value,
      time: document.getElementById('match-time').value,
      teamA: document.getElementById('team-a').value.trim(),
      teamB: document.getElementById('team-b').value.trim(),
      matchday: document.getElementById('matchday-admin').value
        ? Number(document.getElementById('matchday-admin').value) : null,
      round, roundLabel: round, scoreA: null, scoreB: null
    });
    this.reset();
    showStatus('Partido a\xf1adido \u2713');
  });

  document.getElementById('bonus-admin-form')?.addEventListener('submit', async function (e) {
    e.preventDefault();
    const best11 = [];
    for (let i = 1; i <= 10; i++) best11.push(document.getElementById('official-best11-' + i).value.trim());
    const payload = {
      mvp: document.getElementById('official-mvp').value.trim(),
      topscorer: document.getElementById('official-topscorer').value.trim(),
      finalist1: document.getElementById('official-finalist1').value.trim(),
      finalist2: document.getElementById('official-finalist2').value.trim(),
      champion: document.getElementById('official-champion').value.trim(),
      gk: document.getElementById('official-gk').value.trim(),
      topteam: document.getElementById('official-topteam').value.trim(),
      best11, updatedAt: new Date().toISOString()
    };
    await metaCol.doc('bonusOfficial').set(payload);
    bonusOfficial = payload;
    showStatus('Bonus oficial guardado \u2713');
    await renderStandings(matchesCache);
    const fp = document.getElementById('filter-player');
    if (fp && fp.value.trim()) await renderPlayerPredictions(fp.value);
  });

  document.getElementById('day-select')?.addEventListener('change', () => renderSelectedDay(matchesCache));
  document.getElementById('filter-player')?.addEventListener('input', async function () {
    await renderPlayerPredictions(this.value);
  });

  matchesCol.onSnapshot(async snap => {
    matchesCache = snap.docs.map(d => d.data());
    populateDaySelect(matchesCache);
    renderSelectedDay(matchesCache);
    renderOfficialResultsForm(matchesCache);
    await renderStandings(matchesCache);
    const fp = document.getElementById('filter-player');
    if (fp && fp.value.trim()) await renderPlayerPredictions(fp.value);
  }, err => showStatus('Error al leer partidos: ' + err.message, 'error'));

  loadBonusOfficial().catch(console.error);
  seedMatchesIfEmpty().catch(err => showStatus('Error al sembrar partidos: ' + err.message, 'error'));
});
