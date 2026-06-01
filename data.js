// data.js – Calendario oficial FIFA World Cup 2026 – Fase de Grupos
// Horario de Madrid (CEST, UTC+2) · Fuente: FIFA / MLS Soccer
// Formato fecha: AAAA-MM-DD | hora: HH:MM (24h, hora Madrid)

const INITIAL_MATCHES = [

  // ──────────────────────────────────────────────────────────
  //  JORNADA 1  (11 – 15 junio)
  // ──────────────────────────────────────────────────────────

  // 11 junio
  { id: 'g01_01', date: '2026-06-11', time: '21:00', teamA: 'México',       teamB: 'Sudáfrica',          scoreA: null, scoreB: null },
  { id: 'g01_02', date: '2026-06-11', time: '00:00', teamA: 'Corea del Sur',teamB: 'Play. UEFA D',        scoreA: null, scoreB: null },

  // 12 junio
  { id: 'g01_03', date: '2026-06-12', time: '21:00', teamA: 'Canadá',       teamB: 'Play. UEFA A',        scoreA: null, scoreB: null },
  { id: 'g01_04', date: '2026-06-12', time: '00:00', teamA: 'EEUU',         teamB: 'Paraguay',            scoreA: null, scoreB: null },

  // 13 junio
  { id: 'g01_05', date: '2026-06-13', time: '18:00', teamA: 'Catar',        teamB: 'Suiza',               scoreA: null, scoreB: null },
  { id: 'g01_06', date: '2026-06-13', time: '18:00', teamA: 'Brasil',       teamB: 'Marruecos',           scoreA: null, scoreB: null },
  { id: 'g01_07', date: '2026-06-13', time: '21:00', teamA: 'Haití',        teamB: 'Escocia',             scoreA: null, scoreB: null },
  { id: 'g01_08', date: '2026-06-13', time: '21:00', teamA: 'Australia',    teamB: 'Play. UEFA C',        scoreA: null, scoreB: null },

  // 14 junio
  { id: 'g01_09', date: '2026-06-14', time: '18:00', teamA: 'Alemania',     teamB: 'Curazao',             scoreA: null, scoreB: null },
  { id: 'g01_10', date: '2026-06-14', time: '18:00', teamA: 'Play. UEFA B', teamB: 'Túnez',               scoreA: null, scoreB: null },
  { id: 'g01_11', date: '2026-06-14', time: '21:00', teamA: 'Costa de Marfil', teamB: 'Ecuador',          scoreA: null, scoreB: null },
  { id: 'g01_12', date: '2026-06-14', time: '21:00', teamA: 'Países Bajos', teamB: 'Japón',               scoreA: null, scoreB: null },

  // 15 junio
  { id: 'g01_13', date: '2026-06-15', time: '18:00', teamA: 'Bélgica',      teamB: 'Egipto',              scoreA: null, scoreB: null },
  { id: 'g01_14', date: '2026-06-15', time: '18:00', teamA: 'España',       teamB: 'Cabo Verde',          scoreA: null, scoreB: null },
  { id: 'g01_15', date: '2026-06-15', time: '21:00', teamA: 'Irán',         teamB: 'Nueva Zelanda',       scoreA: null, scoreB: null },
  { id: 'g01_16', date: '2026-06-15', time: '21:00', teamA: 'Arabia Saudí', teamB: 'Uruguay',             scoreA: null, scoreB: null },

  // ──────────────────────────────────────────────────────────
  //  JORNADA 2  (16 – 21 junio)
  // ──────────────────────────────────────────────────────────

  // 16 junio
  { id: 'g02_01', date: '2026-06-16', time: '18:00', teamA: 'Francia',      teamB: 'Senegal',             scoreA: null, scoreB: null },
  { id: 'g02_02', date: '2026-06-16', time: '18:00', teamA: 'Play. Inter 2',teamB: 'Noruega',             scoreA: null, scoreB: null },
  { id: 'g02_03', date: '2026-06-16', time: '21:00', teamA: 'Austria',      teamB: 'Jordania',            scoreA: null, scoreB: null },
  { id: 'g02_04', date: '2026-06-16', time: '21:00', teamA: 'Argentina',    teamB: 'Argelia',             scoreA: null, scoreB: null },

  // 17 junio
  { id: 'g02_05', date: '2026-06-17', time: '18:00', teamA: 'Portugal',     teamB: 'Play. Inter 1',       scoreA: null, scoreB: null },
  { id: 'g02_06', date: '2026-06-17', time: '18:00', teamA: 'Ghana',        teamB: 'Panamá',              scoreA: null, scoreB: null },
  { id: 'g02_07', date: '2026-06-17', time: '21:00', teamA: 'Uzbekistán',   teamB: 'Colombia',            scoreA: null, scoreB: null },
  { id: 'g02_08', date: '2026-06-17', time: '21:00', teamA: 'Inglaterra',   teamB: 'Croacia',             scoreA: null, scoreB: null },

  // 18 junio
  { id: 'g02_09', date: '2026-06-18', time: '18:00', teamA: 'Play. UEFA D', teamB: 'Sudáfrica',           scoreA: null, scoreB: null },
  { id: 'g02_10', date: '2026-06-18', time: '18:00', teamA: 'Suiza',        teamB: 'Play. UEFA A',        scoreA: null, scoreB: null },
  { id: 'g02_11', date: '2026-06-18', time: '21:00', teamA: 'México',       teamB: 'Corea del Sur',       scoreA: null, scoreB: null },
  { id: 'g02_12', date: '2026-06-18', time: '21:00', teamA: 'Canadá',       teamB: 'Catar',               scoreA: null, scoreB: null },

  // 19 junio
  { id: 'g02_13', date: '2026-06-19', time: '18:00', teamA: 'Brasil',       teamB: 'Haití',               scoreA: null, scoreB: null },
  { id: 'g02_14', date: '2026-06-19', time: '18:00', teamA: 'EEUU',         teamB: 'Australia',           scoreA: null, scoreB: null },
  { id: 'g02_15', date: '2026-06-19', time: '21:00', teamA: 'Play. UEFA C', teamB: 'Paraguay',            scoreA: null, scoreB: null },
  { id: 'g02_16', date: '2026-06-19', time: '21:00', teamA: 'Escocia',      teamB: 'Marruecos',           scoreA: null, scoreB: null },

  // 20 junio
  { id: 'g02_17', date: '2026-06-20', time: '18:00', teamA: 'Países Bajos', teamB: 'Play. UEFA B',        scoreA: null, scoreB: null },
  { id: 'g02_18', date: '2026-06-20', time: '18:00', teamA: 'Alemania',     teamB: 'Costa de Marfil',     scoreA: null, scoreB: null },
  { id: 'g02_19', date: '2026-06-20', time: '21:00', teamA: 'Túnez',        teamB: 'Japón',               scoreA: null, scoreB: null },
  { id: 'g02_20', date: '2026-06-20', time: '21:00', teamA: 'Ecuador',      teamB: 'Curazao',             scoreA: null, scoreB: null },

  // 21 junio
  { id: 'g02_21', date: '2026-06-21', time: '18:00', teamA: 'España',       teamB: 'Arabia Saudí',        scoreA: null, scoreB: null },
  { id: 'g02_22', date: '2026-06-21', time: '18:00', teamA: 'Argentina',    teamB: 'Austria',             scoreA: null, scoreB: null },
  { id: 'g02_23', date: '2026-06-21', time: '21:00', teamA: 'Bélgica',      teamB: 'Irán',                scoreA: null, scoreB: null },
  { id: 'g02_24', date: '2026-06-21', time: '21:00', teamA: 'Nueva Zelanda',teamB: 'Egipto',              scoreA: null, scoreB: null },

  // ──────────────────────────────────────────────────────────
  //  JORNADA 3  (22 – 27 junio, partidos simultáneos por grupo)
  // ──────────────────────────────────────────────────────────

  // 22 junio
  { id: 'g03_01', date: '2026-06-22', time: '18:00', teamA: 'Jordania',     teamB: 'Argelia',             scoreA: null, scoreB: null },
  { id: 'g03_02', date: '2026-06-22', time: '18:00', teamA: 'Francia',      teamB: 'Play. Inter 2',       scoreA: null, scoreB: null },
  { id: 'g03_03', date: '2026-06-22', time: '21:00', teamA: 'Noruega',      teamB: 'Senegal',             scoreA: null, scoreB: null },
  { id: 'g03_04', date: '2026-06-22', time: '21:00', teamA: 'Argentina',    teamB: 'Austria',             scoreA: null, scoreB: null }, // se mueve al 22

  // 23 junio
  { id: 'g03_05', date: '2026-06-23', time: '18:00', teamA: 'Panamá',       teamB: 'Croacia',             scoreA: null, scoreB: null },
  { id: 'g03_06', date: '2026-06-23', time: '18:00', teamA: 'Colombia',     teamB: 'Play. Inter 1',       scoreA: null, scoreB: null },
  { id: 'g03_07', date: '2026-06-23', time: '21:00', teamA: 'Portugal',     teamB: 'Uzbekistán',          scoreA: null, scoreB: null },
  { id: 'g03_08', date: '2026-06-23', time: '21:00', teamA: 'Inglaterra',   teamB: 'Ghana',               scoreA: null, scoreB: null },

  // 24 junio
  { id: 'g03_09', date: '2026-06-24', time: '18:00', teamA: 'Play. UEFA A', teamB: 'Catar',               scoreA: null, scoreB: null },
  { id: 'g03_10', date: '2026-06-24', time: '18:00', teamA: 'Marruecos',    teamB: 'Haití',               scoreA: null, scoreB: null },
  { id: 'g03_11', date: '2026-06-24', time: '21:00', teamA: 'Suiza',        teamB: 'Canadá',              scoreA: null, scoreB: null },
  { id: 'g03_12', date: '2026-06-24', time: '21:00', teamA: 'Escocia',      teamB: 'Brasil',              scoreA: null, scoreB: null },
  { id: 'g03_13', date: '2026-06-24', time: '21:00', teamA: 'Sudáfrica',    teamB: 'Corea del Sur',       scoreA: null, scoreB: null },
  { id: 'g03_14', date: '2026-06-24', time: '18:00', teamA: 'Play. UEFA D', teamB: 'México',              scoreA: null, scoreB: null },

  // 25 junio
  { id: 'g03_15', date: '2026-06-25', time: '18:00', teamA: 'Japón',        teamB: 'Play. UEFA B',        scoreA: null, scoreB: null },
  { id: 'g03_16', date: '2026-06-25', time: '18:00', teamA: 'Túnez',        teamB: 'Países Bajos',        scoreA: null, scoreB: null },
  { id: 'g03_17', date: '2026-06-25', time: '21:00', teamA: 'Curazao',      teamB: 'Costa de Marfil',     scoreA: null, scoreB: null },
  { id: 'g03_18', date: '2026-06-25', time: '21:00', teamA: 'Ecuador',      teamB: 'Alemania',            scoreA: null, scoreB: null },
  { id: 'g03_19', date: '2026-06-25', time: '21:00', teamA: 'Paraguay',     teamB: 'Australia',           scoreA: null, scoreB: null },
  { id: 'g03_20', date: '2026-06-25', time: '18:00', teamA: 'Play. UEFA C', teamB: 'EEUU',                scoreA: null, scoreB: null },

  // 26 junio
  { id: 'g03_21', date: '2026-06-26', time: '18:00', teamA: 'Noruega',      teamB: 'Francia',             scoreA: null, scoreB: null },
  { id: 'g03_22', date: '2026-06-26', time: '18:00', teamA: 'Senegal',      teamB: 'Play. Inter 2',       scoreA: null, scoreB: null },
  { id: 'g03_23', date: '2026-06-26', time: '21:00', teamA: 'Nueva Zelanda',teamB: 'Bélgica',             scoreA: null, scoreB: null },
  { id: 'g03_24', date: '2026-06-26', time: '21:00', teamA: 'Egipto',       teamB: 'Irán',                scoreA: null, scoreB: null },
  { id: 'g03_25', date: '2026-06-26', time: '21:00', teamA: 'Uruguay',      teamB: 'España',              scoreA: null, scoreB: null },
  { id: 'g03_26', date: '2026-06-26', time: '18:00', teamA: 'Cabo Verde',   teamB: 'Arabia Saudí',        scoreA: null, scoreB: null },

  // 27 junio
  { id: 'g03_27', date: '2026-06-27', time: '18:00', teamA: 'Jordania',     teamB: 'Argentina',           scoreA: null, scoreB: null },
  { id: 'g03_28', date: '2026-06-27', time: '18:00', teamA: 'Argelia',      teamB: 'Austria',             scoreA: null, scoreB: null },
  { id: 'g03_29', date: '2026-06-27', time: '21:00', teamA: 'Colombia',     teamB: 'Portugal',            scoreA: null, scoreB: null },
  { id: 'g03_30', date: '2026-06-27', time: '21:00', teamA: 'Play. Inter 1',teamB: 'Uzbekistán',          scoreA: null, scoreB: null },
  { id: 'g03_31', date: '2026-06-27', time: '21:00', teamA: 'Panamá',       teamB: 'Inglaterra',          scoreA: null, scoreB: null },
  { id: 'g03_32', date: '2026-06-27', time: '18:00', teamA: 'Croacia',      teamB: 'Ghana',               scoreA: null, scoreB: null }
];
