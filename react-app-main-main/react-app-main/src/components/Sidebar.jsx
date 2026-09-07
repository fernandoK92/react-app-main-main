import React from 'react';
import EquipmentPanel from './EquipmentPanel';

export default function Sidebar({
  roomType,
  roomTitle,
  btnClass,
  selectedSeats,
  equipmentVisibility,
  onRemoveSeat,
  onReserve,
  onToggleEquipment,
  partitionPosition,
  onPartitionChange,
  onDivisibleModeSelect,
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      padding: '10px 12px',
      gap: '8px',
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>
      {/* Equipment + Config panels */}
      <div style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        overflow: 'hidden',
        width: '100%',
      }}>
        <EquipmentPanel
          roomType={roomType}
          equipmentVisibility={equipmentVisibility}
          onToggleEquipment={onToggleEquipment}
          partitionPosition={partitionPosition}
          onPartitionChange={onPartitionChange}
          onDivisibleModeSelect={onDivisibleModeSelect}
        />
      </div>

      {/* Reserve button — always visible at bottom */}
      <button
        onClick={onReserve}
        style={{
          flexShrink: 0,
          padding: '10px 0',
          background: 'linear-gradient(135deg, #161aec, #095ae6)',
          color: '#fff',
          border: 'none',
          borderRadius: '10px',
          fontWeight: 700,
          fontSize: '13px',
          cursor: 'pointer',
          transition: 'all 0.3s',
          width: '100%',
          boxSizing: 'border-box',
          fontFamily: 'inherit',
          letterSpacing: '0.02em',
        }}
      >
        📤 Solicitar Reserva
      </button>
    </div>
  );
}
