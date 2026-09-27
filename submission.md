# HammingSpace

### Problem Statement Fit

**Linear Block Codes** problem statement. HammingSpace addresses the gap between abstract matrix algebra (c = mG, S = rHᵀ) and geometric intuition by rendering the entire encode → inject → decode → correct pipeline as a walkable 3D spatial experience. Every equation becomes a visible event; Hamming distance becomes literal spatial distance.

### Target Users

ECE/CSE undergraduates in Digital Communication / Information Theory courses; lab instructors needing a repeatable, hardware-free error-correction demo; self-learners preparing for GATE/placement interviews on ECC. Core pain point: students can compute a syndrome correctly without ever understanding *why* it uniquely identifies a bit error.

### What We Built

A browser-based 3D digital communication lab (React + Three.js) with:
1. **Interactive Transmitter Station**:
   - **Message Console**: 4 tactile physical toggle switches with mechanical levers and glowing dome indicators. Clicking switches updates message $m$ in real-time.
   - **Generator Matrix Rig**: $G = [I_4 \mid P]$ visibly split into Identity Block and Parity Block.
   - **GF(2) Fuse Micro-Animation**: Clicking "Encode & Send" causes only active $G$ rows (matching 1-bits in $m$) to illuminate, travel, and XOR fuse overlapping columns.
   - **Seamed Codeword Packet**: Assembles an $n$-bit (7-bit) packet with an explicit emerald seam collar.
2. **Interactive Noisy Channel**:
   - **Noise Injection**: Once transmitted, the codeword rests mid-flight in the hazard corridor. Users can click individual bit nodes to flip them.
   - **Visual Damage**: Flipped bits mechanically spin out of alignment and spawn a red, glowing $e$ error marker.
3. **Interactive Receiver Station**:
   - **Parity Check Matrix Rig**: $H$ is mounted as a cool-colored diagnostic rig, its columns labeled with position indexes (c1 to c7) and their corresponding binary patterns.
   - **Diagnostic Scanner**: "Run Diagnostics" triggers a row-by-row scan against the received vector $r$, illuminating the 3-light Syndrome readout ($S$).
   - **Sweep-and-Match**: If $S \neq 000$, a highlighter sweeps across $H$'s columns. Finding a matching column stops the sweep and fires a green holographic laser line down to the damaged bit.
   - **Snap-Back Correction**: Applying correction snaps the misaligned bit back to health, recovering the pristine $m$. Injecting weight(e) > t triggers a flashing "Beyond Guaranteed Correction" miscorrection warning.
4. **Four-Zone 3D World**: Transmitter Station (warm/construction), Noisy Channel (hazard corridor), Receiver Station (cool/clinical), and Hamming Space Chamber (off-axis map room).
5. **HUD Pipeline Strip**: Persistent overlay ($m \rightarrow G \rightarrow c \rightarrow e \rightarrow r \rightarrow H \rightarrow S \rightarrow \text{correction}$) tracking and highlighting the active pipeline stage.

### Core Features

- **Interactive Message Console** — physical 3D toggle switches with mechanical levers
- **Generator Matrix Rig ($G = [I \mid P]$)** — distinct row racks with color-coded blocks
- **GF(2) Fuse Micro-Animation** — active basis pattern combination with visible XOR overlap resolution
- **Seamed Codeword Assembly** — structural visual seam between message bits and computed parity bits
- **Interactive Noise Injection** — click mid-flight bits to inject damage, rotate nodes, and spawn $e$ markers
- **Parity Check Matrix Rig ($H$)** — labeled diagnostic board with binary column signatures
- **Syndrome Sweep-and-Match** — dynamic scanner that sweeps $S$ across $H$ to find the matching error fingerprint, bridging the equation to the physical bit
- **Snap-Back Correction & Miscorrection Limits** — visual repair sequence with guardrails for uncorrectable multiple errors
- **GF(2) Math Engine** — pure modular implementation of encode, syndrome, and table correction

