/**
 * ZoneNav.jsx — Zone navigation HUD buttons
 *
 * Fixed bottom-of-screen buttons to jump camera between zones.
 * Hamming Space is visually separated ("step aside").
 */

import React from 'react';

const ZONES = [
  { id: 'transmitter', label: '① Transmitter', color: '#f5a623' },
  { id: 'channel', label: '② Channel', color: '#42a5f5' },
  { id: 'receiver', label: '③ Receiver', color: '#42a5f5' },
];

const SIDE_ZONE = { id: 'hamming', label: '◈ Hamming Space', color: '#7c4dff' };

export default function ZoneNav({ activeZone, onNavigate, onToggleVisualizer, isVisualizerOpen }) {
  return (
    <div style={styles.container}>
      <button
        onClick={() => onNavigate('overview')}
        style={{
          ...styles.btn,
          borderColor: '#60a5fa',
          ...(activeZone === 'overview' ? { background: 'rgba(96, 165, 250, 0.25)', color: '#60a5fa' } : {}),
        }}
      >
        ⊙ Overview
      </button>

      <div style={styles.pipelineGroup}>
        {ZONES.map((z) => (
          <button
            key={z.id}
            onClick={() => onNavigate(z.id)}
            style={{
              ...styles.btn,
              borderColor: z.color,
              ...(activeZone === z.id ? { background: z.color + '30', color: z.color } : {}),
            }}
          >
            {z.label}
          </button>
        ))}
      </div>

      <div style={styles.separator}>│</div>

      <button
        onClick={() => onNavigate(SIDE_ZONE.id)}
        style={{
          ...styles.btn,
          ...styles.sideBtn,
          borderColor: SIDE_ZONE.color,
          ...(activeZone === 'hamming' ? { background: SIDE_ZONE.color + '30', color: SIDE_ZONE.color } : {}),
        }}
      >
        {SIDE_ZONE.label}
      </button>

      {onToggleVisualizer && (
        <>
          <div style={styles.separator}>│</div>
          <button
            onClick={onToggleVisualizer}
            style={{
              ...styles.btn,
              borderColor: isVisualizerOpen ? '#f59e0b' : '#3b82f6',
              background: isVisualizerOpen ? 'rgba(245, 158, 11, 0.25)' : 'rgba(59, 130, 246, 0.15)',
              color: isVisualizerOpen ? '#fbbf24' : '#93c5fd',
              fontWeight: 700,
            }}
            title="Open Interactive GF(2) Matrix Calculation Visualizer"
          >
            ✨ How Calculations Work
          </button>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 20px',
    background: 'linear-gradient(0deg, rgba(10,10,20,0.92) 0%, rgba(10,10,20,0.7) 100%)',
    backdropFilter: 'blur(8px)',
    zIndex: 1000,
    fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
    userSelect: 'none',
    borderTop: '1px solid rgba(255,255,255,0.08)',
  },
  pipelineGroup: {
    display: 'flex',
    gap: '6px',
  },
  btn: {
    background: 'transparent',
    color: '#aaa',
    border: '1px solid #444',
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    letterSpacing: '0.3px',
  },
  sideBtn: {
    fontStyle: 'italic',
  },
  separator: {
    color: '#444',
    fontSize: '18px',
    padding: '0 4px',
  },
};
