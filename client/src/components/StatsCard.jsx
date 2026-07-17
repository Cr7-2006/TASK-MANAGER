import React from 'react';

const StatsCard = ({ title, value, icon, color, gradient }) => {
  return (
    <div className="glass-panel" style={{
      padding: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flex: 1,
      minWidth: '220px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative gradient glow in background */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-50%',
        width: '120px',
        height: '120px',
        background: gradient || 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
        filter: 'blur(20px)',
        zIndex: 0,
        pointerEvents: 'none',
      }}></div>

      <div style={{ zIndex: 1 }}>
        <span style={{
          fontSize: '0.85rem',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>{title}</span>
        <h2 style={{
          fontSize: '2.2rem',
          fontWeight: 800,
          marginTop: '0.5rem',
          color: 'white',
          lineHeight: 1,
        }}>{value}</h2>
      </div>

      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: color ? `${color}15` : 'rgba(255, 255, 255, 0.05)',
        border: `1px solid ${color ? `${color}30` : 'rgba(255, 255, 255, 0.1)'}`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: color || 'white',
        zIndex: 1,
      }}>
        {icon}
      </div>
    </div>
  );
};

export default StatsCard;
