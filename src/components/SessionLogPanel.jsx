/**
 * SessionLogPanel.jsx — Session data export panel
 *
 * Adapted from project_simulation's SessionLogPanel.tsx.
 * Converted from TypeScript + TailwindCSS to plain JSX with inline styles.
 * Uses HammingSpace's existing sessionEvents from labStore.
 */

import React, { useState } from 'react';
import { useLabStore } from '../state/labStore.js';
import { hammingDistance } from '../lib/gf2.js';

export default function SessionLogPanel() {
  const n = useLabStore(s => s.n);
  const k = useLabStore(s => s.k);
  const dMin = useLabStore(s => s.dMin);
  const t = useLabStore(s => s.t);
  const m = useLabStore(s => s.m);
  const c = useLabStore(s => s.c);
  const r = useLabStore(s => s.r);
  const e = useLabStore(s => s.e);
  const S = useLabStore(s => s.S);
  const corrected = useLabStore(s => s.corrected);
  const G = useLabStore(s => s.G);
  const H = useLabStore(s => s.H);
  const currentStage = useLabStore(s => s.currentStage);
  const verdict = useLabStore(s => s.verdict);
  const sessionEvents = useLabStore(s => s.sessionEvents);

  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const hDist = (c && r && c.length > 0 && r.length === c.length) ? hammingDistance(c, r) : 0;
  const isRecovered = corrected && corrected.length > 0 && c.length > 0 && c.every((val, idx) => val === corrected[idx]);

  const logData = {
    timestamp: new Date().toISOString(),
    codeConfig: {
      blockLength_n: n,
      dimension_k: k,
      parityBits_r: n - k,
      minimumDistance_dMin: dMin,
      correctionCapability_t: t,
      generatorMatrix_G: G,
      parityCheckMatrix_H: H,
    },
    pipelineVectors: {
      message_m: m,
      encodedCodeword_c: c,
      receivedVector_r: r,
      injectedErrorVector_e: e,
      syndromeVector_S: S,
      recoveredVector_cHat: corrected,
    },
    results: {
      hammingDistance: hDist,
      currentStage,
      verdict,
      syndromeStatus: S && S.every(b => b === 0) ? 'ZERO (VALID)' : 'NON-ZERO (ERROR)',
      correctionSuccess: isRecovered,
    },
    sessionEvents,
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(logData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logData, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', `hammingspace-session-(${n},${k})-${Date.now()}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div style={styles.container}>
      {/* Toggle Header */}
      <div style={styles.header} onClick={() => setIsOpen(!isOpen)}>
        <div style={styles.headerLeft}>
          <span style={styles.headerIcon}>📋</span>
          <span style={styles.headerTitle}>SESSION LOG</span>
        </div>
        <span style={styles.chevron}>{isOpen ? '▼' : '▲'}</span>
      </div>

      {/* Expandable body */}
      {isOpen && (
        <div style={styles.body}>
          {/* Quick stats */}
          <div style={styles.statsGrid}>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Code</span>
              <span style={styles.statValue}>({n},{k})</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>d_min</span>
              <span style={styles.statValue}>{dMin}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>t</span>
              <span style={styles.statValue}>{t}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>HD</span>
              <span style={{ ...styles.statValue, color: hDist > 0 ? '#fb7185' : '#34d399' }}>{hDist}</span>
            </div>
          </div>

          {/* Vector display */}
          <div style={styles.vectorSection}>
            <VectorRow label="m" vec={m} color="#ffd54f" />
            <VectorRow label="c" vec={c} color="#00e676" />
            {e && e.some(b => b === 1) && <VectorRow label="e" vec={e} color="#ff5252" />}
            <VectorRow label="r" vec={r} color="#42a5f5" />
            {S && S.length > 0 && <VectorRow label="S" vec={S} color={S.every(b => b === 0) ? '#34d399' : '#ff5252'} />}
          </div>

          {/* Status badge */}
          <div style={{
            ...styles.statusBadge,
            background: verdict === 'corrected' || verdict === 'clean' ? 'rgba(5, 150, 105, 0.15)' : 'rgba(100,116,139,0.1)',
            border: `1px solid ${verdict === 'corrected' || verdict === 'clean' ? '#10b981' : '#475569'}`,
            color: verdict === 'corrected' || verdict === 'clean' ? '#34d399' : '#94a3b8',
          }}>
            {verdict === 'idle' ? '— Awaiting pipeline —' :
              verdict === 'clean' ? '✓ No errors detected' :
              verdict === 'detected' ? '⚠ Error detected' :
              verdict === 'corrected' ? '✓ Successfully corrected' :
              verdict === 'uncorrectable' ? '✗ Beyond correction capacity' :
              `Stage: ${currentStage}`}
          </div>

          {/* Events log */}
          {sessionEvents && sessionEvents.length > 0 && (
            <div style={styles.eventsSection}>
              <div style={styles.eventsTitle}>Events ({sessionEvents.length})</div>
              {sessionEvents.slice(-5).map((ev, i) => (
                <div key={i} style={styles.eventRow}>
                  <span style={styles.eventType}>{ev.type}</span>
                  <span style={styles.eventTime}>{new Date(ev.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div style={styles.actions}>
            <button style={styles.actionBtn} onClick={handleCopyJSON}>
              {copied ? '✓ Copied!' : '⎘ Copy JSON'}
            </button>
            <button style={styles.actionBtn} onClick={handleDownloadJSON}>
              ⬇ Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function VectorRow({ label, vec, color }) {
  if (!vec || vec.length === 0) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontFamily: "'SF Mono', monospace" }}>
      <span style={{ color: '#64748b', width: '14px', textAlign: 'right' }}>{label}</span>
      <span style={{ color: '#475569' }}>=</span>
      <span style={{ color, letterSpacing: '2px' }}>[{vec.join(' ')}]</span>
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
    minWidth: '200px',
    maxWidth: '240px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    background: 'rgba(0,0,0,0.3)',
    cursor: 'pointer',
    userSelect: 'none',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  headerIcon: {
    fontSize: '12px',
  },
  headerTitle: {
    fontSize: '10px',
    fontFamily: "'SF Mono', monospace",
    fontWeight: 700,
    color: '#e2e8f0',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
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
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
    gap: '4px',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '4px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '6px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  statLabel: {
    fontSize: '9px',
    color: '#64748b',
    fontFamily: "'SF Mono', monospace",
  },
  statValue: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#e2e8f0',
    fontFamily: "'SF Mono', monospace",
  },
  vectorSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    padding: '6px',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '6px',
    border: '1px solid rgba(255,255,255,0.04)',
  },
  statusBadge: {
    padding: '5px 8px',
    borderRadius: '6px',
    fontSize: '10px',
    fontFamily: "'SF Mono', monospace",
    textAlign: 'center',
    fontWeight: 600,
  },
  eventsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  eventsTitle: {
    fontSize: '9px',
    color: '#64748b',
    fontFamily: "'SF Mono', monospace",
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '2px',
  },
  eventRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '9px',
    fontFamily: "'SF Mono', monospace",
    color: '#475569',
  },
  eventType: {
    color: '#60a5fa',
    textTransform: 'uppercase',
    fontWeight: 600,
  },
  eventTime: {
    color: '#475569',
  },
  actions: {
    display: 'flex',
    gap: '6px',
  },
  actionBtn: {
    flex: 1,
    padding: '5px 8px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    color: '#94a3b8',
    fontSize: '10px',
    fontFamily: "'SF Mono', monospace",
    cursor: 'pointer',
    transition: 'all 0.15s',
    textAlign: 'center',
  },
};
