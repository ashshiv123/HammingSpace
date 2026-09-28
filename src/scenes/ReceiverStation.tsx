import React, { useMemo, useState } from 'react';
import { Text } from '@react-three/drei';
import { a, useSpring } from '@react-spring/three';
import { useSimulationStore } from '../store/simulationStore';
import { MatrixGrid } from '../components3d/MatrixGrid';
import { SyndromeReadout } from '../components3d/SyndromeReadout';
import { HoloAlert } from '../components3d/HoloAlert';
import { LaptopStation3D } from '../components3d/LaptopStation3D';

export interface ReceiverStationProps {
  position?: [number, number, number];
}

export const ReceiverStation: React.FC<ReceiverStationProps> = ({
  position = [6.2, 0, 0],
}) => {
  const {
    n,
    k,
    H,
    syndrome,
    stage,
    errorPositions,
    lastCorrectedBit,
    correctedVector,
    receivedVector,
    codeword,
    correct,
    decode,
    startExplainDecoding,
    calculationSteps,
    currentStepIndex,
    cameraFocus,
    showLiveHUD,
  } = useSimulationStore();

  const [correctHovered, setCorrectHovered] = useState(false);
  const r = n - k;
  const isCorrected = stage === 'corrected';
  const hasError = !isCorrected && syndrome.some((b) => b === 1);
  const primaryErrorPos =
    errorPositions[0] ?? (lastCorrectedBit !== null ? lastCorrectedBit : undefined);

  const currentStep = calculationSteps[currentStepIndex];
  const isDecodingCalc =
    (stage === 'decoding' || stage === 'errorDetected') && !!currentStep;

  // Dim inactive stations
  const isStationDimmed =
    cameraFocus === 'tx' || cameraFocus === 'matrixG' || cameraFocus === 'channel';

  // Highlighting for Parity Check Matrix H
  const highlightedCols = useMemo(() => {
    if (isDecodingCalc && currentStep?.highlightCols) {
      return currentStep.highlightCols;
    }
    if (primaryErrorPos !== undefined && primaryErrorPos >= 0) {
      return [primaryErrorPos];
    }
    return [];
  }, [isDecodingCalc, currentStep?.highlightCols, primaryErrorPos]);

  const highlightedRows = useMemo(() => {
    if (isDecodingCalc && currentStep?.highlightRows) {
      return currentStep.highlightRows;
    }
    return [];
  }, [isDecodingCalc, currentStep?.highlightRows]);

  const highlightedCells = useMemo(() => {
    if (isDecodingCalc && currentStep?.activeCells) {
      return currentStep.activeCells;
    }
    return [];
  }, [isDecodingCalc, currentStep?.activeCells]);

  const displaySyndromeVector = useMemo(() => {
    if (
      isDecodingCalc &&
      currentStep?.computedSyndromeBits &&
      currentStep.computedSyndromeBits.length > 0
    ) {
      return currentStep.computedSyndromeBits;
    }
    return syndrome;
  }, [isDecodingCalc, currentStep?.computedSyndromeBits, syndrome]);

  const { correctBtnScale, correctBtnColor } = useSpring({
    correctBtnScale: correctHovered && stage === 'errorDetected' ? 1.05 : 1.0,
    correctBtnColor:
      stage === 'errorDetected'
        ? correctHovered
          ? '#059669'
          : '#10b981'
        : '#1e293b',
    config: { tension: 320, friction: 20 },
  });

  return (
    <group position={position}>
      {/* 3D Modern Studio Desk & Laptop RX Station */}
      <LaptopStation3D
        stationType="rx"
        title="RECEIVER • RX-02"
        subtitle={
          isCorrected
            ? `Syndrome Orthogonal • Bit c${primaryErrorPos ?? 0} Corrected (S = [000])`
            : hasError
            ? `Parity Violation • Column c${primaryErrorPos} Matches Syndrome`
            : isDecodingCalc
            ? `Checking: S = r·Hᵀ • Bit s${currentStep?.activeRow ?? '...'}/${r}`
            : `Parity Check Matrix H [${r}×${n}] • S = r·Hᵀ (mod 2)`
        }
        statusBadge={
          isCorrected
            ? 'VALID'
            : hasError
            ? 'ERROR'
            : stage === 'decoding'
            ? 'VERIFYING'
            : 'READY'
        }
        badgeTone={
          isCorrected ? 'green' : hasError ? 'red' : 'blue'
        }
        keyboardContent={
          <group position={[0, 0.02, 0.05]} rotation={[-Math.PI / 2, 0, 0]}>
            {/* Syndrome Readout Tray on Laptop Deck */}
            <SyndromeReadout
              vector={displaySyndromeVector}
              position={[stage === 'errorDetected' ? -0.45 : 0, 0, 0]}
              errorPosition={primaryErrorPos}
              isCorrected={isCorrected}
            />

            {/* Classy "CORRECT" Button on Right Keyboard Deck (Active when error detected) */}
            {stage === 'errorDetected' && (
              <a.group
                position={[1.15, 0, 0]}
                scale={correctBtnScale}
                onClick={(e) => {
                  e.stopPropagation();
                  correct();
                }}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  setCorrectHovered(true);
                }}
                onPointerOut={() => setCorrectHovered(false)}
              >
                <a.mesh position={[0, 0, 0.015]}>
                  <boxGeometry args={[0.72, 0.32, 0.025]} />
                  <a.meshStandardMaterial
                    color={correctBtnColor}
                    emissive="#047857"
                    emissiveIntensity={0.6}
                    roughness={0.3}
                    metalness={0.7}
                  />
                </a.mesh>
                <Text
                  position={[0, 0, 0.032]}
                  fontSize={0.08}
                  color="#ffffff"
                  anchorX="center"
                  anchorY="middle"
                  letterSpacing={0.04}
                >
                  FIX BIT
                </Text>
              </a.group>
            )}
          </group>
        }
      >
        {isCorrected ? (
          <group position={[0, -0.08, 0]}>
            <Text position={[-1.65, 0.52, 0]} fontSize={0.10} color="#94a3b8" anchorX="left">RECEIVED r</Text>
            <Text position={[-1.65, 0.02, 0]} fontSize={0.10} color="#34d399" anchorX="left">CORRECTED c</Text>
            {[receivedVector, correctedVector].map((vector, rowIndex) => {
              const spacing = Math.min(0.24, 2.8 / Math.max(vector.length, 1));
              const startX = -((vector.length - 1) * spacing) / 2;
              return (
                <group key={`rx-vector-${rowIndex}`} position={[0, 0.34 - rowIndex * 0.5, 0.01]}>
                  {vector.map((bit, index) => (
                    <group key={`rx-bit-${rowIndex}-${index}`} position={[startX + index * spacing, 0, 0]}>
                      <mesh>
                        <planeGeometry args={[spacing * 0.8, 0.24]} />
                        <meshStandardMaterial
                          color={rowIndex === 1 && index === lastCorrectedBit ? '#047857' : bit ? '#164e63' : '#111827'}
                          emissive={rowIndex === 1 && index === lastCorrectedBit ? '#34d399' : '#000000'}
                          emissiveIntensity={rowIndex === 1 && index === lastCorrectedBit ? 0.8 : 0}
                        />
                      </mesh>
                      <Text position={[0, 0, 0.01]} fontSize={0.13} color="#f8fafc" anchorX="center" anchorY="middle">{bit}</Text>
                    </group>
                  ))}
                </group>
              );
            })}
            <Text position={[0, -0.62, 0]} fontSize={0.10} color="#81d4fa" anchorX="center">S = [{syndrome.join('')}]  •  RECOVERED m = {correctedVector.slice(0, k).join('')}</Text>
          </group>
        ) : (
          <group position={[0, -0.05, 0]}>
            <MatrixGrid
              data={H}
              label=""
              sublabel=""
              highlightIndices={{ rows: highlightedRows, cols: highlightedCols, cells: highlightedCells }}
              isDimmed={isStationDimmed}
            />
          </group>
        )}
      </LaptopStation3D>

      {/* Floating Status Notification Alert */}
      <HoloAlert
        visible={stage === 'errorDetected' || stage === 'corrected'}
        tone={stage === 'errorDetected' ? 'red' : 'green'}
        title={
          stage === 'errorDetected'
            ? 'PARITY CHECK VIOLATION'
            : 'CODEWORD RESTORED'
        }
        message={
          stage === 'errorDetected'
            ? `Syndrome non-zero • Column c${primaryErrorPos} inverted`
            : `Bit c${primaryErrorPos ?? 0} flipped back • S = 0 (mod 2)`
        }
        position={[0, 2.5, 0]}
      />
    </group>
  );
};
