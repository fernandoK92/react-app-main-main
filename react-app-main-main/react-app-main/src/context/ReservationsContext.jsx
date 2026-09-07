import { createContext, useContext, useState, useEffect } from 'react';

const ReservationsContext = createContext();

const STORAGE_KEY = 'reservations';

export const useReservations = () => {
  const context = useContext(ReservationsContext);
  if (!context) throw new Error('useReservations debe usarse dentro de ReservationsProvider');
  return context;
};

export const ReservationsProvider = ({ children }) => {
  const seedReservations = [
    {
      id: 1,
      title: 'Workshop de Innovación',
      description: 'Taller de innovación y creatividad',
      equipment: 'Pantallas, Infocus, Extensiones eléctricas, Cable USB para reproducir información, Área de cafetería (capacitaciones >3 horas)',
      room: 'Capacitación',
      roomColor: '#a855f7',
      date: '24/02/2026',
      time: '14:00–18:00',
      attendees: 45,
      config: 'Solo sillas',
      configIcon: '🪑',
      requester: 'Carlos López',
      status: 'pending',
      warning: 'Requiere expansión de sala',
    },
    {
      id: 2,
      title: 'Conferencia de Producto',
      description: 'Lanzamiento de nueva línea de productos',
      equipment: 'Infocus, Pantallas, Micrófono',
      room: 'Auditorio',
      roomColor: '#3b82f6',
      date: '25/02/2026',
      time: '15:00–17:00',
      attendees: 80,
      config: 'Teatro',
      configIcon: '🎭',
      requester: 'María López',
      status: 'pending',
      warning: null,
    },
    {
      id: 3,
      title: 'Reunión de Directorio',
      description: 'Sesión ordinaria mensual',
      equipment: 'Infocus, Pantalla',
      room: 'Sala Ejecutiva',
      roomColor: '#f59e0b',
      date: '22/02/2026',
      time: '09:00–11:00',
      attendees: 12,
      config: 'Mesa U',
      configIcon: '🔲',
      requester: 'Ana García',
      status: 'confirmed',
      warning: null,
    },
    {
      id: 4,
      title: 'Capacitación SST',
      description: 'Seguridad y salud en el trabajo',
      equipment: 'Pantallas, Extensiones',
      room: 'Capacitación',
      roomColor: '#a855f7',
      date: '23/02/2026',
      time: '08:00–12:00',
      attendees: 30,
      config: 'Escuela',
      configIcon: '📐',
      requester: 'Luis Torres',
      status: 'confirmed',
      warning: null,
    },
    {
      id: 5,
      title: 'Presentación Anual',
      description: 'Resultados del ejercicio fiscal',
      equipment: 'Infocus, Pantallas, Micrófono, Cámara',
      room: 'Auditorio',
      roomColor: '#3b82f6',
      date: '26/02/2026',
      time: '10:00–13:00',
      attendees: 100,
      config: 'Teatro',
      configIcon: '🎭',
      requester: 'Juan Pérez',
      status: 'confirmed',
      warning: null,
    },
  ];

  const [reservations, setReservations] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('No se pudo leer reservations de localStorage:', e);
    }
    return seedReservations;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
    } catch (e) {
      console.warn('No se pudo guardar reservations en localStorage:', e);
    }
  }, [reservations]);

  const updateReservation = (id, updates) => {
    setReservations(prev =>
      prev.map(r => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const addReservation = async (reservation) => {
    // Modo demo: la reserva se guarda en el navegador (localStorage), sin backend.
    const nueva = {
      ...reservation,
      id: reservation.id ?? Date.now(),
      status: reservation.status || 'pending',
    };
    setReservations(prev => [...prev, nueva]);
    return { success: true, reservation: nueva };
  };

  const deleteReservation = (id) => {
    setReservations(prev => prev.filter(r => r.id !== id));
  };

  return (
    <ReservationsContext.Provider
      value={{ reservations, setReservations, updateReservation, addReservation, deleteReservation }}
    >
      {children}
    </ReservationsContext.Provider>
  );
};

export default ReservationsContext;
