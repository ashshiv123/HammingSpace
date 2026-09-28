import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  FastForward,
  RotateCcw,
  Sparkles,
  Zap,
  Minimize2,
  Maximize2,
  Cpu,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useSimulationStore } from '../store/simulationStore';

export interface ControlPanelProps {
  onOpenCalculationVisualizer?: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  onOpenCalculationVisualizer,
}) => {
  const {
    n,
    k,
    stage,
    message,
    toggleMessageBit,
    setMessage,
    errorPositions,
    syndrome,
    selectPreset,
    encode,
    startExplainEncoding,
    decode,
    startExplainDecoding,
    correct,
    reset,
    toggleChannelBit,
    injectNoiseAndContinue,
    speedMultiplier,
    setSpeedMultiplier,
    calculationSteps,
    currentStepIndex,
    isAnimationPlaying,
    playAnimation,
    pauseAnimation,
    nextStep,
    skipAnimation,
    replayAnimation,
    autoOpenLesson,
    setAutoOpenLesson,
    lessonOpen,
  } = useSimulationStore();

  const [isMinimized, setIsMinimized] = useState(false);
  const [binaryText, setBinaryText] = useState(() => message.join(''));
  const [asciiText, setAsciiText] = useState('');
  const [showAsciiConverter, setShowAsciiConverter] = useState(false);

  // Synchronize binaryText when message array changes
  React.useEffect(() => {
    setBinaryText(message.join(''));
  }, [message]);

  const handleBinaryChange = (val: string) => {
    // Keep only 0 and 1
    const clean = val.replace(/[^01]/g, '').slice(0, k);
    setBinaryText(clean);

    if (clean.length === k) {
      const newBits = clean.split('').map((b) => parseInt(b, 10));
      setMessage(newBits);
    } else if (clean.length > 0) {
      // Pad remaining with current bits or zeros
      const newBits = Array.from({ length: k }, (_, i) => {
        if (i < clean.length) return parseInt(clean[i], 10);
        return message[i] ?? 0;
      });
      setMessage(newBits);
    }
  };

  const handleRandomMessage = () => {
    const randomBits = Array.from({ length: k }, () => (Math.random() > 0.5 ? 1 : 0));
    setMessage(randomBits);
  };

  const handleAllOnes = () => {
    setMessage(new Array(k).fill(1));
  };

  const handleAllZeros = () => {
    setMessage(new Array(k).fill(0));
  };

  const handleAlternating = () => {
    setMessage(Array.from({ length: k }, (_, i) => (i % 2 === 0 ? 1 : 0)));
  };

  const handleInvertAll = () => {
    setMessage(message.map((b) => b ^ 1));
  };

  const handleAsciiChange = (text: string) => {
    setAsciiText(text);
    if (!text) return;

    let binaryStr = '';
    for (let i = 0; i < text.length; i++) {
      binaryStr += text.charCodeAt(i).toString(2).padStart(8, '0');
    }
    const cleanBits = Array.from({ length: k }, (_, i) => {
      if (i < binaryStr.length) return parseInt(binaryStr[i], 10);
      return 0;
    });
    setMessage(cleanBits);
  };

  const handleInjectRandomNoise = () => {
    const randomBit = Math.floor(Math.random() * n);
    toggleChannelBit(randomBit);
  };

  const getStatusLabel = () => {
    switch (stage) {
      case 'idle':
        return { text: 'IDLE', color: 'text-slate-400', bg: 'bg-slate-800' };
      case 'encoding':
        return { text: 'ENCODING', color: 'text-teal-400', bg: 'bg-teal-950/60' };
      case 'inChannel':
        return { text: 'IN TRANSIT', color: 'text-teal-400', bg: 'bg-teal-950/60' };
      case 'decoding':
        return { text: 'DECODING', color: 'text-indigo-400', bg: 'bg-indigo-950/60' };
      case 'errorDetected':
        return { text: 'PARITY ERROR', color: 'text-rose-400', bg: 'bg-rose-950/60' };
      case 'corrected':
        return { text: 'RESTORED', color: 'text-emerald-400', bg: 'bg-emerald-950/60' };
    }
  };

  const status = getStatusLabel();
  const hasError = errorPositions.length > 0;

  // Minimized state
  if (isMinimized) {
    return (
      <div className="flex items-center gap-3 px-3.5 py-2 bg-slate-900/90 backdrop-blur-xl border border-slate-700/60 rounded-md shadow-lg text-slate-100">
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-teal-400" />
          <span className="text-xs font-mono font-semibold tracking-wider uppercase">
            Lab Controls
          </span>
        </div>
        <div
          className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${status.color} ${status.bg}`}
        >
          {status.text}
        </div>
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition cursor-pointer"
          title="Expand Panel"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-72 max-w-[calc(100vw-2rem)] bg-slate-900/90 backdrop-blur-xl border border-slate-700/60 rounded-md shadow-xl text-slate-100 overflow-hidden transition-all text-xs font-sans">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-950/60 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-teal-400" />
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            Control Station
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold ${status.color} ${status.bg}`}
          >
            {status.text}
          </span>
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition cursor-pointer"
            title="Minimize Panel"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-3.5 space-y-3 font-mono">
        {/* Code preset selection */}
        <div>
          <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
            Code Specification
          </label>
          <select
            value={`(${n},${k})`}
            onChange={(e) => selectPreset(e.target.value)}
            className="w-full bg-slate-950/70 border border-slate-800 rounded-md px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-teal-500 cursor-pointer"
          >
            <option value="(15,11)">(15, 11) Hamming Code</option>
            <option value="(7,4)">(7, 4) Hamming Code</option>
            <option value="(3,1)">(3, 1) Repetition Code</option>
          </select>
        </div>

        {/* Message Composer (k Bits) */}
        <div className="border-t border-slate-800 pt-2.5 space-y-2">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider">
            <span className="flex items-center gap-1 text-slate-200 font-bold">
              <Sparkles className="w-3 h-3 text-teal-400" />
              <span>Message m ({k} bits)</span>
            </span>
            <span className="text-teal-400 font-mono font-bold">[{message.join(' ')}]</span>
          </div>

          {/* Clickable Bit Chips */}
          <div className="flex flex-wrap gap-1 bg-slate-950/70 p-1.5 rounded-md border border-slate-800">
            {message.map((bit, idx) => (
              <button
                key={`ctl-mbit-${idx}`}
                type="button"
                disabled={stage === 'encoding' || stage === 'decoding'}
                onClick={() => toggleMessageBit(idx)}
                className={`w-10 h-10 rounded-md text-xs font-mono font-bold transition cursor-pointer flex flex-col items-center justify-center ${
                  bit === 1
                    ? 'bg-teal-600 text-white shadow-md ring-1 ring-blue-400'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700'
                } ${stage === 'encoding' || stage === 'decoding' ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={`Click to flip bit m${idx} (${bit} ➔ ${bit ^ 1})`}
              >
                <span className="text-[7px] text-slate-400">m{idx}</span>
                <span className="text-[11px] leading-none">{bit}</span>
              </button>
            ))}
          </div>

          {/* Direct Binary Text Input */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-md px-2.5 py-1 focus-within:border-teal-500 transition">
              <span className="text-[10px] text-slate-500 font-mono">BIN:</span>
              <input
                type="text"
                value={binaryText}
                onChange={(e) => handleBinaryChange(e.target.value)}
                disabled={stage === 'encoding' || stage === 'decoding'}
                placeholder={`Type ${k} bits...`}
                className="w-full bg-transparent text-xs font-mono text-blue-300 font-bold tracking-widest focus:outline-none"
                maxLength={k}
              />
              <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
                {binaryText.length}/{k}
              </span>
            </div>
            <p className="text-[9px] text-slate-500">
              Type 0s and 1s directly to compose your own custom binary message.
            </p>
          </div>

          {/* Quick Preset Buttons Bar */}
          <div className="grid grid-cols-4 gap-1 text-[9px] font-mono">
            <button
              type="button"
              onClick={handleRandomMessage}
              disabled={stage === 'encoding' || stage === 'decoding'}
              className="py-1 px-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded text-center transition cursor-pointer"
              title="Generate random binary bits"
            >
              🎲 Random
            </button>
            <button
              type="button"
              onClick={handleAllOnes}
              disabled={stage === 'encoding' || stage === 'decoding'}
              className="py-1 px-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded text-center transition cursor-pointer"
              title="Set all message bits to 1"
            >
              All 1s
            </button>
            <button
              type="button"
              onClick={handleAllZeros}
              disabled={stage === 'encoding' || stage === 'decoding'}
              className="py-1 px-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded text-center transition cursor-pointer"
              title="Set all message bits to 0"
            >
              All 0s
            </button>
            <button
              type="button"
              onClick={handleInvertAll}
              disabled={stage === 'encoding' || stage === 'decoding'}
              className="py-1 px-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded text-center transition cursor-pointer"
              title="Invert all message bits"
            >
              Invert
            </button>
          </div>

          {/* ASCII / Text to Binary Converter Dropdown */}
          <div className="pt-0.5">
            <button
              type="button"
              onClick={() => setShowAsciiConverter(!showAsciiConverter)}
              className="text-[9px] text-teal-400 hover:text-blue-300 font-mono flex items-center gap-1 cursor-pointer"
            >
              <span>{showAsciiConverter ? '▲ Hide Text Converter' : '▼ Convert Text (e.g. "A", "Hi") to Bits'}</span>
            </button>

            {showAsciiConverter && (
              <div className="mt-1.5 p-2 rounded-md bg-slate-950 border border-slate-800 space-y-1">
                <label className="text-[9px] text-slate-400 block">
                  ASCII characters translated to {k} bits:
                </label>
                <input
                  type="text"
                  value={asciiText}
                  onChange={(e) => handleAsciiChange(e.target.value)}
                  placeholder="Type text (e.g. A, Hi, OK)..."
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:border-teal-500"
                  maxLength={Math.ceil(k / 8) + 1}
                />
              </div>

            )}
          </div>

          <label className="flex items-center justify-between gap-3 border-t border-slate-800 pt-2 text-[10px] text-slate-400 cursor-pointer">
            <span>Auto-open lesson steps</span>
            <input
              type="checkbox"
              checked={autoOpenLesson}
              onChange={(event) => setAutoOpenLesson(event.target.checked)}
              disabled={lessonOpen}
              className="accent-teal-400"
            />
          </label>
        </div>

        {/* Dynamic Contextual Action Area Based on Stage */}
        <div className="border-t border-slate-800 pt-2 space-y-2">
          {/* STAGE 1: IDLE */}
          {stage === 'idle' && (
            <>
              <button
                type="button"
                onClick={encode}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-mono font-semibold uppercase transition bg-teal-600 hover:bg-teal-500 text-white cursor-pointer shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Transmit & Encode</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  startExplainEncoding();
                }}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-mono font-medium uppercase transition bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>Step-by-Step Breakdown</span>
              </button>

              <button
                type="button"
                onClick={handleInjectRandomNoise}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-950/70 border border-slate-800 hover:border-rose-700/50 text-slate-300 hover:text-rose-300 rounded-md text-xs font-mono transition cursor-pointer"
              >
                <Zap className="w-3 h-3 text-rose-400" />
                <span>Inject Channel Noise</span>
              </button>
            </>
          )}

          {/* STAGE 2: IN CHANNEL */}
          {stage === 'inChannel' && (
            <div className="space-y-2">
              <div
                className={`p-2.5 rounded-md border text-[11px] leading-tight ${
                  hasError
                    ? 'bg-rose-950/30 border-rose-600/40 text-rose-200'
                    : 'bg-teal-950/30 border-blue-600/40 text-blue-200'
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold mb-0.5">
                  {hasError ? (
                    <>
                      <Zap className="w-3.5 h-3.5 text-rose-400" />
                      <span>Noise Injected (Bit c{errorPositions[0]})</span>
                    </>
                  ) : (
                    <>
                      <Radio className="w-3.5 h-3.5 text-teal-400" />
                      <span>Codeword In Transit</span>
                    </>
                  )}
                </div>
                <p className="text-[10px] text-slate-400">
                  {hasError
                    ? 'Bit is corrupted. Proceed to Receiver to check parity syndrome.'
                    : 'Uncorrupted packet. Proceed to Receiver to verify orthogonality.'}
                </p>
              </div>

              {/* Main inChannel Action: Inject Noise & Continue OR Proceed */}
              <button
                type="button"
                onClick={() => injectNoiseAndContinue()}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-mono font-semibold uppercase transition bg-rose-600 hover:bg-rose-500 text-white cursor-pointer shadow-md"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>⚡ Inject Noise & Continue</span>
              </button>

              <button
                type="button"
                onClick={decode}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-mono font-medium uppercase transition bg-teal-600 hover:bg-teal-500 text-white cursor-pointer shadow-sm"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>{hasError ? 'Proceed to Receiver ➔' : 'Continue (No Noise) ➔'}</span>
              </button>

              {/* Individual Bit Corruption Buttons */}
              <div className="bg-slate-950/70 p-2 rounded-md border border-slate-800 space-y-1">
                <span className="text-[9px] text-slate-400 block font-mono">
                  Or pick a specific bit to corrupt & continue:
                </span>
                <div className="flex flex-wrap gap-1">
                  {Array.from({ length: n }).map((_, cIdx) => (
                    <button
                      key={`ctl-chan-bit-${cIdx}`}
                      type="button"
                      onClick={() => injectNoiseAndContinue(cIdx)}
                      className={`w-10 h-10 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                        errorPositions.includes(cIdx)
                          ? 'bg-rose-600 text-white shadow-sm ring-1 ring-rose-400'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                      }`}
                      title={`Corrupt bit c${cIdx} and continue`}
                    >
                      {`c${cIdx}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STAGE 3: ERROR DETECTED */}
          {stage === 'errorDetected' && (
            <div className="space-y-2">
              <div className="p-2.5 rounded-md bg-rose-950/30 border border-rose-600/40 text-[11px] text-rose-200">
                <div className="flex items-center gap-1.5 font-semibold mb-0.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Parity Violation Detected</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Syndrome S = [{syndrome.join('')}] isolates error at bit c{errorPositions[0] ?? '?'}.
                </p>
              </div>

              <button
                type="button"
                onClick={correct}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-mono font-semibold uppercase transition bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Invert Bit (Correct Error)</span>
              </button>
            </div>
          )}

          {/* STAGE 4: CORRECTED */}
          {stage === 'corrected' && (
            <div className="space-y-2">
              <div className="p-2.5 rounded-md bg-emerald-950/30 border border-emerald-600/40 text-[11px] text-emerald-200">
                <div className="flex items-center gap-1.5 font-semibold mb-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Codeword Restored</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Syndrome S = [000] • Valid code space verified.
                </p>
              </div>

              <button
                type="button"
                onClick={reset}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-mono font-semibold uppercase transition bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>New Transmission</span>
              </button>
            </div>
          )}

          {/* STAGE 5: RUNNING / CALCULATION IN PROGRESS */}
          {(stage === 'encoding' || stage === 'decoding') && !lessonOpen && (
            <div className="p-3 rounded-md bg-slate-950/80 border border-teal-500/40 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono font-semibold">
                <span className="flex items-center gap-1.5 text-teal-400">
                  <Radio className="w-3.5 h-3.5 animate-spin" />
                  <span>{stage === 'encoding' ? 'Matrix Encoding' : 'Syndrome Check'}</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-teal-950 text-blue-300 border border-blue-800">
                  {currentStepIndex + 1}/{calculationSteps.length}
                </span>
              </div>

              {/* Playback Controls */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {isAnimationPlaying ? (
                  <button
                    type="button"
                    onClick={pauseAnimation}
                    className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition cursor-pointer"
                    title="Pause"
                  >
                    <Pause className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={playAnimation}
                    className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-md bg-teal-600 hover:bg-teal-500 text-white text-xs font-mono font-bold transition cursor-pointer shadow-sm"
                    title="Play"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition cursor-pointer"
                  title="Next Step"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={replayAnimation}
                  className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 text-xs font-mono transition cursor-pointer"
                  title="Replay from start"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={skipAnimation}
                  className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 text-xs font-mono transition cursor-pointer"
                  title="Skip to end"
                >
                  <FastForward className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[10px] text-slate-400 text-center pt-0.5">
                Displayed live on the studio screen behind
              </p>
            </div>
          )}

          {/* Dedicated 2D Math Visualizer Link */}
          {onOpenCalculationVisualizer && (
            <button
              type="button"
              onClick={onOpenCalculationVisualizer}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-mono font-semibold uppercase transition bg-slate-800/80 hover:bg-slate-800 text-teal-400 border border-slate-700 cursor-pointer"
            >
              <span>🧮 2D Matrix Visualizer</span>
            </button>
          )}
        </div>

        {/* Animation Speed Selector */}
        <div className="border-t border-slate-800 pt-2">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
            <span>ANIMATION SPEED</span>
            <span className="text-teal-400 font-semibold">{speedMultiplier}×</span>
          </div>
          <div className="grid grid-cols-3 gap-1 bg-slate-950/70 p-1 rounded-md border border-slate-800">
            {[0.5, 1, 2].map((spd) => (
              <button
                key={`spd-${spd}`}
                type="button"
                onClick={() => setSpeedMultiplier(spd as 0.5 | 1 | 2)}
                className={`py-1 rounded text-[10px] font-mono transition cursor-pointer ${
                  speedMultiplier === spd
                    ? 'bg-teal-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}×
              </button>
            ))}
          </div>
        </div>

        {/* Simulation Reset */}
        <div className="border-t border-slate-800 pt-2 space-y-1.5">
          <button
            type="button"
            onClick={reset}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-950/70 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-md text-[11px] font-mono transition cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Simulation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
