import React from 'react';
import { useSimulationStore } from '../store/simulationStore';

export const ParityVenn: React.FC = () => {
  const { n, k, receivedVector, syndrome, errorPositions } = useSimulationStore();

  // Only render for (7,4) code
  if (n !== 7 || k !== 4) return null;

  // Bits in standard order: d1(0), d2(1), d3(2), d4(3), p1(4), p2(5), p3(6)
  // According to standard Hamming(7,4):
  // p1 covers d1, d2, d4 (indices 0, 1, 3) + p1 (4)
  // p2 covers d1, d3, d4 (indices 0, 2, 3) + p2 (5)
  // p3 covers d2, d3, d4 (indices 1, 2, 3) + p3 (6)

  // Map syndrome to circle errors (s1 corresponds to p1 circle, etc)
  const hasError = syndrome.some(s => s === 1);
  const p1Fail = syndrome[0] === 1;
  const p2Fail = syndrome[1] === 1;
  const p3Fail = syndrome[2] === 1;

  // Let's create standard regions for a 3-circle Venn diagram
  // Circle 1 (p1), Circle 2 (p2), Circle 3 (p3)
  
  return (
    <div className="hologram-panel hologram-venn" style={{ pointerEvents: 'auto' }}>
      <div className="hologram-title text-sm mb-2">Parity Venn (7,4)</div>
      
      <div className="relative w-48 h-48 mx-auto" style={{ overflow: 'visible' }}>
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-md">
          {/* Base SVG with 3 overlapping circles */}
          
          <g transform="translate(50, 45) scale(0.8)">
            {/* Circle 1 (p1 - Top Left) */}
            <circle cx="-15" cy="-10" r="30" 
              fill="transparent" 
              stroke={p1Fail ? "#f43f5e" : "#5fd4c4"} 
              strokeWidth="2" 
              className="transition-colors duration-300"
            />
            {/* Circle 2 (p2 - Top Right) */}
            <circle cx="15" cy="-10" r="30" 
              fill="transparent" 
              stroke={p2Fail ? "#f43f5e" : "#5fd4c4"} 
              strokeWidth="2"
              className="transition-colors duration-300"
            />
            {/* Circle 3 (p3 - Bottom) */}
            <circle cx="0" cy="15" r="30" 
              fill="transparent" 
              stroke={p3Fail ? "#f43f5e" : "#5fd4c4"} 
              strokeWidth="2"
              className="transition-colors duration-300"
            />

            {/* Bit Labels */}
            {/* d4 is center overlap of all 3 */}
            <text x="0" y="2" textAnchor="middle" fill="#f8fafc" fontSize="8" className="font-mono">
              {receivedVector[3]}
            </text>
            <text x="0" y="8" textAnchor="middle" fill="#94a3b8" fontSize="4">d4</text>

            {/* d1 is overlap of p1 and p2 (top) */}
            <text x="0" y="-18" textAnchor="middle" fill="#f8fafc" fontSize="8" className="font-mono">
              {receivedVector[0]}
            </text>
            <text x="0" y="-12" textAnchor="middle" fill="#94a3b8" fontSize="4">d1</text>

            {/* d2 is overlap of p1 and p3 (bottom left) */}
            <text x="-15" y="10" textAnchor="middle" fill="#f8fafc" fontSize="8" className="font-mono">
              {receivedVector[1]}
            </text>
            <text x="-15" y="16" textAnchor="middle" fill="#94a3b8" fontSize="4">d2</text>

            {/* d3 is overlap of p2 and p3 (bottom right) */}
            <text x="15" y="10" textAnchor="middle" fill="#f8fafc" fontSize="8" className="font-mono">
              {receivedVector[2]}
            </text>
            <text x="15" y="16" textAnchor="middle" fill="#94a3b8" fontSize="4">d3</text>

            {/* p1 is p1 only (far left) */}
            <text x="-25" y="-15" textAnchor="middle" fill="#f59e0b" fontSize="8" className="font-mono">
              {receivedVector[4]}
            </text>
            <text x="-25" y="-9" textAnchor="middle" fill="#94a3b8" fontSize="4">p1</text>

            {/* p2 is p2 only (far right) */}
            <text x="25" y="-15" textAnchor="middle" fill="#f59e0b" fontSize="8" className="font-mono">
              {receivedVector[5]}
            </text>
            <text x="25" y="-9" textAnchor="middle" fill="#94a3b8" fontSize="4">p2</text>

            {/* p3 is p3 only (far bottom) */}
            <text x="0" y="32" textAnchor="middle" fill="#f59e0b" fontSize="8" className="font-mono">
              {receivedVector[6]}
            </text>
            <text x="0" y="38" textAnchor="middle" fill="#94a3b8" fontSize="4">p3</text>
          </g>
        </svg>
      </div>

      <div className="mt-2 text-xs text-slate-300">
        Syndrome: <span className={`font-mono font-bold ${hasError ? 'text-rose-400' : 'text-teal-400'}`}>[{syndrome.join(' ')}]</span>
      </div>
    </div>
  );
};
