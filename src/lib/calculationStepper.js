/**
 * calculationStepper.js — Educational Calculation Stepper for HammingSpace
 *
 * Adapted from project_simulation's calculationStepper.ts.
 * Generates progressive step-by-step mathematical explanations,
 * matrix cell highlights, row linear combinations, and column XOR arithmetic.
 *
 * Uses HammingSpace's existing GF(2) math (gf2.js) conventions.
 */

import { encode, syndrome as computeSyndrome } from './gf2.js';

/**
 * Generate full step-by-step encoding calculation: c = m · G (mod 2)
 * @param {number[]} message
 * @param {number[][]} G
 * @returns {Array} steps
 */
export function generateEncodingSteps(message, G) {
  const steps = [];
  const k = message.length;
  const n = G[0]?.length ?? 0;

  if (k === 0 || n === 0) return steps;

  // Find active rows (where m_i == 1)
  const activeRowIndices = [];
  message.forEach((bit, idx) => {
    if (bit === 1) activeRowIndices.push(idx);
  });

  // Calculate final codeword using existing gf2.js encode
  const finalCodeword = encode(message, G);

  const totalSteps = 1 + k + n + 2;
  let stepIdx = 0;

  // STEP 0: Read Message
  steps.push({
    type: 'encoding',
    stepIndex: stepIdx++,
    totalSteps,
    timelineStage: 'read_message',
    computedCodewordBits: new Array(n).fill(null),
    computedSyndromeBits: [],
    title: '1. READ MESSAGE VECTOR',
    subtitle: `m = [${message.join(' ')}]`,
    mathFormula: `c = m · G = ⨁_{i=0}^{${k - 1}} m_i · G_i  (mod 2)`,
    expandedTerms: message.map((b, i) => `${b}·G_${i}`).join(' ⊕ '),
    mod2Result: `Active rows to combine: ${activeRowIndices.length > 0 ? activeRowIndices.map(r => `G_${r}`).join(', ') : 'None (all zero)'}`,
    explanation: `The ${k}-bit message vector m enters the encoder. Only rows of G where m_i = 1 contribute to the output codeword.`,
  });

  // STEPS 1..k: Inspect each message bit and select rows
  const selectedRowsAccumulator = [];
  for (let i = 0; i < k; i++) {
    const bit = message[i];
    if (bit === 1) selectedRowsAccumulator.push(i);
    const currentSelected = [...selectedRowsAccumulator];

    steps.push({
      type: 'encoding',
      stepIndex: stepIdx++,
      totalSteps,
      timelineStage: 'select_rows',
      activeRow: i,
      highlightRows: currentSelected,
      computedCodewordBits: new Array(n).fill(null),
      computedSyndromeBits: [],
      title: `2. INSPECT BIT m_${i}`,
      subtitle: `m_${i} = ${bit} → ${bit === 1 ? 'Select Row G_' + i : 'Skip Row G_' + i}`,
      mathFormula: `m_${i} · G_${i}`,
      expandedTerms: bit === 1 ? `Row G_${i} = [${G[i].join(' ')}]` : `Zero contribution (m_${i} = 0)`,
      mod2Result: bit === 1 ? `G_${i} added to combination` : `G_${i} not included`,
      explanation: bit === 1
        ? `Since m_${i} = 1, row G_${i} = [${G[i].join(' ')}] is selected for XOR combination.`
        : `Since m_${i} = 0, row G_${i} is suppressed (contributes all zeros).`,
    });
  }

  // STEPS k+1..k+n: Calculate each output column
  const partialCodeword = new Array(n).fill(null);
  for (let col = 0; col < n; col++) {
    // Accumulate contributing terms for this column
    const contributingRows = [];
    for (let row = 0; row < k; row++) {
      if (message[row] === 1 && G[row][col] === 1) {
        contributingRows.push(row);
      }
    }

    const colResult = finalCodeword[col];
    partialCodeword[col] = colResult;

    const activeCells = contributingRows.map(r => [r, col]);
    const termStrings = contributingRows.map(r => `m_${r}(1)·G_{${r},${col}}(1)`);
    const binaryXorDisplay = contributingRows.length > 0
      ? contributingRows.map(() => '1').join(' ⊕ ')
      : '0';

    steps.push({
      type: 'encoding',
      stepIndex: stepIdx++,
      totalSteps,
      timelineStage: 'calc_columns',
      activeCol: col,
      activeCells,
      highlightCols: [col],
      computedCodewordBits: [...partialCodeword],
      computedSyndromeBits: [],
      title: `3. COMPUTE CODEWORD BIT c_${col}`,
      subtitle: `Column ${col}: XOR of active row values`,
      mathFormula: `c_${col} = ⨁_{i} m_i · G_{i,${col}}  (mod 2)`,
      expandedTerms: termStrings.length > 0
        ? `${termStrings.join(' ⊕ ')} = ${binaryXorDisplay}`
        : 'No active overlapping 1s = 0',
      mod2Result: `c_${col} = ${colResult}  (mod 2)`,
      explanation: contributingRows.length > 0
        ? `Column ${col}: XOR of overlapping ones from active rows (${contributingRows.map(r => `G_${r}`).join(', ')}) yields c_${col} = ${colResult}.`
        : `Column ${col}: No active row has a 1 here, so c_${col} = 0.`,
    });
  }

  // STEP k+n+1: Codeword assembled
  steps.push({
    type: 'encoding',
    stepIndex: stepIdx++,
    totalSteps,
    timelineStage: 'assemble_codeword',
    computedCodewordBits: [...finalCodeword],
    computedSyndromeBits: [],
    title: '4. CODEWORD ASSEMBLED',
    subtitle: `c = [${finalCodeword.join(' ')}]`,
    mathFormula: `c = [${finalCodeword.slice(0, k).join(' ')} | ${finalCodeword.slice(k).join(' ')}]`,
    expandedTerms: `Message bits: [${finalCodeword.slice(0, k).join(' ')}] | Parity bits: [${finalCodeword.slice(k).join(' ')}]`,
    mod2Result: `Systematic codeword c ∈ Code`,
    explanation: `The complete ${n}-bit codeword c has been assembled. The first ${k} bits are the original message (systematic form), and the last ${n - k} bits are computed parity bits for error detection.`,
    isComplete: true,
  });

  // STEP k+n+2: Ready for channel
  steps.push({
    type: 'encoding',
    stepIndex: stepIdx++,
    totalSteps,
    timelineStage: 'send_channel',
    computedCodewordBits: [...finalCodeword],
    computedSyndromeBits: [],
    title: '5. READY FOR TRANSMISSION',
    subtitle: 'Codeword entering Noisy Channel',
    mathFormula: `r = c ⊕ e  (where e is noise)`,
    expandedTerms: `c = [${finalCodeword.join(' ')}]`,
    mod2Result: 'Channel: Binary Symmetric Channel (BSC)',
    explanation: 'The codeword is now transmitted through the noisy channel. Random bit flips (error vector e) may corrupt it before it reaches the receiver.',
    isComplete: true,
  });

  return steps;
}

