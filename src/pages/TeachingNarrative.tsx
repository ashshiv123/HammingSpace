import React, { useState, useMemo } from 'react';

export interface TeachingNarrativeProps {
  n: number;
  k: number;
  G: number[][];
  H: number[][];
  message: number[];
  codeword: number[];
  receivedVector: number[];
  errorPositions: number[];
  syndromeTable: Map<string, number>;
  toggleChannelBit: (idx: number) => void;
}

function isPow2(x: number): boolean { return x > 0 && (x & (x - 1)) === 0; }
function calcR(m: number): number { let r = 1; while (!(Math.pow(2, r) >= m + r + 1)) r++; return r; }
function buildPositions(n: number) {
  let dCount = 0; const arr: { pos: number, type: 'P' | 'D', dIndex?: number }[] = [];
  for (let pos = 1; pos <= n; pos++) {
    if (isPow2(pos)) arr.push({ pos, type: 'P' });
    else { dCount++; arr.push({ pos, type: 'D', dIndex: dCount }); }
  }
  return arr;
}
function parityGroups(n: number, r: number) {
  const groups: { p: number, exp: number, covered: number[] }[] = [];
  for (let i = 0; i < r; i++) {
    const p = Math.pow(2, i); const covered: number[] = [];
    for (let pos = 1; pos <= n; pos++) { if (pos !== p && (pos & p) !== 0) covered.push(pos); }
    groups.push({ p, exp: i, covered });
  }
  return groups;
}
function bin(num: number, len: number): string { return num.toString(2).padStart(len, '0'); }
function weight(v: number[]): number { return v.reduce((a, b) => a + b, 0); }

