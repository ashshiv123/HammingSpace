# HammingSpace

### Problem Statement Fit

**Linear Block Codes** problem statement. HammingSpace addresses the gap between abstract matrix algebra (c = mG, S = rHᵀ) and geometric intuition by rendering the entire encode → inject → decode → correct pipeline as a walkable 3D spatial experience. Every equation becomes a visible event; Hamming distance becomes literal spatial distance.

### Target Users

ECE/CSE undergraduates in Digital Communication / Information Theory courses; lab instructors needing a repeatable, hardware-free error-correction demo; self-learners preparing for GATE/placement interviews on ECC. Core pain point: students can compute a syndrome correctly without ever understanding *why* it uniquely identifies a bit error.

### What We Built

A browser-based 3D digital communication lab (React + Three.js) with:
1. **Interactive Transmitter Station**:
   - **Message Console**: Tactile physical toggle switches with mechanical levers and glowing dome indicators. Clicking switches updates message $m$ in real-time.
   - **Generator Matrix Rig**: $G$ visibly split into Identity Block and Parity Block.
   - **GF(2) Fuse Micro-Animation**: Clicking "Encode & Send" causes only active $G$ rows (matching 1-bits in $m$) to illuminate, travel, and XOR fuse overlapping columns.
   - **Seamed Codeword Packet**: Assembles an $n$-bit packet with an explicit emerald seam collar.
2. **Interactive Noisy Channel**:
   - **Noise Injection**: Once transmitted, the codeword rests mid-flight in the hazard corridor. Users can click individual bit nodes to flip them.
   - **Visual Damage**: Flipped bits mechanically spin out of alignment and spawn a red, glowing $e$ error marker.
3. **Interactive Receiver Station**:
   - **Parity Check Matrix Rig**: $H$ is mounted as a cool-colored diagnostic rig, its columns labeled with position indexes (c1 to c7) and their corresponding binary patterns.
   - **Diagnostic Scanner**: "Run Diagnostics" triggers a row-by-row scan against the received vector $r$, illuminating the Syndrome readout ($S$).
   - **Sweep-and-Match**: If $S \neq 000$, a highlighter sweeps across $H$'s columns. Finding a matching column stops the sweep and fires a green holographic laser line down to the damaged bit.
   - **Snap-Back Correction**: Applying correction snaps the misaligned bit back to health, recovering the pristine $m$. Injecting weight(e) > t triggers a flashing "Beyond Guaranteed Correction" miscorrection warning.
4. **Hamming Space Chamber (The Map Room)**:
   - A distinct 3D room that maps the $n$-dimensional hypercube into a 3D constellation.
   - Every valid codeword is rendered as a white node surrounded by a translucent "correction halo" of radius $t$.
   - When the user injects errors, the received vector $r$ physically displaces from the transmitted codeword $c$. If $r$ lands inside the halo of a *different* codeword, it draws a line explicitly showing the miscorrection snap.
5. **Dynamic Lab System**:
   - **Mode System**: 5 distinct learning modes (Beginner, Guided Teaching, Free Experimentation, Custom Code, Capacity Test) that adapt the UI complexity and jargon visibility.
   - **Custom (n,k) Editor**: A realtime editor allowing the user to resize $n$ and $k$, input a custom Parity matrix, validate it, and instantly reshape the entire 3D lab environment (switches, $G$ rows, $H$ columns, and 3D constellation).
6. **Educational Theory Landing Page**:
   - Comprehensive interactive documentation explaining the geometry and algebra of Hamming codes with animated visual diagrams.
7. **Automatic Encoding Walkthrough**:
   - The transmitter laptop shows the live outgoing message. Sending it automatically moves the camera to the studio display, where the encoding playback presents the active step, formula, GF(2) working, explanation, and progressively assembled codeword.

### Core Features

- **Interactive Message Console** — physical 3D toggle switches with mechanical levers
- **Generator Matrix Rig ($G = [I \mid P]$)** — distinct row racks with color-coded blocks
- **GF(2) Fuse Micro-Animation** — active basis pattern combination with visible XOR overlap resolution
- **Seamed Codeword Assembly** — structural visual seam between message bits and computed parity bits
- **Interactive Noise Injection** — click mid-flight bits to inject damage, rotate nodes, and spawn $e$ markers
- **Parity Check Matrix Rig ($H$)** — labeled diagnostic board with binary column signatures
- **Syndrome Sweep-and-Match** — dynamic scanner that sweeps $S$ across $H$ to find the matching error fingerprint, bridging the equation to the physical bit
- **Snap-Back Correction & Miscorrection Limits** — visual repair sequence with guardrails for uncorrectable multiple errors
- **Hamming Space Constellation** — literal spatial mapping of all valid codewords and error vectors with visible $t$ halos
- **Custom (n,k) Editor** — reshape the entire 3D lab by inputting custom code parameters
- **GF(2) Math Engine** — pure modular implementation of encode, syndrome, and table correction
- **Educational Theory Landing Page** — scrollspy navigation, side-by-side SVG diagrams for mathematical concepts, and an animated glassmorphic background
- **Automatic Encoding Walkthrough** — sends the live message from the transmitter to a step-by-step explanation on the back-wall display, with automatic camera focus and playback driven by the existing GF(2) calculation steps

