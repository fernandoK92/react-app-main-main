import React, { useMemo } from 'react';
import ReservationForm from '../../components/ReservationForm';
import { useReservationForm } from '../../hooks/useReservationForm';

const cardBg = 'linear-gradient(145deg, #1a1a2e, #16213e)';

const getNameFromEmail = (email = '') => {
  if (!email || !email.includes('@')) return '';
  const local = email.split('@')[0] || '';
  return local
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const NewReservation = ({ onBack, currentUser, onViewReservations }) => {
  const presets = useMemo(() => ({
    rdth449RequesterEmail: currentUser?.email || '',
    rdth449RequesterName: currentUser?.name || getNameFromEmail(currentUser?.email),
    createdByUserId: currentUser?.id || currentUser?.email || '',
  }), [currentUser]);

  const formHook = useReservationForm(presets);

  return (
    <div>
      <button
        onClick={onBack}
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#8892b0',
          borderRadius: 8,
          padding: '6px 16px',
          cursor: 'pointer',
          fontSize: 13,
          marginBottom: 24,
        }}
      >
        ← Volver al Inicio
      </button>

      <div
        style={{
          background: cardBg,
          borderRadius: 14,
          border: '1px solid rgba(255,255,255,0.06)',
          padding: '24px 28px',
        }}
      >
        <h2 style={{ fontWeight: 700, fontSize: 22, color: '#fff', marginBottom: 18 }}>
          Nueva Reserva
        </h2>

        <ReservationForm
          formHook={formHook}
          showCodeField
          onCancel={onBack}
          splitLayout
          onViewReservations={onViewReservations}
          alwaysShowAvailability
        />
      </div>
    </div>
  );
};

export default NewReservation;
