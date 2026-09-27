/**
 * labStore.js — Zustand global state for HammingSpace
 *
 * State shape: { n, k, G, H, m, c, e, r, S, errorPosition, correctable,
 *   verdict, mode, currentStage, dMin, t, sessionEvents }
 */

import { create } from 'zustand';
import {
  encode as gf2Encode,
  syndrome as gf2Syndrome,
  deriveH,
  enumerateCodewords,
  minDistance,
  buildSyndromeTable,
  correct as gf2Correct,
} from '../lib/gf2.js';
import {
  generateEncodingSteps,
  generateSyndromeSteps,
  generateCorrectionSteps,
} from '../lib/calculationStepper.js';

// Default (7,4) Hamming Code
const DEFAULT_G = [
  [1, 0, 0, 0, 1, 1, 0],
  [0, 1, 0, 0, 1, 0, 1],
  [0, 0, 1, 0, 0, 1, 1],
  [0, 0, 0, 1, 1, 1, 1],
];

function buildCodeSystem(G) {
  const H = deriveH(G);
  const codewords = enumerateCodewords(G);
  const { dMin, t } = minDistance(codewords);
  const syndromeTable = buildSyndromeTable(H, t);
  return { H, codewords, dMin, t, syndromeTable };
}

const zeroMsg = (k) => Array(k).fill(0);
const zeroVec = (n) => Array(n).fill(0);

