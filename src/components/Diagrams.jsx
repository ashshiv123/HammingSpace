import React from 'react';
import { motion } from 'framer-motion';

// 1. Hamming Space Diagram
export const HammingSpaceDiagram = () => (
  <div className="flex flex-col items-center gap-4 w-full">
    <div className="relative w-48 h-48">
      {/* 3D Cube illusion */}
      <svg viewBox="0 0 100 100" className="w-full h-full stroke-slate-500 fill-transparent overflow-visible">
        {/* Back face */}
        <path d="M 30 30 L 70 30 L 70 70 L 30 70 Z" strokeDasharray="2 2" strokeWidth="1" />
        {/* Front face */}
        <path d="M 20 50 L 60 50 L 60 90 L 20 90 Z" strokeWidth="1.5" />
        {/* Connections */}
        <path d="M 30 30 L 20 50" strokeDasharray="2 2" strokeWidth="1" />
        <path d="M 70 30 L 60 50" strokeDasharray="2 2" strokeWidth="1" />
        <path d="M 70 70 L 60 90" strokeDasharray="2 2" strokeWidth="1" />
        <path d="M 30 70 L 20 90" strokeDasharray="2 2" strokeWidth="1" />
        
        {/* Nodes - Valid Codewords */}
        <circle cx="20" cy="90" r="4" className="fill-blue-500 stroke-none" />
        <circle cx="70" cy="30" r="4" className="fill-blue-500 stroke-none" />
        
        {/* Radii (t halos) */}
        <circle cx="20" cy="90" r="15" className="fill-blue-500/10 stroke-blue-500/30" strokeWidth="1" />
        <circle cx="70" cy="30" r="15" className="fill-blue-500/10 stroke-blue-500/30" strokeWidth="1" />
      </svg>
    </div>
    <p className="text-xs text-slate-400 text-center">Valid codewords (blue) with correction radii in n-dimensional space.</p>
  </div>
);

// 2. Linear Block Code / Parity Diagram
export const BlockCodeDiagram = () => {
  const dataBits = [
    { label: 'd₁', value: '1' },
    { label: 'd₂', value: '0' },
    { label: 'd₃', value: '1' },
    { label: 'd₄', value: '1' },
  ];
  const parityBits = [
    { label: 'p₁', value: '0' },
    { label: 'p₂', value: '1' },
    { label: 'p₃', value: '0' },
  ];

  return (
    <div className="w-full flex flex-col items-center gap-5">
      {/* Bit boxes */}
      <div className="flex gap-1">
        {dataBits.map((b, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-mono text-indigo-400">{b.label}</span>
            <div className="w-9 h-9 flex items-center justify-center rounded-md bg-indigo-900/50 border border-indigo-500/40 text-indigo-200 font-mono font-bold text-sm">
              {b.value}
            </div>
          </div>
        ))}
        {/* Separator */}
        <div className="flex items-end pb-1 px-0.5">
          <div className="w-px h-7 bg-slate-600" />
        </div>
        {parityBits.map((b, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-mono text-pink-400">{b.label}</span>
            <div className="w-9 h-9 flex items-center justify-center rounded-md bg-pink-900/40 border border-pink-500/40 text-pink-200 font-mono font-bold text-sm">
              {b.value}
            </div>
          </div>
        ))}
      </div>

      {/* Pill badges — consistent monospace style */}
      <div className="flex items-center gap-2 text-[11px] font-mono">
        <span className="px-2.5 py-1 rounded-full bg-indigo-900/40 border border-indigo-500/30 text-indigo-300">k = 4 bits</span>
        <span className="px-2.5 py-1 rounded-full bg-pink-900/40 border border-pink-500/30 text-pink-300">r = 3 bits</span>
        <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-600 text-slate-300">n = 7 bits</span>
      </div>
    </div>
  );
};

