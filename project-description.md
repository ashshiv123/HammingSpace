# HammingSpace

### Problem Statement Fit

We selected the Interactive STEM Education and Visualizing Abstract Engineering Concepts problem statement. HammingSpace addresses the difficulty of teaching error-correcting codes by turning abstract binary mathematics into an immersive, interactive learning lab. Students often struggle to connect parity-check equations and syndrome decoding to real communication behavior; this project makes those ideas visible and understandable through simulation.

### Target Users

- Undergraduate and graduate students studying computer science, electrical engineering, and telecommunications
- Educators and professors teaching digital communication and coding theory
- Self-learners and engineers who want a clearer visual understanding of Hamming codes and error correction

The key pain points are difficulty visualizing GF(2) operations, confusion around syndrome-based error detection, and limited hands-on understanding of how noisy channels affect transmitted data.

### What We Built

We built an interactive 3D web application that lets users explore how Hamming codes encode, transmit, detect, and correct errors. The project includes a lab-style scene, real-time codeword generation, noise injection, syndrome calculation, and guided educational steps that explain each part of the communication pipeline.

### Core Features

- Interactive message encoding and bit toggling
- Hamming code generation using systematic parity logic
- Channel noise simulation with bit-flip injection
- Live syndrome calculation and error localization
- Single-bit correction and recovery visualization
- 3D lab interface with a 2D mathematical explanation view
- Guided lesson flow for step-by-step learning

### Technical Architecture

HammingSpace is a React-based single-page application built around a modular architecture. The frontend renders a 3D simulation environment using Three.js and React Three Fiber, while a separate mathematical engine handles GF(2) operations, parity-check logic, and syndrome decoding. State is centralized so user interactions update the transmitter, channel, and receiver consistently across the visual system and calculation pipeline.

### Tech Stack

- React
- TypeScript
- Vite
- Three.js
- React Three Fiber
- Zustand
- Tailwind CSS
- Framer Motion
- KaTeX
- Vitest / Playwright

### Innovation / Uniqueness

The project differentiates itself by turning abstract coding theory into a visual, interactive experience. Instead of reading equations alone, users can see parity generation, syndrome matching, and single-bit correction happen in real time. This makes the learning process more intuitive and helps bridge the gap between theory and practical digital communication systems.

### Demo Instructions

1. Install dependencies with npm install
2. Start the app with npm run dev
3. Open the local development URL in a browser
4. Toggle message bits to create a payload
5. Encode and transmit the message
6. Inject noise into the channel to simulate a bit error
7. Observe the syndrome and apply single-bit correction
8. Switch between the 3D lab and 2D math view to inspect the underlying logic

### Known Limitations

- The current focus is on Hamming and repetition-style binary linear codes
- The experience is optimized for desktop browsers with WebGL support
- The project is educational and not yet a full production-grade engineering tool

### Future Work

- Extend support to more advanced code families such as BCH and LDPC
- Improve mobile and accessibility support
- Add more structured learning modules and challenge scenarios
- Expand the visual analytics for deeper classroom and research use
