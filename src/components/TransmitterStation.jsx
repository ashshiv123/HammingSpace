/**
 * TransmitterStation.jsx — Zone 1: "Construction" mood
 *
 * Full interactive implementation per Blueprint Sections D (steps 1–6) & F:
 * - TASK 1: Message Console (k physical toggle switches with lever + glowing dome).
 * - TASK 2: Generator Matrix G rig split into Identity [I] and Parity [P] blocks.
 * - TASK 3: Encoding animation: active G rows travel, overlap, play GF(2) XOR fuse micro-animation.
 * - TASK 4: Seamed n-bit codeword object assembles and launches toward Noisy Channel.
 */

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useLabStore } from '../state/labStore.js';
import { encode as gf2Encode } from '../lib/gf2.js';

// Color Palette (Warm/Generative per concept doc)
const PALETTE = {
  floor: '#2a221b',
  pedestal: '#3d3024',
  pedestalBorder: '#5d4037',
  identity: '#ffd54f',       // bright warm gold
  identityDim: '#6d4c18',    // dim gold
  parity: '#ff7043',         // warm copper/orange
  parityDim: '#5d2616',      // dim copper
  activeGlow: '#ffca28',     // glowing amber
  wire: '#4e342e',
  switchOff: '#37474f',
  switchOn: '#ffb300',
  seamCollar: '#00e676',     // emerald seam between message & parity
  text: '#ffe082',
  textMuted: '#bcaaa4',
};

// -----------------------------------------------------------------------------
// Component: Physical Toggle Switch (Task 1)
// -----------------------------------------------------------------------------
function BitSwitch({ index, bitValue, onToggle }) {
  const [hovered, setHovered] = useState(false);
  const leverRef = useRef();

  // Smooth rotation for the physical lever
  useFrame((_, delta) => {
    if (!leverRef.current) return;
    const targetAngle = bitValue === 1 ? 0.35 : -0.35;
    leverRef.current.rotation.x = THREE.MathUtils.damp(
      leverRef.current.rotation.x,
      targetAngle,
      12,
      delta
    );
  });

  return (
    <group position={[(index - 1.5) * 1.05, 0, 0]}>
      {/* Switch Base Socket */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.38, 0.44, 0.14, 20]} />
        <meshStandardMaterial
          color={hovered ? '#4e342e' : PALETTE.pedestal}
          roughness={0.4}
          metalness={0.6}
        />
      </mesh>

      {/* Outer Glow Ring when On */}
      {bitValue === 1 && (
        <mesh position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.42, 24]} />
          <meshBasicMaterial color={PALETTE.switchOn} />
        </mesh>
      )}

      {/* Switch Housing click target */}
      <mesh
        position={[0, 0.15, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onToggle(index);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        <boxGeometry args={[0.65, 0.2, 0.65]} />
        <meshStandardMaterial
          color={hovered ? '#6d4c41' : '#2d1f19'}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* Mechanical Toggle Lever */}
      <group ref={leverRef} position={[0, 0.22, 0]}>
        {/* Lever arm */}
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.04, 0.06, 0.4, 12]} />
          <meshStandardMaterial color="#b0bec5" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Glowing Tip Node */}
        <mesh position={[0, 0.42, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial
            color={bitValue === 1 ? PALETTE.switchOn : PALETTE.switchOff}
            emissive={bitValue === 1 ? PALETTE.switchOn : '#111'}
            emissiveIntensity={bitValue === 1 ? 1.2 : 0.1}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* Bit labels */}
      <Text
        position={[0, -0.05, 0.6]}
        rotation={[-Math.PI / 4, 0, 0]}
        fontSize={0.16}
        color={bitValue === 1 ? PALETTE.identity : PALETTE.textMuted}
        anchorX="center"
      >
        {`m[${index}] = ${bitValue}`}
      </Text>
    </group>
  );
}

