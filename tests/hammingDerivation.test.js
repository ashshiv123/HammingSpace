import { describe, it, expect } from 'vitest';
import {
  deriveHammingParams,
  requiredParityBits,
  positionContributions,
  toBinaryDigits,
  isPowerOfTwo,
  MAX_MESSAGE_BITS,
  MIN_MESSAGE_BITS,
} from '../src/math/hammingDerivation';

// ── Golden references taken straight from the task specification ────────────

const EXPECTED_G_7_4 = [
  [1, 0, 0, 0, 1, 1, 0],
  [0, 1, 0, 0, 1, 0, 1],
  [0, 0, 1, 0, 0, 1, 1],
  [0, 0, 0, 1, 1, 1, 1],
];

// Parity half of the app's existing (15,11) preset.
const EXPECTED_P_15_11 = [
  [1, 1, 0, 0],
  [1, 0, 1, 0],
  [0, 1, 1, 0],
  [1, 1, 1, 0],
  [1, 0, 0, 1],
  [0, 1, 0, 1],
  [1, 1, 0, 1],
  [0, 0, 1, 1],
  [1, 0, 1, 1],
  [0, 1, 1, 1],
  [1, 1, 1, 1],
];

describe('requiredParityBits (r = smallest r with 2^r >= k + r + 1)', () => {
  it('k = 4 → r = 3 (2^2 = 4 is too small, 2^3 = 8 works)', () => {
    expect(requiredParityBits(4)).toBe(3);
  });

  it('k = 11 → r = 4', () => {
    expect(requiredParityBits(11)).toBe(4);
  });

  it('k = 1 → r = 2 (triple repetition code)', () => {
    expect(requiredParityBits(1)).toBe(2);
  });

  it('k = 5, 6, 7 → r = 4', () => {
    expect(requiredParityBits(5)).toBe(4);
    expect(requiredParityBits(6)).toBe(4);
    expect(requiredParityBits(7)).toBe(4);
  });

  it('rejects k < 1', () => {
    expect(() => requiredParityBits(0)).toThrow();
  });
});

describe('positionContributions (binary decomposition rule)', () => {
  it('position 5 = 101 → feeds p1 and p3 only', () => {
    expect(positionContributions(5, 3)).toEqual([1, 3]);
  });

  it('positions 1, 2, 4 are single-bit powers of two', () => {
    expect(positionContributions(1, 3)).toEqual([1]);
    expect(positionContributions(2, 3)).toEqual([2]);
    expect(positionContributions(4, 3)).toEqual([3]);
  });

  it('position 7 = 111 → feeds every parity bit', () => {
    expect(positionContributions(7, 3)).toEqual([1, 2, 3]);
  });

  it('position 3 = 011 → feeds p1 and p2 but not p3', () => {
    expect(positionContributions(3, 3)).toEqual([1, 2]);
  });

  it('toBinaryDigits is LSB first', () => {
    expect(toBinaryDigits(5, 3)).toEqual([1, 0, 1]);
    expect(isPowerOfTwo(4)).toBe(true);
    expect(isPowerOfTwo(5)).toBe(false);
  });
});

describe('deriveHammingParams(k = 4) — must reproduce Hamming(7,4)', () => {
  const d = deriveHammingParams(4);

  it('r = 3, n = 7', () => {
    expect(d.r).toBe(3);
    expect(d.n).toBe(7);
  });

  it('parity positions are 1, 2, 4', () => {
    expect(d.parityPositions).toEqual([1, 2, 4]);
  });

  it('message positions are 3, 5, 6, 7 (m1..m4)', () => {
    expect(d.messagePositions).toEqual([3, 5, 6, 7]);
    expect(d.positions[2].messageIndex).toBe(1);
    expect(d.positions[4].messageIndex).toBe(2);
    expect(d.positions[5].messageIndex).toBe(3);
    expect(d.positions[6].messageIndex).toBe(4);
  });

  it('contribution map matches the spec table', () => {
    expect(d.contributionMap[1]).toEqual([1]);
    expect(d.contributionMap[2]).toEqual([2]);
    expect(d.contributionMap[3]).toEqual([1, 2]);
    expect(d.contributionMap[4]).toEqual([3]);
    expect(d.contributionMap[5]).toEqual([1, 3]);
    expect(d.contributionMap[6]).toEqual([2, 3]);
    expect(d.contributionMap[7]).toEqual([1, 2, 3]);
  });

  it('parity equations are p1 = m1⊕m2⊕m4, p2 = m1⊕m3⊕m4, p3 = m2⊕m3⊕m4', () => {
    expect(d.parityEquations.map((e) => e.equation)).toEqual([
      'p1 = m1 ⊕ m2 ⊕ m4',
      'p2 = m1 ⊕ m3 ⊕ m4',
      'p3 = m2 ⊕ m3 ⊕ m4',
    ]);
  });

  it('G matches the specification matrix exactly', () => {
    expect(d.G).toEqual(EXPECTED_G_7_4);
  });

  it('the inequality checklist stops at the first satisfied row', () => {
    expect(d.parityTestRows.map((row) => row.r)).toEqual([1, 2, 3]);
    expect(d.parityTestRows.map((row) => row.satisfied)).toEqual([false, false, true]);
    expect(d.parityTestRows[2].power).toBe(8);
    expect(d.parityTestRows[2].required).toBe(8);
  });
});

