# HammingSpace — Interactive 3D & 2D Hamming Code Laboratory

HammingSpace is an interactive digital communication and coding theory laboratory that physicalizes abstract Galois Field arithmetic ($\text{GF}(2)$) and linear block codes into an immersive 3D simulation and textbook-grade mathematical visualizer.

---

## Problem Statement Fit

**Problem Statement: Interactive STEM Education & Visualizing Abstract Engineering Concepts**

Information theory and error-correcting codes form the bedrock of modern digital communication, satellite links, and computer memory (ECC RAM). However, traditional education in Hamming codes relies heavily on dense matrix equations ($c = m \cdot G$, $s = H \cdot r^T$) and binary XOR arithmetic over $\text{GF}(2)$ that students struggle to visualize conceptually. Learners frequently ask:
- *Why does multiplying a parity-check matrix $H$ by the received word $r^T$ pinpoint the exact flipped bit?*
- *How do parity bits physically carry the linear combination of data bits?*
- *What happens when channel noise exceeds the code's error-correction capacity $t = \lfloor (d_{\min}-1)/2 \rfloor$?*

**How HammingSpace Solves This**:
HammingSpace transforms mathematical abstraction into a living virtual laboratory. Users can toggle message bits on a physical transmitter console, watch codewords synthesize, inject noise into an optical propagation channel mid-flight, and watch syndrome decoding execute on a back-wall theory screen with animated glowing threads and traveling light pulses.

---

## Target Users

1. **Undergraduate & Graduate Students**: Computer Science, Electrical Engineering, and Telecommunications students studying digital communication, error control coding, and discrete mathematics.
2. **Educators & Professors**: Instructors looking for a classroom demonstration tool that bridges the gap between high-level theory and concrete physical mechanics.
3. **Engineers & Self-Learners**: Software engineers, embedded systems developers, and tech enthusiasts seeking an intuitive, visual understanding of ECC memory and error correction.

**Key User Pain Points Addressed**:
- Inability to visualize the flow of matrix multiplication over $\text{GF}(2)$.
- Lack of tactile cause-and-effect between bit corruption in transmission and algebraic syndrome detection.
- Static textbook diagrams that fail to show the transition between single-error correction and multi-error detection.

---

## What We Built

During the event, the team engineered a comprehensive, responsive 3D WebGL laboratory and 2D mathematical visualizer:
1. **Interactive 3D Studio Lab**: A sci-fi research studio featuring a Transmitter Laptop Station, Optical Propagation Channel, Receiver Station, and an architectural Back-Wall Theory Board.
2. **Live Theory & XOR Thread Wall Screen**: A high-resolution ($2048 \times 1152$) hardware-accelerated display rendering live $\text{GF}(2)$ matrix multiplication with curved bezier threads, traveling energy pulses, and real-time column matching.
3. **End-to-End Simulation Pipeline**: Complete transmission cycle ($m \to c = m \cdot G \to \text{Noise Injection } r = c \oplus e \to s = H \cdot r^T \to \text{Correction}$).
4. **2D Mathematical Visualizer**: A dedicated mathematical breakdown workspace with KaTeX typesetting, interactive matrix editors, and stepped calculation playback.
5. **Interactive 9-Step Guided Lesson Engine**: A paced educational narrative that walks users through each concept with contextual checkpoints, live values, and step skipping.
6. **Robust Multi-View Navigation**: Smooth camera choreography supporting Overview, Transmitter, Channel, Receiver, and First-Person human eye-level views with 100% free mouse look and WASD navigation.

---

## Core Features