/**
 * Generate step-by-step syndrome decoding: S = r · H^T (mod 2)
 * @param {number[]} received
 * @param {number[][]} H
 * @param {Map} syndromeTable
 * @returns {Array} steps
 */
export function generateSyndromeSteps(received, H, syndromeTable) {
  const steps = [];
  const n = received.length;
  const r = H.length;

  if (n === 0 || r === 0) return steps;

  const finalSyndrome = computeSyndrome(received, H);
  const hasError = !finalSyndrome.every(b => b === 0);

  // Look up error position from syndrome table
  let errorPos = -1;
  if (hasError && syndromeTable) {
    const key = finalSyndrome.join(',');
    const ev = syndromeTable.get(key);
    if (ev) {
      errorPos = ev.findIndex(b => b === 1);
    }
  }

  const totalSteps = 1 + r + 2;
  let stepIdx = 0;

  // STEP 0: Read Received Vector
  steps.push({
    type: 'syndrome',
    stepIndex: stepIdx++,
    totalSteps,
    timelineStage: 'read_received',
    computedCodewordBits: [...received],
    computedSyndromeBits: new Array(r).fill(null),
    title: '1. READ RECEIVED VECTOR',
    subtitle: `r = [${received.join(' ')}]`,
    mathFormula: `S = r · Hᵀ  (mod 2)`,
    expandedTerms: `Testing parity against ${r} check equations in H (${r} × ${n})`,
    mod2Result: 'Computing orthogonality...',
    explanation: 'The receiver tests if the received vector r satisfies all parity equations (c · Hᵀ = 0). Non-zero syndrome implies channel error.',
  });

  // STEPS 1..r: Calculate each syndrome bit
  const computedSyndromeProgress = new Array(r).fill(null);
  for (let sIdx = 0; sIdx < r; sIdx++) {
    const contributingCols = [];
    for (let c = 0; c < n; c++) {
      if (received[c] === 1 && H[sIdx][c] === 1) {
        contributingCols.push(c);
      }
    }

    const activeCells = contributingCols.map(c => [sIdx, c]);
    const sVal = finalSyndrome[sIdx];
    computedSyndromeProgress[sIdx] = sVal;

    const termStrings = contributingCols.map(c => `r_${c}(1)·H_{${sIdx},${c}}(1)`);
    const binaryXorDisplay = contributingCols.length > 0
      ? contributingCols.map(() => '1').join(' ⊕ ')
      : '0';

    steps.push({
      type: 'syndrome',
      stepIndex: stepIdx++,
      totalSteps,
      timelineStage: 'calc_syndrome_bits',
      activeRow: sIdx,
      activeCells,
      highlightRows: [sIdx],
      computedCodewordBits: [...received],
      computedSyndromeBits: [...computedSyndromeProgress],
      title: `2. CALCULATE SYNDROME BIT s_${sIdx}`,
      subtitle: `Equation ${sIdx}: s_${sIdx} = r · Row_${sIdx}(H)`,
      mathFormula: `s_${sIdx} = ⨁_{i=0}^{${n - 1}} (r_i · H_{${sIdx},i})`,
      expandedTerms: termStrings.length > 0
        ? `${termStrings.join(' ⊕ ')} = ${binaryXorDisplay}`
        : 'No active overlapping 1s = 0',
      mod2Result: `s_${sIdx} = ${sVal}  (mod 2)`,
      explanation: `Parity row ${sIdx}: XOR sum of overlapping ones between r and H[${sIdx}] yields s_${sIdx} = ${sVal}.`,
    });
  }

  // STEP r+1: Table Lookup & Error Isolation
  if (hasError && errorPos >= 0) {
    steps.push({
      type: 'syndrome',
      stepIndex: stepIdx++,
      totalSteps,
      timelineStage: 'lookup_syndrome',
      highlightCols: [errorPos],
      computedCodewordBits: [...received],
      computedSyndromeBits: [...finalSyndrome],
      title: '3. SYNDROME TABLE LOOKUP',
      subtitle: `Non-zero Syndrome S = [${finalSyndrome.join('')}]`,
      mathFormula: `S matches Column ${errorPos} of Parity Check Matrix H`,
      expandedTerms: `Syndrome Table: [${finalSyndrome.join('')}] ➔ Error vector e with 1 at index ${errorPos}`,
      mod2Result: `Corrupted Bit: c_${errorPos}`,
      explanation: `Because S ≠ 0, parity is violated! The syndrome [${finalSyndrome.join('')}] is identical to column ${errorPos} of H, isolating the single-bit error to c_${errorPos}.`,
    });

    steps.push({
      type: 'syndrome',
      stepIndex: stepIdx++,
      totalSteps,
      timelineStage: 'lookup_syndrome',
      highlightCols: [errorPos],
      computedCodewordBits: [...received],
      computedSyndromeBits: [...finalSyndrome],
      title: '4. ERROR ISOLATED — READY TO CORRECT',
      subtitle: `Bit c_${errorPos} is corrupted`,
      mathFormula: `r = c ⊕ e_{${errorPos}} ➔ e = [${new Array(n).fill(0).map((_, i) => i === errorPos ? 1 : 0).join(' ')}]`,
      expandedTerms: `Click "Apply Correction" to invert bit c_${errorPos}`,
      mod2Result: `Status: Parity Error Detected at c_${errorPos}`,
      explanation: `The coset leader identifies that inverting bit c_${errorPos} will restore the codeword to the valid code subspace.`,
      isComplete: true,
    });
  } else {
    // Valid Codeword (S = 0)
    steps.push({
      type: 'syndrome',
      stepIndex: stepIdx++,
      totalSteps,
      timelineStage: 'lookup_syndrome',
      computedCodewordBits: [...received],
      computedSyndromeBits: [...finalSyndrome],
      title: '3. ALL PARITY CHECKS SATISFIED',
      subtitle: 'Syndrome S = [0 0 0]',
      mathFormula: 'S = r · Hᵀ = 0  (mod 2)',
      expandedTerms: 'All check equations evaluate to 0',
      mod2Result: '✓ Valid Codeword (r ∈ Code)',
      explanation: 'Every parity check equation passed. The received vector contains zero detectable errors and is an authentic codeword.',
    });

    steps.push({
      type: 'syndrome',
      stepIndex: stepIdx++,
      totalSteps,
      timelineStage: 'verified',
      computedCodewordBits: [...received],
      computedSyndromeBits: [...finalSyndrome],
      title: '4. VERIFIED ORTHOGONAL',
      subtitle: 'Codeword Integrity Confirmed',
      mathFormula: 'c · Hᵀ = 0',
      expandedTerms: 'No correction needed',
      mod2Result: 'Ready for new message',
      explanation: 'Simulation verified. The codeword matches the transmitter message.',
      isComplete: true,
    });
  }

  return steps;
}

