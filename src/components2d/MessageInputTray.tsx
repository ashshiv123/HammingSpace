import React from 'react';
import { useSimulationStore } from '../store/simulationStore';

export const MessageInputTray: React.FC = () => {
  const { k, message, toggleMessageBit, stage } = useSimulationStore();
  const isLocked = stage === 'encoding' || stage === 'decoding';

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-[11px] font-mono tracking-wider">
        <span className="text-[#F5F5F0]/60 uppercase">Message m ({k} bits)</span>
        <span className="text-[#F5F5F0]/40">[{message.join(' ')}]</span>
      </div>
      <div className="flex items-center gap-1.5">
        {message.map((bit, idx) => {
          const isOne = bit === 1;
          return (
            <button
              key={`hud-bit-${idx}`}
              type="button"
              disabled={isLocked}
              onClick={() => toggleMessageBit(idx)}
              className={`relative flex flex-col items-center justify-center w-8 h-10 rounded-lg border font-mono transition-all duration-150 ${
                isOne
                  ? 'bg-cyan-500/15 border-[#22D3EE] text-[#F5F5F0]'
                  : 'bg-[#090e1a] border-[#1e293b] text-[#F5F5F0]/40 hover:border-[#334155] hover:text-[#F5F5F0]/70'
              } ${isLocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
            >
              <span className="text-[9px] text-[#F5F5F0]/40 font-sans">m{idx}</span>
              <span className={`text-sm font-bold ${isOne ? 'text-[#22D3EE]' : 'text-[#F5F5F0]/50'}`}>
                {bit}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
