import React from 'react';

const alertStyles = {
  base: {
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 500,
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  error: {
    background: 'rgba(239, 68, 68, 0.15)',
    color: '#fca5a5',
    border: '1px solid rgba(239, 68, 68, 0.3)',
  },
  success: {
    background: 'rgba(34, 197, 94, 0.15)',
    color: '#86efac',
    border: '1px solid rgba(34, 197, 94, 0.3)',
  },
  warning: {
    background: 'rgba(234, 179, 8, 0.15)',
    color: '#fde047',
    border: '1px solid rgba(234, 179, 8, 0.3)',
  },
  info: {
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#a5b4fc',
    border: '1px solid rgba(99, 102, 241, 0.3)',
  },
};

const icons = {
  error: '⚠',
  success: '✅',
  warning: '⚡',
  info: 'ℹ️',
};

const Alert = ({ type = 'info', children }) => {
  const style = { ...alertStyles.base, ...(alertStyles[type] || alertStyles.info) };
  return (
    <div style={style}>
      <span>{icons[type] || icons.info}</span>
      <span>{children}</span>
    </div>
  );
};

export default Alert;
