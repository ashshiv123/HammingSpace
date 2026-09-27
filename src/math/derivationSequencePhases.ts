/**
 * derivationSequencePhases.ts — Step builders for phase D3, D4 and D5.
 *
 * D3  layout           : claim powers of two, then fill the rest with m1..mk
 * D4  contributions    : position j -> binary(j) -> which parity bits it feeds
 * D5  generator matrix : identity block first, then each parity column from D4
 *
 * All values come from the HammingDerivation passed in — nothing is hardcoded.
 */

import { HammingDerivation } from './hammingDerivation';
import { DerivationStep, binaryStringOf } from './derivationStepTypes';

function baseStep(derivation: HammingDerivation) {
  return {
    index: 0,
    total: 0,
    derivation,
  };
}

/** D3 — the n position slots, parity slots marked first, then m1..mk filled in. */
export function buildD3Steps(derivation: HammingDerivation): DerivationStep[] {
  const { n, r, parityPositions, messagePositions } = derivation;
  const steps: DerivationStep[] = [];

  steps.push({
    ...baseStep(derivation),
    phase: 'D3',
    headline: `An empty row of ${n} position slots.`,
    formula: `positions 1 … ${n}`,
    detail: `Every codeword position gets a number. Powers of two are claimed by parity bits first — that choice is exactly what lets the syndrome point straight at a corrupted bit.`,
    markedParityPositions: [],
    filledMessagePositions: [],
  });

  parityPositions.forEach((position, index) => {
    steps.push({
      ...baseStep(derivation),
      phase: 'D3',
      headline: `Position ${position} = 2^${index} → parity slot p${index + 1}`,
      formula: `2^${index} = ${position}   (${r} parity bits total)`,
      detail: `Positions ${parityPositions.join(', ')} are the powers of two, so they are reserved for the ${r} parity bits p1…p${r}.`,
      markedParityPositions: parityPositions.slice(0, index + 1),
      filledMessagePositions: [],
    });
  });

  messagePositions.forEach((position, index) => {
    steps.push({
      ...baseStep(derivation),
      phase: 'D3',
      headline: `Position ${position} → m${index + 1}`,
      formula: `${position} = ${binaryStringOf(position, r)}₂`,
      detail: `Slot ${position} is not a power of two, so it carries data. It receives message bit m${index + 1}.`,
      markedParityPositions: parityPositions,
      filledMessagePositions: messagePositions
        .slice(0, index + 1)
        .map((p, i) => ({ position: p, messageIndex: i + 1 })),
      layoutComplete: index === messagePositions.length - 1,
    });
  });

  return steps;
}

function describeBits(derivation: HammingDerivation, position: number): string {
  const info = derivation.positions[position - 1];
  return info.bits
    .map((bit, index) => `bit${index}=${bit} → ${bit === 1 ? `p${index + 1}` : 'skip'}`)
    .join('  •  ');
}

/** D4 — one position at a time: its binary, and the parity bits it feeds. */
export function buildD4Steps(derivation: HammingDerivation): DerivationStep[] {
  const { r, positions, parityEquations } = derivation;
  const steps: DerivationStep[] = [];

  positions.forEach((info, index) => {
    const feeding = info.contributions;
    const feedingText = feeding.length > 0 ? feeding.map((p) => `p${p}`).join(' + ') : 'no parity bit';
    const skipped = Array.from({ length: r }, (_, i) => i + 1).filter((p) => !feeding.includes(p));

    steps.push({
      ...baseStep(derivation),
      phase: 'D4',
      headline: `Position ${info.position} → ${feedingText}`,
      formula: `${info.position} = ${binaryStringOf(info.position, r)}₂`,
      detail:
        `${binaryStringOf(info.position, r)}₂ read from the least significant bit: ${describeBits(derivation, info.position)}.` +
        (skipped.length > 0 ? ` It never touches ${skipped.map((p) => `p${p}`).join(', ')}.` : ' It touches every parity bit.'),
      activePosition: info.position,
      explainedPositions: positions.slice(0, index + 1).map((p) => p.position),
    });
  });

  steps.push({
    ...baseStep(derivation),
    phase: 'D4',
    headline: `${r} parity equation${r === 1 ? '' : 's'} fully determined`,
    formula: parityEquations.map((e) => e.equation).join('     '),
    detail: `Every equation lists exactly the message bits sitting in positions whose binary has that bit set. These are the parity columns that go into G next.`,
    explainedPositions: positions.map((p) => p.position),
  });

  return steps;
}

/** D5 — identity block, then one parity column at a time, then the final G. */
export function buildD5Steps(derivation: HammingDerivation): DerivationStep[] {
  const { k, r, n, G, parityEquations } = derivation;
  const steps: DerivationStep[] = [];

  steps.push({
    ...baseStep(derivation),
    phase: 'D5',
    headline: `Start with the identity block I_${k}`,
    formula: `G = [ I_${k} | P ]`,
    detail: `The first ${k} columns form the identity matrix, so the ${k} message bits pass straight through into the codeword. That is what makes this systematic.`,
    revealedColumns: k,
  });

  parityEquations.forEach((equation, index) => {
    const column = G.map((row) => row[k + index]);
    const feeders = equation.messageIndices.map((m) => `m${m}`).join(', ');
    steps.push({
      ...baseStep(derivation),
      phase: 'D5',
      headline: `Insert parity column p${equation.parityIndex}`,
      formula: `${equation.equation}   →   column [ ${column.join(' ')} ]`,
      detail: `Column ${k + index + 1} holds a 1 for every message bit that feeds p${equation.parityIndex}: ${feeders || 'none'}. Position ${equation.parityPosition} itself is the p${equation.parityIndex} slot.`,
      revealedColumns: k + index + 1,
      activeParityColumn: equation.parityIndex,
    });
  });

  steps.push({
    ...baseStep(derivation),
    phase: 'D5',
    headline: `${k} × ${n} generator matrix assembled`,
    formula: `G = [ I_${k} | P ]`,
    detail: `Message half: columns 1…${k}. Parity half: columns ${k + 1}…${n}. Encoding is now just the multiply m · G — handing over to the live encoder on this laptop.`,
    revealedColumns: n,
    matrixComplete: true,
  });

  return steps;
}
