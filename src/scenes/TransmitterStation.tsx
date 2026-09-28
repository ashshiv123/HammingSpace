import React, { useState } from 'react';
import { Text } from '@react-three/drei';
import { a, useSpring } from '@react-spring/three';
import * as THREE from 'three';
import { useSimulationStore } from '../store/simulationStore';
import { LaptopStation3D } from '../components3d/LaptopStation3D';

export interface TransmitterStationProps {
  position?: [number, number, number];
}

interface MessageKeyProps {
  index: number;
  val: number;
  onClick: () => void;
  disabled: boolean;
  isContributing: boolean;
  isActiveInStep: boolean;
  keySize?: number;
}

const MessageKey: React.FC<MessageKeyProps> = ({
  index,
  val,
  onClick,
  disabled,
  isContributing,
  isActiveInStep,
  keySize = 0.38,
}) => {
  const [hovered, setHovered] = useState(false);

  const { posY, scale, color, emissive } = useSpring({
    posY: hovered ? 0.02 : 0.05,
    scale: (hovered && !disabled) || isActiveInStep ? 1.06 : 1.0,
    color: isActiveInStep ? '#3b82f6' : val === 1 ? '#2563eb' : '#1e293b',
    emissive: isActiveInStep ? '#1d4ed8' : val === 1 ? '#1e40af' : '#000000',
    config: { tension: 350, friction: 20 },
  });

  return (
    <a.group
      scale={scale}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (!disabled) setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* Key Bezel Socket Well */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[keySize * 1.1, keySize * 1.1, 0.06]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} />
      </mesh>

      {/* Extruded Key Cap */}
      <a.mesh position-z={posY}>
        <boxGeometry args={[keySize, keySize, 0.10]} />
        <a.meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={val === 1 || isActiveInStep ? 0.6 : 0.0}
          roughness={0.3}
          metalness={0.7}
        />
      </a.mesh>

      {/* Numeric readout on Key Top */}
      <Text
        position={[0, 0, 0.12]}
        fontSize={keySize * 0.48}
        color={val === 1 || isActiveInStep ? '#ffffff' : '#94a3b8'}
        anchorX="center"
        anchorY="middle"
      >
        {val.toString()}
      </Text>

      {/* Bit label above key (m0, m1...) */}
      <Text
        position={[0, keySize * 0.65, 0.04]}
        fontSize={Math.min(0.10, keySize * 0.30)}
        color={isActiveInStep ? '#60a5fa' : isContributing ? '#93c5fd' : '#64748b'}
        anchorX="center"
        anchorY="middle"
      >
        {`m${index}`}
      </Text>
    </a.group>
  );
};

