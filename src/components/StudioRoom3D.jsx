/**
 * StudioRoom3D.jsx — Architectural studio room environment
 *
 * Adapted from project_simulation's StudioRoom3D.tsx.
 * Converted from TypeScript to plain JSX.
 *
 * Replaces the bare GroundPlane + Stars with a full architectural studio:
 * - Dark oak/slate studio floor
 * - Acoustic slat back wall with warm cove lighting
 * - Side architectural walls with ambient windows
 * - Warm key lights + cool fill lights
 */

import React from 'react';
import * as THREE from 'three';
import BackWallDisplayBoard3D from './BackWallDisplayBoard3D.jsx';

export default function StudioRoom3D() {
  const slatCount = 38;
  const slatWidth = 0.35;
  const slatSpacing = 0.55;
  const slatStartX = -((slatCount - 1) * slatSpacing) / 2;

  return (
    <group position={[0, 0, 0]}>
      {/* ============================================================= */}
      {/* ARCHITECTURAL LIGHTING SUITE                                   */}
      {/* ============================================================= */}
      {/* Warm Ambient Studio Fill */}
      <ambientLight color="#cbd5e1" intensity={0.85} />

      {/* Main Studio Key Light (Soft Warm Overhead Daylight) */}
      <directionalLight
        position={[-6, 14, 8]}
        color="#fffbeb"
        intensity={1.6}
        castShadow
      />

      {/* Cool Soft Fill from Room Front */}
      <directionalLight
        position={[8, 10, 6]}
        color="#e0f2fe"
        intensity={0.8}
      />

      {/* Warm Architectural Wall Cove Lighting */}
      <spotLight
        position={[0, 7.5, -4.5]}
        color="#fed7aa"
        intensity={2.8}
        distance={16}
        angle={Math.PI / 2.6}
        penumbra={0.8}
      />

      {/* Left Station Accent Light */}
      <pointLight position={[-13.0, 4.5, 1.2]} color="#f8fafc" intensity={1.0} distance={10} />

      {/* Right Station Accent Light */}
      <pointLight position={[13.0, 4.5, 1.2]} color="#f8fafc" intensity={1.0} distance={10} />

      {/* Hamming Space Chamber Accent */}
      <pointLight position={[0, 8, -16]} color="#b39ddb" intensity={1.2} distance={20} />

      {/* ============================================================= */}
      {/* STUDIO FLOOR (Warm Dark Oak / Slate Parquet)                   */}
      {/* ============================================================= */}
      <mesh position={[0, -0.1, -8]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[56, 44]} />
        <meshStandardMaterial color="#161b26" roughness={0.45} metalness={0.25} />
      </mesh>

      {/* Inset Area Rug / Studio Work Mat under stations */}
      <mesh position={[0, -0.095, 0.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 9]} />
        <meshStandardMaterial color="#1e2536" roughness={0.85} metalness={0.1} />
      </mesh>

      {/* Thin Architectural Brass Floor Border Trim */}
      <mesh position={[0, -0.09, 0.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[14.8, 14.85, 4]} />
        <meshStandardMaterial color="#b45309" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* ============================================================= */}
      {/* BACK ACOUSTIC SLAT WALL (Behind HammingSpaceChamber)          */}
      {/* ============================================================= */}
      {/* Wall Substrate (Deep Charcoal) */}
      <mesh position={[0, 7, -25.2]}>
        <planeGeometry args={[52, 18]} />
        <meshStandardMaterial color="#0b0f19" roughness={0.9} />
      </mesh>

      {/* Architectural Acoustic Wood Slats */}
      <group position={[0, 6.5, -25.1]}>
        {Array.from({ length: 48 }).map((_, i) => {
          const x = -((48 - 1) * 0.55) / 2 + i * 0.55;
          return (
            <mesh key={`slat-${i}`} position={[x, 0, 0]}>
              <boxGeometry args={[slatWidth, 16, 0.12]} />
              <meshStandardMaterial color="#1e293b" roughness={0.65} metalness={0.2} />
            </mesh>
          );
        })}
      </group>

      {/* Recessed Warm LED Cove Light Strip along top of back wall */}
      <mesh position={[0, 11.5, -25.0]}>
        <boxGeometry args={[36, 0.16, 0.2]} />
        <meshStandardMaterial color="#fef3c7" emissive="#fbbf24" emissiveIntensity={1.1} roughness={0.2} />
      </mesh>

      {/* Architectural Studio Screen: Live Matrix & Syndrome Board */}
      <BackWallDisplayBoard3D position={[0, 7.5, -24.8]} scale={[1.45, 1.45, 1.45]} />

      {/* ============================================================= */}
      {/* SIDE ARCHITECTURAL WALLS & AMBIENT NATURAL LIGHT               */}
      {/* ============================================================= */}
      {/* Left Wall */}
      <mesh position={[-25, 7, -8]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[44, 18]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>

      {/* Right Wall */}
      <mesh position={[25, 7, -8]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[44, 18]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>

      {/* Left Studio Window Frame with Soft Daylight Backing */}
      <group position={[-24.9, 5, -4]}>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[14, 8]} />
          <meshStandardMaterial color="#e2e8f0" emissive="#bae6fd" emissiveIntensity={0.5} roughness={0.4} />
        </mesh>
        {/* Vertical mullion */}
        <mesh position={[0.02, 0, 0]}>
          <boxGeometry args={[0.1, 8, 0.12]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        {/* Horizontal mullion */}
        <mesh position={[0.02, 0, 0]}>
          <boxGeometry args={[0.1, 0.12, 14]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>

      {/* Right Studio Window Frame */}
      <group position={[24.9, 5, -4]}>
        <mesh rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[14, 8]} />
          <meshStandardMaterial color="#e2e8f0" emissive="#bae6fd" emissiveIntensity={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[-0.02, 0, 0]}>
          <boxGeometry args={[0.1, 8, 0.12]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[-0.02, 0, 0]}>
          <boxGeometry args={[0.1, 0.12, 14]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>

      {/* Ceiling panels suggestion */}
      <mesh position={[0, 14, -8]}>
        <boxGeometry args={[52, 0.12, 44]} />
        <meshStandardMaterial color="#0a0e1a" roughness={0.9} />
      </mesh>
    </group>
  );
}
