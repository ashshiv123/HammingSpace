/**
 * PipelineHUD.jsx — Persistent HTML/CSS overlay across the top
 *
 * Shows: m → G → c → e → r → H → S → correction
 * Current stage from labStore.currentStage is visually highlighted.
 */

import React from 'react';
import { useLabStore } from '../state/labStore.js';

const STAGES = [
  { key: 'compose', label: 'm' },
  { key: 'G', label: 'G' },
  { key: 'encoded', label: 'c' },
  { key: 'in-flight', label: 'e' },
  { key: 'received', label: 'r' },
  { key: 'H', label: 'H' },
  { key: 'decoded', label: 'S' },
  { key: 'corrected', label: 'correction' },
];

function getActiveIndex(currentStage) {
  switch (currentStage) {
    case 'compose':
      return 0;
    case 'encoded':
      return 2;
    case 'in-flight':
      return 3;
    case 'received':
      return 4;
    case 'decoded':
      return 6;
    case 'corrected':
      return 7;
    default:
      return 0;
  }
}

export default function PipelineHUD() {
  const currentStage = useLabStore((s) => s.currentStage);
  const activeIdx = getActiveIndex(currentStage);

  return (
    <div style={styles.container}>
      {STAGES.map((stage, i) => {
        const isActive = i <= activeIdx;
        const isCurrent = i === activeIdx;
        return (
          <React.Fragment key={stage.key}>
            {i > 0 && (
              <div
                style={{
                  ...styles.arrow,
                  color: isActive ? '#64ffda' : '#555',
                }}
              >
                →
              </div>
            )}
            <div
              style={{
                ...styles.node,
                ...(isCurrent ? styles.currentNode : {}),
                ...(isActive && !isCurrent ? styles.activeNode : {}),
                ...(!isActive ? styles.inactiveNode : {}),
              }}
            >
              {stage.label}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    padding: '10px 20px',
    background: 'linear-gradient(180deg, rgba(10,10,20,0.95) 0%, rgba(10,10,20,0.75) 100%)',
    backdropFilter: 'blur(8px)',
    zIndex: 1000,
    fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
    userSelect: 'none',
    borderBottom: '1px solid rgba(100, 255, 218, 0.15)',
  },
  node: {
    padding: '6px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 600,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap',
  },
  currentNode: {
    background: 'rgba(100, 255, 218, 0.2)',
    color: '#64ffda',
    border: '1px solid rgba(100, 255, 218, 0.5)',
    boxShadow: '0 0 12px rgba(100, 255, 218, 0.25)',
  },
  activeNode: {
    background: 'rgba(100, 255, 218, 0.08)',
    color: '#80cbc4',
    border: '1px solid rgba(100, 255, 218, 0.15)',
  },
  inactiveNode: {
    background: 'transparent',
    color: '#555',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  arrow: {
    fontSize: '14px',
    fontWeight: 'bold',
    padding: '0 2px',
    transition: 'color 0.3s ease',
  },
};
