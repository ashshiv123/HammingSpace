import React, { useState } from 'react';
import { useLabStore } from '../state/labStore.js';

export default function SessionLogHUD() {
  const sessionEvents = useLabStore(s => s.sessionEvents);
  const [isOpen, setIsOpen] = useState(false);

  const exportLog = () => {
    const data = JSON.stringify(sessionEvents, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hammingspace_session.json';
    a.click();
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'absolute', top: '15px', right: '15px', zIndex: 10,
          background: '#263238', color: '#fff', border: '1px solid #455a64',
          padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'sans-serif'
        }}
      >
        Show Session Log
      </button>
    );
  }

  return (
    <div style={{
      position: 'absolute', top: '15px', right: '15px', zIndex: 10,
      background: 'rgba(20, 20, 30, 0.95)', border: '1px solid #444',
      padding: '16px', borderRadius: '8px', color: '#fff',
      fontFamily: 'sans-serif', width: '320px', maxHeight: '400px',
      display: 'flex', flexDirection: 'column', boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, color: '#90caf9' }}>Session Log</h3>
        <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}>✕</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '12px', fontSize: '12px', background: '#000', padding: '8px', borderRadius: '4px' }}>
        {sessionEvents.length === 0 && <div style={{ color: '#666' }}>No events recorded yet.</div>}
        {sessionEvents.map((ev, i) => (
          <div key={i} style={{ marginBottom: '8px', borderBottom: '1px solid #222', paddingBottom: '4px' }}>
            <div style={{ color: '#888', fontSize: '10px' }}>{new Date(ev.timestamp).toLocaleTimeString()}</div>
            <div style={{ color: '#00e676', fontWeight: 'bold' }}>{ev.type.toUpperCase()}</div>
            <div style={{ color: '#ccc' }}>Vector: [{ev.vectorSnapshot?.join(', ')}]</div>
            {ev.position && <div style={{ color: '#ff5252' }}>Struck pos: {ev.position}</div>}
            {ev.verdict && <div style={{ color: '#ffb300' }}>Verdict: {ev.verdict}</div>}
          </div>
        ))}
      </div>

      <button onClick={exportLog} style={{
        background: '#1e88e5', color: '#fff', border: 'none', padding: '8px',
        borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
      }}>
        EXPORT JSON
      </button>
    </div>
  );
}
