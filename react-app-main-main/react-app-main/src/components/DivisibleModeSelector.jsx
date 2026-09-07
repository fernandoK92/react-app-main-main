import React, { useState, useRef, useEffect } from 'react';

const MODES = [
  { id: 'auditorio', label: 'Auditorio', icon: '🎭', capacity: 30, targetValue: 100 },
  { id: 'capacitacion', label: 'Capacitación', icon: '📚', capacity: 30, targetValue: 100 },
  { id: 'general', label: 'Sala General', icon: '🏛️', capacity: 60, targetValue: 0 },
]; 


export default function DivisibleModeSelector({ partitionPosition, onModeChange, onSelectedModeChange }) {
  const [animating, setAnimating] = useState(false);
  const [selectedMode, setSelectedMode] = useState(
    partitionPosition < 30 ? 'general' : 'auditorio'
  );
  const rafRef = useRef(null);

  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const animatePartition = (from, to, callback) => {
    const duration = 500;
    const startTime = performance.now();
    const diff = to - from;
    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      callback(Math.round(from + diff * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setAnimating(false);
      }
    };
    rafRef.current = requestAnimationFrame(step);
  };

  const handleModeClick = (mode) => {
    if (animating || mode.id === selectedMode) return;
    setAnimating(true);
    setSelectedMode(mode.id);
    if (onSelectedModeChange) {
      onSelectedModeChange(mode.id);
    }
    animatePartition(partitionPosition, mode.targetValue, onModeChange);
  };

  const isGeneral = partitionPosition < 30;

  return (
    <div style={{
      background: 'linear-gradient(145deg, rgba(15,15,35,0.95), rgba(26,26,46,0.95))',
      border: '1px solid rgba(99,102,241,0.2)',
      borderRadius: '10px',
      padding: '10px 12px',
      flexShrink: 0,
      width: '100%',
      boxSizing: 'border-box',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{
          fontSize: '14px',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          width: '24px', height: '24px', borderRadius: '5px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>🧱</span>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0' }}>
          Configuración de Sala
        </span>
      </div>

      {/* 3-column grid buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
        {MODES.map((mode) => {
          const isActive = mode.id === selectedMode;
          return (
            <button
              key={mode.id}
              onClick={() => handleModeClick(mode)}
              disabled={animating}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: '2px', padding: '6px 2px',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))'
                  : 'rgba(255,255,255,0.03)',
                border: isActive
                  ? '1.5px solid rgba(99,102,241,0.5)'
                  : '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                cursor: animating ? 'wait' : 'pointer',
                transition: 'all 0.25s ease',
                opacity: animating ? 0.7 : 1,
                fontFamily: 'inherit', color: 'inherit',
              }}
            >
              <span style={{ fontSize: '18px' }}>{mode.icon}</span>
              <span style={{
                fontSize: '10px', fontWeight: isActive ? 700 : 500,
                color: isActive ? '#e2e8f0' : '#8892b0', lineHeight: 1.2,
              }}>{mode.label}</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                <span style={{
                  fontSize: '14px', fontWeight: 800,
                  color: isActive ? '#a5b4fc' : '#4a5568', lineHeight: 1,
                }}>{mode.capacity}</span>
                <span style={{ fontSize: '7px', color: '#64748b', fontWeight: 600 }}>pers.</span>
              </div>
              {isActive && (
                <div style={{
                  width: '5px', height: '5px', borderRadius: '50%',
                  background: '#22c55e', boxShadow: '0 0 4px rgba(34,197,94,0.6)',
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Status */}
      <div style={{
        marginTop: '6px', padding: '4px 8px',
        background: isGeneral ? 'rgba(34,197,94,0.08)' : 'rgba(99,102,241,0.08)',
        border: `1px solid ${isGeneral ? 'rgba(34,197,94,0.15)' : 'rgba(99,102,241,0.15)'}`,
        borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '5px',
      }}>
        <div style={{
          width: '5px', height: '5px', borderRadius: '50%',
          background: isGeneral ? '#22c55e' : '#6366f1',
        }} />
        <span style={{ fontSize: '9px', color: '#8892b0' }}>
          {isGeneral
            ? '🏛️ Sala General (60 pers.)'
            : `🧱 ${selectedMode === 'capacitacion' ? 'Capacitación' : 'Auditorio'} (30 pers.)`}
        </span>
      </div>
    </div>
  );
}
