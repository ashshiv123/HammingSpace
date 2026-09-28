const isPowerOfTwo = (value) => value > 0 && (value & (value - 1)) === 0;

export function calcR(k) {
  let r = 1;
  while (2 ** r < k + r + 1) r += 1;
  return r;
}

export function buildPositions(n) {
  let dataIndex = 0;
  return Array.from({ length: n }, (_, index) => {
    const position = index + 1;
    if (isPowerOfTwo(position)) return { pos: position, type: 'P' };
    dataIndex += 1;
    return { pos: position, type: 'D', dIndex: dataIndex };
  });
}

export function parityGroups(n, r) {
  return Array.from({ length: r }, (_, exponent) => {
    const p = 2 ** exponent;
    const covered = [];
    for (let position = 1; position <= n; position += 1) {
      if (position !== p && (position & p) !== 0) covered.push(position);
    }
    return { p, exp: exponent, covered };
  });
}

export function buildPStructural(n, r) {
  const positions = buildPositions(n);
  const groups = parityGroups(n, r);
  const dataPositions = positions.filter((position) => position.type === 'D');
  const P = dataPositions.map((dataPosition) =>
    groups.map((group) => (group.covered.includes(dataPosition.pos) ? 1 : 0))
  );
  return { P, groups, positions, dataPositions };
}

export function multiplyRow(message, G) {
  return G[0].map((_, column) =>
    message.reduce((sum, bit, row) => sum ^ ((bit || 0) & G[row][column]), 0)
  );
}

export function buildG(P) {
  return P.map((row, index) => [
    ...Array.from({ length: P.length }, (_, column) => (column === index ? 1 : 0)),
    ...row,
  ]);
}

export function buildH(P) {
  const r = P[0].length;
  return Array.from({ length: r }, (_, row) => [
    ...P.map((dataRow) => dataRow[row]),
    ...Array.from({ length: r }, (_, column) => (column === row ? 1 : 0)),
  ]);
}

export function syndrome(received, H) {
  return H.map((row) => received.reduce((sum, bit, index) => sum ^ (bit & row[index]), 0));
}

export function weight(vector) {
  return vector.reduce((sum, bit) => sum + (bit ? 1 : 0), 0);
}

function locateBySyndrome(S, H) {
  if (S.every((bit) => bit === 0)) return -1;
  return H[0].findIndex((_, column) => H.every((row, index) => row[column] === S[index]));
}

export function createLessonState({ messageBits, G: appG, H: appH, c: appC, errorVector = [] }) {
  const message = [...messageBits];
  const k = message.length;
  const r = calcR(k);
  const n = k + r;
  const structural = buildPStructural(n, r);
  const referenceP = structural.P;
  const referenceG = buildG(referenceP);
  const referenceH = buildH(referenceP);
  const appGValue = appG || referenceG;
  const appHValue = appH || referenceH;
  const codeword = appC || multiplyRow(message, appGValue);
  const errors = Array.from({ length: n }, (_, index) => errorVector[index] || 0);
  const received = codeword.map((bit, index) => bit ^ errors[index]);
  const S = syndrome(received, appHValue);
  const errorPosition = locateBySyndrome(S, appHValue);
  const corrected = received.slice();
  if (errorPosition >= 0) corrected[errorPosition] ^= 1;

  return {
    dataStr: message.join(''), message, dataBits: message, k, r, n,
    positions: structural.positions, groups: structural.groups,
    dataPositions: structural.dataPositions, P: referenceP,
    G: appGValue, H: appHValue, c: codeword, e: errors, rVector: received,
    S, corrected, errorPosition, dMin: 3, t: 1,
    mismatch: {
      G: JSON.stringify(referenceG) !== JSON.stringify(appGValue),
      H: JSON.stringify(referenceH) !== JSON.stringify(appHValue),
      c: JSON.stringify(multiplyRow(message, appGValue)) !== JSON.stringify(codeword),
    },
  };
}

const grid = (matrix, role = 'matrix') => ({ type: 'matrix', role, matrix });

