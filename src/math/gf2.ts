/**
 * GF(2) (Galois Field of 2 elements, arithmetic modulo 2) primitives.
 * Pure functions, zero dependencies, framework-agnostic.
 */

/**
 * Modulo-2 addition of two binary vectors (bitwise XOR).
 */
export function gf2Add(a: number[], b: number[]): number[] {
  const len = Math.max(a.length, b.length);
  const result: number[] = new Array(len);
  for (let i = 0; i < len; i++) {
    result[i] = ((a[i] ?? 0) ^ (b[i] ?? 0)) & 1;
  }
  return result;
}

/**
 * Modulo-2 vector-matrix multiplication: v (1 x k) * M (k x n) -> 1 x n.
 */
export function gf2VecMatMul(v: number[], M: number[][]): number[] {
  if (M.length === 0 || !M[0] || M[0].length === 0) {
    return [];
  }
  const cols = M[0].length;
  const rows = M.length;
  const result: number[] = new Array(cols).fill(0);

  for (let col = 0; col < cols; col++) {
    let sum = 0;
    for (let row = 0; row < rows; row++) {
      sum ^= ((v[row] ?? 0) & (M[row][col] ?? 0));
    }
    result[col] = sum & 1;
  }

  return result;
}

/**
 * Modulo-2 matrix multiplication: A (m x k) * B (k x n) -> m x n.
 */
export function gf2MatMul(A: number[][], B: number[][]): number[][] {
  if (A.length === 0 || B.length === 0 || !B[0]) {
    return [];
  }
  return A.map(row => gf2VecMatMul(row, B));
}

/**
 * Transpose of an arbitrary 2D matrix.
 */
export function transpose(M: number[][]): number[][] {
  if (M.length === 0 || !M[0] || M[0].length === 0) {
    return [];
  }
  const rows = M.length;
  const cols = M[0].length;
  const result: number[][] = Array.from({ length: cols }, () => new Array(rows));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      result[c][r] = M[r][c];
    }
  }

  return result;
}

/**
 * Identity matrix of dimension `size x size` in GF(2).
 */
export function identity(size: number): number[][] {
  if (size <= 0) return [];
  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => (row === col ? 1 : 0))
  );
}

/**
 * Computes the Hamming weight (number of non-zero bits) of a binary vector.
 */
export function hammingWeight(v: number[]): number {
  return v.reduce((acc, bit) => acc + (bit ? 1 : 0), 0);
}

/**
 * Computes the Hamming distance between two binary vectors.
 */
export function hammingDistance(a: number[], b: number[]): number {
  return hammingWeight(gf2Add(a, b));
}
