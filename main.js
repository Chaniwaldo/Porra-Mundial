// main.js – Porra Mundial 2026 con selector de jornada

document.addEventListener('DOMContentLoaded', () => {
  const matchesCol = db.collection('matches');
  const predictionsCol = db.collection('predictions');
  let matchesCache = [];

  function resultSign(a, b) {
    if (a == null || b == null) return null;
    if (a > b) return 'A';
    if (b > a) return 'B';
    return 'D';
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
    return [...arr].sort((a, b) => {
      const da = (a.date || '') + ' ' + (a.time || '00:00');
      const db2 = (b.date || '') + ' ' + (b.time || '00:00');
      return da.localeCompare(db2);
    });
  }

  async function seedMatchesIfEmpty() {
    try {
      const snap = await matchesCol.limit(1).get();
      if (!snap.empty) return;
      const batch = db.batch();
      INITIAL_MATCHES.forEach(m => batch.set(matchesCol.doc(m.id), m));
      await batch.commit();
      showStatus('Calendario base cargado ✓');
    } catch (e) {
      console.error(e);
      showStatus('Error al cargar calendario: ' + e.message, 'error');
    }
  }

  function getAvailableMatchdays(matches) {
    const set = new Set();
    matches.forEach(m => {
      if (m.matchday != null && m.matchday !== '') set.add(String(m.matchday));
    });
    return Array.from(set).sort((a, b) => Number(a) - Number(b));
  }

  function populateMatchdaySelect(matches) {
    const select = document.getElementById('matchday-select');
    if (!select) return;
    const days = getAvailableMatchdays(matches);
    const current = select.value;

    select.innerHTML = '';
    if (!days.length) {
      select.innerHTML = '<option value="">No hay jornadas disponibles</option>';
      return;
    }

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Selecciona jornada';
    select.appendChild(placeholder);

    days.forEach(day => {
      const option = document.createElement('option');
      option.value = day;
      option.textContent = 'Jornada ' + day;
      select.appendChild(option);
    });

    if (days.includes(current)) {
      select.value = current;
    } else {
      select.value = days[0];
    }
  }

  function renderSelectedMatchday(matches) {
    const container = document.getElementById('next-matches-container');
    const select = document.getElementById('matchday-select');
    if (!container || !select) return;
    container.innerHTML = '';

    if (!matches.length) {
      container.innerHTML = '<p class="small">No hay partidos configurados.</p>';
      return;
    }

    const selected = select.value;
    if (!selected) {
      container.innerHTML = '<p class="small">Selecciona una jornada.</p>';
      return;
    }

    const dayMatches = sortedMatches(matches).filter(m => String(m.matchday) === String(selected));
    if (!dayMatches.length) {
      container.innerHTML = '<p class="small">No hay partidos en esa jornada.</p>';
      return;
    }

    const heading = document.createElement('p');
    heading.className = 'small';
    heading.textContent = 'Jornada ' + selected + ' (' + dayMatches.length + ' partido' + (dayMatches.length !== 1 ? 's' : '') + ')';
    container.appendChild(heading);

    dayMatches.forEach(match => {
      const row = document.createElement('div');
      row.className = 'match-row';
      const label = document.createElement('div');
      label.innerHTML = `<div class="teams">${match.teamA} vs ${match.teamB}</div><div class="meta">${match.date || ''} · ${match.time || ''}</div>`;
      row.appendChild(label);

      ['A', 'B'].forEach(side => {
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
    if (!matches.length) {
      container.innerHTML = '<p class="small">No hay partidos.</p>';
      return;
    }

    const table = document.createElement('table');
    table.innerHTML = '<thead><tr><th>Partido</th><th>Local</th><th>Visit.</th><th></th></tr></thead>';
    const tbody = document.createElement('tbody');

    sortedMatches(matches).forEach(m => {
      const tr = document.createElement('tr');
      const labelCell = document.createElement('td');
      labelCell.innerHTML = `<div class="teams">${m.teamA} vs ${m.teamB}</div><div class="meta">J${m.matchday || '-'} · ${m.date || ''} ${m.time || ''}</div>`;
      tr.appendChild(labelCell);

      ['A', 'B'].forEach(side => {
        const td = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.value = m[`score${side}`] != null ? m[`score${side}`] : '';
        input.style.width = '55px';
        input.addEventListener('change', async () => {
          const val = input.value === '' ? null : Number(input.value);
          await matchesCol.doc(m.id).update({ [`score${side}`]: val });
          showStatus('Resultado guardado ✓');
        });
        td.appendChild(input);
        tr.appendChild(td);
      });

      const statusTd = document.createElement('td');
      statusTd.innerHTML = (m.scoreA != null && m.scoreB != null)
        ? '<span class="badge">Cerrado</span>'
        : '<span class="small muted">Pendiente</span>';
      tr.appendChild(statusTd);
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    container.appendChild(table);
  }

  async function renderStandings(matches) {
    const container = document.getElementById('standings-container');
    if (!container) return;

    const closedMatches = matches.filter(m => m.scoreA != null && m.scoreB != null);
    if (!closedMatches.length) {
      container.innerHTML = '<p class="small">Introduce resultados oficiales para puntuar.</p>';
      return;
    }

    const matchMap = new Map(closedMatches.map(m => [m.id, m]));
    const snap = await predictionsCol.get();
    if (snap.empty) {
      container.innerHTML = '<p class="small">Aún no hay pronósticos guardados.</p>';
      return;
    }

    const playerScores = new Map();
    snap.forEach(doc => {
      const pred = doc.data();
      const match = matchMap.get(pred.matchId);
      if (!match) return;
      const key = pred.player?.trim();
      if (!key) return;

      let score = 0, exact = false, winner = false;
      if (pred.predA === match.scoreA && pred.predB === match.scoreB) {
        score = 5; exact = true;
      } else {
        const os = resultSign(match.scoreA, match.scoreB);
        const ps = resultSign(pred.predA, pred.predB);
        if (os && ps && os === ps) {
          score = 2; winner = true;
        }
      }

      if (!playerScores.has(key)) playerScores.set(key, { player: key, points: 0, exact: 0, winner: 0 });
      const e = playerScores.get(key);
      e.points += score;
      if (exact) e.exact += 1;
      if (winner) e.winner += 1;
    });

    const rows = Array.from(playerScores.values()).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.exact !== a.exact) return b.exact - a.exact;
      return a.player.localeCompare(b.player, 'es');
    });

    if (!rows.length) {
      container.innerHTML = '<p class="small">Todavía no hay puntos asignados.</p>';
      return;
    }

    const table = document.createElement('table');
    table.innerHTML = '<thead><tr><th>#</th><th>Participante</th><th>Puntos</th><th>Exactos</th><th>Signo</th></tr></thead>';
    const tbody = document.createElement('tbody');
    rows.forEach((r, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${idx + 1}</td><td>${r.player}</td><td><strong>${r.points}</strong></td><td><span class="pill pill-exact">${r.exact}</span></td><td><span class="pill pill-winner">${r.winner}</span></td>`;
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    container.innerHTML = '';
    container.appendChild(table);
  }

  const filterInput = document.getElementById('filter-player');
  if (filterInput) {
    filterInput.addEventListener('input', async function () {
      const name = this.value.trim().toLowerCase();
      const container = document.getElementById('my-predictions-container');
      if (!container) return;
      if (!name) { container.innerHTML = ''; return; }

      const snap = await predictionsCol.get();
      const found = [];
      snap.forEach(doc => {
        const d = doc.data();
        if (d.player && d.player.toLowerCase().includes(name)) found.push(d);
      });

      if (!found.length) {
        container.innerHTML = '<p class="small">No se encontraron pronósticos.</p>';
        return;
      }

      const matchMap = new Map(matchesCache.map(m => [m.id, m]));
      const table = document.createElement('table');
      table.innerHTML = '<thead><tr><th>Partido</th><th>Pronóstico</th><th>Resultado</th><th>Puntos</th></tr></thead>';
      const tbody = document.createElement('tbody');

      found.forEach(pred => {
        const m = matchMap.get(pred.matchId);
        if (!m) return;
        let label = '—';
        if (m.scoreA != null && m.scoreB != null) {
          if (pred.predA === m.scoreA && pred.predB === m.scoreB) {
            label = '<span class="pill pill-exact">+5 exacto</span>';
          } else {
            const os = resultSign(m.scoreA, m.scoreB);
            const ps = resultSign(pred.predA, pred.predB);
            label = (os && ps && os === ps)
              ? '<span class="pill pill-winner">+2 signo</span>'
              : '<span class="pill" style="background:#fee2e2;color:#991b1b">0</span>';
          }
        }
        const res = (m.scoreA != null && m.scoreB != null) ? `${m.scoreA}-${m.scoreB}` : 'Pendiente';
        const tr = document.createElement('tr');
        tr.innerHTML = `<td><div class="teams">${m.teamA} vs ${m.teamB}</div><div class="meta">J${m.matchday || '-'} · ${m.date} ${m.time}</div></td><td>${pred.predA}-${pred.predB}</td><td>${res}</td><td>${label}</td>`;
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      container.innerHTML = '';
      container.appendChild(table);
    });
  }

  const predForm = document.getElementById('prediction-form');
  if (predForm) {
    predForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const player = document.getElementById('player-name').value.trim();
      const selectedDay = document.getElementById('matchday-select').value;
      if (!player) { alert('Introduce tu nombre'); return; }
      if (!selectedDay) { alert('Selecciona una jornada'); return; }

      const btn = document.getElementById('submit-btn');
      if (btn) { btn.disabled = true; btn.textContent = 'Guardando…'; }

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

      try {
        const batch = db.batch();
        for (const matchId in temp) {
          const m = temp[matchId];
          if (m.predA == null || m.predB == null || Number.isNaN(m.predA) || Number.isNaN(m.predB)) {
            alert('Rellena todos los resultados.');
            if (btn) { btn.disabled = false; btn.textContent = 'Guardar pronósticos'; }
            return;
          }
          const docId = `${player}_${matchId}_${Date.now()}_${Math.random().toString(16).slice(2,8)}`;
          batch.set(predictionsCol.doc(docId), {
            player,
            matchId,
            matchday: Number(selectedDay),
            predA: m.predA,
            predB: m.predB,
            createdAt: new Date().toISOString()
          });
        }
        await batch.commit();
        showStatus('Pronósticos guardados. ¡Suerte! 🎉');
        this.reset();
        document.getElementById('matchday-select').value = selectedDay;
        renderSelectedMatchday(matchesCache);
      } catch (err) {
        console.error(err);
        showStatus('Error al guardar: ' + err.message, 'error');
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'Guardar pronósticos'; }
      }
    });
  }

  const addForm = document.getElementById('add-match-form');
  if (addForm) {
    addForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const date = document.getElementById('match-date').value;
      const time = document.getElementById('match-time').value;
      const teamA = document.getElementById('team-a').value.trim();
      const teamB = document.getElementById('team-b').value.trim();
      const matchday = document.getElementById('matchday-admin').value;
      if (!date || !time || !teamA || !teamB) { alert('Rellena todos los campos'); return; }
      const id = 'm_' + Date.now();
      await matchesCol.doc(id).set({ id, date, time, teamA, teamB, matchday: matchday ? Number(matchday) : null, scoreA: null, scoreB: null });
      showStatus(`Partido ${teamA} vs ${teamB} añadido ✓`);
      this.reset();
    });
  }

  const matchdaySelect = document.getElementById('matchday-select');
  if (matchdaySelect) {
    matchdaySelect.addEventListener('change', () => renderSelectedMatchday(matchesCache));
  }

  matchesCol.onSnapshot(snap => {
    matchesCache = snap.docs.map(d => d.data());
    populateMatchdaySelect(matchesCache);
    renderSelectedMatchday(matchesCache);
    renderOfficialResultsForm(matchesCache);
    renderStandings(matchesCache);
  }, err => {
    console.error(err);
    showStatus('Error al leer partidos: ' + err.message, 'error');
  });

  seedMatchesIfEmpty();
});
