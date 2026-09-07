import React from 'react';
import ThreeCanvas from './ThreeCanvas';
import SeatMap from './SeatMap';
import Sidebar from './Sidebar';
// Animación flotante para auditorio/capacitación


export default function RoomViewer({
  roomType,
  roomConfig,
  partitionPosition,
  selectedSeats,
  threeType,
  occupied,
  equipmentVisibility,
  onGoBack,
  onPartitionChange,
  onToggleSeat,
  onRemoveSeat,
  onHoverSeat,
  onLeaveSeat,
  onReserve,
  onToggleEquipment,
  onDivisibleModeSelect,
}) {
  return (
    <section className="viewer-section active">
      {/* Header */}
      <div className="viewer-header">
        <h2>
          <span>{roomConfig.icon}</span> <span>{roomConfig.title}</span>
        </h2>
        <button className="btn-back" onClick={onGoBack}>
          ← Volver
        </button>
      </div>



      {/* Layout */}
      <div className="viewer-layout">
        {/* Map container */}
        <div className="room-map-container">
          {/* 3D Canvas */}
          <div className="room-illustration">
            <ThreeCanvas
              roomType={threeType}
              partitionPercent={roomType === 'divisible' ? partitionPosition : undefined}
              selectedSeats={selectedSeats}
              occupiedSeats={occupied}
              equipmentVisibility={equipmentVisibility}
            />
          </div>

          {/* 2D Seat Map (hidden — no individual seat selection) */}
          <div className="seat-map" style={{ display: 'none' }}>
            <div className="seat-map-label">
              Vista superior — Haz click en los asientos para seleccionar
            </div>
            <div className="screen-indicator"></div>
            <SeatMap
              roomType={threeType}
              occupied={occupied}
              selectedSeats={selectedSeats}
              onToggleSeat={onToggleSeat}
              onHoverSeat={onHoverSeat}
              onLeaveSeat={onLeaveSeat}
            />
          </div>

          <div className="map-hint" style={{ display: 'none' }}>
            💡 Click en un asiento para seleccionarlo o deseleccionarlo
          </div>
        </div>

        {/* Sidebar */}
        <Sidebar
          roomType={roomType}
          roomTitle={roomConfig.title}
          btnClass={roomConfig.btnClass}
          selectedSeats={selectedSeats}
          equipmentVisibility={equipmentVisibility}
          onRemoveSeat={onRemoveSeat}
          onReserve={onReserve}
          onToggleEquipment={onToggleEquipment}
          partitionPosition={partitionPosition}
          onPartitionChange={onPartitionChange}
          onDivisibleModeSelect={onDivisibleModeSelect}
        />
      </div>
    </section>
  );
}
