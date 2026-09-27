import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulationStore } from '../store/simulationStore';

export const BackWallDisplayBoard3D: React.FC = () => {
  const {
    stage,
    n,
    k,
    G,
    H,
    message,
    codeword,
    receivedVector,
    syndrome,
    errorPositions,
    lastCorrectedBit,
    calculationSteps,
    currentStepIndex,
    speedMultiplier,
  } = useSimulationStore();

  const r = n - k;
  const currentStep = calculationSteps[currentStepIndex];
  const isEncoding = stage === 'encoding';
  const isDerivationStep = isEncoding && (
    currentStep?.timelineStage === 'derive_parity_count' ||
    currentStep?.timelineStage === 'label_positions' ||
    currentStep?.timelineStage === 'build_parity_matrix' ||
    currentStep?.timelineStage === 'build_generator_matrix'
  );
  const isDecoding = stage === 'decoding';
  const isErrorDetected = stage === 'errorDetected';
  const isCorrected = stage === 'corrected';
  const hasChannelError = errorPositions.length > 0;

  // Refs for XOR animation on the screen
  const pulseRingRef = useRef<THREE.Mesh>(null);
  const inputSphereARef = useRef<THREE.Group>(null);
  const inputSphereBRef = useRef<THREE.Group>(null);
  const outputSphereRef = useRef<THREE.Group>(null);

  // Active column or row being processed
  const activeCol = currentStep?.activeCol ?? 0;
  const activeRow = currentStep?.activeRow ?? 0;

  // Compute XOR terms for the current step
  const activeMessageRows = useMemo(() => {
    const rows: number[] = [];
    message.forEach((bit, idx) => {
      if (bit === 1) rows.push(idx);
    });
    return rows;
  }, [message]);

  const xorOperandA = useMemo(() => {
    if (isEncoding) {
      if (activeMessageRows.length > 0) {
        return G[activeMessageRows[0]]?.[activeCol] ?? 0;
      }
      return 0;
    }
    if (isDecoding) {
      // First active column in H row
      const nonZeroCols = H[activeRow]?.map((v, c) => (v === 1 && receivedVector[c] === 1 ? 1 : 0)) ?? [];
      return nonZeroCols.find((v) => v === 1) ?? 0;
    }
    return 1;
  }, [isEncoding, isDecoding, activeMessageRows, G, H, activeCol, activeRow, receivedVector]);

  const xorOperandB = useMemo(() => {
    if (isEncoding) {
      if (activeMessageRows.length > 1) {
        return G[activeMessageRows[1]]?.[activeCol] ?? 0;
      }
      return 0;
    }
    if (isDecoding) {
      return 1;
    }
    return 0;
  }, [isEncoding, isDecoding, activeMessageRows, G, activeCol]);

  const xorResult = (xorOperandA ^ xorOperandB) & 1;

  // Animation cycle for the sleek XOR Fusion node on the board
  useFrame(({ clock }) => {
    const speed = speedMultiplier || 1;
    const t = (clock.getElapsedTime() * 1.5 * speed) % 2.0;

    // Phase 1: Inputs converge (0 -> 1.0)
    if (inputSphereARef.current && inputSphereBRef.current) {
      if (t < 1.0) {
        const p = t / 1.0;
        inputSphereARef.current.position.x = -1.2 + 0.8 * p;
        inputSphereARef.current.position.y = 0.5 - 0.4 * p;
        inputSphereARef.current.scale.setScalar(0.9 + 0.1 * p);

        inputSphereBRef.current.position.x = -1.2 + 0.8 * p;
        inputSphereBRef.current.position.y = -0.5 + 0.4 * p;
        inputSphereBRef.current.scale.setScalar(0.9 + 0.1 * p);
      } else {
        inputSphereARef.current.scale.setScalar(0);
        inputSphereBRef.current.scale.setScalar(0);
      }
    }

    // Phase 2: Shockwave pulse ring on convergence (1.0 -> 1.4)
    if (pulseRingRef.current) {
      if (t >= 1.0 && t < 1.5) {
        const p = (t - 1.0) / 0.5;
        pulseRingRef.current.scale.setScalar(0.4 + 1.2 * p);
        (pulseRingRef.current.material as THREE.MeshBasicMaterial).opacity = 0.8 * (1 - p);
      } else {
        pulseRingRef.current.scale.setScalar(0.001);
      }
    }

    // Phase 3: Result ball emerges and glides forward to accumulator (1.0 -> 2.0)
    if (outputSphereRef.current) {
      if (t >= 1.0) {
        const p = (t - 1.0) / 1.0;
        outputSphereRef.current.position.x = -0.4 + 1.6 * p;
        outputSphereRef.current.position.y = 0;
        outputSphereRef.current.scale.setScalar(Math.sin(p * Math.PI) * 1.1);
      } else {
        outputSphereRef.current.scale.setScalar(0);
      }
    }
  });

  const headerStatus = isEncoding && currentStep
    ? `STEP ${currentStep.stepIndex + 1} / ${currentStep.totalSteps}`
    : isEncoding
    ? 'ENCODING IN PROGRESS'
    : isDecoding
    ? 'PARITY VERIFICATION IN PROGRESS'
    : isErrorDetected
    ? 'PARITY VIOLATION DETECTED'
    : isCorrected
    ? 'CODEWORD INTEGRITY RESTORED'
    : hasChannelError
    ? 'TRANSMISSION NOISE ACTIVE'
    : 'STUDIO PRESENTATION SYSTEM';

  const headerToneColor = isErrorDetected
    ? '#f43f5e'
    : isCorrected
    ? '#10b981'
    : isEncoding || isDecoding
    ? '#3b82f6'
    : '#94a3b8';

  return (
    <group position={[0, 3.8, -6.5]}>
      {/* ================================================================= */}
      {/* 1. PHYSICAL DISPLAY BOARD HOUSING & AMBIENT EDGE LIGHTING          */}
      {/* ================================================================= */}
      {/* Dark Titanium Frame Chassis */}
      <mesh position={[0, 0, -0.04]}>
        <boxGeometry args={[13.2, 5.0, 0.12]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.4}
          metalness={0.8}
        />
      </mesh>

      {/* Brushed Metal Perimeter Rim */}
      <lineSegments position={[0, 0, 0.02]}>
        <edgesGeometry args={[new THREE.BoxGeometry(13.2, 5.0, 0.02)]} />
        <meshBasicMaterial color="#334155" />
      </lineSegments>

      {/* Screen Surface (Low Reflectivity Optical OLED Glass) */}
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[12.8, 4.6]} />
        <meshStandardMaterial
          color="#080d1a"
          emissive="#060913"
          emissiveIntensity={0.2}
          roughness={0.15}
          metalness={0.5}
        />
      </mesh>

      {/* Subtle Top & Bottom Screen Accent Lines */}
      <mesh position={[0, 2.18, 0.03]}>
        <planeGeometry args={[12.6, 0.02]} />
        <meshBasicMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0, -2.18, 0.03]}>
        <planeGeometry args={[12.6, 0.02]} />
        <meshBasicMaterial color="#1e293b" />
      </mesh>

      {/* ================================================================= */}
      {/* 2. SCREEN TOP HEADER BAR                                          */}
      {/* ================================================================= */}
      <group position={[0, 1.95, 0.04]}>
        {/* Left: System Title */}
        <Text
          position={[-6.0, 0, 0]}
          fontSize={0.16}
          color="#f8fafc"
          anchorX="left"
          anchorY="middle"
          letterSpacing={0.06}
        >
          {`GF(2) MATRIX PROCESSOR`}
        </Text>

        {/* Center: Live Status Badge */}
        <group position={[0, 0, 0]}>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[4.2, 0.3]} />
            <meshStandardMaterial color="#0f172a" roughness={0.6} />
          </mesh>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.13}
            color={headerToneColor}
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.08}
          >
            {headerStatus}
          </Text>
        </group>

        {/* Right: Code Preset Specification */}
        <Text
          position={[6.0, 0, 0]}
          fontSize={0.15}
          color="#94a3b8"
          anchorX="right"
          anchorY="middle"
          letterSpacing={0.04}
        >
          {`(${n}, ${k}) LINEAR BLOCK CODE`}
        </Text>
      </group>

      {/* ================================================================= */}
      {/* 3. THREE-COLUMN LIVE ARCHITECTURAL DISPLAY                        */}
      {/* ================================================================= */}
      <group visible={isEncoding || isDecoding}>
        {/* ----------------------------------------------------------------- */}
        {/* COLUMN 1: MATHEMATICAL FORMULA & INPUT VECTOR (Left)              */}
        {/* ----------------------------------------------------------------- */}
        <group position={[-4.2, 0, 0.04]}>
        {/* Panel Backdrop */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[3.8, 3.4]} />
          <meshStandardMaterial
            color="#0b1120"
            roughness={0.5}
            transparent
            opacity={0.8}
          />
        </mesh>
        <lineSegments position={[0, 0, 0.01]}>
          <edgesGeometry args={[new THREE.BoxGeometry(3.8, 3.4, 0.01)]} />
          <meshBasicMaterial color="#1e293b" />
        </lineSegments>

        <Text
          position={[-1.7, 1.45, 0.02]}
          fontSize={0.15}
          color="#94a3b8"
          anchorX="left"
          anchorY="middle"
          letterSpacing={0.05}
        >
          {isEncoding
            ? currentStep?.title ?? 'ENCODING MESSAGE'
            : isDecoding
            ? '1. PARITY CHECK EQUATION'
            : '1. CODE SPECIFICATION'}
        </Text>

        {/* Primary Formula Display */}
        <Text
          position={[-1.7, 1.05, 0.02]}
          fontSize={isDerivationStep ? 0.18 : 0.28}
          color="#f8fafc"
          anchorX="left"
          anchorY="middle"
          maxWidth={3.4}
          lineHeight={1.15}
        >
          {isEncoding
            ? isDerivationStep
              ? currentStep?.mathFormula ?? 'Derive the selected code layout'
              : 'c = m · G (mod 2)'
            : isDecoding
            ? 'S = r · Hᵀ (mod 2)'
            : 'G · Hᵀ = 0 (mod 2)'}
        </Text>

        {/* Formula Subtitle & Active Element */}
        <Text
          position={[-1.7, 0.65, 0.02]}
          fontSize={isEncoding ? 0.13 : 0.16}
          color="#60a5fa"
          anchorX="left"
          anchorY="middle"
          maxWidth={3.4}
          lineHeight={1.2}
        >
          {isEncoding
            ? currentStep?.subtitle ?? `Evaluating Column c${activeCol} of ${n}`
            : isDecoding
            ? `Evaluating Syndrome Bit s${activeRow} of ${r}`
            : `Systematic Form: G = [I${k} | P]`}
        </Text>

        {/* Active message / received bits breakdown */}
        <Text
          position={[-1.7, 0.25, 0.02]}
          fontSize={0.14}
          color="#94a3b8"
          anchorX="left"
          anchorY="middle"
        >
          {isEncoding
            ? isDerivationStep
              ? 'First derive the code layout; the real message is used in Step 5.'
              : `Message m = [${message.join(' ')}]`
            : isDecoding
            ? `Received r = [${receivedVector.join(' ')}]`
            : `Parity Form: H = [Pᵀ | I${r}]`}
        </Text>

        {/* Expanded linear sum row selection */}
        <Text
          position={[-1.7, isDerivationStep ? 0.02 : -0.25, 0.02]}
          fontSize={isDerivationStep ? 0.095 : 0.13}
          color="#e2e8f0"
          anchorX="left"
          anchorY="top"
          maxWidth={3.4}
          lineHeight={isDerivationStep ? 1.1 : 1.4}
        >
          {isEncoding
            ? currentStep?.expandedTerms ||
              `Active generator rows: ${activeMessageRows.map((i) => `r${i}`).join(' ⊕ ') || 'None'}`
            : isDecoding
            ? currentStep?.expandedTerms ||
              `Orthogonality check: S = 0 verifies valid codeword space.`
            : `Hamming distance d_min ≥ 3\nSingle-bit error correction t = 1`}
        </Text>

        {/* Result readout banner */}
        <group position={[0, -1.2, 0.02]} visible={!isDerivationStep}>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[3.4, 0.48]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <Text
            position={[-1.5, 0, 0.01]}
            fontSize={0.14}
            color="#94a3b8"
            anchorX="left"
            anchorY="middle"
          >
            {isEncoding ? 'Active Bit Result:' : isDecoding ? 'Parity Diagnosis:' : 'Status:'}
          </Text>
          <Text
            position={[1.5, 0, 0.01]}
            fontSize={0.17}
            color={
              isErrorDetected
                ? '#f43f5e'
                : isCorrected || isEncoding
                ? '#10b981'
                : '#38bdf8'
            }
            anchorX="right"
            anchorY="middle"
            letterSpacing={0.04}
          >
            {isEncoding
              ? currentStep?.mod2Result || `c${activeCol} = ${codeword[activeCol] ?? 0}`
              : isDecoding
              ? currentStep?.mod2Result || (hasChannelError ? 'S ≠ 0' : 'S = 0')
              : 'READY FOR TRANSMISSION'}
          </Text>
        </group>
      </group>

      {/* ----------------------------------------------------------------- */}
      {/* COLUMN 2: ELEGANT XOR FUSION PROCESSOR ANIMATION (Center)         */}
      {/* ----------------------------------------------------------------- */}
      <group position={[0, 0, 0.04]}>
        {/* Panel Backdrop */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[4.2, 3.4]} />
          <meshStandardMaterial
            color="#0b1120"
            roughness={0.5}
            transparent
            opacity={0.8}
          />
        </mesh>
        <lineSegments position={[0, 0, 0.01]}>
          <edgesGeometry args={[new THREE.BoxGeometry(4.2, 3.4, 0.01)]} />
          <meshBasicMaterial color="#1e293b" />
        </lineSegments>

        <Text
          position={[0, 1.45, 0.02]}
          fontSize={0.13}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.04}
        >
          2. MODULO-2 XOR OPERATION
        </Text>

        {/* Central XOR Addition Node Ring */}
        <group position={[-0.4, 0, 0.02]}>
          {/* Fusion Base Ring */}
          <mesh position={[0, 0, 0]}>
            <ringGeometry args={[0.38, 0.44, 36]} />
            <meshStandardMaterial
              color="#3b82f6"
              emissive="#1d4ed8"
              emissiveIntensity={0.6}
            />
          </mesh>

          {/* Central ⨁ Glyph */}
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.34}
            color="#f8fafc"
            anchorX="center"
            anchorY="middle"
          >
            ⨁
          </Text>

          {/* Shockwave Pulse Ring on convergence */}
          <mesh ref={pulseRingRef} position={[0, 0, 0.01]}>
            <ringGeometry args={[0.42, 0.52, 36]} />
            <meshBasicMaterial color="#60a5fa" transparent opacity={0} />
          </mesh>
        </group>

        {/* Dynamic Animated Input Ball A */}
        <group ref={inputSphereARef} position={[-1.2, 0.5, 0.03]}>
          <mesh>
            <circleGeometry args={[0.18, 24]} />
            <meshStandardMaterial
              color={xorOperandA === 1 ? '#3b82f6' : '#1e293b'}
              emissive={xorOperandA === 1 ? '#1d4ed8' : '#000000'}
              emissiveIntensity={xorOperandA === 1 ? 0.6 : 0.0}
            />
          </mesh>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.16}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            {xorOperandA.toString()}
          </Text>
        </group>

        {/* Dynamic Animated Input Ball B */}
        <group ref={inputSphereBRef} position={[-1.2, -0.5, 0.03]}>
          <mesh>
            <circleGeometry args={[0.18, 24]} />
            <meshStandardMaterial
              color={xorOperandB === 1 ? '#3b82f6' : '#1e293b'}
              emissive={xorOperandB === 1 ? '#1d4ed8' : '#000000'}
              emissiveIntensity={xorOperandB === 1 ? 0.6 : 0.0}
            />
          </mesh>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.16}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            {xorOperandB.toString()}
          </Text>
        </group>

        {/* Dynamic Output Result Ball emerging to the right */}
        <group ref={outputSphereRef} position={[0.8, 0, 0.03]}>
          <mesh>
            <circleGeometry args={[0.20, 24]} />
            <meshStandardMaterial
              color={xorResult === 1 ? '#10b981' : '#1e293b'}
              emissive={xorResult === 1 ? '#059669' : '#000000'}
              emissiveIntensity={xorResult === 1 ? 0.6 : 0.0}
            />
          </mesh>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.18}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            {xorResult.toString()}
          </Text>
        </group>

        {/* Animated Directional Conduits */}
        <mesh position={[-0.8, 0.25, 0.01]} rotation={[0, 0, -Math.PI / 6]}>
          <planeGeometry args={[0.7, 0.02]} />
          <meshBasicMaterial color="#334155" />
        </mesh>
        <mesh position={[-0.8, -0.25, 0.01]} rotation={[0, 0, Math.PI / 6]}>
          <planeGeometry args={[0.7, 0.02]} />
          <meshBasicMaterial color="#334155" />
        </mesh>
        <mesh position={[0.4, 0, 0.01]}>
          <planeGeometry args={[0.9, 0.02]} />
          <meshBasicMaterial color="#334155" />
        </mesh>

        {/* Live explanation for the current encoding step */}
        <group position={[0, -1.1, 0.02]}>
          <Text
            position={[0, 0.27, 0]}
            fontSize={0.09}
            color="#60a5fa"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.06}
          >
            {isEncoding ? 'WHY THIS STEP WORKS' : 'GALOIS FIELD GF(2) TRUTH TABLE'}
          </Text>
          <Text
            position={[0, -0.12, 0]}
            fontSize={isEncoding ? 0.095 : 0.11}
            color="#94a3b8"
            anchorX="center"
            anchorY={isEncoding ? 'top' : 'middle'}
            maxWidth={3.8}
            lineHeight={1.25}
            textAlign="center"
          >
            {isEncoding
              ? currentStep?.explanation ?? 'Select the rows where the message bit is 1, then combine them over GF(2).'
              : '0 ⊕ 0 = 0  ·  0 ⊕ 1 = 1  ·  1 ⊕ 0 = 1  ·  1 ⊕ 1 = 0'}
          </Text>
        </group>
      </group>

      {/* ----------------------------------------------------------------- */}
      {/* COLUMN 3: PROGRESSIVE VECTOR ACCUMULATOR (Right)                  */}
      {/* ----------------------------------------------------------------- */}
      <group position={[4.2, 0, 0.04]}>
        {/* Panel Backdrop */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[3.8, 3.4]} />
          <meshStandardMaterial
            color="#0b1120"
            roughness={0.5}
            transparent
            opacity={0.8}
          />
        </mesh>
        <lineSegments position={[0, 0, 0.01]}>
          <edgesGeometry args={[new THREE.BoxGeometry(3.8, 3.4, 0.01)]} />
          <meshBasicMaterial color="#1e293b" />
        </lineSegments>

        <Text
          position={[-1.7, 1.45, 0.02]}
          fontSize={0.13}
          color="#94a3b8"
          anchorX="left"
          anchorY="middle"
          letterSpacing={0.04}
        >
          {isEncoding
            ? '3. CODEWORD ACCUMULATOR'
            : isDecoding || isErrorDetected || isCorrected
            ? '3. SYNDROME DECODER'
            : '3. SYSTEM CHANNELS'}
        </Text>

        {/* Display Codeword Vector as sleek Circular Balls */}
        <group position={[0, 0.65, 0.02]}>
          <Text
            position={[-1.7, 0.35, 0]}
            fontSize={0.11}
            color="#64748b"
            anchorX="left"
            anchorY="middle"
          >
            {`Codeword c [${n} bits]:`}
          </Text>

          {/* Render circular binary balls for codeword */}
          {Array.from({ length: Math.min(n, 15) }).map((_, bIdx) => {
            const spacing = Math.min(0.24, 3.2 / n);
            const startX = -((Math.min(n, 15) - 1) * spacing) / 2;
            const x = startX + bIdx * spacing;
            const bitVal = isEncoding
              ? currentStep?.computedCodewordBits[bIdx] ?? null
              : codeword[bIdx] ?? 0;
            const isActive = isEncoding && activeCol === bIdx;
            const isCorrupted = errorPositions.includes(bIdx);

            return (
              <group key={`acc-bit-${bIdx}`} position={[x, 0, 0]}>
                <mesh>
                  <circleGeometry args={[spacing * 0.42, 20]} />
                  <meshStandardMaterial
                    color={
                      isCorrupted
                        ? '#f43f5e'
                        : isActive
                        ? '#3b82f6'
                      : bitVal === 1
                        ? '#f8fafc'
                      : bitVal === 0
                      ? '#1e293b'
                      : '#0f172a'
                    }
                    emissive={
                      isCorrupted
                        ? '#e11d48'
                        : isActive
                        ? '#1d4ed8'
                        : '#000000'
                    }
                    emissiveIntensity={isCorrupted || isActive ? 0.6 : 0.0}
                  />
                </mesh>
                <Text
                  position={[0, 0, 0.01]}
                  fontSize={spacing * 0.48}
                  color={
                    isCorrupted || isActive
                      ? '#ffffff'
                    : bitVal === 1
                      ? '#0f172a'
                      : '#64748b'
                  }
                  anchorX="center"
                  anchorY="middle"
                >
                  {bitVal === null ? '·' : bitVal.toString()}
                </Text>
                <Text
                  position={[0, -spacing * 0.62, 0.01]}
                  fontSize={spacing * 0.32}
                  color="#64748b"
                  anchorX="center"
                  anchorY="middle"
                >
                  {`c${bIdx}`}
                </Text>
              </group>
            );
          })}
        </group>

        {/* Display Syndrome Vector as sleek Circular Balls */}
        <group position={[0, -0.35, 0.02]}>
          <Text
            position={[-1.7, 0.35, 0]}
            fontSize={0.11}
            color="#64748b"
            anchorX="left"
            anchorY="middle"
          >
            {`Syndrome S = r·Hᵀ [${r} bits]:`}
          </Text>

          {Array.from({ length: r }).map((_, sIdx) => {
            const spacing = 0.55;
            const startX = -((r - 1) * spacing) / 2;
            const x = startX + sIdx * spacing;
            const synVal = syndrome[sIdx] ?? 0;
            const isNonZero = synVal === 1;

            return (
              <group key={`acc-syn-${sIdx}`} position={[x, 0, 0]}>
                <mesh>
                  <circleGeometry args={[0.18, 20]} />
                  <meshStandardMaterial
                    color={isNonZero ? '#f43f5e' : isCorrected ? '#10b981' : '#1e293b'}
                    emissive={isNonZero ? '#e11d48' : isCorrected ? '#059669' : '#000000'}
                    emissiveIntensity={isNonZero || isCorrected ? 0.6 : 0.0}
                  />
                </mesh>
                <Text
                  position={[0, 0, 0.01]}
                  fontSize={0.18}
                  color="#ffffff"
                  anchorX="center"
                  anchorY="middle"
                >
                  {synVal.toString()}
                </Text>
                <Text
                  position={[0, -0.28, 0.01]}
                  fontSize={0.11}
                  color="#64748b"
                  anchorX="center"
                  anchorY="middle"
                >
                  {`s${sIdx}`}
                </Text>
              </group>
            );
          })}
        </group>

        {/* Coset Syndrome Locator or Channel Status */}
        <group position={[0, -1.2, 0.02]}>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[3.4, 0.45]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.11}
            color={
              isErrorDetected
                ? '#fb7185'
                : isCorrected
                ? '#34d399'
                : '#94a3b8'
            }
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.02}
          >
            {isErrorDetected
              ? `Column c${errorPositions[0]} in H matches S ➔ Invert bit`
              : isCorrected
              ? `Bit c${lastCorrectedBit ?? 0} inverted ➔ S = [000]`
              : hasChannelError
              ? `Bit c${errorPositions[0]} flipped by noise`
              : `Channel: BSC (Binary Symmetric Channel)`}
          </Text>
        </group>
      </group>
      </group>
    </group>
  );
};
