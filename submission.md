# HammingSpace

### Problem Statement Fit

**Linear Block Codes** problem statement. HammingSpace addresses the gap between abstract matrix algebra (c = mG, S = rHᵀ) and geometric intuition by rendering the entire encode → inject → decode → correct pipeline as a walkable 3D spatial experience. Every equation becomes a visible event; Hamming distance becomes literal spatial distance.

### Target Users

ECE/CSE undergraduates in Digital Communication / Information Theory courses; lab instructors needing a repeatable, hardware-free error-correction demo; self-learners preparing for GATE/placement interviews on ECC. Core pain point: students can compute a syndrome correctly without ever understanding *why* it uniquely identifies a bit error.

### What We Built

A browser-based 3D digital communication lab (React + Three.js) with:
1. **Interactive Transmitter Station**:
   - **Message Console**: Tactile physical toggle switches with mechanical levers and glowing dome indicators. Clicking switches updates message $m$ in real-time. Keyboard accessible (press 1, 2, 3...).
   - **Generator Matrix Rig**: $G$ visibly split into Identity Block and Parity Block.
   - **GF(2) Fuse Micro-Animation**: Clicking "Encode & Send" causes only active $G$ rows (matching 1-bits in $m$) to illuminate, travel, and XOR fuse overlapping columns.
   - **Seamed Codeword Packet**: Assembles an $n$-bit packet with an explicit emerald seam collar.
2. **Interactive Noisy Channel**:
   - **Noise Injection**: Once transmitted, the codeword rests mid-flight in the hazard corridor. Users can click individual bit nodes to flip them (also keyboard accessible).
   - **Visual Damage**: Flipped bits mechanically spin out of alignment and spawn a red, glowing $e$ error marker.
3. **Interactive Receiver Station**:
   - **Parity Check Matrix Rig**: $H$ is mounted as a cool-colored diagnostic rig, its columns labeled with position indexes.
   - **Diagnostic Scanner**: "Run Diagnostics" triggers a row-by-row scan against the received vector $r$, illuminating the Syndrome readout ($S$).
   - **Sweep-and-Match**: If $S \neq 000$, a highlighter sweeps across $H$'s columns. Finding a matching column stops the sweep and fires a green holographic laser line down to the damaged bit.
   - **Snap-Back Correction**: Applying correction snaps the misaligned bit back to health. Injecting weight(e) > t triggers a flashing "Beyond Guaranteed Correction" warning.
4. **Hamming Space Chamber (The Map Room)**:
   - A distinct 3D room mapping the $n$-dimensional hypercube into a 3D constellation.
   - Every valid codeword is rendered as a white node surrounded by a translucent "correction halo" of radius $t$.
   - When the user injects errors, the received vector $r$ physically displaces. If it lands inside a *different* halo, a miscorrection snap line is visually drawn.
5. **Dynamic Lab System**:
   - **Role System**: Local 2-player collaborative mode toggling between "Encoder" (constructs message) and "Noise Controller" (injects damage), forcing students to play against each other's algorithms playfully.
   - **Mode System**: 5 distinct learning modes (Beginner, Guided Teaching, Free Experimentation, Custom Code, Capacity Test) adapting the UI complexity.
   - **Custom (n,k) Editor**: A realtime editor allowing the user to resize $n$ and $k$, input a custom Parity matrix, validate it, and instantly reshape the entire 3D lab environment.
6. **Data & Analytics**:
   - **Session Log**: Records every pipeline event (encode, inject, decode, correct) with vector snapshots, timestamps, and verdicts, exportable to JSON.
   - **AI Explain Panel**: Connects to a serverless API (with a robust deterministic fallback) to generate plain-language explanations of the pipeline outcome, clarifying exactly *why* a miscorrection or success occurred based on $t$.

### Core Features