### Technical Architecture

Single-page React 18 + Vite 5 application.
- **GF(2) Math Engine (`src/lib/gf2.js`)**: Pure ES module with modular linear algebra over GF(2).
- **Zustand Store (`src/state/labStore.js`)**: Single source of truth managing stages (`'compose'`, `'encoded'`, `'in-flight'`, `'received'`, `'decoded'`, `'corrected'`), $m, c, e, r, S$, and `beyondGuaranteedCorrection` thresholds.
- **Transmitter Station (`src/components/TransmitterStation.jsx`)**: Implements physical toggles, row-rack lighting, row translation animation, column fuse banners, seamed packet rendering, and launch trajectory lerp.
- **Noisy Channel (`src/components/NoisyChannel.jsx`)**: Renders hazard corridor, floating particles, and the "Send to Receiver" interaction.
- **Receiver Station (`src/components/ReceiverStation.jsx`)**: Implements the $H$ rig, local receiver codeword renderer, 3-light syndrome console, sweeping column highlighter, holographic `<Line>` laser, and state machine for the scan-match-repair sequence.
- **Scene Root (`src/components/Lab3D.jsx`)**: React Three Fiber Canvas with directional and ambient lighting, starfield, unified ground plane, and CameraController.

### Tech Stack

- **React 18** + **Vite 5** — frontend framework and build system
- **Three.js 0.160** — 3D rendering engine
- **@react-three/fiber 8.x** — declarative Three.js integration for React
- **@react-three/drei 9.122** — 3D helpers (Text, OrbitControls, Stars, Line)
- **Zustand 5** — global state management
- **Vitest 1.6** — unit testing framework

### Innovation / Uniqueness

- **Visible GF(2) Fuse** — Overlapping bits physically spark and resolve via XOR arithmetic before fusing into parity bits.
- **The Sweep-and-Match** — The absolute core insight of syndrome decoding (why $S$ points to a specific bit) is transformed into a dramatic "fingerprint scan" animation. The user watches $S$ test every column until it finds its match.
- **Miscorrection Visibility** — By allowing multiple errors, the system authentically demonstrates the breakdown of bounded distance decoding. The algorithm *still matches a column* but fixes the wrong bit, explicitly teaching the limits of $t$.

### Demo Instructions

```bash
npm install
npm run dev       # opens http://localhost:5173
npm run test:run  # runs 15-test golden-path suite (all pass)
npm run build     # production build
```

**Testing the Full Pipeline (Prompt 4)**:
1. Open the app in browser.
2. In the Transmitter Station, set switches to $m = [1, 0, 1, 1]$.
3. Click **"ENCODE & SEND"**. Watch the packet assemble and launch to the Noisy Channel.
4. **Noise Injection**: When the packet arrives in the Channel, click the 3rd bit to flip it. It spins out of alignment and a red $e$ marker appears. (Try clicking two bits to test uncorrectable miscorrections).
5. Click the green **"SEND TO RECEIVER"** button in the channel. The camera moves to the Receiver.
6. Click **"RUN DIAGNOSTICS"** at the Syndrome Console:
   - The scanner checks rows 1, 2, 3 of $H$.
   - The 3-light Syndrome readout populates (e.g., $S = [0, 1, 1]$).
   - The highlighter sweeps across $H$'s columns, matches column 3, and a green laser points to the damaged bit.
7. Click **"APPLY CORRECTION"**:
   - The bit rotates back into alignment.
   - The packet is restored to $c$ and the Identity message portion is lifted up.
   - If you injected 2 errors, a large red warning flashes: "BEYOND GUARANTEED CORRECTION".

### Known Limitations

- Hamming Space Chamber constellation layout will be connected in Prompt 5.
- Real-time multiplayer (Socket.io) planned for subsequent phase.

### Future Work

- Populate Hamming Space Chamber with distance-preserving 3D coordinates (Prompt 5)
- Add audio feedback for switch toggles, fuse sparks, packet launch, and syndrome scanning