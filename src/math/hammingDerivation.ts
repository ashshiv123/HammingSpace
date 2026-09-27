/**
 * hammingDerivation.ts — Formula-driven derivation of Hamming parameters.
 *
 * SINGLE SOURCE OF TRUTH for the question "given k message bits, what are r, n,
 * the parity positions, the message positions, which positions feed which parity
 * bits, and the resulting generator / parity-check matrices?".
 *
 * Nothing downstream may hardcode 7, 4, 3 or any matrix: the guided derivation
 * sequence (D1–D5), the Control Station, the transmission encoder and the
 * The derivation and calculation views all consume deriveHammingParams(k).
 *
 * Pure functions, no React, no side effects.
 */

/** Bounds accepted by deriveHammingParams (n stays inside a sane lab sweet spot). */
export const MIN_MESSAGE_BITS = 1;
export const MAX_MESSAGE_BITS = 26;

export interface ParityTestRow {
  /** Candidate number of parity bits. */
  r: number;
  /** 2^r — available distinct non-zero syndromes. */
  power: number;
  /** k + r + 1 — the smallest number of values the syndromes must cover. */
  required: number;
  /** True when 2^r >= k + r + 1. */
  satisfied: boolean;
}

export interface PositionInfo {
  /** 1-indexed codeword position. */
  position: number;
  isParity: boolean;
  /** 1-indexed parity bit index (1..r) when this slot is a parity slot. */
  parityIndex: number | null;
  /** 1-indexed message bit index (1..k) when this slot carries a message bit. */
  messageIndex: number | null;
  /** Binary digits of `position`, LSB first, length r. bits[i] drives parity p(i+1). */
  bits: number[];
  /** 1-indexed parity indices this position feeds (derived from `bits`). */
  contributions: number[];
}

export interface ParityEquation {
  /** 1-indexed parity bit index. */
  parityIndex: number;
  /** Position the parity bit occupies (2^(parityIndex - 1)). */
  parityPosition: number;
  /** Human readable equation, e.g. "p1 = m1 ⊕ m2 ⊕ m4". */
  equation: string;
  /** 1-indexed message indices XOR-ed together. */
  messageIndices: number[];
  /** Contributing codeword positions (parity position + message positions). */
  positions: number[];
}

export interface HammingDerivation {
  k: number;
  r: number;
  n: number;
  /** Codeword positions holding parity bits: 1, 2, 4, 8, ... (1-indexed). */
  parityPositions: number[];
  /** Codeword positions carrying m1..mk, in order (1-indexed). */
  messagePositions: number[];
  /** Every position 1..n with its role and contribution data. */
  positions: PositionInfo[];
  /** The inequality checklist 2^r >= k + r + 1 evaluated from r = 1 up to the winner. */
  parityTestRows: ParityTestRow[];
  /** position -> list of 1-indexed parity indices it feeds. */
  contributionMap: Record<number, number[]>;
  /** One entry per parity bit: which message bits XOR into it. */
  parityEquations: ParityEquation[];
  /** Systematic generator matrix G = [I_k | P], k x n. */
  G: number[][];
  /** Parity-check matrix H = [P^T | I_r], r x n. */
  H: number[][];
}

export function isPowerOfTwo(value: number): boolean {
  return value > 0 && (value & (value - 1)) === 0;
}

/** Binary digits of `value`, LSB first, fixed width. */
export function toBinaryDigits(value: number, width: number): number[] {
  return Array.from({ length: width }, (_, bitIndex) => (value >> bitIndex) & 1);
}

/** r = smallest integer with 2^r >= k + r + 1. */
export function requiredParityBits(k: number): number {
  if (!Number.isFinite(k) || k < 1) {
    throw new Error(`Hamming derivation requires k >= 1, received ${k}`);
  }
  let r = 1;
  while (2 ** r < k + r + 1) r++;
  return r;
}

