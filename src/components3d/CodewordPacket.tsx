import React, { useRef } from 'react';
import { a, useSpring } from '@react-spring/three';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { SimulationStage } from '../store/simulationStore';

export interface CodewordPacketProps {
  vector: (number | null)[];
  computedBits?: (number | null)[];
  stage: SimulationStage;
  errorPositions: number[];
  lastCorrectedBit?: number | null;
  k?: number;
  onBitTap?: (index: number) => void;
  transmitterX?: number;
  channelX?: number;
  receiverX?: number;
}

interface BitCellProps {
  index: number;
  val: number | null;
  isError: boolean;
  isCorrected: boolean;
  isLiveMotion: boolean;
  isParity: boolean;
  onTap?: () => void;
  bitWidth: number;
}

/**
 * Circular Binary Ball / Sphere for transition data in flight
 */
const BitCell: React.FC<BitCellProps> = ({
  index,
  val,
  isError,
  isCorrected,
  isLiveMotion,
  isParity,
  onTap,
  bitWidth,
}) => {
  const pulseRef = useRef<THREE.Mesh>(null);
  const radius = bitWidth * 0.44;

  useFrame(({ clock }) => {
    if (isError && pulseRef.current) {
      const s = 1 + 0.18 * Math.sin(clock.getElapsedTime() * 8);
      pulseRef.current.scale.set(s, s, s);
    }
  });

  const isComputed = val !== null;
  const numVal = isComputed ? val : 0;

  // Elevation displacement: error bounces up slightly
  const targetY = isError ? 0.28 : 0;
  const targetRotZ = isError ? 0.12 : 0;
  const targetRotX = isError ? -0.1 : 0;

  let targetColor = !isComputed ? '#0f172a' : numVal === 1 ? '#3b82f6' : '#1e293b';
  let targetEmissive = '#000000';
  let emissiveIntensity = 0.0;
  let textColor = !isComputed ? '#475569' : '#ffffff';

  if (isError) {
    targetColor = '#f43f5e';
    targetEmissive = '#e11d48';
    emissiveIntensity = 0.8;
    textColor = '#ffffff';
  } else if (isCorrected) {
    targetColor = '#10b981';
    targetEmissive = '#059669';
    emissiveIntensity = 0.6;
    textColor = '#ffffff';
  } else if (isLiveMotion && isComputed) {
    targetColor = '#3b82f6';
    targetEmissive = '#1d4ed8';
    emissiveIntensity = 0.5;
    textColor = '#ffffff';
  } else if (numVal === 1 && isComputed) {
    targetColor = '#3b82f6';
    targetEmissive = '#1d4ed8';
    emissiveIntensity = 0.4;
    textColor = '#ffffff';
  }

  const { posY, rotZ, rotX, scale, color, emissive } = useSpring({
    posY: targetY,
    rotZ: targetRotZ,
    rotX: targetRotX,
    scale: isError ? 1.15 : isCorrected ? 1.08 : 1.0,
    color: targetColor,
    emissive: targetEmissive,
    config: { tension: 340, friction: 18 },
  });

  return (
    <a.group
      position-y={posY}
      rotation-z={rotZ}
      rotation-x={rotX}
      scale={scale}
      onClick={(e) => {
        e.stopPropagation();
        if (onTap && isComputed) onTap();
      }}
    >
      {/* Saturated Error Wave Pulse Ring when bit is corrupted */}
      {isError && (
        <mesh ref={pulseRef} position={[0, 0, 0]}>
          <ringGeometry args={[radius * 1.25, radius * 1.65, 32]} />
          <meshBasicMaterial color="#f43f5e" transparent opacity={0.65} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Circular Metallic Docking Well (under sphere) */}
      <mesh position={[0, 0, -0.04]}>
        <cylinderGeometry args={[radius * 1.18, radius * 1.18, 0.06, 24]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.7}
          metalness={0.8}
        />
      </mesh>

      {/* Thin Polished Accent Halo Ring */}
      <mesh position={[0, 0, -0.01]}>
        <ringGeometry args={[radius * 1.05, radius * 1.18, 24]} />
        <meshBasicMaterial color={isError ? '#f43f5e' : isCorrected ? '#10b981' : '#334155'} />
      </mesh>

      {/* Volumetric Circular Binary Ball / Sphere */}
      <a.mesh position={[0, 0, radius * 0.75]}>
        <sphereGeometry args={[radius, 32, 32]} />
        <a.meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          roughness={0.2}
          metalness={0.4}
        />
      </a.mesh>

      {/* Numeric Digit on Front Face of Sphere */}
      <Text
        position={[0, 0, radius * 1.78]}
        fontSize={radius * 1.1}
        color={textColor}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.02}
      >
        {isComputed ? numVal.toString() : ''}
      </Text>

      {/* Index Header (c0, c1, ...) positioned cleanly above bit socket */}
      <Text
        position={[0, radius * 1.75, 0.06]}
        fontSize={Math.min(0.12, bitWidth * 0.36)}
        color={isError ? '#fb7185' : isCorrected ? '#34d399' : isComputed ? '#94a3b8' : '#475569'}
        anchorX="center"
        anchorY="middle"
      >
        {`c${index}`}
      </Text>

      {/* Parity vs Data Sublabel below bit socket */}
      <Text
        position={[0, -radius * 1.75, 0.06]}
        fontSize={Math.min(0.095, bitWidth * 0.28)}
        color={isParity ? '#64748b' : '#60a5fa'}
        anchorX="center"
        anchorY="middle"
      >
        {isParity ? 'par' : 'dat'}
      </Text>
    </a.group>
  );
};

