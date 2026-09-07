import React from 'react';
import RoomCard from './RoomCard';

export default function RoomSelector({ onSelectRoom }) {
  return (
    <section className="room-selector" id="roomSelector">
      <div className="hero-tag">Salas Centrosur</div>
      <h2>
        <br />
        <span></span>
      </h2>
      <p>Elige el espacio perfecto para tu evento, capacitación o clase. Reserva en segundos.</p>

      <div className="rooms-grid">
        {/* SALA DIVISIBLE */}
        <RoomCard
          type="divisible"
          cardClass="auditorio"
          previewId="previewAuditorio"
          previewType="general"
          label="🔀 Sala con Pared Divisoria Móvil"
          title="Sala Divisible — Auditorio / Capacitación / General"
          description="Sala única con pared móvil: abierta completa es Sala General, dividida a la mitad se convierte en Auditorio + Capacitación. Desliza la pared para configurar el espacio."
          stats={[
            { val: '30–80', lbl: 'Lugares' },
            { val: '3', lbl: 'Modos' },
            { val: 'A/V', lbl: 'Equipado' },
          ]}
          btnText="Configurar y reservar"
          span2
          onSelect={onSelectRoom}
        />

        {/* CÓMPUTO */}
        <RoomCard
          type="computo"
          cardClass="computo"
          previewId="previewComputo"
          previewType="computo"
          label="Laboratorio"
          title="Sala de Cómputo"
          description="Laboratorio equipado con computadoras individuales, perfectas para cursos técnicos y prácticas digitales."
          stats={[
            { val: '20', lbl: 'Equipos' },
            { val: '4', lbl: 'Filas' },
            { val: 'LAN', lbl: '+WiFi' },
          ]}
          btnText="Ver disponibilidad"
          onSelect={onSelectRoom}
        />
      </div>
    </section>
  );
}
