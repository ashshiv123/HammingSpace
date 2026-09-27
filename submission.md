# HammingSpace

### Problem Statement Fit

**Linear Block Codes** problem statement. HammingSpace addresses the gap between abstract matrix algebra (c = mG, S = rHᵀ) and geometric intuition by rendering the entire encode → inject → decode → correct pipeline as a walkable 3D spatial experience. Every equation becomes a visible event; Hamming distance becomes literal spatial distance.

### Target Users

ECE/CSE undergraduates in Digital Communication / Information Theory courses; lab instructors needing a repeatable, hardware-free error-correction demo; self-learners preparing for GATE/placement interviews on ECC. Core pain point: students can compute a syndrome correctly without ever understanding *why* it uniquely identifies a bit error.

### What We Built

A browser-based 3D digital communication lab (React + Three.js) with:
1. **Interactive Transmitter Station**:
   - **Message Console**: 4 tactile physical toggle switches with mechanical levers and glowing dome indicators. Clicking switches updates message $m$ in real-time.
   - **Generator Matrix Rig**: $G = [I_4 \mid P]$ visibly split into Identity Block (golden tones, direct message pass-through) and Parity Block (warm copper tones, computed redundancy) with a physical separator bar.
   - **GF(2) Fuse Micro-Animation**: Clicking "Encode & Send" causes only active $G$ rows (matching 1-bits in $m$) to illuminate and travel forward. At overlapping columns, a GF(2) XOR fuse animation visually resolves the binary addition ($1 \oplus 1 = 0$) into the output bit.
   - **Seamed Codeword Packet**: Assembles an $n$-bit (7-bit) packet with an explicit emerald seam collar between the 4 message bits and 3 calculated parity bits.
   - **Channel Launch**: The assembled codeword animates along the corridor into the Noisy Channel zone.
2. **Four-Zone 3D World**: Transmitter Station (warm/construction), Noisy Channel (hazard corridor), Receiver Station (cool/clinical), and Hamming Space Chamber (off-axis map room).
3. **HUD Pipeline Strip**: Persistent overlay ($m \rightarrow G \rightarrow c \rightarrow e \rightarrow r \rightarrow H \rightarrow S \rightarrow \text{correction}$) tracking and highlighting the active pipeline stage.
4. **Zone Navigation & Camera Controller**: Guided smooth lerp transitions between zones with OrbitControls free exploration.
5. **GF(2) Math Engine & Zustand Global State**: 15 unit tests covering the complete $(7,4)$ Hamming code golden path.

### Core Features

- **Interactive Message Console** — physical 3D toggle switches with mechanical levers and glowing indicator domes
- **Generator Matrix Rig ($G = [I \mid P]$)** — distinct row racks with color-coded Identity vs. Parity blocks
- **GF(2) Fuse Micro-Animation** — active basis pattern combination with visible XOR overlap resolution
- **Seamed Codeword Assembly** — structural visual seam between message bits and computed parity bits
- **Animated Channel Transmission** — codeword physically travels down the corridor toward the channel midpoint
- **4-Zone Continuous Environment** — Transmitter, Channel, Receiver, and off-axis Hamming Space
- **HUD Pipeline Strip** — persistent stage indicator synchronized with Zustand state
- **GF(2) Math Engine** — pure modular implementation of encode, syndrome, and table correction

### Technical Architecture

Single-page React 18 + Vite 5 application.
- **GF(2) Math Engine (`src/lib/gf2.js`)**: Pure ES module with modular linear algebra over GF(2).
- **Zustand Store (`src/state/labStore.js`)**: Single source of truth holding `{ n, k, G, H, m, c, e, r, S, errorPosition, correctable, verdict, mode, currentStage, dMin, t, sessionEvents }`.
- **Transmitter Station (`src/components/TransmitterStation.jsx`)**: Implements physical toggles, row-rack lighting, row translation animation, column fuse banners, seamed packet rendering, and launch trajectory lerp.
- **Scene Root (`src/components/Lab3D.jsx`)**: React Three Fiber Canvas with directional and ambient lighting, starfield, unified ground plane, and CameraController.
- **HUD Overlay (`src/components/PipelineHUD.jsx`, `ZoneNav.jsx`)**: HTML/CSS overlays positioned outside the 3D canvas for responsive layout and crisp typography.

### Tech Stack

- **React 18** + **Vite 5** — frontend framework and build system
- **Three.js 0.160** — 3D rendering engine
- **@react-three/fiber 8.x** — declarative Three.js integration for React
- **@react-three/drei 9.122** — 3D helpers (Text, OrbitControls, Stars)
- **Zustand 5** — global state management
- **Vitest 1.6** — unit testing framework
- **axios** — HTTP client

### Innovation / Uniqueness

- **Basis Pattern Combination** — $G$ is demonstrated as a rulebook of basis patterns selected and combined by message bits, not a black-box calculator.
- **Visible GF(2) Fuse** — Overlapping bits physically spark and resolve via XOR arithmetic before fusing into parity bits.
- **Structural Codeword Seam** — The boundary between original data and redundancy is permanently legible as an emerald collar on the traveling packet.
- **Literal Distance Metaphor** — Geometry and space communicate coding margins and Hamming distance.

### Demo Instructions

```bash
npm install
npm run dev       # opens http://localhost:5173
npm run test:run  # runs 15-test golden-path suite (all pass)
npm run build     # production build
```

**Testing the Transmitter Station**:
1. Open the app in browser.
2. In the Transmitter Station, click the 4 message switches to compose $m = [1, 0, 1, 1]$:
   - Notice switches 0, 2, 3 toggle forward and glow amber; switch 1 stays off.
   - Notice rows 1, 3, 4 of Generator Matrix $G$ illuminate and highlight.
3. Click the green **"ENCODE & SEND"** button:
   - Active rows lift from the $G$ rack and glide toward the assembly area.
   - The GF(2) fuse resolves overlapping bits ($1 \oplus 1 = 0$).
   - A 7-bit codeword packet $[1, 0, 1, 1, 0, 1, 0]$ assembles with an emerald seam separating $m$ and $p$.
   - The packet launches down the channel corridor and comes to rest at the channel midpoint.
   - The top HUD strip advances through $m \rightarrow G \rightarrow c \rightarrow e$.

### Known Limitations

- Noisy channel collision / noise injection interaction will be wired in Prompt 4.
- Receiver station decoding and syndrome column-matching will be wired in Prompt 4.
- Hamming Space Chamber constellation layout will be connected in Prompt 5.
- Real-time multiplayer (Socket.io) planned for subsequent phase.

### Future Work

- Wire Noisy Channel interactive bit-striking and noise controller (Prompt 4)
- Wire Receiver Station syndrome scanner and column-match fingerprint animation (Prompt 4)
- Populate Hamming Space Chamber with distance-preserving 3D coordinates (Prompt 5)
- Add audio feedback for switch toggles, fuse sparks, and packet launch