- **Interactive Message Console** — physical 3D toggle switches
- **Generator Matrix Rig ($G = [I \mid P]$)** — distinct row racks
- **GF(2) Fuse Micro-Animation** — active basis pattern combination
- **Interactive Noise Injection** — click mid-flight bits to inject damage
- **Syndrome Sweep-and-Match** — dynamic scanner that sweeps $S$ across $H$
- **Snap-Back Correction & Miscorrection Limits** — visual repair sequence with guardrails
- **Hamming Space Constellation** — spatial mapping of all valid codewords
- **Custom (n,k) Editor** — reshape the entire 3D lab by inputting custom code parameters
- **Collaborative Role Toggle** — local 2-player Encoder vs Noise Controller mode
- **Session Log & AI Explanation** — exportable data pipeline and plain-language analytics

### Technical Architecture

Single-page React 18 + Vite 5 application.
- **GF(2) Math Engine (`src/lib/gf2.js`)**: Pure ES module with modular linear algebra.
- **Zustand Store (`src/state/labStore.js`)**: Single source of truth managing stages, $m, c, e, r, S$, `role`, `sessionEvents`.
- **Transmitter / Receiver / Channel (`src/components/`)**: Implements physical toggles, row-rack lighting, seamed packet rendering, $H$ rig, local receiver codeword renderer.
- **HammingSpaceChamber (`src/components/HammingSpaceChamber.jsx`)**: Projects $n$-bit vectors onto 3D basis coordinates.
- **Mode, Role, & Data HUDs**: HTML DOM overlays seamlessly overlaid on the WebGL context.
- **Serverless API (`src/api/explain.js`)**: Endpoint designed to house LLM explanation logic, backed by robust client-side deterministic fallbacks.
- **Scene Root (`src/components/Lab3D.jsx`)**: React Three Fiber Canvas with directional and ambient lighting.

### Tech Stack

- **React 18** + **Vite 5** — frontend framework and build system
- **Three.js 0.160** — 3D rendering engine
- **@react-three/fiber 8.x** — declarative Three.js integration for React
- **@react-three/drei 9.122** — 3D helpers (Text, OrbitControls, Stars, Line)
- **Zustand 5** — global state management
- **Vitest 1.6** — unit testing framework

### Innovation / Uniqueness

- **Visible GF(2) Fuse** — Overlapping bits physically spark and resolve via XOR arithmetic before fusing into parity bits.
- **The Sweep-and-Match** — The core insight of syndrome decoding (why $S$ points to a specific bit) is transformed into a dramatic "fingerprint scan" animation.
- **Literal Distance Metaphor** — The Hamming Space chamber maps the abstract concept of $d_{min}$ into literal geometric distance.
- **Dynamic Reshaping** — The entire 3D environment reacts instantly to custom $(n,k)$ code definitions without reloading.
- **Collaborative Tension** — By splitting control between "Encoder" and "Noise Controller", students engage deeply with the *limits* of the code (trying to break it by injecting $>t$ errors).

### Demo Instructions

```bash
npm install
npm run dev       # opens http://localhost:5173
npm run test:run  # runs 15-test golden-path suite (all pass)
npm run build     # production build
```

**Testing the Final Pipeline (Prompt 6)**:
1. Look at the bottom-left corner to see the **Current Role**. Ensure you are the **Encoder**.
2. Press keyboard keys `1`, `3`, `4` to toggle switches, or click them.
3. Click **"ENCODE & SEND"**. 
4. Switch your role to **Noise Controller**.
5. When the packet arrives in the Channel, press `3` to inject an error on bit 3.
6. Click **"SEND TO RECEIVER"**.
7. Click **"RUN DIAGNOSTICS"** then **"APPLY CORRECTION"**.
8. Look at the bottom-right corner and click **"Explain Outcome"** to read the generated AI summary.
9. Open the **Session Log** at the top-right and click **"EXPORT JSON"** to download the session analytics.

### Known Limitations

- Real-time multiplayer over WebSocket requires a backend deployment. The local role toggle serves as the MVP equivalent.

### Future Work

- WebXR integration for full VR immersive inspection of the Hamming space map.
- Add audio feedback for switch toggles, fuse sparks, packet launch, and syndrome scanning.