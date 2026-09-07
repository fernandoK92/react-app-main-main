import React, { useEffect, useRef } from 'react';

export default function SeatTooltip({ data }) {
  const tipRef = useRef(null);

  useEffect(() => {
    function handleMove(e) {
      if (tipRef.current && data) {
        tipRef.current.style.left = (e.clientX + 14) + 'px';
        tipRef.current.style.top = (e.clientY - 10) + 'px';
      }
    }
    document.addEventListener('mousemove', handleMove);
    return () => document.removeEventListener('mousemove', handleMove);
  }, [data]);

  if (!data) return null;

  let statusText = '';
  let statusColor = '#3a7bd5';
  if (data.status === 'occupied') {
    statusText = '🔴 Ocupado';
    statusColor = '#e94560';
  } else if (data.status === 'selected') {
    statusText = '🟢 Seleccionado — click para quitar';
    statusColor = '#2ecc71';
  } else {
    statusText = '🔵 Disponible — click para seleccionar';
    statusColor = '#3a7bd5';
  }

  return (
    <div
      className="seat-tooltip"
      ref={tipRef}
      style={{
        display: 'block',
        left: data.x + 14,
        top: data.y - 10,
      }}
    >
      <div className="tt-label">{data.label}</div>
      <div className="tt-status" style={{ color: statusColor }}>
        {statusText}
      </div>
    </div>
  );
}
