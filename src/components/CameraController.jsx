/**
 * CameraController.jsx — Smooth camera transitions and WASD flight controller
 *
 * Combines HammingSpace's zone lerping with project_simulation's WASD flight controls.
 * - Zone presets: overview, transmitter, channel, receiver, hamming
 * - Real-time WASD / Arrow keys navigation with sprint (Shift)
 * - Elevation keys: Space/E (up), Q/C (down)
 * - Listens for synthetic events dispatched by GameControllerHUD
 */

import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ZONE_CAMERAS = {
  transmitter: {
    position: new THREE.Vector3(-12, 5, 10),
    target: new THREE.Vector3(-12, 1, 0),
  },
  channel: {
    position: new THREE.Vector3(0, 5, 10),
    target: new THREE.Vector3(0, 1.5, 0),
  },
  receiver: {
    position: new THREE.Vector3(12, 5, 10),
    target: new THREE.Vector3(12, 1, 0),
  },
  hamming: {
    position: new THREE.Vector3(0, 8, -6),
    target: new THREE.Vector3(0, 2, -14),
  },
  overview: {
    position: new THREE.Vector3(0, 12, 22),
    target: new THREE.Vector3(0, 1, 0),
  },
  firstPerson: {
    position: new THREE.Vector3(0, 2.2, 5.8),
    target: new THREE.Vector3(0, 3.8, -6.5),
  },
};

const LERP_SPEED = 2.5;

export default function CameraController({ activeZone = 'overview', orbitRef }) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());
  const isTransitioning = useRef(false);
  const lastZone = useRef(activeZone);
  const keysDown = useRef({});

  // Zone transition trigger
  useEffect(() => {
    if (activeZone !== lastZone.current) {
      isTransitioning.current = true;
      lastZone.current = activeZone;
    }
    const config = ZONE_CAMERAS[activeZone] || ZONE_CAMERAS.overview;
    targetPos.current.copy(config.position);
    targetLook.current.copy(config.target);
  }, [activeZone]);

  // Keyboard navigation listeners (WASD / Arrows / Space / Q)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const target = e.target;
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

    const handleKeyUp = (e) => {
      keysDown.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    const isW = keysDown.current['KeyW'] || keysDown.current['ArrowUp'];
    const isS = keysDown.current['KeyS'] || keysDown.current['ArrowDown'];
    const isA = keysDown.current['KeyA'] || keysDown.current['ArrowLeft'];
    const isD = keysDown.current['KeyD'] || keysDown.current['ArrowRight'];
    const isUp = keysDown.current['KeyE'] || keysDown.current['Space'];
    const isDown = keysDown.current['KeyQ'] || keysDown.current['KeyC'];
    const isSprint = keysDown.current['ShiftLeft'] || keysDown.current['ShiftRight'];

    // 1. Interactive WASD free movement
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
        if (orbitRef?.current) {
          orbitRef.current.target.add(moveDelta);
          orbitRef.current.update();
        }

        camera.position.x = THREE.MathUtils.clamp(camera.position.x, -24, 24);
        camera.position.y = THREE.MathUtils.clamp(camera.position.y, 0.4, 20);
        camera.position.z = THREE.MathUtils.clamp(camera.position.z, -22, 28);
      }
      return;
    }

    // 2. Zone smooth interpolation
    if (isTransitioning.current) {
      const speed = LERP_SPEED * delta;
      camera.position.lerp(targetPos.current, speed);

      if (orbitRef?.current) {
        orbitRef.current.target.lerp(targetLook.current, speed);
        orbitRef.current.update();
      }

      const posDist = camera.position.distanceTo(targetPos.current);
      if (posDist < 0.05) {
        camera.position.copy(targetPos.current);
        if (orbitRef?.current) {
          orbitRef.current.target.copy(targetLook.current);
          orbitRef.current.update();
        }
        isTransitioning.current = false;
      }
    }
  });

  return null;
}
