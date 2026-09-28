import React, { useState } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import { gf2VecMatMul } from '../math';

export const LinearityDemo: React.FC = () => {
  const { k, n, G } = useSimulationStore();
  const [show, setShow] = useState(false);

  // Generate two random messages and their sum
  const [m1, setM1] = useState<number[]>([]);
  const [m2, setM2] = useState<number[]>([]);
  
  const generateDemo = () => {
    const newM1 = Array.from({ length: k }, () => (Math.random() > 0.5 ? 1 : 0));
    const newM2 = Array.from({ length: k }, () => (Math.random() > 0.5 ? 1 : 0));
    setM1(newM1);
    setM2(newM2);
    setShow(true);
  };

  if (!show) {
    return (
      <button 
        type="button" 
        onClick={generateDemo}
        className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-mono font-medium uppercase transition bg-slate-800 hover:bg-slate-700 text-teal-400 border border-slate-700 cursor-pointer"
      >
        <span>📐 Linearity Demo</span>
      </button>
    );
  }

  const m3 = m1.map((b, i) => b ^ m2[i]);
  const c1 = gf2VecMatMul(m1, G);
  const c2 = gf2VecMatMul(m2, G);
  const c3 = gf2VecMatMul(m3, G);
  const cSum = c1.map((b, i) => b ^ c2[i]);
  
  const isValid = c3.every((b, i) => b === cSum[i]);

  return (
    <div className="p-3 bg-slate-900 border border-slate-700 rounded-md space-y-2 relative">
      <button 
        className="absolute top-2 right-2 text-slate-400 hover:text-white"
        onClick={() => setShow(false)}
      >
        ✕
      </button>
      <h3 className="text-teal-400 font-bold text-xs uppercase mb-1">Linearity Property</h3>
      <p className="text-[10px] text-slate-300 mb-2">
        A linear code means the XOR sum of any two valid codewords is also a valid codeword.
      </p>
      
      <div className="font-mono text-[10px] space-y-1">
        <div className="flex justify-between">
          <span className="text-slate-400">m₁ = [{m1.join('')}]</span>
          <span className="text-teal-300">c₁ = [{c1.join('')}]</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">m₂ = [{m2.join('')}]</span>
          <span className="text-teal-300">c₂ = [{c2.join('')}]</span>
        </div>
        <div className="border-t border-slate-700 my-1 pt-1 flex justify-between">
          <span className="text-slate-200">m₁⊕m₂ = [{m3.join('')}]</span>
          <span className="text-teal-400 font-bold">c₁⊕c₂ = [{cSum.join('')}]</span>
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-slate-400">Encode(m₁⊕m₂)</span>
          <span className="text-amber-300">= [{c3.join('')}]</span>
        </div>
      </div>
      
      <div className={`mt-2 p-1 text-center font-bold text-[10px] rounded ${isValid ? 'bg-emerald-900/50 text-emerald-400' : 'bg-rose-900/50 text-rose-400'}`}>
        {isValid ? '✓ c₁ ⊕ c₂ = Encode(m₁ ⊕ m₂)' : '✕ Verification Failed'}
      </div>
      
      <button 
        type="button" 
        onClick={generateDemo}
        className="w-full mt-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[9px] uppercase cursor-pointer"
      >
        Regenerate
      </button>
    </div>
  );
};
