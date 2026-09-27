/**
 * BackWallDisplayBoard3D.jsx — Live matrix display board on back wall
 *
 * Adapted from project_simulation's BackWallDisplayBoard3D.tsx.
 * Converted from TypeScript to plain JSX.
 * Connects to HammingSpace's labStore state.
 *
 * Renders a large 3D architectural display board showing:
 * - Generator Matrix G (left panel)
 * - XOR Gate Visualizer (center panel)
 * - Codeword Accumulator / Syndrome Decoder (right panel)
 */

import React from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useLabStore } from '../state/labStore.js';

export default function BackWallDisplayBoard3D({ position = [0, 7.5, -24.4], scale = [1.4, 1.4, 1.4] }) {
  const n = useLabStore(s => s.n);
  const k = useLabStore(s => s.k);
  const G = useLabStore(s => s.G);
  const H = useLabStore(s => s.H);
  const m = useLabStore(s => s.m);
  const c = useLabStore(s => s.c);
  const e = useLabStore(s => s.e);
  const S = useLabStore(s => s.S);
  const currentStage = useLabStore(s => s.currentStage);
  const calculationSteps = useLabStore(s => s.calculationSteps);
  const currentStepIndex = useLabStore(s => s.currentStepIndex);

  const currentStep = calculationSteps[currentStepIndex];

  const isEncoding = currentStage === 'encoded' || (currentStep && currentStep.type === 'encoding');
  const isDecoding = currentStage === 'decoded' || (currentStep && currentStep.type === 'syndrome');
  const isErrorDetected = currentStage === 'decoded' && S && S.some(b => b === 1);
  const isCorrected = currentStage === 'corrected';
  const r_n = n - k; // parity check rows

  // Active rows of G based on message bits
  const activeRows = m.reduce((acc, bit, idx) => { if (bit === 1) acc.push(idx); return acc; }, []);

  // Highlight info from current calculation step
  const stepHighlightRows = currentStep?.highlightRows ?? [];
  const stepHighlightCols = currentStep?.highlightCols ?? [];
  const stepActiveCells = currentStep?.activeCells ?? [];
  const activeCol = currentStep?.activeCol ?? -1;

  // Error positions (0-based)
  const errorPositions = e ? e.reduce((acc, bit, idx) => { if (bit === 1) acc.push(idx); return acc; }, []) : [];
  const lastCorrectedBit = isCorrected && currentStage === 'corrected' && useLabStore.getState().errorPosition
    ? useLabStore.getState().errorPosition - 1
    : null;

  return (
    <group position={position} scale={scale}>
      {/* Board Backdrop */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[17.0, 5.2]} />
        <meshStandardMaterial color="#080d1a" roughness={0.7} transparent opacity={0.97} />
      </mesh>
      {/* Board outer frame */}
      <lineSegments position={[0, 0, 0.01]}>
        <edgesGeometry args={[new THREE.BoxGeometry(17.0, 5.2, 0.01)]} />
        <meshBasicMaterial color="#1e3a5f" />
      </lineSegments>

      {/* Accent LED strip top */}
      <mesh position={[0, 2.68, 0.01]}>
        <boxGeometry args={[17.0, 0.08, 0.01]} />
        <meshBasicMaterial color="#1e3a5f" />
      </mesh>

      {/* ======================================================= */}
      {/* LEFT PANEL: Generator Matrix G                         */}
      {/* ======================================================= */}
      <group position={[-5.6, 0, 0.04]}>
        {/* Panel Backdrop */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[4.8, 4.8]} />
          <meshStandardMaterial color="#0b1120" roughness={0.5} transparent opacity={0.8} />
        </mesh>

        {/* Panel Title */}
        <Text position={[-2.2, 2.15, 0.02]} fontSize={0.13} color="#94a3b8" anchorX="left" anchorY="middle" letterSpacing={0.04}>
          {isDecoding || isErrorDetected || isCorrected ? '1. PARITY CHECK MATRIX H' : '1. GENERATOR MATRIX G'}
        </Text>

        {/* Render matrix rows */}
        {(isDecoding || isErrorDetected || isCorrected ? H : G).map((row, rIdx) => {
          const isActiveRow = !isDecoding
            ? stepHighlightRows.includes(rIdx) || activeRows.includes(rIdx)
            : false;
          const rowY = 1.6 - rIdx * (3.0 / Math.max(k, 3));
          const isHRow = isDecoding || isErrorDetected || isCorrected;

          return (
            <group key={`row-${rIdx}`} position={[0, rowY, 0.02]}>
              {/* Row label */}
              <Text position={[-2.2, 0, 0]} fontSize={0.12} color={isActiveRow ? '#60a5fa' : '#334155'} anchorX="left" anchorY="middle">
                {isHRow ? `h${rIdx}` : `g${rIdx}(m${rIdx}=${m[rIdx]})`}
              </Text>

              {/* Row cells */}
              {row.map((val, cIdx) => {
                const cellX = -1.0 + cIdx * (2.0 / Math.max(n - 1, 1));
                const isStepCell = stepActiveCells.some(([r, c]) => r === rIdx && c === cIdx);
                const isStepCol = stepHighlightCols.includes(cIdx) || activeCol === cIdx;
                const isIdentityPart = !isHRow && cIdx < k;

                let cellColor = val === 1 ? '#f8fafc' : '#1e293b';
                let emissiveColor = '#000000';
                let emissiveIntensity = 0;

                if (isStepCell) { cellColor = '#22d3ee'; emissiveColor = '#0e7490'; emissiveIntensity = 0.7; }
                else if (isStepCol) { cellColor = '#3b82f6'; emissiveColor = '#1d4ed8'; emissiveIntensity = 0.4; }
                else if (isActiveRow && val === 1) {
                  cellColor = isIdentityPart ? '#ffd54f' : '#ff7043';
                  emissiveColor = isIdentityPart ? '#ffd54f' : '#ff7043';
                  emissiveIntensity = 0.4;
                }

                return (
                  <group key={`cell-${rIdx}-${cIdx}`} position={[cellX, 0, 0]}>
                    <mesh>
                      <circleGeometry args={[0.13, 16]} />
                      <meshStandardMaterial color={cellColor} emissive={emissiveColor} emissiveIntensity={emissiveIntensity} />
                    </mesh>
                    <Text position={[0, 0, 0.01]} fontSize={0.13} color={val === 1 && !isStepCell ? '#0f172a' : '#ffffff'} anchorX="center" anchorY="middle">
                      {val.toString()}
                    </Text>
                    <Text position={[0, -0.2, 0.01]} fontSize={0.08} color="#334155" anchorX="center" anchorY="middle">
                      {`c${cIdx}`}
                    </Text>
                  </group>
                );
              })}
            </group>
          );
        })}
      </group>

      {/* ======================================================= */}
      {/* CENTER PANEL: XOR Gate / Status                        */}
      {/* ======================================================= */}
      <group position={[0, 0, 0.04]}>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[4.2, 4.8]} />
          <meshStandardMaterial color="#0b1120" roughness={0.5} transparent opacity={0.8} />
        </mesh>

        <Text position={[0, 2.15, 0.01]} fontSize={0.13} color="#94a3b8" anchorX="center" anchorY="middle" letterSpacing={0.04}>
          2. GF(2) ARITHMETIC GATE
        </Text>

        {/* XOR symbol */}
        <mesh position={[0, 0.5, 0.02]}>
          <circleGeometry args={[0.7, 32]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.5, 0.03]}>
          <circleGeometry args={[0.68, 32]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} />
        </mesh>
        <Text position={[0, 0.5, 0.04]} fontSize={0.55} color="#60a5fa" anchorX="center" anchorY="middle">
          ⊕
        </Text>

        {/* Operation label */}
        <Text position={[0, -0.3, 0.02]} fontSize={0.15} color="#475569" anchorX="center" anchorY="middle">
          {isEncoding ? 'MODULO 2 ADD' : isDecoding ? 'PARITY CHECK' : 'XOR (MOD 2)'}
        </Text>

        {/* Truth table reminder */}
        <Text position={[0, -0.7, 0.02]} fontSize={0.09} color="#334155" anchorX="center" anchorY="middle" letterSpacing={0.03}>
          GF(2) TRUTH TABLE
        </Text>
        <Text position={[0, -0.9, 0.02]} fontSize={0.10} color="#475569" anchorX="center" anchorY="middle">
          0⊕0=0  ·  0⊕1=1  ·  1⊕0=1  ·  1⊕1=0
        </Text>

        {/* Stage formula */}
        <Text position={[0, -1.4, 0.02]} fontSize={0.12} color={isEncoding ? '#60a5fa' : isDecoding ? '#a78bfa' : '#475569'} anchorX="center" anchorY="middle" fontWeight="bold">
          {isEncoding ? 'c = m · G (mod 2)' : isDecoding || isErrorDetected ? 'S = r · Hᵀ (mod 2)' : isCorrected ? 'ĉ = r ⊕ e (mod 2)' : 'c = m · G  |  S = r · Hᵀ'}
        </Text>
      </group>

      {/* ======================================================= */}
      {/* RIGHT PANEL: Codeword Accumulator / Syndrome Decoder   */}
      {/* ======================================================= */}
      <group position={[5.6, 0, 0.04]}>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[4.8, 4.8]} />
          <meshStandardMaterial color="#0b1120" roughness={0.5} transparent opacity={0.8} />
        </mesh>

        <Text position={[-2.2, 2.15, 0.02]} fontSize={0.13} color="#94a3b8" anchorX="left" anchorY="middle" letterSpacing={0.04}>
          {isEncoding ? '3. CODEWORD ACCUMULATOR' : isDecoding || isErrorDetected || isCorrected ? '3. SYNDROME DECODER' : '3. SYSTEM CHANNELS'}
        </Text>

        {/* Codeword c bits */}
        <group position={[0, 0.8, 0.02]}>
          <Text position={[-2.1, 0.35, 0]} fontSize={0.11} color="#64748b" anchorX="left" anchorY="middle">
            {`Codeword c [${n} bits]:`}
          </Text>

          {Array.from({ length: Math.min(n, 15) }).map((_, bIdx) => {
            const spacing = Math.min(0.28, 3.8 / n);
            const startX = -((Math.min(n, 15) - 1) * spacing) / 2;
            const x = startX + bIdx * spacing;
            const bitVal = c[bIdx] ?? 0;
            const isActive = isEncoding && activeCol === bIdx;
            const isCorrupted = errorPositions.includes(bIdx);
            const isCorrectedBit = isCorrected && lastCorrectedBit === bIdx;

            let color = isCorrupted ? '#f43f5e' : isActive ? '#3b82f6' : bitVal === 1 ? '#f8fafc' : '#1e293b';
            let emissive = isCorrupted ? '#e11d48' : isActive ? '#1d4ed8' : '#000000';
            let emissiveInt = isCorrupted || isActive ? 0.6 : 0;
            if (isCorrectedBit) { color = '#10b981'; emissive = '#059669'; emissiveInt = 0.7; }

            return (
              <group key={`c-bit-${bIdx}`} position={[x, 0, 0]}>
                <mesh>
                  <circleGeometry args={[spacing * 0.42, 18]} />
                  <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={emissiveInt} />
                </mesh>
                <Text position={[0, 0, 0.01]} fontSize={spacing * 0.5} color={isCorrupted || isActive || isCorrectedBit ? '#ffffff' : bitVal === 1 ? '#0f172a' : '#64748b'} anchorX="center" anchorY="middle">
                  {bitVal.toString()}
                </Text>
                <Text position={[0, -spacing * 0.65, 0.01]} fontSize={spacing * 0.32} color="#334155" anchorX="center" anchorY="middle">
                  {`c${bIdx}`}
                </Text>
              </group>
            );
          })}
        </group>

        {/* Syndrome S bits */}
        <group position={[0, -0.35, 0.02]}>
          <Text position={[-2.1, 0.35, 0]} fontSize={0.11} color="#64748b" anchorX="left" anchorY="middle">
            {`Syndrome S = r·Hᵀ [${r_n} bits]:`}
          </Text>

          {Array.from({ length: r_n }).map((_, sIdx) => {
            const spacing = 0.55;
            const startX = -((r_n - 1) * spacing) / 2;
            const x = startX + sIdx * spacing;
            const synVal = S && S[sIdx] !== undefined ? S[sIdx] : 0;
            const isNonZero = synVal === 1;

            return (
              <group key={`s-bit-${sIdx}`} position={[x, 0, 0]}>
                <mesh>
                  <circleGeometry args={[0.19, 18]} />
                  <meshStandardMaterial color={isNonZero ? '#f43f5e' : isCorrected ? '#10b981' : '#1e293b'} emissive={isNonZero ? '#e11d48' : isCorrected ? '#059669' : '#000000'} emissiveIntensity={isNonZero || isCorrected ? 0.6 : 0} />
                </mesh>
                <Text position={[0, 0, 0.01]} fontSize={0.18} color="#ffffff" anchorX="center" anchorY="middle">
                  {synVal.toString()}
                </Text>
                <Text position={[0, -0.3, 0.01]} fontSize={0.11} color="#334155" anchorX="center" anchorY="middle">
                  {`s${sIdx}`}
                </Text>
              </group>
            );
          })}
        </group>

        {/* Status label */}
        <group position={[0, -1.35, 0.02]}>
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[4.4, 0.45]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <Text position={[0, 0, 0.01]} fontSize={0.11} color={isErrorDetected ? '#fb7185' : isCorrected ? '#34d399' : '#94a3b8'} anchorX="center" anchorY="middle" letterSpacing={0.02}>
            {isErrorDetected
              ? `S=[${(S || []).join('')}] ➔ Error bit detected — Apply Correction`
              : isCorrected
              ? `Bit corrected ➔ S=[${Array(r_n).fill(0).join('')}] — VALID`
              : errorPositions.length > 0
              ? `Noise injected at bit c${errorPositions[0]} — transmit to receiver`
              : `Channel: Binary Symmetric Channel (BSC)`}
          </Text>
        </group>
      </group>
    </group>
  );
}
