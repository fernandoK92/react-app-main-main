import React from 'react';
import { useDateTime } from '../hooks/useDateTime';

export default function Header({ onLoginClick, user, onLogout }) {
  const { dateStr, timeStr } = useDateTime();

  return (
    <header>
      {/* Left spacer */}
      <div className="header-info" style={{ flex: 1 }}>
        <span>📅 <strong>{dateStr}</strong></span>
        <span>🕐 <strong>{timeStr}</strong></span>
      </div>

      {/* CentroSur Logo */}
      <div className="cs-logo-header">
        <div className="cs-icon-wrap">
          <div className="cs-glow"></div>
          <svg className="cs-svg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="csg1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#1e90ff' }} />
                <stop offset="100%" style={{ stopColor: '#0050aa' }} />
              </linearGradient>
              <linearGradient id="csg2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#00c3ff' }} />
                <stop offset="100%" style={{ stopColor: '#0080ee' }} />
              </linearGradient>
              <linearGradient id="csbolt" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#ffffff' }} />
                <stop offset="100%" style={{ stopColor: '#a0deff' }} />
              </linearGradient>
              <filter id="csglow">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* C */}
            <path
              d="M145,30 Q165,30 165,50 L165,75 Q150,75 150,60 Q150,45 135,45
                 L65,45 Q50,45 50,60 L50,140 Q50,155 65,155 L135,155
                 Q150,155 150,140 Q150,125 165,125 L165,150
                 Q165,170 145,170 L55,170 Q30,170 30,145 L30,55
                 Q30,30 55,30 Z"
              fill="url(#csg1)"
            />
            {/* Slash */}
            <line
              x1="20" y1="125" x2="185" y2="72"
              stroke="url(#csg2)" strokeWidth="3.5" strokeLinecap="round"
              opacity="0.9" filter="url(#csglow)"
            />
            {/* Bolt */}
            <polygon
              className="cs-bolt"
              points="108,68 90,105 103,105 88,138 120,95 106,95 122,68"
              fill="url(#csbolt)" filter="url(#csglow)"
            />
          </svg>
        </div>
        <div className="cs-text">
          <div className="cs-wordmark">
            <span className="cs-word-dark">CENTRO</span>
            <span className="cs-word-blue">SUR</span>
          </div>
          <span className="cs-sub">Distribución de Energía</span>
        </div>
      </div>

      {/* Login / User area */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        {user ? (
          <div className="header-user">
            <div className="header-user-avatar">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <span className="header-user-email">{user.email}</span>
            {/* Botón logout Uiverse.io */}
            <button
              className="Btn"
              onClick={() => {
                if (onLogout) onLogout();
                window.location.href = '/';
              }}
            >
              <div className="sign"><svg viewBox="0 0 512 512"><path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path></svg></div>
              <div className="text">Logout</div>
            </button>
          </div>
        ) : (
          <button className="btn-login" onClick={onLoginClick}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Iniciar Sesión
          </button>
        )}
      </div>
    </header>
  );
}
