import React from 'react';
import { useLabStore } from '../state/labStore.js';

export default function RoleToggle() {
  const role = useLabStore(s => s.role);
  const setRole = useLabStore(s => s.setRole);

  return (
    <div style={{
      position: 'absolute',
      bottom: '15px',
      left: '15px',
      zIndex: 10,
      background: 'rgba(20, 20, 30, 0.85)',
      padding: '12px 16px',
      borderRadius: '8px',
      border: '1px solid #333',
      color: '#fff',
      fontFamily: 'sans-serif',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }}>
      <div style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#888' }}>
        Current Role
      </div>
      <div style={{ display: 'flex', gap: '8px', background: '#000', padding: '4px', borderRadius: '4px' }}>
        <button
          onClick={() => setRole('encoder')}
          style={{
            background: role === 'encoder' ? '#00e676' : 'transparent',
            color: role === 'encoder' ? '#000' : '#888',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          ENCODER
        </button>
        <button
          onClick={() => setRole('noise_controller')}
          style={{
            background: role === 'noise_controller' ? '#ff5252' : 'transparent',
            color: role === 'noise_controller' ? '#fff' : '#888',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          NOISE CONTROLLER
        </button>
      </div>
    </div>
  );
}
