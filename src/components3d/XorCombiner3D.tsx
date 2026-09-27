import React, { useRef } from 'react';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface XorCombiner3DProps {
  position?: [number, number, number];
  activeCol?: number;
  terms?: number[];
  result?: number;
  visible?: boolean;
}

export const XorCombiner3D: React.FC<XorCombiner3DProps> = ({
  position = [0, 0, 0],
  activeCol,
  terms = [],
  result,
  visible = true,
}) => {
  const pulseRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (pulseRef.current) {
      const s = 1 + 0.08 * Math.sin(t * 6);
      pulseRef.current.scale.set(s, s, s);
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.8;
    }
  });

  if (!visible || activeCol === undefined) return null;

  const resultColor = result === 1 ? '#38bdf8' : '#e2e8f0';
  const termStr = terms.length > 0 ? terms.join(' ⊕ ') : '0';

  return (
    <group position={position}>
      {/* Structural Mounting Bracket */}
      <mesh position={[0, 0.45, -0.05]}>
        <cylinderGeometry args={[0.03, 0.03, 0.5, 12]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} />
      </mesh>

      {/* 3D Circular XOR Concentrator Housing */}
      <group position={[0, 0, 0]}>
        {/* Outer Ring */}
        <group ref={ringRef}>
          <mesh>
            <torusGeometry args={[0.55, 0.025, 16, 32]} />
            <meshStandardMaterial
              color="#22d3ee"
              emissive="#0891b2"
              emissiveIntensity={0.8}
              roughness={0.3}
            />
          </mesh>
        </group>

        {/* Back Disc */}
        <mesh position={[0, 0, -0.04]} ref={pulseRef}>
          <cylinderGeometry args={[0.5, 0.5, 0.08, 32]} />
          <meshStandardMaterial
            color="#060913"
            roughness={0.6}
            metalness={0.9}
          />
        </mesh>

        {/* XOR ⨁ Mathematical Symbol */}
        <Text
          position={[0, 0.08, 0.08]}
          fontSize={0.28}
          color="#38bdf8"
          anchorX="center"
          anchorY="middle"
        >
          ⨁
        </Text>

        <Text
          position={[0, -0.18, 0.08]}
          fontSize={0.11}
          color="#64748b"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.06}
        >
          GF(2) XOR
        </Text>
      </group>

      {/* Term Calculation Card Header */}
      <group position={[0, 0.88, 0.05]}>
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[2.4, 0.44]} />
          <meshBasicMaterial color="#090e1a" />
        </mesh>
        <Text
          position={[0, 0.09, 0]}
          fontSize={0.12}
          color="#F5F5F0"
          anchorX="center"
          anchorY="middle"
        >
          {`Column c${activeCol} Combination`}
        </Text>
        <Text
          position={[0, -0.10, 0]}
          fontSize={0.11}
          color="#38bdf8"
          anchorX="center"
          anchorY="middle"
        >
          {`${termStr} = ${result !== undefined ? result : '?'}`}
        </Text>
      </group>

      {/* Laser Drop Conduit to Codeword Packet below */}
      <mesh position={[0, -0.7, 0.05]}>
        <cylinderGeometry args={[0.015, 0.015, 0.65, 12]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>

      <group position={[0, -1.15, 0.05]}>
        <Text
          fontSize={0.12}
          color={resultColor}
          anchorX="center"
          anchorY="middle"
        >
          {`↓ c${activeCol} = ${result}`}
        </Text>
      </group>
    </group>
  );
};
