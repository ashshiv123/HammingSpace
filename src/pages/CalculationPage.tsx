import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Zap,
  Calculator,
  Layers,
  Search,
  ExternalLink,
} from 'lucide-react';
import { useSimulationStore } from '../store/simulationStore';

export interface CalculationPageProps {
  onBackToLab: () => void;
}

export const CalculationPage: React.FC<CalculationPageProps> = ({ onBackToLab }) => {
  const {
    n,
    k,
    G,
    H,
    message,
    toggleMessageBit,
    codeword,
    receivedVector,
    syndrome,
    errorPositions,
    syndromeTable,
    selectPreset,
    toggleChannelBit,
    encode,
    decode,
    correct,
    setStage,
  } = useSimulationStore();

  const [activeTab, setActiveTab] = useState<'encoding' | 'syndrome'>('encoding');
  const [currentColIndex, setCurrentColIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<0.5 | 1 | 2>(1);

  // For syndrome decoding
  const [currentSyndromeBitIndex, setCurrentSyndromeBitIndex] = useState(0);
  const r = n - k;

  // Active message rows where m_i = 1
  const activeRowIndices = useMemo(() => {
    const indices: number[] = [];
    message.forEach((bit, idx) => {
      if (bit === 1) indices.push(idx);
    });
    return indices;
  }, [message]);

  // Compute live codeword bits up to currentColIndex
  const computedCodewordBits = useMemo(() => {
    const bits: (number | null)[] = new Array(n).fill(null);
    for (let c = 0; c <= currentColIndex && c < n; c++) {
      let sum = 0;
      for (let row = 0; row < k; row++) {
        sum ^= (message[row] ?? 0) & (G[row]?.[c] ?? 0);
      }
      bits[c] = sum & 1;
    }
    return bits;
  }, [currentColIndex, n, k, message, G]);

  // Complete calculated codeword for reference
  const fullCalculatedCodeword = useMemo(() => {
    const res = new Array(n).fill(0);
    for (let c = 0; c < n; c++) {
      let sum = 0;
      for (let row = 0; row < k; row++) {
        sum ^= (message[row] ?? 0) & (G[row]?.[c] ?? 0);
      }
      res[c] = sum & 1;
    }
    return res;
  }, [n, k, message, G]);

  // Active column terms for G
  const currentColTerms = useMemo(() => {
    if (currentColIndex >= n) return [];
    return activeRowIndices.map((rowIdx) => ({
      row: rowIdx,
      col: currentColIndex,
      val: G[rowIdx]?.[currentColIndex] ?? 0,
    }));
  }, [activeRowIndices, currentColIndex, G, n]);

  const currentColResult = useMemo(() => {
    if (currentColTerms.length === 0) return 0;
    return currentColTerms.reduce((acc, t) => acc ^ t.val, 0);
  }, [currentColTerms]);

  // Step-by-step XOR evaluation string for encoding
  const xorStepBreakdown = useMemo(() => {
    if (currentColTerms.length === 0) return '0 (No active rows with mᵢ = 1)';
    if (currentColTerms.length === 1) return `${currentColTerms[0].val}`;

    let running = currentColTerms[0].val;
    const parts: string[] = [`(${currentColTerms[0].val} ⊕ ${currentColTerms[1].val}) = ${running ^ currentColTerms[1].val}`];
    running ^= currentColTerms[1].val;

    for (let i = 2; i < currentColTerms.length; i++) {
      const nextVal = currentColTerms[i].val;
      const nextRes = running ^ nextVal;
      parts.push(`(${running} ⊕ ${nextVal}) = ${nextRes}`);
      running = nextRes;
    }
    return parts.join(' ➔ ');
  }, [currentColTerms]);

  // Syndrome Calculation Data
  const computedSyndromeBits = useMemo(() => {
    const bits: (number | null)[] = new Array(r).fill(null);
    for (let sIdx = 0; sIdx <= currentSyndromeBitIndex && sIdx < r; sIdx++) {
      let sum = 0;
      for (let c = 0; c < n; c++) {
        sum ^= (receivedVector[c] ?? 0) & (H[sIdx]?.[c] ?? 0);
      }
      bits[sIdx] = sum & 1;
    }
    return bits;
  }, [currentSyndromeBitIndex, r, n, receivedVector, H]);

  const fullCalculatedSyndrome = useMemo(() => {
    const syn = new Array(r).fill(0);
    for (let sIdx = 0; sIdx < r; sIdx++) {
      let sum = 0;
      for (let c = 0; c < n; c++) {
        sum ^= (receivedVector[c] ?? 0) & (H[sIdx]?.[c] ?? 0);
      }
      syn[sIdx] = sum & 1;
    }
    return syn;
  }, [r, n, receivedVector, H]);

  const currentSyndromeRowTerms = useMemo(() => {
    if (currentSyndromeBitIndex >= r) return [];
    const terms: { col: number; rVal: number; hVal: number }[] = [];
    for (let c = 0; c < n; c++) {
      if ((receivedVector[c] ?? 0) === 1 && (H[currentSyndromeBitIndex]?.[c] ?? 0) === 1) {
        terms.push({ col: c, rVal: 1, hVal: 1 });
      }
    }
    return terms;
  }, [currentSyndromeBitIndex, r, n, receivedVector, H]);

  const currentSyndromeBitResult = useMemo(() => {
    if (currentSyndromeRowTerms.length === 0) return 0;
    return currentSyndromeRowTerms.length % 2;
  }, [currentSyndromeRowTerms]);

  const syndromeString = fullCalculatedSyndrome.join('');
  const identifiedErrorCol = syndromeTable.get(syndromeString) ?? -1;
  const isSyndromeNonZero = fullCalculatedSyndrome.some((b) => b === 1);

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying) return;

    const baseDelay = 1100;
    const intervalMs = Math.round(baseDelay / playbackSpeed);

    const timer = setInterval(() => {
      if (activeTab === 'encoding') {
        setCurrentColIndex((prev) => {
          if (prev >= n - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      } else {
        setCurrentSyndromeBitIndex((prev) => {
          if (prev >= r - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, activeTab, n, r, playbackSpeed]);

  const handleReturnToLab = () => {
    useSimulationStore.setState({
      calculationSteps: [],
      currentStepIndex: 0,
      isAnimationPlaying: false,
      showLiveHUD: false,
    });
    onBackToLab();
  };

  const handleSendToChannel = () => {
    useSimulationStore.setState({
      codeword: fullCalculatedCodeword,
      receivedVector: [...fullCalculatedCodeword],
      errorVector: new Array(n).fill(0),
      errorPositions: [],
      syndrome: new Array(n - k).fill(0),
      correctedVector: new Array(n).fill(0),
      stage: 'inChannel',
      calculationSteps: [],
      currentStepIndex: 0,
      isAnimationPlaying: false,
      showLiveHUD: false,
      cameraFocus: 'channel',
    });
    onBackToLab();
  };

  const handleApplyCorrectionAndReturn = () => {
    correct();
    useSimulationStore.setState({
      calculationSteps: [],
      currentStepIndex: 0,
      isAnimationPlaying: false,
      showLiveHUD: false,
      cameraFocus: 'overview',
    });
    onBackToLab();
  };

  return (
    <div className="h-full w-full min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans overflow-y-auto">
      {/* Top Navbar */}
      <header className="h-16 px-6 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between sticky top-0 z-30 shadow-md flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleReturnToLab}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-mono border border-slate-700 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← Back to 3D Studio</span>
          </button>

          <div className="h-5 w-px bg-slate-800" />

          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-slate-100">
              GF(2) Matrix Visualizer
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
              Interactive Matrix Workspace
            </span>
          </div>
        </div>

        {/* Tab Selector & Preset Selector */}
        <div className="flex items-center gap-4">
          {/* Operation Tab Selector */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setActiveTab('encoding');
                setIsPlaying(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition cursor-pointer ${
                activeTab === 'encoding'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1. Encoding: c = m·G
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('syndrome');
                setIsPlaying(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition cursor-pointer ${
                activeTab === 'syndrome'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2. Syndrome: S = r·Hᵀ
            </button>
          </div>

          {/* Preset Selector */}
          <select
            value={`(${n},${k})`}
            onChange={(e) => {
              selectPreset(e.target.value);
              setCurrentColIndex(0);
              setCurrentSyndromeBitIndex(0);
              setIsPlaying(false);
            }}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="(15,11)">(15, 11) Hamming Code</option>
            <option value="(7,4)">(7, 4) Hamming Code</option>
            <option value="(3,1)">(3, 1) Repetition Code</option>
          </select>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6 pb-24">
        {activeTab === 'encoding' ? (
          <>
            {/* ========================================================= */}
            {/* ENCODING WORKSPACE: c = m·G (mod 2)                       */}
            {/* ========================================================= */}

            {/* Formula Header Banner */}
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-bold text-blue-400 uppercase tracking-wide">
                    Linear Combination over Galois Field GF(2)
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    [Mod-2 Matrix Multiplication]
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm font-mono text-slate-100">
                  <span className="text-white font-bold">c</span>
                  <span className="text-slate-500">=</span>
                  <span className="text-blue-400">m</span>
                  <span className="text-white">·</span>
                  <span className="text-slate-200">G</span>
                  <span className="text-slate-500">=</span>
                  <span className="text-slate-400">
                    {message.map((m, i) => `${m}·G_${i}`).join(' ⊕ ')}
                  </span>
                </div>
              </div>

              {/* Simplified Equation showing ONLY active rows */}
              <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono">
                <span className="text-slate-400">Simplified linear sum: </span>
                <span className="text-emerald-400 font-bold">
                  c = {activeRowIndices.length > 0 ? activeRowIndices.map((idx) => `G_${idx}`).join(' ⊕ ') : '0'}
                </span>
              </div>
            </div>

            {/* THREE MAIN MATRIX AREAS (Left: m, Center: G, Right: c) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT: Message Vector m (3 cols) */}
              <div className="lg:col-span-3 p-4 bg-[#080d19] border border-[#1e293b] rounded-2xl flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-bold text-[#F5F5F0] uppercase tracking-wide">
                      Message m
                    </span>
                    <span className="text-[10px] font-mono text-[#64748b]">
                      [1 × {k}]
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#38bdf8]">Click bit to toggle</span>
                </div>

                {/* Message Bits List */}
                <div className="flex flex-col gap-1.5 max-h-[460px] overflow-y-auto overscroll-contain pr-1">
                  {message.map((bit, idx) => {
                    const isSelected = bit === 1;
                    return (
                      <div
                        key={`msg-bit-card-${idx}`}
                        onClick={() => toggleMessageBit(idx)}
                        className={`flex items-center justify-between p-2 rounded-xl border transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#0f2438] border-cyan-500/60 shadow-[0_0_10px_rgba(34,211,238,0.15)]'
                            : 'bg-[#04070f] border-[#1e293b] hover:border-[#334155]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-[#94a3b8]">m{idx}</span>
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                              isSelected
                                ? 'bg-[#22D3EE] text-[#050810]'
                                : 'bg-[#1e293b] text-[#64748b]'
                            }`}
                          >
                            {bit}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[10px] font-mono">
                          {isSelected ? (
                            <span className="text-[#38bdf8] flex items-center gap-1">
                              <span>➔ Includes Row G{idx}</span>
                            </span>
                          ) : (
                            <span className="text-[#475569]">Excluded (0×G{idx})</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CENTER: Generator Matrix G (6 cols) */}
              <div className="lg:col-span-6 p-4 bg-[#080d19] border border-[#1e293b] rounded-2xl flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#F5F5F0] uppercase tracking-wide">
                      Generator Matrix G
                    </span>
                    <span className="text-[10px] font-mono text-[#64748b]">
                      [{k} × {n}]
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#091b2c] border border-cyan-500/30 text-[#38bdf8]">
                      ↕ ↔ Scrollable Table
                    </span>
                    <span className="text-[10px] font-mono text-[#22D3EE]">
                      Col c{currentColIndex}
                    </span>
                  </div>
                </div>

                {/* Matrix Grid Visualization with exact column & active values highlighted */}
                <div className="overflow-auto max-h-[460px] p-2 bg-[#04060e] rounded-xl border border-[#1e293b]/70 font-mono overscroll-contain touch-pan-x touch-pan-y">
                  <table className="border-collapse mx-auto min-w-full">
                    <thead className="sticky top-0 z-20 bg-[#04060e] shadow-sm">
                      <tr>
                        <th className="sticky left-0 top-0 z-30 bg-[#04060e] p-1 text-[10px] text-[#475569] border-r border-[#1e293b]/40"></th>
                        {Array.from({ length: n }, (_, c) => {
                          const isColActive = c === currentColIndex;
                          return (
                            <th
                              key={`th-col-${c}`}
                              onClick={() => {
                                setCurrentColIndex(c);
                                setIsPlaying(false);
                              }}
                              className={`p-1 text-center text-[10px] transition cursor-pointer ${
                                isColActive
                                  ? 'text-[#22D3EE] font-bold bg-[#0d233a] rounded-t-md'
                                  : 'text-[#64748b] hover:text-[#F5F5F0]'
                              }`}
                            >
                              c{c}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {G.map((row, rIdx) => {
                        const isRowSelected = message[rIdx] === 1;

                        return (
                          <tr
                            key={`tr-row-${rIdx}`}
                            className={`transition ${
                              isRowSelected ? 'bg-[#091b2c]/40' : 'opacity-40'
                            }`}
                          >
                            {/* Sticky Row Header */}
                            <td className="sticky left-0 z-10 bg-[#04060e] p-1 pr-2 text-right text-[10px] font-mono font-semibold border-r border-[#1e293b]/40">
                              <span
                                className={
                                  isRowSelected ? 'text-[#22D3EE]' : 'text-[#475569]'
                                }
                              >
                                G{rIdx}
                              </span>
                            </td>

                            {/* Row Cells */}
                            {row.map((val, cIdx) => {
                              const isColActive = cIdx === currentColIndex;
                              const isIntersecting = isRowSelected && isColActive;

                              return (
                                <td
                                  key={`td-cell-${rIdx}-${cIdx}`}
                                  className={`p-1 text-center transition ${
                                    isColActive ? 'bg-[#0c2238]/60' : ''
                                  }`}
                                >
                                  <div
                                    className={`w-6 h-6 mx-auto rounded flex items-center justify-center text-xs font-mono font-bold transition ${
                                      isIntersecting
                                        ? 'bg-[#38bdf8] text-[#050810] shadow-[0_0_10px_rgba(56,189,248,0.5)] scale-110'
                                        : isRowSelected && val === 1
                                        ? 'bg-[#1e293b] text-[#e2e8f0]'
                                        : val === 1
                                        ? 'bg-[#0f172a] text-[#64748b]'
                                        : 'bg-[#050810] text-[#334155]'
                                    }`}
                                  >
                                    {val}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-[#64748b] pt-1">
                  <span>Highlighted blue cells: Values combined into c{currentColIndex}</span>
                  <span className="text-[#38bdf8]">
                    {currentColTerms.length} active row term{currentColTerms.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* RIGHT: Output Codeword Vector c (3 cols) */}
              <div className="lg:col-span-3 p-4 bg-[#080d19] border border-[#1e293b] rounded-2xl flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-bold text-[#F5F5F0] uppercase tracking-wide">
                      Codeword c
                    </span>
                    <span className="text-[10px] font-mono text-[#64748b]">
                      [1 × {n}]
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#4ADE80]">
                    {computedCodewordBits.filter((b) => b !== null).length} / {n} computed
                  </span>
                </div>

                {/* Vertical progressive bit list */}
                <div className="flex flex-col gap-1.5 max-h-[360px] overflow-y-auto pr-1">
                  {fullCalculatedCodeword.map((finalVal, idx) => {
                    const isComputed = computedCodewordBits[idx] !== null;
                    const isCurrent = idx === currentColIndex;
                    const isParity = idx >= k;

                    return (
                      <div
                        key={`codeword-cell-${idx}`}
                        onClick={() => {
                          setCurrentColIndex(idx);
                          setIsPlaying(false);
                        }}
                        className={`flex items-center justify-between p-2 rounded-xl border transition cursor-pointer ${
                          isCurrent
                            ? 'bg-[#0c2438] border-[#38bdf8] shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                            : isComputed
                            ? 'bg-[#040810] border-[#1e293b]'
                            : 'bg-[#02050b] border-[#111827] opacity-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-mono ${
                              isCurrent ? 'text-[#38bdf8] font-bold' : 'text-[#64748b]'
                            }`}
                          >
                            c{idx}
                          </span>
                          <span className="text-[10px] font-mono text-[#475569]">
                            {isParity ? 'parity' : 'data'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                              isCurrent
                                ? 'bg-[#38bdf8] text-[#050810] animate-pulse'
                                : isComputed
                                ? 'bg-[#1e293b] text-[#4ADE80]'
                                : 'bg-[#090e1a] text-[#334155]'
                            }`}
                          >
                            {isComputed ? computedCodewordBits[idx] : '?'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* LIVE CALCULATION PANEL (Learn Math Class Interaction Pattern) */}
            <div className="p-4 bg-[#080d19] border border-cyan-500/30 rounded-2xl flex flex-col gap-3 font-mono">
              <div className="flex items-center justify-between border-b border-[#1e293b] pb-2">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-[#22D3EE]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#F5F5F0]">
                    Current Calculation: Codeword Bit c{currentColIndex}
                  </span>
                </div>
                <span className="text-xs text-[#22D3EE] font-bold">
                  Column {currentColIndex + 1} of {n}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Active Terms */}
                <div className="p-3 bg-[#03060c] rounded-xl border border-[#1e293b] space-y-1">
                  <span className="text-[10px] text-[#64748b] uppercase block">
                    1. Active Matrix Terms (mᵢ = 1)
                  </span>
                  <div className="text-sm text-[#F5F5F0] overflow-x-auto whitespace-nowrap">
                    c{currentColIndex} = {activeRowIndices.map((r) => `G_${r}[${currentColIndex}]`).join(' ⊕ ') || '0'}
                  </div>
                </div>

                {/* Binary Values */}
                <div className="p-3 bg-[#03060c] rounded-xl border border-[#1e293b] space-y-1">
                  <span className="text-[10px] text-[#64748b] uppercase block">
                    2. GF(2) Binary Modulo-2 Values
                  </span>
                  <div className="text-sm text-[#38bdf8] font-bold overflow-x-auto whitespace-nowrap">
                    = {currentColTerms.map((t) => t.val).join(' ⊕ ') || '0'}
                  </div>
                </div>

                {/* Final Result */}
                <div className="p-3 bg-[#03060c] rounded-xl border border-cyan-500/30 space-y-1">
                  <span className="text-[10px] text-[#64748b] uppercase block">
                    3. Computed Output Bit
                  </span>
                  <div className="text-base text-[#4ADE80] font-bold">
                    c{currentColIndex} = {currentColResult}
                  </div>
                </div>
              </div>

              {/* Step-by-Step XOR Progressive Sequence */}
              <div className="flex items-center justify-between text-xs pt-1 text-[#94a3b8]">
                <span>Progressive Mod-2 Steps: {xorStepBreakdown}</span>
                <span className="text-[10px] text-[#64748b]">
                  Modulo-2 rules: 0⊕0=0 | 0⊕1=1 | 1⊕0=1 | 1⊕1=0
                </span>
              </div>
            </div>

            {/* PROGRESS & TIMELINE CONTROLS */}
            <div className="p-4 bg-[#080d19] border border-[#1e293b] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Stepper Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentColIndex((prev) => Math.max(0, prev - 1));
                    setIsPlaying(false);
                  }}
                  disabled={currentColIndex === 0}
                  className="flex items-center gap-1 px-3 py-2 bg-[#1e293b] hover:bg-[#334155] disabled:opacity-30 disabled:cursor-not-allowed text-xs font-mono rounded-lg transition cursor-pointer"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                  <span>◀ Previous</span>
                </button>

                {isPlaying ? (
                  <button
                    type="button"
                    onClick={() => setIsPlaying(false)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#1e293b] hover:bg-[#334155] text-xs font-mono font-bold rounded-lg transition cursor-pointer"
                  >
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>❚❚ Pause</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (currentColIndex >= n - 1) setCurrentColIndex(0);
                      setIsPlaying(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#22D3EE] text-[#050810] hover:bg-[#06b6d4] text-xs font-mono font-bold rounded-lg transition cursor-pointer shadow-[0_0_10px_rgba(34,211,238,0.3)]"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>▶ Play</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setCurrentColIndex((prev) => Math.min(n - 1, prev + 1));
                    setIsPlaying(false);
                  }}
                  disabled={currentColIndex >= n - 1}
                  className="flex items-center gap-1 px-3 py-2 bg-[#1e293b] hover:bg-[#334155] disabled:opacity-30 disabled:cursor-not-allowed text-xs font-mono rounded-lg transition cursor-pointer"
                >
                  <span>Step →</span>
                  <SkipForward className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentColIndex(0);
                    setIsPlaying(false);
                  }}
                  className="p-2 bg-[#1e293b] hover:bg-[#334155] text-[#94a3b8] hover:text-[#F5F5F0] rounded-lg transition cursor-pointer"
                  title="Replay from column 0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Progress Dots / Bar */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-[11px] font-mono text-[#94a3b8]">
                  COLUMN {String(currentColIndex + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
                </span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: n }, (_, c) => (
                    <button
                      key={`dot-${c}`}
                      type="button"
                      onClick={() => {
                        setCurrentColIndex(c);
                        setIsPlaying(false);
                      }}
                      className={`w-2.5 h-2.5 rounded-full transition cursor-pointer ${
                        c === currentColIndex
                          ? 'bg-[#38bdf8] ring-2 ring-[#38bdf8]/40 scale-125'
                          : c < currentColIndex
                          ? 'bg-[#22D3EE]'
                          : 'bg-[#1e293b]'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Speed & Send to Channel Action */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs font-mono text-[#64748b]">
                  <span>Speed:</span>
                  {[0.5, 1, 2].map((spd) => (
                    <button
                      key={`speed-btn-${spd}`}
                      type="button"
                      onClick={() => setPlaybackSpeed(spd as 0.5 | 1 | 2)}
                      className={`px-1.5 py-0.5 rounded text-[10px] border transition cursor-pointer ${
                        playbackSpeed === spd
                          ? 'border-[#22D3EE] text-[#22D3EE] bg-cyan-950/60 font-bold'
                          : 'border-[#1e293b] text-[#94a3b8] hover:text-[#F5F5F0]'
                      }`}
                    >
                      {spd}×
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleSendToChannel}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-[#22D3EE] hover:bg-[#06b6d4] text-[#050810] text-xs font-mono font-bold rounded-xl transition cursor-pointer shadow-[0_0_12px_rgba(34,211,238,0.3)]"
                >
                  <span>Send to 3D Channel</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* ========================================================= */}
            {/* SYNDROME WORKSPACE: S = r·Hᵀ (mod 2)                      */}
            {/* ========================================================= */}

            {/* Header Banner */}
            <div className="p-4 bg-[#080d19] border border-[#1e293b] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-bold text-[#38bdf8] uppercase tracking-wide">
                    Syndrome Orthogonality Check over GF(2)
                  </span>
                  <span className="text-[11px] font-mono text-[#64748b]">
                    [S = r · Hᵀ (mod 2)]
                  </span>
                </div>
                <div className="mt-1 text-xs font-mono text-[#94a3b8]">
                  Testing received vector r against {r} parity check equations in H. If S = [0...0], codeword is authentic.
                </div>
              </div>

              {/* Status Badge */}
              <div
                className={`px-3.5 py-2 rounded-xl border text-xs font-mono font-bold ${
                  isSyndromeNonZero
                    ? 'bg-red-950/60 border-red-500/50 text-[#EF4444]'
                    : 'bg-emerald-950/60 border-emerald-500/50 text-[#4ADE80]'
                }`}
              >
                {isSyndromeNonZero
                  ? `Parity Violated: S = [${syndromeString}] ➔ Error at Bit c${identifiedErrorCol}`
                  : `All Checks Passed: S = [${new Array(r).fill(0).join('')}] ➔ Valid Codeword`}
              </div>
            </div>

            {/* THREE MAIN BLOCKS FOR SYNDROME (r, H, S) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT: Received Vector r (3 cols) */}
              <div className="lg:col-span-3 p-4 bg-[#080d19] border border-[#1e293b] rounded-2xl flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-bold text-[#F5F5F0] uppercase tracking-wide">
                      Received r
                    </span>
                    <span className="text-[10px] font-mono text-[#64748b]">
                      [1 × {n}]
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#EF4444]">Click bit to flip</span>
                </div>

                <div className="flex flex-col gap-1.5 max-h-[360px] overflow-y-auto pr-1">
                  {receivedVector.map((bit, idx) => {
                    const isError = errorPositions.includes(idx);

                    return (
                      <div
                        key={`rx-bit-card-${idx}`}
                        onClick={() => toggleChannelBit(idx)}
                        className={`flex items-center justify-between p-2 rounded-xl border transition cursor-pointer ${
                          isError
                            ? 'bg-red-950/40 border-red-500/60 text-red-200'
                            : 'bg-[#040810] border-[#1e293b] text-[#F5F5F0]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-[#94a3b8]">r{idx}</span>
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                              isError
                                ? 'bg-[#EF4444] text-white animate-pulse'
                                : 'bg-[#1e293b] text-[#e2e8f0]'
                            }`}
                          >
                            {bit}
                          </span>
                        </div>

                        <div className="text-[10px] font-mono">
                          {isError ? (
                            <span className="text-[#EF4444] font-bold">FLIPPED ⚡</span>
                          ) : (
                            <span className="text-[#64748b]">c{idx}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CENTER: Parity Check Matrix H (6 cols) */}
              <div className="lg:col-span-6 p-4 bg-[#080d19] border border-[#1e293b] rounded-2xl flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#F5F5F0] uppercase tracking-wide">
                      Parity Check Matrix H
                    </span>
                    <span className="text-[10px] font-mono text-[#64748b]">
                      [{r} × {n}]
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#091b2c] border border-cyan-500/30 text-[#38bdf8]">
                      ↕ ↔ Scrollable Table
                    </span>
                    <span className="text-[10px] font-mono text-[#38bdf8]">
                      Row s{currentSyndromeBitIndex}
                    </span>
                  </div>
                </div>

                <div className="overflow-auto max-h-[460px] p-2 bg-[#04060e] rounded-xl border border-[#1e293b]/70 font-mono overscroll-contain touch-pan-x touch-pan-y">
                  <table className="border-collapse mx-auto min-w-full">
                    <thead className="sticky top-0 z-20 bg-[#04060e] shadow-sm">
                      <tr>
                        <th className="sticky left-0 top-0 z-30 bg-[#04060e] p-1 text-[10px] text-[#475569] border-r border-[#1e293b]/40"></th>
                        {Array.from({ length: n }, (_, c) => {
                          const isErrorCol = c === identifiedErrorCol && isSyndromeNonZero;

                          return (
                            <th
                              key={`th-h-col-${c}`}
                              className={`p-1 text-center text-[10px] transition ${
                                isErrorCol
                                  ? 'text-[#EF4444] font-bold bg-red-950/60 rounded-t-md'
                                  : 'text-[#64748b]'
                              }`}
                            >
                              c{c}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {H.map((row, rIdx) => {
                        const isRowActive = rIdx === currentSyndromeBitIndex;

                        return (
                          <tr
                            key={`h-row-${rIdx}`}
                            className={`transition ${
                              isRowActive ? 'bg-[#091b2c]/60' : 'opacity-40'
                            }`}
                          >
                            <td className="sticky left-0 z-10 bg-[#04060e] p-1 pr-2 text-right text-[10px] font-mono font-semibold border-r border-[#1e293b]/40">
                              <span
                                className={
                                  isRowActive ? 'text-[#38bdf8]' : 'text-[#475569]'
                                }
                              >
                                Row {rIdx}
                              </span>
                            </td>

                            {row.map((val, cIdx) => {
                              const isOverlapping =
                                isRowActive && val === 1 && receivedVector[cIdx] === 1;

                              return (
                                <td key={`h-cell-${rIdx}-${cIdx}`} className="p-1 text-center">
                                  <div
                                    className={`w-6 h-6 mx-auto rounded flex items-center justify-center text-xs font-mono font-bold transition ${
                                      isOverlapping
                                        ? 'bg-[#38bdf8] text-[#050810] shadow-[0_0_10px_rgba(56,189,248,0.5)] scale-110'
                                        : val === 1
                                        ? 'bg-[#1e293b] text-[#e2e8f0]'
                                        : 'bg-[#050810] text-[#334155]'
                                    }`}
                                  >
                                    {val}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-[#64748b] pt-1">
                  <span>Evaluating: s{currentSyndromeBitIndex} = ⨁ (rᵢ · H_{currentSyndromeBitIndex},ᵢ)</span>
                  {identifiedErrorCol >= 0 && (
                    <span className="text-[#EF4444] font-bold">
                      Column {identifiedErrorCol} matches Syndrome [{syndromeString}]
                    </span>
                  )}
                </div>
              </div>

              {/* RIGHT: Syndrome Vector S (3 cols) */}
              <div className="lg:col-span-3 p-4 bg-[#080d19] border border-[#1e293b] rounded-2xl flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-bold text-[#F5F5F0] uppercase tracking-wide">
                      Syndrome S
                    </span>
                    <span className="text-[10px] font-mono text-[#64748b]">
                      [1 × {r}]
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#38bdf8]">
                    S = r·Hᵀ
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {fullCalculatedSyndrome.map((sVal, idx) => {
                    const isComputed = computedSyndromeBits[idx] !== null;
                    const isCurrent = idx === currentSyndromeBitIndex;

                    return (
                      <div
                        key={`syn-card-${idx}`}
                        onClick={() => {
                          setCurrentSyndromeBitIndex(idx);
                          setIsPlaying(false);
                        }}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition cursor-pointer ${
                          isCurrent
                            ? 'bg-[#0c2438] border-[#38bdf8] shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                            : 'bg-[#040810] border-[#1e293b]'
                        }`}
                      >
                        <span className="text-xs font-mono font-bold text-[#94a3b8]">
                          s{idx}
                        </span>

                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                            !isComputed
                              ? 'bg-[#090e1a] text-[#334155]'
                              : sVal === 1
                              ? 'bg-[#EF4444] text-white shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                              : 'bg-[#1e293b] text-[#4ADE80]'
                          }`}
                        >
                          {isComputed ? sVal : '?'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Table Lookup Diagnosis Box */}
                <div className="p-3 rounded-xl bg-[#03060c] border border-[#1e293b] text-xs font-mono space-y-1">
                  <span className="text-[10px] text-[#64748b] uppercase block">
                    Syndrome Lookup
                  </span>
                  <div className="text-xs text-[#F5F5F0]">
                    S = [{syndromeString}]
                  </div>
                  <div className="text-[11px] text-[#94a3b8]">
                    {isSyndromeNonZero
                      ? `Matches Column ${identifiedErrorCol} of H ➔ Invert bit c${identifiedErrorCol}`
                      : 'Zero syndrome: Codeword valid.'}
                  </div>
                </div>
              </div>
            </div>

            {/* LIVE SYNDROME STEP CALCULATION PANEL */}
            <div className="p-4 bg-[#080d19] border border-cyan-500/30 rounded-2xl flex flex-col gap-3 font-mono">
              <div className="flex items-center justify-between border-b border-[#1e293b] pb-2">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-[#38bdf8]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#F5F5F0]">
                    Parity Equation: Syndrome Bit s{currentSyndromeBitIndex}
                  </span>
                </div>
                <span className="text-xs text-[#38bdf8] font-bold">
                  Equation {currentSyndromeBitIndex + 1} of {r}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-[#03060c] rounded-xl border border-[#1e293b] space-y-1">
                  <span className="text-[10px] text-[#64748b] uppercase block">
                    1. Overlapping One-bits
                  </span>
                  <div className="text-xs text-[#F5F5F0] overflow-x-auto whitespace-nowrap">
                    {currentSyndromeRowTerms.length > 0
                      ? currentSyndromeRowTerms.map((t) => `r_${t.col}(1)·H_${currentSyndromeBitIndex},${t.col}(1)`).join(' ⊕ ')
                      : 'None'}
                  </div>
                </div>

                <div className="p-3 bg-[#03060c] rounded-xl border border-[#1e293b] space-y-1">
                  <span className="text-[10px] text-[#64748b] uppercase block">
                    2. GF(2) XOR Sum
                  </span>
                  <div className="text-sm text-[#38bdf8] font-bold overflow-x-auto whitespace-nowrap">
                    {currentSyndromeRowTerms.length > 0
                      ? currentSyndromeRowTerms.map(() => '1').join(' ⊕ ')
                      : '0'}
                  </div>
                </div>

                <div className="p-3 bg-[#03060c] rounded-xl border border-cyan-500/30 space-y-1">
                  <span className="text-[10px] text-[#64748b] uppercase block">
                    3. Parity Result
                  </span>
                  <div
                    className={`text-base font-bold ${
                      currentSyndromeBitResult === 1 ? 'text-[#EF4444]' : 'text-[#4ADE80]'
                    }`}
                  >
                    s{currentSyndromeBitIndex} = {currentSyndromeBitResult}
                  </div>
                </div>
              </div>
            </div>

            {/* SYNDROME CONTROLS */}
            <div className="p-4 bg-[#080d19] border border-[#1e293b] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentSyndromeBitIndex((prev) => Math.max(0, prev - 1));
                    setIsPlaying(false);
                  }}
                  disabled={currentSyndromeBitIndex === 0}
                  className="flex items-center gap-1 px-3 py-2 bg-[#1e293b] hover:bg-[#334155] disabled:opacity-30 disabled:cursor-not-allowed text-xs font-mono rounded-lg transition cursor-pointer"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                  <span>◀ Previous</span>
                </button>

                {isPlaying ? (
                  <button
                    type="button"
                    onClick={() => setIsPlaying(false)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#1e293b] hover:bg-[#334155] text-xs font-mono font-bold rounded-lg transition cursor-pointer"
                  >
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>❚❚ Pause</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (currentSyndromeBitIndex >= r - 1) setCurrentSyndromeBitIndex(0);
                      setIsPlaying(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#38bdf8] text-[#050810] hover:bg-[#0284c7] text-xs font-mono font-bold rounded-lg transition cursor-pointer shadow-[0_0_10px_rgba(56,189,248,0.3)]"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>▶ Play</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setCurrentSyndromeBitIndex((prev) => Math.min(r - 1, prev + 1));
                    setIsPlaying(false);
                  }}
                  disabled={currentSyndromeBitIndex >= r - 1}
                  className="flex items-center gap-1 px-3 py-2 bg-[#1e293b] hover:bg-[#334155] disabled:opacity-30 disabled:cursor-not-allowed text-xs font-mono rounded-lg transition cursor-pointer"
                >
                  <span>Step →</span>
                  <SkipForward className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentSyndromeBitIndex(0);
                    setIsPlaying(false);
                  }}
                  className="p-2 bg-[#1e293b] hover:bg-[#334155] text-[#94a3b8] hover:text-[#F5F5F0] rounded-lg transition cursor-pointer"
                  title="Replay from equation 0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Action Button */}
              {isSyndromeNonZero ? (
                <button
                  type="button"
                  onClick={handleApplyCorrectionAndReturn}
                  className="flex items-center gap-2 px-4 py-2 bg-[#4ADE80] hover:bg-[#22c55e] text-[#050810] font-mono font-bold text-xs rounded-xl shadow-[0_0_12px_rgba(74,222,128,0.3)] transition cursor-pointer"
                >
                  <span>Correct Bit c{identifiedErrorCol} & Return to 3D Lab</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleReturnToLab}
                  className="flex items-center gap-2 px-4 py-2 bg-[#22D3EE] hover:bg-[#06b6d4] text-[#050810] font-mono font-bold text-xs rounded-xl shadow-[0_0_12px_rgba(34,211,238,0.3)] transition cursor-pointer"
                >
                  <span>✓ Verified Valid — Return to 3D Lab</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};
