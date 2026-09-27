import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Zap,
  Layers,
  ArrowRight,
  Calculator,
  ChevronDown,
  ChevronUp,
  Grid,
} from 'lucide-react';
import { useSimulationStore } from '../store/simulationStore';

export interface CalculationVisualizerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalculationVisualizerDrawer: React.FC<CalculationVisualizerDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    n,
    k,
    G,
    H,
    message,
    toggleMessageBit,
    setMessage,
    codeword,
    receivedVector,
    syndrome,
    errorPositions,
    lastCorrectedBit,
    stage,
    syndromeTable,
    toggleChannelBit,
    correct,
    selectPreset,
  } = useSimulationStore();

  const r = n - k;
  const [activeTab, setActiveTab] = useState<'encoding' | 'syndrome'>(
    stage === 'decoding' || stage === 'errorDetected' || stage === 'corrected'
      ? 'syndrome'
      : 'encoding'
  );

  // Active target column & row for focused multiplication
  const [activeColIndex, setActiveColIndex] = useState(0);
  const [activeEncodingRow, setActiveEncodingRow] = useState(0);

  // For syndrome inspection: active parity row & column
  const [activeRowIndex, setActiveRowIndex] = useState(0);
  const [activeSyndromeCol, setActiveSyndromeCol] = useState(0);

  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Playback timer for auto-stepping
  React.useEffect(() => {
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

  // Sync tab with simulation stage changes
  React.useEffect(() => {
    if (stage === 'decoding' || stage === 'errorDetected' || stage === 'corrected') {
      setActiveTab('syndrome');
    } else if (stage === 'encoding') {
      setActiveTab('encoding');
    }
  }, [stage]);

  // Current focused multiplication operands for encoding
  const curMBit = message[activeEncodingRow] ?? 0;
  const curGBit = G[activeEncodingRow]?.[activeColIndex] ?? 0;
  const curTermProduct = curMBit & curGBit;

  // Active terms for current column c_j
  const activeColTerms = useMemo(() => {
    return Array.from({ length: k }).map((_, row) => {
      const mVal = message[row] ?? 0;
      const gVal = G[row]?.[activeColIndex] ?? 0;
      return {
        row,
        mVal,
        gVal,
        product: mVal & gVal,
        isActive: mVal === 1,
      };
    });
  }, [k, message, G, activeColIndex]);

  const activeNonZeroTerms = activeColTerms.filter((t) => t.isActive);
  const curColResultBit = activeNonZeroTerms.reduce((acc, t) => acc ^ t.gVal, 0);

  // Current focused multiplication operands for syndrome
  const curRBit = receivedVector[activeSyndromeCol] ?? 0;
  const curHBit = H[activeRowIndex]?.[activeSyndromeCol] ?? 0;
  const curSynProduct = curRBit & curHBit;

  // Active terms for current syndrome row s_i
  const curSynRowTerms = useMemo(() => {
    return Array.from({ length: n }).map((_, col) => {
      const rVal = receivedVector[col] ?? 0;
      const hVal = H[activeRowIndex]?.[col] ?? 0;
      return {
        col,
        rVal,
        hVal,
        product: rVal & hVal,
        isChecked: hVal === 1,
      };
    });
  }, [n, receivedVector, H, activeRowIndex]);

  const activeNonZeroSynTerms = curSynRowTerms.filter((t) => t.isChecked);
  const curSynRowResult = activeNonZeroSynTerms.reduce((acc, t) => acc ^ t.rVal, 0);

  // Identify matching column in H for error localization
  const matchingColumnIndex = useMemo(() => {
    const hasNonZero = syndrome.some((b) => b === 1);
    if (!hasNonZero) return -1;

    for (let c = 0; c < n; c++) {
      let matches = true;
      for (let row = 0; row < r; row++) {
        if ((H[row]?.[c] ?? 0) !== (syndrome[row] ?? 0)) {
          matches = false;
          break;
        }
      }
      if (matches) return c;
    }
    return -1;
  }, [syndrome, H, n, r]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 360, damping: 30 }}
        className="fixed inset-x-2 bottom-2 md:inset-x-6 md:bottom-4 z-50 max-h-[85vh] flex flex-col bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 rounded-2xl shadow-2xl text-slate-100 overflow-hidden font-sans pointer-events-auto"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <span>Interactive Calculation Visualizer</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                  Step-by-Step Simulation Engine
                </span>
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">
                Click any cell in the grid to watch the exact term multiply and add into the matrix system
              </p>
            </div>
          </div>

          {/* Navigation Tabs & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Tab Selector */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveTab('encoding')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer font-semibold ${
                  activeTab === 'encoding'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                1. Encoding (c = m·G)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('syndrome')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer font-semibold ${
                  activeTab === 'syndrome'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                2. Syndrome (S = r·Hᵀ)
              </button>
            </div>

            {/* Minimize / Maximize */}
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition cursor-pointer"
              title={isCollapsed ? 'Expand Visualizer' : 'Collapse Visualizer'}
            >
              {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {/* Close Visualizer */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 transition cursor-pointer"
              title="Close Visualizer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body Area (Collapsible) */}
        {!isCollapsed && (
          <div className="p-4 overflow-y-auto space-y-4 max-h-[calc(85vh-4rem)]">
            {/* ============================================================= */}
            {/* TAB 1: ENCODING (c = m * G) WITH FOCUSED MULTIPLIER BOX       */}
            {/* ============================================================= */}
            {activeTab === 'encoding' && (
              <div className="space-y-4">
                {/* Interactive Message Bar in Drawer */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      <span>Input Message m ({k} bits):</span>
                    </span>
                    <div className="flex flex-wrap items-center gap-1">
                      {message.map((bit, mIdx) => (
                        <button
                          key={`drawer-m-${mIdx}`}
                          type="button"
                          onClick={() => toggleMessageBit(mIdx)}
                          className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition cursor-pointer flex flex-col items-center justify-center ${
                            bit === 1
                              ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700'
                          }`}
                          title={`Click to flip bit m${mIdx} (${bit} ➔ ${bit ^ 1})`}
                        >
                          <span className="text-[7px] text-slate-400">m{mIdx}</span>
                          <span className="text-[11px] leading-none">{bit}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => {
                        const rand = Array.from({ length: k }, () => (Math.random() > 0.5 ? 1 : 0));
                        setMessage(rand);
                      }}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer text-[10px]"
                    >
                      🎲 Random
                    </button>
                    <button
                      type="button"
                      onClick={() => setMessage(message.map((b) => b ^ 1))}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer text-[10px]"
                    >
                      Invert
                    </button>
                  </div>
                </div>

                {/* Stepper Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400 uppercase">
                      Target Codeword Column:
                    </span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: n }).map((_, cIdx) => (
                        <button
                          key={`col-btn-${cIdx}`}
                          type="button"
                          onClick={() => {
                            setActiveColIndex(cIdx);
                            setIsAutoPlaying(false);
                          }}
                          className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                            activeColIndex === cIdx
                              ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/40'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {`c${cIdx}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Auto Play / Step Controls */}
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveEncodingRow((prev) => (prev - 1 + k) % k);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                      title="Previous Row Term"
                    >
                      <SkipBack className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                        isAutoPlaying
                          ? 'bg-amber-600 text-white'
                          : 'bg-blue-600 text-white hover:bg-blue-500'
                      }`}
                    >
                      {isAutoPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5 fill-current" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Auto Step</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveEncodingRow((prev) => (prev + 1) % k);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                      title="Next Row Term"
                    >
                      <SkipForward className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 2-Column Responsive Layout: Left = Multiplier Box + Grid, Right = XOR Sum + Codeword */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  
                  {/* LEFT: THE FOCUSED MULTIPLIER BOX & INTERACTIVE MATRIX GRID (7 cols) */}
                  <div className="lg:col-span-7 space-y-3">
                    
                    {/* 1. THE FOCUSED SINGLE MULTIPLICATION BOX */}
                    <div className="p-4 rounded-xl bg-slate-950/90 border border-blue-500/50 shadow-lg space-y-3">
                      <div className="flex items-center justify-between text-xs font-mono font-semibold">
                        <span className="text-blue-400 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-blue-400" />
                          <span>ACTIVE CALCULATION BOX: Row {activeEncodingRow} × Column c{activeColIndex}</span>
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                          Term {activeEncodingRow + 1} of {k}
                        </span>
                      </div>

                      {/* Single Multiplier Formula Box */}
                      <div className="flex items-center justify-center gap-3 sm:gap-4 py-3 px-4 bg-slate-900 rounded-xl border border-slate-800">
                        {/* Message Bit m_i */}
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-mono text-slate-400 mb-1">
                            Message m{activeEncodingRow}
                          </span>
                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg font-mono font-bold transition ${
                              curMBit === 1
                                ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-400/50'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {curMBit}
                          </div>
                        </div>

                        <span className="text-2xl font-bold text-slate-500">×</span>

                        {/* Matrix Cell G[i][j] */}
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-mono text-slate-400 mb-1">
                            Matrix Cell G[{activeEncodingRow}][{activeColIndex}]
                          </span>
                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg font-mono font-bold transition ${
                              curGBit === 1
                                ? 'bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-400/50'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {curGBit}
                          </div>
                        </div>

                        <span className="text-2xl font-bold text-slate-500">=</span>

                        {/* Product Result */}
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-mono text-slate-400 mb-1">
                            Product Result
                          </span>
                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg font-mono font-bold transition ${
                              curTermProduct === 1
                                ? 'bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-400/60'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {curTermProduct}
                          </div>
                        </div>
                      </div>

                      {/* Explanation Callout */}
                      <div className="flex items-center justify-between text-[11px] font-mono px-1">
                        <span className="text-slate-300">
                          {curMBit === 1
                            ? `✓ Message bit is 1: Row ${activeEncodingRow} is active. Adds ${curGBit} to column sum!`
                            : `○ Message bit is 0: Row ${activeEncodingRow} is inactive (0 × ${curGBit} = 0).`}
                        </span>
                        <span className="text-blue-400 font-semibold">
                          ➔ Added to cell [{activeEncodingRow}, {activeColIndex}]
                        </span>
                      </div>
                    </div>

                    {/* 2. INTERACTIVE MATRIX GRID SYSTEM */}
                    <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                        <span className="font-bold flex items-center gap-1.5">
                          <Grid className="w-3.5 h-3.5 text-blue-400" />
                          <span>Generator Matrix G [{k} × {n}] Grid System</span>
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Click any cell to inspect its multiplication
                        </span>
                      </div>

                      {/* Grid Representation */}
                      <div className="overflow-x-auto pb-1">
                        <table className="w-full border-collapse font-mono text-xs">
                          <thead>
                            <tr>
                              <th className="p-1 text-[10px] text-slate-500 text-left">m \ c</th>
                              {Array.from({ length: n }).map((_, c) => (
                                <th
                                  key={`th-col-${c}`}
                                  className={`p-1 text-center text-[10px] font-bold transition ${
                                    c === activeColIndex
                                      ? 'text-blue-400 bg-blue-950/40 rounded-t'
                                      : 'text-slate-500'
                                  }`}
                                >
                                  {`c${c}`}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {Array.from({ length: k }).map((_, rIdx) => {
                              const isRowActive = activeEncodingRow === rIdx;
                              const rowMessageVal = message[rIdx] ?? 0;

                              return (
                                <tr key={`matrix-row-${rIdx}`}>
                                  {/* Row header with message bit */}
                                  <td className="p-1">
                                    <button
                                      type="button"
                                      onClick={() => setActiveEncodingRow(rIdx)}
                                      className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                                        isRowActive
                                          ? 'bg-blue-600 text-white'
                                          : rowMessageVal === 1
                                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                                          : 'bg-slate-900 text-slate-500'
                                      }`}
                                    >
                                      <span>r{rIdx}</span>
                                      <span className="text-[9px] opacity-80">({rowMessageVal})</span>
                                    </button>
                                  </td>

                                  {/* Matrix Cells */}
                                  {Array.from({ length: n }).map((_, cIdx) => {
                                    const cellVal = G[rIdx]?.[cIdx] ?? 0;
                                    const isTargetCell =
                                      isRowActive && cIdx === activeColIndex;
                                    const isColSelected = cIdx === activeColIndex;

                                    return (
                                      <td key={`cell-${rIdx}-${cIdx}`} className="p-1 text-center">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setActiveEncodingRow(rIdx);
                                            setActiveColIndex(cIdx);
                                            setIsAutoPlaying(false);
                                          }}
                                          className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                                            isTargetCell
                                              ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400 scale-105'
                                              : isColSelected
                                              ? 'bg-blue-950 text-blue-200 border border-blue-700/60'
                                              : cellVal === 1
                                              ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                                              : 'bg-slate-900 text-slate-500 hover:bg-slate-800'
                                          }`}
                                        >
                                          {cellVal}
                                        </button>
                                      </td>
                                    );
                                  })}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                        <span>
                          Highlighted green cell: active product at position [Row {activeEncodingRow}, Col c{activeColIndex}]
                        </span>
                        <span className="text-emerald-400 font-semibold">
                          Term = {curTermProduct}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: MODULO-2 XOR ACCUMULATION & CODEWORD SYSTEM (5 cols) */}
                  <div className="lg:col-span-5 space-y-3">
                    
                    {/* Modulo-2 XOR Reduction Card */}
                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-200 uppercase">
                        <span className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-[10px]">
                          Σ
                        </span>
                        <span>Column c{activeColIndex} XOR Sum</span>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Sums all active row terms for Column <span className="font-mono text-blue-300 font-bold">c{activeColIndex}</span> using Galois Field modulo-2 addition:
                      </p>

                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs space-y-2">
                        <div className="text-[11px] text-slate-400">Expanded XOR equation:</div>
                        <div className="text-blue-300 font-bold text-sm tracking-wide">
                          {activeNonZeroTerms.length > 0
                            ? activeNonZeroTerms.map((t) => `${t.gVal}`).join(' ⊕ ')
                            : '0'}
                        </div>

                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                          <span className="text-slate-300 font-semibold">Computed Bit c{activeColIndex}:</span>
                          <span className="text-emerald-400 font-bold text-lg px-2 py-0.5 rounded bg-emerald-950 border border-emerald-600/50">
                            {curColResultBit}
                          </span>
                        </div>
                      </div>

                      <div className="p-2 rounded bg-slate-900/60 border border-slate-800 text-[10px] text-slate-400">
                        {activeColIndex < k
                          ? `Column c${activeColIndex} is a DATA bit (systematic copy of m${activeColIndex}).`
                          : `Column c${activeColIndex} is a PARITY bit generated from linear combination.`}
                      </div>
                    </div>

                    {/* Codeword Vector Output Grid */}
                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-200 uppercase">
                        <span className="w-5 h-5 rounded-full bg-emerald-600/20 text-emerald-400 flex items-center justify-center text-[10px]">
                          ✓
                        </span>
                        <span>Assembled Codeword Vector</span>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Resulting codeword c = [m | p] ready for channel transmission:
                      </p>

                      {/* Vector Cells */}
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <div className="flex flex-wrap items-center gap-1.5 justify-center">
                          {Array.from({ length: n }).map((_, i) => {
                            const bitVal = codeword[i] ?? 0;
                            const isCurrentCol = i === activeColIndex;

                            return (
                              <div
                                key={`cw-sphere-${i}`}
                                className={`flex flex-col items-center p-1 rounded-lg border transition ${
                                  isCurrentCol
                                    ? 'bg-blue-950 border-blue-500 ring-2 ring-blue-500/40 scale-105'
                                    : 'bg-slate-950 border-slate-800'
                                }`}
                              >
                                <span
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                                    bitVal === 1
                                      ? 'bg-blue-600 text-white shadow-sm'
                                      : 'bg-slate-800 text-slate-400'
                                  }`}
                                >
                                  {bitVal}
                                </span>
                                <span className="text-[9px] font-mono text-slate-500 mt-0.5">
                                  {`c${i}`}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* TAB 2: SYNDROME & ERROR LOCATOR WITH FOCUSED MULTIPLIER BOX    */}
            {/* ============================================================= */}
            {activeTab === 'syndrome' && (
              <div className="space-y-4">
                {/* Stepper Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400 uppercase">
                      Inspect Syndrome Row:
                    </span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: r }).map((_, rIdx) => (
                        <button
                          key={`syn-btn-${rIdx}`}
                          type="button"
                          onClick={() => {
                            setActiveRowIndex(rIdx);
                            setIsAutoPlaying(false);
                          }}
                          className={`w-8 h-7 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                            activeRowIndex === rIdx
                              ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/40'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {`s${rIdx}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-slate-400">Diagnosis:</span>
                    {matchingColumnIndex >= 0 ? (
                      <span className="px-2 py-0.5 rounded bg-rose-950 border border-rose-600/50 text-rose-300 font-bold">
                        Error at Column c{matchingColumnIndex}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-600/50 text-emerald-300 font-bold">
                        Valid Codeword (S = [000])
                      </span>
                    )}
                  </div>
                </div>

                {/* 2-Column Responsive Layout for Syndrome */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  
                  {/* LEFT: FOCUSED MULTIPLIER BOX & PARITY MATRIX H GRID (7 cols) */}
                  <div className="lg:col-span-7 space-y-3">
                    
                    {/* Focused Single Parity Multiplier Box */}
                    <div className="p-4 rounded-xl bg-slate-950/90 border border-indigo-500/50 shadow-lg space-y-3">
                      <div className="flex items-center justify-between text-xs font-mono font-semibold">
                        <span className="text-indigo-400 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-indigo-400" />
                          <span>PARITY TERM BOX: Row s{activeRowIndex} × Column c{activeSyndromeCol}</span>
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                          Col {activeSyndromeCol + 1} of {n}
                        </span>
                      </div>

                      {/* The Focused Multiplier Box */}
                      <div className="flex items-center justify-center gap-3 sm:gap-4 py-3 px-4 bg-slate-900 rounded-xl border border-slate-800">
                        {/* Received Bit r_j */}
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-mono text-slate-400 mb-1">
                            Received r{activeSyndromeCol}
                          </span>
                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg font-mono font-bold transition ${
                              curRBit === 1
                                ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-400/50'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {curRBit}
                          </div>
                        </div>

                        <span className="text-2xl font-bold text-slate-500">×</span>

                        {/* Parity Matrix Cell H[i][j] */}
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-mono text-slate-400 mb-1">
                            Parity Cell H[{activeRowIndex}][{activeSyndromeCol}]
                          </span>
                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg font-mono font-bold transition ${
                              curHBit === 1
                                ? 'bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-400/50'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {curHBit}
                          </div>
                        </div>

                        <span className="text-2xl font-bold text-slate-500">=</span>

                        {/* Term Product Result */}
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-mono text-slate-400 mb-1">
                            Parity Term
                          </span>
                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg font-mono font-bold transition ${
                              curSynProduct === 1
                                ? 'bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-400/60'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {curSynProduct}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono px-1">
                        <span className="text-slate-300">
                          {curHBit === 1
                            ? `✓ Parity equation s${activeRowIndex} checks bit c${activeSyndromeCol}. Adds ${curRBit} to parity sum!`
                            : `○ Parity check does not include bit c${activeSyndromeCol} (H cell is 0).`}
                        </span>
                        <span className="text-indigo-400 font-semibold">
                          ➔ Position [Row {activeRowIndex}, Col c{activeSyndromeCol}]
                        </span>
                      </div>
                    </div>

                    {/* Interactive Parity Check Matrix H Grid System */}
                    <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                        <span className="font-bold flex items-center gap-1.5">
                          <Grid className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Parity Check Matrix H [{r} × {n}] Grid System</span>
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Click any cell to inspect parity check term
                        </span>
                      </div>

                      {/* Grid Table */}
                      <div className="overflow-x-auto pb-1">
                        <table className="w-full border-collapse font-mono text-xs">
                          <thead>
                            <tr>
                              <th className="p-1 text-[10px] text-slate-500 text-left">s \ c</th>
                              {Array.from({ length: n }).map((_, c) => (
                                <th
                                  key={`th-syn-col-${c}`}
                                  className={`p-1 text-center text-[10px] font-bold transition ${
                                    c === activeSyndromeCol
                                      ? 'text-indigo-400 bg-indigo-950/40 rounded-t'
                                      : 'text-slate-500'
                                  }`}
                                >
                                  {`c${c}`}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {Array.from({ length: r }).map((_, rIdx) => {
                              const isRowActive = activeRowIndex === rIdx;

                              return (
                                <tr key={`h-matrix-row-${rIdx}`}>
                                  {/* Row header */}
                                  <td className="p-1">
                                    <button
                                      type="button"
                                      onClick={() => setActiveRowIndex(rIdx)}
                                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                                        isRowActive
                                          ? 'bg-indigo-600 text-white'
                                          : 'bg-slate-900 text-slate-400'
                                      }`}
                                    >
                                      {`s${rIdx}`}
                                    </button>
                                  </td>

                                  {/* Parity cells */}
                                  {Array.from({ length: n }).map((_, cIdx) => {
                                    const cellVal = H[rIdx]?.[cIdx] ?? 0;
                                    const isTargetCell =
                                      isRowActive && cIdx === activeSyndromeCol;
                                    const isColMatch = cIdx === matchingColumnIndex;

                                    return (
                                      <td key={`h-cell-${rIdx}-${cIdx}`} className="p-1 text-center">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setActiveRowIndex(rIdx);
                                            setActiveSyndromeCol(cIdx);
                                            setIsAutoPlaying(false);
                                          }}
                                          className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                                            isTargetCell
                                              ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400 scale-105'
                                              : isColMatch
                                              ? 'bg-rose-950 text-rose-200 border border-rose-600 ring-1 ring-rose-500'
                                              : cellVal === 1
                                              ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                                              : 'bg-slate-900 text-slate-500 hover:bg-slate-800'
                                          }`}
                                        >
                                          {cellVal}
                                        </button>
                                      </td>
                                    );
                                  })}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                        <span>
                          Row s{activeRowIndex} checks column terms to evaluate syndrome bit s{activeRowIndex}
                        </span>
                        <span className="text-indigo-400 font-semibold">
                          Term = {curSynProduct}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: SYNDROME REDUCTION & COSET ERROR LOCATOR (5 cols) */}
                  <div className="lg:col-span-5 space-y-3">
                    
                    {/* Parity Equation XOR Sum */}
                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-200 uppercase">
                        <span className="w-5 h-5 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-[10px]">
                          Σ
                        </span>
                        <span>Parity Equation s{activeRowIndex} Evaluation</span>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs space-y-2">
                        <div className="text-[11px] text-slate-400">Active parity check sum:</div>
                        <div className="text-indigo-300 font-bold text-sm tracking-wide">
                          {activeNonZeroSynTerms.length > 0
                            ? activeNonZeroSynTerms.map((t) => `${t.rVal}`).join(' ⊕ ')
                            : '0'}
                        </div>

                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                          <span className="text-slate-300 font-semibold">Syndrome Bit s{activeRowIndex}:</span>
                          <span
                            className={`font-bold text-lg px-2 py-0.5 rounded ${
                              curSynRowResult === 1
                                ? 'bg-rose-950 text-rose-300 border border-rose-600/50'
                                : 'bg-emerald-950 text-emerald-300 border border-emerald-600/50'
                            }`}
                          >
                            {curSynRowResult}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Coset Syndrome Locator & Match */}
                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-200 uppercase">
                        <span className="w-5 h-5 rounded-full bg-rose-600/20 text-rose-400 flex items-center justify-center text-[10px]">
                          🎯
                        </span>
                        <span>Coset Syndrome Locator</span>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs space-y-2">
                        {matchingColumnIndex >= 0 ? (
                          <>
                            <div className="text-rose-400 font-bold flex items-center gap-1.5">
                              <AlertTriangle className="w-4 h-4" />
                              <span>Syndrome S = [{syndrome.join('')}] Matches Column c{matchingColumnIndex}!</span>
                            </div>
                            <p className="text-[11px] text-slate-300 leading-relaxed">
                              Column {matchingColumnIndex} of Parity Matrix H matches Syndrome vector [{syndrome.join('')}] identically.
                              This isolates bit <span className="text-rose-300 font-bold">c{matchingColumnIndex}</span> as the corrupted bit!
                            </p>
                            <button
                              type="button"
                              onClick={() => correct()}
                              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition cursor-pointer shadow-md mt-1"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Invert Bit c{matchingColumnIndex} (Correct Error)</span>
                            </button>
                          </>
                        ) : (
                          <div className="text-emerald-400 font-bold flex items-center gap-1.5 py-2">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>No Parity Errors Detected • S = [000]</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
