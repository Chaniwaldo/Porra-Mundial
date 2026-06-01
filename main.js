// Claves de almacenamiento local
const STORAGE_KEYS = {
  MATCHES: 'porra_mundial_matches',
  PREDICTIONS: 'porra_mundial_predictions'
};

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error leyendo localStorage', e);
    return fallback;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error escribiendo localStorage', e);
  }
}

// Datos en memoria: partimos del calendario base definido en data.js
let matches = loadFromStorage(STORAGE_KEYS.MATCHES, INITIAL_MATCHES.slice());
let predictions = loadFromStorage(STORAGE_KEYS.PREDICTIONS, []);

function generateMatchId() {
  return 'm_' + Date.now() + '_' + Math.random().toString(16).slice(2);
}

function resultSign(a, b) {
  if (a == null || b == null) return null;
  if (a > b) return 'A';
  if (b > a) return 'B';
  return 'D';
}

// Próxima jornada
function renderNextMatchesForm() {
  const container = document.getElementById('next-matches-container');
  container.innerHTML = '';

  if (!matches.length) {
    container.innerHTML = '<p class="small">Aún no hay partidos. El administrador debe añadirlos o completar el calendario.</p>';
    return;
  }

  const sorted = [...matches].sort((a, b) => {
    const da = (a.date || '') + ' ' + (a.time || '00:00');
    const db = (b.date || '') + ' ' + (b.time || '00:00');
    return da.localeCompare(db);
  });

  const todayStr = new Date().toISOString().slice(0, 10);
  let nextDate = null;
  for (const m of sorted) {
    if ((m.date || '') >= todayStr) {
      nextDate = m.date;
      break;
    }
  }

  if (!nextDate) {
    container.innerHTML = '<p class="small">No hay más jornadas futuras configuradas.</p>';
    return;
  }

  const dayMatches = sorted.filter(m => m.date === nextDate);
  const prettyDate = new Date(nextDate).toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'short', day: 'numeric'
  });

  const heading = document.createElement('p');
  heading.className = 'small';
  heading.textContent = 'Jornada del ' + prettyDate + ' (' + dayMatches.length + ' partido' + (dayMatches.length !== 1 ? 's' : '') + ')';
  container.appendChild(heading);

  dayMatches.forEach(match => {
    const row = document.createElement('div');
    row.className = 'match-row';

    const label = document.createElement('div');
    label.innerHTML = '<div class="teams">' + match.teamA + ' vs ' + match.teamB + '</div>' +
      '<div class="meta">' + (match.time || '') + '</div>';
    row.appendChild(label);

    const inputA = document.createElement('input');
    inputA.type = 'number';
    inputA.min = '0';
    inputA.required = true;
    inputA.name = 'pred_' + match.id + '_A';
    row.appendChild(inputA);

    const inputB = document.createElement('input');
    inputB.type = 'number';
    inputB.min = '0';
    inputB.required = true;
    inputB.name = 'pred_' + match.id + '_B';
    row.appendChild(inputB);

    container.appendChild(row);
  });
}

// Lista partidos admin
function renderAdminMatches() {
  const container = document.getElementById('admin-matches-list');
  container.innerHTML = '';

  if (!matches.length) {
    container.innerHTML = '<p class="small">No hay partidos configurados.</p>';
    return;
  }

  const sorted = [...matches].sort((a, b) => {
    const da = (a.date || '') + ' ' + (a.time || '00:00');
    const db = (b.date || '') + ' ' + (b.time || '00:00');
    return da.localeCompare(db);
  });

  const list = document.createElement('ul');
  list.style.listStyle = 'none';
  list.style.paddingLeft = '0';

  sorted.forEach(m => {
    const li = document.createElement('li');
    li.className = 'small';
    const res = (m.scoreA != null && m.scoreB != null) ? ` — Resultado: ${m.scoreA}-${m.scoreB}` : '';
    li.textContent = `${m.date || ''} ${m.time || ''} · ${m.teamA} vs ${m.teamB}${res}`;
    list.appendChild(li);
  });

  container.appendChild(list);
}