export const CodewordPacket: React.FC<CodewordPacketProps> = ({
  vector,
  computedBits,
  stage,
  errorPositions,
  lastCorrectedBit,
  k = 4,
  onBitTap,
  transmitterX = -6.2,
  channelX = 0,
  receiverX = 6.2,
}) => {
  const n = vector.length;

  // Proportional dynamic spacing for n bits
  const bitSpacing = Math.min(0.55, Math.max(0.32, 3.6 / n));
  const bitWidth = bitSpacing * 0.85;

  const totalWidth = n * bitSpacing + 0.5;
  const capsuleHeight = 1.35;
  const startOffset = -((n - 1) * bitSpacing) / 2;

  // Physical spatial trajectory
  let targetX = transmitterX;
  let targetY = -0.75;
  let targetZ = 0.45;

  const parkedX = transmitterX + 1.9 + 0.3 + totalWidth / 2;

  switch (stage) {
    case 'idle':
    case 'encoding':
      targetX = parkedX;
      targetY = -1.25; // on a low plinth on the desk (-1.45 + 0.1)
      targetZ = 0.2;
      break;
    case 'inChannel':
      targetX = channelX;
      targetY = -0.65;
      targetZ = 0.45;
      break;
    case 'decoding':
    case 'errorDetected':
    case 'corrected':
      targetX = receiverX;
      targetY = -0.75;
      targetZ = 0.45;
      break;
  }

  const isLiveMotion = stage === 'inChannel';

  const { posX, posY, posZ } = useSpring({
    posX: targetX,
    posY: targetY,
    posZ: targetZ,
    config: { tension: 120, friction: 18 },
  });

  const isParked = stage === 'idle' || stage === 'encoding';

  const packetRef = useRef<THREE.Group>(null);
  React.useEffect(() => {
    (window as any).__devTrayRef = packetRef;
  }, []);

  return (
    <a.group ref={packetRef as any} position-x={posX} position-y={posY} position-z={posZ}>
      {/* Plinth when parked */}
      {isParked && (
        <group position={[0, -0.1, 0]}>
          <mesh receiveShadow castShadow>
            <boxGeometry args={[totalWidth + 0.2, 0.15, 1.2]} />
            <meshStandardMaterial color="#0f172a" roughness={0.8} />
          </mesh>
          {/* Label on the plinth front */}
          <Text
            position={[0, 0, 0.61]}
            fontSize={0.08}
            color="#94a3b8"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.06}
          >
            {`CODEWORD TRAY [${n} BITS]`}
          </Text>
        </group>
      )}

      {/* Precision Digital Data Capsule Carrier Tray */}
      <mesh position={[0, 0, -0.06]}>
        <boxGeometry args={[totalWidth, capsuleHeight, 0.16]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.4}
          metalness={0.7}
        />
      </mesh>

      {/* Perimeter Rim */}
      <lineSegments position={[0, 0, 0.03]}>
        <edgesGeometry args={[new THREE.BoxGeometry(totalWidth, capsuleHeight, 0.02)]} />
        <meshBasicMaterial
          color={isLiveMotion ? '#3b82f6' : '#475569'}
          transparent
          opacity={isLiveMotion ? 0.8 : 0.4}
        />
      </lineSegments>

      {/* Progressive Vector Bits as Circular Spheres */}
      <group position={[0, 0, 0.04]}>
        {vector.map((_, i) => {
          const x = startOffset + i * bitSpacing;
          const displayVal =
            computedBits !== undefined ? computedBits[i] : vector[i];
          const isError = errorPositions.includes(i);
          const isCorrected =
            stage === 'corrected' &&
            (errorPositions.includes(i) || lastCorrectedBit === i);
          const isParity = i >= k;

          return (
            <group key={`codeword-bit-${i}`} position={[x, 0, 0]}>
              <BitCell
                index={i}
                val={displayVal}
                isError={isError}
                isCorrected={isCorrected}
                isLiveMotion={isLiveMotion}
                isParity={isParity}
                onTap={onBitTap ? () => onBitTap(i) : undefined}
                bitWidth={bitWidth}
              />
            </group>
          );
        })}
      </group>
    </a.group>
  );
};

