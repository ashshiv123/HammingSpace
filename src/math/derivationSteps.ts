import { deriveHammingParams } from './hammingDerivation';
import type { HammingDerivation } from './hammingDerivation';
import type { DerivationPhase, DerivationStep } from './derivationStepTypes';
import { buildD3Steps, buildD4Steps, buildD5Steps } from './derivationSequencePhases';

export type { DerivationPhase, DerivationStep, DerivationPhaseMeta } from './derivationStepTypes';
export { DERIVATION_PHASES, binaryStringOf } from './derivationStepTypes';
function buildD1Steps(derivation: HammingDerivation): DerivationStep[] {
  return derivation.parityTestRows.map((row) => {
    const winning = row.satisfied;
    return {
      phase: 'D1' as DerivationPhase,
      index: 0,
      total: 0,
      headline: winning
        ? `We need r = ${row.r} parity bits.`
        : `r = ${row.r} gives only ${row.power} patterns — not enough.`,
      formula: `2^${row.r} = ${row.power}  ${winning ? '≥' : '<'}  k + r + 1 = ${derivation.k} + ${row.r} + 1 = ${row.required}`,
      detail: winning
        ? `${row.power} syndrome patterns must cover the ${derivation.k} message bits, the ${row.r} parity bits and the "no error" case. r = ${row.r} is the smallest value that fits.`
        : `Only ${row.power} distinct patterns exist, but ${row.required} are needed to pinpoint every bit plus the no-error case.`,
      derivation,
      isPhaseFinal: winning,
      rTestVisible: row.r,
      parityTestRows: derivation.parityTestRows,
    };
  });
}

function buildD2Steps(derivation: HammingDerivation): DerivationStep[] {
  const { k, r, n } = derivation;
  return [
    {
      phase: 'D2',
      index: 0,
      total: 0,
      headline: `CODEWORD LENGTH = ${n}`,
      formula: `n = k + r = ${k} + ${r} = ${n}`,
      detail: `The ${k} message bits plus the ${r} parity bits fill ${n} transmission slots. That makes this a (${n}, ${k}) linear block code.`,
      derivation,
      isPhaseFinal: true,
    },
  ];
}

/** Flags the last step of each phase and the very last step of the sequence. */
function markPhaseBoundaries(steps: DerivationStep[]): DerivationStep[] {
  const lastIndexOfPhase = new Map<DerivationPhase, number>();
  steps.forEach((step, index) => lastIndexOfPhase.set(step.phase, index));

  return steps.map((step, index) => ({
    ...step,
    index,
    total: steps.length,
    isPhaseFinal: step.isPhaseFinal ?? lastIndexOfPhase.get(step.phase) === index,
    isComplete: index === steps.length - 1,
  }));
} 


/**
 * Builds the full D1–D5 sequence for the given message length.
 * Throws for k < 1 (deriveHammingParams validates the input).
 */
export function buildDerivationSteps(k: number): DerivationStep[] {
  const derivation = deriveHammingParams(k);
  return markPhaseBoundaries([
    ...buildD1Steps(derivation),
    ...buildD2Steps(derivation),
    ...buildD3Steps(derivation),
    ...buildD4Steps(derivation),
    ...buildD5Steps(derivation),
  ]);
}

