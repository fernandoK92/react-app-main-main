import React, { useState } from 'react';
import AdministradorDashboard from './Dashboard';
import Reservations from './Reservations';
import Codes from './Codes';
import NewReservation from './NewReservation';
import MyReservations from './MyReservations';

/* ── Sidebar colours ── */
const sidebarBg = 'linear-gradient(180deg, #0d0d1a 0%, #111827 100%)';
const activeColor = '#3b82f6';

const menuItems = [
  { key: 'dashboard',    icon: '📁', label: 'Inicio' },
  { key: 'reservations', icon: '📋', label: 'Reservas' },
  { key: 'new',          icon: '➕', label: 'Nueva Reserva' },
  { key: 'mine',         icon: '📄', label: 'Mis Reservas' },
  { key: 'codes',        icon: '🔑', label: 'Códigos Únicos' },
];

export default function AdministradorPanel({ onLogout, currentUser }) {
  const [page, setPage] = useState('dashboard');

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0a0a1a', color: '#e0e0e0', fontFamily: "'Poppins', sans-serif" }}>

        {/* ════════ SIDEBAR ════════ */}
        <aside style={{
          width: 240, flexShrink: 0, background: sidebarBg,
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', flexDirection: 'column', padding: '24px 0',
          position: 'sticky', top: 0, height: '100vh',
        }}>
          {/* Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '0 20px 28px',
              userSelect: 'none',
            }}
          >
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                background: 'radial-gradient(circle at 35% 30%, rgba(56,189,248,0.35), rgba(2,6,23,0) 62%)',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 0 18px rgba(0,170,255,0.3)',
              }}
            >
              <svg width="42" height="42" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="csg1-mini" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1e90ff" />
                    <stop offset="100%" stopColor="#0050aa" />
                  </linearGradient>
                  <linearGradient id="csg2-mini" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00c3ff" />
                    <stop offset="100%" stopColor="#0080ee" />
                  </linearGradient>
                  <linearGradient id="csbolt-mini" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#a0deff" />
                  </linearGradient>
                </defs>
                <path
                  d="M145,30 Q165,30 165,50 L165,75 Q150,75 150,60 Q150,45 135,45 L65,45 Q50,45 50,60 L50,140 Q50,155 65,155 L135,155 Q150,155 150,140 Q150,125 165,125 L165,150 Q165,170 145,170 L55,170 Q30,170 30,145 L30,55 Q30,30 55,30 Z"
                  fill="url(#csg1-mini)"
                />
                <line
                  x1="20"
                  y1="125"
                  x2="185"
                  y2="72"
                  stroke="url(#csg2-mini)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  opacity="0.95"
                />
                <polygon
                  points="108,68 90,105 103,105 88,138 120,95 106,95 122,68"
                  fill="url(#csbolt-mini)"
                />
              </svg>
            </div>

            <div style={{ lineHeight: 1.05, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 0, fontWeight: 900, letterSpacing: 2.2 }}>
                <span style={{ color: '#c8dff5', fontSize: 15 }}>CENTRO</span>
                <span style={{ color: '#00aaff', fontSize: 15, textShadow: '0 0 12px rgba(0,170,255,0.35)' }}>SUR</span>
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 8,
                  letterSpacing: 2,
                  color: 'rgba(100,180,255,0.6)',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}
              >
                Distribución de Energía
              </div>
            </div>
          </div>

          {/* Role badge */}
          <div style={{
            margin: '0 16px 28px',
            background: 'linear-gradient(135deg, #f59e0b, #a855f7)',
            borderRadius: 10, padding: '12px 16px',
          }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)' }}>Rol Activo</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Administrador</div>
          </div>

          {/* Menu */}
          <div style={{ padding: '0 12px', flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, color: '#555', textTransform: 'uppercase', padding: '0 8px', marginBottom: 10 }}>Menú Principal</div>
            {menuItems.map(item => {
              const active = page === item.key;
              return (
                <div
                  key={item.key}
                  onClick={() => setPage(item.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', borderRadius: 8, marginBottom: 2,
                    cursor: 'pointer', fontSize: 14, fontWeight: active ? 600 : 400,
                    color: active ? activeColor : '#8892b0',
                    background: active ? 'rgba(59,130,246,0.1)' : 'transparent',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  {item.label}
                </div>
              );
            })}
          </div>

          {/* Logout */}
          <div style={{ padding: '0 12px' }}>
            <div
              onClick={onLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                fontSize: 14, color: '#8892b0', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#ef4444'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8892b0'; }}
            >
              <span style={{ fontSize: 16 }}>←</span>
              Cerrar sesión
            </div>
          </div>
        </aside>

        {/* ════════ MAIN CONTENT ════════ */}
        <main style={{ flex: 1, height: '100vh', overflowY: 'auto', overflowX: 'hidden', padding: '32px 36px' }}>
          {page === 'dashboard' && (
            <AdministradorDashboard onNavigate={setPage} onLogout={onLogout} currentUser={currentUser} />
          )}
          {page === 'reservations' && (
            <Reservations onBack={() => setPage('dashboard')} currentUser={currentUser} />
          )}
          {page === 'codes' && (
            <Codes onBack={() => setPage('dashboard')} />
          )}
          {page === 'new' && (
            <NewReservation
              onBack={() => setPage('dashboard')}
              onViewReservations={() => setPage('mine')}
              currentUser={currentUser}
            />
          )}
          {page === 'mine' && (
            <MyReservations onBack={() => setPage('dashboard')} currentUser={currentUser} />
          )}
        </main>
      </div>
  );
}
