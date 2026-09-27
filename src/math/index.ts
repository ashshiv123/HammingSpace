export * from './gf2';
export * from './codeGenerator';
export * from './syndromeTable';
export * from './codeValidator';
export * from './calculationStepper';

import { gf2Add, gf2VecMatMul, transpose, hammingWeight } from './gf2';
import { buildGH, HAMMING_PRESETS } from './codeGenerator';
import { buildSyndromeTable, decodeAndCorrect, computeSyndrome } from './syndromeTable';
import { validateCode } from './codeValidator';

/**
 * Inline test suite verifying (7,4) Hamming code mathematical correctness.
 * Returns true if all assertions pass.
 */
export function runHamming74SelfTest(): {
  success: boolean;
  results: { name: string; passed: boolean; details?: string }[];
} {
  const tests: { name: string; passed: boolean; details?: string }[] = [];

  try {
    const { n, k, P } = HAMMING_PRESETS['(7,4)'];
    const { G, H } = buildGH(k, n, P);
    const syndromeTable = buildSyndromeTable(H, n);

    // Test 1: Dimensions of G and H
    const gDimPass = G.length === 4 && G[0].length === 7;
    const hDimPass = H.length === 3 && H[0].length === 7;
    tests.push({
      name: 'Matrix Dimensions (G is 4x7, H is 3x7)',
      passed: gDimPass && hDimPass,
    });

    // Test 2: Orthogonality G * H^T = 0 (mod 2)
    const Ht = transpose(H);
    const GHt = G.map(row => gf2VecMatMul(row, Ht));
    const isOrthogonal = GHt.every(row => row.every(val => val === 0));
    tests.push({
      name: 'Code Orthogonality G * H^T = 0 mod 2',
      passed: isOrthogonal,
    });

    // Test 3: Encoding a known message m = [1, 0, 1, 1]
    const m = [1, 0, 1, 1];
    const c = gf2VecMatMul(m, G);
    // c should be [1, 0, 1, 1, 0, 1, 0]
    const expectedCodeword = [1, 0, 1, 1, 0, 1, 0];
    const codewordMatch = c.length === 7 && c.every((v, i) => v === expectedCodeword[i]);
    const zeroSyndrome = computeSyndrome(c, H).every(v => v === 0);
    tests.push({
      name: 'Codeword Encoding and Zero Syndrome',
      passed: codewordMatch && zeroSyndrome,
      details: `m=[${m.join('')}] -> c=[${c.join('')}]`,
    });

    // Test 4: Single-bit error correction across all 7 positions
    let allPositionsCorrected = true;
    for (let errPos = 0; errPos < n; errPos++) {
      const corrupted = [...c];
      corrupted[errPos] ^= 1;

      const decodeRes = decodeAndCorrect(corrupted, H, syndromeTable);
      if (
        decodeRes.errorPosition !== errPos ||
        !decodeRes.correctedVector.every((v, i) => v === c[i])
      ) {
        allPositionsCorrected = false;
        break;
      }
    }
    tests.push({
      name: 'Single-bit Error Detection & Correction for all 7 bit positions',
      passed: allPositionsCorrected,
    });

    // Test 5: Validation computes d_min = 3
    const validation = validateCode(k, n, G, H);
    tests.push({
      name: 'Minimum Distance d_min is 3 (Hamming Code condition)',
      passed: validation.dMin === 3 && validation.isValid,
      details: `d_min=${validation.dMin}, t=${validation.maxCorrectableErrors}`,
    });

    const allPassed = tests.every(t => t.passed);
    return { success: allPassed, results: tests };
  } catch (error) {
    tests.push({
      name: 'Hamming (7,4) Self Test Exception',
      passed: false,
      details: String(error),
    });
    return { success: false, results: tests };
  }
}
