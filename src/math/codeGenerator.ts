import { identity, transpose } from './gf2';
import { deriveHammingParams } from './hammingDerivation';

export interface CodeMatrices {
  G: number[][];
  H: number[][];
}

/**
 * Builds systematic generator matrix G = [Ik | P] and parity check matrix H = [P^T | I(n-k)].
 *
 * @param k - Number of message bits (dimension of code)
 * @param n - Number of codeword bits (block length)
 * @param P - Parity submatrix of dimension k x (n - k)
 */
export function buildGH(k: number, n: number, P: number[][]): CodeMatrices {
  const r = n - k;
  if (r <= 0 || k <= 0) {
    throw new Error(`Invalid code dimensions: n=${n} must be greater than k=${k}`);
  }

  // Validate P dimensions
  if (P.length !== k) {
    throw new Error(`Parity submatrix P must have ${k} rows, received ${P.length}`);
  }
  for (let i = 0; i < k; i++) {
    if ((P[i]?.length ?? 0) !== r) {
      throw new Error(`Row ${i} of P must have ${r} columns, received ${P[i]?.length ?? 0}`);
    }
  }

  const Ik = identity(k);
  const Ir = identity(r);
  const Pt = transpose(P);

  // Systematic G: [Ik | P]  (k x n)
  const G = Ik.map((row, i) => [...row, ...P[i]]);

  // Systematic H: [P^T | Ir]  (r x n)
  const H = Pt.map((row, i) => [...row, ...Ir[i]]);

  return { G, H };
}

export interface CodePreset extends CodeMatrices {
  n: number;
  k: number;
  r: number;
  P: number[][];
}

/**
 * Named code specifications offered in the Control Station.
 * `k` is the only real input — n, r and the matrices are derived from it.
 */
export const CODE_PRESETS: { key: string; label: string; k: number }[] = [
  { key: '(7,4)', label: '(7, 4) Hamming Code', k: 4 },
  { key: '(15,11)', label: '(15, 11) Hamming Code', k: 11 },
  { key: '(3,1)', label: '(3, 1) Repetition Code', k: 1 },
];

function buildPreset(k: number): CodePreset {
  const derived = deriveHammingParams(k);
  return {
    n: derived.n,
    k,
    r: derived.r,
    P: derived.G.map((row) => row.slice(k)),
    G: derived.G,
    H: derived.H,
  };
}

/**
 * Standard preset matrices for common Hamming codes.
 *
 * These are DERIVED from deriveHammingParams(k), the same single source of
 * truth the guided D1–D5 derivation animates — so a preset and the live
 * derivation can never disagree, and no matrix is stored twice.
 */
export const HAMMING_PRESETS: Record<string, CodePreset> = CODE_PRESETS.reduce(
  (table, preset) => {
    table[preset.key] = buildPreset(preset.k);
    return table;
  },
  {} as Record<string, CodePreset>
);

/** Maps a preset key such as '(7,4)' back to its message length k. */
export function presetKeyToK(presetKey: string): number | null {
  const preset = CODE_PRESETS.find((entry) => entry.key === presetKey);
  return preset ? preset.k : null;
}
