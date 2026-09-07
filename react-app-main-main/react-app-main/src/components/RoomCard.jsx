import React from 'react';
import PreviewCanvas from './PreviewCanvas';

export default function RoomCard({
  type,
  cardClass,
  previewId,
  previewType,
  label,
  title,
  description,
  stats,
  btnText,
  span2,
  onSelect,
}) {
  return (
    <div
      className={`room-card ${cardClass}`}
      style={span2 ? { gridColumn: 'span 2' } : undefined}
      onClick={() => onSelect(type)}
    >
      <div className="iso-scene">
        <PreviewCanvas canvasId={previewId} type={previewType} />
      </div>
      <div className="room-info">
        <div className="room-label">{label}</div>
        <h3>{title}</h3>
        <p>{description}</p>
        <div className="room-meta">
          {stats.map((s, i) => (
            <div className="room-stat" key={i}>
              <span className="val">{s.val}</span>
              <span className="lbl">{s.lbl}</span>
            </div>
          ))}
        </div>
        <div className="room-btn">
          {btnText}
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </div>
      </div>
    </div>
  );
}
