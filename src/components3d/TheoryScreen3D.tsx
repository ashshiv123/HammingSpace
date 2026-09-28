import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '../store/simulationStore';

export const TheoryScreen3D: React.FC = () => {
  const {
    stage,
    codeword,
    errorPositions,
    receivedVector,
    syndrome,
    message,
    H,
    G,
    k,
    n,
    lastCorrectedBit,
  } = useSimulationStore();

  const animTimeRef = useRef(0);

  // High-resolution offscreen canvas
  const canvas = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 2048;
    c.height = 1152;
    return c;
  }, []);

  // Three.js CanvasTexture directly rendered on WebGL geometry
  const texture = useMemo(() => {
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 16;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }, [canvas]);

  // Cubic Bezier interpolation helper
  const getCubicBezierPoint = (
    p0: { x: number; y: number },
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    p3: { x: number; y: number },
    t: number
  ) => {
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    const t2 = t * t;
    const t3 = t2 * t;

    return {
      x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
      y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y,
    };
  };

  useFrame((_, delta) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    animTimeRef.current += delta;
    const time = animTimeRef.current;

    const width = canvas.width;
    const height = canvas.height;

    // 1. Clear & Background
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, width, height);

    // Subtle background circuit grid
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.6)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 48) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Helper: Rounded Rect
    const roundRect = (
      rx: number,
      ry: number,
      rw: number,
      rh: number,
      radius: number,
      fillStyle?: string,
      strokeStyle?: string,
      lineWidth = 1
    ) => {
      ctx.beginPath();
      ctx.roundRect(rx, ry, rw, rh, radius);
      if (fillStyle) {
        ctx.fillStyle = fillStyle;
        ctx.fill();
      }
      if (strokeStyle) {
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
      }
    };

    // =========================================================================
    // 2. HEADER BAR
    // =========================================================================
    roundRect(30, 24, width - 60, 80, 12, 'rgba(15, 23, 42, 0.85)', 'rgba(56, 189, 248, 0.35)', 2);

    // Title & Icon
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 32px "Courier New", monospace';
    ctx.fillText('HAMMING (7,4) CODE — LIVE THEORY & MATRIX OPERATION LAB', 60, 64);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px "Courier New", monospace';
    ctx.fillText('GF(2) LINEAR BLOCK CODE • SINGLE-ERROR CORRECTION • REAL-TIME HARDWARE SYNDROME EXTRACTION', 60, 90);

    // Stage Pill Badge
    let stageColor = '#38bdf8';
    let stageText = 'IDLE MONITOR';
    if (stage === 'encoding') {
      stageColor = '#facc15';
      stageText = 'STAGE 1/4: GENERATING CODEWORD (c = m·G)';
    } else if (stage === 'inChannel') {
      stageColor = '#f43f5e';
      stageText = 'STAGE 2/4: OPTICAL CHANNEL (NOISE INJECTION)';
    } else if (stage === 'decoding' || stage === 'errorDetected') {
      stageColor = '#c084fc';
      stageText = 'STAGE 3/4: SYNDROME EXTRACTION (s = H·rᵀ)';
    } else if (stage === 'corrected') {
      stageColor = '#10b981';
      stageText = 'STAGE 4/4: ERROR PINPOINTED & RESTORED';
    }

    const badgeW = 440;
    roundRect(width - badgeW - 50, 40, badgeW, 48, 8, 'rgba(30, 41, 59, 0.9)', stageColor, 2);
    ctx.fillStyle = stageColor;
    ctx.font = 'bold 16px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(stageText, width - badgeW / 2 - 50, 70);
    ctx.textAlign = 'left';

    // =========================================================================
    // 3. LEFT COLUMN: THEORY, FORMULAS & MATRIX INSPECTOR
    // =========================================================================
    const leftW = 630;
    roundRect(30, 120, leftW, height - 150, 14, 'rgba(10, 15, 29, 0.95)', 'rgba(30, 41, 59, 0.8)', 2);

    // Panel 1: Code Specifications
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 22px "Courier New", monospace';
    ctx.fillText('1. CODE SPECIFICATIONS & METRICS', 54, 160);

    const formulas = [
      { k: 'Codeword Length (n)', v: `${n} bits  (n = 2ʳ - 1)` },
      { k: 'Message Dimension (k)', v: `${k} bits  (k = n - r)` },
      { k: 'Parity Check Bits (r)', v: `${n - k} bits` },
      { k: 'Code Rate R = k/n', v: `${(k / n).toFixed(3)} (4 data / 7 total)` },
      { k: 'Minimum Distance d_min', v: `3  (Single Error Correcting)` },
      { k: 'Error Detection Cap.', v: `d_min - 1 = 2 errors` },
      { k: 'Error Correction Cap.', v: `floor((d_min-1)/2) = 1 error` },
    ];

    let fy = 195;
    formulas.forEach((item) => {
      ctx.fillStyle = '#64748b';
      ctx.font = '15px "Courier New", monospace';
      ctx.fillText(item.k, 56, fy);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 15px "Courier New", monospace';
      ctx.fillText(item.v, 360, fy);
      fy += 26;
    });

    // Divider
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.6)';
    ctx.beginPath();
    ctx.moveTo(54, fy + 4);
    ctx.lineTo(leftW + 6, fy + 4);
    ctx.stroke();

    // Panel 2: Live Registers
    fy += 32;
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 22px "Courier New", monospace';
    ctx.fillText('2. LIVE VECTOR REGISTERS', 54, fy);

    fy += 30;
    const msgStr = (message || [1, 0, 1, 1]).join(' ');
    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px "Courier New", monospace';
    ctx.fillText(`Message  m = [ ${msgStr} ]`, 56, fy);

    fy += 26;
    const codeStr = (codeword || [1, 0, 1, 1, 0, 1, 0]).join(' ');
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`Codewd   c = [ ${codeStr} ]`, 56, fy);

    fy += 26;
    const rxVector = receivedVector?.length ? receivedVector : codeword || [1, 0, 1, 1, 0, 1, 0];
    const rxStr = rxVector.join(' ');
    ctx.fillStyle = errorPositions?.length ? '#f87171' : '#4ade80';
    ctx.fillText(`Received r = [ ${rxStr} ]`, 56, fy);

    fy += 26;
    const synd = syndrome?.length ? syndrome : [0, 0, 0];
    const syndStr = synd.join(' ');
    ctx.fillStyle = synd.some((b) => b !== 0) ? '#fb923c' : '#4ade80';
    ctx.fillText(`Syndrome s = [ ${syndStr} ]`, 56, fy);

    // Divider
    fy += 20;
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.6)';
    ctx.beginPath();
    ctx.moveTo(54, fy);
    ctx.lineTo(leftW + 6, fy);
    ctx.stroke();

    // Panel 3: Parity-Check Matrix H with Live Column Match
    fy += 32;
    ctx.fillStyle = '#c084fc';
    ctx.font = 'bold 22px "Courier New", monospace';
    ctx.fillText('3. PARITY-CHECK MATRIX H [Pᵀ | I₃]', 54, fy);

    fy += 28;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px "Courier New", monospace';
    ctx.fillText('Rule: s = H·rᵀ. If s matches Column j => Bit r[j] is errored!', 56, fy);

    fy += 25;
    const hMatrix = H?.length ? H : [
      [1, 0, 1, 0, 1, 0, 1],
      [0, 1, 1, 0, 0, 1, 1],
      [0, 0, 0, 1, 1, 1, 1],
    ];

    // Find which column matches syndrome
    const syndKey = synd.join('');
    let matchingCol = -1;
    if (syndKey !== '000') {
      for (let col = 0; col < (hMatrix[0]?.length || 7); col++) {
        let colMatch = true;
        for (let row = 0; row < hMatrix.length; row++) {
          if (hMatrix[row][col] !== synd[row]) {
            colMatch = false;
            break;
          }
        }
        if (colMatch) {
          matchingCol = col;
          break;
        }
      }
    }

    // Draw Column Headers
    const colStartX = 110;
    const colStep = 64;
    for (let c = 0; c < 7; c++) {
      const isMatched = c === matchingCol;
      ctx.fillStyle = isMatched ? '#facc15' : '#64748b';
      ctx.font = isMatched ? 'bold 16px "Courier New", monospace' : '14px "Courier New", monospace';
      ctx.fillText(`c${c}`, colStartX + c * colStep + 8, fy);
    }

    // Draw Matrix Rows
    fy += 20;
    for (let r = 0; r < hMatrix.length; r++) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 15px "Courier New", monospace';
      ctx.fillText(`s${r} [`, 65, fy + 22);

      for (let c = 0; c < 7; c++) {
        const val = hMatrix[r]?.[c] ?? 0;
        const isMatched = c === matchingCol;
        const cellX = colStartX + c * colStep;

        if (isMatched) {
          roundRect(cellX, fy, 40, 32, 4, 'rgba(250, 204, 21, 0.25)', '#facc15', 2);
          ctx.fillStyle = '#fde047';
        } else {
          roundRect(cellX, fy, 40, 32, 4, val ? 'rgba(56, 189, 248, 0.08)' : 'rgba(15, 23, 42, 0.4)');
          ctx.fillStyle = val ? '#38bdf8' : '#475569';
        }

        ctx.font = 'bold 18px "Courier New", monospace';
        ctx.fillText(String(val), cellX + 14, fy + 22);
      }

      ctx.fillStyle = '#94a3b8';
      ctx.fillText(']', colStartX + 7 * colStep - 10, fy + 22);
      fy += 38;
    }

    // Column Match Feedback
    fy += 15;
    if (matchingCol >= 0) {
      roundRect(54, fy, leftW - 48, 70, 8, 'rgba(239, 68, 68, 0.15)', '#ef4444', 2);
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 17px "Courier New", monospace';
      ctx.fillText(`MATCH: Column ${matchingCol} == Syndrome [${synd.join('')}]`, 70, fy + 30);
      ctx.fillStyle = '#fca5a5';
      ctx.font = '15px "Courier New", monospace';
      ctx.fillText(`Action: Invert bit r[${matchingCol}] to restore original codeword!`, 70, fy + 54);
    } else {
      roundRect(54, fy, leftW - 48, 70, 8, 'rgba(16, 185, 129, 0.12)', '#10b981', 1.5);
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 17px "Courier New", monospace';
      ctx.fillText('SYNDROME ZERO: [ 0 0 0 ]', 70, fy + 30);
      ctx.fillStyle = '#6ee7b7';
      ctx.font = '15px "Courier New", monospace';
      ctx.fillText('No bit errors detected. Codeword passes all parity checks.', 70, fy + 54);
    }

    // =========================================================================
    // 4. RIGHT COLUMN: LIVE XOR THREAD VISUALIZER (Main Area)
    // =========================================================================
    const rightX = leftW + 50;
    const rightW = width - rightX - 30;
    roundRect(rightX, 120, rightW, height - 150, 14, 'rgba(8, 14, 27, 0.95)', 'rgba(56, 189, 248, 0.3)', 2);

    // Section Title
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 24px "Courier New", monospace';
    ctx.fillText('4. LIVE XOR THREAD VISUALIZER — MATRIX MULTIPLICATION OVER GF(2)', rightX + 28, 160);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '15px "Courier New", monospace';
    ctx.fillText('Curved threads represent H[i][j] = 1 connections. Moving pulses carry bit values into XOR parity accumulators.', rightX + 28, 186);

    // Bit Nodes: 7 circles r0..r6
    const bitCount = 7;
    const bitSpacing = (rightW - 120) / (bitCount - 1);
    const bitY = 250;

    const bitNodes: { x: number; y: number; val: number; isErr: boolean; isFixed: boolean; idx: number }[] = [];

    for (let j = 0; j < bitCount; j++) {
      const bx = rightX + 60 + j * bitSpacing;
      const bVal = rxVector[j] ?? 0;
      const isErr = errorPositions?.includes(j) || (stage === 'errorDetected' && bVal !== (codeword?.[j] ?? bVal));
      const isFixed = stage === 'corrected' && j === lastCorrectedBit;

      bitNodes.push({ x: bx, y: bitY, val: bVal, isErr, isFixed, idx: j });
    }

    // XOR Gates: 3 nodes for s0, s1, s2
    const gateCount = 3;
    const gateColors = ['#06b6d4', '#a855f7', '#f59e0b'];
    const gateSpacing = (rightW - 180) / (gateCount - 1);
    const gateY = 700;

    const gateNodes: { x: number; y: number; color: string; val: number; activeBits: number[]; rowIdx: number }[] = [];

    for (let i = 0; i < gateCount; i++) {
      const gx = rightX + 90 + i * gateSpacing;
      const gVal = synd[i] ?? 0;
      const activeBits: number[] = [];
      for (let j = 0; j < bitCount; j++) {
        if (hMatrix[i]?.[j] === 1) {
          activeBits.push(j);
        }
      }
      gateNodes.push({ x: gx, y: gateY, color: gateColors[i], val: gVal, activeBits, rowIdx: i });
    }

    // -------------------------------------------------------------------------
    // Draw Bezier Threads & Animated Pulses
    // -------------------------------------------------------------------------
    gateNodes.forEach((gate) => {
      gate.activeBits.forEach((bitIdx, seqIdx) => {
        const bit = bitNodes[bitIdx];
        if (!bit) return;

        const p0 = { x: bit.x, y: bit.y + 36 };
        const p1 = { x: bit.x, y: bit.y + 160 };
        const p2 = { x: gate.x, y: gate.y - 140 };
        const p3 = { x: gate.x, y: gate.y - 48 };

        // Draw thread wire
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);

        ctx.strokeStyle = `${gate.color}40`; // 25% opacity base
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Traveling Light Pulse
        const speed = 0.55;
        const pulseProgress = (time * speed + bitIdx * 0.12 + gate.rowIdx * 0.25) % 1.0;
        const pt = getCubicBezierPoint(p0, p1, p2, p3, pulseProgress);

        const pulseColor = bit.val === 1 ? gate.color : '#64748b';
        const pulseSize = bit.val === 1 ? 7.5 : 4.0;

        // Pulse glow
        const grad = ctx.createRadialGradient(pt.x, pt.y, 1, pt.x, pt.y, pulseSize * 2.5);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, pulseColor);
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pulseSize * 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pulseSize * 0.8, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    // -------------------------------------------------------------------------
    // Render Top Bit Nodes (r0..r6)
    // -------------------------------------------------------------------------
    bitNodes.forEach((b) => {
      // Node Outer Glow if Errored
      if (b.isErr) {
        const pulse = (Math.sin(time * 6) + 1) / 2;
        const aura = ctx.createRadialGradient(b.x, b.y, 25, b.x, b.y, 50 + pulse * 15);
        aura.addColorStop(0, 'rgba(239, 68, 68, 0.6)');
        aura.addColorStop(1, 'transparent');
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 60, 0, Math.PI * 2);
        ctx.fill();
      }

      // Base Circle
      let fillColor = '#0f172a';
      let strokeColor = '#38bdf8';
      if (b.isErr) {
        fillColor = 'rgba(239, 68, 68, 0.25)';
        strokeColor = '#ef4444';
      } else if (b.isFixed) {
        fillColor = 'rgba(16, 185, 129, 0.25)';
        strokeColor = '#10b981';
      } else if (b.idx >= k) {
        strokeColor = '#818cf8'; // Parity bit distinct color
      }

      ctx.beginPath();
      ctx.arc(b.x, b.y, 34, 0, Math.PI * 2);
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Top Tag (r_j)
      ctx.fillStyle = strokeColor;
      ctx.font = 'bold 15px "Courier New", monospace';
      ctx.textAlign = 'center';
      const label = b.idx < k ? `d${b.idx}` : `p${b.idx - k}`;
      ctx.fillText(`r${b.idx} [${label}]`, b.x, b.y - 42);

      // Bit Value
      ctx.fillStyle = b.isErr ? '#fca5a5' : b.isFixed ? '#6ee7b7' : '#ffffff';
      ctx.font = 'bold 30px "Courier New", monospace';
      ctx.fillText(String(b.val), b.x, b.y + 10);

      // Status Pill below bit
      if (b.isErr) {
        roundRect(b.x - 36, b.y + 40, 72, 22, 4, '#ef4444');
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px "Courier New", monospace';
        ctx.fillText('ERROR', b.x, b.y + 55);
      } else if (b.isFixed) {
        roundRect(b.x - 42, b.y + 40, 84, 22, 4, '#10b981');
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px "Courier New", monospace';
        ctx.fillText('FIXED', b.x, b.y + 55);
      }
    });

    // -------------------------------------------------------------------------
    // Render Bottom XOR Gates (s0, s1, s2)
    // -------------------------------------------------------------------------
    gateNodes.forEach((gate) => {
      const gw = 320;
      const gh = 110;
      const gx = gate.x - gw / 2;
      const gy = gate.y - gh / 2;

      // Gate Box
      const isHigh = gate.val === 1;
      const borderCol = isHigh ? '#ef4444' : gate.color;
      roundRect(gx, gy, gw, gh, 12, 'rgba(15, 23, 42, 0.95)', borderCol, 2.5);

      // Header Banner
      roundRect(gx + 2, gy + 2, gw - 4, 32, 8, `${gate.color}25`);
      ctx.fillStyle = gate.color;
      ctx.font = 'bold 15px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`PARITY CHECK: s${gate.rowIdx} (ROW ${gate.rowIdx} of H)`, gate.x, gy + 22);

      // Equation representation
      const eqTerms = gate.activeBits.map((b) => `r${b}`).join(' ⊕ ');
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '13px "Courier New", monospace';
      ctx.fillText(`${eqTerms} = ${gate.val}`, gate.x, gy + 56);

      // Output Value Pill
      const pillW = 140;
      const pillCol = isHigh ? '#ef4444' : '#10b981';
      roundRect(gate.x - pillW / 2, gy + 68, pillW, 30, 6, isHigh ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', pillCol, 2);

      ctx.fillStyle = pillCol;
      ctx.font = 'bold 16px "Courier New", monospace';
      ctx.fillText(`s${gate.rowIdx} = ${gate.val} ${isHigh ? '✖ FAIL' : '✓ PASS'}`, gate.x, gy + 88);
    });

    // -------------------------------------------------------------------------
    // 5. BOTTOM SYNDROME & CORRECTION DECISION BANNER
    // -------------------------------------------------------------------------
    const decY = 855;
    const decH = 185;
    roundRect(rightX + 28, decY, rightW - 56, decH, 12, 'rgba(15, 23, 42, 0.9)', 'rgba(56, 189, 248, 0.3)', 2);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 20px "Courier New", monospace';
    ctx.fillText('5. SYNDROME DECODER & ERROR CORRECTION ENGINE', rightX + 54, decY + 36);

    // Full Syndrome Vector
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 17px "Courier New", monospace';
    ctx.fillText(`Computed Syndrome Vector: s = [ s0=${synd[0]}, s1=${synd[1]}, s2=${synd[2]} ]  (Binary: ${synd.join('')})`, rightX + 54, decY + 70);

    if (matchingCol >= 0) {
      // Error identified
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 18px "Courier New", monospace';
      ctx.fillText(`-> ERROR LOCALIZED AT BIT INDEX: r[${matchingCol}] (matches Column ${matchingCol} of matrix H)`, rightX + 54, decY + 104);

      ctx.fillStyle = '#4ade80';
      ctx.font = '16px "Courier New", monospace';
      const origVal = rxVector[matchingCol] ?? 0;
      const fixedVal = 1 - origVal;
      ctx.fillText(`-> HARDWARE CORRECTION: Invert bit r[${matchingCol}] (${origVal} -> ${fixedVal}). Codeword mathematically restored!`, rightX + 54, decY + 134);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px "Courier New", monospace';
      ctx.fillText('-> Guaranteed correct decoding: Minimum distance d_min = 3 protects against any single-bit channel distortion.', rightX + 54, decY + 160);
    } else {
      // Clean transmission
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 18px "Courier New", monospace';
      ctx.fillText('-> SYNDROME IS ZERO: H · rᵀ = 0. All 3 parity equations are satisfied simultaneously.', rightX + 54, decY + 104);

      ctx.fillStyle = '#6ee7b7';
      ctx.font = '16px "Courier New", monospace';
      ctx.fillText(`-> Valid codeword confirmed: c = [ ${codeStr} ]. Original data payload is 100% intact.`, rightX + 54, decY + 134);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px "Courier New", monospace';
      ctx.fillText('-> No hardware bit flipping required. Message safely routed to application layer.', rightX + 54, decY + 160);
    }

    // Flag texture update for WebGL
    texture.needsUpdate = true;
  });

  return (
    <group position={[0, 4.4, -6.5]}>
      {/* 1. Heavy Solid Backing Plate: completely covers back wall slats so they NEVER bleed through */}
      <mesh position={[0, 0, -0.06]}>
        <boxGeometry args={[14.2, 8.0, 0.12]} />
        <meshStandardMaterial color="#080c16" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* 2. Sleek Outer Bezel Frame */}
      <mesh position={[0, 0, -0.01]}>
        <boxGeometry args={[13.9, 7.85, 0.04]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* 3. Subtle Cyan Emissive Border Glow */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[14.05, 8.0]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.35} />
      </mesh>

      {/* 4. High-Resolution 2048x1152 Screen Display Surface (Direct WebGL CanvasTexture) */}
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[13.6, 7.65]} />
        <meshBasicMaterial map={texture} />
      </mesh>

      {/* 5. Soft Light Spill onto the studio floor and stations */}
      <pointLight position={[0, 0, 1.2]} color="#38bdf8" intensity={1.4} distance={9} />
    </group>
  );
};