// Resultados oficiales
function renderOfficialResultsForm() {
  const container = document.getElementById('official-results-container');
  container.innerHTML = '';

  if (!matches.length) {
    container.innerHTML = '<p class="small">No hay partidos.</p>';
    return;
  }

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  thead.innerHTML = '<tr><th>Partido</th><th>Goles local</th><th>Goles visitante</th><th></th></tr>';
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  const sorted = [...matches].sort((a, b) => {
    const da = (a.date || '') + ' ' + (a.time || '00:00');
    const db = (b.date || '') + ' ' + (b.time || '00:00');
    return da.localeCompare(db);
  });

  sorted.forEach(m => {
    const tr = document.createElement('tr');

    const labelCell = document.createElement('td');
    labelCell.innerHTML = `<div class="teams">${m.teamA} vs ${m.teamB}</div><div class="meta">${m.date || ''} ${m.time || ''}</div>`;
    tr.appendChild(labelCell);

    const aCell = document.createElement('td');
    const inputA = document.createElement('input');
    inputA.type = 'number';
    inputA.min = '0';
    inputA.value = m.scoreA != null ? m.scoreA : '';
    inputA.style.width = '60px';
    inputA.addEventListener('change', () => {
      m.scoreA = inputA.value === '' ? null : Number(inputA.value);
      saveToStorage(STORAGE_KEYS.MATCHES, matches);
      renderAdminMatches();
      renderStandings();
    });
    aCell.appendChild(inputA);
    tr.appendChild(aCell);

    const bCell = document.createElement('td');
    const inputB = document.createElement('input');
    inputB.type = 'number';
    inputB.min = '0';
    inputB.value = m.scoreB != null ? m.scoreB : '';
    inputB.style.width = '60px';
    inputB.addEventListener('change', () => {
      m.scoreB = inputB.value === '' ? null : Number(inputB.value);
      saveToStorage(STORAGE_KEYS.MATCHES, matches);
      renderAdminMatches();
      renderStandings();
    });
    bCell.appendChild(inputB);
    tr.appendChild(bCell);

    const statusCell = document.createElement('td');
    if (m.scoreA != null && m.scoreB != null) {
      statusCell.innerHTML = '<span class="badge">Cerrado</span>';
    } else {
      statusCell.innerHTML = '<span class="small">Pendiente</span>';
    }
    tr.appendChild(statusCell);

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  container.appendChild(table);
}

// Envío pronósticos
const predictionForm = document.getElementById('prediction-form');

predictionForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const nameInput = document.getElementById('player-name');
  const player = nameInput.value.trim();
  if (!player) {
    alert('Introduce tu nombre');
    return;
  }

  const inputs = this.querySelectorAll('input[type="number"]');
  if (!inputs.length) {
    alert('No hay partidos disponibles para pronosticar.');
    return;
  }

  const temp = {};
  inputs.forEach(input => {
    const [_, matchId, side] = input.name.split('_');
    if (!temp[matchId]) temp[matchId] = { matchId };
    const val = Number(input.value);
    if (Number.isNaN(val)) return;
    if (side === 'A') temp[matchId].predA = val;
    if (side === 'B') temp[matchId].predB = val;
  });

  const newPreds = [];
  for (const matchId in temp) {
    const m = temp[matchId];
    if (m.predA == null || m.predB == null) {
      alert('Debes rellenar todos los resultados.');
      return;
    }
    newPreds.push({
      player,
      matchId,
      predA: m.predA,
      predB: m.predB,
      createdAt: new Date().toISOString()
    });
  }

  predictions = predictions.concat(newPreds);
  saveToStorage(STORAGE_KEYS.PREDICTIONS, predictions);
  alert('Pronósticos guardados. ¡Suerte!');
  this.reset();
});

// Borrar pronósticos de este navegador
document.getElementById('clear-predictions').addEventListener('click', () => {
  if (!confirm('Esto borrará todos los pronósticos guardados en este navegador. ¿Seguro?')) return;
  predictions = [];
  saveToStorage(STORAGE_KEYS.PREDICTIONS, predictions);
  renderStandings();
});

// Alta de partidos
document.getElementById('add-match-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const date = document.getElementById('match-date').value;
  const time = document.getElementById('match-time').value;
  const teamA = document.getElementById('team-a').value.trim();
  const teamB = document.getElementById('team-b').value.trim();

  if (!date || !time || !teamA || !teamB) {
    alert('Rellena todos los campos del partido');
    return;
  }

  matches.push({
    id: generateMatchId(),
    date,
    time,
    teamA,
    teamB,
    scoreA: null,
    scoreB: null
  });

  saveToStorage(STORAGE_KEYS.MATCHES, matches);
  this.reset();
  renderNextMatchesForm();
  renderAdminMatches();
  renderOfficialResultsForm();
});

// Vaciar todos los partidos
document.getElementById('clear-all').addEventListener('click', () => {
  if (!confirm('Esto borrará todos los partidos y resultados guardados en este navegador. ¿Seguro?')) return;
  matches = [];
  saveToStorage(STORAGE_KEYS.MATCHES, matches);
  renderNextMatchesForm();
  renderAdminMatches();
  renderOfficialResultsForm();
  renderStandings();
});

// Clasificación
function renderStandings() {
  const container = document.getElementById('standings-container');
  container.innerHTML = '';

  if (!predictions.length || !matches.length) {
    container.innerHTML = '<p class="small">Aún no hay datos suficientes para calcular la clasificación.</p>';
    return;
  }

  const matchMap = new Map();
  matches.forEach(m => {
    if (m.scoreA != null && m.scoreB != null) {
      matchMap.set(m.id, m);
    }
  });

  if (!matchMap.size) {
    container.innerHTML = '<p class="small">Introduce resultados oficiales para empezar a puntuar.</p>';
    return;
  }

  const playerScores = new Map();

  predictions.forEach(pred => {
    const match = matchMap.get(pred.matchId);
    if (!match) return;

    const key = pred.player.trim();
    if (!key) return;

    let score = 0;
    let exact = false;
    let winner = false;

    if (pred.predA === match.scoreA && pred.predB === match.scoreB) {
      score = 5;
      exact = true;
    } else {
      const officialSign = resultSign(match.scoreA, match.scoreB);
      const predictedSign = resultSign(pred.predA, pred.predB);
      if (officialSign && predictedSign && officialSign === predictedSign) {
        score = 2;
        winner = true;
      }
    }

    if (!playerScores.has(key)) {
      playerScores.set(key, { player: key, points: 0, exact: 0, winner: 0 });
    }
    const entry = playerScores.get(key);
    entry.points += score;
    if (exact) entry.exact += 1;
    if (winner) entry.winner += 1;
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
  const thead = document.createElement('thead');
  thead.innerHTML = '<tr><th>#</th><th>Participante</th><th>Puntos</th><th>Exactos</th><th>Signo</th></tr>';
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  rows.forEach((r, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${idx + 1}</td><td>${r.player}</td><td>${r.points}</td>` +
      `<td><span class="pill pill-exact">${r.exact}</span></td>` +
      `<td><span class="pill pill-winner">${r.winner}</span></td>`;
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  container.appendChild(table);
}

// Inicialización
renderNextMatchesForm();
renderAdminMatches();
renderOfficialResultsForm();
renderStandings();