// -----------------------------------------------------------------------------
// Component: Message Console Desk (Task 1)
// -----------------------------------------------------------------------------
function MessageConsole({ m, k, onToggle }) {
  return (
    <group position={[-2.8, 0, 1.8]}>
      {/* Console Base / Table */}
      <mesh position={[0, 0.65, 0]} receiveShadow castShadow>
        <boxGeometry args={[4.8, 1.3, 2.2]} />
        <meshStandardMaterial color={PALETTE.pedestal} roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Console Top Panel */}
      <mesh position={[0, 1.31, 0]}>
        <boxGeometry args={[4.6, 0.04, 2.0]} />
        <meshStandardMaterial color="#211713" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Console Label */}
      <Text
        position={[0, 1.34, -0.65]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.22}
        color={PALETTE.text}
        fontWeight="bold"
        anchorX="center"
      >
        {`MESSAGE CONSOLE (k = ${k || m.length})`}
      </Text>
      <Text
        position={[0, 1.34, -0.4]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.12}
        color={PALETTE.textMuted}
        anchorX="center"
      >
        Flip switches to compose m. 1-bits activate matching G rows.
      </Text>

      {/* The 4 Physical Switches */}
      <group position={[0, 1.33, 0.2]}>
        {m.map((bit, idx) => (
          <BitSwitch key={idx} index={idx} bitValue={bit} onToggle={onToggle} />
        ))}
      </group>
    </group>
  );
}

// -----------------------------------------------------------------------------
// Component: Generator Matrix Rig (Task 2)
// -----------------------------------------------------------------------------
function GeneratorMatrixRig({ G, m, animOffset, mode }) {
  const k = G.length;
  const n = G[0].length;
  const parityStart = k; // 4 for (7,4)

  const showJargon = mode !== 'beginner';

  return (
    <group position={[1.2, 0, -1.2]}>
      {/* Rig Backdrop Frame */}
      <mesh position={[0, 2.2, -0.2]}>
        <boxGeometry args={[6.8, 3.8, 0.15]} />
        <meshStandardMaterial color="#1a1410" roughness={0.7} metalness={0.4} />
      </mesh>
      {/* Outer Rig Border */}
      <mesh position={[0, 2.2, -0.1]}>
        <boxGeometry args={[6.9, 3.9, 0.05]} />
        <meshStandardMaterial color={PALETTE.pedestalBorder} wireframe />
      </mesh>

      {/* Rig Header */}
      {showJargon && (
        <Text position={[0, 4.4, 0]} fontSize={0.36} color={PALETTE.identity} fontWeight="bold" anchorX="center">
          GENERATOR MATRIX G = [ I_{k} | P ]
        </Text>
      )}

      {/* Identity vs Parity Header Dividers */}
      {showJargon && (
        <>
          <group position={[-1.2, 3.9, 0]}>
            <Text fontSize={0.2} color={PALETTE.identity} fontWeight="bold" anchorX="center">
              IDENTITY BLOCK [ I_{k} ]
            </Text>
            <Text position={[0, -0.22, 0]} fontSize={0.11} color={PALETTE.textMuted} anchorX="center">
              Message bits pass through
            </Text>
          </group>

          <group position={[1.8, 3.9, 0]}>
            <Text fontSize={0.2} color={PALETTE.parity} fontWeight="bold" anchorX="center">
              PARITY BLOCK [ P ]
            </Text>
            <Text position={[0, -0.22, 0]} fontSize={0.11} color={PALETTE.textMuted} anchorX="center">
              Computed redundancy
            </Text>
          </group>
        </>
      )}

      {/* Vertical Seam / Divider Bar between Identity and Parity */}
      <mesh position={[(parityStart - 3.5) * 0.78, 2.2, 0.05]}>
        <boxGeometry args={[0.08, 3.2, 0.15]} />
        <meshStandardMaterial color={PALETTE.seamCollar} emissive={PALETTE.seamCollar} emissiveIntensity={0.4} />
      </mesh>

      {/* Render the rows of G as distinct 3D rack objects */}
      {G.map((row, rIdx) => {
        const isActive = m[rIdx] === 1;
        // Travel offset during animation: active rows move forward towards assembly
        const travelZ = isActive ? animOffset.rowTravelZ : 0;
        const travelY = isActive ? animOffset.rowTravelY : 0;

        return (
          <group
            key={rIdx}
            position={[0, 3.3 - rIdx * (3 / Math.max(k, 4)) + travelY, travelZ]}
          >
            {/* Row Carrier Bar */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[6.2, 0.48, 0.12]} />
              <meshStandardMaterial
                color={isActive ? '#3e2723' : '#1e1612'}
                emissive={isActive ? '#ff8f00' : '#000'}
                emissiveIntensity={isActive ? 0.35 : 0}
                roughness={0.4}
              />
            </mesh>

            {/* Row Tag Label */}
            {showJargon && (
              <Text position={[-3.3, 0, 0.1]} fontSize={0.16} color={isActive ? PALETTE.identity : PALETTE.textMuted}>
                {`Row ${rIdx + 1} (m[${rIdx}]=${m[rIdx]})`}
              </Text>
            )}

            {/* Row Nodes (n columns) */}
            {row.map((val, cIdx) => {
              const isIdentity = cIdx < parityStart;
              const colX = (cIdx - n/2 + 0.5) * 0.78 + (isIdentity ? -0.1 : 0.2);
              const nodeLit = isActive && val === 1;

              return (
                <group key={cIdx} position={[colX, 0, 0.1]}>
                  {/* Node sphere */}
                  <mesh>
                    <sphereGeometry args={[0.16, 16, 16]} />
                    <meshStandardMaterial
                      color={
                        nodeLit
                          ? isIdentity ? PALETTE.identity : PALETTE.parity
                          : isIdentity ? PALETTE.identityDim : PALETTE.parityDim
                      }
                      emissive={
                        nodeLit
                          ? isIdentity ? PALETTE.identity : PALETTE.parity
                          : '#000'
                      }
                      emissiveIntensity={nodeLit ? 1.0 : 0.05}
                      roughness={0.2}
                    />
                  </mesh>

                  {/* Value text */}
                  <Text position={[0, 0, 0.2]} fontSize={0.14} color={nodeLit ? '#000' : '#888'} fontWeight="bold">
                    {val}
                  </Text>
                </group>
              );
            })}
          </group>
        );
      })}
    </group>
  );
}

