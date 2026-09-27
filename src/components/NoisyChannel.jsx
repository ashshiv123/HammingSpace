/**
 * NoisyChannel.jsx — Zone 2: "Hazard corridor" mood
 *
 * Connects Transmitter (left) to Receiver (right).
 * Restrained visual language — faint interference bands, subtle drifting
 * particles. Tinted volume corridor with floor markings.
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

const CHANNEL_LENGTH = 10;
const CHANNEL_WIDTH = 3;
const CHANNEL_HEIGHT = 3.5;
const TINT_COLOR = '#1a237e';
const FLOOR_COLOR = '#37474f';
const STRIPE_COLOR = '#ff5252';
const PARTICLE_COLOR = '#90caf9';

function ChannelParticles({ count = 60 }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * CHANNEL_LENGTH;
      arr[i * 3 + 1] = Math.random() * CHANNEL_HEIGHT * 0.8;
      arr[i * 3 + 2] = (Math.random() - 0.5) * CHANNEL_WIDTH;
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      pos.array[i * 3] += delta * 0.4;
      pos.array[i * 3 + 1] += Math.sin(Date.now() * 0.001 + i) * delta * 0.05;
      if (pos.array[i * 3] > CHANNEL_LENGTH / 2) {
        pos.array[i * 3] = -CHANNEL_LENGTH / 2;
      }
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color={PARTICLE_COLOR}
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
}

export default function NoisyChannel() {
  return (
    <group position={[0, 0, 0]}>
      {/* Corridor floor */}
      <mesh receiveShadow position={[0, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[CHANNEL_LENGTH, CHANNEL_WIDTH]} />
        <meshStandardMaterial color={FLOOR_COLOR} />
      </mesh>

      {/* Hazard floor stripes */}
      {[-3.5, -1.5, 0.5, 2.5].map((x, i) => (
        <mesh key={i} receiveShadow position={[x, -0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.15, CHANNEL_WIDTH]} />
          <meshStandardMaterial color={STRIPE_COLOR} transparent opacity={0.4} />
        </mesh>
      ))}

      {/* Tinted volume */}
      <mesh position={[0, CHANNEL_HEIGHT / 2, -CHANNEL_WIDTH / 2]}>
        <boxGeometry args={[CHANNEL_LENGTH, CHANNEL_HEIGHT, 0.05]} />
        <meshStandardMaterial color={TINT_COLOR} transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, CHANNEL_HEIGHT / 2, CHANNEL_WIDTH / 2]}>
        <boxGeometry args={[CHANNEL_LENGTH, CHANNEL_HEIGHT, 0.05]} />
        <meshStandardMaterial color={TINT_COLOR} transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, CHANNEL_HEIGHT, 0]}>
        <boxGeometry args={[CHANNEL_LENGTH, 0.05, CHANNEL_WIDTH]} />
        <meshStandardMaterial color={TINT_COLOR} transparent opacity={0.06} />
      </mesh>

      {/* Zone label */}
      <Text
        position={[0, CHANNEL_HEIGHT + 0.4, 0]}
        fontSize={0.35}
        color="#90caf9"
        anchorX="center"
      >
        NOISY CHANNEL
      </Text>

      {/* c / e / r monitoring display */}
      <group position={[0, 2.5, -CHANNEL_WIDTH / 2 + 0.1]}>
        <Text position={[-2.5, 0, 0]} fontSize={0.2} color="#a5d6a7" anchorX="center">c = sent</Text>
        <Text position={[0, 0, 0]} fontSize={0.2} color="#ef9a9a" anchorX="center">e = error</Text>
        <Text position={[2.5, 0, 0]} fontSize={0.2} color="#90caf9" anchorX="center">r = received</Text>
      </group>

      <ChannelParticles />
      <pointLight position={[0, 3, 0]} intensity={0.3} color="#64b5f6" />
    </group>
  );
}