export const TeachingNarrative: React.FC<TeachingNarrativeProps> = (props) => {
  const { n, k, G, H, message, codeword, receivedVector, errorPositions, syndromeTable, toggleChannelBit } = props;

  const [currentStep, setCurrentStep] = useState(0);
  const [recapVisible, setRecapVisible] = useState<boolean[]>(Array(9).fill(false));
  const [basisActiveRow, setBasisActiveRow] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);

  // Derived values
  const r = useMemo(() => n - k, [n, k]);
  const P = useMemo(() => G.map(row => row.slice(k)), [G, k]);
  const dMin = 3;
  const t = Math.floor((dMin - 1) / 2);
  const flips = useMemo(() => {
    const f = Array(n).fill(0);
    errorPositions.forEach(idx => { if (idx < n) f[idx] = 1; });
    return f;
  }, [n, errorPositions]);

  // Compute syndrome
  const S = useMemo(() => {
    // r * H^T
    // receivedVector is 1xn. H is rxn. H^T is nxr.
    // So result is 1xr.
    const syn = Array(r).fill(0);
    for (let i = 0; i < r; i++) {
      let sum = 0;
      for (let j = 0; j < n; j++) {
        sum ^= (receivedVector[j] * H[i][j]);
      }
      syn[i] = sum;
    }
    return syn;
  }, [receivedVector, H, r, n]);
  const S_str = S.join('');

  const numErrors = weight(flips);

  const toggleRecap = (step: number) => {
    setRecapVisible(prev => {
      const next = [...prev];
      next[step] = true;
      return next;
    });
  };

  const titles = [
    "Determine the number of parity bits",
    "Identify parity and data positions",
    "Data → parity contributions & build P",
    "Build I and complete G = [I|P]",
    "Now use the real message: c = m × G",
    "Send c through a noisy channel",
    "Error-correction capacity",
    "Build the parity-check matrix H",
    "Decode: syndrome → locate → correct"
  ];

  const renderStep0 = () => {
    const testLines = [];
    let testR = 1;
    let passed = false;
    while (!passed) {
      const left = Math.pow(2, testR);
      const right = k + testR + 1;
      const holds = left >= right;
      testLines.push(`r = ${testR}: 2^${testR} = ${left}, m + r + 1 = ${k} + ${testR} + 1 = ${right}. ${left} ≥ ${right}? ${holds ? 'Yes!' : 'No.'}`);
      if (holds) passed = true;
      else testR++;
    }

    return (
      <div className="space-y-4">
        <p className="text-slate-100">
          Your input <span className="font-mono bg-[#04060e] border border-[#1e293b] rounded px-1.5 py-0.5 text-sm">{message.join('')}</span> has m = {k} data bits.
        </p>
        <p className="text-slate-100">
          We need enough parity bits r so that the receiver can not only detect an error, but pin down which of the n = m+r bit positions is wrong — or confirm there is no error at all. That means r bits of syndrome must be able to represent (m+r+1) distinct outcomes: "no error" plus one outcome per bit position. Hence the condition:
        </p>
        <div className="font-mono bg-[#04060e] border border-[#1e293b] rounded-lg p-3 text-sm whitespace-pre-wrap text-[#5fd4c4]">
          2^r ≥ m + r + 1
        </div>
        <p className="text-slate-100">
          We test increasing values of r until the condition holds:
        </p>
        <div className="font-mono bg-[#04060e] border border-[#1e293b] rounded-lg p-3 text-sm whitespace-pre-wrap text-slate-300">
          {testLines.map((line, idx) => <div key={idx}>{line}</div>)}
        </div>
        <p className="text-slate-100">
          Result: r = {r} parity bits required. Codeword length: n = m + r = {k} + {r} = {n}
        </p>
        {k === 4 && r === 3 && (
          <p className="text-[#94a3b8] italic">This is exactly the classic Hamming(7,4) code.</p>
        )}
      </div>
    );
  };

  const renderStep1 = () => {
    const posArr = buildPositions(n);
    const pList = posArr.filter(x => x.type === 'P').map(x => x.pos).join(', ');
    const dList = posArr.filter(x => x.type === 'D').map(x => x.pos).join(', ');

    return (
      <div className="space-y-4">
        <p className="text-slate-100">
          Parity bits go at positions that are powers of two — 1, 2, 4, 8, ... — because those positions have exactly one bit set in binary, which lets each parity bit "own" a clean, non-overlapping check. Every other position holds a data bit, filled left to right.
        </p>
        
        <div className="flex flex-wrap gap-2 my-4">
          {posArr.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className="text-xs text-[#94a3b8] mb-1">Pos {item.pos}</div>
              <div className={`w-8 h-8 flex items-center justify-center font-mono border border-[#1e293b] rounded ${item.type === 'P' ? 'bg-amber-950/20 text-[#e8a33d]' : 'bg-emerald-950/20 text-[#5fd4c4]'}`}>
                {item.type === 'P' ? `P${item.pos}` : `D${item.dIndex}`}
              </div>
            </div>
          ))}
        </div>

        <p className="text-slate-100">
          Parity positions: {pList}. Data positions: {dList}. We are only labelling roles here — no parity value is calculated yet, and no data has been placed yet.
        </p>
      </div>
    );
  };

  const renderStep2 = () => {
    const groups = parityGroups(n, r);
    const posArr = buildPositions(n);
    const dataPosMap = new Map();
    posArr.filter(x => x.type === 'D').forEach(x => dataPosMap.set(x.pos, `D${x.dIndex}`));
    
    return (
      <div className="space-y-4">
        <p className="text-slate-100">
          Picture each parity bit as an inspector, and each position as a worker. Every inspector is assigned one binary digit to watch, and only checks in on workers whose position number has a 1 in that digit. Write each position number in binary and it's easy to see who reports to whom.
        </p>
        <p className="text-slate-100">
          We're not solving for any values here — just mapping out which data bits are watched by which inspector. No real message is involved yet.
        </p>

        <div className="space-y-4 my-4">
          {groups.map((g, idx) => {
            const binLen = Math.max(r, Math.ceil(Math.log2(n + 1)));
            const coveredList = g.covered.filter(pos => dataPosMap.has(pos)).map(pos => {
               return `Pos ${pos} (${bin(pos, binLen)}) → ${dataPosMap.get(pos)}`;
            });
            const pLabel = `P${g.p}`;
            return (
              <div key={idx} className="border border-[#1e293b] bg-[#04060e] p-3 rounded-lg text-sm text-slate-300">
                <p className="mb-2"><span className="text-[#e8a33d] font-semibold">{pLabel}</span> is responsible for one binary digit — the one worth 2^{g.exp} (that's the digit that makes {g.p}). It watches every position whose binary form has a 1 in that same spot:</p>
                <ul className="list-disc list-inside font-mono text-[#94a3b8] mb-2 pl-2">
                  {coveredList.map((line, i) => <li key={i}>{line}</li>)}
                </ul>
                <p>So <span className="text-[#e8a33d] font-semibold">{pLabel}</span> watches over: <span className="text-[#5fd4c4]">{g.covered.filter(p => dataPosMap.has(p)).map(p => dataPosMap.get(p)).join(', ')}</span></p>
              </div>
            );
          })}
        </div>

        <p className="text-slate-100">
          Turning that into a table: the P matrix<br/>
          One row per data bit, one column per parity bit. A 1 means "this inspector watches this data bit", a 0 means it doesn't.
        </p>

        <div className="flex justify-center my-4">
          <div className="inline-grid gap-1" style={{ gridTemplateColumns: `auto repeat(${r}, 34px)` }}>
            <div className="w-8 h-8"></div>
            {groups.map((g, i) => (
              <div key={i} className="flex items-center justify-center font-mono text-xs text-[#e8a33d]">P{g.p}</div>
            ))}
            {P.map((row, i) => (
              <React.Fragment key={i}>
                <div className="flex items-center justify-center font-mono text-xs text-[#5fd4c4] pr-2">D{i + 1}</div>
                {row.map((val, j) => (
                  <div key={j} className="w-8 h-8 flex items-center justify-center font-mono text-sm border border-[#1e293b] rounded bg-[#080d19] text-slate-300">
                    {val}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>

        <p className="text-slate-100 font-semibold text-[#e8a33d]">
          Important: these are still just yes/no relationships. No actual parity value has been calculated — that only happens once a real message shows up, in Step 5.
        </p>
      </div>
    );
  };

  const renderStep3 = () => {
    return (
      <div className="space-y-4">
        <p className="text-slate-100">
          A matrix's dimensions just mean its shape — how many rows tall and how many columns wide, written as rows×columns. We now glue two pieces side by side to make one matrix, G:
        </p>
        
        <ul className="list-disc list-inside text-slate-100 space-y-2">
          <li><strong>I (identity):</strong> one row and one column per data bit, so every data bit passes straight through unchanged. I [{k}×{k}]</li>
          <li><strong>P:</strong> the contribution table you already built in Step 3 — nothing new to calculate here. P [{k}×{r}]</li>
        </ul>

        <p className="text-slate-100">
          Placed side by side, G keeps the same number of rows (one per data bit) and adds the columns together: {k}+{r} = {n} columns. G [{k}×{n}]
        </p>

        <div className="border border-[#1e293b] bg-[#04060e] p-4 rounded-lg">
          <p className="text-sm text-[#94a3b8] mb-3">Interactive: click a row to see its decomposition into identity + P</p>
          <div className="flex justify-center mb-6">
            <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${n}, 34px)` }}>
              {G.map((row, i) => (
                <React.Fragment key={i}>
                  {row.map((val, j) => {
                    const isData = j < k;
                    const isRowActive = basisActiveRow === i;
                    const classes = `w-8 h-8 flex items-center justify-center font-mono text-sm border border-[#1e293b] rounded cursor-pointer transition-colors ${
                      isRowActive ? 'outline outline-2 outline-[#5fd4c4] bg-[#163127]' : 'bg-[#080d19]'
                    } ${isData ? 'text-[#5fd4c4]' : 'text-[#e8a33d]'}`;
                    
                    return (
                      <div key={j} className={classes} onClick={() => setBasisActiveRow(i)}>
                        {val}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
          
          <div className="text-center font-mono text-sm text-slate-300 p-3 bg-[#080d19] border border-[#1e293b] rounded">
            <span className="text-slate-100">Row {basisActiveRow + 1} of G = </span>
            <span className="text-[#5fd4c4]">[{G[basisActiveRow].slice(0, k).join(' ')}]</span>
            <span className="text-[#94a3b8]"> (from I) joined with </span>
            <span className="text-[#e8a33d]">[{G[basisActiveRow].slice(k).join(' ')}]</span>
            <span className="text-[#94a3b8]"> (from P) = </span>
            <span className="text-slate-100 font-bold">[{G[basisActiveRow].join(' ')}]</span>
          </div>
        </div>
      </div>
    );
  };

  const renderStep4 = () => {
    return (
      <div className="space-y-4">
        <p className="text-slate-100">
          Only now does your actual data <span className="font-mono bg-[#04060e] border border-[#1e293b] rounded px-1.5 py-0.5 text-sm">{message.join('')}</span> enter the picture. For every data bit that is 1, XOR in that row of G; rows where the data bit is 0 are skipped — G itself never changed.
        </p>

        <div className="border border-[#1e293b] bg-[#04060e] p-4 rounded-lg font-mono text-sm text-slate-300 space-y-2">
          {message.map((bit, i) => (
            <div key={i} className={bit === 1 ? 'text-slate-100' : 'text-[#94a3b8] opacity-60'}>
              D{i + 1} = {bit} → row {i + 1} {bit === 1 ? 'contributes' : 'is skipped'} : [{G[i].join(' ')}]
            </div>
          ))}
          <div className="border-t border-[#1e293b] pt-2 mt-2 font-bold text-slate-100 flex items-center">
            <span className="mr-4">XOR the contributing rows together (mod 2) → c</span>
          </div>
        </div>

        <div className="text-center font-mono text-lg bg-[#04060e] border border-[#1e293b] rounded-lg p-4">
          <div className="text-[#94a3b8] text-sm mb-1">c (data | parity)</div>
          <span className="text-[#5fd4c4]">{codeword.slice(0, k).join('')}</span>
          <span className="text-slate-500 mx-2">|</span>
          <span className="text-[#e8a33d]">{codeword.slice(k).join('')}</span>
        </div>

        <p className="text-slate-100">
          The parity bits <span className="font-mono bg-[#04060e] border border-[#1e293b] rounded px-1.5 py-0.5 text-sm text-[#e8a33d]">{codeword.slice(k).join('')}</span> only exist now — they're specific to this message, produced entirely by the multiplication.
        </p>
        
        <p className="text-emerald-400 font-semibold text-sm">
          ** Use the interactive matrix workspace below to step through this column by column.
        </p>
      </div>
    );
  };

  const renderStep5 = () => {
    return (
      <div className="space-y-4">
        <p className="text-slate-100">
          Once c leaves the transmitter it travels through a channel that isn't perfectly reliable — static, interference, anything that can flip a 0 to a 1 or a 1 to a 0 along the way.
        </p>
        <p className="text-slate-100">
          We describe that damage with an error vector e: a string of 0s and 1s the same length as c. Think of it as a transparent overlay laid on top of c — wherever e has a 1, that bit flips; wherever it has a 0, nothing changes.
        </p>
        
        <p className="text-center text-[#94a3b8] text-sm font-semibold">c → click bits to flip → r = c ⊕ e</p>

        <div className="flex justify-center my-6">
          <div className="flex gap-1 flex-wrap justify-center">
            {receivedVector.map((bit, idx) => {
              const isFlipped = flips[idx] === 1;
              return (
                <div 
                  key={idx}
                  onClick={() => toggleChannelBit(idx)}
                  className={`w-10 h-10 flex flex-col items-center justify-center font-mono text-sm border border-[#1e293b] rounded cursor-pointer transition-colors ${
                    isFlipped ? 'bg-red-500 text-white border-red-600' : 'bg-[#080d19] text-slate-300 hover:bg-[#1e293b]'
                  }`}
                  title={`Click to flip bit ${idx + 1}`}
                >
                  <div className="text-[10px] opacity-60 leading-none mb-1">Pos {idx + 1}</div>
                  <div className="leading-none">{bit}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-[#04060e] border border-[#1e293b] rounded-lg p-4 font-mono text-center flex flex-col items-center gap-2">
          <div className="grid grid-cols-[auto_1fr] gap-4 text-left">
            <div className="text-[#94a3b8]">c =</div><div className="tracking-widest text-slate-300">{codeword.join('')}</div>
            <div className="text-[#94a3b8]">e =</div><div className="tracking-widest text-red-400">{flips.join('')}</div>
            <div className="col-span-2 border-t border-[#1e293b] w-full my-1"></div>
            <div className="text-[#94a3b8]">r =</div><div className="tracking-widest font-bold text-white">{receivedVector.join('')} <span className="text-[#94a3b8] font-normal text-xs ml-4">(r = c ⊕ e, bit by bit)</span></div>
          </div>
        </div>

        <p className="text-slate-100">
          That's exactly why XOR is used: XOR with 1 flips a bit, XOR with 0 leaves it alone — so "c ⊕ e" just means "c, with e's flips applied".
        </p>

        <div className="text-[#e8a33d] font-semibold">
          Hamming weight of e (number of injected errors) = {numErrors}
        </div>

        <p className="text-slate-100">
          This weight is known to the simulator because it created e. A real receiver only ever sees r — it has to work out whether, and where, an error happened. That's what Steps 8–9 do.
        </p>
      </div>
    );
  };

  const renderStep6 = () => {
    const isWithinCap = numErrors <= 1;
    return (
      <div className="space-y-4">
        <p className="text-slate-100">
          Weight is the simplest idea here: just a headcount of the 1s in a bit string. <span className="font-mono bg-[#04060e] border border-[#1e293b] rounded px-1 py-0.5 text-xs">0000010</span> has weight 1. <span className="font-mono bg-[#04060e] border border-[#1e293b] rounded px-1 py-0.5 text-xs">0000011</span> has weight 2. No formula, just count.
        </p>
        <p className="text-slate-100">
          Hamming distance between two codewords is how many positions they differ in — like counting typos between two words of the same length.
        </p>
        <p className="text-slate-100">
          Now imagine comparing every pair of valid codewords this code can produce, and finding the smallest distance between any two of them. That smallest gap is called d_min. For this Hamming code, d_min = 3 — no two valid codewords are ever closer than 3 flips apart.
        </p>
        <p className="text-slate-100">
          Why that matters: if one bit flips, the result still sits closer to the original codeword than to any other valid one, so the receiver can always find its way back. Two flips, though, can land exactly between two valid codewords — and then there's no way to be sure which one you meant.
        </p>

        <div className="bg-[#04060e] border border-[#1e293b] rounded-lg p-4 font-mono text-sm space-y-2 text-[#94a3b8]">
          <div className="text-[#5fd4c4]">t = ⌊(d_min - 1) / 2⌋ = ⌊(3-1)/2⌋ = 1</div>
          <div>Guaranteed correction: 1 bit</div>
          <div>Guaranteed detection: d_min - 1 = 2 bits</div>
        </div>

        <div className="grid grid-cols-[80px_1fr] gap-2 font-mono text-sm border-l-2 border-[#1e293b] pl-4">
          <div className="text-emerald-400">0 errors</div><div className="text-slate-300">→ no problem</div>
          <div className="text-emerald-400">1 error</div><div className="text-slate-300">→ detect and correct</div>
          <div className="text-amber-400">2 errors</div><div className="text-slate-300">→ detected, but NOT reliably correctable</div>
          <div className="text-red-400">3+</div><div className="text-slate-300">→ beyond this code's guarantees</div>
        </div>

        <div className={`p-4 rounded-lg border ${isWithinCap ? 'border-emerald-500/60 bg-emerald-950/40 text-emerald-300' : 'border-amber-500/60 bg-amber-950/40 text-amber-300'}`}>
          You currently have {numErrors} errors injected (from Step 6). {isWithinCap ? "That is within this code's correction capacity." : "That exceeds the correction capacity — keep this in mind for Step 9."}
        </div>
      </div>
    );
  };

  const renderStep7 = () => {
    return (
      <div className="space-y-4">
        <p className="text-slate-100">
          H is just P turned on its side (transposed), with an identity block attached next to it: <span className="font-mono bg-[#04060e] border border-[#1e293b] rounded px-1 py-0.5 text-xs text-[#5fd4c4]">H = [Pᵀ | I_&#123;n-k&#125;]</span>. Its whole job is a quick check: multiply any valid codeword by Hᵀ and the answer should always come out all zeros.
        </p>
        <p className="text-slate-100">
          H needs n columns — one per codeword bit, same as G — and one row per parity bit, since each row is one parity check. That gives {r} rows and {n} columns.
        </p>
        
        <div className="text-center font-mono text-sm text-[#e8a33d] my-2">
          H = [ Pᵀ | I_{r} ] ({r}×{n})
        </div>

        <div className="flex justify-center my-4 overflow-x-auto pb-4">
          <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${n}, 34px)` }}>
            {H.map((row, i) => (
              <React.Fragment key={i}>
                {row.map((val, j) => {
                  const isParity = j >= k;
                  return (
                    <div key={j} className={`w-8 h-8 flex items-center justify-center font-mono text-sm border border-[#1e293b] rounded bg-[#080d19] ${isParity ? 'text-[#e8a33d]' : 'text-[#5fd4c4]'}`}>
                      {val}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        <p className="text-slate-100">
          Each column of H works like a fingerprint — exactly what a single-bit error at that position would produce. That's what makes the next step, comparing against those fingerprints, possible.
        </p>
      </div>
    );
  };

  const renderStep8 = () => {
    const isAllZero = S.every(v => v === 0);
    const foundCol = syndromeTable.has(S_str) ? syndromeTable.get(S_str)! : -1;
    let resultBox = null;

    if (isAllZero) {
      resultBox = (
        <div className="p-4 rounded-lg border border-emerald-500/60 bg-emerald-950/40 text-emerald-300">
          Syndrome S = {S_str} — all zero. The receiver concludes: no error detected (r is itself a valid codeword).
        </div>
      );
    } else {
      const corrected = [...receivedVector];
      if (foundCol >= 0) corrected[foundCol] ^= 1;
      const isSuccess = corrected.join('') === codeword.join('');

      if (isSuccess) {
        resultBox = (
          <div className="p-4 rounded-lg border border-emerald-500/60 bg-emerald-950/40 text-emerald-300 space-y-2">
            <div>Syndrome S = {S_str} matches column {foundCol + 1} of H → error located at position {foundCol + 1}.</div>
            <div>Flipping that bit: corrected = {corrected.join('')}. Recovered data bits = {corrected.slice(0, k).join('')}.</div>
            <div className="font-bold">Correction successful — matches the original codeword.</div>
          </div>
        );
      } else {
        resultBox = (
          <div className="p-4 rounded-lg border border-red-500/60 bg-red-950/40 text-red-300 space-y-2">
            <div>Syndrome S = {S_str} points the decoder to position {foundCol + 1}, giving 'corrected' = {corrected.join('')}.</div>
            <div>That does NOT match the original codeword ({codeword.join('')}).</div>
            <div className="font-bold">{numErrors} errors were injected, exceeding this code's correction capacity of 1 — the syndrome cannot reliably distinguish this pattern from a single-bit error elsewhere. This is the known limitation, not a bug.</div>
          </div>
        );
      }
    }

    return (
      <div className="space-y-4">
        <p className="text-slate-100">
          All the receiver has is r. To check for trouble, it multiplies r by Hᵀ to get a short syndrome — think of it as a fingerprint of whatever went wrong (or didn't). Then it compares that fingerprint against each column of H, which stores the fingerprint of every possible single-bit error, looking for a match.
        </p>

        <div className="bg-[#04060e] border border-[#1e293b] rounded-lg p-4 font-mono text-sm text-[#94a3b8] w-fit mx-auto">
          <div>r  = 1×{n}</div>
          <div>Hᵀ = {n}×{r}</div>
          <div>r×Hᵀ = 1×{r} → a {r}-bit syndrome</div>
          <div className="mt-2 pt-2 border-t border-[#1e293b] text-white font-bold">
            S = {S_str}
          </div>
        </div>

        {resultBox}

        <p className="text-slate-100 italic opacity-80">
          Change the flips in Step 6 (use Previous) to try 0, 1, or 2+ errors and see how the outcome changes.
        </p>
      </div>
    );
  };

  const steps = [
    renderStep0,
    renderStep1,
    renderStep2,
    renderStep3,
    renderStep4,
    renderStep5,
    renderStep6,
    renderStep7,
    renderStep8
  ];

  const recaps = [
    `In plain terms: with ${k} data bits, ${r} parity bits is the smallest number that gives every bit position (plus "no error") its own unique code. So the codeword ends up ${n} bits long.`,
    `In plain terms: positions 1, 2, 4, 8... are reserved for parity because each is a clean power of two. Everything else is a data slot — but we haven't placed any actual bits yet, just labelled the roles.`,
    `In plain terms: this step never touches your real message. It only asks "if this data bit were 1, which parity checks would notice?" — and records those yes/no answers as the P matrix.`,
    `In plain terms: G is a rulebook, not a calculation on your message. Stack the identity matrix next to P and you have a machine that can encode any message of this length, built before your data was ever used.`,
    `In plain terms: this is the first time your real data is used. XOR together the rows of G for every 1 in your message, and the parity bits ${codeword.slice(k).join('')} fall out of that multiplication.`,
    `In plain terms: the channel is unreliable, so some bits may flip. e is just a map of which ones did. The received vector r = c ⊕ e is all the receiver ever actually sees.`,
    `In plain terms: weight = how many 1s are in a string. Distance = how many positions two codewords differ in. Because the closest any two valid codewords ever get is 3 flips apart, one flipped bit still points clearly back to the original — but two flips can get lost between two valid answers.`,
    `In plain terms: H is built from the same P used in G, just transposed and paired with an identity block. Its job is to let the receiver check r · Hᵀ without ever seeing the original codeword.`,
    `In plain terms: the syndrome is a fingerprint. If it's all zeros, nothing looks wrong. Otherwise, whichever column of H matches the syndrome tells you the exact bit to flip back.`
  ];

  const goNext = () => setCurrentStep(p => Math.min(steps.length - 1, p + 1));
  const goPrev = () => setCurrentStep(p => Math.max(0, p - 1));
  const reset = () => {
    setCurrentStep(0);
    setRecapVisible(Array(9).fill(false));
  };

  return (
    <div className="bg-[#080d19] border border-[#1e293b] rounded-xl overflow-hidden mb-8 shadow-xl">
      <div className="flex items-center justify-between p-4 bg-[#0a1122] border-b border-[#1e293b]">
        <div className="flex items-center gap-4">
          <h2 className="text-slate-100 font-bold text-lg">Interactive Narrative</h2>
          <div className="text-[#94a3b8] text-sm">Step {currentStep + 1} of 9</div>
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-slate-400 hover:text-slate-200"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {isExpanded && (
        <>
          <div className="w-full bg-[#1e293b] h-[5px]">
            <div 
              className="bg-[#5fd4c4] h-full transition-all duration-300 ease-out"
              style={{ width: \`\${((currentStep + 1) / 9) * 100}%\` }}
            ></div>
          </div>

          <div className="p-6">
            <h3 className="text-xl font-semibold text-[#5fd4c4] mb-6 border-b border-[#1e293b] pb-2">
              Step {currentStep + 1}: {titles[currentStep]}
            </h3>

            <div className="min-h-[250px]">
              {steps[currentStep]()}
            </div>

            <div className="mt-8 border-t border-[#1e293b] pt-6">
              <div className="flex flex-col gap-4">
                {!recapVisible[currentStep] ? (
                  <div className="flex items-center gap-4 bg-[#04060e] p-4 rounded-lg border border-[#1e293b]">
                    <div className="text-slate-300 text-sm">Did you understand this step?</div>
                    <button 
                      onClick={() => toggleRecap(currentStep)}
                      className="text-xs px-3 py-1.5 rounded bg-transparent border border-[#1e293b] text-slate-300 hover:bg-[#1e293b] transition-colors"
                    >
                      No, explain again
                    </button>
                  </div>
                ) : (
                  <div className="bg-[#1e293b]/40 border-l-4 border-[#e8a33d] p-4 rounded-r-lg text-slate-200 italic">
                    {recaps[currentStep]}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-8">
              <button 
                onClick={reset}
                className="text-sm px-4 py-2 rounded bg-transparent border border-[#1e293b] text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-colors"
              >
                Start over
              </button>
              
              <div className="flex gap-3">
                <button 
                  onClick={goPrev}
                  disabled={currentStep === 0}
                  className="text-sm px-4 py-2 rounded bg-transparent border border-[#1e293b] text-slate-300 hover:bg-[#1e293b] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ← Previous
                </button>
                <button 
                  onClick={goNext}
                  disabled={currentStep === steps.length - 1}
                  className="text-sm px-6 py-2 rounded bg-[#5fd4c4] text-[#08131b] font-semibold hover:bg-[#4bc2b2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Continue →
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TeachingNarrative;
