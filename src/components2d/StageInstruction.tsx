import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Radio,
  Zap,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useSimulationStore } from '../store/simulationStore';

export const StageInstruction: React.FC = () => {
  const {
    stage,
    errorPositions,
    syndrome,
    decode,
    correct,
    encode,
    injectNoiseAndContinue,
    reset,
    lastCorrectedBit,
  } = useSimulationStore();

  const getInstruction = () => {
    switch (stage) {
      case 'encoding':
        return {
          step: 'Transmitting',
          title: 'Generating Codeword',
          text: 'Encoding message with Generator Matrix G: systematic codeword c = [m | p] is entering the optical link.',
          accent: 'text-blue-400',
          badgeBg: 'bg-blue-950/50 border-blue-500/40 text-blue-300',
          icon: <Radio className="w-4 h-4 text-blue-400 animate-pulse" />,
          action: null,
        };
      case 'inChannel':
        return errorPositions.length > 0
          ? {
              step: 'Step 2 of 4',
              title: 'Channel Noise Injected',
              text: `Bit c${errorPositions[0]} flipped! Continuing to Receiver to test parity S = r·H^T.`,
              accent: 'text-rose-400',
              badgeBg: 'bg-rose-950/50 border-rose-500/40 text-rose-300',
              icon: <Zap className="w-4 h-4 text-rose-400" />,
              action: {
                label: 'Proceed to Receiver ➔',
                onClick: decode,
                color: 'bg-emerald-600 hover:bg-emerald-500 text-white',
              },
            }
          : {
              step: 'Step 2 of 4',
              title: 'Channel Propagation',
              text: 'Packet in transit. Tap any bit or click below to inject noise, then animation continues to Receiver.',
              accent: 'text-blue-400',
              badgeBg: 'bg-blue-950/50 border-blue-500/40 text-blue-300',
              icon: <Radio className="w-4 h-4 text-blue-400" />,
              action: {
                label: '⚡ Inject Noise & Continue',
                onClick: () => injectNoiseAndContinue(),
                color: 'bg-rose-600 hover:bg-rose-500 text-white',
              },
            };
      case 'decoding':
        return {
          step: 'Analyzing',
          title: 'Computing Syndrome',
          text: 'Evaluating Parity Check Matrix H: testing orthogonality S = r·H^T (mod 2)...',
          accent: 'text-indigo-400',
          badgeBg: 'bg-indigo-950/50 border-indigo-500/40 text-indigo-300',
          icon: <Radio className="w-4 h-4 text-indigo-400 animate-spin" />,
          action: null,
        };
      case 'errorDetected':
        return {
          step: 'Step 3 of 4',
          title: 'Parity Error Detected',
          text: `Non-zero syndrome S = [${syndrome.join('')}] isolates corrupted bit c${
            errorPositions[0] ?? '?'
          }. Click below to correct it.`,
          accent: 'text-rose-400',
          badgeBg: 'bg-rose-950/50 border-rose-500/40 text-rose-300',
          icon: <AlertTriangle className="w-4 h-4 text-rose-400" />,
          action: {
            label: 'Correct Error ➔',
            onClick: correct,
            color: 'bg-emerald-600 hover:bg-emerald-500 text-white',
          },
        };
      case 'corrected':
        return {
          step: 'Step 4 of 4',
          title: 'Codeword Restored',
          text: lastCorrectedBit !== null
            ? `Bit c${lastCorrectedBit} was inverted back to the valid code space via coset decoding. Codeword is orthogonal to H.`
            : 'No error detected — codeword was already in the valid code space.',
          accent: 'text-emerald-400',
          badgeBg: 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
          action: {
            label: '↺ New Transmission',
            onClick: reset,
            color: 'bg-slate-700 hover:bg-slate-600 text-slate-100 border border-slate-600',
          },
        };
      default:
        return {
          step: 'Step 1 of 4',
          title: 'Compose Message',
          text: "Type or toggle your custom message m in the Control Station, then click 'Encode ➔'.",
          accent: 'text-blue-400',
          badgeBg: 'bg-blue-950/50 border-blue-500/40 text-blue-300',
          icon: <Sparkles className="w-4 h-4 text-blue-400" />,
          action: {
            label: 'Encode ➔',
            onClick: encode,
            color: 'bg-blue-600 hover:bg-blue-500 text-white',
          },
        };
    }
  };

  const instructionKey = `${stage}-${errorPositions.length > 0 ? 'err' : 'clean'}`;
  const current = getInstruction();

  return (
    <div className="pointer-events-auto max-w-xl w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={instructionKey}
          layout
          initial={{ opacity: 0, y: 14, scale: 0.96, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -10, scale: 0.96, filter: 'blur(4px)' }}
          transition={{
            type: 'spring',
            stiffness: 380,
            damping: 32,
            mass: 0.8,
          }}
          className="relative flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-900/90 backdrop-blur-xl border border-slate-700/70 rounded-2xl shadow-2xl text-slate-100 overflow-hidden"
        >
          {/* Subtle Ambient Edge Glow */}
          <div
            className={`absolute inset-0 pointer-events-none opacity-15 bg-gradient-to-r ${
              stage === 'errorDetected'
                ? 'from-rose-500/30 via-rose-500/10 to-transparent'
                : stage === 'corrected'
                ? 'from-emerald-500/30 via-emerald-500/10 to-transparent'
                : 'from-blue-500/30 via-blue-500/10 to-transparent'
            }`}
          />

          <div className="relative z-10 flex items-center gap-3 min-w-0">
            {/* Status Icon Badge */}
            <motion.div
              layout
              className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-slate-950/70 border border-slate-800"
            >
              {current.icon}
            </motion.div>

            {/* Text Content */}
            <motion.div layout className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider font-semibold border ${current.badgeBg}`}
                >
                  {current.step}
                </span>
                <span className={`text-xs font-mono font-bold tracking-wide truncate ${current.accent}`}>
                  {current.title}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-300 font-sans leading-snug line-clamp-2 md:line-clamp-none">
                {current.text}
              </p>
            </motion.div>
          </div>

          {/* Optional Direct Context Action Button */}
          {current.action && (
            <motion.button
              layout
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={current.action.onClick}
              className={`relative z-10 flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer shadow-md ${current.action.color}`}
            >
              <span>{current.action.label}</span>
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
