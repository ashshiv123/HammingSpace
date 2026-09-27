import React from 'react';

/**
 * Miniature SVG thumbnails for each theory topic,
 * styled to match the diagrams in Diagrams.jsx.
 */

// 1. Hamming Space — hypercube with codeword dots
export const ThumbHammingSpace = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full">
    <rect width="80" height="80" rx="6" fill="#0f172a" />
    <path d="M25 25 L55 25 L55 55 L25 55 Z" stroke="#475569" strokeWidth="0.8" fill="none" strokeDasharray="2 2" />
    <path d="M18 40 L48 40 L48 70 L18 70 Z" stroke="#64748b" strokeWidth="1" fill="none" />
    <line x1="25" y1="25" x2="18" y2="40" stroke="#475569" strokeWidth="0.8" strokeDasharray="2 2" />
    <line x1="55" y1="25" x2="48" y2="40" stroke="#475569" strokeWidth="0.8" strokeDasharray="2 2" />
    <line x1="55" y1="55" x2="48" y2="70" stroke="#475569" strokeWidth="0.8" strokeDasharray="2 2" />
    <line x1="25" y1="55" x2="18" y2="70" stroke="#475569" strokeWidth="0.8" strokeDasharray="2 2" />
    <circle cx="18" cy="70" r="4" fill="#3b82f6" />
    <circle cx="55" cy="25" r="4" fill="#3b82f6" />
    <circle cx="18" cy="70" r="10" fill="#3b82f620" stroke="#3b82f640" strokeWidth="0.8" />
    <circle cx="55" cy="25" r="10" fill="#3b82f620" stroke="#3b82f640" strokeWidth="0.8" />
  </svg>
);

// 2. Linear Block Codes — bit boxes (data + parity)
export const ThumbBlockCode = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full">
    <rect width="80" height="80" rx="6" fill="#0f172a" />
    {[0,1,2,3].map(i => (
      <rect key={i} x={8+i*10} y="30" width="8" height="12" rx="1.5" fill="#312e81" stroke="#6366f180" strokeWidth="0.8" />
    ))}
    {[0,1,2].map(i => (
      <rect key={i} x={52+i*10} y="30" width="8" height="12" rx="1.5" fill="#831843" stroke="#ec489980" strokeWidth="0.8" />
    ))}
    <line x1="49" y1="32" x2="49" y2="40" stroke="#475569" strokeWidth="0.8" />
    <text x="28" y="56" fill="#818cf8" fontSize="7" textAnchor="middle" fontFamily="monospace">k=4</text>
    <text x="62" y="56" fill="#f472b6" fontSize="7" textAnchor="middle" fontFamily="monospace">r=3</text>
  </svg>
);

// 3. (n,k) Parameters
export const ThumbParameters = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full">
    <rect width="80" height="80" rx="6" fill="#0f172a" />
    <text x="40" y="32" fill="#e2e8f0" fontSize="14" textAnchor="middle" fontWeight="bold" fontFamily="monospace">(7,4)</text>
    <text x="40" y="50" fill="#64748b" fontSize="8" textAnchor="middle" fontFamily="monospace">n=7, k=4</text>
    <text x="40" y="62" fill="#64748b" fontSize="8" textAnchor="middle" fontFamily="monospace">t=1</text>
  </svg>
);

// 4. Parity formula
export const ThumbParityFormula = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full">
    <rect width="80" height="80" rx="6" fill="#0f172a" />
    <text x="40" y="36" fill="#f472b6" fontSize="10" textAnchor="middle" fontFamily="monospace">2ʳ</text>
    <text x="40" y="48" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">≥ m+r+1</text>
    <text x="40" y="64" fill="#4ade80" fontSize="8" textAnchor="middle" fontFamily="monospace">r=3 ✓</text>
  </svg>
);