function renderStep1(state) {
  const checks = [];
  for (let parityBits = 1; parityBits <= state.r; parityBits += 1) {
    const power = 2 ** parityBits;
    checks.push(`r = ${parityBits}\n2^${parityBits} = ${power}\n${power} >= ${state.k}+${parityBits}+1 = ${state.k + parityBits + 1} ?  ${power >= state.k + parityBits + 1 ? 'YES ✓' : 'no ✗'}`);
    if (power >= state.k + parityBits + 1) break;
  }
  return { paragraphs: [`Your input ${state.dataStr} has m = ${state.k} data bits.`, 'We need enough parity bits r so that the receiver can not only detect an error, but pin down which of the n = m+r bit positions is wrong — or confirm there is no error at all.', 'We test increasing values of r until the condition holds:'], blocks: ['2^r >= m + r + 1', checks.join('\n\n')], result: `r = ${state.r} parity bits required\n\nCodeword length: n = m + r = ${state.k} + ${state.r} = ${state.n}` };
}

function renderStep2(state) {
  return { paragraphs: ['Parity bits go at positions that are powers of two — 1, 2, 4, 8, ... — because those positions have exactly one bit set in binary. Every other position holds a data bit, filled left to right.'], blocks: [`position -> role (n = ${state.n})`, state.positions.map((position) => position.type === 'P' ? `P${Math.log2(position.pos)}` : `D${position.dIndex}`).join('  ')], matrices: [grid([state.positions.map((position) => position.pos), state.positions.map((position) => position.type), ''], 'positions')], hint: `Parity positions: ${state.positions.filter((position) => position.type === 'P').map((position) => position.pos).join(', ')}. Data positions: ${state.dataPositions.map((position) => position.pos).join(', ')}.` };
}

function renderStep3(state) {
  const groups = state.groups.map((group) => `P${group.p} watches over: ${group.covered.map((position) => `D${state.dataPositions.find((data) => data.pos === position).dIndex}`).join(', ')}`).join('\n\n');
  return { paragraphs: ['Picture each parity bit as an inspector, and each position as a worker. Every inspector is assigned one binary digit to watch, and only checks in on workers whose position number has a 1 in that digit.', "We're not solving for any values here — just mapping out which data bits are watched by which inspector."], blocks: [groups], matrices: [grid(state.P, 'P')], hint: `P ${state.k}x${state.r}` };
}

function renderStep4(state) {
  return { paragraphs: ['I (identity) lets every data bit pass straight through unchanged. P is the contribution table built in Step 3. Placed side by side, they make G = [I|P].'], matrices: [grid(state.G, 'G')], hint: `G = [ I_${state.k} | P ]  (${state.k}x${state.n})` };
}

function renderStep5(state) {
  const rows = state.dataBits.map((bit, index) => `D${index + 1}=${bit} -> row ${index + 1} ${bit ? 'contributes' : 'is skipped'}`).join('\n');
  return { paragraphs: ['Only now does your actual data enter the picture. For every data bit that is 1, XOR in that row of G; rows where the data bit is 0 are skipped — G itself never changed.'], blocks: [`${rows}\n\nXOR the contributing rows together (mod 2) -> c`], result: `c (data | parity) = ${state.c.slice(0, state.k).join('')} | ${state.c.slice(state.k).join('')}`, matrices: [grid(state.G, 'G')] };
}

function renderStep6(state) {
  return { paragraphs: ["Once c leaves the transmitter it travels through a channel that isn't perfectly reliable — static, interference, anything that can flip a 0 to a 1 or a 1 to a 0.", 'We describe that damage with an error vector e: a string of 0s and 1s the same length as c.'], blocks: [`c = ${state.c.join('')}\ne = ${state.e.join('')}\nr = ${state.rVector.join('')}   (r = c ⊕ e, bit by bit)`], result: `Hamming weight of e (number of injected errors) = ${weight(state.e)}`, hint: 'The errors came from the noise injected in the 3D channel; restart the lab to try a different pattern.' };
}

