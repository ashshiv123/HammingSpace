/**
 * derivationStepTypes.ts — Shared shape of the guided D1–D5 derivation steps.
 * Kept separate so the step builders and the phase builders never import each
 * other (no dependency cycle).
 */

import { HammingDerivation, ParityTestRow, toBinaryDigits } from './hammingDerivation';

export type DerivationPhase = 'D1' | 'D2' | 'D3' | 'D4' | 'D5';

export interface DerivationPhaseMeta {
  phase: DerivationPhase;
  short: string;
  title: string;
}

export const DERIVATION_PHASES: DerivationPhaseMeta[] = [
  { phase: 'D1', short: 'P-BITS', title: 'How many parity bits do we need?' },
  { phase: 'D2', short: 'LENGTH', title: 'Total codeword length' },
  { phase: 'D3', short: 'LAYOUT', title: 'Where do the parity bits go?' },
  { phase: 'D4', short: 'FEEDS', title: 'What does each position contribute to?' },
  { phase: 'D5', short: 'MATRIX G', title: 'Assembling the generator matrix' },
];

export interface DerivationStep {
  phase: DerivationPhase;
  /** 0-based index inside the whole derivation sequence. */
  index: number;
  /** Total number of steps in the sequence. */
  total: number;
  headline: string;
  formula: string;
  detail: string;
  derivation: HammingDerivation;
  /** True for the last step belonging to its own phase. */
  isPhaseFinal?: boolean;
  /** True for the very last step of the whole derivation. */
  isComplete?: boolean;

  // ── D1 payload ──
  rTestVisible?: number;
  parityTestRows?: ParityTestRow[];

  // ── D3 payload ──
  markedParityPositions?: number[];
  filledMessagePositions?: { position: number; messageIndex: number }[];
  layoutComplete?: boolean;

  // ── D4 payload ──
  activePosition?: number;
  explainedPositions?: number[];

  // ── D5 payload ──
  revealedColumns?: number;
  activeParityColumn?: number;
  matrixComplete?: boolean;
}

/** Binary string of a position, most significant digit first. */
export function binaryStringOf(position: number, r: number): string {
  return toBinaryDigits(position, r)
    .slice()
    .reverse()
    .join('');
}
