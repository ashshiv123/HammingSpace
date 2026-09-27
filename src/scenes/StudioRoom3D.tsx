import React from 'react';
import * as THREE from 'three';
import { BackWallDisplayBoard3D } from '../components3d/BackWallDisplayBoard3D';

/**
 * Modern Architectural Studio Room
 * Replaces the pitch-black void with an elegant, warm tech research studio:
 * - Parquet / dark oak hardwood studio floor with soft specular reflectivity
 * - Modern acoustic slat back wall with warm architectural cove lighting
 * - Side architectural walls with ambient studio windows and soft natural daylight
 * - Ceiling light coves and subtle architectural details
 */
export const StudioRoom3D: React.FC = () => {
  // Acoustic wall slats generation
  const slatCount = 38;
  const slatWidth = 0.35;
  const slatSpacing = 0.55;
  const slatStartX = -((slatCount - 1) * slatSpacing) / 2;

  return (
    <group position={[0, 0, 0]}>
      {/* ================================================================= */}
      {/* 1. ARCHITECTURAL LIGHTING SUITE                                   */}
      {/* ================================================================= */}
      {/* Warm Ambient Studio Fill */}
      <ambientLight color="#cbd5e1" intensity={0.9} />

      {/* Main Studio Key Light (Soft Warm Overhead Daylight) */}
      <directionalLight
        position={[-6, 14, 8]}
        color="#fffbeb"
        intensity={1.8}
        castShadow
      />

      {/* Cool Soft Fill from Room Front */}
      <directionalLight
        position={[8, 10, 6]}
        color="#e0f2fe"
        intensity={0.9}
      />

      {/* Warm Architectural Wall Cove Lighting (Illuminating the back acoustic wall) */}
      <spotLight
        position={[0, 7.5, -4.5]}
        target-position={[0, 2.0, -6.5]}
        color="#fed7aa"
        intensity={3.2}
        distance={16}
        angle={Math.PI / 2.6}
        penumbra={0.8}
      />

      {/* Left Station Accent Light */}
      <pointLight
        position={[-6.2, 4.5, 1.2]}
        color="#f8fafc"
        intensity={1.1}
        distance={10}
      />

      {/* Right Station Accent Light */}
      <pointLight
        position={[6.2, 4.5, 1.2]}
        color="#f8fafc"
        intensity={1.1}
        distance={10}
      />

      {/* ================================================================= */}
      {/* 2. STUDIO FLOOR (Warm Dark Oak / Slate Parquet)                   */}
      {/* ================================================================= */}
      <mesh position={[0, -2.12, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 36]} />
        <meshStandardMaterial
          color="#161b26"
          roughness={0.45}
          metalness={0.25}
        />
      </mesh>

      {/* Inset Area Rug / Studio Work Mat under the desks */}
      <mesh position={[0, -2.115, 0.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[22, 9]} />
        <meshStandardMaterial
          color="#1e2536"
          roughness={0.85}
          metalness={0.1}
        />
      </mesh>

      {/* Thin Architectural Brass Floor Border Trim */}
      <mesh position={[0, -2.11, 0.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[11.0, 11.04, 4]} />
        <meshStandardMaterial
          color="#b45309"
          roughness={0.3}
          metalness={0.8}
        />
      </mesh>

      {/* ================================================================= */}
      {/* 3. BACK ACOUSTIC SLAT WALL                                        */}
      {/* ================================================================= */}
      {/* Wall Substrate (Deep Charcoal) */}
      <mesh position={[0, 5, -6.8]}>
        <planeGeometry args={[46, 16]} />
        <meshStandardMaterial
          color="#0b0f19"
          roughness={0.9}
        />
      </mesh>

      {/* Architectural Acoustic Wood Slats */}
      <group position={[0, 4.5, -6.7]}>
        {Array.from({ length: slatCount }).map((_, i) => {
          const x = slatStartX + i * slatSpacing;
          return (
            <mesh key={`slat-${i}`} position={[x, 0, 0]}>
              <boxGeometry args={[slatWidth, 14, 0.12]} />
              <meshStandardMaterial
                color="#1e293b"
                roughness={0.65}
                metalness={0.2}
              />
            </mesh>
          );
        })}
      </group>

      {/* Recessed Warm LED Cove Light Strip along the top of back wall */}
      <mesh position={[0, 8.2, -6.6]}>
        <boxGeometry args={[32, 0.14, 0.18]} />
        <meshStandardMaterial
          color="#fef3c7"
          emissive="#fbbf24"
          emissiveIntensity={1.2}
          roughness={0.2}
        />
      </mesh>

      {/* Architectural Studio Screen: Live Matrix & Syndrome Presentation Board */}
      <BackWallDisplayBoard3D />

      {/* ================================================================= */}
      {/* 4. SIDE ARCHITECTURAL WALLS & AMBIENT NATURAL LIGHT               */}
      {/* ================================================================= */}
      {/* Left Wall */}
      <mesh position={[-18, 5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[32, 16]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>

      {/* Right Wall */}
      <mesh position={[18, 5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[32, 16]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>

      {/* Left Studio Window Frame with Soft Daylight Backing */}
      <group position={[-17.9, 4.2, 0]}>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[12, 7.5]} />
          <meshStandardMaterial
            color="#e2e8f0"
            emissive="#bae6fd"
            emissiveIntensity={0.6}
            roughness={0.4}
          />
        </mesh>
        {/* Window Mullions */}
        <mesh position={[0.02, 0, 0]}>
          <boxGeometry args={[0.1, 7.5, 0.12]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0.02, 0, 0]}>
          <boxGeometry args={[0.1, 0.12, 12]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>
    </group>
  );
};
