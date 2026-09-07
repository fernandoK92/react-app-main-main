import React from 'react';
import { useReservations } from '../../context/ReservationsContext';
import { getStats } from '../../services/reservationService';
import StatCard from '../../components/StatCard';
import ReservationsTable from '../../components/ReservationsTable';

const cardBg = 'linear-gradient(145deg, #1a1a2e, #16213e)';

const AdministradorDashboard = ({ onNavigate, currentUser }) => {
  const { reservations } = useReservations();
  const stats = getStats(reservations);

  return (
    <div>
      {/* Header */}
      <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 4, fontFamily: "'Sora','Poppins',sans-serif" }}>
        Panel Administrador
      </h1>
      <p style={{ color: '#667', fontSize: 14, marginBottom: 20 }}>Control total del sistema de reservas</p>

      {/* Back button */}
      <button
        onClick={() => onNavigate('dashboard')}
        style={{
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          color: '#8892b0', borderRadius: 8, padding: '6px 16px',
          cursor: 'pointer', fontSize: 13, marginBottom: 28,
        }}
      >
        ← Volver
      </button>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard icon="📋" value={stats.total}     label="Total Reservas"  variant="accent" />
        <StatCard icon="⏳" value={stats.pending}   label="Pendientes"      variant="yellow" />
        <StatCard icon="✅" value={stats.confirmed} label="Confirmadas"     variant="green"  />
        <StatCard icon="❌" value={stats.rejected}  label="Rechazadas"      variant="red"    />
      </div>

      {/* Pending table */}
      <div style={{
        background: cardBg, borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.06)',
        padding: '24px 28px', marginBottom: 24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
            ⚡ Pendientes de Confirmación
          </h3>
          <button
            onClick={() => onNavigate('reservations')}
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#8892b0', borderRadius: 8, padding: '6px 16px',
              cursor: 'pointer', fontSize: 13, fontWeight: 500,
            }}
            
          >
            Ver todas →
          </button>
        </div>
        <ReservationsTable filter="pending" showActions={true} title="" showSearch={true} currentUser={currentUser} />
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <div
          onClick={() => onNavigate('codes')}
          style={{
            background: cardBg, borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.06)',
            padding: 24, cursor: 'pointer',
            transition: 'transform 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
        >
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔑</div>
          <h3 style={{ fontWeight: 600, marginBottom: 4, color: '#fff' }}>Generar Códigos UUID</h3>
          <p style={{ fontSize: 13, color: '#667' }}>Crea y gestiona códigos de un solo uso para reservas especiales</p>
        </div>
        <div
          onClick={() => onNavigate('reservations')}
          style={{
            background: cardBg, borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.06)',
            padding: 24, cursor: 'pointer',
            transition: 'transform 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
        >
          <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
          <h3 style={{ fontWeight: 600, marginBottom: 4, color: '#fff' }}>Gestión de Reservas</h3>
          <p style={{ fontSize: 13, color: '#667' }}>Revisa todas las reservas del sistema y su estado actual</p>
        </div>
      </div>
    </div>
  );
};

export default AdministradorDashboard;
