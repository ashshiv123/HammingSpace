import React, { useMemo } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

export interface MatrixGridProps {
  data: number[][]; // rows x cols
  position?: [number, number, number];
  rotation?: [number, number, number];
  highlightIndices?: {
    rows?: number[];
    cols?: number[];
    cells?: [number, number][];
    extractedRows?: number[];
  };
  label?: string;
  sublabel?: string;
  cellSize?: number;
  gap?: number;
  onCellClick?: (row: number, col: number) => void;
  isDimmed?: boolean;
}

export const MatrixGrid: React.FC<MatrixGridProps> = ({
  data,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  highlightIndices,
  label,
  sublabel,
  cellSize,
  gap,
  onCellClick,
  isDimmed = false,
}) => {
  const rows = data.length;
  const cols = data[0]?.length ?? 0;

  // Compact, proportional dynamic cell sizing for arbitrary (n,k)
  const effectiveCellSize = useMemo(() => {
    if (cellSize) return cellSize;
    return Math.min(0.30, Math.max(0.18, 3.8 / Math.max(cols, rows * 1.05)));
  }, [cellSize, cols, rows]);

  const effectiveGap = gap ?? Math.max(0.03, effectiveCellSize * 0.16);

  const stride = effectiveCellSize + effectiveGap;
  const totalWidth = cols * stride - effectiveGap;
  const totalHeight = rows * stride - effectiveGap;
  const startX = -totalWidth / 2 + effectiveCellSize / 2;
  const startY = totalHeight / 2 - effectiveCellSize / 2;

  const highlightedRows = useMemo(
    () => new Set(highlightIndices?.rows ?? []),
    [highlightIndices?.rows]
  );
  const highlightedCols = useMemo(
    () => new Set(highlightIndices?.cols ?? []),
    [highlightIndices?.cols]
  );
  const highlightedCells = useMemo(() => {
    const set = new Set<string>();
    highlightIndices?.cells?.forEach(([r, c]) => set.add(`${r},${c}`));
    return set;
  }, [highlightIndices?.cells]);

  const extractedRows = useMemo(
    () => new Set(highlightIndices?.extractedRows ?? highlightIndices?.rows ?? []),
    [highlightIndices?.extractedRows, highlightIndices?.rows]
  );

  if (rows === 0 || cols === 0) return null;

  return (
    <group position={position} rotation={rotation}>
      {/* 3D Chassis Base Plate with real physical depth */}
      <mesh position={[0, 0, -effectiveCellSize * 0.35]}>
        <boxGeometry args={[totalWidth + 0.45, totalHeight + 0.45, effectiveCellSize * 0.3]} />
        <meshStandardMaterial
          color={isDimmed ? '#0f172a' : '#1e293b'}
          roughness={0.5}
          metalness={0.7}
        />
      </mesh>

      {/* Structural Perimeter Border */}
      <lineSegments position={[0, 0, -effectiveCellSize * 0.19]}>
        <edgesGeometry
          args={[new THREE.BoxGeometry(totalWidth + 0.47, totalHeight + 0.47, 0.02)]}
        />
        <meshBasicMaterial
          color={isDimmed ? '#1e293b' : '#475569'}
          transparent
          opacity={isDimmed ? 0.3 : 0.6}
        />
      </lineSegments>

      {/* NON-OVERLAPPING HEADER ZONE: Separated distinctly above the cells */}
      {label && (
        <group position={[0, totalHeight / 2 + 0.65, 0]}>
          <Text
            fontSize={Math.min(0.20, Math.max(0.14, 2.6 / cols))}
            color={isDimmed ? '#64748b' : '#F5F5F0'}
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.06}
          >
            {label}
          </Text>
          {sublabel && (
            <Text
              position={[0, -0.22, 0]}
              fontSize={Math.min(0.11, Math.max(0.09, 1.8 / cols))}
              color="#64748b"
              anchorX="center"
              anchorY="middle"
            >
              {sublabel}
            </Text>
          )}
        </group>
      )}

      {/* Column Headers (c0, c1, ... cn-1) positioned cleanly between sublabel and top row */}
      {Array.from({ length: cols }, (_, c) => {
        const x = startX + c * stride;
        const isColActive = highlightedCols.has(c);
        return (
          <Text
            key={`col-lbl-${c}`}
            position={[x, totalHeight / 2 + 0.18, 0]}
            fontSize={Math.min(0.12, effectiveCellSize * 0.45)}
            color={isColActive ? '#60a5fa' : isDimmed ? '#334155' : '#94a3b8'}
            anchorX="center"
            anchorY="middle"
          >
            {`c${c}`}
          </Text>
        );
      })}

      {/* Row Headers (r0, r1, ... rk-1) placed safely to the left */}
      {Array.from({ length: rows }, (_, r) => {
        const y = startY - r * stride;
        const isRowExtracted = extractedRows.has(r);
        return (
          <Text
            key={`row-lbl-${r}`}
            position={[startX - effectiveCellSize * 0.85, y, isRowExtracted ? 0.35 : 0]}
            fontSize={Math.min(0.12, effectiveCellSize * 0.45)}
            color={isRowExtracted ? '#3b82f6' : isDimmed ? '#334155' : '#94a3b8'}
            anchorX="right"
            anchorY="middle"
          >
            {`r${r}`}
          </Text>
        );
      })}

      {/* 3D Matrix Cells */}
      {data.map((row, r) => {
        const isRowExtracted = extractedRows.has(r);
        // Subtle forward lift (0.35) instead of huge 0.65 to prevent clipping
        const rowElevationZ = isRowExtracted ? 0.35 : 0;

        return (
          <group key={`row-group-${r}`} position={[0, 0, rowElevationZ]}>
            {/* Extraction Shelf Glow Bed behind lifted row */}
            {isRowExtracted && (
              <mesh position={[0, startY - r * stride, -0.04]}>
                <boxGeometry args={[totalWidth + 0.1, effectiveCellSize * 0.95, 0.03]} />
                <meshBasicMaterial color="#1e40af" transparent opacity={0.35} />
              </mesh>
            )}

            {row.map((val, c) => {
              const x = startX + c * stride;
              const y = startY - r * stride;
              const isColHl = highlightedCols.has(c);
              const isCellHl = highlightedCells.has(`${r},${c}`);

              let cubeColor = val === 1 ? '#e2e8f0' : '#0f172a';
              let emissiveColor = '#000000';
              let emissiveIntensity = 0.0;
              let extrusionDepth = val === 1 ? effectiveCellSize * 0.55 : effectiveCellSize * 0.18;
              let textColor = val === 1 ? '#090d16' : '#64748b';

              if (isCellHl) {
                cubeColor = '#3b82f6';
                emissiveColor = '#1d4ed8';
                emissiveIntensity = 0.8;
                extrusionDepth = effectiveCellSize * 0.75;
                textColor = '#ffffff';
              } else if (isColHl && val === 1) {
                cubeColor = '#2563eb';
                emissiveColor = '#1e40af';
                emissiveIntensity = 0.6;
                extrusionDepth = effectiveCellSize * 0.65;
                textColor = '#ffffff';
              } else if (isRowExtracted && val === 1) {
                cubeColor = '#2563eb';
                emissiveColor = '#1e40af';
                emissiveIntensity = 0.5;
                extrusionDepth = effectiveCellSize * 0.65;
                textColor = '#ffffff';
              } else if (val === 1) {
                cubeColor = isDimmed ? '#475569' : '#f8fafc';
                emissiveColor = '#000000';
                emissiveIntensity = 0.0;
              } else if (isDimmed) {
                cubeColor = '#0f172a';
                textColor = '#334155';
              }

              const zPos = extrusionDepth / 2 - effectiveCellSize * 0.15;

              return (
                <group
                  key={`cell-${r}-${c}`}
                  position={[x, y, 0]}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onCellClick) onCellClick(r, c);
                  }}
                >
                  {/* Recessed Socket well */}
                  <mesh position={[0, 0, -effectiveCellSize * 0.15]}>
                    <boxGeometry args={[effectiveCellSize * 0.92, effectiveCellSize * 0.92, effectiveCellSize * 0.08]} />
                    <meshStandardMaterial color="#050914" roughness={0.9} />
                  </mesh>

                  {/* Volumetric Extruded Cube Block */}
                  <mesh position={[0, 0, zPos]}>
                    <boxGeometry args={[effectiveCellSize * 0.86, effectiveCellSize * 0.86, extrusionDepth]} />
                    <meshStandardMaterial
                      color={cubeColor}
                      emissive={emissiveColor}
                      emissiveIntensity={emissiveIntensity}
                      roughness={val === 1 ? 0.25 : 0.6}
                      metalness={0.8}
                    />
                  </mesh>

                  {/* Cell numeric readout on top face */}
                  <Text
                    position={[0, 0, zPos + extrusionDepth / 2 + 0.01]}
                    fontSize={effectiveCellSize * 0.44}
                    color={textColor}
                    anchorX="center"
                    anchorY="middle"
                  >
                    {val.toString()}
                  </Text>
                </group>
              );
            })}
          </group>
        );
      })}
    </group>
  );
};
