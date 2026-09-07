export const PRICE = 50;

export const ROOMS_CONFIG = {
  computo: {
    title: 'Sala de Cómputo',
    icon: '💻',
    btnClass: 'computo-btn',
    occupied: [2, 5, 8, 13, 17],
  },
  auditorio: {
    title: 'Auditorio',
    icon: '🎤',
    btnClass: 'auditorio-btn',
    occupied: [1, 4, 9, 15, 22, 28, 33, 37, 42, 50],
  },
  capacitacion: {
    title: 'Sala de Capacitación',
    icon: '📚',
    btnClass: 'capacitacion-btn',
    occupied: [3, 7, 11, 18, 21],
  },
  general: {
    title: 'Sala General',
    icon: '🏫',
    btnClass: 'general-btn',
    occupied: [0, 6, 12, 19, 24, 27],
  },
  divisible: {
    title: 'Sala Divisible',
    icon: '🔀',
    btnClass: 'auditorio-btn',
    occupied: [0, 6, 12, 19, 24, 27],
  },
};

export const DIVISIBLE_GENERAL_OCCUPIED = [0, 6, 12, 19, 24, 27];
export const DIVISIBLE_DIVIDED_OCCUPIED = [1, 4, 9, 15, 22, 28, 33, 37, 42, 48, 53, 57, 60, 65];

/* ======= Equipment toggles per room ======= */
export const EQUIPMENT_LABELS = {
  proyector:        { label: 'Proyector',            icon: '📽️' },
  pantalla:         { label: 'Pantalla Interactiva', icon: '🖥️' },
  bocinas_pared:    { label: 'Bocinas de Pared',     icon: '🔊' },
  podio:            { label: 'Podio / Escritorio',   icon: '🎙️' },
  bocinas_tripode:  { label: 'Bocinas de Trípode',   icon: '🔉' },
};

export const ROOM_EQUIPMENT = {
  auditorio:    ['proyector', 'pantalla', 'bocinas_pared', 'podio', 'bocinas_tripode'],
  computo:      ['proyector', 'pantalla', 'bocinas_pared', 'podio'],
  capacitacion: ['proyector', 'pantalla', 'bocinas_pared', 'podio'],
  general:      ['proyector', 'pantalla', 'bocinas_pared', 'podio', 'bocinas_tripode'],
  divisible:    ['proyector', 'pantalla', 'bocinas_pared', 'podio', 'bocinas_tripode'],
};
