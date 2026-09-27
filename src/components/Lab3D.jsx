import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

import TransmitterStation from './TransmitterStation';
import NoisyChannel from './NoisyChannel';
import ReceiverStation from './ReceiverStation';
import HammingSpaceChamber from './HammingSpaceChamber';
import CameraController from './CameraController';
import PipelineHUD from './PipelineHUD';
import ZoneNav from './ZoneNav';
import ModeSelector from './ModeSelector';
import CustomLabHUD from './CustomLabHUD';

// Integrated visualization components from project_simulation
import StudioRoom3D from './StudioRoom3D';
import StageInstruction from './StageInstruction';
import CalculationStepperBar from './CalculationStepperBar';
import SessionLogPanel from './SessionLogPanel';
import GameControllerHUD from './GameControllerHUD';
import CalculationVisualizerDrawer from './CalculationVisualizerDrawer';
import { useLabStore } from '../state/labStore';

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
  const [isVisualizerOpen, setIsVisualizerOpen] = useState(false);

  // Stepper auto-playback hook
  const calculationSteps = useLabStore((s) => s.calculationSteps);
  const currentStepIndex = useLabStore((s) => s.currentStepIndex);
  const isAnimationPlaying = useLabStore((s) => s.isAnimationPlaying);
  const speedMultiplier = useLabStore((s) => s.speedMultiplier);
  const nextStep = useLabStore((s) => s.nextStep);
  const pauseAnimation = useLabStore((s) => s.pauseAnimation);

  useEffect(() => {
    if (!isAnimationPlaying || calculationSteps.length === 0) return;
    if (currentStepIndex >= calculationSteps.length - 1) {
      const timer = setTimeout(() => {
        pauseAnimation();
      }, 1000);
      return () => clearTimeout(timer);
    }
    const intervalMs = Math.round(900 / (speedMultiplier || 1));
    const timer = setTimeout(() => {
      nextStep();
    }, intervalMs);
    return () => clearTimeout(timer);
  }, [isAnimationPlaying, currentStepIndex, calculationSteps.length, speedMultiplier, nextStep, pauseAnimation]);

  const handleNavigate = useCallback((zoneId) => {
    setActiveZone(zoneId);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#0a0a14', overflow: 'hidden' }}>
      {/* Top persistent pipeline state HUD */}
      <PipelineHUD />

      {/* Mode selection & custom matrix lab HUDs */}
      <ModeSelector />
      <CustomLabHUD />

      {/* Interactive Step-by-Step Calculation Stepper HUD */}
      <CalculationStepperBar />

      {/* Contextual bottom Stage Instruction HUD */}
      <StageInstruction />

      {/* Bottom navigation bar with Zone presets and "How Calculations Work" trigger */}
      <ZoneNav
        activeZone={activeZone}
        onNavigate={handleNavigate}
        onToggleVisualizer={() => setIsVisualizerOpen((v) => !v)}
        isVisualizerOpen={isVisualizerOpen}
      />

      {/* Bottom-left corner: WASD Flight Controller and Session Log Inspector */}
      <div
        style={{
          position: 'fixed',
          bottom: '58px',
          left: '12px',
          zIndex: 80,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          pointerEvents: 'auto',
        }}
      >
        <GameControllerHUD onResetCamera={() => handleNavigate('overview')} />
        <SessionLogPanel />
      </div>

      {/* Full 2D Mathematical Matrix Calculation Drawer Modal */}
      <CalculationVisualizerDrawer
        isOpen={isVisualizerOpen}
        onClose={() => setIsVisualizerOpen(false)}
      />

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
        {/* Modern Studio Room 3D with Oak Floor, Ambient Windows & Back Wall Display Board */}
        <StudioRoom3D />

        {/* Luminous Walkway Pathways */}
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
          minDistance={2}
          maxDistance={45}
          maxPolarAngle={Math.PI / 2.05}
        />
        <CameraController activeZone={activeZone} orbitRef={orbitRef} />
      </Canvas>
    </div>
  );
}
