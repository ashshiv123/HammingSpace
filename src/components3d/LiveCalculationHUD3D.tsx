import React from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulationStore } from '../store/simulationStore';

export interface LiveCalculationHUD3DProps {
  position?: [number, number, number];
}

export const LiveCalculationHUD3D: React.FC<LiveCalculationHUD3DProps> = ({
  position = [3.2, 0.8, -0.2],
}) => {
  const { calculationSteps, currentStepIndex, stage, showLiveHUD, dismissLiveHUD } =
    useSimulationStore();

  // Only render during active calculation stages
  if (stage !== 'encoding' && stage !== 'decoding') return null;
  if (!showLiveHUD) return null;
  if (calculationSteps.length === 0) return null;

  const currentStep = calculationSteps[currentStepIndex];
  if (!currentStep) return null;

  return (
    <group position={position}>
      {/* 3D Console Backplate */}
      <mesh position={[0, 0, -0.06]}>
        <boxGeometry args={[3.2, 2.2, 0.1]} />
        <meshStandardMaterial
          color="#060913"
          roughness={0.65}
          metalness={0.9}
        />
      </mesh>

      {/* Frame Border */}
      <lineSegments position={[0, 0, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(3.2, 2.2, 0.02)]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.5} />
      </lineSegments>

      {/* 3D Interactive Dismiss Button [✕] in Top-Right Corner */}
      <group
        position={[1.28, 0.82, 0.08]}
        onClick={(e) => {
          e.stopPropagation();
          dismissLiveHUD();
        }}
      >
        <mesh>
          <boxGeometry args={[0.34, 0.22, 0.06]} />
          <meshStandardMaterial
            color="#7f1d1d"
            emissive="#ef4444"
            emissiveIntensity={0.6}
            roughness={0.4}
          />
        </mesh>
        <Text
          position={[0, 0, 0.05]}
          fontSize={0.11}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          ✕
        </Text>
      </group>

      {/* Console Header */}
      <group position={[0, 0.82, 0.06]}>
        <Text
          fontSize={0.14}
          color="#22D3EE"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.06}
        >
          LIVE CALCULATION
        </Text>
        <Text
          position={[0, -0.18, 0]}
          fontSize={0.10}
          color="#64748b"
          anchorX="center"
          anchorY="middle"
        >
          {`Step ${currentStepIndex + 1} of ${calculationSteps.length}`}
        </Text>
      </group>

      {/* Math Formula Readout */}
      <group position={[0, 0.25, 0.06]}>
        <Text
          fontSize={0.13}
          color="#F5F5F0"
          anchorX="center"
          anchorY="middle"
          maxWidth={2.8}
        >
          {currentStep.mathFormula}
        </Text>
      </group>

      {/* Expanded mod-2 terms */}
      <group position={[0, -0.15, 0.06]}>
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[2.9, 0.44]} />
          <meshBasicMaterial color="#03060c" />
        </mesh>
        <Text
          fontSize={0.11}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
          maxWidth={2.7}
        >
          {currentStep.expandedTerms}
        </Text>
      </group>

      {/* Result Indicator */}
      <group position={[0, -0.58, 0.06]}>
        <Text
          fontSize={0.13}
          color="#4ADE80"
          anchorX="center"
          anchorY="middle"
        >
          {currentStep.mod2Result}
        </Text>
      </group>

      {/* Step Explanation */}
      <group position={[0, -0.88, 0.06]}>
        <Text
          fontSize={0.095}
          color="#cbd5e1"
          anchorX="center"
          anchorY="middle"
          maxWidth={2.9}
        >
          {currentStep.explanation}
        </Text>
      </group>
    </group>
  );
};
