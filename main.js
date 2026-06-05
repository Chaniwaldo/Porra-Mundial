document.addEventListener('DOMContentLoaded', () => {
  const matchesCol = db.collection('matches');
  const predictionsCol = db.collection('predictions');
  const metaCol = db.collection('meta');
  let matchesCache = [];
  let bonusOfficial = {};

  const EXTRA_DAYS = [
    { key: 'bonus', label: 'Jornada 0 · Bonus del torneo', sort: '2026-06-01' }
  ];

  function resultSign(a, b) {
    if (a == null || b == null) return null;
    if (a > b) return 'A';
    if (b > a) return 'B';
    return 'D';
  }
  function norm(s) {
    return (s || '').toString().trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
  function containsApprox(hay, needle) {
    const h = norm(hay);
    const n = norm(needle);
    if (!h || !n) return false;
    if (n.length < 4) return h === n;
    for (let i = 0; i <= n.length - 4; i++) {
      const sub = n.slice(i, i + 4);
      if (h.includes(sub)) return true;
    }
    return false;
  }
  function showStatus(msg, type = 'info') {
    const el = document.getElementById('db-status');
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
    el.style.background = type === 'error' ? '#fee2e2' : '#d1fae5';
    setTimeout(() => { el.style.display = 'none'; }, 3500);
  }
  function sortedMatches(arr) {
    return [...arr].sort((a, b) => ((a.date || '') + ' ' + (a.time || '00:00')).localeCompare((b.date || '') + ' ' + (b.time || '00:00')));
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
    const gk = document.getElementById('official-gk');
    const tt = document.getElementById('official-topteam');
    if (gk) gk.value = bonusOfficial.gk || '';
    if (tt) tt.value = bonusOfficial.topteam || '';
    for (let i = 1; i <= 10; i++) {
      const el = document.getElementById('official-best11-' + i);
      if (el) el.value = (bonusOfficial.best11 && bonusOfficial.best11[i-1]) || '';
    }
  }

  function getDayOptions(matches) {
    const map = new Map();
    EXTRA_DAYS.forEach(d => map.set(d.key, { label: d.label, sort: d.sort }));
    sortedMatches(matches).forEach(m => {
      if (m.date && !map.has(m.date)) map.set(m.date, { label: m.date, sort: m.date });
    });
    const arr = Array.from(map.entries()).map(([key, v]) => ({ key, label: v.label, sort: v.sort }));
    arr.sort((a, b) => a.sort.localeCompare(b.sort));
    return arr;
  }

  function populateDaySelect(matches) {
    const select = document.getElementById('day-select');
    if (!select) return;
    const options = getDayOptions(matches);
    const current = select.value;
    select.innerHTML = '<option value="">Selecciona día o jornada</option>';
    options.forEach(opt => {
      const o = document.createElement('option');
      o.value = opt.key;
      o.textContent = opt.label;
      select.appendChild(o);
    });
    if (options.some(o => o.key === current)) select.value = current;
    else if (options.length) select.value = options[0].key;
  }

  function renderBonusForm(container) {
    container.innerHTML = `
      <div class="bonus-box">
        <h3>Jornada 0 · Bonus del torneo</h3>
        <p class="small">Mejor portero 5 pts · selección más goleadora 5 pts · mejor once (10 jugadores de campo, 3 pts por jugador). Coincidencias aproximadas: se concede el acierto si el nombre del jugador o selección contiene una cadena de al menos 4 letras iguales respecto al oficial.</p>
        <div class="field"><label for="bonus-gk">Mejor portero</label><input type="text" id="bonus-gk" name="bonus_gk" required /></div>
        <div class="field"><label for="bonus-topteam">Selección más goleadora</label><input type="text" id="bonus-topteam" name="bonus_topteam" required /></div>
        <div class="field"><label>Mejor once (10 jugadores de campo)</label></div>
        <div class="grid-2">
          <div class="field"><input type="text" id="bonus-best11-1"  placeholder="Jugador 1" required /></div>
          <div class="field"><input type="text" id="bonus-best11-2"  placeholder="Jugador 2" required /></div>
        </div>
        <div class="grid-2">
          <div class="field"><input type="text" id="bonus-best11-3"  placeholder="Jugador 3" required /></div>
          <div class="field"><input type="text" id="bonus-best11-4"  placeholder="Jugador 4" required /></div>
        </div>
        <div class="grid-2">
          <div class="field"><input type="text" id="bonus-best11-5"  placeholder="Jugador 5" required /></div>
          <div class="field"><input type="text" id="bonus-best11-6"  placeholder="Jugador 6" required /></div>
        </div>
        <div class="grid-2">
          <div class="field"><input type="text" id="bonus-best11-7"  placeholder="Jugador 7" required /></div>
          <div class="field"><input type="text" id="bonus-best11-8"  placeholder="Jugador 8" required /></div>
        </div>
        <div class="grid-2">
          <div class="field"><input type="text" id="bonus-best11-9"  placeholder="Jugador 9" required /></div>
          <div class="field"><input type="text" id="bonus-best11-10" placeholder="Jugador 10" required /></div>
        </div>
      </div>`;
  }

  function renderSelectedDay(matches) {
    const container = document.getElementById('next-matches-container');
    const select = document.getElementById('day-select');
    if (!container || !select) return;
    container.innerHTML = '';
    const selected = select.value;
    if (!selected) {
      container.innerHTML = '<p class="small">Selecciona un día.</p>';
      return;
    }
    if (selected === 'bonus') { renderBonusForm(container); return; }
    const dayMatches = sortedMatches(matches).filter(m => m.date === selected);
    if (!dayMatches.length) {
      container.innerHTML = '<p class="small">Aún no hay partidos cargados para ese día. El administrador podrá añadirlos cuando se conozcan.</p>';
      return;
    }
    const head = document.createElement('p');
    head.className = 'small';
    head.textContent = selected + ' · ' + dayMatches.length + ' partido' + (dayMatches.length !== 1 ? 's' : '');
    container.appendChild(head);
    dayMatches.forEach(match => {
      const row = document.createElement('div');
      row.className = 'match-row';
      const label = document.createElement('div');
      label.innerHTML = `<div class="teams">${match.teamA} vs ${match.teamB}</div><div class="meta">${match.time || ''} · ${match.round || 'group'}</div>`;
      row.appendChild(label);
      ['A','B'].forEach(side => {
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.required = true;
        input.name = `pred_${match.id}_${side}`;
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
      tr.innerHTML = `<td><div class="teams">${m.teamA} vs ${m.teamB}</div><div class="meta">${m.date || ''} ${m.time || ''} · ${m.round || 'group'}</div></td>`;
      ['A','B'].forEach(side => {
        const td = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.value = m['score'+side] != null ? m['score'+side] : '';
        input.style.width = '55px';
        input.addEventListener('change', async () => {
          const val = input.value === '' ? null : Number(input.value);
          await matchesCol.doc(m.id).update({ ['score'+side]: val });
          showStatus('Resultado guardado ✓');
        });
        td.appendChild(input);
        tr.appendChild(td);
      });
      const td = document.createElement('td');
      td.innerHTML = (m.scoreA != null && m.scoreB != null) ? '<span class="badge">Cerrado</span>' : '<span class="small muted">Pendiente</span>';
      tr.appendChild(td);
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    container.appendChild(table);
  }

  async function renderStandings(matches) {
    const container = document.getElementById('standings-container');
    if (!container) return;
    const playerScores = new Map();
    const closedMatches = matches.filter(m => m.scoreA != null && m.scoreB != null);
    const matchMap = new Map(closedMatches.map(m => [m.id, m]));
    const snap = await predictionsCol.get();

    snap.forEach(doc => {
      const pred = doc.data();
      const key = pred.player?.trim();
      if (!key) return;
      if (!playerScores.has(key)) playerScores.set(key, { player:key, points:0, exact:0, winner:0, bonus:0 });
      const row = playerScores.get(key);

      if (pred.type === 'bonus2') {
        let pts = 0;
        if (bonusOfficial.gk && containsApprox(pred.gk, bonusOfficial.gk)) pts += 5;
        if (bonusOfficial.topteam && containsApprox(pred.topteam, bonusOfficial.topteam)) pts += 5;
        const officialBest = (bonusOfficial.best11 || []).map(norm);
        (pred.best11 || []).forEach(name => {
          if (!name) return;
          const n = norm(name);
          if (!n) return;
          if (officialBest.some(o => containsApprox(n, o) || containsApprox(o, n))) pts += 3;
        });
        row.points += pts;
        row.bonus += pts;
        return;
      }

      const match = matchMap.get(pred.matchId);
      if (!match) return;
      if (pred.predA === match.scoreA && pred.predB === match.scoreB) {
        row.points += 5; row.exact += 1;
      } else {
        const os = resultSign(match.scoreA, match.scoreB);
        const ps = resultSign(pred.predA, pred.predB);
        if (os && ps && os === ps) { row.points += 2; row.winner += 1; }
      }
    });

    const rows = Array.from(playerScores.values()).sort((a,b) => b.points - a.points || b.exact - a.exact || a.player.localeCompare(b.player,'es'));
    if (!rows.length) { container.innerHTML = '<p class="small">Aún no hay pronósticos guardados.</p>'; return; }
    const table = document.createElement('table');
    table.innerHTML = '<thead><tr><th>#</th><th>Participante</th><th>Puntos</th><th>Exactos</th><th>Signo</th><th>Bonus</th></tr></thead>';
    const tbody = document.createElement('tbody');
    rows.forEach((r,i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${i+1}</td><td>${r.player}</td><td><strong>${r.points}</strong></td><td>${r.exact}</td><td>${r.winner}</td><td>${r.bonus}</td>`;
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    container.innerHTML = '';
    container.appendChild(table);
  }

  document.getElementById('prediction-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const player = document.getElementById('player-name').value.trim();
    const selectedDay = document.getElementById('day-select').value;
    if (!player || !selectedDay) { alert('Completa nombre y día'); return; }
    const btn = document.getElementById('submit-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Guardando…'; }
    try {
      if (selectedDay === 'bonus') {
        const best11 = [];
        for (let i = 1; i <= 10; i++) {
          const val = document.getElementById('bonus-best11-' + i).value.trim();
          best11.push(val);
        }
        const bonus = {
          type: 'bonus2',
          player,
          gk: document.getElementById('bonus-gk').value.trim(),
          topteam: document.getElementById('bonus-topteam').value.trim(),
          best11,
          createdAt: new Date().toISOString()
        };
        if (!bonus.gk || !bonus.topteam || best11.some(v => !v)) {
          alert('Rellena todos los campos de la jornada 0');
          return;
        }
        await predictionsCol.doc(`${player}_bonus2`).set(bonus);
      } else {
        const inputs = this.querySelectorAll('#next-matches-container input[type="number"]');
        const temp = {};
        inputs.forEach(input => {
          const parts = input.name.split('_');
          const side = parts[parts.length - 1];
          const matchId = parts.slice(1, parts.length - 1).join('_');
          if (!temp[matchId]) temp[matchId] = { matchId };
          const val = Number(input.value);
          if (side === 'A') temp[matchId].predA = val;
          if (side === 'B') temp[matchId].predB = val;
        });
        const batch = db.batch();
        for (const matchId in temp) {
          const m = temp[matchId];
          if (m.predA == null || m.predB == null || Number.isNaN(m.predA) || Number.isNaN(m.predB)) {
            alert('Rellena todos los resultados');
            return;
          }
          batch.set(predictionsCol.doc(`${player}_${matchId}`), { player, matchId, date:selectedDay, predA:m.predA, predB:m.predB, createdAt:new Date().toISOString() });
        }
        await batch.commit();
      }
      showStatus('Pronósticos guardados ✓');
      this.reset();
      document.getElementById('day-select').value = selectedDay;
      renderSelectedDay(matchesCache);
      await renderStandings(matchesCache);
    } catch(err) {
      console.error(err);
      showStatus('Error al guardar: ' + err.message, 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Guardar pronósticos'; }
    }
  });

  document.getElementById('add-match-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const id = 'm_' + Date.now();
    await matchesCol.doc(id).set({
      id,
      date: document.getElementById('match-date').value,
      time: document.getElementById('match-time').value,
      teamA: document.getElementById('team-a').value.trim(),
      teamB: document.getElementById('team-b').value.trim(),
      matchday: document.getElementById('matchday-admin').value ? Number(document.getElementById('matchday-admin').value) : null,
      round: document.getElementById('round-admin').value,
      scoreA: null,
      scoreB: null
    });
    this.reset();
    showStatus('Partido añadido ✓');
  });

  document.getElementById('bonus-admin-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const best11 = [];
    for (let i = 1; i <= 10; i++) {
      best11.push(document.getElementById('official-best11-' + i).value.trim());
    }
    const payload = {
      gk: document.getElementById('official-gk').value.trim(),
      topteam: document.getElementById('official-topteam').value.trim(),
      best11,
      updatedAt: new Date().toISOString()
    };
    await metaCol.doc('bonusOfficial').set(payload);
    bonusOfficial = payload;
    showStatus('Bonus oficial guardado ✓');
    await renderStandings(matchesCache);
  });

  document.getElementById('day-select')?.addEventListener('change', () => renderSelectedDay(matchesCache));

  document.getElementById('filter-player')?.addEventListener('input', async function() {
    const name = this.value.trim().toLowerCase();
    const container = document.getElementById('my-predictions-container');
    if (!name) { container.innerHTML = ''; return; }
    const snap = await predictionsCol.get();
    const rows = [];
    snap.forEach(doc => {
      const d = doc.data();
      if (d.player && d.player.toLowerCase().includes(name)) rows.push(d);
    });
    if (!rows.length) { container.innerHTML = '<p class="small">No se encontraron pronósticos.</p>'; return; }
    const matchMap = new Map(matchesCache.map(m => [m.id, m]));
    let html = '<table><thead><tr><th>Tipo</th><th>Detalle</th></tr></thead><tbody>';
    rows.forEach(r => {
      if (r.type === 'bonus2') {
        html += `<tr><td>Bonus</td><td>Portero: ${r.gk}<br>Selección más goleadora: ${r.topteam}<br>Mejor once: ${r.best11.join(', ')}</td></tr>`;
      } else {
        const m = matchMap.get(r.matchId);
        html += `<tr><td>Partido</td><td>${m ? `${m.teamA} vs ${m.teamB}` : r.matchId} → ${r.predA}-${r.predB}</td></tr>`;
      }
    });
    html += '</tbody></table>';
    container.innerHTML = html;
  });

  matchesCol.onSnapshot(async snap => {
    matchesCache = snap.docs.map(d => d.data());
    populateDaySelect(matchesCache);
    renderSelectedDay(matchesCache);
    renderOfficialResultsForm(matchesCache);
    await renderStandings(matchesCache);
  }, err => showStatus('Error al leer partidos: ' + err.message, 'error'));

  loadBonusOfficial().catch(console.error);
  seedMatchesIfEmpty().catch(err => showStatus('Error al sembrar partidos: ' + err.message, 'error'));
});
