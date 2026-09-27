/**
 * CalculationStepperBar.jsx — Live step-by-step calculation HUD
 *
 * Adapted from project_simulation's CalculationStepperBar.tsx.
 * Converted from TypeScript + TailwindCSS to plain JSX with inline styles.
 * Connects to HammingSpace's labStore (calculationSteps, currentStepIndex, etc.)
 *
 * Visible during encoding and decoding calculation animations.
 * Shows: step title, math formula, expanded terms, and playback controls.
 */

import React, { useState } from 'react';
import { useLabStore } from '../state/labStore.js';

export default function CalculationStepperBar() {
  const currentStage = useLabStore(s => s.currentStage);
  const calculationSteps = useLabStore(s => s.calculationSteps);
  const currentStepIndex = useLabStore(s => s.currentStepIndex);
  const isAnimationPlaying = useLabStore(s => s.isAnimationPlaying);
  const speedMultiplier = useLabStore(s => s.speedMultiplier);
  const showLiveHUD = useLabStore(s => s.showLiveHUD);

  const playAnimation = useLabStore(s => s.playAnimation);
  const pauseAnimation = useLabStore(s => s.pauseAnimation);
  const nextStep = useLabStore(s => s.nextStep);
  const prevStep = useLabStore(s => s.prevStep);
  const replayAnimation = useLabStore(s => s.replayAnimation);
  const skipAnimation = useLabStore(s => s.skipAnimation);
  const setSpeedMultiplier = useLabStore(s => s.setSpeedMultiplier);
  const setShowLiveHUD = useLabStore(s => s.setShowLiveHUD);
  const dismissLiveHUD = useLabStore(s => s.dismissLiveHUD);

  const [isMinimized, setIsMinimized] = useState(false);

  // Only visible when there are active calculation steps
  if (calculationSteps.length === 0) return null;

  const currentStep = calculationSteps[currentStepIndex];
  if (!currentStep) return null;

  // If user dismissed, show a small pill to reopen
  if (!showLiveHUD) {
    return (
      <div style={styles.wrapper}>
        <button
          style={styles.pill}
          onClick={() => setShowLiveHUD(true)}
          title="Reopen live calculation step viewer"
        >
          🧮 Show Live Step ({currentStepIndex + 1}/{calculationSteps.length})
        </button>
      </div>
    );
  }

  const isEncoding = currentStep.type === 'encoding';
  const progressPercent = Math.round(((currentStepIndex + 1) / calculationSteps.length) * 100);
  const typeColor = isEncoding ? '#60a5fa' : currentStep.type === 'correction' ? '#34d399' : '#a78bfa';
  const typeLabel = isEncoding ? 'Matrix Vector Multiplication' : currentStep.type === 'correction' ? 'Error Correction' : 'Parity Syndrome Verification';

  return (
    <div style={styles.wrapper}>
      <div style={{ ...styles.container, borderColor: `${typeColor}30` }}>

        {/* Progress bar */}
        <div style={styles.progressTrack}>
          <div style={{ ...styles.progressFill, width: `${progressPercent}%`, background: typeColor }} />
        </div>

        {/* Header row */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={{ ...styles.typeIcon, background: `${typeColor}20`, color: typeColor }}>
              🧮
            </div>
            <div>
              <div style={styles.headerRow}>
                <span style={styles.typeLabel}>{typeLabel}</span>
                <span style={{ ...styles.stepCount, color: typeColor }}>
                  {currentStepIndex + 1}/{calculationSteps.length}
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div style={styles.controls}>
            {/* Speed selector */}
            <div style={styles.speedGroup}>
              {[0.5, 1, 2].map(spd => (
                <button
                  key={spd}
                  style={{
                    ...styles.speedBtn,
                    ...(speedMultiplier === spd ? { background: typeColor, color: '#000' } : {}),
                  }}
                  onClick={() => setSpeedMultiplier(spd)}
                >
                  {spd}×
                </button>
              ))}
            </div>

            {/* Playback buttons */}
            <button style={styles.ctrlBtn} onClick={prevStep} title="Previous step">◀</button>
            {isAnimationPlaying ? (
              <button style={{ ...styles.ctrlBtn, ...styles.ctrlBtnActive, background: typeColor, color: '#000' }} onClick={pauseAnimation} title="Pause">⏸</button>
            ) : (
              <button style={{ ...styles.ctrlBtn, ...styles.ctrlBtnActive, background: typeColor, color: '#000' }} onClick={playAnimation} title="Play">▶</button>
            )}
            <button style={styles.ctrlBtn} onClick={nextStep} title="Next step">▶▶</button>
            <button style={styles.ctrlBtn} onClick={replayAnimation} title="Replay">↺</button>
            <button style={styles.ctrlBtn} onClick={skipAnimation} title="Skip to end">⏭</button>

            {/* Minimize/Close */}
            <button style={{ ...styles.ctrlBtn, marginLeft: '4px' }} onClick={dismissLiveHUD} title="Dismiss">✕</button>
          </div>
        </div>

        {/* Step content — only when not minimized */}
        {!isMinimized && (
          <div style={styles.body}>
            <div style={styles.stepTitle}>{currentStep.title}</div>
            <div style={styles.stepSubtitle}>{currentStep.subtitle}</div>

            <div style={styles.formulaBox}>
              <div style={{ ...styles.formulaLabel, color: typeColor }}>Formula</div>
              <div style={styles.formula}>{currentStep.mathFormula}</div>
            </div>

            <div style={styles.termsBox}>
              <div style={styles.termsText}>{currentStep.expandedTerms}</div>
              <div style={{ ...styles.resultText, color: typeColor }}>{currentStep.mod2Result}</div>
            </div>

            {currentStep.explanation && (
              <div style={styles.explanation}>{currentStep.explanation}</div>
            )}
          </div>
        )}

        {/* Minimize toggle */}
        <button
          style={styles.minimizeBtn}
          onClick={() => setIsMinimized(!isMinimized)}
        >
          {isMinimized ? '▲ Expand' : '▼ Minimize'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    position: 'fixed',
    top: '60px',   // below PipelineHUD
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 30,
    width: 'min(700px, calc(100vw - 32px))',
    pointerEvents: 'auto',
  },
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '999px',
    background: 'rgba(15, 23, 42, 0.92)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    color: '#60a5fa',
    fontSize: '11px',
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    fontWeight: 600,
    cursor: 'pointer',
  },
  container: {
    background: 'rgba(10, 15, 30, 0.95)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(100,160,255,0.2)',
    borderRadius: '14px',
    overflow: 'hidden',
    boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
  },
  progressTrack: {
    width: '100%',
    height: '2px',
    background: 'rgba(255,255,255,0.06)',
  },
  progressFill: {
    height: '100%',
    transition: 'width 0.3s ease',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    background: 'rgba(0,0,0,0.3)',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    gap: '12px',
    flexWrap: 'wrap',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: 0,
  },
  typeIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    flexShrink: 0,
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  typeLabel: {
    fontSize: '11px',
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    fontWeight: 700,
    color: '#e2e8f0',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  stepCount: {
    fontSize: '10px',
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    padding: '2px 6px',
    borderRadius: '4px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#94a3b8',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flexShrink: 0,
  },
  speedGroup: {
    display: 'flex',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '6px',
    overflow: 'hidden',
    marginRight: '6px',
  },
  speedBtn: {
    padding: '3px 7px',
    fontSize: '10px',
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    fontWeight: 600,
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  ctrlBtn: {
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#94a3b8',
    fontSize: '11px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    fontFamily: 'inherit',
  },
  ctrlBtnActive: {
    border: 'none',
    fontWeight: 700,
  },
  body: {
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  stepTitle: {
    fontSize: '12px',
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    fontWeight: 700,
    color: '#f1f5f9',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  stepSubtitle: {
    fontSize: '11px',
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    color: '#94a3b8',
  },
  formulaBox: {
    padding: '8px 12px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '8px',
  },
  formulaLabel: {
    fontSize: '9px',
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '3px',
  },
  formula: {
    fontSize: '13px',
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    color: '#e2e8f0',
    fontWeight: 600,
  },
  termsBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  termsText: {
    fontSize: '10px',
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    color: '#94a3b8',
  },
  resultText: {
    fontSize: '11px',
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    fontWeight: 700,
  },
  explanation: {
    fontSize: '11px',
    color: '#94a3b8',
    lineHeight: '1.5',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    borderTop: '1px solid rgba(255,255,255,0.04)',
    paddingTop: '8px',
  },
  minimizeBtn: {
    display: 'block',
    width: '100%',
    padding: '4px',
    background: 'rgba(255,255,255,0.03)',
    border: 'none',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    color: '#64748b',
    fontSize: '10px',
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    cursor: 'pointer',
    transition: 'background 0.15s',
    textAlign: 'center',
  },
};
