import React, { useMemo, useState } from 'react';
import { deriveHammingParams } from '../math/hammingDerivation';

type Props = {
  n: number; k: number; r: number; message: number[]; P: number[][]; G: number[][]; H: number[][];
  codeword: number[]; receivedVector: number[]; errorVector: number[];
  dMin: number; syndromeTable: Map<string, number>; stage: string;
  onOpenSyndrome: () => void;
};

const TITLES = [
  'Determine the number of parity bits', 'Identify parity and data positions',
  'Which data bits contribute to which parity bits?', 'Build I and complete G = [I | P]',
  'Now bring in the real message: c = m × G', 'Send c through a noisy channel',
  'Error-correction capacity', 'Build the parity-check matrix H',
  'Decode: syndrome → locate → correct',
];
const bits = (v: number[]) => v.join('');
const weight = (v: number[]) => v.reduce((sum, bit) => sum + bit, 0);
const mul = (v: number[], M: number[][]) => Array.from({ length: M[0]?.length ?? 0 }, (_, col) =>
  v.reduce((sum, bit, row) => sum ^ (bit & (M[row]?.[col] ?? 0)), 0));

export const CalculationNarrative: React.FC<Props> = (props) => {
  const { n, k, r, message, P, G, H, codeword, receivedVector, errorVector,
    dMin, syndromeTable, stage, onOpenSyndrome } = props;
  const [step, setStep] = useState(0);
  const [understood, setUnderstood] = useState(false);
  const derivation = useMemo(() => deriveHammingParams(k), [k]);
  const calculatedCodeword = useMemo(() => mul(message, G), [message, G]);
  const c = codeword.length === n ? codeword : calculatedCodeword;
  const activeErrors = stage === 'idle' || stage === 'encoding' ? new Array(n).fill(0) :
    errorVector.length === n ? errorVector : c.map((bit, i) => bit ^ (receivedVector[i] ?? bit));
  const rx = c.map((bit, i) => bit ^ activeErrors[i]);
  const S = mul(rx, H);
  const syndromeKey = bits(S);
  const located = syndromeTable.get(syndromeKey) ?? -1;
  const corrected = rx.map((bit, i) => located === i ? bit ^ 1 : bit);
  const withinCapacity = weight(activeErrors) <= Math.floor((dMin - 1) / 2);
  const minimumPair = useMemo(() => {
    let best = new Array(n).fill(0);
    for (let mask = 1; mask < 2 ** k; mask++) {
      const candidate = mul(Array.from({ length: k }, (_, i) => (mask >> i) & 1), G);
      if (weight(candidate) < weight(best) || weight(best) === 0) best = candidate;
    }
    return [new Array(n).fill(0), best];
  }, [G, k, n]);
  const paritySlots = derivation.parityPositions;
  const dataPositions = derivation.messagePositions;

  const matrix = (M: number[][], label: string) => <div className="mt-3 overflow-x-auto rounded-xl border border-slate-700 bg-slate-950/70 p-3">
    <div className="mb-2 font-mono text-xs text-cyan-300">{label} ({M.length} × {M[0]?.length ?? 0})</div>
    <div className="space-y-1">{M.map((row, i) => <div key={i} className="flex gap-1">{row.map((bit, j) => <span key={j} className={`flex h-7 min-w-7 items-center justify-center rounded border px-1 font-mono text-xs ${bit ? 'border-cyan-700 bg-cyan-950/50 text-cyan-200' : 'border-slate-800 bg-slate-900 text-slate-500'}`}>{bit}</span>)}</div>)}</div>
  </div>;
  const vector = (label: string, v: number[]) => <div className="mt-3 rounded-xl border border-slate-700 bg-slate-950/70 p-3 font-mono text-sm"><span className="text-slate-400">{label} = </span><span className="text-cyan-200">{bits(v)}</span></div>;

  const lesson = () => {
    switch (step) {
      case 0: {
        const checks = Array.from({ length: r }, (_, i) => i + 1).map(candidate => ({ candidate, power: 2 ** candidate, required: k + candidate + 1, ok: 2 ** candidate >= k + candidate + 1 }));
        return <><p>Your current message <code className="text-cyan-200">{bits(message)}</code> has <b>m = {k}</b> data bits.</p>
          <p className="text-slate-300">We need enough parity bits <code>r</code> so that the receiver can not only detect an error, but pin down <i>which</i> of the n = m+r bit positions is wrong — or confirm there is no error at all. That means r bits of syndrome must be able to represent (m+r+1) distinct outcomes: “no error” plus one outcome per bit position. Hence the condition:</p>
          <Formula>2^r ≥ m + r + 1</Formula><p>We test increasing values of r until the condition holds:</p>
          <Formula>{checks.map(x => `r = ${x.candidate}\n2^${x.candidate} = ${x.power}\n${x.power} ≥ ${k}+${x.candidate}+1 = ${x.required} ?  ${x.ok ? 'YES ✓' : 'no ✗'}`).join('\n\n')}</Formula>
          <Outcome>r = {r} parity bits required<br />Codeword length: n = m + r = {k} + {r} = {n}</Outcome></>;
      }
      case 1:
        return <><p>Parity bits go at positions that are powers of two — <code>1, 2, 4, 8, ...</code> — because those positions have exactly one bit set in binary, which lets each parity bit “own” a clean, non-overlapping check. Every other position holds a data bit, filled left to right.</p>
          <div className="mt-4 overflow-x-auto"><div className="mb-1 text-xs text-slate-400">Position → role (n = {n})</div><div className="flex flex-wrap gap-2">{derivation.positions.map(pos => <div key={pos.position} className={`rounded-lg border px-3 py-2 font-mono text-sm ${pos.isParity ? 'border-amber-700 text-amber-300' : 'border-cyan-800 text-cyan-200'}`}><span className="block text-[10px] text-slate-500">{pos.position}</span>{pos.isParity ? `P${pos.parityIndex}` : `D${pos.messageIndex}`}</div>)}</div></div>
          <p className="mt-4 text-slate-300">Parity positions: {paritySlots.join(', ')}. Data positions: {dataPositions.join(', ')}. We are only labelling roles here — no parity value is calculated yet, and no data has been placed yet.</p></>;
      case 2:
        return <><p className="text-slate-300">Picture each parity bit as an inspector, and each position as a worker. Every inspector is assigned one binary digit to watch, and only checks in on workers whose position number has a 1 in that digit. Write each position number in binary and it's easy to see who reports to whom.</p>
          <p className="text-slate-300">We're not solving for any values here — just mapping out which data bits are watched by which inspector. No real message is involved yet.</p>
          {derivation.parityEquations.map(eq => <Formula key={eq.parityIndex}>P{eq.parityPosition} is responsible for one binary digit — the one worth 2^{eq.parityIndex - 1} (that's the digit that makes {eq.parityPosition}). It watches every position whose binary form has a 1 in that same spot:{'\n'}{[eq.parityPosition, ...eq.positions.slice(1)].map(pos => `${pos} = ${pos.toString(2).padStart(r, '0')}`).join('\n')}{'\n\n'}So P{eq.parityPosition} watches over: {eq.messageIndices.length ? eq.messageIndices.map(i => `D${i}`).join(', ') : 'no data positions'}</Formula>)}
          <h3 className="mt-5 font-semibold">Turning that into a table: the P matrix</h3><p className="text-slate-300">One row per data bit, one column per parity bit. A <b>1</b> means “this inspector watches this data bit”, a <b>0</b> means it doesn't.</p>{matrix(P, 'P')}
          <Outcome warn>Important: these are still just yes/no relationships. No actual parity value has been calculated — that only happens once a real message shows up, in Step 5.</Outcome></>;
      case 3:
        return <><p className="text-slate-300">A matrix's <b>dimensions</b> just mean its shape — how many rows tall and how many columns wide, written as rows×columns. We now glue two pieces side by side to make one matrix, G:</p>
          <p><b>I</b> (identity): one row and one column per data bit, so every data bit passes straight through unchanged. <code>I</code> is {k}×{k}.</p>
          <p><b>P</b>: the contribution table you already built in Step 3 — nothing new to calculate here. <code>P</code> is {k}×{r}.</p>
          <p>Placed side by side, G keeps the same number of rows (one per data bit) and adds the columns together: {k}+{r} = {n} columns. <code>G</code> is {k}×{n}.</p>
          <p className="text-slate-300">Each row of G is that data bit's identity slot glued to its P row from Step 3:</p>
          <Formula>{G.map((row, i) => `Row ${i + 1}: ${row.slice(0, k).join('')} (from I) joined with ${P[i].join('')} (from P) = ${row.join('')}`).join('\n')}</Formula>
          {matrix(G, 'G = [ I | P ]')}</>;
      case 4: {
        const rows = message.map((bit, i) => `D${i + 1}=${bit} → row ${i + 1} ${bit ? 'contributes' : 'is skipped'}`).join('\n');
        const contributors = message.flatMap((bit, i) => bit ? [G[i]] : []);
        const parity = c.slice(k);
        return <><p className="text-slate-300">Only now does your actual data <code>{bits(message)}</code> enter the picture. For every data bit that is 1, XOR in that row of G; rows where the data bit is 0 are skipped — G itself never changed.</p>
          <Formula>{rows}{'\n\n'}XOR the contributing rows together (mod 2) → c{contributors.length ? `\n${contributors.map(bits).join('\n⊕ ')}\n= ${bits(c)}` : `\n(no rows contribute)\n= ${bits(c)}`}</Formula>
          <Outcome>c (data | parity) = {bits(c.slice(0, k))} | {bits(parity)}<br />The parity bits {bits(parity)} only exist now — they're specific to this message, produced entirely by the multiplication.</Outcome>
          <p className="mt-3 text-sm text-slate-400">The source lesson also shows the equivalent interleaved Hamming layout. This workspace keeps its existing systematic [data | parity] ordering; both use the same live P relationships.</p></>;
      }
      case 5:
        return <><p className="text-slate-300">Once c leaves the transmitter it travels through a channel that isn't perfectly reliable — static, interference, anything that can flip a 0 to a 1 or a 1 to a 0 along the way.</p>
          <p className="text-slate-300">We describe that damage with an <b>error vector e</b>: a string of 0s and 1s the same length as c. Think of it as a transparent overlay laid on top of c — wherever e has a <b>1</b>, that bit flips; wherever it has a <b>0</b>, nothing changes.</p>
          <button onClick={onOpenSyndrome} className="mt-3 rounded-lg border border-amber-700 px-3 py-2 text-sm text-amber-200 hover:bg-amber-950/50">Open the existing Syndrome workspace to click bits in the channel</button>
          <Formula>c = {bits(c)}{'\n'}e = {bits(activeErrors)}{'\n'}{'-'.repeat(Math.min(n, 48))}{'\n'}r = {bits(rx)}   (r = c ⊕ e, bit by bit)</Formula>
          <p className="text-sm text-slate-300">That's exactly why XOR is used: XOR with 1 flips a bit, XOR with 0 leaves it alone — so “c ⊕ e” just means “c, with e's flips applied”.</p>
          <Outcome>Hamming weight of e (number of injected errors) = {weight(activeErrors)}</Outcome>
          <p className="mt-3 text-sm text-slate-400">This weight is known to the simulator because it created e. A real receiver only ever sees r — it has to work out whether, and where, an error happened. That's what Steps 8–9 do.</p></>;
      case 6: {
        const examples = minimumPair;
        const diff = examples[0].reduce((count, bit, i) => count + (bit !== examples[1][i] ? 1 : 0), 0);
        const t = Math.floor((dMin - 1) / 2);
        return <><p className="text-slate-300"><b>Weight</b> is the simplest idea here: just a headcount of the 1s in a bit string. <code>{'0'.repeat(Math.max(0, n - 1))}1</code> has weight 1. <code>{'0'.repeat(Math.max(0, n - 2))}11</code> has weight 2. No formula, just count.</p>
          <p className="text-slate-300"><b>Hamming distance</b> between two codewords is how many positions they differ in — like counting typos between two words of the same length:</p>
          <Formula>A = {bits(examples[0])}{'\n'}B = {bits(examples[1])}{'\n'}differ at {diff} position{diff === 1 ? '' : 's'}{'\n\n'}distance(A, B) = {diff}</Formula>
          <p className="text-slate-300">Now imagine comparing every pair of valid codewords this code can produce, and finding the smallest distance between any two of them. That smallest gap is called <b>d<sub>min</sub></b>. For the currently selected code, d<sub>min</sub> = {dMin} — no two valid codewords are ever closer than {dMin} flips apart.</p>
          <p className="text-slate-300">Why that matters: if up to {t} bit{t === 1 ? '' : 's'} flip, the result still sits closer to the original codeword than to any other valid one, so the receiver can always find its way back. More flips can land between valid codewords — and then there's no way to be sure which one you meant.</p>
          <Formula>t = ⌊(d_min - 1) / 2⌋ = ⌊({dMin}-1)/2⌋ = {t}</Formula>
          <Outcome>Guaranteed correction: {t} bit{t === 1 ? '' : 's'}<br />Guaranteed detection: d_min - 1 = {dMin - 1} bits<br /><br />0 errors → no problem<br />{t ? `1–${t} error${t === 1 ? '' : 's'} → detect and correct` : '1 error → outside guaranteed correction'}<br />{dMin - 1 > t ? `${t + 1}–${dMin - 1} errors → detectable, but NOT reliably correctable` : ''}<br />{dMin} or more → beyond this code's guarantees</Outcome>
          <p className="mt-3 text-sm text-slate-400">You currently have {weight(activeErrors)} error{weight(activeErrors) === 1 ? '' : 's'} injected (from Step 6). {withinCapacity ? 'That is within this code’s correction capacity.' : 'That exceeds the correction capacity — keep this in mind for Step 9.'}</p></>;
      }
      case 7:
        return <><p className="text-slate-300">H is just P turned on its side (transposed), with an identity block attached next to it: <code>H = [P<sup>T</sup> | I<sub>n-k</sub>]</code>. Its whole job is a quick check: multiply any valid codeword by H<sup>T</sup> and the answer should always come out all zeros.</p>
          <p className="text-slate-300">H needs n columns — one per codeword bit, same as G — and one row per parity bit, since each row is one parity check. That gives {r} rows and {n} columns.</p>{matrix(H, 'H = [ Pᵀ | I ]')}
          <p className="mt-3 text-sm text-slate-300">Each column of H works like a fingerprint — exactly what a single-bit error at that position would produce. That's what makes the next step, comparing against those fingerprints, possible.</p></>;
      default: {
        let result: React.ReactNode;
        if (S.every(bit => bit === 0)) result = <Outcome>Syndrome S = {bits(S)} — all zero.<br />The receiver concludes: no error detected (r is itself a valid codeword).</Outcome>;
        else if (located >= 0 && bits(corrected) === bits(c)) result = <Outcome>Syndrome S = {bits(S)} matches column {located + 1} of H → error located at position {located + 1}.<br />Flipping that bit: corrected = {bits(corrected)}<br />Recovered data bits = {bits(corrected.slice(0, k))}<br />Correction successful — matches the original codeword.</Outcome>;
        else result = <Outcome bad>Syndrome S = {bits(S)} {located >= 0 ? `points the decoder to position ${located + 1}, giving “corrected” = ${bits(corrected)}.` : 'does not match a single-bit error fingerprint in H.'}<br />That does NOT match the original codeword ({bits(c)}).<br />{weight(activeErrors)} errors were injected, exceeding this code's correction capacity of {Math.floor((dMin - 1) / 2)} — the syndrome cannot reliably distinguish this pattern from a single-bit error elsewhere. This is the known limitation, not a bug.</Outcome>;
        return <><p className="text-slate-300">All the receiver has is r. To check for trouble, it multiplies r by H<sup>T</sup> to get a short <b>syndrome</b> — think of it as a fingerprint of whatever went wrong (or didn't). Then it compares that fingerprint against each column of H, which stores the fingerprint of every possible single-bit error, looking for a match.</p>
          <Formula>r  = 1×{n}{'\n'}H^T = {n}×{r}{'\n'}r×H^T = 1×{r}  → a {r}-bit syndrome</Formula><Formula>S = {bits(S)}</Formula>{result}
          <p className="mt-3 text-sm text-slate-400">Change the flips in the existing Syndrome workspace to try 0, 1, or 2+ errors and see how the outcome changes.</p></>;
      }
    }
  };

  const go = (next: number) => { setStep(next); setUnderstood(false); };
  return <section className="rounded-2xl border border-slate-700 bg-slate-900/90 p-4 sm:p-6 shadow-xl">
    <div className="mb-4"><div className="h-1.5 overflow-hidden rounded bg-slate-800"><div className="h-full bg-cyan-400 transition-all" style={{ width: `${((step + 1) / TITLES.length) * 100}%` }} /></div><div className="mt-2 text-xs text-slate-400">Step {step + 1} / 9 — {TITLES[step]}</div></div>
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 sm:p-5 leading-relaxed"><h2 className="mb-3 text-lg font-semibold"><span className="mr-2 font-mono text-cyan-300">Step {step + 1}</span>{TITLES[step]}</h2>{lesson()}
      <div className="mt-6 border-t border-dashed border-slate-700 pt-4"><p className="mb-3 text-sm text-slate-400">Did you understand this step?</p><div className="flex flex-wrap gap-2"><button disabled={step === 8} onClick={() => { setUnderstood(true); if (step < 8) go(step + 1); }} className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-40">Yes, continue →</button><button onClick={() => setUnderstood(v => !v)} className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200">No, explain again</button></div>{understood && <div className="mt-3 rounded-lg border border-amber-700 bg-amber-950/30 p-3 text-sm text-slate-200"><b className="text-amber-300">In plain terms: </b>{recaps[step]({ k, r, n, parity: bits(c.slice(k)), data: bits(message) })}</div>}</div>
    </div>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-2"><button disabled={step === 0} onClick={() => go(step - 1)} className="rounded-lg border border-slate-700 px-4 py-2 text-sm disabled:opacity-40">← Previous</button><button onClick={() => go(0)} className="rounded-lg border border-slate-700 px-4 py-2 text-sm">Start over</button><button disabled={step === 8} onClick={() => go(step + 1)} className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-40">{step === 8 ? 'Finished' : 'Continue →'}</button></div>
  </section>;
};

const recaps = [
  ({ k, r, n }: any) => `With ${k} data bits, ${r} parity bits is the smallest number that gives every bit position (plus “no error”) its own unique code. So the codeword ends up ${n} bits long.`,
  ({ }: any) => 'Positions 1, 2, 4, 8... are reserved for parity because each is a clean power of two. Everything else is a data slot — but we have only labelled roles, not placed actual bits.',
  () => 'This step never touches your real message. It only asks “if this data bit were 1, which parity checks would notice?” — and records those yes/no answers as the P matrix.',
  () => 'G is a rulebook, not a calculation on your message. Stack the identity matrix next to P and you have a machine that can encode any message of this length, built before your data was ever used.',
  ({ parity, data }: any) => `This is the first time your real data (${data}) is used. XOR together the rows of G for every 1 in your message, and the parity bits ${parity} fall out of that multiplication.`,
  () => 'The channel is unreliable, so some bits may flip. e is just a map of which ones did. The received vector r = c ⊕ e is all the receiver ever actually sees.',
  () => 'Weight is how many 1s are in a string. Distance is how many positions two codewords differ in. Minimum distance tells us how many errors are guaranteed correctable.',
  () => 'H is built from the same P used in G, just transposed and paired with an identity block. Its job is to let the receiver check r · Hᵀ without ever seeing the original codeword.',
  () => 'The syndrome is a fingerprint. If it is all zeros, nothing looks wrong. Otherwise, whichever column of H matches the syndrome tells you the bit to flip back.',
];

const Formula: React.FC<{ children: React.ReactNode }> = ({ children }) => <pre className="my-3 overflow-x-auto whitespace-pre-wrap rounded-lg border border-slate-700 bg-slate-950 p-3 font-mono text-sm text-slate-200">{children}</pre>;
const Outcome: React.FC<{ children: React.ReactNode; warn?: boolean; bad?: boolean }> = ({ children, warn, bad }) => <div className={`my-3 rounded-lg border p-3 font-mono text-sm ${bad ? 'border-red-700 bg-red-950/30 text-red-200' : warn ? 'border-amber-700 bg-amber-950/30 text-amber-200' : 'border-emerald-700 bg-emerald-950/30 text-emerald-200'}`}>{children}</div>;
