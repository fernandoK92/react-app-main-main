import React from 'react';

const variantColors = {
  accent: { border: '#6366f1', iconBg: 'rgba(99,102,241,0.15)' },
  yellow: { border: '#f59e0b', iconBg: 'rgba(245,158,11,0.15)' },
  green:  { border: '#10b981', iconBg: 'rgba(16,185,129,0.15)' },
  red:    { border: '#ef4444', iconBg: 'rgba(239,68,68,0.15)' },
};

const StatCard = ({ icon, value, label, variant = 'accent' }) => {
  const c = variantColors[variant] || variantColors.accent;

  return (
    <div
      style={{
        background: 'linear-gradient(145deg, #1a1a2e, #16213e)',
        border: `1px solid ${c.border}44`,
        borderRadius: 14,
        padding: '22px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow accent top-right */}
      <div style={{
        position: 'absolute', top: -30, right: -30, width: 80, height: 80,
        borderRadius: '50%', background: c.border, opacity: 0.07, filter: 'blur(20px)',
      }} />
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: c.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, marginBottom: 14,
      }}>{icon}</div>
      <div style={{ fontSize: 34, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, color: '#8892b0', marginTop: 4 }}>{label}</div>
    </div>
  );
};

export default StatCard;
