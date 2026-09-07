import React from 'react';
import { getPartitionMode } from '../three/partitionWall';

export default function PartitionControl({ position, onPositionChange }) {
  const mode = getPartitionMode(position);

  const modeLabel = mode === 'general'
    ? 'SALA GENERAL'
    : mode === 'divided'
      ? 'DIVIDIDA'
      : 'MOVIENDO...';

  return (
    <div className="partition-control" id="partitionControl">
      <div className="pc-header">
        <div className="pc-title">🧱 Pared Divisoria Móvil</div>
        <div className={`pc-mode ${mode}`}>{modeLabel}</div>
      </div>
      <div className="partition-slider-wrap">
        <div className="partition-slider-labels">
          <span>← Abierta (General)</span>
          <span>Dividida (Audit. + Capac.) →</span>
        </div>
        <input
          type="range"
          className="partition-slider"
          min="0"
          max="100"
          step="1"
          value={position}
          onChange={(e) => onPositionChange(parseInt(e.target.value))}
        />
      </div>
      <div className="partition-layout-info">
        <div className={`pli-item${mode === 'general' ? ' active' : ''}`}>
          <div className="pli-dot" style={{ background: '#e94560' }}></div> Sala General
        </div>
        <div className={`pli-item${mode === 'divided' ? ' active' : ''}`}>
          <div className="pli-dot" style={{ background: '#ffd200' }}></div> Auditorio
        </div>
        <div className={`pli-item${mode === 'divided' ? ' active' : ''}`}>
          <div className="pli-dot" style={{ background: '#38ef7d' }}></div> Capacitación
        </div>
      </div>
    </div>
  );
}