// 5. G matrix construction
export const ThumbGMatrix = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full">
    <rect width="80" height="80" rx="6" fill="#0f172a" />
    <text x="40" y="24" fill="#94a3b8" fontSize="8" textAnchor="middle" fontFamily="monospace">G = [I|P]</text>
    {/* Mini matrix grid */}
    {[0,1,2,3].map(r => (
      <g key={r}>
        {[0,1,2,3].map(c => (
          <rect key={c} x={12+c*8} y={30+r*10} width="6" height="8" rx="1" fill={r===c ? '#312e81' : '#1e293b'} stroke="#334155" strokeWidth="0.5" />
        ))}
        <line x1="46" y1={30+r*10} x2="46" y2={38+r*10} stroke="#475569" strokeWidth="0.5" />
        {[0,1,2].map(c => (
          <rect key={c} x={50+c*8} y={30+r*10} width="6" height="8" rx="1" fill="#831843" stroke="#be185d50" strokeWidth="0.5" />
        ))}
      </g>
    ))}
  </svg>
);

// 6. Codeword formation (m × G = c)
export const ThumbCodeword = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full">
    <rect width="80" height="80" rx="6" fill="#0f172a" />
    <text x="40" y="30" fill="#818cf8" fontSize="8" textAnchor="middle" fontWeight="bold" fontFamily="monospace">[1011]</text>
    <text x="40" y="42" fill="#64748b" fontSize="8" textAnchor="middle" fontFamily="monospace">× G =</text>
    <text x="40" y="58" fill="#4ade80" fontSize="8" textAnchor="middle" fontWeight="bold" fontFamily="monospace">[1011010]</text>
  </svg>
);

// 7. Transmission — arrow across channel
export const ThumbTransmission = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full">
    <rect width="80" height="80" rx="6" fill="#0f172a" />
    <rect x="8" y="32" width="18" height="16" rx="3" fill="#1e3a5f" stroke="#3b82f680" strokeWidth="0.8" />
    <text x="17" y="43" fill="#60a5fa" fontSize="7" textAnchor="middle" fontFamily="monospace">TX</text>
    <line x1="28" y1="40" x2="52" y2="40" stroke="#3b82f6" strokeWidth="1.2" markerEnd="url(#arrow7)" />
    <defs><marker id="arrow7" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="#3b82f6" /></marker></defs>
    <rect x="54" y="32" width="18" height="16" rx="3" fill="#1e3a5f" stroke="#3b82f680" strokeWidth="0.8" />
    <text x="63" y="43" fill="#60a5fa" fontSize="7" textAnchor="middle" fontFamily="monospace">RX</text>
  </svg>
);

// 8. Channel noise — bit with error flash
export const ThumbNoise = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full">
    <rect width="80" height="80" rx="6" fill="#0f172a" />
    {['1','0','1','1','0','1','0'].map((b, i) => (
      <rect key={i} x={8+i*10} y="34" width="8" height="12" rx="1.5" fill={i===2 ? '#7f1d1d' : '#1e293b'} stroke={i===2 ? '#ef4444' : '#334155'} strokeWidth="0.8" />
    ))}
    {['1','0','1','1','0','1','0'].map((b, i) => (
      <text key={`t${i}`} x={12+i*10} y="43" fill={i===2 ? '#fca5a5' : '#94a3b8'} fontSize="6" textAnchor="middle" fontFamily="monospace">{b}</text>
    ))}
    {/* Lightning bolt on bit 3 */}
    <path d="M30 26 L28 32 L32 30 L30 36" stroke="#ef4444" strokeWidth="1.2" fill="none" />
    <text x="40" y="60" fill="#ef4444" fontSize="7" textAnchor="middle" fontFamily="monospace">+ noise</text>
  </svg>
);