- **Interactive Message Console**: Physical 3D toggle switches with real-time vector readout on the transmitter laptop.
- **Generator Matrix Synthesis ($G = [I_k \mid P]$)**: Live generation of systematic codewords, clearly delineating data bits from computed parity bits.
- **Optical Noise Channel with Bit-Flipping**: Clickable in-flight bit packets and interactive noise buttons allowing single or multiple bit errors.
- **Live GF(2) XOR Thread Visualizer**: An illuminated back-wall theory board rendering curved bezier threads and animated pulses that trace active parity equations into XOR accumulator gates.
- **Syndrome Sweep-and-Match Engine**: Calculates syndrome $s = H \cdot r^T$ and visibly matches $s$ against the column signatures of $H$, proving why non-zero syndromes pinpoint the exact error location.
- **Automated Hardware Bit Correction**: Instant single-bit error correction flipping the corrupted bit back to its valid state, restoring the payload.
- **Code Preset & Custom Dimension Support**: Supports standard $(7,4)$ Hamming code, $(15,11)$ Hamming code, $(3,1)$ repetition code, and custom generator submatrices.
- **Dual 3D / 2D Visualizer Modes**: Switch instantaneously between the spatial 3D research lab and the 2D KaTeX matrix visualizer.
- **Zero-Friction Camera Controls**: OrbitControls with smooth damping, WASD flight navigation, and uncaptured cursor for seamless UI interaction.
- **Scene Recovery Guard**: React Error Boundary wrapper ensuring the 3D scene recovers gracefully without crashing the application.

---

## Technical Architecture

HammingSpace is architected as a modular, single-page application built on React 18, TypeScript, and Three.js:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          User Interface Layer                          │
│   Header Bar  •  Control Station  •  Step Banner  •  Camera Nav HUD    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Global State Store (Zustand 5)                       │
│  State: m, c, r, e, s, G, H, P, stage, cameraFocus, errorPositions     │
│  Actions: toggleMessageBit, injectNoise, calculateSyndrome, correctBit │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│       3D Scene Layer (Three.js)      │  │    Pure Math Engine (GF2)    │
│  • TransmitterStation (Bit Toggles)  │  │  • gf2VecMatMul / gf2Add     │
│  • ChannelZone (Laser / Codeword)    │  │  • buildGH (Systematic G, H) │
│  • ReceiverStation (Correction)      │  │  • buildSyndromeTable        │
│  • TheoryScreen3D (CanvasTexture)    │  │  • decodeAndCorrect          │
│  • CameraController / OrbitControls  │  │  • calculationStepper        │
└──────────────────────────────────────┘  └──────────────────────────────┘
```

### Key Technical Decisions:
1. **Direct WebGL CanvasTexture for 3D Wall Display**: Rather than relying on CSS3D DOM projection (`Html transform`) which suffers from browser z-index occlusions and matrix drift, the back-wall theory board uses an offscreen $2048 \times 1152$ canvas rendered as a Three.js `CanvasTexture` with maximum anisotropy ($16\times$) and mipmapping. This guarantees 60 FPS performance, pin-sharp text, and zero rendering artifacts.
2. **Pure Functional GF(2) Engine**: All matrix operations, parity calculations, and syndrome derivations are decoupled into a dedicated TypeScript mathematical library (`src/math/`), ensuring zero mathematical drift between the 3D scene and 2D formulas.
3. **Unified Single Source of Truth**: A centralized Zustand store manages the pipeline state. Toggling a bit in the transmitter immediately updates the 3D codeword, the back-wall theory screen, the 2D stepper, and the guided lesson overlay simultaneously.

---

## Tech Stack

- **Core & Language**: TypeScript 5.5, React 18, HTML5 Canvas
- **3D Graphics & Rendering**: Three.js (r160), `@react-three/fiber` (8.x), `@react-three/drei` (9.x)
- **State Management**: Zustand 5
- **Styling & Design System**: Tailwind CSS, Vanilla CSS, Lucide React Icons
- **Mathematical Typesetting**: KaTeX, Framer Motion
- **Build & Development Tooling**: Vite 5, Node.js, Vitest, Playwright

---

## Innovation / Uniqueness

1. **Physicalized XOR Arithmetic**: Instead of abstract math equations, HammingSpace shows parity generation and syndrome checking as traveling energy pulses across glowing bezier curves into XOR gates, providing an intuitive mental model for linear block codes.
2. **Visual Proof of the Syndrome Decoding Algorithm**: The back-wall screen dynamically evaluates $s = H \cdot r^T$ and matches the 3-bit syndrome against the columns of $H$. When a match occurs, the column lights up and an indicator draws directly to the physical bit in the 3D scene, demystifying the algebraic proof.
3. **Authentic Boundary Limit Demonstration**: HammingSpace accurately demonstrates the limits of bounded distance decoding. When two errors are injected ($e > t$), the visualizer demonstrates that the syndrome is non-zero (errors detected) but warns that single-bit correction would produce a miscorrection, reinforcing $d_{\min} \ge 2t + 1$.
4. **Seamless Hybrid Viewport**: Users can switch instantly between an exploratory 3D lab environment and an educational 2D mathematical breakdown without losing session state.

---

## Demo Instructions

### 1. Quickstart & Local Setup
```bash
# Clone the repository
git clone git@github.com:ashshiv123/HammingSpace.git
cd HammingSpace

