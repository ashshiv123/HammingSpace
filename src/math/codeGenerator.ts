import { identity, transpose } from './gf2';

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

/**
 * Standard preset Parity submatrices for common Hamming codes.
 */
export const HAMMING_PRESETS: Record<string, { n: number; k: number; P: number[][] }> = {
  '(7,4)': {
    n: 7,
    k: 4,
    // k=4, r=3. 4 rows, 3 cols.
    // Columns of H are all 7 non-zero 3-bit vectors.
    P: [
      [1, 1, 0],
      [1, 0, 1],
      [0, 1, 1],
      [1, 1, 1],
    ],
  },
  '(3,1)': {
    n: 3,
    k: 1,
    // Simple 3-bit triple repetition code (d_min = 3)
    P: [
      [1, 1],
    ],
  },
  '(15,11)': {
    n: 15,
    k: 11,
    // k=11, r=4. 11 rows of weight >= 2, 4 cols.
    P: [
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
    ],
  },
};
