/**
 * gf2.js — GF(2) Math Engine for HammingSpace
 *
 * All arithmetic is over GF(2): addition = XOR, multiplication = AND.
 * Vectors are plain JS arrays of 0s and 1s.
 * Matrices are arrays of row-arrays (row-major order).
 */

function dotGF2(a, b) {
  let acc = 0;
  for (let i = 0; i < a.length; i++) acc ^= (a[i] & b[i]);
  return acc;
}

function transpose(M) {
  const rows = M.length;
  const cols = M[0].length;
  return Array.from({ length: cols }, (_, j) =>
    Array.from({ length: rows }, (_, i) => M[i][j])
  );
}

/** c = m · G  (mod 2) */
export function encode(m, G) {
  const k = G.length;
  const n = G[0].length;
  if (m.length !== k) throw new Error(`encode: m length ${m.length} != G rows ${k}`);
  return Array.from({ length: n }, (_, j) =>
    m.reduce((acc, mi, i) => acc ^ (mi & G[i][j]), 0)
  );
}

/** S = r · Hᵀ  (mod 2) */
export function syndrome(r, H) {
  const n = H[0].length;
  if (r.length !== n) throw new Error(`syndrome: r length ${r.length} != H cols ${n}`);
  return H.map(row => dotGF2(r, row));
}

/** Count of 1-bits */
export function hammingWeight(v) {
  return v.reduce((acc, bit) => acc + bit, 0);
}

/** d(a,b) = wt(a XOR b) */
export function hammingDistance(a, b) {
  if (a.length !== b.length) throw new Error(`hammingDistance: length mismatch`);
  return a.reduce((acc, bit, i) => acc + (bit ^ b[i]), 0);
}

/** Build syndrome→error lookup table for weights 0..t */
export function buildSyndromeTable(H, t) {
  const n = H[0].length;
  const table = new Map();
  const zeroError = Array(n).fill(0);
  table.set(syndrome(zeroError, H).join(','), zeroError);

  function enumerate(currentError, startCol, currentWeight) {
    const S = syndrome(currentError, H);
    const key = S.join(',');
    if (!table.has(key)) table.set(key, [...currentError]);
    if (currentWeight < t) {
      for (let col = startCol; col < n; col++) {
        currentError[col] = 1;
        enumerate(currentError, col + 1, currentWeight + 1);
        currentError[col] = 0;
      }
    }
  }

  const err = Array(n).fill(0);
  for (let col = 0; col < n; col++) {
    err[col] = 1;
    enumerate([...err], col + 1, 1);
    err[col] = 0;
  }
  return table;
}

/** Correct r using syndrome table */
export function correct(r, H, syndromeTable) {
  const S = syndrome(r, H);
  const key = S.join(',');
  if (S.every(b => b === 0)) return { corrected: [...r], errorPosition: null, correctable: true };
  const errorVector = syndromeTable.get(key);
  if (!errorVector) return { corrected: [...r], errorPosition: null, correctable: false };
  const corrected = r.map((bit, i) => bit ^ errorVector[i]);
  const positions = errorVector.map((b, i) => (b === 1 ? i + 1 : null)).filter(Boolean);
  return { corrected, errorPosition: positions.length === 1 ? positions[0] : null, correctable: true };
}

/** Derive H = [Pᵀ | I_{n-k}] from systematic G = [Iₖ | P] */
export function deriveH(G, k = G.length) {
  const n = G[0].length;
  const r = n - k;
  const P = G.map(row => row.slice(k));
  const Pt = transpose(P);
  return Pt.map((ptRow, i) => {
    const identityPart = Array.from({ length: r }, (_, j) => (i === j ? 1 : 0));
    return [...ptRow, ...identityPart];
  });
}

/** Enumerate all 2^k valid codewords */
export function enumerateCodewords(G) {
  const k = G.length;
  const total = 1 << k;
  const codewords = [];
  for (let i = 0; i < total; i++) {
    const m = Array.from({ length: k }, (_, b) => (i >> (k - 1 - b)) & 1);
    codewords.push(encode(m, G));
  }
  return codewords;
}

/** Find d_min and t = floor((d_min-1)/2) */
export function minDistance(codewords) {
  let dMin = Infinity;
  for (const cw of codewords) {
    const w = hammingWeight(cw);
    if (w > 0 && w < dMin) dMin = w;
  }
  if (!isFinite(dMin)) throw new Error('minDistance: could not compute d_min');
  return { dMin, t: Math.floor((dMin - 1) / 2) };
}