// -----------------------------------------------------------------------------
// Component: GF(2) Fuse Micro-Animation & Codeword Assembly (Task 3 & 4)
// -----------------------------------------------------------------------------
function CodewordAssembly({ animState, codeword, launchProgress }) {
  const currentStage = useLabStore((s) => s.currentStage);
  const injectErrorAtPosition = useLabStore((s) => s.injectErrorAtPosition);
  const e = useLabStore((s) => s.e);

  if (['received', 'decoded', 'corrected'].includes(currentStage)) return null;

  const { stage, fuseColText } = animState;
  const n = codeword.length; // 7

  // Position of assembly area: local [2.5, 1.2, 2.0]
  // Position during launch: travels towards Noisy Channel (world x=0)
  // Local assembly area is at x=2.5, which is world x = -12 + 2.5 = -9.5.
  // Channel center is at world x = 0, which is local x = 12.
  const currentX = 2.5 + launchProgress * 9.5; // moves from 2.5 to 12.0
  const currentZ = 2.0 * (1 - launchProgress); // centers onto Z=0 in corridor

  if (stage === 'idle' || stage === 'activating') {
    return (
      <group position={[2.5, 0, 2.0]}>
        {/* Assembly Stage Platform */}
        <mesh position={[0, 0.35, 0]}>
          <boxGeometry args={[6.0, 0.7, 1.8]} />
          <meshStandardMaterial color={PALETTE.pedestal} roughness={0.6} />
        </mesh>
        <Text position={[0, 0.8, 0]} fontSize={0.18} color={PALETTE.textMuted} anchorX="center">
          Codeword Assembly Area
        </Text>
      </group>
    );
  }

  return (
    <group position={[currentX, 1.2, currentZ]}>
      {/* Assembly Base Platform (only visible while before launch) */}
      {launchProgress === 0 && (
        <mesh position={[0, -0.85, 0]}>
          <boxGeometry args={[6.0, 0.7, 1.8]} />
          <meshStandardMaterial color={PALETTE.pedestal} roughness={0.6} />
        </mesh>
      )}

      {/* GF(2) Fuse Micro-Animation Banner */}
      {stage === 'fusing' && (
        <group position={[0, 1.1, 0]}>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[5.2, 0.6]} />
            <meshBasicMaterial color="#000" transparent opacity={0.7} />
          </mesh>
          <Text fontSize={0.22} color="#ffeb3b" fontWeight="bold" anchorX="center">
            {`GF(2) FUSE: ${fuseColText || 'XOR resolve (1 ⊕ 1 = 0)'}`}
          </Text>
          {/* Energy spark rings at each column */}
          {Array.from({ length: 7 }, (_, c) => (
            <mesh key={c} position={[(c - 3) * 0.7, -0.6, 0]}>
              <ringGeometry args={[0.2, 0.28, 16]} />
              <meshBasicMaterial color="#ffeb3b" transparent opacity={0.6} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      )}

      {/* Assembled 7-Bit Codeword Packet */}
      <group>
        {/* Packet Spine / Seam bar linking nodes */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 4.8, 8]} />
          <meshStandardMaterial color="#555" />
        </mesh>

        {/* Prominent Visual Seam Collar between bit 3 (message) and bit 4 (parity) */}
        <group position={[0.35, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.26, 0.26, 0.12, 16]} />
            <meshStandardMaterial
              color={PALETTE.seamCollar}
              emissive={PALETTE.seamCollar}
              emissiveIntensity={0.8}
            />
          </mesh>
          <Text position={[0, 0.45, 0]} fontSize={0.13} color={PALETTE.seamCollar} fontWeight="bold">
            SEAM (m | p)
          </Text>
        </group>

        {/* Codeword Nodes */}
        {codeword.map((val, idx) => {
          const isMsg = idx < 4;
          const nodeX = (idx - 3) * 0.7;
          const isFlipped = e[idx] === 1;
          const nodeRot = isFlipped ? [Math.PI / 3, Math.PI / 4, 0] : [0, 0, 0];
          const canInject = currentStage === 'in-flight';

          return (
            <group key={idx} position={[nodeX, 0, 0]}>
              {/* Node Sphere and Text rotated on damage */}
              <group rotation={nodeRot}>
                <mesh
                  onClick={(evt) => {
                    evt.stopPropagation();
                    if (canInject) injectErrorAtPosition(idx + 1);
                  }}
                  onPointerOver={(evt) => {
                    if (canInject) document.body.style.cursor = 'pointer';
                  }}
                  onPointerOut={(evt) => {
                    document.body.style.cursor = 'default';
                  }}
                >
                  <sphereGeometry args={[0.22, 20, 20]} />
                  <meshStandardMaterial
                    color={
                      val === 1
                        ? isMsg ? PALETTE.identity : PALETTE.parity
                        : '#37474f'
                    }
                    emissive={
                      val === 1
                        ? isMsg ? PALETTE.identity : PALETTE.parity
                        : '#111'
                    }
                    emissiveIntensity={val === 1 ? 0.9 : 0.1}
                    roughness={0.2}
                  />
                </mesh>

                {/* Bit value label */}
                <Text position={[0, 0.32, 0]} fontSize={0.16} color="#fff" fontWeight="bold">
                  {String(val)}
                </Text>
                <Text position={[0, -0.32, 0]} fontSize={0.11} color={isMsg ? PALETTE.identity : PALETTE.parity}>
                  {isMsg ? `m${idx}` : `p${idx - 4}`}
                </Text>
              </group>

              {/* Error Marker e */}
              {isFlipped && (
                <group position={[0, -0.6, 0]}>
                  <mesh>
                    <boxGeometry args={[0.2, 0.2, 0.2]} />
                    <meshStandardMaterial color="#ff5252" emissive="#ff5252" emissiveIntensity={0.5} />
                  </mesh>
                  <Text position={[0, 0, 0.15]} fontSize={0.14} color="#fff" fontWeight="bold">e</Text>
                </group>
              )}
            </group>
          );
        })}
      </group>

      {/* In-Flight Status Label during launch */}
      {launchProgress > 0 && (
        <Text position={[0, 0.7, 0]} fontSize={0.2} color="#64ffda" fontWeight="bold">
          {launchProgress < 0.95 ? 'TRANSMITTING DOWN CHANNEL →' : 'ARRIVED AT CHANNEL MIDPOINT'}
        </Text>
      )}
    </group>
  );
}

// -----------------------------------------------------------------------------
// Component: Physical "Encode & Send" Control Button (Task 4)
// -----------------------------------------------------------------------------
function EncodeSendButton({ onTrigger, disabled, isEncoding }) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={[0.2, 0, 2.2]}>
      {/* Base socket */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.7, 0.8, 0.9, 24]} />
        <meshStandardMaterial color="#2d1f19" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Button plunger */}
      <mesh
        position={[0, 0.95, 0]}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) onTrigger();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (!disabled) {
            setHovered(true);
            document.body.style.cursor = 'pointer';
          }
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        <cylinderGeometry args={[0.55, 0.58, 0.22, 24]} />
        <meshStandardMaterial
          color={isEncoding ? '#ff9800' : hovered ? '#00e676' : '#2e7d32'}
          emissive={isEncoding ? '#ff9800' : hovered ? '#00e676' : '#1b5e20'}
          emissiveIntensity={hovered || isEncoding ? 0.7 : 0.2}
          roughness={0.2}
        />
      </mesh>

      {/* Button Text Banner */}
      <Text
        position={[0, 1.25, 0]}
        fontSize={0.18}
        color={hovered ? '#69f0ae' : '#fff'}
        fontWeight="bold"
        anchorX="center"
      >
        {isEncoding ? 'ENCODING...' : 'ENCODE & SEND'}
      </Text>
    </group>
  );
}

