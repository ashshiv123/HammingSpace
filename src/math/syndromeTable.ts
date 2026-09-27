import { gf2Add, gf2VecMatMul, transpose } from './gf2';

/**
 * Builds the standard syndrome decoding table for single-bit-correcting codes.
 * Maps syndrome string (e.g. "011") -> error bit position (0..n-1), or -1 if no error.
 *
 * S = r * H^T = e * H^T (mod 2)
 *
 * @param H - Parity check matrix ((n-k) x n)
 * @param n - Codeword length
 * @returns Map<string, number>
 */
export function buildSyndromeTable(H: number[][], n: number): Map<string, number> {
  const table = new Map<string, number>();
  const r = H.length; // number of parity check rows (n - k)

  // Zero syndrome corresponds to no error (valid codeword)
  const zeroSyndromeKey = new Array(r).fill(0).join('');
  table.set(zeroSyndromeKey, -1);

  const Ht = transpose(H);

  // For every single-bit error e_i, compute s = e_i * H^T
  for (let pos = 0; pos < n; pos++) {
    const e = new Array(n).fill(0);
    e[pos] = 1;
    const s = gf2VecMatMul(e, Ht);
    const key = s.join('');
    table.set(key, pos);
  }

  return table;
}

/**
 * Computes the syndrome vector S = r * H^T (mod 2).
 */
export function computeSyndrome(receivedVector: number[], H: number[][]): number[] {
  const Ht = transpose(H);
  return gf2VecMatMul(receivedVector, Ht);
}

/**
 * Decodes and corrects a received vector using the syndrome lookup table.
 * Returns the corrected vector, identified error bit position(s), and syndrome.
 */
export function decodeAndCorrect(
  receivedVector: number[],
  H: number[][],
  syndromeTable: Map<string, number>
): {
  syndrome: number[];
  errorPosition: number; // -1 if no error, undefined if uncorrectable pattern
  correctedVector: number[];
  isCorrectable: boolean;
} {
  const syndrome = computeSyndrome(receivedVector, H);
  const syndromeKey = syndrome.join('');
  const errorPos = syndromeTable.get(syndromeKey);

  if (errorPos === undefined) {
    // Syndrome pattern does not match any single-bit error
    return {
      syndrome,
      errorPosition: -2,
      correctedVector: [...receivedVector],
      isCorrectable: false,
    };
  }

  if (errorPos === -1) {
    // Valid codeword, no error
    return {
      syndrome,
      errorPosition: -1,
      correctedVector: [...receivedVector],
      isCorrectable: true,
    };
  }

  // Single-bit error detected at `errorPos`: flip that bit
  const corrected = [...receivedVector];
  corrected[errorPos] ^= 1;

  return {
    syndrome,
    errorPosition: errorPos,
    correctedVector: corrected,
    isCorrectable: true,
  };
}
