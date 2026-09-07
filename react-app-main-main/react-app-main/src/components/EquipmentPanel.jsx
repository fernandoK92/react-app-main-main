import React from 'react';
import { EQUIPMENT_LABELS, ROOM_EQUIPMENT } from '../config/rooms';
import DivisibleModeSelector from './DivisibleModeSelector';

export default function EquipmentPanel({
  roomType, equipmentVisibility, onToggleEquipment,
  partitionPosition, onPartitionChange,
  onDivisibleModeSelect,
}) {
  const equipmentKeys = ROOM_EQUIPMENT[roomType] || [];
  const isDivisible = roomType === 'divisible';

  if (equipmentKeys.length === 0 && !isDivisible) return null;

  return (
    <>
      {/* ===== CUADRO 1: Equipamiento de Sala ===== */}
      {equipmentKeys.length > 0 && (
        <div style={{
          background: 'linear-gradient(145deg, rgba(15,15,35,0.95), rgba(26,26,46,0.95))',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: '10px',
          padding: '10px 12px',
          flexShrink: 0,
          width: '100%',
          boxSizing: 'border-box',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{
              fontSize: '14px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              width: '24px', height: '24px', borderRadius: '5px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>⚙️</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0' }}>
              Equipamiento de Sala
            </span>
            <span style={{
              marginLeft: 'auto', fontSize: '9px', padding: '2px 6px',
              background: 'rgba(99,102,241,0.1)', borderRadius: '8px',
              color: '#a5b4fc', fontWeight: 600,
            }}>
              {equipmentKeys.filter(k => equipmentVisibility[k] !== false).length}/{equipmentKeys.length}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', width: '100%' }}>
            {equipmentKeys.map((key) => {
              const info = EQUIPMENT_LABELS[key];
              const isVisible = equipmentVisibility[key] !== false;
              return (
                <label
                  key={key}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '4px 6px',
                    background: isVisible ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isVisible ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={() => onToggleEquipment(key)}
                    style={{ display: 'none' }}
                  />
                  <div style={{
                    width: '12px', height: '12px', borderRadius: '3px',
                    border: `1.5px solid ${isVisible ? '#6366f1' : '#4a5568'}`,
                    background: isVisible ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {isVisible && (
                      <svg width="7" height="7" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span style={{ fontSize: '12px' }}>{info.icon}</span>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: isVisible ? 600 : 400,
                    color: isVisible ? '#e2e8f0' : '#64748b',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{info.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== CUADRO 2: Configuración de Sala Divisible (separado) ===== */}
      {isDivisible && (
        <DivisibleModeSelector
          partitionPosition={partitionPosition}
          onModeChange={onPartitionChange}
          onSelectedModeChange={onDivisibleModeSelect}
        />
      )}
    </>
  );
}
