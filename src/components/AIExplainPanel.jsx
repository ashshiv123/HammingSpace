import React, { useState } from 'react';
import { useLabStore } from '../state/labStore.js';

export default function AIExplainPanel() {
  const currentStage = useLabStore(s => s.currentStage);
  const m = useLabStore(s => s.m);
  const c = useLabStore(s => s.c);
  const e = useLabStore(s => s.e);
  const S = useLabStore(s => s.S);
  const t = useLabStore(s => s.t);
  const errorPosition = useLabStore(s => s.errorPosition);
  const correctable = useLabStore(s => s.correctable);
  const verdict = useLabStore(s => s.verdict);
  
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState('');

  // Only show when the cycle is done
  if (currentStage !== 'decoded' && currentStage !== 'corrected') {
    return null;
  }

  const generateFallback = () => {
    const errorWeight = e.reduce((a, b) => a + b, 0);
    const mStr = m.join('');
    const cStr = c.join('');
    const sStr = S.join('');
    
    let text = `The original message [${mStr}] was encoded to codeword [${cStr}]. `;
    
    if (errorWeight === 0) {
      text += `During transmission, no errors were introduced. The receiver calculated the syndrome S=[${sStr}]. Since S=000, the system correctly accepted the packet as clean.`;
    } else {
      text += `During transmission, ${errorWeight} error(s) were introduced. The receiver calculated the syndrome S=[${sStr}]. `;
      if (errorWeight <= t) {
         text += `This syndrome uniquely matched column ${errorPosition} of the parity check matrix H. Because the number of errors (${errorWeight}) was within the guaranteed limit t=${t}, the system successfully flipped the bit back, recovering the exact original message.`;
      } else {
         text += `However, because the number of errors (${errorWeight}) exceeded the guaranteed limit t=${t}, the system's bounded distance decoder was overwhelmed. The syndrome S=[${sStr}] falsely matched a different column. The system applied a correction, but it was a MISCORRECTION, landing on a completely different valid codeword.`;
      }
    }
    return text;
  };

  const handleExplain = async () => {
    setLoading(true);
    setExplanation('');
    try {
      // Send fully-computed state to serverless function
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ m, c, e, S, t, errorPosition, correctable, verdict })
      });
      
      if (!res.ok) throw new Error('API failed');
      const data = await res.json();
      setExplanation(data.explanation || generateFallback());
    } catch (err) {
      // Graceful fallback to canned template if backend/API key is missing
      setExplanation(generateFallback());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'absolute', bottom: '15px', right: '15px', zIndex: 9,
      background: 'rgba(30, 40, 50, 0.95)', border: '1px solid #1e88e5',
      padding: '16px', borderRadius: '8px', color: '#fff',
      fontFamily: 'sans-serif', width: '300px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
    }}>
      <h4 style={{ margin: '0 0 12px 0', color: '#81d4fa' }}>AI Explanation</h4>
      
      {!explanation && !loading && (
        <button onClick={handleExplain} style={{
          background: '#00e676', color: '#000', border: 'none', padding: '8px 12px',
          borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%'
        }}>
          Explain Outcome
        </button>
      )}

      {loading && <div style={{ color: '#888', fontStyle: 'italic' }}>Analyzing pipeline...</div>}

      {explanation && (
        <div style={{ fontSize: '13px', lineHeight: '1.4', color: '#eee' }}>
          {explanation}
        </div>
      )}
    </div>
  );
}
