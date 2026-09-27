/**
 * HammingSpaceChamber.jsx — Zone 4: "Map room / landscape"
 *
 * A separate chamber NOT on the main Tx→Channel→Rx axis.
 * Positioned off-axis (along Z) so it feels like "stepping aside."
 *
 * Contains placeholder geometry for:
 *   - 16 valid codeword points (for (7,4))
 *   - Correction halos (radius t around each valid point)
 *   - Current received vector position marker
 *   - Distance measurement lines
 */

import React, { useMemo } from 'react';
import { Text } from '@react-three/drei';

const CHAMBER_COLOR = '#1a1a2e';
const GRID_COLOR = '#2d2d44';
const POINT_COLOR = '#7c4dff';
const HALO_COLOR = '#7c4dff';
const ACCENT = '#e0e0e0';

function CodewordConstellation() {
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        pts.push({
          pos: [(i - 1.5) * 2.2, (j - 1.5) * 2.2, 0],
          label: `cw${i * 4 + j}`,
        });
      }
    }
    return pts;
  }, []);

  return (
    <group>
      {points.map((pt, idx) => (
        <group key={idx} position={pt.pos}>
          <mesh>
            <sphereGeometry args={[0.15, 12, 12]} />
            <meshStandardMaterial
              color={POINT_COLOR}
              emissive={POINT_COLOR}
              emissiveIntensity={0.4}
            />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.8, 0.85, 32]} />
            <meshBasicMaterial color={HALO_COLOR} transparent opacity={0.15} side={2} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function HammingSpaceChamber() {
  return (
    <group position={[0, 0, -14]}>
      {/* Chamber floor */}
      <mesh receiveShadow position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color={CHAMBER_COLOR} />
      </mesh>

      {/* Grid lines */}
      {Array.from({ length: 11 }, (_, i) => i - 5).map((v) => (
        <group key={v}>
          <mesh position={[v, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.02, 12]} />
            <meshBasicMaterial color={GRID_COLOR} />
          </mesh>
          <mesh position={[0, -0.04, v]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[12, 0.02]} />
            <meshBasicMaterial color={GRID_COLOR} />
          </mesh>
        </group>
      ))}

      {/* Chamber label */}
      <Text
        position={[0, 5.5, 0]}
        fontSize={0.5}
        color={ACCENT}
        anchorX="center"
        fontWeight="bold"
      >
        HAMMING SPACE
      </Text>
      <Text
        position={[0, 4.8, 0]}
        fontSize={0.22}
        color="#9e9e9e"
        anchorX="center"
      >
        Codeword Constellation — the "map room"
      </Text>

      {/* Codeword points */}
      <group position={[0, 2, 0]}>
        <CodewordConstellation />
      </group>

      {/* Received vector marker placeholder */}
      <mesh position={[1.5, 2, 0.5]}>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshStandardMaterial color="#ff5252" emissive="#ff5252" emissiveIntensity={0.3} />
      </mesh>
      <Text position={[1.5, 2.5, 0.5]} fontSize={0.16} color="#ff8a80" anchorX="center">
        r (received)
      </Text>

      {/* dMin / t display */}
      <group position={[-4.5, 4, 0]}>
        <Text position={[0, 0, 0]} fontSize={0.22} color="#b39ddb" anchorX="left">
          d_min = 3
        </Text>
        <Text position={[0, -0.4, 0]} fontSize={0.22} color="#b39ddb" anchorX="left">
          t = 1 (correction radius)
        </Text>
      </group>

      {/* Portal marker back to pipeline */}
      <group position={[0, 1.5, 6.2]}>
        <mesh>
          <boxGeometry args={[2, 3, 0.1]} />
          <meshStandardMaterial color="#7c4dff" transparent opacity={0.15} />
        </mesh>
        <mesh>
          <boxGeometry args={[2, 3, 0.1]} />
          <meshStandardMaterial color="#7c4dff" wireframe />
        </mesh>
        <Text position={[0, 1.8, 0.1]} fontSize={0.2} color={ACCENT} anchorX="center">
          ↑ Return to Pipeline
        </Text>
      </group>

      <pointLight position={[0, 6, 0]} intensity={0.5} color="#b388ff" />
      <pointLight position={[-4, 3, -3]} intensity={0.2} color="#7c4dff" />
    </group>
  );
}