export const useLabStore = create((set, get) => {
  const sys = buildCodeSystem(DEFAULT_G);
  const k = DEFAULT_G.length;
  const n = DEFAULT_G[0].length;

  return {
    n, k,
    G: DEFAULT_G,
    H: sys.H,
    dMin: sys.dMin,
    t: sys.t,
    m: zeroMsg(k),
    c: zeroVec(n),
    e: zeroVec(n),
    r: zeroVec(n),
    S: [],
    corrected: zeroVec(n),
    errorPosition: null,
    correctable: true,
    verdict: 'idle',
    mode: 'solo',
    currentStage: 'compose',
    sessionEvents: [],
    _syndromeTable: sys.syndromeTable,
    _codewords: sys.codewords,

    // ── Calculation Stepper State (from project_simulation integration) ──
    calculationSteps: [],
    currentStepIndex: 0,
    isAnimationPlaying: false,
    speedMultiplier: 1,
    showLiveHUD: true,

    setMessageBit: (index, value) => {
      const { m } = get();
      if (index < 0 || index >= m.length) return;
      const newM = [...m];
      newM[index] = value !== undefined ? (value & 1) : (m[index] ^ 1);
      set({ m: newM, currentStage: 'compose' });
    },

    encode: () => {
      const { m, G, n, sessionEvents } = get();
      const c = gf2Encode(m, G);
      const steps = generateEncodingSteps(m, G);
      set({
        c, e: zeroVec(n), r: [...c], S: [], corrected: zeroVec(n),
        errorPosition: null, correctable: true, verdict: 'idle',
        currentStage: 'encoded',
        beyondGuaranteedCorrection: false,
        calculationSteps: steps,
        currentStepIndex: 0,
        isAnimationPlaying: true,
        showLiveHUD: true,
        sessionEvents: [...sessionEvents, { type: 'encode', vectorSnapshot: [...c], timestamp: new Date().toISOString() }],
      });
    },

    setStage: (stage) => set({ currentStage: stage }),
    transmitToReceiver: () => set({ currentStage: 'received' }),

    injectErrorAtPosition: (pos1) => {
      const { c, e: curE, sessionEvents } = get();
      const idx = pos1 - 1;
      if (idx < 0 || idx >= c.length) return;
      const newE = [...curE]; newE[idx] ^= 1;
      const newR = c.map((b, i) => b ^ newE[i]);
      set({
        e: newE, r: newR, currentStage: 'in-flight',
        sessionEvents: [...sessionEvents, { type: 'inject', position: pos1, vectorSnapshot: [...newR], timestamp: new Date().toISOString() }],
      });
    },

    decode: () => {
      const { r, H, e, t, _syndromeTable, sessionEvents } = get();
      const S = gf2Syndrome(r, H);
      const isClean = S.every(b => b === 0);
      let correctable = false, errorPosition = null;

      const actualErrorWeight = e.reduce((acc, bit) => acc + bit, 0);
      const beyondGuaranteedCorrection = actualErrorWeight > t;

      if (isClean) { correctable = true; }
      else {
        const key = S.join(',');
        const ev = _syndromeTable.get(key);
        correctable = !!ev;
        if (correctable && ev) {
          const p = ev.map((b, i) => (b === 1 ? i + 1 : null)).filter(Boolean);
          errorPosition = p.length === 1 ? p[0] : null;
        }
      }
      const verdict = isClean ? 'clean' : correctable ? 'detected' : 'uncorrectable';
      const steps = generateSyndromeSteps(r, H, _syndromeTable);
      set({
        S, correctable, errorPosition, verdict, currentStage: 'decoded',
        beyondGuaranteedCorrection,
        calculationSteps: steps,
        currentStepIndex: 0,
        isAnimationPlaying: true,
        showLiveHUD: true,
        sessionEvents: [...sessionEvents, { type: 'decode', vectorSnapshot: [...S], verdict, timestamp: new Date().toISOString() }],
      });
    },

    correctError: () => {
      const { r, H, _syndromeTable, correctable, sessionEvents } = get();
      if (!correctable) return;
      const { corrected, errorPosition } = gf2Correct(r, H, _syndromeTable);
      const errPos0 = errorPosition !== null ? errorPosition - 1 : -1;
      const steps = generateCorrectionSteps(r, errPos0, H);
      set({
        corrected, errorPosition, verdict: 'corrected', currentStage: 'corrected',
        calculationSteps: steps,
        currentStepIndex: 0,
        isAnimationPlaying: true,
        showLiveHUD: true,
        sessionEvents: [...sessionEvents, { type: 'correct', vectorSnapshot: [...corrected], errorPosition, timestamp: new Date().toISOString() }],
      });
    },

    resetLab: () => {
      const { n, k } = get();
      set({
        m: zeroMsg(k), c: zeroVec(n), e: zeroVec(n), r: zeroVec(n),
        S: [], corrected: zeroVec(n), errorPosition: null, correctable: true,
        verdict: 'idle', currentStage: 'compose', sessionEvents: [],
        // also reset stepper
        calculationSteps: [], currentStepIndex: 0, isAnimationPlaying: false, showLiveHUD: true,
      });
    },

    setMode: (newMode) => set({ mode: newMode }),

    // ── Calculation Stepper Actions (from project_simulation integration) ──

    /** Toggle a message bit (alias for setMessageBit, matching project_simulation API) */
    toggleMessageBit: (index) => get().setMessageBit(index),

    /** Apply custom generator matrix G */
    setCustomG: (newG) => {
      try {
        const sys = buildCodeSystem(newG);
        const k = newG.length;
        const n = newG[0].length;
        set({
          G: newG, H: sys.H, n, k,
          dMin: sys.dMin, t: sys.t,
          _syndromeTable: sys.syndromeTable, _codewords: sys.codewords,
          m: zeroMsg(k), c: zeroVec(n), e: zeroVec(n), r: zeroVec(n),
          S: [], corrected: zeroVec(n), errorPosition: null, correctable: true,
          verdict: 'idle', currentStage: 'compose', sessionEvents: [],
          calculationSteps: [], currentStepIndex: 0, isAnimationPlaying: false,
        });
        return true;
      } catch (err) {
        console.error('setCustomG failed:', err);
        return false;
      }
    },

    startEncodingAnimation: () => {
      const { m, G } = get();
      const steps = generateEncodingSteps(m, G);
      if (steps.length === 0) return;
      set({
        calculationSteps: steps,
        currentStepIndex: 0,
        isAnimationPlaying: true,
        showLiveHUD: true,
      });
    },

    startDecodingAnimation: () => {
      const { r, H, _syndromeTable } = get();
      const steps = generateSyndromeSteps(r, H, _syndromeTable);
      if (steps.length === 0) return;
      set({
        calculationSteps: steps,
        currentStepIndex: 0,
        isAnimationPlaying: true,
        showLiveHUD: true,
      });
    },

    startCorrectionAnimation: () => {
      const { r, errorPosition, H } = get();
      const errorPos0 = errorPosition !== null ? errorPosition - 1 : -1; // convert 1-based to 0-based
      const steps = generateCorrectionSteps(r, errorPos0, H);
      if (steps.length === 0) return;
      set({
        calculationSteps: steps,
        currentStepIndex: 0,
        isAnimationPlaying: true,
        showLiveHUD: true,
      });
    },

    playAnimation: () => set({ isAnimationPlaying: true }),
    pauseAnimation: () => set({ isAnimationPlaying: false }),

    nextStep: () => {
      const { calculationSteps, currentStepIndex } = get();
      if (calculationSteps.length === 0) return;
      const nextIdx = currentStepIndex + 1;
      if (nextIdx >= calculationSteps.length) {
        set({ isAnimationPlaying: false });
        return;
      }
      set({ currentStepIndex: nextIdx });
    },

    prevStep: () => {
      const { currentStepIndex } = get();
      if (currentStepIndex > 0) {
        set({ currentStepIndex: currentStepIndex - 1, isAnimationPlaying: false });
      }
    },

    replayAnimation: () => set({ currentStepIndex: 0, isAnimationPlaying: true }),

    skipAnimation: () => set({ calculationSteps: [], currentStepIndex: 0, isAnimationPlaying: false }),

    setSpeedMultiplier: (mult) => set({ speedMultiplier: mult }),
    setShowLiveHUD: (show) => set({ showLiveHUD: show }),
    dismissLiveHUD: () => set({ showLiveHUD: false }),
  };
});

export const selectPipeline = (s) => ({ m: s.m, c: s.c, e: s.e, r: s.r, S: s.S, corrected: s.corrected, errorPosition: s.errorPosition, correctable: s.correctable });
export const selectMatrices = (s) => ({ G: s.G, H: s.H, n: s.n, k: s.k, dMin: s.dMin, t: s.t });
export const selectSession = (s) => ({ verdict: s.verdict, mode: s.mode, currentStage: s.currentStage, sessionEvents: s.sessionEvents });
