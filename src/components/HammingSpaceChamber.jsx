import React, { useMemo } from 'react';
import { Text, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useLabStore } from '../state/labStore.js';

const CHAMBER_COLOR = '#311b92';
const TEXT_COLOR = '#b39ddb';
const POINT_COLOR = '#fff';
const HALO_COLOR = '#7c4dff';

// Map an n-bit hypercube vector to a 3D coordinate using fixed basis vectors.
function getPos(vec, n) {
  let x = 0, y = 0, z = 0;
  for (let i = 0; i < n; i++) {
    if (vec[i] === 1) {
      const angle = i * (2 * Math.PI / n);
      x += 2.8 * Math.cos(angle);
      y += 2.8 * Math.sin(angle);
      z += (i % 2 === 0 ? 1.5 : -1.5);
    }
  }
  return new THREE.Vector3(x, y, z);
}

export default function HammingSpaceChamber() {
  const n = useLabStore(s => s.n);
  const k = useLabStore(s => s.k);
  const t = useLabStore(s => s.t);
  const dMin = useLabStore(s => s.dMin);
  const codewords = useLabStore(s => s._codewords);
  const c = useLabStore(s => s.c);
  const r = useLabStore(s => s.r);
  const corrected = useLabStore(s => s.corrected);
  const e = useLabStore(s => s.e);
  
  const currentStage = useLabStore(s => s.currentStage);

  // Compute positions
  const cwPositions = useMemo(() => {
    return codewords.map(cw => ({
      cw,
      pos: getPos(cw, n),
      key: cw.join('')
    }));
  }, [codewords, n]);

  const cPos = getPos(c, n);
  const rPos = getPos(r, n);
  const correctedPos = corrected ? getPos(corrected, n) : null;
  const isCorrupted = e && e.some(b => b === 1);
  const showR = ['in-flight', 'received', 'decoded', 'corrected'].includes(currentStage) && isCorrupted;

  return (
    <group position={[0, 0, -16]}>
      {/* Floor plate */}
      <mesh receiveShadow position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color={CHAMBER_COLOR} transparent opacity={0.5} />
      </mesh>

      <Text position={[0, 6, -3]} fontSize={0.6} color={TEXT_COLOR} fontWeight="bold" anchorX="center">
        HAMMING SPACE CHAMBER
      </Text>
      <Text position={[0, 5.4, -3]} fontSize={0.2} color="#9575cd" anchorX="center">
        {`(n=${n}, k=${k}) • d_min = ${dMin} • t = ${t}`}
      </Text>

      <group position={[0, 3, 0]}>
        {/* Render all valid codewords and their halos */}
        {cwPositions.map((pt) => {
           // We scale halo by t. 
           // In this embedding, a 1-bit flip is length of basis vector (~3 units).
           const haloRadius = t * 2.8; 
           const isTransmitted = pt.key === c.join('');
           return (
             <group key={pt.key} position={pt.pos}>
                {/* Node */}
                <mesh>
                  <sphereGeometry args={[0.2, 16, 16]} />
                  <meshStandardMaterial color={isTransmitted ? '#00e676' : POINT_COLOR} emissive={isTransmitted ? '#00e676' : '#222'} />
                </mesh>
                {/* Correction Halo (Radius t) */}
                <mesh>
                  <sphereGeometry args={[haloRadius, 24, 24]} />
                  <meshStandardMaterial color={isTransmitted ? '#00e676' : HALO_COLOR} transparent opacity={0.06} depthWrite={false} side={THREE.DoubleSide} />
                </mesh>
                {/* Label */}
                <Text position={[0, 0.4, 0]} fontSize={0.15} color="#eee" anchorX="center">{pt.key}</Text>
             </group>
           )
        })}

        {/* Render r if corrupted and travelling/received */}
        {showR && (
          <group position={rPos}>
             <mesh>
               <sphereGeometry args={[0.25, 16, 16]} />
               <meshStandardMaterial color="#ff5252" emissive="#ff5252" emissiveIntensity={0.8} />
             </mesh>
             <Text position={[0, -0.4, 0]} fontSize={0.2} color="#ff5252" anchorX="center">r (Received)</Text>
          </group>
        )}

        {/* Draw line from c to r showing error displacement */}
        {showR && (
          <Line points={[cPos, rPos]} color="#ff5252" lineWidth={2} dashed dashSize={0.2} gapSize={0.1} />
        )}

        {/* If miscorrected, show snap line from r to wrong codeword */}
        {showR && currentStage === 'corrected' && corrected.join('') !== c.join('') && (
          <Line points={[rPos, correctedPos]} color="#ff9800" lineWidth={3} />
        )}
        
        {/* If correctly corrected, show snap line back to c */}
        {showR && currentStage === 'corrected' && corrected.join('') === c.join('') && (
          <Line points={[rPos, cPos]} color="#00e676" lineWidth={3} />
        )}
      </group>

      <pointLight position={[0, 8, 0]} intensity={1.5} color="#b39ddb" distance={25} />
    </group>
  );
}
