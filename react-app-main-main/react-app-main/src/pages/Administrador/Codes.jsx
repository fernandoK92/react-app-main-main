import React, { useEffect, useState } from 'react';
import {
  clearUniqueCodes,
  generateUniqueCode,
  getUniqueCodes,
  markUniqueCodeAsUsed,
} from '../../services/uniqueCodeService';

const cardBg = 'linear-gradient(145deg, #1a1a2e, #16213e)';

const Codes = ({ onBack }) => {
  const [codes, setCodes] = useState([]);

  useEffect(() => {
    setCodes(getUniqueCodes());
  }, []);

  const refreshCodes = () => {
    setCodes(getUniqueCodes());
  };

  const generateCode = () => {
    generateUniqueCode();
    refreshCodes();
  };

  const markAsUsed = (code) => {
    markUniqueCodeAsUsed(code);
    refreshCodes();
  };

  const clearHistory = () => {
    clearUniqueCodes();
    refreshCodes();
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
  };

  const formatDateTime = (value) => {
    if (!value) return '—';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleString('es-ES');
  };

  return (
    <div>
      <h1 style={{ fontWeight: 700, fontSize: 22, color: '#fff', marginBottom: 8 }}>
        Códigos Únicos UUID
      </h1>
      <p style={{ color: '#8892b0', marginBottom: 26, fontSize: 13 }}>
        Generación y gestión de códigos de un solo uso
      </p>

      <button
        onClick={onBack}
        style={{
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          color: '#8892b0', borderRadius: 8, padding: '6px 16px',
          cursor: 'pointer', fontSize: 13, marginBottom: 24,
        }}
        
      >
        ← Volver
      </button>

      <div style={{
        background: cardBg, borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.06)',
        padding: '24px 28px',
      }}>
        <h2 style={{ fontWeight: 700, fontSize: 22, color: '#fff', marginBottom: 18 }}>
          🔑 Generador de Códigos Únicos
        </h2>

        <p style={{ color: '#8892b0', marginBottom: 20, fontSize: 14 }}>
          Los códigos UUID son de un solo uso. Solo el Administrador puede generarlos. Se utilizan para crear reservas especiales con privilegio elevado.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={generateCode}
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #6366f1)', color: '#fff',
              border: 'none', borderRadius: 12,
              padding: '12px 22px', cursor: 'pointer', fontWeight: 700, fontSize: 16,
            }}
          >
            + Generar nuevo código
          </button>
          <button
            onClick={clearHistory}
            style={{
              background: '#ef4444', color: '#fff',
              border: 'none', borderRadius: 12,
              padding: '12px 22px', cursor: 'pointer', fontWeight: 700, fontSize: 16,
            }}
          >
            🗑 Limpiar historial
          </button>
        </div>
      </div>

      <div style={{
        marginTop: 20,
        background: cardBg, borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.06)',
        padding: '24px 28px',
      }}>
        <h3 style={{ fontWeight: 700, fontSize: 22, color: '#fff', marginBottom: 18 }}>
          Historial de Códigos ({codes.length})
        </h3>

        {codes.length === 0 ? (
          <p style={{ color: '#556', fontStyle: 'italic', fontSize: 13 }}>
            No hay códigos generados aún. Haz clic en "Generar nuevo código" para comenzar.
          </p>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {codes.map((c) => (
              <div
                key={c.id}
                style={{
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.03)',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    fontFamily: 'monospace',
                    color: c.used ? '#64748b' : '#60a5fa',
                    fontSize: 22,
                    fontWeight: 700,
                    textDecoration: c.used ? 'line-through' : 'none',
                    opacity: c.used ? 0.8 : 1,
                    letterSpacing: 0.3,
                  }}
                >
                  {c.code}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ color: '#64748b', fontSize: 13 }}>
                    Creado: {formatDateTime(c.createdAt)}
                  </span>
                  {c.used && (
                    <span style={{ color: '#64748b', fontSize: 13 }}>
                      Usado: {formatDateTime(c.usedAt)}
                    </span>
                  )}
                  <span
                    style={{
                      borderRadius: 999,
                      padding: '4px 12px',
                      fontSize: 12,
                      fontWeight: 700,
                      border: c.used
                        ? '1px solid rgba(239,68,68,0.35)'
                        : '1px solid rgba(16,185,129,0.35)',
                      background: c.used
                        ? 'rgba(239,68,68,0.12)'
                        : 'rgba(16,185,129,0.12)',
                      color: c.used ? '#f87171' : '#34d399',
                    }}
                  >
                    {c.used ? 'USADO' : 'DISPONIBLE'}
                  </span>

                  {!c.used && (
                    <button
                      onClick={() => copyToClipboard(c.code)}
                      style={{
                        backgroundColor: 'rgba(99,102,241,0.15)', color: '#818cf8',
                        border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8,
                        padding: '6px 12px', cursor: 'pointer', fontSize: 14, fontWeight: 600,
                      }}
                    >
                      Copiar
                    </button>
                  )}
                  {!c.used && (
                    <button
                      onClick={() => markAsUsed(c.code)}
                      style={{
                        backgroundColor: 'rgba(245,158,11,0.15)', color: '#f59e0b',
                        border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8,
                        padding: '6px 12px', cursor: 'pointer', fontSize: 14, fontWeight: 600,
                      }}
                    >
                      Marcar usado
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Codes;
