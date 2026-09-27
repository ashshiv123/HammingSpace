import React from 'react';
import { useLabStore } from '../state/labStore.js';

export default function ModeSelector() {
  const mode = useLabStore((s) => s.mode);
  const setMode = useLabStore((s) => s.setMode);

  const modes = [
    { id: 'beginner', label: 'Beginner Mode' },
    { id: 'guided', label: 'Guided Teaching' },
    { id: 'free', label: 'Free Experimentation' },
    { id: 'custom', label: 'Custom Code Lab' },
    { id: 'capacity', label: 'Capacity Test' },
  ];

  return (
    <div style={{
      position: 'absolute',
      top: '15px',
      right: '160px',
      zIndex: 10,
      background: 'rgba(20, 20, 30, 0.85)',
      padding: '12px 16px',
      borderRadius: '8px',
      border: '1px solid #333',
      color: '#fff',
      fontFamily: 'sans-serif',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      <div style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#888' }}>
        Lab Mode
      </div>
      <select 
        value={mode} 
        onChange={(e) => setMode(e.target.value)}
        style={{
          background: '#000',
          color: '#00e676',
          border: '1px solid #444',
          padding: '6px',
          borderRadius: '4px',
          outline: 'none',
          cursor: 'pointer'
        }}
      >
        {modes.map(m => (
          <option key={m.id} value={m.id}>{m.label}</option>
        ))}
      </select>
    </div>
  );
}