// 9. Received codeword
export const ThumbReceived = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full">
    <rect width="80" height="80" rx="6" fill="#0f172a" />
    <text x="40" y="28" fill="#64748b" fontSize="7" textAnchor="middle" fontFamily="monospace">r = c ⊕ e</text>
    {['1','0','0','1','0','1','0'].map((b, i) => (
      <rect key={i} x={8+i*10} y="34" width="8" height="12" rx="1.5" fill={i===2 ? '#7f1d1d50' : '#1e293b'} stroke={i===2 ? '#ef4444' : '#334155'} strokeWidth="0.8" />
    ))}
    {['1','0','0','1','0','1','0'].map((b, i) => (
      <text key={`t${i}`} x={12+i*10} y="43" fill={i===2 ? '#fca5a5' : '#94a3b8'} fontSize="6" textAnchor="middle" fontFamily="monospace">{b}</text>
    ))}
    <text x="40" y="60" fill="#f59e0b" fontSize="7" textAnchor="middle" fontFamily="monospace">error?</text>
  </svg>
);

// 10. H matrix / syndrome
export const ThumbSyndrome = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full">
    <rect width="80" height="80" rx="6" fill="#0f172a" />
    <text x="40" y="24" fill="#94a3b8" fontSize="7" textAnchor="middle" fontFamily="monospace">S = rHᵀ</text>
    {/* Syndrome bits */}
    {[1,1,1].map((b, i) => (
      <rect key={i} x={22+i*14} y="32" width="10" height="14" rx="2" fill="#7f1d1d50" stroke="#ef4444" strokeWidth="0.8" />
    ))}
    {[1,1,1].map((b, i) => (
      <text key={`t${i}`} x={27+i*14} y="42" fill="#fca5a5" fontSize="8" textAnchor="middle" fontWeight="bold" fontFamily="monospace">{b}</text>
    ))}
    <text x="40" y="62" fill="#ef4444" fontSize="7" textAnchor="middle" fontFamily="monospace">→ col 3</text>
  </svg>
);

// 11. Final decoded result
export const ThumbDecoded = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full">
    <rect width="80" height="80" rx="6" fill="#0f172a" />
    <text x="40" y="26" fill="#4ade80" fontSize="7" textAnchor="middle" fontFamily="monospace">corrected!</text>
    {['1','0','1','1'].map((b, i) => (
      <rect key={i} x={16+i*14} y="34" width="10" height="14" rx="2" fill="#14532d50" stroke="#22c55e" strokeWidth="0.8" />
    ))}
    {['1','0','1','1'].map((b, i) => (
      <text key={`t${i}`} x={21+i*14} y="44" fill="#86efac" fontSize="8" textAnchor="middle" fontWeight="bold" fontFamily="monospace">{b}</text>
    ))}
    <text x="40" y="62" fill="#4ade80" fontSize="8" textAnchor="middle" fontFamily="monospace">m = [1011]</text>
  </svg>
);

/** All thumbnails in topic order */
export const spiralTopics = [
  { id: 'hamming-space',        alt: 'Hamming space diagram',        Thumb: ThumbHammingSpace },
  { id: 'linear-block',         alt: 'Linear block codes diagram',   Thumb: ThumbBlockCode },
  { id: 'parameters',           alt: 'Hamming code parameters',      Thumb: ThumbParameters },
  { id: 'generator-matrix-size',alt: 'Parity bit formula',           Thumb: ThumbParityFormula },
  { id: 'g-matrix',             alt: 'G matrix construction',        Thumb: ThumbGMatrix },
  { id: 'codeword-formation',   alt: 'Codeword formation diagram',   Thumb: ThumbCodeword },
  { id: 'transmission',         alt: 'Transmission diagram',         Thumb: ThumbTransmission },
  { id: 'channel-noise',        alt: 'Channel noise diagram',        Thumb: ThumbNoise },
  { id: 'received',             alt: 'Received codeword diagram',    Thumb: ThumbReceived },
  { id: 'h-matrix',             alt: 'Syndrome calculation diagram', Thumb: ThumbSyndrome },
  { id: 'decode',               alt: 'Final decoded result diagram', Thumb: ThumbDecoded },
];
