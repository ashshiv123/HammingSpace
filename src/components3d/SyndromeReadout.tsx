import React from 'react';
import { a, useSpring } from '@react-spring/three';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

export interface SyndromeReadoutProps {
  vector: (number | null)[];
  position?: [number, number, number];
  errorPosition?: number;
  isCorrected?: boolean;
}

export const SyndromeReadout: React.FC<SyndromeReadoutProps> = ({
  vector,
  position = [0, 0, 0],
  errorPosition,
  isCorrected = false,
}) => {
  const hasError = !isCorrected && vector.some((b) => b === 1);
  const r = vector.length;

  const statusColor = hasError ? '#f43f5e' : isCorrected ? '#10b981' : '#94a3b8';

  const { scale } = useSpring({
    scale: hasError ? 1.02 : 1.0,
    config: { tension: 260, friction: 18 },
  });

  const spacing = 0.44;
  const startX = -((r - 1) * spacing) / 2;
  const trayWidth = Math.max(2.4, r * spacing + 0.5);

  return (
    <a.group position={position} scale={scale}>
      {/* Flush Keyboard Module Plate (Low-profile, recessed inside keyboard well) */}
      <mesh position={[0, 0, 0.005]}>
        <boxGeometry args={[trayWidth, 0.68, 0.015]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.5}
          metalness={0.4}
        />
      </mesh>
      <lineSegments position={[0, 0, 0.008]}>
        <edgesGeometry
          args={[new THREE.BoxGeometry(trayWidth, 0.68, 0.015)]}
        />
        <meshBasicMaterial color={hasError ? '#e11d48' : '#334155'} />
      </lineSegments>

      {/* Header Label (Clean standard ASCII characters without missing glyphs) */}
      <Text
        position={[0, 0.22, 0.02]}
        fontSize={0.085}
        color="#e2e8f0"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.04}
      >
        {`SYNDROME S = r·H^T (mod 2)`}
      </Text>

      {/* Syndrome Chiclet Bit Tiles */}
      {vector.map((bit, idx) => {
        const x = startX + idx * spacing;
        const isComputed = bit !== null;
        const isBitOne = bit === 1;

        return (
          <group key={`syn-bit-${idx}`} position={[x, -0.04, 0.02]}>
            {/* Low-profile Chiclet Key Socket */}
            <mesh>
              <boxGeometry args={[0.32, 0.32, 0.02]} />
              <meshStandardMaterial
                color={
                  !isComputed
                    ? '#0b101d'
                    : isBitOne
                    ? hasError
                      ? '#e11d48'
                      : '#3b82f6'
                    : '#1e293b'
                }
                emissive={
                  !isComputed
                    ? '#000000'
                    : isBitOne
                    ? hasError
                      ? '#be123c'
                      : '#1d4ed8'
                    : '#000000'
                }
                emissiveIntensity={isBitOne ? 0.7 : 0.0}
                roughness={0.3}
                metalness={0.6}
              />
            </mesh>

            {/* Digit on Chiclet Top */}
            <Text
              position={[0, 0, 0.018]}
              fontSize={0.16}
              color={
                !isComputed
                  ? '#475569'
                  : isBitOne
                  ? '#ffffff'
                  : '#94a3b8'
              }
              anchorX="center"
              anchorY="middle"
            >
              {!isComputed ? '·' : bit.toString()}
            </Text>

            {/* Bit label below chiclet (s0, s1...) */}
            <Text
              position={[0, -0.21, 0.015]}
              fontSize={0.075}
              color={isBitOne && hasError ? '#fb7185' : '#64748b'}
              anchorX="center"
              anchorY="middle"
            >
              {`s${idx}`}
            </Text>
          </group>
        );
      })}

      {/* Diagnosis Footer on Key Strip */}
      <Text
        position={[0, -0.27, 0.02]}
        fontSize={0.075}
        color={statusColor}
        anchorX="center"
        anchorY="middle"
      >
        {hasError
          ? errorPosition !== undefined && errorPosition >= 0
            ? `S matches Col c${errorPosition} of H`
            : `S != 0 (Parity Error)`
          : isCorrected
          ? `S = [${new Array(r).fill(0).join(' ')}] (Valid Codeword)`
          : `S = [${new Array(r).fill(0).join(' ')}] (All Parity Passed)`}
      </Text>
    </a.group>
  );
};