// -----------------------------------------------------------------------------
// Main TransmitterStation Zone Component
// -----------------------------------------------------------------------------
export default function TransmitterStation() {
  const m = useLabStore((s) => s.m);
  const G = useLabStore((s) => s.G);
  const mode = useLabStore((s) => s.mode);
  const setMessageBit = useLabStore((s) => s.setMessageBit);
  const encodeAction = useLabStore((s) => s.encode);
  const setStage = useLabStore((s) => s.setStage);

  // Animation controller state
  const [animState, setAnimState] = useState({
    stage: 'idle', // 'idle' | 'activating' | 'fusing' | 'assembled' | 'launching'
    fuseColText: '',
  });
  const [rowAnimOffset, setRowAnimOffset] = useState({ rowTravelZ: 0, rowTravelY: 0 });
  const [launchProgress, setLaunchProgress] = useState(0);

  // Computed codeword for visual preview
  const computedCodeword = useMemo(() => gf2Encode(m, G), [m, G]);

  // Handle message bit toggle
  const handleToggleBit = (index) => {
    // If currently encoding/launching, reset to compose
    if (animState.stage !== 'idle') {
      setAnimState({ stage: 'idle', fuseColText: '' });
      setRowAnimOffset({ rowTravelZ: 0, rowTravelY: 0 });
      setLaunchProgress(0);
    }
    setMessageBit(index);
  };

  // Trigger the full "Encode & Send" animation pipeline
  const handleEncodeAndSend = () => {
    if (animState.stage !== 'idle' && animState.stage !== 'assembled') return;

    // Sub-step 1: G rows activate and glow
    setAnimState({ stage: 'activating', fuseColText: 'Active rows traveling to combination point...' });
    setStage('compose');

    // Sub-step 2: Rows travel forward (0.5s)
    setTimeout(() => {
      setRowAnimOffset({ rowTravelZ: 1.4, rowTravelY: -0.6 });
      setStage('compose');
    }, 200);

    // Sub-step 3: GF(2) fuse resolves overlaps (1.2s)
    setTimeout(() => {
      // Find columns where multiple active rows overlap to highlight GF(2) rule
      const activeRows = G.filter((_, idx) => m[idx] === 1);
      const overlaps = [];
      const n = G[0].length;
      for (let col = 0; col < n; col++) {
        const ones = activeRows.filter((row) => row[col] === 1).length;
        if (ones > 1) overlaps.push(`col ${col + 1} (${ones} ones → ${ones % 2})`);
      }
      const fuseNote = overlaps.length > 0 ? overlaps.join(', ') : 'Direct pass-through';

      setAnimState({
        stage: 'fusing',
        fuseColText: `GF(2) combine: ${fuseNote}`,
      });
      // Call store encode
      encodeAction();
      setStage('encoded');
    }, 1200);

    // Sub-step 4: Codeword is born with seam (2.2s)
    setTimeout(() => {
      setAnimState({ stage: 'assembled', fuseColText: '' });
      // Reset G rows back to rack position
      setRowAnimOffset({ rowTravelZ: 0, rowTravelY: 0 });
    }, 2200);

    // Sub-step 5: Launch codeword toward Noisy Channel (3.0s)
    setTimeout(() => {
      setAnimState({ stage: 'launching', fuseColText: '' });
      setStage('in-flight');
    }, 2800);
  };

  // Launch animation: lerp launchProgress from 0 to 1
  useFrame((_, delta) => {
    if (animState.stage === 'launching') {
      setLaunchProgress((prev) => {
        if (prev >= 1) return 1;
        return Math.min(prev + delta * 0.45, 1);
      });
    }
  });

  const k = G.length;

  return (
    <group position={[-12, 0, 0]}>
      {/* Zone Floor Plate */}
      <mesh receiveShadow position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[11, 8.5]} />
        <meshStandardMaterial color={PALETTE.floor} roughness={0.8} />
      </mesh>

      {/* Low Architectural Back Wall */}
      <mesh position={[-5.2, 1.8, 0]}>
        <boxGeometry args={[0.2, 3.6, 8.5]} />
        <meshStandardMaterial color={PALETTE.pedestal} roughness={0.6} />
      </mesh>

      {/* Main Zone Title Banner */}
      <Text position={[0, 4.8, -1.0]} fontSize={0.48} color={PALETTE.identity} fontWeight="bold" anchorX="center">
        TRANSMITTER STATION
      </Text>
      <Text position={[0, 4.35, -1.0]} fontSize={0.18} color={PALETTE.textMuted} anchorX="center">
        Construction & Redundancy Inoculation
      </Text>

      {/* Task 1: Message Console with k physical switches */}
      <MessageConsole m={m} k={k} onToggle={handleToggleBit} />

      {/* Task 2 & 3: Generator Matrix Rig */}
      <GeneratorMatrixRig G={G} m={m} animOffset={rowAnimOffset} mode={mode} />

      {/* Task 3 & 4: Codeword Assembly & Launch Animation */}
      <CodewordAssembly
        animState={animState}
        codeword={computedCodeword}
        launchProgress={launchProgress}
      />

      {/* Task 4: Physical "Encode & Send" Control Button */}
      <EncodeSendButton
        onTrigger={handleEncodeAndSend}
        disabled={animState.stage === 'launching'}
        isEncoding={animState.stage === 'activating' || animState.stage === 'fusing'}
      />

      {/* Dedicated Warm Point Lighting for Transmitter */}
      <pointLight position={[-2, 4.5, 2]} intensity={0.9} color="#ffb74d" distance={15} />
      <pointLight position={[1.5, 3.5, 0]} intensity={0.6} color="#ffe082" distance={12} />
    </group>
  );
}
