import React from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

export interface LaptopStation3DProps {
  position?: [number, number, number];
  stationType: 'tx' | 'rx';
  title: string;
  subtitle?: string;
  statusBadge?: string;
  badgeTone?: 'blue' | 'green' | 'red' | 'amber';
  children?: React.ReactNode;
  keyboardContent?: React.ReactNode;
  deskColor?: string;
}

export const LaptopStation3D: React.FC<LaptopStation3DProps> = ({
  position = [0, 0, 0],
  stationType,
  title,
  statusBadge,
  badgeTone = 'blue',
  children,
  keyboardContent,
  deskColor = '#1e2536',
}) => {
  const badgeColor =
    badgeTone === 'green'
      ? '#10b981'
      : badgeTone === 'red'
      ? '#f43f5e'
      : badgeTone === 'amber'
      ? '#f59e0b'
      : '#3b82f6';

  return (
    <group position={position}>
      {/* ================================================================= */}
      {/* 1. ARCHITECTURAL WORK DESK                                        */}
      {/* ================================================================= */}
      {/* Modern Desk Surface */}
      <mesh position={[0, -1.45, 0]} receiveShadow>
        <boxGeometry args={[5.2, 0.10, 3.4]} />
        <meshStandardMaterial
          color={deskColor}
          roughness={0.65}
          metalness={0.12}
        />
      </mesh>

      {/* Desk Chamfered Edge Trim (Warm Metallic Accent) */}
      <lineSegments position={[0, -1.45, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(5.2, 0.10, 3.4)]} />
        <meshBasicMaterial color="#334155" />
      </lineSegments>

      {/* Four Sleek Brushed Aluminum Legs */}
      {[
        [-2.3, 1.4],
        [2.3, 1.4],
        [-2.3, -1.4],
        [2.3, -1.4],
      ].map(([lx, lz], idx) => (
        <mesh key={`desk-leg-${idx}`} position={[lx, -1.78, lz]}>
          <cylinderGeometry args={[0.045, 0.045, 0.65, 16]} />
          <meshStandardMaterial
            color="#475569"
            metalness={0.85}
            roughness={0.25}
          />
        </mesh>
      ))}

      {/* Minimalist Leather Desk Pad */}
      <mesh position={[0, -1.395, 0.15]}>
        <boxGeometry args={[4.2, 0.015, 2.6]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>

      {/* ================================================================= */}
      {/* 2. CLASSY 3D LAPTOP BASE (KEYBOARD DECK & TRACKPAD)               */}
      {/* ================================================================= */}
      <group position={[0, -1.37, 0.35]}>
        {/* Laptop Lower Chassis (Space Gray Anodized Aluminum) */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[3.8, 0.07, 2.5]} />
          <meshStandardMaterial
            color="#334155"
            metalness={0.55}
            roughness={0.45}
          />
        </mesh>

        {/* Polished Perimeter Edge Reflection */}
        <lineSegments position={[0, 0, 0]}>
          <edgesGeometry args={[new THREE.BoxGeometry(3.8, 0.07, 2.5)]} />
          <meshBasicMaterial color="#64748b" />
        </lineSegments>

        {/* Recessed Keyboard Well */}
        <mesh position={[0, 0.038, -0.2]}>
          <boxGeometry args={[3.3, 0.01, 1.4]} />
          <meshStandardMaterial
            color="#0b0f19"
            roughness={0.7}
          />
        </mesh>

        {/* Chiclet Key Deck Backing & Passive Keyboard Layout */}
        <group position={[0, 0.048, -0.2]}>
          {/* Subtle Key Grid texture effect */}
          {Array.from({ length: 4 }).map((_, rIdx) => (
            <mesh
              key={`key-row-${rIdx}`}
              position={[0, 0, -0.45 + rIdx * 0.28]}
            >
              <boxGeometry args={[3.2, 0.018, 0.22]} />
              <meshStandardMaterial
                color="#1e293b"
                roughness={0.5}
                metalness={0.2}
              />
            </mesh>
          ))}

          {/* Interactive Keyboard Content (Message Keys or Controls placed on keyboard deck) */}
          {keyboardContent}
        </group>

        {/* Glass Trackpad */}
        <group position={[0, 0.038, 0.72]}>
          <mesh>
            <boxGeometry args={[1.3, 0.008, 0.8]} />
            <meshStandardMaterial
              color="#1e293b"
              roughness={0.2}
              metalness={0.4}
            />
          </mesh>
          <lineSegments position={[0, 0.005, 0]}>
            <edgesGeometry args={[new THREE.BoxGeometry(1.3, 0.008, 0.8)]} />
            <meshBasicMaterial color="#475569" />
          </lineSegments>
        </group>

        {/* Laptop Status LED Indicator */}
        <mesh position={[1.7, 0.04, 1.05]}>
          <sphereGeometry args={[0.02, 12, 12]} />
          <meshStandardMaterial
            color={badgeColor}
            emissive={badgeColor}
            emissiveIntensity={0.35}
          />
        </mesh>

        {/* =============================================================== */}
        {/* 3. LAPTOP DISPLAY LID (OPEN SCREEN TILTING BACKWARDS ~105°)     */}
        {/* =============================================================== */}
        {/* Hinge Pivot Assembly */}
        <group position={[0, 0.04, -1.22]}>
          {/* Metallic Hinge Cylinder */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.04, 0.04, 3.2, 16]} />
            <meshStandardMaterial
              color="#1e293b"
              metalness={0.9}
              roughness={0.2}
            />
          </mesh>

          {/* Screen Assembly tilted backwards at 15 degrees from vertical (~105° open) */}
          <group rotation={[-0.26, 0, 0]} position={[0, 1.3, 0]}>
            {/* Display Outer Lid (Space Gray Aluminum) */}
            <mesh position={[0, 0, -0.035]}>
              <boxGeometry args={[3.8, 2.5, 0.06]} />
              <meshStandardMaterial
                color="#334155"
                metalness={0.55}
                roughness={0.45}
              />
            </mesh>

            {/* Display Front Glass Bezel */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[3.75, 2.45, 0.015]} />
              <meshStandardMaterial
                color="#060913"
                roughness={0.15}
                metalness={0.5}
              />
            </mesh>

            {/* Top Webcam Dot */}
            <mesh position={[0, 1.15, 0.01]}>
              <circleGeometry args={[0.02, 16]} />
              <meshBasicMaterial color="#1e293b" />
            </mesh>

            {/* Active Laptop Screen Surface (High-Resolution Retina Display) */}
            <mesh position={[0, 0, 0.01]}>
              <planeGeometry args={[3.6, 2.25]} />
              <meshStandardMaterial
                color="#0b101d"
                emissive="#080e1a"
                emissiveIntensity={0.08}
                roughness={0.35}
              />
            </mesh>

            {/* Screen Inner Header Bar */}
            <group position={[0, 0.94, 0.02]}>
              <mesh position={[0, 0, 0]}>
                <planeGeometry args={[3.55, 0.32]} />
                <meshStandardMaterial
                  color="#111827"
                  roughness={0.4}
                />
              </mesh>

              {/* Station Title — larger */}
              <Text
                position={[-1.6, 0, 0.01]}
                fontSize={0.18}
                color="#f8fafc"
                anchorX="left"
                anchorY="middle"
                letterSpacing={0.05}
                outlineWidth={0.008}
                outlineColor="#000000"
              >
                {title}
              </Text>

              {/* Station Badge — larger */}
              {statusBadge && (
                <group position={[1.3, 0, 0.01]}>
                  <mesh position={[0, 0, 0]}>
                    <planeGeometry args={[0.82, 0.22]} />
                    <meshStandardMaterial
                      color="#1e293b"
                      roughness={0.5}
                    />
                  </mesh>
                  <Text
                    position={[0, 0, 0.01]}
                    fontSize={0.12}
                    color={badgeColor}
                    anchorX="center"
                    anchorY="middle"
                    letterSpacing={0.04}
                    outlineWidth={0.006}
                    outlineColor="#000000"
                  >
                    {statusBadge}
                  </Text>
                </group>
              )}
            </group>

            {/* Keep the screen focused on the live station vectors. */}
            <group position={[0, -0.15, 0.03]} scale={0.9}>
              {children}
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};
