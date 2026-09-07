export const RESERVATION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  REJECTED: 'rejected',
};

export const SETUP_TYPES = {
  MESAS_SILLAS: 'mesas-sillas',
  SOLO_SILLAS: 'solo-sillas',
};

export const ROOMS = [
  {
    id: 'auditorio',
    name: 'Auditorio',
    capacityWithTables: 30,
    capacityChairsOnly: 60,
    expandable: true,
    maxExpansion: 66,
  },
  {
    id: 'capacitacion',
    name: 'Capacitación',
    capacityWithTables: 30,
    capacityChairsOnly: 60,
    expandable: true,
    maxExpansion: 66,
  },
  {
    id: 'computo',
    name: 'Computo',
    capacityWithTables: 14,
    capacityChairsOnly: 14,
    expandable: true,
    maxExpansion: 50,
  },
];

export const GENERAL_ROOM = {
  id: 'general',
  name: 'General',
  capacityWithTables: 72,
  capacityChairsOnly: 120,
  expandable: false,
  maxExpansion: 0,
};

export const HOURS = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
];

export const TRAINING_ROOM_RESOURCES = [
  'Pantallas',
  'Infocus',
  'Micrófono Audio',
  'Extensiones eléctricas',
  'Lápiz óptico',
  'Cable USB para reproducir información en pantallas',
];
