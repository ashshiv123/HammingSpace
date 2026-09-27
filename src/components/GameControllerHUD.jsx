/**
 * GameControllerHUD.jsx — WASD camera controller HUD
 *
 * Adapted from project_simulation's GameControllerHUD.tsx.
 * Converted from TypeScript + TailwindCSS to plain JSX with inline styles.
 * Provides touch/click accessible WASD buttons for camera movement.
 * Dispatches synthetic keyboard events to work with CameraController's key detection.
 */

import React, { useState } from 'react';

const KEYS_DOWN = new Set();

function sendKey(code, isDown) {
  const eventType = isDown ? 'keydown' : 'keyup';
  const event = new KeyboardEvent(eventType, { code, bubbles: true });
  document.dispatchEvent(event);
}

export default function GameControllerHUD({ onResetCamera }) {
  const [isOpen, setIsOpen] = useState(false);

  const btnStyle = (key) => ({
    ...styles.key,
    position: 'relative',
  });

  const KeyBtn = ({ code, label, sub, title }) => (
    <button
      style={styles.key}
      onMouseDown={() => sendKey(code, true)}
      onMouseUp={() => sendKey(code, false)}
      onMouseLeave={() => sendKey(code, false)}
      onTouchStart={(e) => { e.preventDefault(); sendKey(code, true); }}
      onTouchEnd={(e) => { e.preventDefault(); sendKey(code, false); }}
      title={title}
    >
      <span style={styles.keyLabel}>{label}</span>
      {sub && <span style={styles.keySub}>{sub}</span>}
    </button>
  );

  return (
    <div style={styles.container}>
      {/* Header toggle */}
      <div style={styles.header} onClick={() => setIsOpen(!isOpen)}>
        <div style={styles.headerLeft}>
          <span style={{ fontSize: '12px' }}>🧭</span>
          <span style={styles.headerTitle}>WASD FREE CAMERA</span>
        </div>
        <span style={styles.chevron}>{isOpen ? '▼' : '▲'}</span>
      </div>

      {/* Expandable body */}
      {isOpen && (
        <div style={styles.body}>
          <div style={styles.hint}>WASD to fly • Mouse drag to look</div>

          {/* D-Pad */}
          <div style={styles.dpadWrapper}>
            <div style={styles.dpad}>
              {/* Forward */}
              <div style={styles.dpadRow}>
                <KeyBtn code="KeyW" label="W" sub="FWD" title="Move Camera Forward (W)" />
              </div>
              {/* Left / Back / Right */}
              <div style={styles.dpadRow}>
                <KeyBtn code="KeyA" label="A" sub="LFT" title="Strafe Left (A)" />
                <KeyBtn code="KeyS" label="S" sub="BCK" title="Move Camera Backward (S)" />
                <KeyBtn code="KeyD" label="D" sub="RGT" title="Strafe Right (D)" />
              </div>
            </div>

            {/* Elevation */}
            <div style={styles.elevation}>
              <KeyBtn code="Space" label="▲" sub="UP" title="Fly Up (Space)" />
              <KeyBtn code="KeyQ" label="▼" sub="DN" title="Fly Down (Q)" />
            </div>
          </div>

          {/* Sprint hint */}
          <div style={styles.hint}>Hold Shift for sprint</div>

          {/* Reset button */}
          {onResetCamera && (
            <button style={styles.resetBtn} onClick={onResetCamera}>
              ⊙ Reset to Overview
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    background: 'rgba(15, 23, 42, 0.92)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(148, 163, 184, 0.12)',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
    userSelect: 'none',
    maxWidth: '200px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '7px 12px',
    background: 'rgba(0,0,0,0.3)',
    cursor: 'pointer',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  headerTitle: {
    fontSize: '10px',
    fontFamily: "'SF Mono', monospace",
    fontWeight: 700,
    color: '#e2e8f0',
    letterSpacing: '0.06em',
  },
  chevron: {
    fontSize: '10px',
    color: '#64748b',
  },
  body: {
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    alignItems: 'center',
  },
  hint: {
    fontSize: '9px',
    color: '#64748b',
    fontFamily: "'SF Mono', monospace",
    textAlign: 'center',
  },
  dpadWrapper: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  dpad: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    alignItems: 'center',
  },
  dpadRow: {
    display: 'flex',
    gap: '3px',
  },
  elevation: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    paddingLeft: '4px',
    borderLeft: '1px solid rgba(255,255,255,0.06)',
  },
  key: {
    width: '34px',
    height: '34px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '7px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#e2e8f0',
    cursor: 'pointer',
    transition: 'all 0.1s',
    fontFamily: "'SF Mono', monospace",
    gap: '1px',
  },
  keyLabel: {
    fontSize: '11px',
    fontWeight: 700,
    lineHeight: 1,
  },
  keySub: {
    fontSize: '7px',
    color: '#64748b',
    lineHeight: 1,
  },
  resetBtn: {
    width: '100%',
    padding: '5px',
    background: 'rgba(59,130,246,0.1)',
    border: '1px solid rgba(59,130,246,0.3)',
    borderRadius: '6px',
    color: '#93c5fd',
    fontSize: '10px',
    fontFamily: "'SF Mono', monospace",
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
    textAlign: 'center',
  },
};
