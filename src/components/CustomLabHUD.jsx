import React, { useState, useEffect } from 'react';
import { useLabStore } from '../state/labStore.js';
import { validateGH, deriveH, minDistance, enumerateCodewords } from '../lib/gf2.js';

export default function CustomLabHUD() {
  const mode = useLabStore(s => s.mode);
  const setCustomG = useLabStore(s => s.setCustomG);
  const currentN = useLabStore(s => s.n);
  const currentK = useLabStore(s => s.k);

  // Local state for the editor
  const [n, setN] = useState(currentN);
  const [k, setK] = useState(currentK);
  // P is a k x (n-k) array
  const [P, setP] = useState([]);

  const [liveDMin, setLiveDMin] = useState(0);
  const [liveT, setLiveT] = useState(0);

  // Initialize P when n, k change
  useEffect(() => {
    if (n <= k) { setN(k + 1); return; }
    if (n > 12) { setN(12); return; } // Cap to avoid lag
    if (k < 1) { setK(1); return; }
    
    // Create new P, preserving old values where possible
    const newP = Array.from({ length: k }, (_, r) => 
      Array.from({ length: n - k }, (_, c) => {
         if (P[r] !== undefined && P[r][c] !== undefined) return P[r][c];
         return 0; // default 0
      })
    );
    setP(newP);
  }, [n, k]);

  // Compute live dMin and t whenever P changes
  useEffect(() => {
    if (P.length !== k || P[0]?.length !== (n - k)) return;
    try {
      const G = buildG(P, k, n);
      const codewords = enumerateCodewords(G);
      const { dMin, t } = minDistance(codewords);
      setLiveDMin(dMin);
      setLiveT(t);
    } catch(e) {
      // ignore transient errors
    }
  }, [P, n, k]);

  if (mode !== 'custom') return null;

  function buildG(pMatrix, rows, cols) {
    return Array.from({ length: rows }, (_, r) => {
      const identityPart = Array.from({ length: rows }, (_, c) => r === c ? 1 : 0);
      return [...identityPart, ...pMatrix[r]];
    });
  }

  function handleToggle(r, c) {
    const newP = [...P];
    newP[r] = [...newP[r]];
    newP[r][c] ^= 1;
    setP(newP);
  }

  function handleApply() {
    const G = buildG(P, k, n);
    const H = deriveH(G);
    if (!validateGH(G, H)) {
       alert("Invalid code: G H^T != 0");
       return;
    }
    const success = setCustomG(G);
    if (!success) {
       alert("Failed to apply custom code.");
    }
  }

  return (
    <div style={{
      position: 'absolute',
      top: '15px',
      left: '15px',
      zIndex: 10,
      background: 'rgba(20, 20, 30, 0.95)',
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid #444',
      color: '#fff',
      fontFamily: 'sans-serif',
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
      minWidth: '300px'
    }}>
      <h3 style={{ margin: '0 0 16px 0', color: '#ffb300' }}>Custom Code Editor</h3>
      
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
         <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '4px' }}>n (Total bits)</label>
            <input type="number" value={n} onChange={e => setN(parseInt(e.target.value)||1)} style={{ width: '60px', background: '#000', color: '#fff', border: '1px solid #555', padding: '4px' }} />
         </div>
         <div>
            <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '4px' }}>k (Message bits)</label>
            <input type="number" value={k} onChange={e => setK(parseInt(e.target.value)||1)} style={{ width: '60px', background: '#000', color: '#fff', border: '1px solid #555', padding: '4px' }} />
         </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
         <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Parity Submatrix (P)</div>
         {P.map((row, r) => (
           <div key={r} style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
             {row.map((val, c) => (
               <button 
                 key={c} 
                 onClick={() => handleToggle(r, c)}
                 style={{
                   width: '32px', height: '32px',
                   background: val ? '#ff7043' : '#333',
                   border: 'none', borderRadius: '4px',
                   color: '#fff', cursor: 'pointer',
                   fontWeight: 'bold'
                 }}
               >
                 {val}
               </button>
             ))}
           </div>
         ))}
      </div>

      <div style={{ background: '#111', padding: '8px', borderRadius: '4px', marginBottom: '16px', fontSize: '14px' }}>
         <div><strong>Live Stats:</strong></div>
         <div style={{ color: '#00e676' }}>d_min = {liveDMin}</div>
         <div style={{ color: '#42a5f5' }}>t (correction capability) = {liveT} errors</div>
      </div>

      <button onClick={handleApply} style={{
         width: '100%', padding: '10px',
         background: '#00e676', color: '#000',
         border: 'none', borderRadius: '4px',
         fontWeight: 'bold', cursor: 'pointer'
      }}>
         APPLY TO 3D LAB
      </button>
    </div>
  );
}
