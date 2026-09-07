import React from 'react';
import { PRICE } from '../config/rooms';

export default function ReservationModal({ isOpen, roomTitle, onClose }) {
  if (!isOpen) return null;

  const code = 'RSV-' + Date.now().toString(36).toUpperCase();

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className={`modal-overlay${isOpen ? ' active' : ''}`} onClick={handleOverlayClick}>
      <div className="modal">
        <div className="success-icon">🎉</div>
        <h2>¡Reserva Confirmada!</h2>
        <p>
          Has reservado la <strong>{roomTitle}</strong> completa.
          <br /><br />
          <strong>Horario:</strong> 9:00 – 11:00
          <br />
          <strong>Total:</strong> ${PRICE.toFixed(2)}
        </p>
        <div className="reservation-code">
          Código de reserva: <strong>{code}</strong>
        </div>
        <button className="btn-close" onClick={onClose}>
          Aceptar
        </button>
      </div>
    </div>
  );
}
