import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Footprints, Eye, MousePointer, X } from 'lucide-react';
import { useSimulationStore } from '../store/simulationStore';

export const FirstPersonReticle: React.FC = () => {
  const { cameraFocus, setCameraFocus } = useSimulationStore();
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  const isFPV = cameraFocus === 'firstPerson';

  useEffect(() => {
    const handlePointerLockChange = () => {
      setIsPointerLocked(!!document.pointerLockElement);
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
  }, []);

  const requestLock = () => {
    const canvas = document.querySelector('canvas');
    if (canvas && !document.pointerLockElement) {
      canvas.requestPointerLock();
    }
  };

  const unlockPointer = () => {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  };

  if (!isFPV) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex flex-col justify-between p-4 select-none">
      {/* Top Floating Guide & HUD Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mx-auto flex items-center gap-3 px-4 py-2 bg-slate-900/90 backdrop-blur-xl border border-emerald-500/40 rounded-2xl shadow-2xl text-slate-100 font-mono text-xs pointer-events-auto"
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Footprints className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-emerald-400 tracking-wider text-[11px]">
            FIRST PERSON VIEW
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-[10px] text-slate-300 border-l border-slate-700/80 pl-3">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-bold text-slate-200">W</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-bold text-slate-200">A</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-bold text-slate-200">S</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-bold text-slate-200">D</kbd>
            <span>Walk</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-bold text-slate-200">Shift</kbd>
            <span>Run</span>
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <MousePointer className="w-3 h-3 text-emerald-400" />
            <span>{isPointerLocked ? 'Mouse Locked (FPS)' : 'Click Scene to Lock Mouse'}</span>
          </span>
        </div>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-700/80">
          {!isPointerLocked ? (
            <button
              type="button"
              onClick={requestLock}
              className="px-2 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-[10px] font-semibold transition cursor-pointer"
            >
              Lock Mouse
            </button>
          ) : (
            <button
              type="button"
              onClick={unlockPointer}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition cursor-pointer"
            >
              Unlock (Esc)
            </button>
          )}

          <button
            type="button"
            onClick={() => setCameraFocus('overview')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[10px] transition cursor-pointer shadow-md"
          >
            <span>⊙ Exit FPV</span>
          </button>
        </div>
      </motion.div>

      {/* Subtle First-Person Gaming Reticle Crosshair (Center of Screen) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="relative flex items-center justify-center w-6 h-6">
          {/* Center glowing aim dot */}
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/90 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          {/* Crosshair ticks */}
          <div className="absolute top-0 w-0.5 h-1.5 bg-emerald-400/50" />
          <div className="absolute bottom-0 w-0.5 h-1.5 bg-emerald-400/50" />
          <div className="absolute left-0 h-0.5 w-1.5 bg-emerald-400/50" />
          <div className="absolute right-0 h-0.5 w-1.5 bg-emerald-400/50" />
        </div>
      </div>

      {/* Bottom helper tip when unlocked */}
      {!isPointerLocked && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mx-auto px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-[10px] text-slate-400 font-mono"
        >
          Tip: Click anywhere in the 3D studio to lock mouse for smooth FPS look (Press Esc anytime)
        </motion.div>
      )}
    </div>
  );
};
