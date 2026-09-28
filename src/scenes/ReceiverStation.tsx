import React, { useState } from 'react';
import { Text } from '@react-three/drei';
import { a, useSpring } from '@react-spring/three';
import { useSimulationStore } from '../store/simulationStore';
import { LaptopStation3D } from '../components3d/LaptopStation3D';

export interface ReceiverStationProps {
  position?: [number, number, number];
}

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

  // When corrected, swap the displayed vector to the corrected one
  const displayVector = isCorrected && correctedVector.length === n
    ? correctedVector
    : receivedVector.length === n
    ? receivedVector
    : new Array(n).fill(0);

  const spacing = Math.min(0.23, 3.22 / Math.max(n, 1));
  const firstX = -((n - 1) * spacing) / 2;

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
        statusBadge={isCorrected ? 'VALID ✓' : hasError ? 'ERROR' : stage === 'decoding' ? 'CHECKING' : 'READY'}
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
          {/* Row label */}
          <Text
            position={[-1.72, 0.42, 0.03]}
            fontSize={0.085}
            color={isCorrected ? '#34d399' : '#94a3b8'}
            anchorX="left"
            anchorY="middle"
          >
            {isCorrected ? 'CORRECTED' : 'RECEIVED'}
          </Text>

          {/* Bit cells — same row, same position, bit color changes in-place */}
          {displayVector.map((bit, index) => {
            const wasError = !isCorrected && errorPositions.includes(index);
            const wasCorrected = isCorrected && index === lastCorrectedBit;

            // Color logic:
            // - Error bit (not yet corrected): red background + red glow
            // - Corrected bit (was the error, now fixed): green background + green glow
            // - Normal bit: standard teal
            const bgColor = wasError
              ? '#5f1c2b'
              : wasCorrected
              ? '#064e3b'
              : '#0f3d42';
            const emissiveColor = wasError
              ? '#be123c'
              : wasCorrected
              ? '#22c55e'
              : '#000000';
            const emissiveIntensity = wasError ? 0.45 : wasCorrected ? 0.65 : 0;
            const textColor = wasError
              ? '#fda4af'
              : wasCorrected
              ? '#ffffff'
              : bit
              ? '#f8fafc'
              : '#94a3b8';

            return (
              <group key={'rx-bit-' + index} position={[firstX + index * spacing, 0.42, 0.02]}>
                {/* Corrected bit gets a bright outer glow ring */}
                {wasCorrected && (
                  <mesh position={[0, 0, -0.006]}>
                    <planeGeometry args={[spacing * 1.15, 0.38]} />
                    <meshStandardMaterial
                      color="#22c55e"
                      emissive="#22c55e"
                      emissiveIntensity={0.5}
                      transparent
                      opacity={0.3}
                    />
                  </mesh>
                )}
                <mesh>
                  <planeGeometry args={[spacing * 0.82, 0.28]} />
                  <meshStandardMaterial
                    color={bgColor}
                    emissive={emissiveColor}
                    emissiveIntensity={emissiveIntensity}
                    roughness={0.5}
                  />
                </mesh>
                <Text
                  position={[0, 0, 0.01]}
                  fontSize={Math.min(0.15, spacing * 0.68)}
                  color={textColor}
                  anchorX="center"
                  anchorY="middle"
                >
                  {bit}
                </Text>
              </group>
            );
          })}

          {/* Syndrome row */}
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
              color={hasError ? '#fb7185' : isCorrected ? '#34d399' : '#94a3b8'}
              anchorX="center"
              anchorY="middle"
              letterSpacing={0.08}
            >
              {'[' + syndrome.join(' ') + ']'}
            </Text>
          </group>

          {/* Corrected bit caption below the codeword */}
          {isCorrected && lastCorrectedBit !== null && (
            <Text
              position={[firstX + lastCorrectedBit * spacing, 0.08, 0.02]}
              fontSize={0.065}
              color="#4ade80"
              anchorX="center"
              anchorY="middle"
            >
              ↑ fixed
            </Text>
          )}
        </group>
      </LaptopStation3D>
    </group>
  );
};