describe('deriveHammingParams(k = 11) — must reproduce the existing (15,11) preset', () => {
  const d = deriveHammingParams(11);

  it('r = 4, n = 15', () => {
    expect(d.r).toBe(4);
    expect(d.n).toBe(15);
  });

  it('parity positions are 1, 2, 4, 8', () => {
    expect(d.parityPositions).toEqual([1, 2, 4, 8]);
  });

  it('message positions are 3,5,6,7,9,10,11,12,13,14,15', () => {
    expect(d.messagePositions).toEqual([3, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15]);
  });

  it('parity submatrix half of G equals the app preset', () => {
    const parityHalf = d.G.map((row) => row.slice(11));
    expect(parityHalf).toEqual(EXPECTED_P_15_11);
  });

  it('G is systematic: identity block in the first k columns', () => {
    d.G.forEach((row, r0) => {
      row.slice(0, 11).forEach((val, c) => {
        expect(val).toBe(r0 === c ? 1 : 0);
      });
    });
  });
});

describe('deriveHammingParams(k = 1) — repetition code used by the (3,1) preset', () => {
  const d = deriveHammingParams(1);

  it('r = 2, n = 3', () => {
    expect(d.r).toBe(2);
    expect(d.n).toBe(3);
  });

  it('G = [1 1 1] (triple repetition)', () => {
    expect(d.G).toEqual([[1, 1, 1]]);
  });
});

describe('deriveHammingParams general behaviour across 1..MAX_MESSAGE_BITS', () => {
  it('n = k + r and every parity position is a power of two inside 1..n', () => {
    for (let k = MIN_MESSAGE_BITS; k <= MAX_MESSAGE_BITS; k++) {
      const d = deriveHammingParams(k);
      expect(d.n).toBe(d.k + d.r);
      expect(d.parityPositions).toEqual(Array.from({ length: d.r }, (_, i) => 2 ** i));
      expect(d.parityPositions.every((p) => p <= d.n)).toBe(true);
      expect(d.messagePositions).toHaveLength(k);
      expect(d.positions).toHaveLength(d.n);
    }
  });

  it('H always has distinct, non-zero columns (single-error correctable)', () => {
    for (let k = MIN_MESSAGE_BITS; k <= MAX_MESSAGE_BITS; k++) {
      const d = deriveHammingParams(k);
      const columns = Array.from({ length: d.n }, (_, c) => d.H.map((row) => row[c]).join(''));
      expect(new Set(columns).size).toBe(d.n);
      expect(columns.includes('0'.repeat(d.r))).toBe(false);
    }
  });

  it('G and H are orthogonal mod 2 (G · Hᵀ = 0)', () => {
    for (let k = MIN_MESSAGE_BITS; k <= MAX_MESSAGE_BITS; k++) {
      const d = deriveHammingParams(k);
      d.G.forEach((gRow) => {
        d.H.forEach((hRow) => {
          const dot = gRow.reduce((acc, val, i) => acc ^ (val & hRow[i]), 0);
          expect(dot).toBe(0);
        });
      });
    }
  });

  it('every message position contributes exactly to the parity bits its binary spells', () => {
    for (let k = 1; k <= 16; k++) {
      const d = deriveHammingParams(k);
      for (const position of d.messagePositions) {
        expect(d.contributionMap[position]).toEqual(positionContributions(position, d.r));
      }
    }
  });
});
