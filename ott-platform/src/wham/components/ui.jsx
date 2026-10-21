import React from 'react';

export const Avatar = ({ ini, col, size = 38, fontSize = 12, onClick }) => (
    <div onClick={onClick} className={`w-avatar${onClick ? ' w-clickable' : ''}`}
        style={{ width: size, height: size, background: col, fontSize }}>
        {ini}
    </div>
);

// Round play badge; the triangle is a clip-path so it renders at any border weight.
export const Play = ({ size = 46, tri = [15, 17], nudge = 4 }) => (
    <div className="w-play" style={{ width: size, height: size }}>
        <div style={{ width: tri[0], height: tri[1], marginLeft: nudge }} />
    </div>
);

export const Avail = ({ open, until }) => (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span className="w-dot" style={{ background: open ? '#ffd23f' : '#d9d0bb' }} />
        {open ? 'Open to work' : until}
    </span>
);

// Pill selector used for discipline chips and the "When" options in sheets.
export const Chip = ({ active, onClick, children, style }) => (
    <button onClick={onClick} className="w-btn"
        style={{ fontWeight: 700, fontSize: 12, padding: '4px 12px', background: active ? '#14110f' : '#fff', color: active ? '#fff' : '#14110f', ...style }}>
        {children}
    </button>
);
