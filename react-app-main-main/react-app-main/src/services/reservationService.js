 import { RESERVATION_STATUS } from '../utils/constants';

export const getStats = (reservations) => {
  return {
    total:     reservations.length,
    pending:   reservations.filter(r => r.status === 'pending').length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    rejected:  reservations.filter(r => r.status === 'rejected').length,
  };
};

export const filterReservations = (reservations, status) => {
  if (!status || status === 'all') return reservations;
  return reservations.filter(r => r.status === status);
};

export const getSlotStatus = (reservations, roomId, date, hour) => {
  const [hourNum] = hour.split(':').map(Number);

  const conflicting = reservations.filter((r) => {
    if (r.roomId !== roomId || r.date !== date) return false;
    if (r.status === RESERVATION_STATUS.REJECTED) return false;

    const [startH] = (r.startTime || '').split(':').map(Number);
    const [endH] = (r.endTime || '').split(':').map(Number);

    return hourNum >= startH && hourNum < endH;
  });

  if (conflicting.length === 0) return { status: 'free' };

  const hasConfirmed = conflicting.some(r => r.status === RESERVATION_STATUS.CONFIRMED);
  if (hasConfirmed) return { status: 'busy', reservation: conflicting[0] };

  return { status: 'pending', reservation: conflicting[0] };
};