function renderStep7(state) {
  return { paragraphs: ['Weight is the simplest idea here: just a headcount of the 1s in a bit string. Hamming distance between two codewords is how many positions they differ in.', 'For this Hamming code, d_min = 3 — no two valid codewords are ever closer than 3 flips apart.'], blocks: ['t = floor((d_min - 1) / 2) = floor((3-1)/2) = 1'], result: 'Guaranteed correction: 1 bit\nGuaranteed detection: d_min - 1 = 2 bits', hint: `You currently have ${weight(state.e)} error${weight(state.e) === 1 ? '' : 's'} injected.` };
}

function renderStep8(state) {
  return { paragraphs: ['H is just P turned on its side (transposed), with an identity block attached next to it: H = [P^T | I_(n-k)]. Its whole job is a quick check: multiply any valid codeword by H^T and the answer should always come out all zeros.', `H needs n columns — one per codeword bit — and one row per parity bit, giving ${state.r} rows and ${state.n} columns.`], matrices: [grid(state.H, 'H')], hint: `H = [ P^T | I_${state.r} ]  (${state.r}x${state.n})` };
}

function renderStep9(state) {
  const syndromeText = state.S.join('');
  const outcome = state.S.every((bit) => bit === 0) ? `Syndrome S = ${syndromeText} — all zero.\nThe receiver concludes: no error detected.` : `Syndrome S = ${syndromeText} matches column ${state.errorPosition + 1} of H -> error located at position ${state.errorPosition + 1}.\nFlipping that bit: corrected = ${state.corrected.join('')}\nRecovered data bits = ${state.corrected.slice(0, state.k).join('')}`;
  return { paragraphs: ['All the receiver has is r. To check for trouble, it multiplies r by H^T to get a short syndrome — a fingerprint of whatever went wrong (or did not). Then it compares that fingerprint against each column of H.'], blocks: [`r = 1x${state.n}\nH^T = ${state.n}x${state.r}\nr x H^T = 1x${state.r}\n\nS = ${syndromeText}`], result: outcome, hint: 'The errors came from the noise injected in the 3D channel; restart the lab to try a different pattern.' };
}

export const STEP_DEFINITIONS = [
  ['Determine the number of parity bits', renderStep1],
  ['Identify parity and data positions', renderStep2],
  ['Data -> parity contributions & build P', renderStep3],
  ['Build I and complete G = [I|P]', renderStep4],
  ['Now use the real message: c = m x G', renderStep5],
  ['Send it through a noisy channel', renderStep6],
  ['Error-correction capacity', renderStep7],
  ['Build the parity-check matrix H', renderStep8],
  ['Decode: syndrome, locate, correct', renderStep9],
].map(([title, render], index) => ({ number: index + 1, title, render }));

export function renderLessonStep(state, stepNumber) {
  const step = STEP_DEFINITIONS[stepNumber - 1];
  if (!step) throw new Error(`Unknown lesson step: ${stepNumber}`);
  return { ...step, content: step.render(state) };
}

export function getRecap(state, stepNumber) {
  const recaps = [
    `In plain terms: with ${state.k} data bits, ${state.r} parity bits is the smallest number that gives every bit position plus no error its own unique code.`,
    'In plain terms: positions 1, 2, 4, 8... are reserved for parity because each is a clean power of two. Everything else is a data slot.',
    'In plain terms: this step only asks which parity checks would notice each data bit and records those answers as the P matrix.',
    'In plain terms: G is a rulebook. Stack the identity matrix next to P and you have a machine that can encode any message of this length.',
    `In plain terms: XOR together the rows of G for every 1 in your message, and the parity bits ${state.c.slice(state.k).join('')} fall out of that multiplication.`,
    'In plain terms: the channel is unreliable, so some bits may flip. e is a map of which ones did.',
    'In plain terms: because the closest any two valid codewords ever get is 3 flips apart, one flipped bit still points clearly back to the original.',
    'In plain terms: H is built from the same P used in G, just transposed and paired with an identity block.',
    'In plain terms: the syndrome is a fingerprint. If it is all zeros, nothing looks wrong. Otherwise, the matching column of H tells you the bit to flip back.',
  ];
  return recaps[stepNumber - 1];
}