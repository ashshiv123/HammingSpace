/**
 * CameraController.jsx — Smooth camera transitions between zones
 *
 * Uses useFrame to lerp camera position/target toward the active zone.
 * Hamming Space transitions feel like "stepping aside" (Z-axis movement).
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
};

const LERP_SPEED = 2.5;

export default function CameraController({ activeZone = 'overview', orbitRef }) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());
  const isTransitioning = useRef(false);
  const lastZone = useRef(activeZone);

  useEffect(() => {
    if (activeZone !== lastZone.current) {
      isTransitioning.current = true;
      lastZone.current = activeZone;
    }
    const config = ZONE_CAMERAS[activeZone] || ZONE_CAMERAS.overview;
    targetPos.current.copy(config.position);
    targetLook.current.copy(config.target);
  }, [activeZone]);

  useFrame((_, delta) => {
    if (!isTransitioning.current) return;

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
  });

  return null;
}
