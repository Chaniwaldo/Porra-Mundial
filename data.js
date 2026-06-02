// data.js – FIFA World Cup 2026™ · Fase de grupos
// Equipos actualizados según el calendario/draw oficial publicado por FIFA.
// Horas en Madrid (CEST, UTC+2).
// Fuente principal: FIFA Fixtures + Final Draw results.

const INITIAL_MATCHES = [
  // Grupo A
  { id: 'gA1', group: 'A', matchday: 1, date: '2026-06-11', time: '21:00', teamA: 'México', teamB: 'Sudáfrica', scoreA: null, scoreB: null },
  { id: 'gA2', group: 'A', matchday: 1, date: '2026-06-12', time: '04:00', teamA: 'Corea del Sur', teamB: 'Chequia', scoreA: null, scoreB: null },
  { id: 'gA3', group: 'A', matchday: 2, date: '2026-06-18', time: '18:00', teamA: 'Chequia', teamB: 'Sudáfrica', scoreA: null, scoreB: null },
  { id: 'gA4', group: 'A', matchday: 2, date: '2026-06-19', time: '04:00', teamA: 'México', teamB: 'Corea del Sur', scoreA: null, scoreB: null },
  { id: 'gA5', group: 'A', matchday: 3, date: '2026-06-25', time: '04:00', teamA: 'Chequia', teamB: 'México', scoreA: null, scoreB: null },
  { id: 'gA6', group: 'A', matchday: 3, date: '2026-06-25', time: '04:00', teamA: 'Sudáfrica', teamB: 'Corea del Sur', scoreA: null, scoreB: null },

  // Grupo B
  { id: 'gB1', group: 'B', matchday: 1, date: '2026-06-12', time: '21:00', teamA: 'Canadá', teamB: 'Bosnia y Herzegovina', scoreA: null, scoreB: null },
  { id: 'gB2', group: 'B', matchday: 1, date: '2026-06-13', time: '21:00', teamA: 'Catar', teamB: 'Suiza', scoreA: null, scoreB: null },
  { id: 'gB3', group: 'B', matchday: 2, date: '2026-06-18', time: '21:00', teamA: 'Suiza', teamB: 'Bosnia y Herzegovina', scoreA: null, scoreB: null },
  { id: 'gB4', group: 'B', matchday: 2, date: '2026-06-19', time: '00:00', teamA: 'Canadá', teamB: 'Catar', scoreA: null, scoreB: null },
  { id: 'gB5', group: 'B', matchday: 3, date: '2026-06-24', time: '21:00', teamA: 'Suiza', teamB: 'Canadá', scoreA: null, scoreB: null },
  { id: 'gB6', group: 'B', matchday: 3, date: '2026-06-24', time: '21:00', teamA: 'Bosnia y Herzegovina', teamB: 'Catar', scoreA: null, scoreB: null },

  // Grupo C
  { id: 'gC1', group: 'C', matchday: 1, date: '2026-06-14', time: '00:00', teamA: 'Brasil', teamB: 'Marruecos', scoreA: null, scoreB: null },
  { id: 'gC2', group: 'C', matchday: 1, date: '2026-06-14', time: '03:00', teamA: 'Haití', teamB: 'Escocia', scoreA: null, scoreB: null },
  { id: 'gC3', group: 'C', matchday: 2, date: '2026-06-20', time: '00:00', teamA: 'Escocia', teamB: 'Marruecos', scoreA: null, scoreB: null },
  { id: 'gC4', group: 'C', matchday: 2, date: '2026-06-20', time: '03:00', teamA: 'Brasil', teamB: 'Haití', scoreA: null, scoreB: null },
  { id: 'gC5', group: 'C', matchday: 3, date: '2026-06-25', time: '00:00', teamA: 'Escocia', teamB: 'Brasil', scoreA: null, scoreB: null },
  { id: 'gC6', group: 'C', matchday: 3, date: '2026-06-25', time: '00:00', teamA: 'Marruecos', teamB: 'Haití', scoreA: null, scoreB: null },

  // Grupo D
  { id: 'gD1', group: 'D', matchday: 1, date: '2026-06-13', time: '03:00', teamA: 'Estados Unidos', teamB: 'Paraguay', scoreA: null, scoreB: null },
  { id: 'gD2', group: 'D', matchday: 1, date: '2026-06-13', time: '06:00', teamA: 'Australia', teamB: 'Turquía', scoreA: null, scoreB: null },
  { id: 'gD3', group: 'D', matchday: 2, date: '2026-06-19', time: '21:00', teamA: 'Estados Unidos', teamB: 'Australia', scoreA: null, scoreB: null },
  { id: 'gD4', group: 'D', matchday: 2, date: '2026-06-20', time: '05:00', teamA: 'Turquía', teamB: 'Paraguay', scoreA: null, scoreB: null },
  { id: 'gD5', group: 'D', matchday: 3, date: '2026-06-26', time: '04:00', teamA: 'Turquía', teamB: 'Estados Unidos', scoreA: null, scoreB: null },
  { id: 'gD6', group: 'D', matchday: 3, date: '2026-06-26', time: '04:00', teamA: 'Paraguay', teamB: 'Australia', scoreA: null, scoreB: null },

  // Grupo E
  { id: 'gE1', group: 'E', matchday: 1, date: '2026-06-14', time: '19:00', teamA: 'Alemania', teamB: 'Curazao', scoreA: null, scoreB: null },
  { id: 'gE2', group: 'E', matchday: 1, date: '2026-06-15', time: '01:00', teamA: 'Costa de Marfil', teamB: 'Ecuador', scoreA: null, scoreB: null },
  { id: 'gE3', group: 'E', matchday: 2, date: '2026-06-20', time: '22:00', teamA: 'Alemania', teamB: 'Costa de Marfil', scoreA: null, scoreB: null },
  { id: 'gE4', group: 'E', matchday: 2, date: '2026-06-21', time: '01:00', teamA: 'Ecuador', teamB: 'Curazao', scoreA: null, scoreB: null },
  { id: 'gE5', group: 'E', matchday: 3, date: '2026-06-26', time: '00:00', teamA: 'Curazao', teamB: 'Costa de Marfil', scoreA: null, scoreB: null },
  { id: 'gE6', group: 'E', matchday: 3, date: '2026-06-26', time: '00:00', teamA: 'Ecuador', teamB: 'Alemania', scoreA: null, scoreB: null },

  // Grupo F
  { id: 'gF1', group: 'F', matchday: 1, date: '2026-06-14', time: '22:00', teamA: 'Países Bajos', teamB: 'Japón', scoreA: null, scoreB: null },
  { id: 'gF2', group: 'F', matchday: 1, date: '2026-06-15', time: '04:00', teamA: 'Dinamarca', teamB: 'Túnez', scoreA: null, scoreB: null },
  { id: 'gF3', group: 'F', matchday: 2, date: '2026-06-20', time: '21:00', teamA: 'Países Bajos', teamB: 'Dinamarca', scoreA: null, scoreB: null },
  { id: 'gF4', group: 'F', matchday: 2, date: '2026-06-20', time: '00:00', teamA: 'Túnez', teamB: 'Japón', scoreA: null, scoreB: null },
  { id: 'gF5', group: 'F', matchday: 3, date: '2026-06-25', time: '21:00', teamA: 'Japón', teamB: 'Dinamarca', scoreA: null, scoreB: null },
  { id: 'gF6', group: 'F', matchday: 3, date: '2026-06-25', time: '21:00', teamA: 'Túnez', teamB: 'Países Bajos', scoreA: null, scoreB: null },

  // Grupo G
  { id: 'gG1', group: 'G', matchday: 1, date: '2026-06-15', time: '21:00', teamA: 'Bélgica', teamB: 'Egipto', scoreA: null, scoreB: null },
  { id: 'gG2', group: 'G', matchday: 1, date: '2026-06-16', time: '03:00', teamA: 'Irán', teamB: 'Nueva Zelanda', scoreA: null, scoreB: null },
  { id: 'gG3', group: 'G', matchday: 2, date: '2026-06-21', time: '21:00', teamA: 'Bélgica', teamB: 'Irán', scoreA: null, scoreB: null },
  { id: 'gG4', group: 'G', matchday: 2, date: '2026-06-22', time: '03:00', teamA: 'Nueva Zelanda', teamB: 'Egipto', scoreA: null, scoreB: null },
  { id: 'gG5', group: 'G', matchday: 3, date: '2026-06-27', time: '03:00', teamA: 'Nueva Zelanda', teamB: 'Bélgica', scoreA: null, scoreB: null },
  { id: 'gG6', group: 'G', matchday: 3, date: '2026-06-27', time: '03:00', teamA: 'Egipto', teamB: 'Irán', scoreA: null, scoreB: null },

  // Grupo H
  { id: 'gH1', group: 'H', matchday: 1, date: '2026-06-15', time: '18:00', teamA: 'España', teamB: 'Cabo Verde', scoreA: null, scoreB: null },
  { id: 'gH2', group: 'H', matchday: 1, date: '2026-06-16', time: '00:00', teamA: 'Arabia Saudí', teamB: 'Uruguay', scoreA: null, scoreB: null },
  { id: 'gH3', group: 'H', matchday: 2, date: '2026-06-21', time: '18:00', teamA: 'España', teamB: 'Arabia Saudí', scoreA: null, scoreB: null },
  { id: 'gH4', group: 'H', matchday: 2, date: '2026-06-22', time: '00:00', teamA: 'Uruguay', teamB: 'Cabo Verde', scoreA: null, scoreB: null },
  { id: 'gH5', group: 'H', matchday: 3, date: '2026-06-27', time: '00:00', teamA: 'Uruguay', teamB: 'España', scoreA: null, scoreB: null },
  { id: 'gH6', group: 'H', matchday: 3, date: '2026-06-27', time: '00:00', teamA: 'Cabo Verde', teamB: 'Arabia Saudí', scoreA: null, scoreB: null },

  // Grupo I
  { id: 'gI1', group: 'I', matchday: 1, date: '2026-06-16', time: '21:00', teamA: 'Francia', teamB: 'Senegal', scoreA: null, scoreB: null },
  { id: 'gI2', group: 'I', matchday: 1, date: '2026-06-17', time: '00:00', teamA: 'Costa Rica', teamB: 'Noruega', scoreA: null, scoreB: null },
  { id: 'gI3', group: 'I', matchday: 2, date: '2026-06-22', time: '21:00', teamA: 'Francia', teamB: 'Costa Rica', scoreA: null, scoreB: null },
  { id: 'gI4', group: 'I', matchday: 2, date: '2026-06-23', time: '00:00', teamA: 'Noruega', teamB: 'Senegal', scoreA: null, scoreB: null },
  { id: 'gI5', group: 'I', matchday: 3, date: '2026-06-26', time: '18:00', teamA: 'Noruega', teamB: 'Francia', scoreA: null, scoreB: null },
  { id: 'gI6', group: 'I', matchday: 3, date: '2026-06-26', time: '18:00', teamA: 'Senegal', teamB: 'Costa Rica', scoreA: null, scoreB: null },

  // Grupo J
  { id: 'gJ1', group: 'J', matchday: 1, date: '2026-06-17', time: '03:00', teamA: 'Austria', teamB: 'Jordania', scoreA: null, scoreB: null },
  { id: 'gJ2', group: 'J', matchday: 1, date: '2026-06-17', time: '03:00', teamA: 'Argentina', teamB: 'Argelia', scoreA: null, scoreB: null },
  { id: 'gJ3', group: 'J', matchday: 2, date: '2026-06-21', time: '18:00', teamA: 'Argentina', teamB: 'Austria', scoreA: null, scoreB: null },
  { id: 'gJ4', group: 'J', matchday: 2, date: '2026-06-22', time: '18:00', teamA: 'Jordania', teamB: 'Argelia', scoreA: null, scoreB: null },
  { id: 'gJ5', group: 'J', matchday: 3, date: '2026-06-27', time: '18:00', teamA: 'Jordania', teamB: 'Argentina', scoreA: null, scoreB: null },
  { id: 'gJ6', group: 'J', matchday: 3, date: '2026-06-27', time: '18:00', teamA: 'Argelia', teamB: 'Austria', scoreA: null, scoreB: null },

  // Grupo K
  { id: 'gK1', group: 'K', matchday: 1, date: '2026-06-17', time: '19:00', teamA: 'Portugal', teamB: 'Canadá/Panamá/El Salvador', scoreA: null, scoreB: null },
  { id: 'gK2', group: 'K', matchday: 1, date: '2026-06-18', time: '01:00', teamA: 'Ghana', teamB: 'Panamá', scoreA: null, scoreB: null },
  { id: 'gK3', group: 'K', matchday: 2, date: '2026-06-23', time: '21:00', teamA: 'Colombia', teamB: 'Canadá/Panamá/El Salvador', scoreA: null, scoreB: null },
  { id: 'gK4', group: 'K', matchday: 2, date: '2026-06-24', time: '03:00', teamA: 'Portugal', teamB: 'Ghana', scoreA: null, scoreB: null },
  { id: 'gK5', group: 'K', matchday: 3, date: '2026-06-28', time: '03:00', teamA: 'Colombia', teamB: 'Portugal', scoreA: null, scoreB: null },
  { id: 'gK6', group: 'K', matchday: 3, date: '2026-06-28', time: '03:00', teamA: 'Panamá', teamB: 'Canadá/Panamá/El Salvador', scoreA: null, scoreB: null },

  // Grupo L
  { id: 'gL1', group: 'L', matchday: 1, date: '2026-06-18', time: '04:00', teamA: 'Uzbekistán', teamB: 'Colombia', scoreA: null, scoreB: null },
  { id: 'gL2', group: 'L', matchday: 1, date: '2026-06-17', time: '22:00', teamA: 'Inglaterra', teamB: 'Croacia', scoreA: null, scoreB: null },
  { id: 'gL3', group: 'L', matchday: 2, date: '2026-06-23', time: '18:00', teamA: 'Panamá', teamB: 'Croacia', scoreA: null, scoreB: null },
  { id: 'gL4', group: 'L', matchday: 2, date: '2026-06-24', time: '00:00', teamA: 'Inglaterra', teamB: 'Ghana', scoreA: null, scoreB: null },
  { id: 'gL5', group: 'L', matchday: 3, date: '2026-06-27', time: '21:00', teamA: 'Colombia', teamB: 'Portugal', scoreA: null, scoreB: null },
  { id: 'gL6', group: 'L', matchday: 3, date: '2026-06-27', time: '21:00', teamA: 'Croacia', teamB: 'Ghana', scoreA: null, scoreB: null }
];
