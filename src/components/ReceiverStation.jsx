import React, { useState, useEffect } from 'react';
import { Text, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useLabStore } from '../state/labStore.js';

const FLOOR_COLOR = '#cfd8dc';
const WALL_COLOR = '#78909c';
const ACCENT_COLOR = '#42a5f5';
const LABEL_COLOR = '#1a237e';
const H_NODE_COOL = '#81d4fa';
const H_NODE_DIM = '#0277bd';

export default function ReceiverStation() {
  const currentStage = useLabStore((s) => s.currentStage);
  const r = useLabStore((s) => s.r);
  const H = useLabStore((s) => s.H);
  const S_store = useLabStore((s) => s.S);
  const correctable = useLabStore((s) => s.correctable);
  const errorPosition = useLabStore((s) => s.errorPosition);
  const decodeStore = useLabStore((s) => s.decode);
  const correctErrorStore = useLabStore((s) => s.correctError);
  const beyondGuaranteedCorrection = useLabStore((s) => s.beyondGuaranteedCorrection);
  const corrected = useLabStore((s) => s.corrected);

  const [rxState, setRxState] = useState('idle'); // idle, scanning, sweeping, matched, correcting, done
  const [scanRow, setScanRow] = useState(-1);
  const [sweepCol, setSweepCol] = useState(-1);

  // Sync state if lab resets
  useEffect(() => {
    if (currentStage === 'compose' || currentStage === 'encoded' || currentStage === 'in-flight') {
      setRxState('idle');
      setScanRow(-1);
      setSweepCol(-1);
    }
  }, [currentStage]);

  const handleDecode = () => {
    if (rxState !== 'idle') return;
    decodeStore();
    setRxState('scanning');
    
    setTimeout(() => setScanRow(0), 100);
    setTimeout(() => setScanRow(1), 700);
    setTimeout(() => setScanRow(2), 1300);
    
    setTimeout(() => {
      const currentS = useLabStore.getState().S;
      if (currentS.every((b) => b === 0)) {
        setRxState('done');
      } else {
        setRxState('sweeping');
        startSweep();
      }
    }, 2000);
  };

  const startSweep = () => {
    let col = 0;
    setSweepCol(col);
    const sweepInt = setInterval(() => {
      const sNow = useLabStore.getState().S;
      const hNow = useLabStore.getState().H;
      if (hNow[0][col] === sNow[0] && hNow[1][col] === sNow[1] && hNow[2][col] === sNow[2]) {
        clearInterval(sweepInt);
        setTimeout(() => setRxState('matched'), 400);
      } else {
        col++;
        if (col > 6) {
          clearInterval(sweepInt);
          setRxState('matched'); // Fallback
        } else {
          setSweepCol(col);
        }
      }
    }, 400);
  };

  const handleApplyCorrection = () => {
    if (rxState !== 'matched') return;
    correctErrorStore();
    setRxState('correcting');
    setTimeout(() => setRxState('done'), 1000);
  };

  const renderPacket = (vector, isRecovered = false) => {
    return (
      <group>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 4.8, 8]} />
          <meshStandardMaterial color="#555" />
        </mesh>
        <group position={[0.35, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.26, 0.26, 0.12, 16]} />
            <meshStandardMaterial color="#00e676" emissive="#00e676" emissiveIntensity={0.8} />
          </mesh>
        </group>
        {vector.map((val, idx) => {
          const isMsg = idx < 4;
          const nodeX = (idx - 3) * 0.7;
          const isDamaged = !isRecovered && errorPosition === idx + 1 && (rxState === 'matched' || rxState === 'sweeping' || rxState === 'scanning' || rxState === 'idle');
          const isHealed = isRecovered && errorPosition === idx + 1;
          
          let color = val === 1 ? (isMsg ? '#ffd54f' : '#ff7043') : '#37474f';
          let emissive = val === 1 ? (isMsg ? '#ffd54f' : '#ff7043') : '#111';
          
          if (isDamaged && currentStage !== 'received' && S_store.length > 0 && !S_store.every(b=>b===0)) {
              // Wait, damage is only visually flagged AFTER we match, or if it arrived damaged.
              // We'll just let the matching line highlight it, or blink red.
          }
          if (isHealed) {
              color = '#ffffff';
              emissive = '#ffffff';
          }

          // Lift recovered message bits up
          const nodeY = (isRecovered && isMsg) ? 1.0 : 0;

          return (
            <group key={idx} position={[nodeX, nodeY, 0]}>
              <group rotation={isDamaged ? [Math.PI/4, Math.PI/4, 0] : [0,0,0]}>
                <mesh>
                  <sphereGeometry args={[0.22, 20, 20]} />
                  <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={val===1||isHealed ? 0.9 : 0.1} />
                </mesh>
                <Text position={[0, 0.32, 0]} fontSize={0.16} color="#fff" fontWeight="bold">{String(val)}</Text>
              </group>
              {isRecovered && isMsg && (
                 <Text position={[0, -0.32, 0]} fontSize={0.14} color="#00e676" fontWeight="bold">m{idx}</Text>
              )}
            </group>
          );
        })}
      </group>
    );
  };

  const isActiveRender = ['received', 'decoded', 'corrected'].includes(currentStage);
  const vectorToRender = (rxState === 'correcting' || rxState === 'done') ? corrected : r;

  return (
    <group position={[12, 0, 0]}>
      {/* Floor plate */}
      <mesh receiveShadow position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[11, 8]} />
        <meshStandardMaterial color={FLOOR_COLOR} />
      </mesh>

      {/* Zone label */}
      <Text position={[0, 4.0, -1.0]} fontSize={0.48} color={LABEL_COLOR} anchorX="center" fontWeight="bold">
        RECEIVER STATION
      </Text>
      <Text position={[0, 3.5, -1.0]} fontSize={0.18} color="#455a64" anchorX="center">
        Syndrome Diagnostics & Correction
      </Text>

      {/* Received vector display */}
      {isActiveRender && (
        <group position={[-3, 0.75, 0]}>
          {renderPacket(vectorToRender, rxState === 'done')}
          <Text position={[0, -0.7, 0]} fontSize={0.2} color={LABEL_COLOR}>
            {rxState === 'done' ? 'Recovered / Corrected' : 'Received Vector (r)'}
          </Text>
        </group>
      )}

      {/* Parity Check Matrix H rig */}
      <group position={[0, 1.2, -1.5]}>
        <mesh position={[0, 0, -0.2]}>
          <boxGeometry args={[4.8, 2.2, 0.1]} />
          <meshStandardMaterial color="#263238" />
        </mesh>
        <Text position={[0, 1.3, 0]} fontSize={0.25} color={ACCENT_COLOR} fontWeight="bold">
          PARITY CHECK MATRIX (H)
        </Text>
        
        {/* H Columns */}
        {H && H[0] && H[0].map((_, cIdx) => {
          const colX = (cIdx - 3) * 0.55;
          const isSweepingMatch = (rxState === 'sweeping' || rxState === 'matched') && sweepCol === cIdx;
          
          return (
            <group key={cIdx} position={[colX, 0, 0]}>
              {/* Highlight Box */}
              {isSweepingMatch && (
                <mesh position={[0, 0, -0.1]}>
                  <boxGeometry args={[0.45, 1.8, 0.15]} />
                  <meshStandardMaterial color={rxState === 'matched' ? '#00e676' : '#ff9800'} emissive={rxState === 'matched' ? '#00e676' : '#ff9800'} emissiveIntensity={0.4} />
                </mesh>
              )}
              
              {/* Column Label */}
              <Text position={[0, 0.9, 0]} fontSize={0.14} color="#b0bec5">c{cIdx + 1}</Text>
              
              {/* Column Bits */}
              {H.map((row, rIdx) => {
                const isActiveRow = rxState === 'scanning' && scanRow === rIdx;
                const isLit = isActiveRow && row[cIdx] === 1;
                return (
                  <group key={rIdx} position={[0, 0.4 - rIdx * 0.4, 0]}>
                    <mesh>
                      <sphereGeometry args={[0.12, 16, 16]} />
                      <meshStandardMaterial 
                        color={isLit ? H_NODE_COOL : H_NODE_DIM} 
                        emissive={isLit ? H_NODE_COOL : '#000'}
                        emissiveIntensity={isLit ? 0.8 : 0.1}
                      />
                    </mesh>
                    <Text position={[0.2, 0, 0]} fontSize={0.12} color="#fff">{row[cIdx]}</Text>
                  </group>
                );
              })}
            </group>
          );
        })}
      </group>

      {/* Syndrome Console */}
      <group position={[3.5, 1.5, -1.5]}>
        <mesh position={[0, 0, -0.2]}>
          <boxGeometry args={[1.5, 2.2, 0.1]} />
          <meshStandardMaterial color="#37474f" />
        </mesh>
        <Text position={[0, 1.3, 0]} fontSize={0.2} color="#81d4fa" fontWeight="bold">
          SYNDROME (S)
        </Text>
        
        {[0, 1, 2].map((rIdx) => {
          const val = S_store ? S_store[rIdx] : 0;
          const showVal = scanRow >= rIdx || rxState === 'sweeping' || rxState === 'matched' || rxState === 'correcting' || rxState === 'done';
          const lit = showVal && val === 1;
          
          return (
            <group key={rIdx} position={[0, 0.4 - rIdx * 0.4, 0]}>
               <mesh>
                 <sphereGeometry args={[0.15, 16, 16]} />
                 <meshStandardMaterial 
                   color={lit ? '#ff5252' : '#263238'} 
                   emissive={lit ? '#ff5252' : '#000'}
                   emissiveIntensity={lit ? 0.8 : 0.1}
                 />
               </mesh>
               <Text position={[0.4, 0, 0]} fontSize={0.18} color="#fff">{showVal ? val : '-'}</Text>
            </group>
          );
        })}

        {/* Diagnostics Button */}
        {currentStage === 'received' && rxState === 'idle' && (
          <group position={[0, -0.8, 0.1]}>
             <mesh onClick={handleDecode} onPointerOver={()=>document.body.style.cursor='pointer'} onPointerOut={()=>document.body.style.cursor='default'}>
               <boxGeometry args={[1.2, 0.4, 0.1]} />
               <meshStandardMaterial color="#1e88e5" emissive="#1e88e5" emissiveIntensity={0.2} />
             </mesh>
             <Text position={[0, 0, 0.06]} fontSize={0.12} color="#fff" fontWeight="bold">RUN DIAGNOSTICS</Text>
          </group>
        )}
      </group>

      {/* Match Line (Laser) */}
      {rxState === 'matched' && errorPosition !== null && (
         <Line 
           points={[
             [(sweepCol - 3) * 0.55, 1.2, -1.4],
             [-3 + (errorPosition - 1 - 3) * 0.7, 0.75, 0]
           ]} 
           color="#00e676" 
           lineWidth={4} 
         />
      )}

      {/* Apply Correction Button */}
      {rxState === 'matched' && (
        <group position={[-3, -1.5, 0]}>
           <mesh onClick={handleApplyCorrection} onPointerOver={()=>document.body.style.cursor='pointer'} onPointerOut={()=>document.body.style.cursor='default'}>
             <boxGeometry args={[2.0, 0.5, 0.2]} />
             <meshStandardMaterial color="#00e676" emissive="#00e676" emissiveIntensity={0.3} />
           </mesh>
           <Text position={[0, 0, 0.11]} fontSize={0.18} color="#000" fontWeight="bold">APPLY CORRECTION</Text>
        </group>
      )}

      {/* Final States Output */}
      {rxState === 'done' && (
        <group position={[0, 2.8, 1.5]}>
           {S_store.every(b=>b===0) ? (
             <Text fontSize={0.4} color="#00e676" fontWeight="bold">ALL CLEAR: NO ERRORS</Text>
           ) : beyondGuaranteedCorrection ? (
             <group>
               <mesh position={[0,0,-0.1]}><planeGeometry args={[9,1]} /><meshBasicMaterial color="#d50000" /></mesh>
               <Text fontSize={0.35} color="#fff" fontWeight="bold">BEYOND GUARANTEED CORRECTION</Text>
               <Text position={[0,-0.3,0]} fontSize={0.15} color="#ff8a80">Miscorrection detected. Original packet unrecoverable.</Text>
             </group>
           ) : (
             <Text fontSize={0.4} color="#00e676" fontWeight="bold">SUCCESSFULLY CORRECTED</Text>
           )}
        </group>
      )}

      <pointLight position={[0, 4, 2]} intensity={0.6} color="#bbdefb" />
    </group>
  );
}
