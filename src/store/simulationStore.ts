import { create } from 'zustand';
import {
  buildGH,
  buildSyndromeTable,
  decodeAndCorrect,
  gf2VecMatMul,
  HAMMING_PRESETS,
  validateCode,
  CalculationStep,
  generateEncodingSteps,
  generateSyndromeSteps,
  generateCorrectionSteps,
} from '../math';

export type SimulationStage =
  | 'idle'
  | 'encoding'
  | 'inChannel'
  | 'decoding'
  | 'errorDetected'
  | 'corrected';

export type CameraFocusTarget =
  | 'overview'
  | 'display'
  | 'firstPerson'
  | 'tx'
  | 'msgInput'
  | 'matrixG'
  | 'xorCombine'
  | 'channel'
  | 'noise'
  | 'rx'
  | 'syndrome'
  | 'correction';

export interface SimulationState {
  // Code configuration
  n: number;
  k: number;
  P: number[][]; // k x (n - k) parity submatrix
  G: number[][]; // k x n generator matrix
  H: number[][]; // (n - k) x n parity check matrix
  dMin: number;
  syndromeTable: Map<string, number>;

  // Pipeline data
  message: number[];
  codeword: number[];
  revealedCodeword: (number | null)[];
  receivedVector: number[];
  errorVector: number[];
  syndrome: number[];
  correctedVector: number[];

  // Mode and Speed
  mode: 'normal' | 'explain';
  speedMultiplier: 0.5 | 1 | 2;

  // Animation & Stage State
  stage: SimulationStage;
  errorPositions: number[];
  lastCorrectedBit: number | null;
  cameraFocus: CameraFocusTarget;

  // Educational Calculation Stepper
  calculationSteps: CalculationStep[];
  currentStepIndex: number;
  isAnimationPlaying: boolean;
  animationSpeed: 'normal' | 'fast' | 'instant';
  showLiveHUD: boolean;
  showXorVisualizer: boolean;
  autoOpenLesson: boolean;
  lessonOpen: boolean;
  lessonPhase: 'encoding' | 'decoding' | null;
  lessonStep: number;

  // Actions
  setShowLiveHUD: (show: boolean) => void;
  setShowXorVisualizer: (show: boolean) => void;
  dismissLiveHUD: () => void;
  setAutoOpenLesson: (enabled: boolean) => void;
  setLessonStep: (step: number) => void;
  finishLessonPhase: (phase: 'encoding' | 'decoding') => void;
  skipLesson: () => void;
  setMode: (mode: 'normal' | 'explain') => void;
  setSpeedMultiplier: (mult: 0.5 | 1 | 2) => void;
  setNK: (n: number, k: number) => void;
  setP: (P: number[][]) => void;
  selectPreset: (presetKey: string) => void;
  toggleMessageBit: (i: number) => void;
  setMessage: (newMessage: number[]) => void;
  encode: () => void;
  triggerCodewordReveal: () => void;
  startExplainEncoding: () => void;
  startExplainDecoding: () => void;
  toggleChannelBit: (i: number) => void;
  injectNoiseAndContinue: (bitIndex?: number) => void;
  setStage: (stage: SimulationStage) => void;
  decode: () => void;
  correct: () => void;
  reset: () => void;
  setCameraFocus: (focus: CameraFocusTarget) => void;

  // Calculation Animation Controls
  startEncodingAnimation: () => void;
  startDecodingAnimation: () => void;
  startCorrectionAnimation: () => void;
  playAnimation: () => void;
  pauseAnimation: () => void;
  nextStep: () => void;
  prevStep: () => void;
  replayAnimation: () => void;
  skipAnimation: () => void;
  setAnimationSpeed: (speed: 'normal' | 'fast' | 'instant') => void;
}

// Default initial preset: (15,11) Hamming code per user preference
const defaultPreset = HAMMING_PRESETS['(15,11)'] ?? HAMMING_PRESETS['(7,4)'];
const initialMatrices = buildGH(defaultPreset.k, defaultPreset.n, defaultPreset.P);
const initialSyndromeTable = buildSyndromeTable(initialMatrices.H, defaultPreset.n);
const initialValidation = validateCode(
  defaultPreset.k,
  defaultPreset.n,
  initialMatrices.G,
  initialMatrices.H
);

