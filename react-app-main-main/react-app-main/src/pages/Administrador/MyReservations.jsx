import React from 'react';
import ReservationsTable from '../../components/ReservationsTable';

const cardBg = 'linear-gradient(145deg, #1a1a2e, #16213e)';

const MyReservations = ({ onBack, currentUser }) => {
  return (
    <div>
      <h1 style={{ fontWeight: 700, fontSize: 44, color: '#fff', marginBottom: 4, lineHeight: 1.1 }}>
        Mis Reservas
      </h1>
      <p style={{ color: '#8892b0', marginBottom: 26, fontSize: 24 }}>
        Seguimiento de tus solicitudes
      </p>

      <button
        onClick={onBack}
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#8892b0',
          borderRadius: 10,
          padding: '7px 16px',
          cursor: 'pointer',
          fontSize: 22,
          marginBottom: 24,
          fontWeight: 500,
        }}
      >
        ← Volver
      </button>

      <div
        style={{
          background: cardBg,
          borderRadius: 14,
          border: '1px solid rgba(255,255,255,0.06)',
          padding: '24px 28px',
        }}
      >
        <ReservationsTable
          filter="mine"
          showActions={false}
          title="Mis Reservas"
          showSearch
          currentUser={currentUser}
        />
      </div>
    </div>
  );
};

export default MyReservations;
