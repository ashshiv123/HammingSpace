import { describe, it, expect } from 'vitest';
import {
  encode,
  syndrome,
  hammingWeight,
  hammingDistance,
  deriveH,
  buildSyndromeTable,
  correct,
  enumerateCodewords,
  minDistance,
} from '../src/lib/gf2.js';

const G = [
  [1, 0, 0, 0, 1, 1, 0],
  [0, 1, 0, 0, 1, 0, 1],
  [0, 0, 1, 0, 0, 1, 1],
  [0, 0, 0, 1, 1, 1, 1],
];
const EXPECTED_H = [
  [1, 1, 0, 1, 1, 0, 0],
  [1, 0, 1, 1, 0, 1, 0],
  [0, 1, 1, 1, 0, 0, 1],
];
const m = [1, 0, 1, 1];
const c = [1, 0, 1, 1, 0, 1, 0];
const r = [1, 0, 0, 1, 0, 1, 0];

describe('encode', () => {
  it('golden path: m=[1,0,1,1] → c=[1,0,1,1,0,1,0]', () => {
    expect(encode(m, G)).toEqual(c);
  });
  it('all-zero → all-zero', () => {
    expect(encode([0, 0, 0, 0], G)).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });
  it('systematic: message bits survive in positions 0-3', () => {
    expect(encode(m, G).slice(0, 4)).toEqual(m);
  });
});

describe('deriveH', () => {
  it('derives correct 3×7 H', () => {
    expect(deriveH(G)).toEqual(EXPECTED_H);
  });
  it('GHᵀ = 0', () => {
    const H = deriveH(G);
    for (const gRow of G) {
      for (const hRow of H) {
        expect(gRow.reduce((a, b, i) => a ^ (b & hRow[i]), 0)).toBe(0);
      }
    }
  });
});

describe('syndrome', () => {
  const H = deriveH(G);
  it('golden path: S=[0,1,1]', () => {
    expect(syndrome(r, H)).toEqual([0, 1, 1]);
  });
  it('valid codeword → [0,0,0]', () => {
    expect(syndrome(c, H)).toEqual([0, 0, 0]);
  });
  it('[0,1,1] matches column 3 of H', () => {
    expect(syndrome(r, H)).toEqual(H.map((row) => row[2]));
  });
});

describe('hammingWeight', () => {
  it('[1,0,1,1,0,1,0] → 4', () => {
    expect(hammingWeight([1, 0, 1, 1, 0, 1, 0])).toBe(4);
  });
});

describe('hammingDistance', () => {
  it('d(c,r) = 1', () => {
    expect(hammingDistance(c, r)).toBe(1);
  });
});

describe('correct pipeline', () => {
  const H = deriveH(G);
  const codewords = enumerateCodewords(G);
  const { t } = minDistance(codewords);
  const table = buildSyndromeTable(H, t);

  it('GOLDEN PATH: correct(r) → corrected=c, errorPosition=3', () => {
    const res = correct(r, H, table);
    expect(res.corrected).toEqual(c);
    expect(res.errorPosition).toBe(3);
    expect(res.correctable).toBe(true);
  });
  it('all 7 single-bit errors corrected', () => {
    for (let pos = 1; pos <= 7; pos++) {
      const bad = [...c];
      bad[pos - 1] ^= 1;
      const res = correct(bad, H, table);
      expect(res.correctable).toBe(true);
      expect(res.corrected).toEqual(c);
    }
  });
  it('dMin=3, t=1', () => {
    const { dMin, t } = minDistance(codewords);
    expect(dMin).toBe(3);
    expect(t).toBe(1);
  });
  it('16 codewords, all valid', () => {
    expect(codewords).toHaveLength(16);
    for (const cw of codewords) {
      expect(syndrome(cw, H)).toEqual([0, 0, 0]);
    }
  });
});

describe('labStore integration', () => {
  it('full golden path through store actions', async () => {
    const { useLabStore } = await import('../src/state/labStore.js');
    useLabStore.getState().resetLab();
    useLabStore.getState().setMessageBit(0, 1);
    useLabStore.getState().setMessageBit(2, 1);
    useLabStore.getState().setMessageBit(3, 1);
    expect(useLabStore.getState().m).toEqual([1, 0, 1, 1]);
    useLabStore.getState().encode();
    expect(useLabStore.getState().c).toEqual([1, 0, 1, 1, 0, 1, 0]);
    useLabStore.getState().injectErrorAtPosition(3);
    expect(useLabStore.getState().r).toEqual([1, 0, 0, 1, 0, 1, 0]);
    useLabStore.getState().decode();
    expect(useLabStore.getState().S).toEqual([0, 1, 1]);
    expect(useLabStore.getState().errorPosition).toBe(3);
    useLabStore.getState().correctError();
    expect(useLabStore.getState().corrected).toEqual([1, 0, 1, 1, 0, 1, 0]);
    expect(useLabStore.getState().verdict).toBe('corrected');
  });
});