export const useSimulationStore = create<SimulationState>((set, get) => ({
  n: defaultPreset.n,
  k: defaultPreset.k,
  P: defaultPreset.P,
  G: initialMatrices.G,
  H: initialMatrices.H,
  dMin: initialValidation.dMin,
  syndromeTable: initialSyndromeTable,

  // Initial message: 11 bits for (15,11)
  message: [1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0],
  codeword: Array(defaultPreset.n).fill(0),
  receivedVector: Array(defaultPreset.n).fill(0),
  errorVector: Array(defaultPreset.n).fill(0),
  syndrome: Array(defaultPreset.n - defaultPreset.k).fill(0),
  correctedVector: Array(defaultPreset.n).fill(0),

  mode: 'normal',
  speedMultiplier: 1,

  stage: 'idle',
  errorPositions: [],
  lastCorrectedBit: null,
  cameraFocus: 'overview',

  // Calculation Stepper Initial State
  calculationSteps: [],
  currentStepIndex: 0,
  isAnimationPlaying: false,
  animationSpeed: 'normal',
  showLiveHUD: true,
  showXorVisualizer: true,
  autoOpenLesson: true,
  lessonOpen: false,
  lessonPhase: null,
  lessonStep: 1,

  setShowLiveHUD: (show: boolean) => set({ showLiveHUD: show }),
  setShowXorVisualizer: (show: boolean) => set({ showXorVisualizer: show }),
  dismissLiveHUD: () => {
    // Dismiss both the 2D stepper and 3D Live Calculation HUD, pausing animation
    set({ showLiveHUD: false, isAnimationPlaying: false });
  },

  setMode: (mode) => set({ mode }),
  setSpeedMultiplier: (mult) => set({ speedMultiplier: mult }),

  setCameraFocus: (focus: CameraFocusTarget) => {
    set({ cameraFocus: focus });
  },

  setNK: (n: number, k: number) => {
    const key = `(${n},${k})`;
    if (HAMMING_PRESETS[key]) {
      get().selectPreset(key);
      return;
    }
    const r = n - k;
    if (r <= 0 || k <= 0) return;

    const newP: number[][] = Array.from({ length: k }, (_, row) =>
      Array.from({ length: r }, (_, col) => ((row + col) % 2 === 0 ? 1 : 0))
    );

    const { G, H } = buildGH(k, n, newP);
    const table = buildSyndromeTable(H, n);
    const validation = validateCode(k, n, G, H);

    set({
      n,
      k,
      P: newP,
      G,
      H,
      dMin: validation.dMin,
      syndromeTable: table,
      message: new Array(k).fill(0),
      codeword: new Array(n).fill(0),
      receivedVector: new Array(n).fill(0),
      errorVector: new Array(n).fill(0),
      syndrome: new Array(r).fill(0),
      correctedVector: new Array(n).fill(0),
      stage: 'idle',
      errorPositions: [],
      calculationSteps: [],
      currentStepIndex: 0,
      isAnimationPlaying: false,
      cameraFocus: 'overview',
      lessonOpen: false,
      lessonPhase: null,
      lessonStep: 1,
    });
  },

  setP: (newP: number[][]) => {
    const { k, n } = get();
    const r = n - k;
    if (newP.length !== k || newP[0]?.length !== r) return;

    const { G, H } = buildGH(k, n, newP);
    const table = buildSyndromeTable(H, n);
    const validation = validateCode(k, n, G, H);

    set({
      P: newP,
      G,
      H,
      dMin: validation.dMin,
      syndromeTable: table,
      stage: 'idle',
      errorPositions: [],
      errorVector: new Array(n).fill(0),
      syndrome: new Array(r).fill(0),
      correctedVector: new Array(n).fill(0),
      calculationSteps: [],
      currentStepIndex: 0,
      isAnimationPlaying: false,
    });
  },

  selectPreset: (presetKey: string) => {
    const preset = HAMMING_PRESETS[presetKey];
    if (!preset) return;

    const { G, H } = buildGH(preset.k, preset.n, preset.P);
    const table = buildSyndromeTable(H, preset.n);
    const validation = validateCode(preset.k, preset.n, G, H);

    let defaultMsg: number[];
    if (preset.k === 11) {
      defaultMsg = [1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0];
    } else if (preset.k === 4) {
      defaultMsg = [1, 1, 0, 1];
    } else {
      defaultMsg = new Array(preset.k).fill(1);
    }

    set({
      n: preset.n,
      k: preset.k,
      P: preset.P,
      G,
      H,
      dMin: validation.dMin,
      syndromeTable: table,
      message: defaultMsg,
      codeword: new Array(preset.n).fill(0),
      receivedVector: new Array(preset.n).fill(0),
      errorVector: new Array(preset.n).fill(0),
      syndrome: new Array(preset.n - preset.k).fill(0),
      correctedVector: new Array(preset.n).fill(0),
      stage: 'idle',
      errorPositions: [],
      calculationSteps: [],
      currentStepIndex: 0,
      isAnimationPlaying: false,
      cameraFocus: 'overview',
      lessonOpen: false,
      lessonPhase: null,
      lessonStep: 1,
    });
  },

  toggleMessageBit: (i: number) => {
    const { message, k } = get();
    if (i < 0 || i >= k) return;
    const newMessage = [...message];
    newMessage[i] = newMessage[i] ^ 1;

    set({
      message: newMessage,
      revealedCodeword: new Array(get().n).fill(null),
      stage: 'idle',
      errorPositions: [],
      errorVector: new Array(get().n).fill(0),
      syndrome: new Array(get().n - k).fill(0),
      calculationSteps: [],
      currentStepIndex: 0,
      isAnimationPlaying: false,
      lessonOpen: false,
      lessonPhase: null,
      lessonStep: 1,
    });
  },

  setMessage: (newMessage: number[]) => {
    const { k, n } = get();
    if (newMessage.length !== k) return;
    set({
      message: newMessage,
      revealedCodeword: new Array(n).fill(null),
      stage: 'idle',
      errorPositions: [],
      errorVector: new Array(n).fill(0),
      syndrome: new Array(n - k).fill(0),
      calculationSteps: [],
      currentStepIndex: 0,
      isAnimationPlaying: false,
      lessonOpen: false,
      lessonPhase: null,
      lessonStep: 1,
    });
  },

  setAnimationSpeed: (speed: 'normal' | 'fast' | 'instant') => {
    set({ animationSpeed: speed });
  },

  startEncodingAnimation: () => {
    const { message, G } = get();
    const steps = generateEncodingSteps(message, G);
    if (steps.length === 0) return;

    set({
      calculationSteps: steps,
      currentStepIndex: 0,
      isAnimationPlaying: true,
      stage: 'encoding',
      showLiveHUD: false,
      cameraFocus: 'display',
    });
  },

  startExplainEncoding: () => {
    set({ mode: 'explain' });
    get().encode();
  },

  startDecodingAnimation: () => {
    const { receivedVector, H, syndromeTable } = get();
    const steps = generateSyndromeSteps(receivedVector, H, syndromeTable);
    if (steps.length === 0) return;

    set({
      calculationSteps: steps,
      currentStepIndex: 0,
      isAnimationPlaying: true,
      stage: 'decoding',
      showLiveHUD: false,
    });
  },

  startExplainDecoding: () => {
    set({ mode: 'explain' });
    get().startDecodingAnimation();
  },

  startCorrectionAnimation: () => {
    const { receivedVector, errorPositions, H } = get();
    const errorPos = errorPositions[0] ?? -1;
    const steps = generateCorrectionSteps(receivedVector, errorPos, H);
    if (steps.length === 0) return;

    set({
      calculationSteps: steps,
      currentStepIndex: 0,
      isAnimationPlaying: true,
      stage: 'decoding',
      showLiveHUD: false,
    });
  },

  playAnimation: () => {
    set({ isAnimationPlaying: true });
  },

  pauseAnimation: () => {
    set({ isAnimationPlaying: false });
  },

  nextStep: () => {
    const { calculationSteps, currentStepIndex } = get();
    if (calculationSteps.length === 0) return;

    const nextIdx = currentStepIndex + 1;

    // Check if finished
    if (nextIdx >= calculationSteps.length) {
      get().skipAnimation();
      return;
    }

    set({
      currentStepIndex: nextIdx,
    });
  },

  prevStep: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex > 0) {
      set({
        currentStepIndex: currentStepIndex - 1,
        isAnimationPlaying: false,
      });
    }
  },

  replayAnimation: () => {
    set({
      currentStepIndex: 0,
      isAnimationPlaying: true,
    });
  },

  skipAnimation: () => {
    const { calculationSteps, message, G, n, k, receivedVector, H, syndromeTable } = get();
    const currentStep = calculationSteps[0];
    if (!currentStep) return;

    if (currentStep.type === 'encoding') {
      const fullCodeword = gf2VecMatMul(message, G);
      set({
        codeword: fullCodeword,
        receivedVector: [...fullCodeword],
        errorVector: new Array(n).fill(0),
        errorPositions: [],
        syndrome: new Array(n - k).fill(0),
        correctedVector: new Array(n).fill(0),
        calculationSteps: [],
        currentStepIndex: 0,
        isAnimationPlaying: false,
        showLiveHUD: false,
      });
      get().triggerCodewordReveal();
    } else if (currentStep.type === 'syndrome') {
      const result = decodeAndCorrect(receivedVector, H, syndromeTable);
      const hasError = result.syndrome.some((b) => b === 1);
      set({
        syndrome: hasError ? result.syndrome : new Array(n - k).fill(0),
        stage: hasError ? 'errorDetected' : 'corrected',
        correctedVector: hasError ? [] : [...receivedVector],
        lastCorrectedBit: hasError && result.errorPosition >= 0 ? result.errorPosition : null,
        errorPositions: result.errorPosition >= 0 ? [result.errorPosition] : [],
        calculationSteps: [],
        currentStepIndex: 0,
        isAnimationPlaying: false,
        showLiveHUD: false,
      });
    } else if (currentStep.type === 'correction') {
      const result = decodeAndCorrect(receivedVector, H, syndromeTable);
      const correctedBit =
        result.errorPosition >= 0
          ? result.errorPosition
          : (get().errorPositions[0] ?? get().lastCorrectedBit ?? 0);
      set({
        syndrome: new Array(n - k).fill(0),
        receivedVector: [...result.correctedVector],
        correctedVector: result.correctedVector,
        lastCorrectedBit: correctedBit,
        stage: 'corrected',
        errorPositions: [],
        errorVector: new Array(n).fill(0),
        calculationSteps: [],
        currentStepIndex: 0,
        isAnimationPlaying: false,
        showLiveHUD: false,
      });
    }
  },

  encode: () => {
    const { message, G, n, autoOpenLesson } = get();
    if (autoOpenLesson) {
      const codeword = gf2VecMatMul(message, G);
      set({
        codeword,
        receivedVector: [...codeword],
        errorVector: new Array(n).fill(0),
        errorPositions: [],
        syndrome: new Array(n - get().k).fill(0),
        correctedVector: new Array(n).fill(0),
        stage: 'encoding',
        calculationSteps: [],
        currentStepIndex: 0,
        isAnimationPlaying: false,
        lessonOpen: true,
        lessonPhase: 'encoding',
        lessonStep: 1,
        cameraFocus: 'tx',
      });
      setTimeout(() => {
        const current = get();
        if (current.lessonOpen && current.lessonPhase === 'encoding') {
          current.setCameraFocus('display');
        }
      }, 900);
      return;
    }
    get().startEncodingAnimation();
  },

  toggleChannelBit: (i: number) => {
    const { receivedVector, codeword, message, G, n, stage, H, syndromeTable } = get();
    if (i < 0 || i >= n) return;

    let baseCodeword = codeword;
    let baseReceived = receivedVector;

    // If currently idle, first compute codeword so channel packet exists
    if (stage === 'idle') {
      baseCodeword = gf2VecMatMul(message, G);
      baseReceived = [...baseCodeword];
    }

    const newReceived = [...baseReceived];
    newReceived[i] = newReceived[i] ^ 1;

    // Recalculate error positions compared to original codeword
    const newErrors: number[] = [];
    const newErrorVector = new Array(n).fill(0);
    for (let bitIdx = 0; bitIdx < n; bitIdx++) {
      if (newReceived[bitIdx] !== baseCodeword[bitIdx]) {
        newErrors.push(bitIdx);
        newErrorVector[bitIdx] = 1;
      }
    }

    // Immediately compute syndrome for state consistency without launching 3D animation pop-out
    const synResult = decodeAndCorrect(newReceived, H, syndromeTable);

    set({
      codeword: baseCodeword,
      receivedVector: newReceived,
      errorPositions: newErrors,
      errorVector: newErrorVector,
      syndrome: synResult.syndrome,
      stage: 'inChannel',
      calculationSteps: [],
      currentStepIndex: 0,
      isAnimationPlaying: false,
      showLiveHUD: false,
      cameraFocus: 'overview',
    });
  },

  injectNoiseAndContinue: (bitIndex?: number) => {
    const { n } = get();
    const targetBit =
      typeof bitIndex === 'number' && bitIndex >= 0 && bitIndex < n
        ? bitIndex
        : Math.floor(Math.random() * n);

    get().toggleChannelBit(targetBit);

    if (get().autoOpenLesson) return;

    // Briefly display the corrupted bit in overview angle, then continue linear code decode animation
    setTimeout(() => {
      get().decode();
    }, 750);
  },

  setStage: (stage: SimulationStage) => {
    set({ stage });
  },

  decode: () => {
    const { autoOpenLesson, receivedVector, H } = get();
    if (autoOpenLesson) {
      const result = decodeAndCorrect(receivedVector, H, get().syndromeTable);
      set({
        syndrome: result.syndrome,
        stage: 'decoding',
        calculationSteps: [],
        currentStepIndex: 0,
        isAnimationPlaying: false,
        lessonOpen: true,
        lessonPhase: 'decoding',
        lessonStep: 6,
        cameraFocus: 'channel',
      });
      return;
    }
    get().startDecodingAnimation();
  },

  setAutoOpenLesson: (enabled: boolean) => set({ autoOpenLesson: enabled }),

  setLessonStep: (step: number) => {
    if (get().lessonOpen && step >= 1 && step <= 9) set({ lessonStep: step });
  },

  finishLessonPhase: (phase: 'encoding' | 'decoding') => {
    if (phase === 'encoding') {
      set({ lessonOpen: false, lessonPhase: null, lessonStep: 1 });
      get().triggerCodewordReveal();
      return;
    }

    const { receivedVector, H, syndromeTable, n } = get();
    const result = decodeAndCorrect(receivedVector, H, syndromeTable);
    set({
      syndrome: result.syndrome,
      correctedVector: result.correctedVector,
      lastCorrectedBit: result.errorPosition >= 0 ? result.errorPosition : null,
      stage: 'corrected',
      lessonOpen: false,
      lessonPhase: null,
      lessonStep: 1,
      errorPositions: result.errorPosition >= 0 ? [result.errorPosition] : [],
      errorVector: new Array(n).fill(0),
      cameraFocus: 'rx',
    });
  },

  skipLesson: () => {
    const phase = get().lessonPhase;
    if (phase) get().finishLessonPhase(phase);
  },

  triggerCodewordReveal: () => {
    const { codeword, k, n } = get();
    
    // First, drop all data bits in
    const revealed = new Array(n).fill(null);
    for (let i = 0; i < k; i++) {
      revealed[i] = codeword[i];
    }
    set({ revealedCodeword: [...revealed] });

    // Then animate parity bits one by one ~150ms apart
    let pIdx = k;
    const interval = setInterval(() => {
      if (pIdx < n) {
        revealed[pIdx] = codeword[pIdx];
        set({ revealedCodeword: [...revealed] });
        pIdx++;
      } else {
        clearInterval(interval);
        // After build completes, switch status to SENT (stage = inChannel) and slide tray
        set({ stage: 'inChannel', cameraFocus: 'channel' });
      }
    }, 150);
  },

  correct: () => {
    const { mode, n, k, errorPositions, lastCorrectedBit } = get();
    if (mode === 'explain') {
      get().startCorrectionAnimation();
      return;
    }

    const { receivedVector, H, syndromeTable } = get();
    const result = decodeAndCorrect(receivedVector, H, syndromeTable);
    const correctedBit =
      result.errorPosition >= 0
        ? result.errorPosition
        : (errorPositions[0] ?? lastCorrectedBit ?? 0);

    set({
      syndrome: new Array(n - k).fill(0),
      receivedVector: [...result.correctedVector],
      correctedVector: result.correctedVector,
      lastCorrectedBit: correctedBit,
      stage: 'corrected',
      errorPositions: [],
      errorVector: new Array(n).fill(0),
      calculationSteps: [],
      currentStepIndex: 0,
      isAnimationPlaying: false,
      showLiveHUD: false,
      cameraFocus: 'overview',
      lessonOpen: false,
      lessonPhase: null,
      lessonStep: 1,
    });
  },

  reset: () => {
    const { n, k } = get();
    set({
      stage: 'idle',
      errorPositions: [],
      lastCorrectedBit: null,
      errorVector: new Array(n).fill(0),
      syndrome: new Array(n - k).fill(0),
      correctedVector: new Array(n).fill(0),
      receivedVector: [...get().codeword],
      calculationSteps: [],
      currentStepIndex: 0,
      isAnimationPlaying: false,
      showLiveHUD: false,
      cameraFocus: 'overview',
    });
  },
}));