/**
 * Generate full step-by-step correction calculation
 * @param {number[]} received
 * @param {number} errorPos  0-based index
 * @param {number[][]} H
 * @returns {Array} steps
 */
export function generateCorrectionSteps(received, errorPos, H) {
  const steps = [];
  const n = received.length;
  const r = H.length;
  const corrected = [...received];

  if (errorPos >= 0 && errorPos < n) {
    corrected[errorPos] = corrected[errorPos] ^ 1;
  }

  const totalSteps = 3;
  let stepIdx = 0;

  // Step 0: Apply inversion
  steps.push({
    type: 'correction',
    stepIndex: stepIdx++,
    totalSteps,
    timelineStage: 'apply_correction',
    highlightCols: [errorPos],
    computedCodewordBits: [...received],
    computedSyndromeBits: [],
    title: '1. INVERT CORRUPTED BIT',
    subtitle: `Flip Bit c_${errorPos}: ${received[errorPos]} ➔ ${corrected[errorPos]}`,
    mathFormula: `ĉ = r ⊕ e_{${errorPos}}`,
    expandedTerms: `Bit c_${errorPos} (${received[errorPos]}) ⊕ 1 = ${corrected[errorPos]}`,
    mod2Result: `Corrected vector: [${corrected.join(' ')}]`,
    explanation: `The coset leader error vector is subtracted (modulo 2 added) from the received vector, inverting the erroneous bit.`,
  });

  // Step 1: Re-verify with H
  steps.push({
    type: 'correction',
    stepIndex: stepIdx++,
    totalSteps,
    timelineStage: 'calc_syndrome_bits',
    computedCodewordBits: [...corrected],
    computedSyndromeBits: new Array(r).fill(0),
    title: '2. RE-EVALUATE PARITY',
    subtitle: 'Recomputing S = ĉ · Hᵀ',
    mathFormula: `ĉ · Hᵀ = [${corrected.join(' ')}] · Hᵀ`,
    expandedTerms: `All parity sums re-evaluated: S_new = [${new Array(r).fill(0).join(' ')}]`,
    mod2Result: `S = [${new Array(r).fill(0).join(' ')}] (ZERO VECTOR)`,
    explanation: `The restored vector is re-checked against all rows of H. Every parity equation now sums to 0 modulo 2.`,
  });

  // Step 2: Verification Complete
  steps.push({
    type: 'correction',
    stepIndex: stepIdx++,
    totalSteps,
    timelineStage: 'verified',
    computedCodewordBits: [...corrected],
    computedSyndromeBits: new Array(r).fill(0),
    title: '3. RESTORATION COMPLETE',
    subtitle: 'Codeword Successfully Recovered',
    mathFormula: `ĉ = [${corrected.join(' ')}] ∈ Code`,
    expandedTerms: `Original message recovered: m = [${corrected.slice(0, n - r).join(' ')}]`,
    mod2Result: '✓ VALID CODEWORD VERIFIED',
    explanation: 'The transmission error has been fully corrected. The extracted message matches the original transmitted message.',
    isComplete: true,
  });

  return steps;
}
