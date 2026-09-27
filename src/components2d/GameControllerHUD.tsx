import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, ChevronUp, ChevronDown, Move, Eye, Zap } from 'lucide-react';
import { useSimulationStore } from '../store/simulationStore';

export const GameControllerHUD: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { setCameraFocus } = useSimulationStore();

  const sendKey = (code: string, isDown: boolean) => {
    const event = new KeyboardEvent(isDown ? 'keydown' : 'keyup', {
      code,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);
  };

  return (
    <aside
      id="wasd-flight-hud"
      className="pointer-events-auto select-none font-mono text-xs"
    >
      <div className="flex flex-col bg-slate-900/90 backdrop-blur-xl border border-slate-700/70 rounded-2xl shadow-2xl text-slate-100 overflow-hidden">
        {/* Header Toggle */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between px-3 py-1.5 bg-slate-950/80 border-b border-slate-800 cursor-pointer hover:bg-slate-900 transition"
        >
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-5 h-5 rounded bg-blue-600/30 text-blue-400 border border-blue-500/40">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-slate-200 tracking-wide">
              WASD FREE CAMERA
            </span>
          </div>
          <button
            type="button"
            className="p-1 rounded text-slate-400 hover:text-slate-200"
          >
            {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Expandable Flight Controls */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="p-2.5 space-y-2"
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Move className="w-3 h-3 text-blue-400" />
                  <span>WASD to Fly</span>
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3 text-emerald-400" />
                  <span>Mouse Drag to Look</span>
                </span>
              </div>

              {/* Virtual Flight Buttons (Touch & Mouse accessible) */}
              <div className="flex items-center justify-center gap-2 py-1">
                {/* D-Pad Controls */}
                <div className="flex flex-col items-center gap-1">
                  {/* W (Forward) */}
                  <button
                    type="button"
                    onMouseDown={() => sendKey('KeyW', true)}
                    onMouseUp={() => sendKey('KeyW', false)}
                    onTouchStart={() => sendKey('KeyW', true)}
                    onTouchEnd={() => sendKey('KeyW', false)}
                    className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 active:bg-blue-600 active:border-blue-400 text-xs font-bold transition flex flex-col items-center justify-center shadow cursor-pointer active:scale-95"
                    title="Move Camera Forward (W)"
                  >
                    <span>W</span>
                    <span className="text-[7px] text-slate-400 leading-none">FWD</span>
                  </button>

                  {/* A S D (Strafe Left, Backward, Strafe Right) */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onMouseDown={() => sendKey('KeyA', true)}
                      onMouseUp={() => sendKey('KeyA', false)}
                      onTouchStart={() => sendKey('KeyA', true)}
                      onTouchEnd={() => sendKey('KeyA', false)}
                      className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 active:bg-blue-600 active:border-blue-400 text-xs font-bold transition flex flex-col items-center justify-center shadow cursor-pointer active:scale-95"
                      title="Strafe Left (A)"
                    >
                      <span>A</span>
                      <span className="text-[7px] text-slate-400 leading-none">LFT</span>
                    </button>
                    <button
                      type="button"
                      onMouseDown={() => sendKey('KeyS', true)}
                      onMouseUp={() => sendKey('KeyS', false)}
                      onTouchStart={() => sendKey('KeyS', true)}
                      onTouchEnd={() => sendKey('KeyS', false)}
                      className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 active:bg-blue-600 active:border-blue-400 text-xs font-bold transition flex flex-col items-center justify-center shadow cursor-pointer active:scale-95"
                      title="Move Camera Backward (S)"
                    >
                      <span>S</span>
                      <span className="text-[7px] text-slate-400 leading-none">BCK</span>
                    </button>
                    <button
                      type="button"
                      onMouseDown={() => sendKey('KeyD', true)}
                      onMouseUp={() => sendKey('KeyD', false)}
                      onTouchStart={() => sendKey('KeyD', true)}
                      onTouchEnd={() => sendKey('KeyD', false)}
                      className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 active:bg-blue-600 active:border-blue-400 text-xs font-bold transition flex flex-col items-center justify-center shadow cursor-pointer active:scale-95"
                      title="Strafe Right (D)"
                    >
                      <span>D</span>
                      <span className="text-[7px] text-slate-400 leading-none">RGT</span>
                    </button>
                  </div>
                </div>

                {/* Elevation Controls (Space / Q) */}
                <div className="flex flex-col items-center gap-1 pl-1 border-l border-slate-800">
                  <button
                    type="button"
                    onMouseDown={() => sendKey('Space', true)}
                    onMouseUp={() => sendKey('Space', false)}
                    onTouchStart={() => sendKey('Space', true)}
                    onTouchEnd={() => sendKey('Space', false)}
                    className="w-9 h-8 rounded-lg bg-slate-800 border border-slate-700 active:bg-emerald-600 active:border-emerald-400 text-[10px] font-bold transition flex flex-col items-center justify-center shadow cursor-pointer active:scale-95"
                    title="Fly Up (Space / E)"
                  >
                    <span>▲ UP</span>
                    <span className="text-[7px] text-slate-400 leading-none">SPACE</span>
                  </button>
                  <button
                    type="button"
                    onMouseDown={() => sendKey('KeyQ', true)}
                    onMouseUp={() => sendKey('KeyQ', false)}
                    onTouchStart={() => sendKey('KeyQ', true)}
                    onTouchEnd={() => sendKey('KeyQ', false)}
                    className="w-9 h-8 rounded-lg bg-slate-800 border border-slate-700 active:bg-emerald-600 active:border-emerald-400 text-[10px] font-bold transition flex flex-col items-center justify-center shadow cursor-pointer active:scale-95"
                    title="Fly Down (Q / C)"
                  >
                    <span>▼ DN</span>
                    <span className="text-[7px] text-slate-400 leading-none">Q</span>
                  </button>
                </div>
              </div>

              {/* Quick Reset to Overview */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px]">
                <button
                  type="button"
                  onClick={() => setCameraFocus('overview')}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-300 font-semibold transition cursor-pointer w-full text-center"
                >
                  ⊙ Reset to Overview Angle
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
};
