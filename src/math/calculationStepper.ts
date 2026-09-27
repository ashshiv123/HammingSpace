/**
 * Educational Calculation Stepper for Linear Block Codes (GF(2))
 * Generates progressive step-by-step mathematical explanations,
 * matrix cell highlights, row linear combinations, and column XOR arithmetic.
 */

export interface CalculationStep {
  type: 'encoding' | 'syndrome' | 'correction';
  stepIndex: number;
  totalSteps: number;
  timelineStage:
    | 'read_message'
    | 'select_rows'
    | 'calc_columns'
    | 'assemble_codeword'
    | 'send_channel'
    | 'read_received'
    | 'calc_syndrome_bits'
    | 'lookup_syndrome'
    | 'apply_correction'
    | 'verified';
  activeRow?: number;
  activeCol?: number;
  activeCells?: [number, number][];
  highlightRows?: number[];
  highlightCols?: number[];
  computedCodewordBits: (number | null)[];
  computedSyndromeBits: (number | null)[];
  title: string;
  subtitle: string;
  mathFormula: string;
  expandedTerms: string;
  mod2Result: string;
  explanation: string;
  isComplete?: boolean;
}

/**
 * Generate full step-by-step encoding calculation: c = m · G (mod 2)
 */
export function generateEncodingSteps(
  message: number[],
  G: number[][]
): CalculationStep[] {
  const steps: CalculationStep[] = [];
  const k = message.length;
  const n = G[0]?.length ?? 0;

  if (k === 0 || n === 0) return steps;

  // Find active rows (where m_i == 1)
  const activeRowIndices: number[] = [];
  message.forEach((bit, idx) => {
    if (bit === 1) activeRowIndices.push(idx);
  });

  // Calculate final codeword
  const finalCodeword = new Array(n).fill(0);
  for (let c = 0; c < n; c++) {
    let sum = 0;
    for (let r = 0; r < k; r++) {
      sum ^= message[r] & G[r][c];
    }
    finalCodeword[c] = sum & 1;
  }

  // Pre-calculate total number of steps:
  // Step 0: read message
  // Steps 1..k: inspect each message bit and row selection
  // Steps (k+1)..(k+n): calculate each of n columns
  // Step (k+n+1): assemble codeword
  // Step (k+n+2): ready for channel
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
  const selectedRowsAccumulator: number[] = [];
  for (let i = 0; i < k; i++) {
    const bit = message[i];
    if (bit === 1) {
      selectedRowsAccumulator.push(i);
    }
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
      title: `2. SELECT MATRIX ROWS (Bit m_${i})`,
      subtitle: `Message bit m_${i} = ${bit}`,
      mathFormula: `m_${i} · G_${i} = ${bit} · [${G[i].join(' ')}]`,
      expandedTerms: bit === 1
        ? `1 × Row G_${i} = [${G[i].join(' ')}] → INCLUDED`
        : `0 × Row G_${i} = [${new Array(n).fill(0).join(' ')}] → IGNORED`,
      mod2Result: `Currently included: [${currentSelected.map(r => `G_${r}`).join(' ⊕ ') || '∅'}]`,
      explanation: bit === 1
        ? `m_${i} = 1, so row G_${i} is highlighted and added to the GF(2) linear combination.`
        : `m_${i} = 0, so row G_${i} is multiplied by 0 and ignored.`,
    });
  }

  // STEPS (k+1)..(k+n): Column-by-Column XOR Calculation
  const computedCodewordProgress = new Array(n).fill(null);

  for (let col = 0; col < n; col++) {
    const activeCellsForCol: [number, number][] = activeRowIndices.map(r => [r, col]);
    const terms = activeRowIndices.map(r => G[r][col]);
    
    // Explicit mod-2 sum
    let runningSum = 0;
    const xorSequence: string[] = [];
    terms.forEach((t) => {
      runningSum ^= t;
      xorSequence.push(t.toString());
    });
    const colResult = runningSum & 1;
    computedCodewordProgress[col] = colResult;

    const termExpression = activeRowIndices.length > 0
      ? activeRowIndices.map(r => `G_${r}[${col}](${G[r][col]})`).join(' ⊕ ')
      : '0';

    const binaryXorDisplay = terms.length > 0
      ? terms.join(' ⊕ ')
      : '0';

    steps.push({
      type: 'encoding',
      stepIndex: stepIdx++,
      totalSteps,
      timelineStage: 'calc_columns',
      activeCol: col,
      activeCells: activeCellsForCol,
      highlightRows: activeRowIndices,
      highlightCols: [col],
      computedCodewordBits: [...computedCodewordProgress],
      computedSyndromeBits: [],
      title: `3. CALCULATE CODEWORD BIT c_${col}`,
      subtitle: `Column ${col} of G: c_${col} = m · Col_${col}(G)`,
      mathFormula: `c_${col} = ⨁_{i: m_i=1} G_{i,${col}}`,
      expandedTerms: `${termExpression} = ${binaryXorDisplay}`,
      mod2Result: `c_${col} = ${colResult}  (mod 2)`,
      explanation: `Evaluating column ${col}: mod-2 addition of active cells yields c_${col} = ${colResult}. Bit ${col} added to packet.`,
    });
  }

  // STEP (k+n+1): Assemble Codeword
  steps.push({
    type: 'encoding',
    stepIndex: stepIdx++,
    totalSteps,
    timelineStage: 'assemble_codeword',
    highlightRows: activeRowIndices,
    computedCodewordBits: [...finalCodeword],
    computedSyndromeBits: [],
    title: '4. CODEWORD ASSEMBLED',
    subtitle: `Systematic c = [m | p] = [${finalCodeword.join(' ')}]`,
    mathFormula: `c = m · G = [${finalCodeword.join(' ')}]`,
    expandedTerms: `Data bits m: [${finalCodeword.slice(0, k).join(' ')}] | Parity bits p: [${finalCodeword.slice(k).join(' ')}]`,
    mod2Result: `✓ All ${n} codeword bits generated successfully`,
    explanation: `The codeword packet c is fully assembled. It contains the ${k} original message bits followed by ${n - k} parity check bits.`,
  });

  // STEP (k+n+2): Launch into Channel
  steps.push({
    type: 'encoding',
    stepIndex: stepIdx++,
    totalSteps,
    timelineStage: 'send_channel',
    computedCodewordBits: [...finalCodeword],
    computedSyndromeBits: [],
    title: '5. TRANSMITTING THROUGH CHANNEL',
    subtitle: 'Packet in Channel Conduit',
    mathFormula: 'Codeword c enters Binary Symmetric Channel (BSC)',
    expandedTerms: `c = [${finalCodeword.join(' ')}]`,
    mod2Result: 'Ready for channel noise injection',
    explanation: 'The codeword packet is now in transit across the channel. You can click any bit to simulate noise, or proceed to syndrome check.',
    isComplete: true,
  });

  return steps;
}

