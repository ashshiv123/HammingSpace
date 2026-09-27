import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulationStore } from '../store/simulationStore';

export const XorGateVisualizer3D: React.FC = () => {
  const {
    stage,
    calculationSteps,
    currentStepIndex,
    G,
    H,
    message,
    receivedVector,
    speedMultiplier,
    showXorVisualizer,
    setShowXorVisualizer,
  } = useSimulationStore();

  const isEncoding = stage === 'encoding';
  const isDecoding = stage === 'decoding';
  const isVisible = (isEncoding || isDecoding) && showXorVisualizer;

  // Refs for animated 3D parts
  const groupRef = useRef<THREE.Group>(null);
  const bitARef = useRef<THREE.Group>(null);
  const bitBRef = useRef<THREE.Group>(null);
  const resultBitRef = useRef<THREE.Group>(null);
  const nodeMeshRef = useRef<THREE.Mesh>(null);
  const pulseRingRef = useRef<THREE.Mesh>(null);
  const laserFlashRef = useRef<THREE.PointLight>(null);

  // Compute active bits converging based on current calculation step
  const currentStep = calculationSteps[currentStepIndex];

  const { bitA, bitB, resultBit, operationLabel, subLabel } = useMemo(() => {
    if (isEncoding) {
      const activeCol = currentStep?.activeCol ?? 0;
      // Find rows where message bit is 1
      const activeRows: number[] = [];
      message.forEach((m, idx) => {
        if (m === 1) activeRows.push(idx);
      });

      const val1 = activeRows.length > 0 && G[activeRows[0]] ? G[activeRows[0]][activeCol] ?? 1 : 1;
      const val2 = activeRows.length > 1 && G[activeRows[1]] ? G[activeRows[1]][activeCol] ?? 0 : 0;
      const res = (val1 ^ val2) & 1;

      return {
        bitA: val1,
        bitB: val2,
        resultBit: res,
        operationLabel: `ENCODING c${activeCol}: ${val1} ⊕ ${val2} = ${res}`,
        subLabel: `Col c${activeCol} • Row G${activeRows[0] ?? 0} & G${activeRows[1] ?? 1}`,
      };
    } else if (isDecoding) {
      const sIdx = currentStep?.activeRow ?? 0;
      // Parity check row in H
      const nonZeroCols: number[] = [];
      if (H[sIdx]) {
        H[sIdx].forEach((hVal, cIdx) => {
          if (hVal === 1 && (receivedVector[cIdx] ?? 0) === 1) {
            nonZeroCols.push(cIdx);
          }
        });
      }
      const val1 = nonZeroCols.length > 0 ? (receivedVector[nonZeroCols[0]] ?? 1) : 1;
      const val2 = nonZeroCols.length > 1 ? (receivedVector[nonZeroCols[1]] ?? 1) : 0;
      const res = (val1 ^ val2) & 1;

      return {
        bitA: val1,
        bitB: val2,
        resultBit: res,
        operationLabel: `PARITY CHECK s${sIdx}: ${val1} ⊕ ${val2} = ${res}`,
        subLabel: `Syndrome Bit s${sIdx} = ⨁ (rᵢ · H_${sIdx},ᵢ)`,
      };
    }

    return {
      bitA: 1,
      bitB: 0,
      resultBit: 1,
      operationLabel: 'GF(2) MOD-2 ADDITION: 1 ⊕ 0 = 1',
      subLabel: 'Modulo-2 Addition',
    };
  }, [isEncoding, isDecoding, currentStep, G, H, message, receivedVector]);

  // Spatial location:
  // Left for encoding [-2.8, 1.45, 1.2], Right for decoding [2.8, 1.45, 1.2]
  const targetPos = useMemo<[number, number, number]>(() => {
    return isEncoding ? [-2.8, 1.45, 1.2] : [2.8, 1.45, 1.2];
  }, [isEncoding]);

  // Animation cycle: Input bits slide in -> Converge with flash -> Result bit emerges
  useFrame(({ clock }) => {
    if (!isVisible) return;

    const rate = 1.3 * (speedMultiplier || 1);
    const cycleTime = 2.4;
    const t = (clock.getElapsedTime() * rate) % cycleTime;

    // Smooth position lerp for visualizer when switching tx <-> rx
    if (groupRef.current) {
      groupRef.current.position.lerp(new THREE.Vector3(...targetPos), 0.08);
    }

    // Phase 1: Inputs slide along conduits toward center (t: 0 -> 1.0)
    if (bitARef.current && bitBRef.current) {
      if (t < 1.0) {
        const progress = t / 1.0;
        const inA_X = THREE.MathUtils.lerp(-1.6, 0, progress);
        const inA_Y = THREE.MathUtils.lerp(0.65, 0, progress);
        bitARef.current.position.set(inA_X, inA_Y, 0.08);
        bitARef.current.scale.setScalar(1);

        const inB_X = THREE.MathUtils.lerp(-1.6, 0, progress);
        const inB_Y = THREE.MathUtils.lerp(-0.65, 0, progress);
        bitBRef.current.position.set(inB_X, inB_Y, 0.08);
        bitBRef.current.scale.setScalar(1);
      } else {
        // Absorbed into central XOR node
        bitARef.current.position.set(0, 0, -10);
        bitBRef.current.position.set(0, 0, -10);
        bitARef.current.scale.setScalar(0);
        bitBRef.current.scale.setScalar(0);
      }
    }

    // Phase 2: XOR Node Flash & Convergence Ring (t: 1.0 -> 1.35)
    if (nodeMeshRef.current && pulseRingRef.current) {
      if (t >= 0.98 && t <= 1.35) {
        const flashProgress = (t - 0.98) / 0.37;
        const ringScale = 1 + flashProgress * 1.5;
        pulseRingRef.current.scale.set(ringScale, ringScale, ringScale);
        pulseRingRef.current.visible = true;

        if (nodeMeshRef.current.material) {
          (nodeMeshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
            2.2 * Math.sin(flashProgress * Math.PI);
        }
        if (laserFlashRef.current) {
          laserFlashRef.current.intensity = 3.5 * Math.sin(flashProgress * Math.PI);
        }
      } else {
        pulseRingRef.current.visible = false;
        if (nodeMeshRef.current.material) {
          (nodeMeshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.4;
        }
        if (laserFlashRef.current) {
          laserFlashRef.current.intensity = 0;
        }
      }
    }

    // Phase 3: Result bit emerges and travels along output rail (t: 1.25 -> 2.35)
    if (resultBitRef.current) {
      if (t >= 1.25 && t < 2.35) {
        const outProgress = (t - 1.25) / 1.1;
        const outX = THREE.MathUtils.lerp(0, 1.6, outProgress);
        resultBitRef.current.position.set(outX, 0, 0.08);
        // Fade out slightly near end of track
        const outScale = outProgress > 0.85 ? Math.max(0, (1 - outProgress) * 6.6) : 1;
        resultBitRef.current.scale.setScalar(outScale);
      } else {
        resultBitRef.current.position.set(0, 0, -10);
        resultBitRef.current.scale.setScalar(0);
      }
    }
  });

  if (!isVisible) return null;

  return (
    <group ref={groupRef} position={targetPos}>
      {/* Dynamic Laser Light Flash on Convergence */}
      <pointLight ref={laserFlashRef} position={[0, 0, 0.4]} color="#22d3ee" intensity={0} distance={4} />

      {/* Visualizer Backplate Housing */}
      <mesh position={[0, 0, -0.12]}>
        <boxGeometry args={[4.2, 2.2, 0.1]} />
        <meshStandardMaterial
          color="#060913"
          roughness={0.65}
          metalness={0.9}
        />
      </mesh>

      {/* Perimeter Rim Accent */}
      <lineSegments position={[0, 0, -0.06]}>
        <edgesGeometry args={[new THREE.BoxGeometry(4.2, 2.2, 0.02)]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.5} />
      </lineSegments>

      {/* Top Header Card */}
      <group position={[0, 0.86, 0.02]}>
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[3.8, 0.32]} />
          <meshBasicMaterial color="#090e1a" />
        </mesh>
        <Text
          position={[0, 0.02, 0]}
          fontSize={0.11}
          color="#22D3EE"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.06}
        >
          {operationLabel}
        </Text>

        {/* 3D Dismiss button for XOR Visualizer */}
        <group
          position={[1.74, 0, 0.04]}
          onClick={(e) => {
            e.stopPropagation();
            setShowXorVisualizer(false);
          }}
        >
          <mesh>
            <boxGeometry args={[0.28, 0.22, 0.05]} />
            <meshStandardMaterial
              color="#7f1d1d"
              emissive="#ef4444"
              emissiveIntensity={0.6}
              roughness={0.4}
            />
          </mesh>
          <Text position={[0, 0, 0.04]} fontSize={0.11} color="#ffffff" anchorX="center" anchorY="middle">
            ✕
          </Text>
        </group>
      </group>

      {/* Input Conduits (Top-left & Bottom-left converging to center) */}
      <mesh position={[-0.8, 0.325, -0.02]} rotation={[0, 0, -Math.atan2(0.65, 1.6)]}>
        <cylinderGeometry args={[0.018, 0.018, 1.72, 12]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>

      <mesh position={[-0.8, -0.325, -0.02]} rotation={[0, 0, Math.atan2(0.65, 1.6)]}>
        <cylinderGeometry args={[0.018, 0.018, 1.72, 12]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>

      {/* Input Port Sockets */}
      <mesh position={[-1.6, 0.65, -0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.06, 24]} />
        <meshStandardMaterial color="#0c1322" metalness={0.8} />
      </mesh>
      <Text position={[-1.92, 0.65, 0.02]} fontSize={0.10} color="#64748b" anchorX="right" anchorY="middle">
        IN A
      </Text>

      <mesh position={[-1.6, -0.65, -0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.06, 24]} />
        <meshStandardMaterial color="#0c1322" metalness={0.8} />
      </mesh>
      <Text position={[-1.92, -0.65, 0.02]} fontSize={0.10} color="#64748b" anchorX="right" anchorY="middle">
        IN B
      </Text>

      {/* Output Conduit (Emerging from center to right) */}
      <mesh position={[0.8, 0, -0.02]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 1.6, 12]} />
        <meshBasicMaterial color="#4ade80" />
      </mesh>

      {/* Output Port Socket */}
      <mesh position={[1.6, 0, -0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.24, 0.24, 0.06, 24]} />
        <meshStandardMaterial color="#0c1322" metalness={0.8} />
      </mesh>
      <Text position={[1.95, 0, 0.02]} fontSize={0.10} color="#4ade80" anchorX="left" anchorY="middle">
        OUT (A ⊕ B)
      </Text>

      {/* ============================================================== */}
      {/* CENTRAL 3D XOR GATE NODE                                       */}
      {/* ============================================================== */}
      <group position={[0, 0, 0]}>
        {/* Outer Glowing Torus Rim */}
        <mesh>
          <torusGeometry args={[0.45, 0.03, 16, 32]} />
          <meshStandardMaterial
            color="#22d3ee"
            emissive="#0891b2"
            emissiveIntensity={0.8}
            roughness={0.3}
          />
        </mesh>

        {/* Central Gate Body Mesh */}
        <mesh ref={nodeMeshRef} position={[0, 0, -0.02]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.08, 32]} />
          <meshStandardMaterial
            color="#080e1a"
            emissive="#22d3ee"
            emissiveIntensity={0.4}
            roughness={0.4}
            metalness={0.8}
          />
        </mesh>

        {/* ⨁ Mathematical XOR Symbol */}
        <Text
          position={[0, 0.04, 0.06]}
          fontSize={0.32}
          color="#38bdf8"
          anchorX="center"
          anchorY="middle"
        >
          ⨁
        </Text>

        <Text
          position={[0, -0.22, 0.06]}
          fontSize={0.09}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.04}
        >
          XOR GATE
        </Text>

        {/* Convergence Pulse Burst Ring */}
        <mesh ref={pulseRingRef} position={[0, 0, 0.01]} visible={false}>
          <ringGeometry args={[0.42, 0.52, 32]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* ============================================================== */}
      {/* CONVERGING INPUT BIT A                                         */}
      {/* ============================================================== */}
      <group ref={bitARef} position={[-1.6, 0.65, 0.08]}>
        <mesh>
          <boxGeometry args={[0.28, 0.28, 0.2]} />
          <meshStandardMaterial
            color={bitA === 1 ? '#38bdf8' : '#0e1726'}
            emissive={bitA === 1 ? '#0284c7' : '#000000'}
            emissiveIntensity={bitA === 1 ? 0.9 : 0.0}
            roughness={0.3}
            metalness={0.8}
          />
        </mesh>
        <Text
          position={[0, 0, 0.12]}
          fontSize={0.16}
          color={bitA === 1 ? '#04161f' : '#64748b'}
          anchorX="center"
          anchorY="middle"
        >
          {bitA.toString()}
        </Text>
      </group>

      {/* ============================================================== */}
      {/* CONVERGING INPUT BIT B                                         */}
      {/* ============================================================== */}
      <group ref={bitBRef} position={[-1.6, -0.65, 0.08]}>
        <mesh>
          <boxGeometry args={[0.28, 0.28, 0.2]} />
          <meshStandardMaterial
            color={bitB === 1 ? '#38bdf8' : '#0e1726'}
            emissive={bitB === 1 ? '#0284c7' : '#000000'}
            emissiveIntensity={bitB === 1 ? 0.9 : 0.0}
            roughness={0.3}
            metalness={0.8}
          />
        </mesh>
        <Text
          position={[0, 0, 0.12]}
          fontSize={0.16}
          color={bitB === 1 ? '#04161f' : '#64748b'}
          anchorX="center"
          anchorY="middle"
        >
          {bitB.toString()}
        </Text>
      </group>

      {/* ============================================================== */}
      {/* EMERGING RESULT BIT                                            */}
      {/* ============================================================== */}
      <group ref={resultBitRef} position={[0, 0, 0.08]}>
        <mesh>
          <boxGeometry args={[0.32, 0.32, 0.22]} />
          <meshStandardMaterial
            color={resultBit === 1 ? '#4ade80' : '#0e1726'}
            emissive={resultBit === 1 ? '#16a34a' : '#000000'}
            emissiveIntensity={resultBit === 1 ? 1.0 : 0.0}
            roughness={0.3}
            metalness={0.8}
          />
        </mesh>
        <Text
          position={[0, 0, 0.13]}
          fontSize={0.18}
          color={resultBit === 1 ? '#05190b' : '#64748b'}
          anchorX="center"
          anchorY="middle"
        >
          {resultBit.toString()}
        </Text>
      </group>

      {/* Bottom Subtitle / Mod-2 Truth Key */}
      <group position={[0, -0.86, 0.02]}>
        <Text
          fontSize={0.095}
          color="#64748b"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.02}
        >
          GF(2) Arithmetic: 0⊕0=0 | 0⊕1=1 | 1⊕0=1 | 1⊕1=0
        </Text>
      </group>
    </group>
  );
};
