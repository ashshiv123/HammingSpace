/**
 * ReceiverStation.jsx — Zone 3: "Clinical / diagnostic" mood
 *
 * Cool color palette. Contains placeholder markers for:
 *   - Received vector display
 *   - Parity Check Matrix H rig (columns = bit addresses)
 *   - Syndrome console (3-light diagnostic readout)
 *   - Column-matching board
 *   - Correction/repair mechanism
 */

import React from 'react';
import { Text } from '@react-three/drei';

const FLOOR_COLOR = '#cfd8dc';
const WALL_COLOR = '#78909c';
const ACCENT_COLOR = '#42a5f5';
const LABEL_COLOR = '#1a237e';

function PlaceholderBox({ position, size, color, label, labelOffset = [0, 1.2, 0] }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} transparent opacity={0.6} />
      </mesh>
      <mesh>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} wireframe />
      </mesh>
      {label && (
        <Text
          position={labelOffset}
          fontSize={0.25}
          color={LABEL_COLOR}
          anchorX="center"
          anchorY="bottom"
        >
          {label}
        </Text>
      )}
    </group>
  );
}

export default function ReceiverStation() {
  return (
    <group position={[12, 0, 0]}>
      {/* Floor plate */}
      <mesh receiveShadow position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial color={FLOOR_COLOR} />
      </mesh>

      {/* Low back wall */}
      <mesh position={[4.8, 1.5, 0]}>
        <boxGeometry args={[0.2, 3, 8]} />
        <meshStandardMaterial color={WALL_COLOR} transparent opacity={0.3} />
      </mesh>

      {/* Zone label */}
      <Text
        position={[0, 3.5, 0]}
        fontSize={0.5}
        color={ACCENT_COLOR}
        anchorX="center"
        fontWeight="bold"
      >
        RECEIVER
      </Text>

      {/* Received vector display */}
      <PlaceholderBox
        position={[-3, 0.75, 0]}
        size={[2.5, 1.5, 1.2]}
        color="#b3e5fc"
        label="Received Vector (r)"
        labelOffset={[0, 1.0, 0]}
      />

      {/* Parity Check Matrix H rig */}
      <PlaceholderBox
        position={[0, 1.2, 0]}
        size={[3, 2.4, 0.4]}
        color={ACCENT_COLOR}
        label="Parity Check Matrix H"
        labelOffset={[0, 1.5, 0]}
      />

      {/* Column labels on H */}
      {[1, 2, 3, 4, 5, 6, 7].map((col, i) => (
        <Text
          key={col}
          position={[-1.3 + i * 0.4, 0.3, 0.25]}
          fontSize={0.14}
          color="#1565c0"
        >
          {`c${col}`}
        </Text>
      ))}

      {/* Syndrome Console */}
      <group position={[3, 1.5, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0, -i * 0.5, 0]}>
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshStandardMaterial color="#546e7a" emissive="#263238" emissiveIntensity={0.2} />
          </mesh>
        ))}
        <Text position={[0, 0.6, 0]} fontSize={0.2} color={LABEL_COLOR} anchorX="center">
          Syndrome (S)
        </Text>
      </group>

      {/* Correction/repair area */}
      <PlaceholderBox
        position={[3, 0.4, -1.5]}
        size={[1.8, 0.8, 1.2]}
        color="#a5d6a7"
        label="Correction"
        labelOffset={[0, 0.6, 0]}
      />

      <pointLight position={[0, 4, 2]} intensity={0.6} color="#bbdefb" />
    </group>
  );
}
