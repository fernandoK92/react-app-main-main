import React from 'react';
import ReservationForm from './ReservationForm';
import { useReservationForm } from '../hooks/useReservationForm';
import { EQUIPMENT_LABELS, ROOM_EQUIPMENT } from '../config/rooms';

const mapRoomIdFromContext = (incomingRoomId, incomingRoomTitle) => {
  const normalizedId = (incomingRoomId || '').toString().trim().toLowerCase();
  const normalizedTitle = (incomingRoomTitle || '').toString().trim().toLowerCase();

  if (['auditorio', 'capacitacion', 'computo', 'general'].includes(normalizedId)) {
    return normalizedId;
  }

  if (normalizedTitle.includes('capacit')) return 'capacitacion';
  if (normalizedTitle.includes('auditorio')) return 'auditorio';
  if (normalizedTitle.includes('comput')) return 'computo';
  if (normalizedTitle.includes('general')) return 'general';


  return '';
};

const mapRoomLabelFromId = (roomId, fallbackTitle = '') => {
  if (roomId === 'auditorio') return 'Auditorio';
  if (roomId === 'capacitacion') return 'Capacitación';
  if (roomId === 'computo') return 'Computo';
  if (roomId === 'general') return 'General';
  return fallbackTitle || '';
};

const ReservationRequestModalInner = ({
  roomTitle, roomId, roomType, onClose,
  equipmentVisibility = {},
}) => {
  const equipmentKeys = ROOM_EQUIPMENT[roomType] || [];
  const selectedEquipment = equipmentKeys.filter(k => equipmentVisibility[k] !== false);
  const inactiveEquipment = equipmentKeys.filter(k => equipmentVisibility[k] === false);
  const normalizedRoomId = mapRoomIdFromContext(roomId, roomTitle);
  const normalizedRoomTitle = mapRoomLabelFromId(normalizedRoomId, roomTitle);

  const formHook = useReservationForm({
    roomId: normalizedRoomId,
    rdth449Location: normalizedRoomTitle,
    selectedEquipment,
  });
  const hasRoomSelected = Boolean(formHook.form?.roomId);

  const handleCancel = () => {
    formHook.reset();
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 10000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingTop: '30px',
        paddingBottom: '30px',
        overflowY: 'auto',
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) handleCancel(); }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: hasRoomSelected ? '1320px' : '860px',
          margin: '0 16px',
          background: 'linear-gradient(145deg, #0f0f23, #1a1a2e)',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 25px 80px rgba(0,0,0,0.5)',
          position: 'relative',
          transition: 'max-width 0.25s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleCancel}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '50%', width: '36px', height: '36px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#fca5a5', fontSize: '18px',
          }}
        >
          ✕
        </button>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{
              fontSize: '28px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              width: '48px', height: '48px', borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>📋</span>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#e2e8f0', margin: 0 }}>
                Solicitar Reserva
              </h2>
              <p style={{ fontSize: '13px', color: '#8892b0', margin: 0 }}>
                {roomTitle || 'Completa el formulario R-DTH-449'}
              </p>
            </div>
          </div>
          <div style={{
            height: '2px',
            background: 'linear-gradient(90deg, #6366f1, transparent)',
            borderRadius: '1px',
          }} />
        </div>

        {/* ===== EQUIPAMIENTO — RESUMEN SOLO LECTURA ===== */}
        {equipmentKeys.length > 0 && (
          <div style={{
            background: 'linear-gradient(145deg, #1a1a2e, #16213e)',
            border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: '14px',
            padding: '20px',
            marginBottom: '24px',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '14px', flexWrap: 'wrap', gap: '8px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  fontSize: '22px',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  width: '38px', height: '38px', borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>⚙️</span>
                <div>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#e2e8f0' }}>
                    Equipamiento incluido
                  </span>
                  <p style={{ fontSize: '11px', color: '#8892b0', margin: 0 }}>
                    Basado en tu selección del modelo 3D
                  </p>
                </div>
              </div>
              <span style={{
                padding: '4px 12px',
                background: selectedEquipment.length === equipmentKeys.length
                  ? 'rgba(34,197,94,0.15)' : 'rgba(234,179,8,0.15)',
                border: `1px solid ${selectedEquipment.length === equipmentKeys.length
                  ? 'rgba(34,197,94,0.3)' : 'rgba(234,179,8,0.3)'}`,
                borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                color: selectedEquipment.length === equipmentKeys.length ? '#86efac' : '#fde047',
              }}>
                {selectedEquipment.length}/{equipmentKeys.length} activos
              </span>
            </div>

            {/* Grid de equipos — selección */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '8px',
            }}>
              {equipmentKeys.map((key) => {
                const info = EQUIPMENT_LABELS[key];
                if (!info) return null;
                const isActive = formHook.form.selectedEquipment.includes(key);
                return (
                  <label
                    key={key}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 14px',
                      background: isActive ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.06)',
                      border: `1px solid ${isActive ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.2)'}`,
                      borderRadius: '10px',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() => {
                        const selected = formHook.form.selectedEquipment;
                        if (isActive) {
                          formHook.update('selectedEquipment', selected.filter(e => e !== key));
                        } else {
                          formHook.update('selectedEquipment', [...selected, key]);
                        }
                      }}
                      style={{ marginRight: 8 }}
                    />
                    <span style={{ fontSize: '16px', flexShrink: 0 }}>{info.icon}</span>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? '#e2e8f0' : '#64748b',
                    }}>{info.label}</span>
                  </label>
                );
              })}
            </div>

            {/* Nota para editar */}
            <div style={{
              marginTop: '14px', paddingTop: '12px',
              borderTop: '1px solid rgba(99,102,241,0.12)',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <span style={{ fontSize: '14px' }}>💡</span>
              <p style={{ fontSize: '11px', color: '#8892b0', margin: 0, fontStyle: 'italic' }}>
                Para modificar el equipamiento, cierra este formulario y usa el panel{' '}
                <strong style={{ color: '#a5b4fc' }}>⚙️ Equipamiento de Sala</strong> junto al modelo 3D.
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <ReservationForm
          formHook={formHook}
          showCodeField
          onCancel={handleCancel}
          splitLayout
        />
      </div>
    </div>
  );
};

const ReservationRequestModal = (props) => {
  if (!props.isOpen) return null;

  return <ReservationRequestModalInner {...props} />;
};

export default ReservationRequestModal;
