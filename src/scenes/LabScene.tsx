import React, { Suspense, useRef, useEffect } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { useSimulationStore } from '../store/simulationStore';
import { TransmitterStation } from './TransmitterStation';
import { ChannelZone } from './ChannelZone';
import { ReceiverStation } from './ReceiverStation';
import { StudioRoom3D } from './StudioRoom3D';

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

  // Pointer Lock and Mouse Look Listeners for First-Person View
  useEffect(() => {
    const canvas = gl.domElement;

    const handlePointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement === canvas;
    };

    const handleMouseDown = (e: MouseEvent) => {
      isMouseDown.current = true;
      lastMouse.current = { x: e.clientX, y: e.clientY };

      // In FPV, clicking the canvas locks the mouse cursor for true FPS look
      if (cameraFocus === 'firstPerson' && !document.pointerLockElement) {
        canvas.requestPointerLock?.();
      }
    };

    const handleMouseUp = () => {
      isMouseDown.current = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (cameraFocus !== 'firstPerson') return;

      const sensitivity = 0.0024;
      if (isPointerLocked.current) {
        yaw.current -= e.movementX * sensitivity;
        pitch.current -= e.movementY * sensitivity;
        pitch.current = Math.max(-1.42, Math.min(1.42, pitch.current));
      } else if (isMouseDown.current) {
        const deltaX = e.clientX - lastMouse.current.x;
        const deltaY = e.clientY - lastMouse.current.y;
        lastMouse.current = { x: e.clientX, y: e.clientY };
        yaw.current -= deltaX * (sensitivity * 1.4);
        pitch.current -= deltaY * (sensitivity * 1.4);
        pitch.current = Math.max(-1.42, Math.min(1.42, pitch.current));
      }
    };

    // Touch support for mobile first-person look
    let touchStart = { x: 0, y: 0 };
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (cameraFocus !== 'firstPerson' || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - touchStart.x;
      const deltaY = e.touches[0].clientY - touchStart.y;
      touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };

      const sensitivity = 0.004;
      yaw.current -= deltaX * sensitivity;
      pitch.current -= deltaY * sensitivity;
      pitch.current = Math.max(-1.42, Math.min(1.42, pitch.current));
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);

    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, [cameraFocus, gl]);

  // Keyboard navigation listener
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
      // Smooth initial transition into FPV position
      if (isTransitioning.current) {
        const step = Math.min(1, delta * 3.5);
        camera.position.lerp(targetCamPos.current, step);
        if (camera.position.distanceTo(targetCamPos.current) < 0.05) {
          isTransitioning.current = false;
        }
      }

      // First-person head orientation from Euler angles (Yaw & Pitch)
      const euler = new THREE.Euler(pitch.current, yaw.current, 0, 'YXZ');
      camera.quaternion.setFromEuler(euler);

      // Horizontal ground-plane walking vectors based on current yaw
      const forwardX = -Math.sin(yaw.current);
      const forwardZ = -Math.cos(yaw.current);
      const rightX = Math.cos(yaw.current);
      const rightZ = -Math.sin(yaw.current);

      const moveX = (isW ? forwardX : isS ? -forwardX : 0) + (isD ? rightX : isA ? -rightX : 0);
      const moveZ = (isW ? forwardZ : isS ? -forwardZ : 0) + (isD ? rightZ : isA ? -rightZ : 0);

      const isWalking = Math.abs(moveX) > 0.001 || Math.abs(moveZ) > 0.001;

      if (isWalking) {
        isTransitioning.current = false;
        const moveVec = new THREE.Vector2(moveX, moveZ).normalize();
        const walkSpeed = isSprint ? 8.2 : 4.4;

        camera.position.x += moveVec.x * walkSpeed * delta;
        camera.position.z += moveVec.y * walkSpeed * delta;

        // Subtle realistic head bobbing while walking
        walkCycle.current += delta * (isSprint ? 14 : 9);
        const bob = Math.sin(walkCycle.current) * (isSprint ? 0.035 : 0.02);
        camera.position.y = 0.24 + bob;
      } else {
        // Return to resting eye level
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.24, delta * 5);
      }

      // Jump / Crouch adjustments
      if (isUp) camera.position.y += 3.5 * delta;
      if (isDown) camera.position.y -= 3.5 * delta;

      // Clamp camera position within studio room bounds
      camera.position.x = THREE.MathUtils.clamp(camera.position.x, -18, 18);
      camera.position.y = THREE.MathUtils.clamp(camera.position.y, -0.4, 4.0);
      camera.position.z = THREE.MathUtils.clamp(camera.position.z, -3.8, 18);

      // Keep OrbitControls target aligned with FPV gaze direction
      if (controlsRef.current) {
        const gazeDir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        controlsRef.current.target.copy(camera.position).add(gazeDir.multiplyScalar(4));
      }
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

export const LabScene: React.FC = () => {
  return (
    <>
      {/* Dynamic Choreographed Camera with WASD Flight */}
      <CameraManager />

      {/* Modern Architectural 3D Studio Room with Warm Architectural Lighting */}
      <StudioRoom3D />

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
