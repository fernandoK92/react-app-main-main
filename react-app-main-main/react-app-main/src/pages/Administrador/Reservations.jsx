import React, { useState } from 'react';
import ReservationsTable from '../../components/ReservationsTable';

const cardBg = 'linear-gradient(145deg, #1a1a2e, #16213e)';

const Reservations = ({ onBack, currentUser }) => {
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { key: 'all',       label: 'Todas' },
    { key: 'pending',   label: 'Pendientes' },
    { key: 'confirmed', label: 'Confirmadas' },
    { key: 'rejected',  label: 'Rechazadas' },
  ];

  return (
    <div>
      <button
        onClick={onBack}
        style={{
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          color: '#8892b0', borderRadius: 8, padding: '6px 16px',
          cursor: 'pointer', fontSize: 13, marginBottom: 24,
        }}
      >
        ← Volver al Inicio
      </button>

      <div style={{
        background: cardBg, borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.06)',
        padding: '24px 28px',
      }}>
        <h2 style={{ fontWeight: 700, fontSize: 22, color: '#fff', marginBottom: 18 }}>
          Gestión de Reservas
        </h2>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              style={{
                backgroundColor: activeFilter === f.key ? '#6366f1' : 'rgba(255,255,255,0.06)',
                color: activeFilter === f.key ? '#fff' : '#8892b0',
                border: activeFilter === f.key ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8,
                padding: '7px 18px', cursor: 'pointer', fontWeight: 600, fontSize: 13,
                transition: 'all 0.15s',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <ReservationsTable filter={activeFilter} showActions={true} title="" showSearch={true} currentUser={currentUser} />
      </div>
    </div>
  );
};

export default Reservations;