// 4. Parity Formula Diagram
export const ParityFormulaDiagram = () => (
  <div className="w-full h-full flex flex-col justify-center items-center gap-4 font-mono">
    <div className="text-lg bg-slate-900 px-6 py-4 rounded-xl border border-slate-700 shadow-lg text-slate-200">
      <span className="text-pink-400">2<sup className="text-xs">r</sup></span> ≥ <span className="text-indigo-400">m</span> + <span className="text-pink-400">r</span> + 1
    </div>
    <div className="grid grid-cols-2 gap-4 text-sm text-slate-400 w-full max-w-[250px]">
      <div className="text-right">m = 4 (Data)</div>
      <div className="text-left text-pink-400">r = ? (Parity)</div>
      
      <div className="text-right col-span-2 text-xs border-t border-slate-800 pt-2 flex justify-between">
        <span>If r=2: 4 ≥ 4+2+1 ❌</span>
        <span className="text-green-400">If r=3: 8 ≥ 4+3+1 ✅</span>
      </div>
    </div>
  </div>
);

// 6. Codeword Matrix Multiply Diagram
export const MatrixMultiplyDiagram = () => (
  <div className="w-full flex items-center justify-center font-mono text-sm overflow-hidden">
    <div className="flex items-center gap-2 text-slate-300">
      <div className="flex text-indigo-400 font-bold">[1 0 1 1]</div>
      <div className="text-slate-500">×</div>
      <div className="flex flex-col text-slate-400 border-l border-r border-slate-600 px-1 py-0.5 rounded-sm">
        <div>1 0 0 0 | 1 1 0</div>
        <div>0 1 0 0 | 0 1 1</div>
        <div>0 0 1 0 | 1 1 1</div>
        <div>0 0 0 1 | 1 0 1</div>
      </div>
      <div className="text-slate-500">=</div>
      <div className="flex border border-green-900/50 bg-green-950/30 rounded px-2 py-1 text-green-400 font-bold">
        [1 0 1 1 | 0 1 0]
      </div>
    </div>
  </div>
);

// 8. Channel Noise Diagram
export const ChannelNoiseDiagram = () => (
  <div className="w-full flex flex-col items-center gap-4 font-mono text-sm">
    <div className="flex flex-col items-center">
      <span className="text-xs text-slate-500 mb-1">Transmitted (c)</span>
      <div className="flex gap-1">
        {['1','0','1','1','0','1','0'].map((b, i) => (
          <span key={i} className="w-6 h-6 flex items-center justify-center bg-slate-800 rounded text-slate-300 border border-slate-700">{b}</span>
        ))}
      </div>
    </div>
    
    <div className="flex flex-col items-center text-red-400">
      <span className="text-xs text-red-500/80 mb-1">+ Noise (e)</span>
      <div className="flex gap-1">
        {['0','0','1','0','0','0','0'].map((b, i) => (
          <span key={i} className={`w-6 h-6 flex items-center justify-center rounded border ${b === '1' ? 'bg-red-950/50 border-red-800 font-bold' : 'bg-slate-900 border-slate-800 text-slate-600'}`}>{b}</span>
        ))}
      </div>
    </div>
    
    <div className="flex flex-col items-center">
      <span className="text-xs text-slate-500 mb-1">= Received (r)</span>
      <div className="flex gap-1">
        {['1','0','0','1','0','1','0'].map((b, i) => (
          <span key={i} className={`w-6 h-6 flex items-center justify-center bg-slate-800 rounded border ${i === 2 ? 'text-red-400 border-red-500 bg-red-950/30 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'text-slate-300 border-slate-700'}`}>{b}</span>
        ))}
      </div>
    </div>
  </div>
);

// 10. Syndrome Diagram
export const SyndromeDiagram = () => (
  <div className="w-full flex flex-col items-center justify-center font-mono text-sm gap-4">
    <div className="flex items-center gap-2">
      <span className="text-slate-400">S = r × H<sup className="text-xs">T</sup></span>
    </div>
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 w-full max-w-[200px] flex flex-col items-center shadow-lg">
      <span className="text-xs text-slate-500 mb-2">Syndrome Vector</span>
      <div className="flex gap-2 font-bold">
        <span className="w-8 h-8 rounded bg-red-900/40 border border-red-800 flex items-center justify-center text-red-400">1</span>
        <span className="w-8 h-8 rounded bg-red-900/40 border border-red-800 flex items-center justify-center text-red-400">1</span>
        <span className="w-8 h-8 rounded bg-red-900/40 border border-red-800 flex items-center justify-center text-red-400">1</span>
      </div>
      <div className="mt-2 text-xs text-slate-400 flex flex-col items-center">
        <span>Matches H-matrix column 3!</span>
        <span className="text-red-400">Error is at bit index 3.</span>
      </div>
    </div>
  </div>
);
