import React, { useState } from 'react';
import {
  FileText,
  Download,
  Copy,
  Check,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useSimulationStore } from '../store/simulationStore';
import { hammingDistance } from '../math';

export const SessionLogPanel: React.FC = () => {
  const {
    n,
    k,
    dMin,
    message,
    codeword,
    receivedVector,
    errorVector,
    syndrome,
    correctedVector,
    stage,
    G,
    H,
  } = useSimulationStore();

  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const hDist = hammingDistance(codeword, receivedVector);
  const isRecovered =
    correctedVector.length > 0 &&
    codeword.every((val, idx) => val === correctedVector[idx]);

  const logData = {
    timestamp: new Date().toISOString(),
    codeConfig: {
      blockLength_n: n,
      dimension_k: k,
      parityBits_r: n - k,
      minimumDistance_dMin: dMin,
      generatorMatrix_G: G,
      parityCheckMatrix_H: H,
    },
    pipelineVectors: {
      message_m: message,
      encodedCodeword_c: codeword,
      receivedVector_r: receivedVector,
      injectedErrorVector_e: errorVector,
      syndromeVector_S: syndrome,
      recoveredVector_cHat: correctedVector,
    },
    results: {
      hammingDistance: hDist,
      syndromeStatus: syndrome.every((b) => b === 0) ? 'ZERO (VALID)' : 'NON-ZERO (ERROR)',
      correctionSuccess: isRecovered,
    },
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(logData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(logData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `lbc-session-log-(${n},${k})-${Date.now()}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <>
      {/* Floating Toggle Button (Docked bottom-left corner) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium tracking-wider uppercase bg-[#050810]/90 backdrop-blur-md border border-[#1e293b] hover:border-[#334155] text-[#F5F5F0]/70 hover:text-[#F5F5F0] transition cursor-pointer shadow-lg"
      >
        <FileText className="w-3.5 h-3.5 text-[#F5F5F0]/50" />
        <span>Telemetry Log</span>
        {stage === 'errorDetected' && (
          <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
        )}
        {stage === 'corrected' && (
          <span className="w-2 h-2 rounded-full bg-[#4ADE80]" />
        )}
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl max-h-[85vh] flex flex-col bg-[#050810] border border-[#1e293b] rounded-xl shadow-2xl overflow-hidden text-[#F5F5F0]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1e293b] bg-[#080d19]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#F5F5F0]/60" />
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F5F5F0]">
                  Simulation Telemetry ({n}, {k})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-[#F5F5F0]/40 hover:text-[#F5F5F0] rounded hover:bg-[#1e293b] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 overflow-y-auto space-y-3.5 text-xs font-sans">
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 bg-[#090e1a] border border-[#1e293b] rounded-lg">
                  <div className="text-[10px] text-[#F5F5F0]/40 uppercase font-mono">Distance d(c, r)</div>
                  <div className="text-sm font-mono font-bold text-[#EF4444]">
                    {hDist} bit{hDist === 1 ? '' : 's'}
                  </div>
                </div>
                <div className="p-2.5 bg-[#090e1a] border border-[#1e293b] rounded-lg">
                  <div className="text-[10px] text-[#F5F5F0]/40 uppercase font-mono">Syndrome S</div>
                  <div className="text-sm font-mono font-bold text-[#F5F5F0]">
                    [{syndrome.join(' ')}]
                  </div>
                </div>
                <div className="p-2.5 bg-[#090e1a] border border-[#1e293b] rounded-lg">
                  <div className="text-[10px] text-[#F5F5F0]/40 uppercase font-mono">Recovery</div>
                  <div
                    className={`text-sm font-mono font-bold ${
                      isRecovered ? 'text-[#4ADE80]' : 'text-[#F5F5F0]/40'
                    }`}
                  >
                    {isRecovered ? 'VERIFIED' : 'PENDING'}
                  </div>
                </div>
              </div>

              {/* Vector Pipeline Trace */}
              <div className="p-3.5 bg-[#090e1a] border border-[#1e293b] rounded-lg space-y-2 font-mono text-[11px]">
                <div className="text-[#F5F5F0]/50 uppercase text-[10px] font-sans">Mathematical Trace:</div>
                <div className="space-y-1">
                  <div className="flex justify-between py-0.5 border-b border-[#1e293b]/50">
                    <span className="text-[#F5F5F0]/40">Message m:</span>
                    <span className="text-[#F5F5F0]">[{message.join(' ')}]</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-[#1e293b]/50">
                    <span className="text-[#F5F5F0]/40">Codeword c = m·G:</span>
                    <span className="text-[#F5F5F0]">[{codeword.join(' ')}]</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-[#1e293b]/50">
                    <span className="text-[#F5F5F0]/40">Channel Noise e:</span>
                    <span className="text-[#EF4444]">[{errorVector.join(' ')}]</span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-[#1e293b]/50">
                    <span className="text-[#F5F5F0]/40">Received r = c ⊕ e:</span>
                    <span className="text-[#F5F5F0]">[{receivedVector.join(' ')}]</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-[#F5F5F0]/40">Recovered ĉ = r ⊕ ê:</span>
                    <span className="text-[#4ADE80] font-bold">
                      [{correctedVector.length > 0 ? correctedVector.join(' ') : codeword.join(' ')}]
                    </span>
                  </div>
                </div>
              </div>

              {/* JSON preview */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[#F5F5F0]/40 text-[10px] font-mono">
                  <span>RAW JSON EXPORT</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCopyJSON}
                      className="text-[#F5F5F0]/60 hover:text-[#F5F5F0] transition cursor-pointer"
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={handleDownloadJSON}
                      className="text-[#F5F5F0]/60 hover:text-[#F5F5F0] transition cursor-pointer"
                    >
                      Download
                    </button>
                  </div>
                </div>
                <pre className="p-2.5 bg-[#03060c] border border-[#1e293b] rounded-lg font-mono text-[10px] text-[#F5F5F0]/70 overflow-x-auto max-h-36">
                  {JSON.stringify(logData, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[#1e293b] bg-[#080d19]">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1.5 bg-[#1e293b] hover:bg-[#334155] text-[#F5F5F0] rounded-lg text-xs transition cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleDownloadJSON}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F5F0] hover:bg-white text-[#050810] font-bold rounded-lg text-xs transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
