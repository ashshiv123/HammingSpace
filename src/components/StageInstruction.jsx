/**
 * StageInstruction.jsx — Contextual stage instruction bar
 *
 * Adapted from project_simulation's StageInstruction.tsx.
 * Converted from TypeScript + TailwindCSS to plain JSX with inline styles.
 * Connects to HammingSpace's labStore (currentStage, verdict, S, e, errorPosition).
 */

import React from 'react';
import { useLabStore } from '../state/labStore.js';

const ICONS = {
  sparkles: '✦',
  radio: '◎',
  zap: '⚡',
  check: '✓',
  alert: '⚠',
};

function getInstruction(currentStage, verdict, S, e, errorPosition) {
  const hasError = e && e.some(b => b === 1);
  const hasNonZeroSyndrome = S && S.length > 0 && !S.every(b => b === 0);

  switch (currentStage) {
    case 'encoded':
    case 'in-flight':
      if (hasError) {
        return {
          step: 'Step 2 of 4',
          title: 'Channel Noise Injected',
          text: `Bit flipped! Errors detected. Click "SEND TO RECEIVER →" in the channel to proceed to decoding.`,
          accent: '#fb7185',
          badgeBg: '#4c0519',
          badgeBorder: '#f43f5e',
          badgeColor: '#fda4af',
          icon: ICONS.zap,
          iconColor: '#fb7185',
        };
      }
      return {
        step: 'Step 2 of 4',
        title: 'Channel Propagation',
        text: 'Codeword in transit. Click any bit node on the packet to inject noise, or click "SEND TO RECEIVER →" to proceed clean.',
        accent: '#60a5fa',
        badgeBg: '#172554',
        badgeBorder: '#3b82f6',
        badgeColor: '#93c5fd',
        icon: ICONS.radio,
        iconColor: '#60a5fa',
      };

    case 'received':
      return {
        step: 'Step 3 of 4',
        title: 'Run Syndrome Diagnostics',
        text: 'Codeword arrived at Receiver. Click "RUN DIAGNOSTICS" on the right to compute parity syndrome S = r·Hᵀ.',
        accent: '#a78bfa',
        badgeBg: '#2e1065',
        badgeBorder: '#8b5cf6',
        badgeColor: '#c4b5fd',
        icon: ICONS.radio,
        iconColor: '#a78bfa',
      };

    case 'decoded':
      if (verdict === 'clean') {
        return {
          step: 'Step 4 of 4',
          title: 'Clean — No Errors Detected',
          text: 'Syndrome S = [000] • All parity checks passed. The received vector is a valid codeword.',
          accent: '#34d399',
          badgeBg: '#022c22',
          badgeBorder: '#10b981',
          badgeColor: '#6ee7b7',
          icon: ICONS.check,
          iconColor: '#34d399',
        };
      }
      if (verdict === 'detected' || hasNonZeroSyndrome) {
        return {
          step: 'Step 4 of 4',
          title: 'Parity Error Detected',
          text: `Non-zero syndrome S=[${S.join('')}] isolates corrupted bit. Click "APPLY CORRECTION" to restore the codeword.`,
          accent: '#fb7185',
          badgeBg: '#4c0519',
          badgeBorder: '#f43f5e',
          badgeColor: '#fda4af',
          icon: ICONS.alert,
          iconColor: '#fb7185',
        };
      }
      return {
        step: 'Step 4 of 4',
        title: 'Syndrome Computed',
        text: `S = [${(S || []).join('')}] — check the Receiver station for details.`,
        accent: '#60a5fa',
        badgeBg: '#172554',
        badgeBorder: '#3b82f6',
        badgeColor: '#93c5fd',
        icon: ICONS.radio,
        iconColor: '#60a5fa',
      };

    case 'corrected':
      return {
        step: 'Complete ✓',
        title: 'Codeword Restored',
        text: 'Offending bit inverted back to valid code space via coset decoding. Click Reset to start a new transmission.',
        accent: '#34d399',
        badgeBg: '#022c22',
        badgeBorder: '#10b981',
        badgeColor: '#6ee7b7',
        icon: ICONS.check,
        iconColor: '#34d399',
      };

    default: // 'compose'
      return {
        step: 'Step 1 of 4',
        title: 'Compose Message',
        text: "Toggle the physical bit switches at the Transmitter Station to compose your message m, then click the green ENCODE & SEND button.",
        accent: '#60a5fa',
        badgeBg: '#172554',
        badgeBorder: '#3b82f6',
        badgeColor: '#93c5fd',
        icon: ICONS.sparkles,
        iconColor: '#60a5fa',
      };
  }
}

export default function StageInstruction() {
  const currentStage = useLabStore(s => s.currentStage);
  const verdict = useLabStore(s => s.verdict);
  const S = useLabStore(s => s.S);
  const e = useLabStore(s => s.e);
  const errorPosition = useLabStore(s => s.errorPosition);

  const info = getInstruction(currentStage, verdict, S, e, errorPosition);

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        {/* Ambient glow overlay */}
        <div style={{
          ...styles.glow,
          background: `linear-gradient(to right, ${info.accent}18, transparent)`,
        }} />

        {/* Icon badge */}
        <div style={styles.iconBadge}>
          <span style={{ fontSize: '18px', color: info.iconColor }}>{info.icon}</span>
        </div>

        {/* Text */}
        <div style={styles.textBlock}>
          <div style={styles.topRow}>
            <span style={{
              ...styles.stepBadge,
              background: info.badgeBg,
              border: `1px solid ${info.badgeBorder}`,
              color: info.badgeColor,
            }}>
              {info.step}
            </span>
            <span style={{ ...styles.title, color: info.accent }}>
              {info.title}
            </span>
          </div>
          <p style={styles.text}>{info.text}</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    position: 'fixed',
    bottom: '56px',  // above ZoneNav
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 20,
    width: 'min(600px, calc(100vw - 32px))',
    pointerEvents: 'none',
  },
  container: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 16px',
    background: 'rgba(15, 23, 42, 0.92)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(148, 163, 184, 0.15)',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    opacity: 0.15,
  },
  iconBadge: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'rgba(15, 23, 42, 0.8)',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    zIndex: 1,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
    zIndex: 1,
  },
  topRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '2px',
  },
  stepBadge: {
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '9px',
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    flexShrink: 0,
  },
  title: {
    fontSize: '12px',
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    fontWeight: 700,
    letterSpacing: '0.04em',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  text: {
    fontSize: '11px',
    color: '#cbd5e1',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    lineHeight: '1.45',
    margin: 0,
  },
};
