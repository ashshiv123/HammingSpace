/**
 * Lab3D.jsx — React Three Fiber Canvas + Scene Root
 *
 * Renders:
 *   - Canvas with lighting, ground, and stars
 *   - Four zones laid out in one continuous space
 *   - OrbitControls for free exploration
 *   - CameraController for guided zone transitions
 *   - HUD overlays: PipelineHUD (top) + ZoneNav (bottom)
 */

import React, { useRef, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';

import TransmitterStation from './TransmitterStation';
import NoisyChannel from './NoisyChannel';
import ReceiverStation from './ReceiverStation';
import HammingSpaceChamber from './HammingSpaceChamber';
import CameraController from './CameraController';
import PipelineHUD from './PipelineHUD';
import ZoneNav from './ZoneNav';

function GroundPlane() {
  return (
    <mesh receiveShadow position={[0, -0.1, -4]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[50, 40]} />
      <meshStandardMaterial color="#1a1a24" />
    </mesh>
  );
}

function Lighting() {
  return (
    <>
      <ambientLight intensity={0.35} color="#e8eaf6" />
      <directionalLight
        position={[10, 15, 8]}
        intensity={0.5}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      <directionalLight position={[-5, 3, 12]} intensity={0.15} color="#b3e5fc" />
    </>
  );
}

function ConnectionPath() {
  return (
    <group>
      <mesh position={[-6, -0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2, 1.5]} />
        <meshBasicMaterial color="#37474f" transparent opacity={0.3} />
      </mesh>
      <mesh position={[6, -0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2, 1.5]} />
        <meshBasicMaterial color="#37474f" transparent opacity={0.3} />
      </mesh>
      {[-6, 0, 6].map((x, i) => (
        <mesh key={i} position={[x, -0.06, -1]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.6, 0.1]} />
          <meshBasicMaterial color="#64ffda" transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function PathToHammingSpace() {
  return (
    <group>
      {Array.from({ length: 8 }, (_, i) => (
        <mesh
          key={i}
          position={[0, -0.06, -2 - i * 1.5]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[0.08, 8]} />
          <meshBasicMaterial color="#7c4dff" transparent opacity={0.3 + i * 0.03} />
        </mesh>
      ))}
    </group>
  );
}

export default function Lab3D() {
  const orbitRef = useRef();
  const [activeZone, setActiveZone] = useState('overview');

  const handleNavigate = useCallback((zoneId) => {
    setActiveZone(zoneId);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#0a0a14' }}>
      <PipelineHUD />
      <ZoneNav activeZone={activeZone} onNavigate={handleNavigate} />

      <Canvas
        shadows
        camera={{
          position: [0, 12, 22],
          fov: 55,
          near: 0.1,
          far: 200,
        }}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Lighting />
        <Stars radius={80} depth={40} count={800} factor={3} fade speed={0.5} />
        <GroundPlane />
        <ConnectionPath />
        <PathToHammingSpace />

        {/* Zone 1: Transmitter (warm "construction" + interactive console, rig, fuse) */}
        <TransmitterStation />

        {/* Zone 2: Noisy Channel ("hazard corridor") */}
        <NoisyChannel />

        {/* Zone 3: Receiver (cool "clinical") */}
        <ReceiverStation />

        {/* Zone 4: Hamming Space ("map room") */}
        <HammingSpaceChamber />

        <OrbitControls
          ref={orbitRef}
          enableDamping
          dampingFactor={0.08}
          minDistance={3}
          maxDistance={40}
          maxPolarAngle={Math.PI / 2.1}
        />
        <CameraController activeZone={activeZone} orbitRef={orbitRef} />
      </Canvas>
    </div>
  );
}