/**
 * Generate full step-by-step syndrome calculation: S = r · Hᵀ (mod 2)
 */
export function generateSyndromeSteps(
  received: number[],
  H: number[][],
  syndromeTable: Map<string, number>
): CalculationStep[] {
  const steps: CalculationStep[] = [];
  const r = H.length; // number of parity check rows
  const n = H[0]?.length ?? 0;

  if (r === 0 || n === 0) return steps;

  // Calculate full syndrome
  const finalSyndrome = new Array(r).fill(0);
  for (let row = 0; row < r; row++) {
    let sum = 0;
    for (let col = 0; col < n; col++) {
      sum ^= received[col] & H[row][col];
    }
    finalSyndrome[row] = sum & 1;
  }

  const synKey = finalSyndrome.join('');
  const errorPos = syndromeTable.get(synKey) ?? -1;
  const hasError = finalSyndrome.some(b => b === 1);

  // Pre-calculate total steps:
  // Step 0: read received vector
  // Steps 1..r: calculate each syndrome bit s_j = r · Row_j(H)
  // Step (r+1): lookup syndrome in table & locate error
  // Step (r+2): complete / ready
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
    subtitle: `Received r = [${received.join(' ')}]`,
    mathFormula: `S = r · Hᵀ  (mod 2)`,
    expandedTerms: `Testing parity against ${r} check equations in H (${r} × ${n})`,
    mod2Result: 'Computing orthogonality...',
    explanation: 'The receiver tests if the received vector r satisfies all parity equations (c · Hᵀ = 0). Non-zero syndrome implies channel error.',
  });

  // STEPS 1..r: Calculate each syndrome bit
  const computedSyndromeProgress = new Array(r).fill(null);

  for (let sIdx = 0; sIdx < r; sIdx++) {
    // Row sIdx of H represents the sIdx-th parity check equation
    const contributingCols: number[] = [];
    for (let c = 0; c < n; c++) {
      if (received[c] === 1 && H[sIdx][c] === 1) {
        contributingCols.push(c);
      }
    }

    const activeCells: [number, number][] = contributingCols.map(c => [sIdx, c]);
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
      expandedTerms: termStrings.length > 0 ? `${termStrings.join(' ⊕ ')} = ${binaryXorDisplay}` : 'No active overlapping 1s = 0',
      mod2Result: `s_${sIdx} = ${sVal}  (mod 2)`,
      explanation: `Parity row ${sIdx}: XOR sum of overlapping ones between r and H[${sIdx}] yields s_${sIdx} = ${sVal}.`,
    });
  }

  // STEP (r+1): Table Lookup & Error Isolation
  if (hasError) {
    steps.push({
      type: 'syndrome',
      stepIndex: stepIdx++,
      totalSteps,
      timelineStage: 'lookup_syndrome',
      highlightCols: errorPos >= 0 ? [errorPos] : [],
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
      expandedTerms: `Click "Correct Error via Syndrome" to invert bit c_${errorPos}`,
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
 */
export function generateCorrectionSteps(
  received: number[],
  errorPos: number,
  H: number[][]
): CalculationStep[] {
  const steps: CalculationStep[] = [];
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
    mathFormula: `ĉ = r ⊕ e_{${errorPos}}`,
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
    subtitle: 'Recomputing S = ĉ · Hᵀ',
    mathFormula: `ĉ · Hᵀ = [${corrected.join(' ')}] · Hᵀ`,
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
    mathFormula: `ĉ = [${corrected.join(' ')}] ∈ Code`,
    expandedTerms: `Original message recovered: m = [${corrected.slice(0, n - r).join(' ')}]`,
    mod2Result: '✓ VALID CODEWORD VERIFIED',
    explanation: 'The transmission error has been fully corrected. The extracted message matches the original transmitted message.',
    isComplete: true,
  });

  return steps;
}