### Technical Architecture

Single-page React 18 + Vite 5 application.
- **GF(2) Math Engine (`src/lib/gf2.js`)**: Pure ES module with modular linear algebra over GF(2). Supports live `dMin`, `t`, and `validateGH` checks.
- **Zustand Store (`src/state/labStore.js`)**: Single source of truth managing stages, $m, c, e, r, S$, `mode`, and the ability to dynamically hot-swap $G$, $H$, $n$, and $k$.
- **Transmitter / Receiver / Channel (`src/components/`)**: Implements physical toggles, row-rack lighting, seamed packet rendering, trajectory lerping, $H$ rig, local receiver codeword renderer, 3-light syndrome console, sweeping column highlighter, and laser.
- **HammingSpaceChamber (`src/components/HammingSpaceChamber.jsx`)**: Projects $n$-bit vectors onto 3D basis coordinates to draw the $d_{min}$ landscape.
- **Mode & Custom UI (`src/components/ModeSelector.jsx`, `CustomLabHUD.jsx`)**: HTML DOM overlays seamlessly overlaid on the WebGL context.
- **Scene Root (`src/components/Lab3D.jsx`)**: React Three Fiber Canvas with directional and ambient lighting, starfield, unified ground plane, and CameraController.
- **Calculation Route (`src/pages/CalculationPage.tsx`)**: Dedicated 2D matrix workspace with encoding and syndrome modes, Hamming preset selection, live matrix calculations, and playback controls.
- **Encoding Display (`src/components3d/BackWallDisplayBoard3D.tsx`)**: Reads the active calculation step from the shared simulation store; the camera focuses on it when encoding starts. The transmitter laptop displays the outgoing message vector.

### Tech Stack

- **React 18** + **Vite 5** — frontend framework and build system
- **Three.js 0.160** — 3D rendering engine
- **@react-three/fiber 8.x** — declarative Three.js integration for React
- **@react-three/drei 9.122** — 3D helpers (Text, OrbitControls, Stars, Line)
- **Zustand 5** — global state management
- **Vitest 1.6** — unit testing framework
- **react-router-dom** — client-side routing for the application

### Innovation / Uniqueness

- **Visible GF(2) Fuse** — Overlapping bits physically spark and resolve via XOR arithmetic before fusing into parity bits.
- **The Sweep-and-Match** — The absolute core insight of syndrome decoding (why $S$ points to a specific bit) is transformed into a dramatic "fingerprint scan" animation. The user watches $S$ test every column until it finds its match.
- **Literal Distance Metaphor** — The Hamming Space chamber maps the abstract concept of $d_{min}$ into literal geometric distance. A 1-bit error physically moves the packet 1 unit.
- **Miscorrection Visibility** — By allowing multiple errors, the system authentically demonstrates the breakdown of bounded distance decoding. The algorithm *still matches a column* but fixes the wrong bit, explicitly teaching the limits of $t$.
- **Dynamic Reshaping** — The entire 3D environment reacts instantly to custom $(n,k)$ code definitions without reloading.

### Demo Instructions

```bash
npm install
npm run dev       # opens http://localhost:5173
npm run test:run  # runs 15-test golden-path suite (all pass)
npm run build     # production build
```

**Testing the Full Pipeline (Prompt 5)**:
1. Open the app in browser. The bottom right has a **Lab Mode** selector.
2. In the Transmitter Station, set switches to $m = [1, 0, 1, 1]$.
3. Click **"ENCODE & SEND"**. Watch the packet assemble and launch to the Noisy Channel.
4. **Noise Injection**: When the packet arrives in the Channel, click the 3rd bit to flip it. 
5. Click **"SEND TO RECEIVER"**. The camera moves to the Receiver.
6. Click **"RUN DIAGNOSTICS"** then **"APPLY CORRECTION"**.
7. Change the **Lab Mode** to **Custom Code Lab**. A UI panel appears top-left.
8. Set $n=6, k=3$. Notice the 3D lab instantly drops a switch in the console and removes a row in the $G$ matrix!
9. Toggle the transmitter message bits and click **SEND**. The laptop screen shows the outgoing vector, the camera moves to the back-wall display, and the explanation walks through row selection, column XOR, and codeword assembly automatically.

10. Open the Zone Nav (bottom center) and click **Hamming Space**.
11. Explore the 3D constellation. Notice how $r$ is connected to its origin codeword $c$ by a red dashed line, and to the `corrected` codeword by a solid line.

### Known Limitations

- Real-time multiplayer (Socket.io) planned for subsequent phase.

### Future Work

- Add audio feedback for switch toggles, fuse sparks, packet launch, and syndrome scanning
- WebXR integration for full VR immersive inspection of the Hamming space map
