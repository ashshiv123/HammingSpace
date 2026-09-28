import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulationStore } from '../store/simulationStore';
import { CodewordPacket } from '../components3d/CodewordPacket';

export interface ChannelZoneProps {
  position?: [number, number, number];
}

export const ChannelZone: React.FC<ChannelZoneProps> = ({
  position = [0, 0, 0],
}) => {
  const {
    codeword,
    revealedCodeword,
    receivedVector,
    stage,
    errorPositions,
    lastCorrectedBit,
    k,
    toggleChannelBit,
    injectNoiseAndContinue,
    calculationSteps,
    currentStepIndex,
  } = useSimulationStore();

  const currentStep = calculationSteps[currentStepIndex];
  const arrowPulseRef = useRef<THREE.Group>(null);
  const disturbanceRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (arrowPulseRef.current) {
      arrowPulseRef.current.position.x = ((t * 1.6) % 3.6) - 1.8;
    }
    if (disturbanceRef.current && errorPositions.length > 0) {
      const s = 1 + 0.08 * Math.sin(t * 8);
      disturbanceRef.current.scale.set(s, s, s);
    }
  });

  const displayVector =
    stage === 'idle' || stage === 'encoding' ? revealedCodeword : receivedVector;
  const hasError = errorPositions.length > 0;

  return (
    <group position={position}>
      {/* Sleek Brushed Stainless Steel Data Conduit Rail connecting the two laptop desks */}
      <mesh position={[0, -0.65, 0.45]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.016, 0.016, 8.2, 16]} />
        <meshStandardMaterial
          color="#475569"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      {/* Directional Data Path Indicators (Flow from TX Laptop to RX Laptop) */}
      <group position={[0, -0.28, 0.45]}>
        <Text
          fontSize={0.11}
          color="#64748b"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.08}
        >
          {`TX LAPTOP ──────── OPTICAL DATA LINK ────────► RX LAPTOP`}
        </Text>
      </group>

      {/* Floating Pulse Indicator moving along the data link */}
      {stage === 'inChannel' && (
        <group ref={arrowPulseRef} position={[0, -0.65, 0.45]}>
          <mesh>
            <sphereGeometry args={[0.045, 12, 12]} />
            <meshStandardMaterial
              color="#3b82f6"
              emissive="#2563eb"
              emissiveIntensity={1.2}
            />
          </mesh>
        </group>
      )}

      {/* Minimalist Central Channel Docking Bridge at desk height */}
      <group position={[0, -1.5, 0.45]}>
        <mesh receiveShadow>
          <boxGeometry args={[3.2, 0.08, 1.8]} />
          <meshStandardMaterial
            color="#1e2536"
            roughness={0.5}
            metalness={0.2}
          />
        </mesh>
        <lineSegments position={[0, 0, 0]}>
          <edgesGeometry args={[new THREE.BoxGeometry(3.2, 0.08, 1.8)]} />
          <meshBasicMaterial color="#334155" />
        </lineSegments>
      </group>

      {/* Channel Header Label */}
      <group position={[0, 2.2, 0]}>
        <Text
          fontSize={0.20}
          color="#f8fafc"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.06}
        >
          PROPAGATION CHANNEL
        </Text>
        <Text
          position={[0, -0.22, 0]}
          fontSize={0.12}
          color={hasError ? '#fb7185' : '#94a3b8'}
          anchorX="center"
          anchorY="middle"
        >
          {hasError
            ? `Noise Injected: Bit c${errorPositions[0]} corrupted ➔ Proceeding to Receiver`
            : stage === 'inChannel'
            ? 'Packet in Transit: Click any bit to inject noise ➔ continues to receiver'
            : 'Binary Symmetric Channel (BSC)'}
        </Text>
      </group>

      {/* Subtle Noise Disturbance Ring (Only when bit is flipped) */}
      {hasError && (
        <group position={[0, -0.65, 0.45]}>
          <mesh ref={disturbanceRef}>
            <torusGeometry args={[0.75, 0.015, 16, 36]} />
            <meshStandardMaterial
              color="#f43f5e"
              emissive="#e11d48"
              emissiveIntensity={0.8}
              roughness={0.3}
            />
          </mesh>
        </group>
      )}

      {/* CodewordPacket (Travelling Central Object with progressive column reveal) */}
      <CodewordPacket
        vector={displayVector}
        computedBits={
          stage === 'encoding' ? currentStep?.computedCodewordBits : undefined
        }
        stage={stage}
        errorPositions={errorPositions}
        lastCorrectedBit={lastCorrectedBit}
        k={k}
        onBitTap={stage === 'inChannel' ? injectNoiseAndContinue : toggleChannelBit}
        transmitterX={-6.2}
        channelX={0}
        receiverX={6.2}
      />
    </group>
  );
};