/**
 * Position j (1-indexed) feeds parity bit p_(i+1) iff bit i (0-indexed from the
 * least significant bit) of j's binary representation is 1.
 */
export function positionContributions(position: number, r: number): number[] {
  const contributions: number[] = [];
  for (let i = 0; i < r; i++) {
    if (((position >> i) & 1) === 1) contributions.push(i + 1);
  }
  return contributions;
}

function buildParityTestRows(k: number, r: number): ParityTestRow[] {
  return Array.from({ length: r }, (_, index) => {
    const candidate = index + 1;
    const power = 2 ** candidate;
    const required = k + candidate + 1;
    return { r: candidate, power, required, satisfied: power >= required };
  });
}

function buildParityEquations(positions: PositionInfo[], r: number): ParityEquation[] {
  return Array.from({ length: r }, (_, index) => {
    const parityIndex = index + 1;
    const parityPosition = 2 ** index;
    const feeding = positions.filter((p) => p.messageIndex !== null && p.contributions.includes(parityIndex));
    const messageIndices = feeding.map((p) => p.messageIndex as number);
    const terms = messageIndices.map((m) => `m${m}`);
    return {
      parityIndex,
      parityPosition,
      equation: `p${parityIndex} = ${terms.length > 0 ? terms.join(' ⊕ ') : '0'}`,
      messageIndices,
      positions: [parityPosition, ...feeding.map((p) => p.position)],
    };
  });
}

/**
 * Derives every Hamming parameter for a message of k bits.
 * Works for any k >= 1 — k = 4 reproduces Hamming(7,4) and k = 11 reproduces
 * the app's existing (15,11) preset exactly.
 */
export function deriveHammingParams(k: number): HammingDerivation {
  const r = requiredParityBits(k);
  const n = k + r;

  const parityPositions: number[] = Array.from({ length: r }, (_, i) => 2 ** i);
  const paritySet = new Set(parityPositions);

  const messagePositions: number[] = [];
  for (let position = 1; position <= n; position++) {
    if (!paritySet.has(position)) messagePositions.push(position);
  }
  if (messagePositions.length !== k) {
    throw new Error(`Derivation mismatch: expected ${k} message slots, found ${messagePositions.length}`);
  }

  const messageIndexByPosition = new Map<number, number>();
  messagePositions.forEach((position, index) => messageIndexByPosition.set(position, index + 1));

  const positions: PositionInfo[] = Array.from({ length: n }, (_, index) => {
    const position = index + 1;
    const isParity = paritySet.has(position);
    return {
      position,
      isParity,
      parityIndex: isParity ? Math.log2(position) + 1 : null,
      messageIndex: messageIndexByPosition.get(position) ?? null,
      bits: toBinaryDigits(position, r),
      contributions: positionContributions(position, r),
    };
  });

  const contributionMap: Record<number, number[]> = {};
  positions.forEach((p) => {
    contributionMap[p.position] = p.contributions;
  });

  // P (k x r): row for each message position, column for each parity bit.
  const P = messagePositions.map((position) => {
    const contributions = positionContributions(position, r);
    return Array.from({ length: r }, (_, i) => (contributions.includes(i + 1) ? 1 : 0));
  });

  // G = [I_k | P]
  const G = P.map((row, rowIndex) =>
    Array.from({ length: k }, (_, col) => (col === rowIndex ? 1 : 0)).concat(row)
  );

  // H = [P^T | I_r]
  const H: number[][] = Array.from({ length: r }, (_, parityRow) =>
    P.map((row) => row[parityRow]).concat(
      Array.from({ length: r }, (_, col) => (col === parityRow ? 1 : 0))
    )
  );

  return {
    k,
    r,
    n,
    parityPositions,
    messagePositions,
    positions,
    parityTestRows: buildParityTestRows(k, r),
    contributionMap,
    parityEquations: buildParityEquations(positions, r),
    G,
    H,
  };
}