export const TransmitterStation: React.FC<TransmitterStationProps> = ({
  position = [-6.2, 0, 0],
}) => {
  const {
    k,
    n,
    message,
    toggleMessageBit,
    encode,
    startExplainEncoding,
    stage,
    calculationSteps,
    currentStepIndex,
    showLiveHUD,
  } = useSimulationStore();
  const [encodeHovered, setEncodeHovered] = useState(false);

  const currentStep = calculationSteps[currentStepIndex];
  const isEncodingCalc = stage === 'encoding' && !!currentStep;

  // Generic dynamic sizing for message keys on laptop keyboard
  const keySpacing = Math.min(0.42, Math.max(0.24, 2.8 / k));
  const keySize = keySpacing * 0.72;
  const startKeyX = -((k - 1) * keySpacing) / 2;

  const { encodeBtnScale, encodeBtnColor, encodeBtnEmissive } = useSpring({
    encodeBtnScale: encodeHovered && stage !== 'encoding' && stage !== 'decoding' ? 1.05 : 1.0,
    encodeBtnColor: stage !== 'encoding' && stage !== 'decoding' ? (encodeHovered ? '#1d4ed8' : '#2563eb') : '#1e293b',
    encodeBtnEmissive: stage !== 'encoding' && stage !== 'decoding' ? '#1e40af' : '#000000',
    config: { tension: 300, friction: 20 },
  });

  return (
    <group position={position}>
      {/* 3D Modern Studio Desk & Laptop TX Station */}
      <LaptopStation3D
        stationType="tx"
        title="TRANSMITTER • TX-01"
        subtitle={
          isEncodingCalc
            ? `Multiplying: c = m·G • Col c${currentStep?.activeCol ?? '...'}/${n}`
            : `Input ${k}-bit Message • Systematic Generator G [${k}×${n}]`
        }
          statusBadge={stage === 'encoding' ? 'ENCODING' : stage !== 'idle' ? 'SENT' : 'READY'}
          badgeTone={stage === 'encoding' ? 'blue' : stage !== 'idle' ? 'green' : 'blue'}
        keyboardContent={
          <group position={[0, 0.02, 0.05]}>
            {/* Interactive Message Keys on Laptop Deck */}
            {message.map((bit, idx) => {
              const x = startKeyX + idx * keySpacing;
              const isContributing = bit === 1;
              const isActiveInStep = isEncodingCalc && currentStep?.activeRow === idx;

              return (
                <group key={`key-${idx}`} position={[x, 0, 0]}>
                  <MessageKey
                    index={idx}
                    val={bit}
                    onClick={() => toggleMessageBit(idx)}
                    disabled={stage === 'encoding' || stage === 'decoding'}
                    isContributing={isContributing}
                    isActiveInStep={isActiveInStep}
                    keySize={keySize}
                  />
                </group>
              );
            })}

            {/* Quick Encode Return Key on Laptop Right Deck */}
            {stage === 'idle' && <a.group
              position={[1.35, 0, 0]}
              scale={encodeBtnScale}
              onClick={(e) => {
                e.stopPropagation();
                if (stage !== 'encoding' && stage !== 'decoding') encode();
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                if (stage !== 'encoding' && stage !== 'decoding') setEncodeHovered(true);
              }}
              onPointerOut={() => setEncodeHovered(false)}
            >
              <a.mesh position={[0, 0, 0.05]}>
                <boxGeometry args={[0.72, 0.32, 0.08]} />
                <a.meshStandardMaterial
                  color={encodeBtnColor}
                  emissive={encodeBtnEmissive}
                  emissiveIntensity={stage !== 'encoding' && stage !== 'decoding' ? 0.5 : 0.0}
                  roughness={0.3}
                  metalness={0.7}
                />
              </a.mesh>
              <Text
                position={[0, 0, 0.10]}
                fontSize={0.09}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                letterSpacing={0.04}
              >
                SEND
              </Text>
            </a.group>
            }
          </group>
        }
      >
        {/* Laptop screen shows the live outgoing message selected on the keyboard. */}
        <group position={[0, -0.05, 0]}>
          {(() => {
            const sent = stage !== 'idle' && stage !== 'encoding';
            const visibleVector = sent ? codeword : message;
            const label = sent ? 'CODEWORD c' : 'OUTGOING MESSAGE m';
            const spacing = Math.min(0.27, 3.0 / visibleVector.length);
            return (
              <>
          <Text
            position={[0, 0.48, 0.02]}
            fontSize={0.12}
            color="#93c5fd"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.06}
          >
            {label}
          </Text>
          {visibleVector.map((bit, idx) => {
            const x = ((visibleVector.length - 1) * -spacing) / 2 + idx * spacing;
            return (
              <group key={`screen-message-bit-${idx}`} position={[x, 0.04, 0.02]}>
                <mesh>
                  <planeGeometry args={[spacing * 0.82, 0.32]} />
                  <meshStandardMaterial
                    color={bit ? (sent && idx >= k ? '#78350f' : '#164e63') : '#111827'}
                      emissive={bit ? (sent && idx >= k ? '#d97706' : '#0891b2') : '#000000'}
                    emissiveIntensity={bit ? 0.4 : 0}
                    roughness={0.35}
                  />
                </mesh>
                <Text
                  position={[0, 0, 0.01]}
                  fontSize={0.18}
                  color={bit ? '#ecfeff' : '#94a3b8'}
                  anchorX="center"
                  anchorY="middle"
                >
                  {String(bit)}
                </Text>
                <Text
                  position={[0, -0.25, 0.01]}
                  fontSize={0.07}
                  color="#64748b"
                  anchorX="center"
                  anchorY="middle"
                >
                  {sent ? `c${idx}` : `m${idx}`}
                </Text>
              </group>
            );
          })}
          <Text
            position={[0, -0.55, 0.02]}
            fontSize={0.085}
            color={stage === 'encoding' ? '#34d399' : '#94a3b8'}
            anchorX="center"
            anchorY="middle"
          >
            {sent ? 'TRANSMITTED • DATA TEAL / PARITY AMBER' : stage === 'encoding' ? 'ENCODING IN PROGRESS' : 'TOGGLE MESSAGE BITS, THEN SEND'}
          </Text>
              </>
            );
          })()}
        </group>
      </LaptopStation3D>
    </group>
  );
};
