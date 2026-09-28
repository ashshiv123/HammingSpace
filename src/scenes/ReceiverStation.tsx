import React, { useState } from 'react';
import { Text } from '@react-three/drei';
import { a, useSpring } from '@react-spring/three';
import { useSimulationStore } from '../store/simulationStore';
import { LaptopStation3D } from '../components3d/LaptopStation3D';

export interface ReceiverStationProps {
  position?: [number, number, number];
}

interface BitRowProps {
  label: string;
  vector: number[];
  y: number;
  tone: 'received' | 'corrected';
  errorPositions?: number[];
  correctedBit?: number | null;
}

const BitRow: React.FC<BitRowProps> = ({
  label,
  vector,
  y,
  tone,
  errorPositions = [],
  correctedBit,
}) => {
  const spacing = Math.min(0.23, 3.22 / Math.max(vector.length, 1));
  const firstX = -((vector.length - 1) * spacing) / 2;

  return (
    <group position={[0, y, 0.02]}>
      <Text
        position={[-1.72, 0, 0.01]}
        fontSize={0.085}
        color="#94a3b8"
        anchorX="left"
        anchorY="middle"
      >
        {label}
      </Text>
      {vector.map((bit, index) => {
        const isError = tone === 'received' && errorPositions.includes(index);
        const isCorrected = tone === 'corrected' && correctedBit === index;
        const background = isError ? '#5f1c2b' : isCorrected ? '#14532d' : '#0f3d42';
        return (
          <group key={label + '-' + index} position={[firstX + index * spacing, 0, 0]}>
            <mesh>
              <planeGeometry args={[spacing * 0.82, 0.28]} />
              <meshStandardMaterial
                color={background}
                emissive={isError ? '#be123c' : isCorrected ? '#15803d' : '#000000'}
                emissiveIntensity={isError || isCorrected ? 0.22 : 0}
                roughness={0.5}
              />
            </mesh>
            <Text
              position={[0, 0, 0.01]}
              fontSize={Math.min(0.15, spacing * 0.68)}
              color={bit ? '#f8fafc' : '#94a3b8'}
              anchorX="center"
              anchorY="middle"
            >
              {bit}
            </Text>
          </group>
        );
      })}
    </group>
  );
};

export const ReceiverStation: React.FC<ReceiverStationProps> = ({
  position = [6.2, 0, 0],
}) => {
  const {
    n,
    syndrome,
    stage,
    errorPositions,
    lastCorrectedBit,
    correctedVector,
    receivedVector,
    correct,
  } = useSimulationStore();
  const [correctHovered, setCorrectHovered] = useState(false);
  const isCorrected = stage === 'corrected';
  const hasError = !isCorrected && syndrome.some((bit) => bit === 1);
  const displayReceived = receivedVector.length === n ? receivedVector : new Array(n).fill(0);

  const { correctButtonScale, correctButtonColor } = useSpring({
    correctButtonScale: correctHovered && stage === 'errorDetected' ? 1.04 : 1,
    correctButtonColor: correctHovered ? '#15803d' : '#166534',
    config: { tension: 300, friction: 22 },
  });

  return (
    <group position={position}>
      <LaptopStation3D
        stationType="rx"
        title="RX-02"
        statusBadge={isCorrected ? 'VALID' : hasError ? 'ERROR' : stage === 'decoding' ? 'CHECKING' : 'READY'}
        badgeTone={isCorrected ? 'green' : hasError ? 'red' : 'blue'}
        keyboardContent={
          stage === 'errorDetected' ? (
            <a.group
              position={[1.1, 0.02, 0.05]}
              scale={correctButtonScale}
              onClick={(event) => {
                event.stopPropagation();
                correct();
              }}
              onPointerOver={(event) => {
                event.stopPropagation();
                setCorrectHovered(true);
              }}
              onPointerOut={() => setCorrectHovered(false)}
            >
              <a.mesh position={[0, 0, 0.05]}>
                <boxGeometry args={[0.78, 0.32, 0.08]} />
                <a.meshStandardMaterial
                  color={correctButtonColor}
                  emissive="#166534"
                  emissiveIntensity={0.22}
                  roughness={0.5}
                  metalness={0.35}
                />
              </a.mesh>
              <Text
                position={[0, 0, 0.1]}
                fontSize={0.085}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                letterSpacing={0.03}
              >
                CORRECT
              </Text>
            </a.group>
          ) : null
        }
      >
        <group position={[0, -0.08, 0]}>
          <BitRow
            label="RECEIVED"
            vector={displayReceived}
            y={0.42}
            tone="received"
            errorPositions={errorPositions}
          />
          <group position={[0, -0.02, 0.02]}>
            <Text
              position={[-1.72, 0, 0.01]}
              fontSize={0.085}
              color="#94a3b8"
              anchorX="left"
              anchorY="middle"
            >
              SYNDROME
            </Text>
            <Text
              position={[0.1, 0, 0.01]}
              fontSize={0.18}
              color={hasError ? '#fb7185' : '#94a3b8'}
              anchorX="center"
              anchorY="middle"
              letterSpacing={0.08}
            >
              {'[' + syndrome.join(' ') + ']'}
            </Text>
          </group>
          {isCorrected && correctedVector.length === n && (
            <BitRow
              label="CORRECTED"
              vector={correctedVector}
              y={-0.45}
              tone="corrected"
              correctedBit={lastCorrectedBit}
            />
          )}
        </group>
      </LaptopStation3D>
    </group>
  );
};
