import React from 'react';
import { a, useSpring } from '@react-spring/three';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

export interface HoloAlertProps {
  visible: boolean;
  tone: 'red' | 'green';
  title?: string;
  message?: string;
  position?: [number, number, number];
}

export const HoloAlert: React.FC<HoloAlertProps> = ({
  visible,
  tone,
  title,
  message,
  position = [0, 2.3, 0],
}) => {
  const isRed = tone === 'red';
  const mainColor = isRed ? '#f43f5e' : '#10b981';
  const bgColor = isRed ? '#1e111a' : '#0c1a17';
  const emissiveColor = isRed ? '#881337' : '#064e3b';

  const defaultTitle = isRed
    ? 'PARITY VIOLATION DETECTED'
    : 'CODEWORD INTEGRITY RESTORED';
  const defaultMessage = isRed
    ? 'Non-zero syndrome (S ≠ 0) indicates channel bit flip.'
    : 'Coset leader applied: error bit inverted back to valid space.';

  const { scale } = useSpring({
    scale: visible ? 1.0 : 0.001,
    config: { tension: 300, friction: 22 },
  });

  if (!visible) return null;

  return (
    <a.group position={position} scale={scale}>
      {/* 3D Backdrop Plate */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3.2, 0.75, 0.08]} />
        <meshStandardMaterial
          color={bgColor}
          emissive={emissiveColor}
          emissiveIntensity={0.25}
          roughness={0.4}
          metalness={0.7}
        />
      </mesh>

      {/* Frame Border */}
      <lineSegments position={[0, 0, 0.05]}>
        <edgesGeometry
          args={[new THREE.BoxGeometry(3.2, 0.75, 0.02)]}
        />
        <meshBasicMaterial color={mainColor} transparent opacity={0.5} />
      </lineSegments>

      {/* Status Icon Badge */}
      <mesh position={[-1.25, 0, 0.05]}>
        <circleGeometry args={[0.2, 24]} />
        <meshBasicMaterial color={mainColor} />
      </mesh>
      <Text
        position={[-1.25, 0, 0.06]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {isRed ? '!' : '✓'}
      </Text>

      {/* Alert Title */}
      <Text
        position={[-0.92, 0.14, 0.05]}
        fontSize={0.13}
        color="#f8fafc"
        anchorX="left"
        anchorY="middle"
        letterSpacing={0.04}
      >
        {title || defaultTitle}
      </Text>

      {/* Alert Message */}
      <Text
        position={[-0.92, -0.14, 0.05]}
        fontSize={0.095}
        color="#94a3b8"
        anchorX="left"
        anchorY="middle"
      >
        {message || defaultMessage}
      </Text>
    </a.group>
  );
};
