import React, { useState } from 'react';
import { Text } from '@react-three/drei';
import { a, useSpring } from '@react-spring/three';
import { useSimulationStore } from '../store/simulationStore';
import { LaptopStation3D } from '../components3d/LaptopStation3D';

export interface TransmitterStationProps {
  position?: [number, number, number];
}

interface MessageKeyProps {
  index: number;
  value: number;
  onClick: () => void;
  disabled: boolean;
  isActive: boolean;
  size: number;
}

const MessageKey: React.FC<MessageKeyProps> = ({
  index,
  value,
  onClick,
  disabled,
  isActive,
  size,
}) => {
  const [hovered, setHovered] = useState(false);
  const { scale, color, emissive } = useSpring({
    scale: hovered && !disabled ? 1.04 : isActive ? 1.03 : 1,
    color: isActive ? '#0e7490' : value ? '#155e75' : '#1e293b',
    emissive: isActive ? '#0891b2' : value ? '#0f766e' : '#000000',
    config: { tension: 320, friction: 22 },
  });

  return (
    <a.group
      scale={scale}
      onClick={(event) => {
        event.stopPropagation();
        if (!disabled) onClick();
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        if (!disabled) setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <mesh>
        <boxGeometry args={[size * 1.1, size * 1.1, 0.06]} />
        <meshStandardMaterial color="#0f172a" roughness={0.75} />
      </mesh>
      <a.mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[size, size, 0.1]} />
        <a.meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={value || isActive ? 0.22 : 0}
          roughness={0.5}
          metalness={0.35}
        />
      </a.mesh>
      <Text
        position={[0, 0, 0.11]}
        fontSize={size * 0.48}
        color={value || isActive ? '#f8fafc' : '#94a3b8'}
        anchorX="center"
        anchorY="middle"
      >
        {value}
      </Text>
      <Text
        position={[0, size * 0.65, 0.04]}
        fontSize={Math.min(0.1, size * 0.3)}
        color={isActive ? '#67e8f9' : '#64748b'}
        anchorX="center"
        anchorY="middle"
      >
        {'m' + index}
      </Text>
    </a.group>
  );
};

export const TransmitterStation: React.FC<TransmitterStationProps> = ({
  position = [-6.2, 0, 0],
}) => {
  const {
    k,
    message,
    codeword,
    toggleMessageBit,
    encode,
    stage,
    calculationSteps,
    currentStepIndex,
  } = useSimulationStore();
  const [encodeHovered, setEncodeHovered] = useState(false);

  const currentStep = calculationSteps[currentStepIndex];
  const isEncodingCalculation = stage === 'encoding' && !!currentStep;
  const keySpacing = Math.min(0.42, Math.max(0.24, 2.8 / k));
  const keySize = keySpacing * 0.72;
  const firstKeyX = -((k - 1) * keySpacing) / 2;

  const { encodeButtonScale, encodeButtonColor } = useSpring({
    encodeButtonScale: encodeHovered ? 1.04 : 1,
    encodeButtonColor: encodeHovered ? '#0e7490' : '#155e75',
    config: { tension: 300, friction: 22 },
  });

  const isSent = stage !== 'idle' && stage !== 'encoding';
  const visibleVector = isSent ? codeword : message;
  const bitSpacing = Math.min(0.31, 3.28 / Math.max(visibleVector.length, 1));
  const firstBitX = -((visibleVector.length - 1) * bitSpacing) / 2;

  const laptopRef = useRef<THREE.Group>(null);
  useFrame(() => {
    const trayRef = (window as any).__devTrayRef;
    if (laptopRef.current && trayRef && trayRef.current) {
      const box1 = new THREE.Box3().setFromObject(laptopRef.current);
      const box2 = new THREE.Box3().setFromObject(trayRef.current);
      // Reduce the boxes slightly to avoid false positives from anti-aliasing / tight margins
      box1.expandByScalar(-0.01);
      box2.expandByScalar(-0.01);
      if (box1.intersectsBox(box2)) {
        console.warn("DEV CHECK: Transmitter laptop and codeword tray are INTERSECTING!");
      }
    }
  });

  return (
    <group position={position} ref={laptopRef}>
      <LaptopStation3D
        stationType="tx"
        title="TX-01"
        deskWidth={9.5}
        laptopPosition={[0, -1.37, -0.4]}
        statusBadge={stage === 'encoding' ? 'ENCODING' : isSent ? 'SENT' : 'READY'}
        badgeTone={stage === 'encoding' ? 'blue' : isSent ? 'green' : 'blue'}
        keyboardContent={
          <group position={[0, 0.035, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
            {message.map((bit, index) => (
              <group key={'message-key-' + index} position={[firstKeyX + index * keySpacing, 0, 0]}>
                <MessageKey
                  index={index}
                  value={bit}
                  onClick={() => toggleMessageBit(index)}
                  disabled={stage === 'encoding' || stage === 'decoding'}
                  isActive={isEncodingCalculation && currentStep?.activeRow === index}
                  size={keySize}
                />
              </group>
            ))}
            {stage === 'idle' && (
              <a.group
                position={[1.35, 0, 0]}
                scale={encodeButtonScale}
                onClick={(event) => {
                  event.stopPropagation();
                  encode();
                }}
                onPointerOver={(event) => {
                  event.stopPropagation();
                  setEncodeHovered(true);
                }}
                onPointerOut={() => setEncodeHovered(false)}
              >
                <a.mesh position={[0, 0, 0.05]}>
                  <boxGeometry args={[0.72, 0.32, 0.08]} />
                  <a.meshStandardMaterial
                    color={encodeButtonColor}
                    emissive="#0f766e"
                    emissiveIntensity={0.25}
                    roughness={0.5}
                    metalness={0.35}
                  />
                </a.mesh>
                <Text
                  position={[0, 0, 0.1]}
                  fontSize={0.09}
                  color="#ffffff"
                  anchorX="center"
                  anchorY="middle"
                  letterSpacing={0.04}
                >
                  SEND
                </Text>
              </a.group>
            )}
          </group>
        }
      >
        <group position={[0, -0.05, 0]}>
          {visibleVector.map((bit, index) => {
            const isParity = isSent && index >= k;
            return (
              <group
                key={'screen-bit-' + index}
                position={[firstBitX + index * bitSpacing, 0.1, 0.02]}
              >
                <mesh>
                  <planeGeometry args={[bitSpacing * 0.84, 0.38]} />
                  <meshStandardMaterial
                    color={isParity ? '#4a3212' : '#0f3d42'}
                    emissive={bit ? (isParity ? '#8a5b12' : '#11656c') : '#000000'}
                    emissiveIntensity={bit ? 0.22 : 0}
                    roughness={0.5}
                  />
                </mesh>
                <Text
                  position={[0, 0, 0.01]}
                  fontSize={Math.min(0.19, bitSpacing * 0.75)}
                  color={bit ? '#ecfeff' : '#94a3b8'}
                  anchorX="center"
                  anchorY="middle"
                >
                  {bit}
                </Text>
              </group>
            );
          })}
        </group>
      </LaptopStation3D>
    </group>
  );
};
