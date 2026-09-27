import React, { useState } from 'react';
import { a, useSpring } from '@react-spring/three';
import { Text } from '@react-three/drei';

export interface BitToggleProps {
  value: number;
  label?: string;
  sublabel?: string;
  position?: [number, number, number];
  onClick?: () => void;
  disabled?: boolean;
  isError?: boolean;
  isCorrected?: boolean;
  isHighlighted?: boolean;
  size?: number;
}

export const BitToggle: React.FC<BitToggleProps> = ({
  value,
  label,
  sublabel,
  position = [0, 0, 0],
  onClick,
  disabled = false,
  isError = false,
  isCorrected = false,
  isHighlighted = false,
  size = 0.5,
}) => {
  const [hovered, setHovered] = useState(false);

  // Design System Rules:
  // Red #EF4444 ONLY for error
  // Green #4ADE80 ONLY for corrected
  // Cyan #22D3EE ONLY for live/active highlight
  // Off-white #F5F5F0 for normal 1 bits, dimmed to 40% when 0
  let puckColor = value === 1 ? '#e2e8f0' : '#111827';
  let emissiveColor = '#000000';
  let emissiveIntensity = 0.0;
  let textColor = value === 1 ? '#090d16' : '#64748b';

  if (isError) {
    puckColor = '#ef4444';
    emissiveColor = '#b91c1c';
    emissiveIntensity = 1.2;
    textColor = '#ffffff';
  } else if (isCorrected) {
    puckColor = '#4ade80';
    emissiveColor = '#15803d';
    emissiveIntensity = 1.0;
    textColor = '#ffffff';
  } else if (isHighlighted) {
    // Live active highlight
    puckColor = '#22d3ee';
    emissiveColor = '#0891b2';
    emissiveIntensity = 0.9;
    textColor = '#04161f';
  } else if (value === 1) {
    puckColor = '#f1f5f9';
    emissiveColor = '#94a3b8';
    emissiveIntensity = 0.2;
  }

  const { scale, color, emissive, rotY } = useSpring({
    scale: hovered && !disabled ? 1.1 : 1.0,
    color: puckColor,
    emissive: emissiveColor,
    rotY: isError ? Math.PI : 0,
    config: { tension: 340, friction: 22 },
  });

  return (
    <a.group
      position={position}
      scale={scale}
      rotation-y={rotY}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled && onClick) onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (!disabled) setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* 3D Recessed Socket Base */}
      <mesh position={[0, -size * 0.12, 0]}>
        <cylinderGeometry args={[size * 0.58, size * 0.64, size * 0.18, 28]} />
        <meshStandardMaterial
          color="#080c16"
          roughness={0.7}
          metalness={0.8}
        />
      </mesh>

      {/* Socket Bevel Ring */}
      <mesh position={[0, -size * 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[size * 0.5, size * 0.58, 28]} />
        <meshStandardMaterial
          color={isHighlighted ? '#22d3ee' : '#1e293b'}
          roughness={0.5}
          metalness={0.9}
        />
      </mesh>

      {/* Extruded Interactive Button Puck */}
      <a.mesh position={[0, size * 0.1, 0]}>
        <cylinderGeometry args={[size * 0.46, size * 0.48, size * 0.32, 28]} />
        <a.meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          roughness={0.3}
          metalness={0.65}
        />
      </a.mesh>

      {/* Numeric bit readout on top face */}
      <Text
        position={[0, size * 0.28, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={size * 0.52}
        color={textColor}
        anchorX="center"
        anchorY="middle"
      >
        {value.toString()}
      </Text>

      {/* Structural Label (Off-white dimmed) */}
      {label && (
        <Text
          position={[0, 0, size * 0.78]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={size * 0.28}
          color={isHighlighted ? '#22d3ee' : '#94a3b8'}
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      )}

      {/* Sublabel when active */}
      {sublabel && (
        <Text
          position={[0, 0, -size * 0.78]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={size * 0.22}
          color={isError ? '#ef4444' : isCorrected ? '#4ade80' : isHighlighted ? '#22d3ee' : '#64748b'}
          anchorX="center"
          anchorY="middle"
        >
          {sublabel}
        </Text>
      )}
    </a.group>
  );
};
