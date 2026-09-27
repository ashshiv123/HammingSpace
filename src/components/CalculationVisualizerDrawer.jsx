/**
 * CalculationVisualizerDrawer.jsx — Interactive step-by-step matrix visualizer drawer
 *
 * Adapted from project_simulation's CalculationVisualizerDrawer.tsx.
 * Converted from TypeScript + TailwindCSS to plain JSX with responsive inline styling.
 * Connects to HammingSpace's labStore (n, k, G, H, m, c, r, S, errorPosition, etc.)
 *
 * Features:
 * - Tab 1: Encoding (c = m · G) with focused term multiplier, interactive G grid, and XOR sum
 * - Tab 2: Syndrome & Correction (S = r · Hᵀ) with parity check breakdown and error column matching
 * - Interactive bit flip toggles, presets, and auto-play
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Grid,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useLabStore } from '../state/labStore.js';

export default function CalculationVisualizerDrawer({ isOpen, onClose }) {
  const n = useLabStore(s => s.n);
  const k = useLabStore(s => s.k);
  const G = useLabStore(s => s.G);
  const H = useLabStore(s => s.H);
  const m = useLabStore(s => s.m);
  const c = useLabStore(s => s.c);
  const rVec = useLabStore(s => s.r);
  const S = useLabStore(s => s.S);
  const currentStage = useLabStore(s => s.currentStage);
  const setMessageBit = useLabStore(s => s.setMessageBit);
  const encode = useLabStore(s => s.encode);
  const injectErrorAtPosition = useLabStore(s => s.injectErrorAtPosition);
  const decode = useLabStore(s => s.decode);
  const correctError = useLabStore(s => s.correctError);

  const r = n - k;
  const [activeTab, setActiveTab] = useState('encoding');

  // Active target column & row for focused multiplication in Encoding
  const [activeColIndex, setActiveColIndex] = useState(0);
  const [activeEncodingRow, setActiveEncodingRow] = useState(0);

  // Active parity row & column in Syndrome
  const [activeRowIndex, setActiveRowIndex] = useState(0);
  const [activeSyndromeCol, setActiveSyndromeCol] = useState(0);

  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Auto-play timer
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      if (activeTab === 'encoding') {
        setActiveEncodingRow((prevRow) => {
          if (prevRow + 1 < k) {
            return prevRow + 1;
          } else {
            setActiveColIndex((prevCol) => (prevCol + 1) % n);
            return 0;
          }
        });
      } else if (activeTab === 'syndrome') {
        setActiveSyndromeCol((prevCol) => {
          if (prevCol + 1 < n) {
            return prevCol + 1;
          } else {
            setActiveRowIndex((prevRow) => (prevRow + 1) % r);
            return 0;
          }
        });
      }
    }, 1200);
    return () => clearInterval(interval);
  }, [isAutoPlaying, activeTab, k, n, r]);

  // Sync tab with stage
  useEffect(() => {
    if (['decoded', 'corrected', 'in-flight', 'received'].includes(currentStage)) {
      setActiveTab('syndrome');
    } else {
      setActiveTab('encoding');
    }
  }, [currentStage]);

  // Calculations for active Encoding term
  const curMBit = m[activeEncodingRow] ?? 0;
  const curGBit = G[activeEncodingRow]?.[activeColIndex] ?? 0;
  const curTermProduct = curMBit & curGBit;

  // Active terms for current column c_j
  const activeColTerms = useMemo(() => {
    return Array.from({ length: k }).map((_, row) => {
      const mVal = m[row] ?? 0;
      const gVal = G[row]?.[activeColIndex] ?? 0;
      return {
        row,
        mVal,
        gVal,
        product: mVal & gVal,
        isActive: mVal === 1,
      };
    });
  }, [k, m, G, activeColIndex]);

  const activeNonZeroTerms = activeColTerms.filter((t) => t.isActive);
  const curColResultBit = activeNonZeroTerms.reduce((acc, t) => acc ^ t.gVal, 0);

  // Calculations for active Syndrome term
  const curRBit = rVec[activeSyndromeCol] ?? 0;
  const curHBit = H[activeRowIndex]?.[activeSyndromeCol] ?? 0;
  const curSynProduct = curRBit & curHBit;

  const curSynRowTerms = useMemo(() => {
    return Array.from({ length: n }).map((_, col) => {
      const rVal = rVec[col] ?? 0;
      const hVal = H[activeRowIndex]?.[col] ?? 0;
      return {
        col,
        rVal,
        hVal,
        product: rVal & hVal,
        isChecked: hVal === 1,
      };
    });
  }, [n, rVec, H, activeRowIndex]);

  const activeNonZeroSynTerms = curSynRowTerms.filter((t) => t.isChecked);
  const curSynRowResult = activeNonZeroSynTerms.reduce((acc, t) => acc ^ t.rVal, 0);

  // Match syndrome against columns of H
  const matchingColumnIndex = useMemo(() => {
    if (!S || S.length === 0 || S.every((b) => b === 0)) return -1;
    for (let col = 0; col < n; col++) {
      let matches = true;
      for (let row = 0; row < r; row++) {
        if ((H[row]?.[col] ?? 0) !== (S[row] ?? 0)) {
          matches = false;
          break;
        }
      }
      if (matches) return col;
    }
    return -1;
  }, [S, H, n, r]);

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.iconBox}>
              <Sparkles size={16} color="#60a5fa" />
            </div>
            <div>
              <div style={styles.titleRow}>
                <span style={styles.title}>HOW CALCULATIONS WORK</span>
                <span style={styles.badge}>GF(2) Matrix Math Engine</span>
              </div>
              <p style={styles.subtitle}>
                Click any cell or bit to inspect matrix multiplication & GF(2) XOR arithmetic
              </p>
            </div>
          </div>

          <div style={styles.headerRight}>
            {/* Tabs */}
            <div style={styles.tabGroup}>
              <button
                style={{
                  ...styles.tabBtn,
                  background: activeTab === 'encoding' ? '#2563eb' : 'transparent',
                  color: activeTab === 'encoding' ? '#ffffff' : '#94a3b8',
                }}
                onClick={() => setActiveTab('encoding')}
              >
                1. Encoding (c = m·G)
              </button>
              <button
                style={{
                  ...styles.tabBtn,
                  background: activeTab === 'syndrome' ? '#2563eb' : 'transparent',
                  color: activeTab === 'syndrome' ? '#ffffff' : '#94a3b8',
                }}
                onClick={() => setActiveTab('syndrome')}
              >
                2. Syndrome (S = r·Hᵀ)
              </button>
            </div>

            {/* Collapse toggle */}
            <button
              style={styles.iconBtn}
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? 'Expand' : 'Collapse'}
            >
              {isCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {/* Close */}
            <button style={styles.iconBtnClose} onClick={onClose} title="Close Visualizer">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        {!isCollapsed && (
          <div style={styles.body}>
            {/* ──────── TAB 1: ENCODING ──────── */}
            {activeTab === 'encoding' && (
              <div style={styles.tabContent}>
                {/* Input Message Controls */}
                <div style={styles.panelCard}>
                  <div style={styles.panelHeader}>
                    <span style={styles.sectionTitle}>
                      Input Message vector m ({k} bits):
                    </span>
                    <div style={styles.bitList}>
                      {m.map((bit, idx) => (
                        <button
                          key={idx}
                          style={{
                            ...styles.bitBtn,
                            background: bit === 1 ? '#2563eb' : '#1e293b',
                            color: bit === 1 ? '#ffffff' : '#94a3b8',
                            borderColor: bit === 1 ? '#60a5fa' : '#334155',
                          }}
                          onClick={() => {
                            setMessageBit(idx);
                            encode();
                          }}
                          title={`Toggle bit m[${idx}]`}
                        >
                          <span style={styles.bitLabel}>m{idx}</span>
                          <span style={styles.bitVal}>{bit}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={styles.controlRow}>
                    <button
                      style={styles.miniBtn}
                      onClick={() => {
                        for (let i = 0; i < k; i++) {
                          setMessageBit(i, Math.random() > 0.5 ? 1 : 0);
                        }
                        encode();
                      }}
                    >
                      🎲 Randomize
                    </button>
                    <button
                      style={styles.miniBtn}
                      onClick={() => {
                        for (let i = 0; i < k; i++) setMessageBit(i, 0);
                        encode();
                      }}
                    >
                      Reset 0s
                    </button>
                    <button
                      style={{ ...styles.miniBtn, background: '#1d4ed8', color: '#fff' }}
                      onClick={() => encode()}
                    >
                      ⚡ Recompute Codeword
                    </button>
                  </div>
                </div>

                {/* Column Stepper Toolbar */}
                <div style={styles.stepperBar}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={styles.stepperLabel}>Target Codeword Column:</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {Array.from({ length: n }).map((_, col) => (
                        <button
                          key={col}
                          style={{
                            ...styles.colBtn,
                            background: activeColIndex === col ? '#3b82f6' : '#1e293b',
                            color: activeColIndex === col ? '#fff' : '#94a3b8',
                            border: activeColIndex === col ? '1px solid #60a5fa' : '1px solid #334155',
                          }}
                          onClick={() => {
                            setActiveColIndex(col);
                            setIsAutoPlaying(false);
                          }}
                        >
                          c{col}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Play / Next Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      style={styles.iconBtn}
                      onClick={() => setActiveEncodingRow((prev) => (prev - 1 + k) % k)}
                      title="Previous Row"
                    >
                      <SkipBack size={14} />
                    </button>
                    <button
                      style={{
                        ...styles.playBtn,
                        background: isAutoPlaying ? '#d97706' : '#2563eb',
                      }}
                      onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                    >
                      {isAutoPlaying ? <Pause size={13} /> : <Play size={13} />}
                      <span>{isAutoPlaying ? 'Pause' : 'Auto Step'}</span>
                    </button>
                    <button
                      style={styles.iconBtn}
                      onClick={() => setActiveEncodingRow((prev) => (prev + 1) % k)}
                      title="Next Row"
                    >
                      <SkipForward size={14} />
                    </button>
                  </div>
                </div>

                {/* Split Layout: Focused Multiplier Box & Interactive G Matrix */}
                <div style={styles.splitGrid}>
                  {/* Left: Focused Term Multiplier */}
                  <div style={styles.boxCard}>
                    <div style={styles.boxHeader}>
                      <span style={{ color: '#60a5fa', fontWeight: 700, fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Zap size={14} color="#60a5fa" />
                        CALCULATION BOX: Row {activeEncodingRow} × Column c{activeColIndex}
                      </span>
                      <span style={styles.pillTag}>Term {activeEncodingRow + 1} of {k}</span>
                    </div>

                    {/* Math Expression: m_i * G[i][j] = term */}
                    <div style={styles.formulaRow}>
                      <div style={styles.operandBox}>
                        <span style={styles.operandSub}>Message m{activeEncodingRow}</span>
                        <div style={{ ...styles.operandVal, background: curMBit === 1 ? '#2563eb' : '#1e293b' }}>
                          {curMBit}
                        </div>
                      </div>

                      <span style={styles.operator}>×</span>

                      <div style={styles.operandBox}>
                        <span style={styles.operandSub}>G[{activeEncodingRow}][{activeColIndex}]</span>
                        <div style={{ ...styles.operandVal, background: curGBit === 1 ? '#4f46e5' : '#1e293b' }}>
                          {curGBit}
                        </div>
                      </div>

                      <span style={styles.operator}>=</span>

                      <div style={styles.operandBox}>
                        <span style={styles.operandSub}>Product Term</span>
                        <div style={{ ...styles.operandVal, background: curTermProduct === 1 ? '#059669' : '#1e293b', color: curTermProduct === 1 ? '#fff' : '#64748b' }}>
                          {curTermProduct}
                        </div>
                      </div>
                    </div>

                    <div style={styles.explanationText}>
                      {curMBit === 1
                        ? `✓ Message bit m[${activeEncodingRow}] is 1: Row ${activeEncodingRow} is active and contributes ${curGBit} to column c${activeColIndex}.`
                        : `○ Message bit m[${activeEncodingRow}] is 0: Row ${activeEncodingRow} is inactive (0 × ${curGBit} = 0).`}
                    </div>

                    {/* Interactive G Matrix Grid */}
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>
                        Generator Matrix G ({k}×{n}): Click cell to focus
                      </div>
                      <div style={styles.tableWrapper}>
                        <table style={styles.matrixTable}>
                          <thead>
                            <tr>
                              <th style={styles.th}></th>
                              {Array.from({ length: n }).map((_, j) => (
                                <th
                                  key={j}
                                  style={{
                                    ...styles.th,
                                    color: j === activeColIndex ? '#60a5fa' : '#64748b',
                                    background: j === activeColIndex ? 'rgba(59,130,246,0.1)' : 'transparent',
                                  }}
                                >
                                  c{j}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {G.map((row, rIdx) => (
                              <tr key={rIdx}>
                                <td
                                  style={{
                                    ...styles.rowHeader,
                                    color: rIdx === activeEncodingRow ? '#60a5fa' : '#64748b',
                                  }}
                                >
                                  m{rIdx}={m[rIdx]}
                                </td>
                                {row.map((val, cIdx) => {
                                  const isSelected = rIdx === activeEncodingRow && cIdx === activeColIndex;
                                  const isCol = cIdx === activeColIndex;
                                  const isRow = rIdx === activeEncodingRow;
                                  let bg = '#0f172a';
                                  if (isSelected) bg = '#2563eb';
                                  else if (isCol) bg = 'rgba(59,130,246,0.15)';
                                  else if (isRow) bg = 'rgba(99,102,241,0.1)';

                                  return (
                                    <td
                                      key={cIdx}
                                      style={{
                                        ...styles.td,
                                        background: bg,
                                        color: val === 1 ? '#f8fafc' : '#475569',
                                        fontWeight: val === 1 ? 700 : 400,
                                        cursor: 'pointer',
                                      }}
                                      onClick={() => {
                                        setActiveEncodingRow(rIdx);
                                        setActiveColIndex(cIdx);
                                      }}
                                    >
                                      {val}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Right: XOR Sum & Codeword Accumulator */}
                  <div style={styles.boxCard}>
                    <span style={{ color: '#38bdf8', fontWeight: 700, fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Grid size={14} color="#38bdf8" />
                      GF(2) COLUMN XOR SUM: c{activeColIndex}
                    </span>

                    {/* Formula: c_j = sum(m_i * G[i][j]) */}
                    <div style={styles.formulaCode}>
                      c{activeColIndex} = {activeColTerms.map(t => `(m${t.row}·G[${t.row}][${activeColIndex}])`).join(' ⊕ ')}
                    </div>

                    <div style={styles.termsStack}>
                      {activeColTerms.map(t => (
                        <div
                          key={t.row}
                          style={{
                            ...styles.termItem,
                            background: t.row === activeEncodingRow ? 'rgba(59,130,246,0.2)' : 'rgba(15,23,42,0.6)',
                            borderLeft: t.row === activeEncodingRow ? '3px solid #3b82f6' : '3px solid transparent',
                          }}
                        >
                          <span style={{ color: t.isActive ? '#93c5fd' : '#475569' }}>
                            Row {t.row}: {t.mVal} × {t.gVal} = {t.product}
                          </span>
                          <span style={{ color: t.product === 1 ? '#34d399' : '#64748b' }}>
                            {t.isActive ? (t.gVal === 1 ? 'Contributes 1' : 'Contributes 0') : 'Row inactive'}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Result */}
                    <div style={styles.resultBox}>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>Modulo-2 XOR Total:</span>
                      <span style={{ fontSize: '18px', fontWeight: 800, color: '#38bdf8' }}>
                        c[{activeColIndex}] = {curColResultBit}
                      </span>
                    </div>

                    {/* Entire computed codeword */}
                    <div style={{ marginTop: '12px' }}>
                      <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                        Complete Codeword Vector c:
                      </span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {c.map((bit, idx) => (
                          <div
                            key={idx}
                            style={{
                              ...styles.codewordBit,
                              background: idx === activeColIndex ? '#3b82f6' : '#1e293b',
                              color: idx === activeColIndex ? '#ffffff' : idx < k ? '#ffd54f' : '#ff7043',
                            }}
                          >
                            <span style={{ fontSize: '8px', color: '#64748b' }}>c{idx}</span>
                            <span style={{ fontSize: '12px', fontWeight: 700 }}>{bit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ──────── TAB 2: SYNDROME & CORRECTION ──────── */}
            {activeTab === 'syndrome' && (
              <div style={styles.tabContent}>
                {/* Received Vector r & Noise Injection Controls */}
                <div style={styles.panelCard}>
                  <div style={styles.panelHeader}>
                    <span style={styles.sectionTitle}>
                      Received Vector r ({n} bits): Click any bit to inject or clear channel noise
                    </span>
                    <div style={styles.bitList}>
                      {rVec.map((bit, idx) => {
                        const isFlipped = c[idx] !== undefined && bit !== c[idx];
                        return (
                          <button
                            key={idx}
                            style={{
                              ...styles.bitBtn,
                              background: isFlipped ? '#e11d48' : '#1e293b',
                              color: isFlipped ? '#ffffff' : '#94a3b8',
                              borderColor: isFlipped ? '#fb7185' : '#334155',
                            }}
                            onClick={() => {
                              injectErrorAtPosition(idx + 1);
                              decode();
                            }}
                            title={`Toggle bit r[${idx}] ${isFlipped ? '(ERROR FLIPPED)' : '(Clean)'}`}
                          >
                            <span style={styles.bitLabel}>r{idx}</span>
                            <span style={styles.bitVal}>{bit}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div style={styles.controlRow}>
                    <button
                      style={styles.miniBtn}
                      onClick={() => {
                        // Flip a random bit
                        const randPos = Math.floor(Math.random() * n) + 1;
                        injectErrorAtPosition(randPos);
                        decode();
                      }}
                    >
                      ⚡ Inject 1-Bit Noise
                    </button>
                    <button
                      style={styles.miniBtn}
                      onClick={() => {
                        encode();
                        decode();
                      }}
                    >
                      Clear Noise (Clean)
                    </button>
                    <button
                      style={{ ...styles.miniBtn, background: '#10b981', color: '#fff' }}
                      onClick={() => correctError()}
                    >
                      ✓ Correct Detected Bit
                    </button>
                  </div>
                </div>

                {/* Parity Check Stepper Toolbar */}
                <div style={styles.stepperBar}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={styles.stepperLabel}>Target Parity Row:</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {Array.from({ length: r }).map((_, row) => (
                        <button
                          key={row}
                          style={{
                            ...styles.colBtn,
                            background: activeRowIndex === row ? '#8b5cf6' : '#1e293b',
                            color: activeRowIndex === row ? '#fff' : '#94a3b8',
                            border: activeRowIndex === row ? '1px solid #a78bfa' : '1px solid #334155',
                          }}
                          onClick={() => {
                            setActiveRowIndex(row);
                            setIsAutoPlaying(false);
                          }}
                        >
                          S{row}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      style={styles.iconBtn}
                      onClick={() => setActiveSyndromeCol((prev) => (prev - 1 + n) % n)}
                      title="Previous Col"
                    >
                      <SkipBack size={14} />
                    </button>
                    <button
                      style={{
                        ...styles.playBtn,
                        background: isAutoPlaying ? '#d97706' : '#7c3aed',
                      }}
                      onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                    >
                      {isAutoPlaying ? <Pause size={13} /> : <Play size={13} />}
                      <span>{isAutoPlaying ? 'Pause' : 'Auto Step'}</span>
                    </button>
                    <button
                      style={styles.iconBtn}
                      onClick={() => setActiveSyndromeCol((prev) => (prev + 1) % n)}
                      title="Next Col"
                    >
                      <SkipForward size={14} />
                    </button>
                  </div>
                </div>

                {/* Split Layout: Syndrome Formula & H Grid */}
                <div style={styles.splitGrid}>
                  {/* Left: Focused Term Multiplier */}
                  <div style={styles.boxCard}>
                    <div style={styles.boxHeader}>
                      <span style={{ color: '#a78bfa', fontWeight: 700, fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Zap size={14} color="#a78bfa" />
                        PARITY BOX: Row S{activeRowIndex} × Column r{activeSyndromeCol}
                      </span>
                      <span style={styles.pillTag}>Term {activeSyndromeCol + 1} of {n}</span>
                    </div>

                    <div style={styles.formulaRow}>
                      <div style={styles.operandBox}>
                        <span style={styles.operandSub}>Received r{activeSyndromeCol}</span>
                        <div style={{ ...styles.operandVal, background: curRBit === 1 ? '#7c3aed' : '#1e293b' }}>
                          {curRBit}
                        </div>
                      </div>

                      <span style={styles.operator}>×</span>

                      <div style={styles.operandBox}>
                        <span style={styles.operandSub}>H[{activeRowIndex}][{activeSyndromeCol}]</span>
                        <div style={{ ...styles.operandVal, background: curHBit === 1 ? '#6366f1' : '#1e293b' }}>
                          {curHBit}
                        </div>
                      </div>

                      <span style={styles.operator}>=</span>

                      <div style={styles.operandBox}>
                        <span style={styles.operandSub}>Product Term</span>
                        <div style={{ ...styles.operandVal, background: curSynProduct === 1 ? '#059669' : '#1e293b' }}>
                          {curSynProduct}
                        </div>
                      </div>
                    </div>

                    {/* Parity Check Matrix H Table */}
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>
                        Parity-Check Matrix H ({r}×{n}): Click cell to focus
                      </div>
                      <div style={styles.tableWrapper}>
                        <table style={styles.matrixTable}>
                          <thead>
                            <tr>
                              <th style={styles.th}></th>
                              {Array.from({ length: n }).map((_, j) => (
                                <th
                                  key={j}
                                  style={{
                                    ...styles.th,
                                    color: j === matchingColumnIndex ? '#fb7185' : j === activeSyndromeCol ? '#a78bfa' : '#64748b',
                                    background: j === matchingColumnIndex ? 'rgba(244,63,94,0.15)' : j === activeSyndromeCol ? 'rgba(139,92,246,0.1)' : 'transparent',
                                  }}
                                >
                                  r{j}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {H.map((row, rIdx) => (
                              <tr key={rIdx}>
                                <td
                                  style={{
                                    ...styles.rowHeader,
                                    color: rIdx === activeRowIndex ? '#a78bfa' : '#64748b',
                                  }}
                                >
                                  S{rIdx}
                                </td>
                                {row.map((val, cIdx) => {
                                  const isSelected = rIdx === activeRowIndex && cIdx === activeSyndromeCol;
                                  const isMatchCol = cIdx === matchingColumnIndex;
                                  let bg = '#0f172a';
                                  if (isSelected) bg = '#7c3aed';
                                  else if (isMatchCol) bg = 'rgba(244,63,94,0.2)';
                                  else if (cIdx === activeSyndromeCol) bg = 'rgba(139,92,246,0.15)';

                                  return (
                                    <td
                                      key={cIdx}
                                      style={{
                                        ...styles.td,
                                        background: bg,
                                        color: val === 1 ? '#f8fafc' : '#475569',
                                        fontWeight: val === 1 ? 700 : 400,
                                        cursor: 'pointer',
                                      }}
                                      onClick={() => {
                                        setActiveRowIndex(rIdx);
                                        setActiveSyndromeCol(cIdx);
                                      }}
                                    >
                                      {val}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Right: Syndrome Vector & Error Localization Match */}
                  <div style={styles.boxCard}>
                    <span style={{ color: '#c084fc', fontWeight: 700, fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertTriangle size={14} color="#c084fc" />
                      SYNDROME RESULT & ERROR LOCALIZATION
                    </span>

                    {/* Syndrome Vector */}
                    <div style={{ marginTop: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                        Syndrome Vector S = r · Hᵀ:
                      </span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {S && S.length > 0 ? (
                          S.map((bit, idx) => (
                            <div
                              key={idx}
                              style={{
                                ...styles.codewordBit,
                                background: bit === 1 ? '#e11d48' : '#1e293b',
                                color: bit === 1 ? '#fff' : '#64748b',
                                border: bit === 1 ? '1px solid #fb7185' : '1px solid #334155',
                              }}
                            >
                              <span style={{ fontSize: '8px' }}>S{idx}</span>
                              <span style={{ fontSize: '13px', fontWeight: 700 }}>{bit}</span>
                            </div>
                          ))
                        ) : (
                          <span style={{ fontSize: '11px', color: '#64748b' }}>No syndrome computed yet. Click "RUN DIAGNOSTICS".</span>
                        )}
                      </div>
                    </div>

                    {/* Verdict Box */}
                    <div style={styles.verdictCard}>
                      {matchingColumnIndex !== -1 ? (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fb7185', fontWeight: 700, fontSize: '12px' }}>
                            <AlertTriangle size={15} />
                            <span>1-BIT ERROR DETECTED AT POSITION r{matchingColumnIndex}</span>
                          </div>
                          <p style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>
                            Syndrome S = [{S.join(', ')}] matches column {matchingColumnIndex} of matrix H. Inverting bit {matchingColumnIndex} corrects the received word.
                          </p>
                        </div>
                      ) : S && S.length > 0 && S.every(b => b === 0) ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontWeight: 700, fontSize: '12px' }}>
                          <CheckCircle2 size={15} />
                          <span>ALL PARITY CHECKS PASSED (Syndrome is 000 — Clean Codeword)</span>
                        </div>
                      ) : (
                        <div style={{ color: '#94a3b8', fontSize: '11px' }}>
                          Syndrome is currently uncomputed or multiple errors present.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    left: '16px',
    right: '16px',
    bottom: '16px',
    zIndex: 90,
    pointerEvents: 'auto',
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  container: {
    background: 'rgba(11, 15, 25, 0.96)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: '16px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
    overflow: 'hidden',
    maxHeight: '82vh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 18px',
    background: 'rgba(5, 8, 15, 0.8)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  iconBox: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'rgba(59, 130, 246, 0.15)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  title: {
    fontSize: '12px',
    fontWeight: 800,
    color: '#f8fafc',
    letterSpacing: '0.05em',
  },
  badge: {
    fontSize: '9px',
    padding: '2px 6px',
    borderRadius: '4px',
    background: 'rgba(59, 130, 246, 0.2)',
    color: '#93c5fd',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    fontWeight: 600,
  },
  subtitle: {
    fontSize: '10px',
    color: '#94a3b8',
    margin: '2px 0 0 0',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  tabGroup: {
    display: 'flex',
    background: '#090d16',
    borderRadius: '10px',
    padding: '3px',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  tabBtn: {
    padding: '5px 12px',
    borderRadius: '7px',
    border: 'none',
    fontSize: '11px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  iconBtn: {
    background: '#1e293b',
    border: '1px solid #334155',
    color: '#94a3b8',
    borderRadius: '8px',
    padding: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnClose: {
    background: '#1e293b',
    border: '1px solid #334155',
    color: '#f87171',
    borderRadius: '8px',
    padding: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: '16px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  tabContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  panelCard: {
    background: '#070a12',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '10px 14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '10px',
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  sectionTitle: {
    fontSize: '11px',
    color: '#cbd5e1',
    fontWeight: 600,
  },
  bitList: {
    display: 'flex',
    gap: '5px',
  },
  bitBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    border: '1px solid',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1px',
    transition: 'all 0.1s',
  },
  bitLabel: {
    fontSize: '7px',
    lineHeight: 1,
    opacity: 0.8,
  },
  bitVal: {
    fontSize: '13px',
    fontWeight: 800,
    lineHeight: 1,
  },
  controlRow: {
    display: 'flex',
    gap: '6px',
  },
  miniBtn: {
    padding: '4px 10px',
    borderRadius: '6px',
    background: '#1e293b',
    border: '1px solid #334155',
    color: '#94a3b8',
    fontSize: '10px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  stepperBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#070a12',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '8px 14px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  stepperLabel: {
    fontSize: '11px',
    color: '#94a3b8',
    fontWeight: 600,
  },
  colBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    fontSize: '10px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  playBtn: {
    padding: '5px 12px',
    borderRadius: '7px',
    border: 'none',
    color: '#fff',
    fontSize: '11px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    cursor: 'pointer',
  },
  splitGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '12px',
  },
  boxCard: {
    background: '#080c16',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '12px',
    padding: '14px',
  },
  boxHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  pillTag: {
    fontSize: '9px',
    padding: '2px 6px',
    borderRadius: '4px',
    background: 'rgba(59,130,246,0.15)',
    color: '#93c5fd',
    fontWeight: 600,
  },
  formulaRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '12px',
    background: '#0b101c',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  operandBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  operandSub: {
    fontSize: '9px',
    color: '#64748b',
  },
  operandVal: {
    width: '38px',
    height: '38px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: 800,
    color: '#fff',
  },
  operator: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#475569',
  },
  explanationText: {
    fontSize: '11px',
    color: '#cbd5e1',
    marginTop: '10px',
    padding: '6px 10px',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '6px',
    lineHeight: 1.4,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  matrixTable: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'center',
    fontSize: '11px',
  },
  th: {
    padding: '4px 8px',
    fontSize: '10px',
    fontWeight: 700,
  },
  rowHeader: {
    padding: '4px 8px',
    fontSize: '10px',
    fontWeight: 700,
    textAlign: 'right',
  },
  td: {
    padding: '6px 8px',
    border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: '4px',
  },
  formulaCode: {
    fontSize: '10px',
    fontFamily: 'monospace',
    color: '#94a3b8',
    background: '#070a12',
    padding: '8px',
    borderRadius: '6px',
    marginTop: '8px',
  },
  termsStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginTop: '8px',
  },
  termItem: {
    padding: '6px 10px',
    borderRadius: '6px',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
  },
  resultBox: {
    marginTop: '10px',
    padding: '10px',
    borderRadius: '8px',
    background: 'rgba(56,189,248,0.1)',
    border: '1px solid rgba(56,189,248,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codewordBit: {
    width: '32px',
    height: '34px',
    borderRadius: '6px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  verdictCard: {
    marginTop: '12px',
    padding: '12px',
    borderRadius: '8px',
    background: '#070a12',
    border: '1px solid rgba(255,255,255,0.06)',
  },
};