# Install dependencies
npm install

# Start the Vite development server
npm run dev
# Open http://localhost:5173 in your browser
```

### 2. Verification Commands
```bash
# Run unit tests
npm run test:run

# Verify production build
npm run build
```

### 3. Step-by-Step Guided Evaluation Flow
1. **Explore the 3D Environment**:
   - Left-click and drag anywhere on the canvas to rotate the camera.
   - Right-click and drag to pan; use the scroll wheel to zoom.
   - Use the camera bar in the bottom right to switch between **Overview**, **Transmitter**, **Channel**, **Receiver**, and **1st Person** views.
2. **Configure & Transmit**:
   - In the bottom Control Panel or directly on the Transmitter Laptop, toggle the message bits $m = [m_0, m_1, m_2, m_3]$ (e.g., set to `1 0 1 1`).
   - Click **Encode & Transmit**. Watch the codeword form systematically: $c = [m \mid p] = [1, 0, 1, 1, 0, 1, 0]$.
3. **Inject Channel Noise**:
   - Switch to the **Channel** view.
   - Click on any bit in the moving packet to flip it (e.g., flip bit $r_2$ from $1 \to 0$).
   - The flipped bit will pulse red with an `[ERROR]` alert.
4. **Observe the Wall Theory Screen**:
   - Turn toward the large Back-Wall Theory Board (or select **1st Person** view).
   - Observe the live parity-check matrix $H$, the active bezier threads, and the traveling pulses entering the three XOR gates ($s_0, s_1, s_2$).
   - Watch the syndrome vector compute to non-zero (e.g., $s = [1, 1, 0]$), matching Column 2 of matrix $H$.
5. **Decode & Correct**:
   - Click **Run Syndrome Decode** at the Receiver Station.
   - Click **Apply Single-Bit Correction**.
   - Notice the corrupted bit flips back from $0 \to 1$, turning emerald green, while the recovered payload is displayed on the receiver laptop.
6. **2D Math Visualizer**:
   - Click **2D Math Visualizer** at the top center toggle to inspect the full matrix multiplication steps, formula proofs, and KaTeX-typeset explanations.

---

## Known Limitations

- **Code Scope**: Current implementation focuses on binary linear block codes over $\text{GF}(2)$ (Hamming and repetition codes); non-binary codes like Reed-Solomon over $\text{GF}(2^m)$ are not yet modeled.
- **Device Support**: Optimized for desktop browsers with WebGL hardware acceleration; touch interaction on mobile devices is functional but best experienced on desktop with mouse navigation.
- **Audio Feedback**: Spatial 3D sound effects (synthesizer chimes for bit flips and pulse impacts) are currently disabled.

---

## Future Work

- **WebXR Immersive VR Mode**: Full WebXR integration allowing students to walk around the lab in virtual reality headsets and manipulate bit nodes with motion controllers.
- **Advanced Code Families**: Expand beyond Hamming codes to Cyclic Codes, BCH codes, and Low-Density Parity-Check (LDPC) codes with Tanner graph visualizations.
- **Multiplayer Collaborative Lab**: Synchronized multi-user laboratory sessions using WebSockets for collaborative classroom problem-solving.
- **Audio Synthesis**: Interactive Web Audio API sound design providing acoustic feedback for $\text{GF}(2)$ XOR toggles and syndrome detection.