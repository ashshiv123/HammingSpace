import React, { useRef } from 'react';
import { a, useSpring } from '@react-spring/three';
import { useFrame } from '@react-three/fiber';
import { Html, Text } from '@react-three/drei';
import * as THREE from 'three';
import { SimulationStage } from '../store/simulationStore';

export interface CodewordPacketProps {
  vector: (number | null)[];
  correctedVector?: (number | null)[];
  computedBits?: (number | null)[];
  stage: SimulationStage;
  errorPositions: number[];
  lastCorrectedBit?: number | null;
  k?: number;
  onBitTap?: (index: number) => void;
  onFixBit?: () => void;
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
  onFixBit?: () => void;
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
  onFixBit,
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

  // Color coding: data bits = teal, parity bits = purple/amber
  // Error = pulsing red, corrected = green, live motion = blue
  let targetColor: string;
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
  } else if (!isComputed) {
    targetColor = '#0f172a';
  } else if (isLiveMotion) {
    targetColor = '#3b82f6';
    targetEmissive = '#1d4ed8';
    emissiveIntensity = 0.5;
  } else if (isParity) {
    // Parity bits: amber/gold
    targetColor = numVal === 1 ? '#a855f7' : '#3b1e6e';
    targetEmissive = numVal === 1 ? '#7c3aed' : '#000000';
    emissiveIntensity = numVal === 1 ? 0.4 : 0;
  } else {
    // Data bits: teal/cyan
    targetColor = numVal === 1 ? '#0891b2' : '#164e63';
    targetEmissive = numVal === 1 ? '#0e7490' : '#000000';
    emissiveIntensity = numVal === 1 ? 0.4 : 0;
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
      <Html position={[0, 0, radius * 1.78]} center transform sprite pointerEvents="none" zIndexRange={[10, 0]}>
        <div style={{
          color: textColor,
          fontSize: `${Math.min(24, radius * 80)}px`,
          fontWeight: 'bold',
          fontFamily: 'monospace',
          textShadow: '0 1px 3px rgba(0,0,0,0.6)'
        }}>
          {!isComputed ? '·' : numVal.toString()}
        </div>
      </Html>

      {/* FIX BIT button — appears above the error sphere when errorDetected */}
      {isError && onFixBit && (
        <Html
          position={[0, radius * 3.2, 0.1]}
          center
          transform
          sprite
          zIndexRange={[100, 0]}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFixBit();
            }}
            style={{
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              color: '#ffffff',
              border: '1.5px solid #22c55e',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '11px',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              letterSpacing: '0.06em',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 0 10px rgba(34,197,94,0.55), 0 2px 6px rgba(0,0,0,0.5)',
              animation: 'pulse-glow 1.4s ease-in-out infinite',
            }}
          >
            ⚡ FIX BIT
          </button>
          <style>{`
            @keyframes pulse-glow {
              0%, 100% { box-shadow: 0 0 8px rgba(34,197,94,0.5), 0 2px 6px rgba(0,0,0,0.5); }
              50% { box-shadow: 0 0 18px rgba(34,197,94,0.9), 0 2px 8px rgba(0,0,0,0.5); }
            }
          `}</style>
        </Html>
      )}

      {/* Index label (c0, c1, ...) — sized to fit within bit slot width */}
      <Html position={[0, radius * 2.0, 0.06]} center transform sprite pointerEvents="none" zIndexRange={[10, 0]}>
        <div style={{
          color: isError ? '#fb7185' : isCorrected ? '#34d399' : isParity ? '#c084fc' : '#67e8f9',
          fontSize: `${Math.min(13, Math.max(9, bitWidth * 78))}px`,
          fontFamily: 'monospace',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          textShadow: '0 0 6px rgba(0,0,0,1), 0 1px 3px rgba(0,0,0,1)',
          background: 'rgba(4,8,20,0.75)',
          padding: '0px 3px',
          borderRadius: '3px',
          lineHeight: '1.4',
        }}>
          {`c${index}`}
        </div>
      </Html>
    </a.group>
  );
};

export const CodewordPacket: React.FC<CodewordPacketProps> = ({
  vector,
  correctedVector,
  computedBits,
  stage,
  errorPositions,
  lastCorrectedBit,
  k = 4,
  onBitTap,
  onFixBit,
  transmitterX = -6.2,
  channelX = 0,
  receiverX = 6.2,
}) => {
  const n = vector.length;

  // Proportional dynamic spacing for n bits — generous so labels don't overlap
  const bitSpacing = Math.min(0.72, Math.max(0.48, 4.8 / n));
  const bitWidth = bitSpacing * 0.80;

  const totalWidth = n * bitSpacing + 0.8;
  const capsuleHeight = 1.55;
  const startOffset = -((n - 1) * bitSpacing) / 2;

  // Physical spatial trajectory
  let targetX = transmitterX;
  let targetY = -0.75;
  let targetZ = 0.45;

  switch (stage) {
    case 'idle':
    case 'encoding':
      targetX = transmitterX;
      targetY = 1.8;  // Float well above TX laptop desk
      targetZ = 0.45;
      break;
    case 'inChannel':
      targetX = channelX;
      targetY = 1.6;  // Float above channel zone
      targetZ = 0.45;
      break;
    case 'decoding':
    case 'errorDetected':
    case 'corrected':
      targetX = receiverX;
      targetY = 1.8;  // Float well above RX laptop desk
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

  return (
    <a.group position-x={posX} position-y={posY} position-z={posZ}>
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

      {/* Packet Title Tag — larger, readable */}
      <Text
        position={[0, capsuleHeight / 2 + 0.22, 0.05]}
        fontSize={Math.max(0.16, Math.min(0.20, bitWidth * 0.55))}
        color="#f8fafc"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.06}
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        {`CODEWORD  [n=${n}]`}
      </Text>

      {/* Progressive Vector Bits as Circular Spheres */}
      <group position={[0, 0, 0.04]}>
        {vector.map((_, i) => {
          const x = startOffset + i * bitSpacing;
          const displayVal =
            computedBits !== undefined
              ? computedBits[i]
              : stage === 'corrected' && correctedVector && correctedVector[i] !== undefined
              ? correctedVector[i]
              : vector[i];
          const isError = stage !== 'corrected' && errorPositions.includes(i);
          const isCorrected =
            stage === 'corrected' &&
            lastCorrectedBit === i;
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
                onFixBit={isError && onFixBit ? onFixBit : undefined}
                bitWidth={bitWidth}
              />
            </group>
          );
        })}
      </group>
    </a.group>
  );
};
