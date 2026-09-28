import React, { Suspense, useRef, useEffect } from 'react';
import CameraController from '../components/CameraController';
import { OrbitControls } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { useSimulationStore } from '../store/simulationStore';
import { TransmitterStation } from './TransmitterStation';
import { ChannelZone } from './ChannelZone';
import { ReceiverStation } from './ReceiverStation';
import { StudioRoom3D } from './StudioRoom3D';
import { TheoryScreen3D } from '../components3d/TheoryScreen3D';

const CameraManager: React.FC = () => {
  const { camera, gl } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const cameraFocus = useSimulationStore((s) => s.cameraFocus);

  const targetCamPos = useRef(new THREE.Vector3(0, 3.8, 16.0));
  const targetLookAt = useRef(new THREE.Vector3(0, 0.4, 0));
  const isTransitioning = useRef(false);

  // First-Person View Orientation (Yaw & Pitch)
  const yaw = useRef(0);
  const pitch = useRef(0);
  const walkCycle = useRef(0);
  const isPointerLocked = useRef(false);
  const isMouseDown = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  // WASD / Arrow Key State
  const keysDown = useRef<{ [key: string]: boolean }>({});

  // Keyboard navigation listener for UI only
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }
      keysDown.current[e.code] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDown.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    switch (cameraFocus) {
      case 'firstPerson':
        // Human eye level standing inside the studio facing workstations
        targetCamPos.current.set(0, 0.25, 5.2);
        targetLookAt.current.set(0, 0.25, -2.5);
        yaw.current = 0;
        pitch.current = -0.05;
        break;
      case 'display':
        targetCamPos.current.set(0, 5.1, 2.8);
        targetLookAt.current.set(0, 3.8, -6.5);
        break;
      case 'msgInput':
        targetCamPos.current.set(-6.2, 0.4, 5.8);
        targetLookAt.current.set(-6.2, -1.2, 1.6);
        break;
      case 'matrixG':
        targetCamPos.current.set(-6.2, 2.0, 7.2);
        targetLookAt.current.set(-6.2, 1.35, -0.65);
        break;
      case 'xorCombine':
        targetCamPos.current.set(-5.0, 1.6, 6.8);
        targetLookAt.current.set(-5.0, 0.9, 0.2);
        break;
      case 'tx':
        targetCamPos.current.set(-6.2, 2.4, 8.8);
        targetLookAt.current.set(-6.2, 0.6, -0.2);
        break;
      case 'channel':
        targetCamPos.current.set(0, 1.8, 7.5);
        targetLookAt.current.set(0, 0.25, 0.45);
        break;
      case 'noise':
        targetCamPos.current.set(0, 1.4, 5.6);
        targetLookAt.current.set(0, 0.35, 0.45);
        break;
      case 'rx':
        targetCamPos.current.set(6.2, 2.4, 8.8);
        targetLookAt.current.set(6.2, 0.6, -0.2);
        break;
      case 'syndrome':
        targetCamPos.current.set(6.2, 2.0, 7.2);
        targetLookAt.current.set(6.2, 1.35, -0.65);
        break;
      case 'correction':
        targetCamPos.current.set(5.2, 1.6, 6.5);
        targetLookAt.current.set(5.4, 0.6, 0.3);
        break;
      case 'overview':
      default:
        targetCamPos.current.set(0, 3.8, 16.0);
        targetLookAt.current.set(0, 0.4, 0);
        break;
    }
    isTransitioning.current = true;
  }, [cameraFocus]);

  useFrame((_, delta) => {
    const isW = keysDown.current['KeyW'] || keysDown.current['ArrowUp'];
    const isS = keysDown.current['KeyS'] || keysDown.current['ArrowDown'];
    const isA = keysDown.current['KeyA'] || keysDown.current['ArrowLeft'];
    const isD = keysDown.current['KeyD'] || keysDown.current['ArrowRight'];
    const isUp = keysDown.current['KeyE'] || keysDown.current['Space'];
    const isDown = keysDown.current['KeyQ'] || keysDown.current['KeyC'];
    const isSprint = keysDown.current['ShiftLeft'] || keysDown.current['ShiftRight'];

    // =========================================================================
    // 1. FIRST-PERSON VIEW MODE (True FPS Head Rotation & Ground Walk Physics)
    // =========================================================================
    if (cameraFocus === 'firstPerson') {
      return;
    }

    // =========================================================================
    // 2. ORBIT & OVERVIEW MODE (Free Flight & Preset Orbit Controls)
    // =========================================================================
    if (!controlsRef.current) return;

    if (isW || isS || isA || isD || isUp || isDown) {
      isTransitioning.current = false;

      const forward = new THREE.Vector3();
      camera.getWorldDirection(forward);
      forward.normalize();

      const right = new THREE.Vector3();
      right.crossVectors(forward, camera.up).normalize();

      const moveDir = new THREE.Vector3(0, 0, 0);
      if (isW) moveDir.add(forward);
      if (isS) moveDir.sub(forward);
      if (isD) moveDir.add(right);
      if (isA) moveDir.sub(right);
      if (isUp) moveDir.y += 0.8;
      if (isDown) moveDir.y -= 0.8;

      if (moveDir.lengthSq() > 0) {
        moveDir.normalize();
        const baseSpeed = isSprint ? 18.0 : 8.5;
        const moveDelta = moveDir.multiplyScalar(baseSpeed * delta);

        camera.position.add(moveDelta);
        controlsRef.current.target.add(moveDelta);

        camera.position.x = THREE.MathUtils.clamp(camera.position.x, -24, 24);
        camera.position.y = THREE.MathUtils.clamp(camera.position.y, 0.2, 16);
        camera.position.z = THREE.MathUtils.clamp(camera.position.z, -10, 30);

        controlsRef.current.update();
      }
    }

    // Automated Smooth Preset Transition
    if (isTransitioning.current) {
      const step = Math.min(1, delta * 3.2);
      camera.position.lerp(targetCamPos.current, step);
      controlsRef.current.target.lerp(targetLookAt.current, step);
      controlsRef.current.update();

      if (
        camera.position.distanceTo(targetCamPos.current) < 0.05 &&
        controlsRef.current.target.distanceTo(targetLookAt.current) < 0.05
      ) {
        isTransitioning.current = false;
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      target={[0, 0.4, 0]}
      minDistance={1.2}
      maxDistance={45}
      maxPolarAngle={Math.PI / 2 - 0.02}
      dampingFactor={0.08}
      enableDamping={cameraFocus !== 'firstPerson'}
      enableRotate={cameraFocus !== 'firstPerson'}
      enablePan={cameraFocus !== 'firstPerson'}
      enableZoom={cameraFocus !== 'firstPerson'}
      rotateSpeed={0.8}
      panSpeed={0.8}
      zoomSpeed={1.0}
      onStart={() => {
        isTransitioning.current = false;
      }}
    />
  );
};

function useLayoutGuard() {
  const { scene } = useThree();
  const { stage } = useSimulationStore();
  
  useEffect(() => {
    // @ts-ignore
    if (import.meta.env.MODE !== 'development') return;
    const timeout = setTimeout(() => {
      const boxes = [];
      scene.traverse((child) => {
        if (child.name && (child.name.includes('Laptop') || child.name.includes('Tray') || child.name.includes('Table'))) {
          const box = new THREE.Box3().setFromObject(child);
          boxes.push({ name: child.name, box });
        }
      });
      for (let i = 0; i < boxes.length; i++) {
        for (let j = i + 1; j < boxes.length; j++) {
          if (boxes[i].box.intersectsBox(boxes[j].box)) {
            const overlap = boxes[i].box.clone().intersect(boxes[j].box);
            const volume = (overlap.max.x - overlap.min.x) * (overlap.max.y - overlap.min.y) * (overlap.max.z - overlap.min.z);
            if (volume > 0.05) {
              console.warn('Layout Guard:', boxes[i].name, 'overlaps with', boxes[j].name, 'in stage', stage, 'Volume:', volume.toFixed(3));
            }
          }
        }
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [stage, scene]);
}

function usePerformanceMonitor() {
  const { gl } = useThree();
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log('--- PERFORMANCE INFO ---');
      console.log('Draw Calls:', gl.info.render.calls);
      console.log('Triangles:', gl.info.render.triangles);
      console.log('Geometries:', gl.info.memory.geometries);
      console.log('Textures:', gl.info.memory.textures);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [gl]);
}

export const LabScene: React.FC = () => {
  const { cameraFocus } = useSimulationStore();
  const orbitRef = useRef(null);
  usePerformanceMonitor();
  useLayoutGuard();
  return (
    <>
      <CameraController activeZone={cameraFocus} orbitRef={orbitRef} />
      <OrbitControls
        ref={orbitRef}
        enablePan={true}
        minDistance={1.2}
        maxDistance={45}
        maxPolarAngle={Math.PI / 2 - 0.02}
        dampingFactor={0.08}
        enableDamping
        enableRotate
        enableZoom
        rotateSpeed={0.8}
        panSpeed={0.8}
        zoomSpeed={1.0}
      />

      {/* Modern Architectural 3D Studio Room with Warm Architectural Lighting */}
      <StudioRoom3D />

      {/* Back Wall Theory Display (Crisp CSS3D + Canvas Anim) */}
      <TheoryScreen3D />

      {/* 3D Stations Pipeline */}
      <Suspense fallback={null}>
        {/* Left: Transmitter Laptop Station */}
        <TransmitterStation position={[-6.2, 0, 0]} />

        {/* Center: Propagation Channel Zone */}
        <ChannelZone position={[0, 0, 0]} />

        {/* Right: Receiver Laptop Station */}
        <ReceiverStation position={[6.2, 0, 0]} />
      </Suspense>
    </>
  );
};
