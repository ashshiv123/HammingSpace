import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  FastForward,
  Calculator,
  CheckCircle2,
  Sparkles,
  X,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { useSimulationStore } from '../store/simulationStore';

export const CalculationStepperBar: React.FC = () => {
  const {
    stage,
    calculationSteps,
    currentStepIndex,
    isAnimationPlaying,
    speedMultiplier,
    showLiveHUD,
    setShowLiveHUD,
    dismissLiveHUD,
    playAnimation,
    pauseAnimation,
    nextStep,
    replayAnimation,
    skipAnimation,
    setSpeedMultiplier,
  } = useSimulationStore();

  const [isMinimized, setIsMinimized] = useState(false);

  // Live calculation stepper MUST only be visible during active calculation stages
  if (stage !== 'encoding' && stage !== 'decoding') return null;
  if (calculationSteps.length === 0) return null;

  const currentStep = calculationSteps[currentStepIndex];
  if (!currentStep) return null;

  // If user dismissed the live demo pop-out, show only an unobtrusive re-open pill
  if (!showLiveHUD) {
    return (
      <div className="pointer-events-auto transition-all">
        <button
          type="button"
          onClick={() => setShowLiveHUD(true)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-xl border border-slate-700/60 text-xs font-mono text-blue-400 shadow-lg hover:bg-slate-800 transition cursor-pointer"
          title="Click to reopen live calculation pop-out"
        >
          <Calculator className="w-3.5 h-3.5 text-blue-400" />
          <span>Show Live Step ({currentStepIndex + 1}/{calculationSteps.length})</span>
        </button>
      </div>
    );
  }

  const isEncoding = currentStep.type === 'encoding';
  const progressPercent = Math.round(
    ((currentStepIndex + 1) / calculationSteps.length) * 100
  );

  return (
    <div className="pointer-events-auto max-w-2xl w-full transition-all">
      <div className="flex flex-col bg-slate-900/90 backdrop-blur-2xl border border-slate-700/60 rounded-2xl shadow-xl text-slate-100 overflow-hidden">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-3.5 py-2 bg-slate-950/60 border-b border-slate-800">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-blue-600/20 text-blue-400 flex-shrink-0">
              <Calculator className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 truncate">
                  {isEncoding ? 'Matrix Vector Multiplication' : 'Parity Syndrome Verification'}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 flex-shrink-0">
                  {currentStepIndex + 1}/{calculationSteps.length}
                </span>
              </div>
            </div>
          </div>

          {/* Stepper Controls & Close Pop-out Button */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {isAnimationPlaying ? (
              <button
                type="button"
                onClick={pauseAnimation}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono font-semibold transition cursor-pointer"
                title="Pause Animation"
              >
                <Pause className="w-3 h-3 fill-current" />
                <span className="hidden sm:inline">Pause</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={playAnimation}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-500 text-xs font-mono font-bold transition cursor-pointer shadow-sm"
                title="Play Animation"
              >
                <Play className="w-3 h-3 fill-current" />
                <span className="hidden sm:inline">Play</span>
              </button>
            )}

            <button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 transition cursor-pointer"
              title="Advance single step"
            >
              <SkipForward className="w-3 h-3" />
              <span className="hidden sm:inline">Step</span>
            </button>

            <button
              type="button"
              onClick={replayAnimation}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition cursor-pointer"
              title="Replay from start"
            >
              <RotateCcw className="w-3 h-3" />
            </button>

            <button
              type="button"
              onClick={skipAnimation}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition cursor-pointer"
              title="Skip to end"
            >
              <FastForward className="w-3 h-3" />
            </button>

            {/* Minimize / Maximize Toggle */}
            <button
              type="button"
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition cursor-pointer"
              title={isMinimized ? 'Expand pop-out' : 'Minimize pop-out'}
            >
              {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
            </button>

            {/* Close / Dismiss Live Pop-out Button */}
            <button
              type="button"
              onClick={dismissLiveHUD}
              className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 hover:text-white transition cursor-pointer ml-0.5"
              title="Close / Remove Live Pop-out"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dynamic Mathematical Body */}
        {!isMinimized && (
          <div className="p-3.5 space-y-2.5 text-xs font-sans">
            {/* Step Stage & Speed */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold bg-blue-950/50 border border-blue-500/30 text-blue-300 flex-shrink-0">
                  {currentStep.title}
                </span>
                <span className="text-xs font-mono text-slate-400 truncate">
                  {currentStep.subtitle}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 flex-shrink-0">
                <span>Speed:</span>
                {[0.5, 1, 2].map((spd) => (
                  <button
                    key={`spd-btn-${spd}`}
                    type="button"
                    onClick={() => setSpeedMultiplier(spd as 0.5 | 1 | 2)}
                    className={`px-1.5 py-0.5 rounded border transition cursor-pointer ${
                      speedMultiplier === spd
                        ? 'border-blue-500 text-white bg-blue-600 font-bold'
                        : 'border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {spd}×
                  </button>
                ))}
              </div>
            </div>

            {/* Core Mathematical Display Box */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 font-mono space-y-1.5">
              <div className="flex items-center justify-between text-blue-400 font-semibold text-xs tracking-wide">
                <span>{currentStep.mathFormula}</span>
                <Sparkles className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              </div>

              <div className="text-[11px] text-slate-300 overflow-x-auto whitespace-nowrap py-0.5">
                {currentStep.expandedTerms}
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-xs">
                <span className="text-emerald-400 font-bold">
                  {currentStep.mod2Result}
                </span>
                <span className="text-[10px] text-slate-400 font-sans hidden sm:inline">
                  Modulo-2 arithmetic (GF(2) XOR: 1⊕1=0, 1⊕0=1)
                </span>
              </div>
            </div>

            {/* Educational Explanation Line */}
            <div className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed font-sans">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
              <p>{currentStep.explanation}</p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
