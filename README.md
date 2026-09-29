# HammingSpace

> An interactive 3D learning tool for Hamming codes, parity checks, and error correction.

## Published Project Details

- **Title:** HammingSpace
- **Description:** HammingSpace is an interactive 3D learning tool that helps users understand Hamming codes, parity checks, and error correction through visual simulations and guided lessons. It turns abstract coding theory into an intuitive lab where users can encode messages, introduce bit errors, and see how syndrome decoding detects and corrects them in real time.
- **Creator Code version:** v1
- **Tags:** hamming, education, coding, visualization
- **Framework:** React
- **Database:** None

## About

HammingSpace makes binary linear block codes easier to understand by connecting the mathematics to an interactive transmission simulation. Choose a message, encode it, introduce channel errors, and follow the parity checks and syndrome decoder as they identify and correct an error. A 2D calculation view complements the 3D laboratory with step-by-step matrix arithmetic.

## Features

- Explore an interactive 3D transmitter, noisy channel, and receiver.
- Encode messages using supported Hamming and repetition code presets.
- Inject bit errors and inspect how the received word changes.
- Follow syndrome calculation and single-bit error correction.
- Switch to a 2D mathematical visualizer for matrix calculations.
- Use guided lessons to follow the transmission and decoding workflow.

## Requirements

- Node.js and npm
- A modern browser with WebGL support for the 3D laboratory

## Getting Started

```bash
npm install
npm run dev
```

Open the local URL printed by Vite in your terminal.

## Scripts

```bash
npm run dev       # Start the development server
npm run build     # Create the production build in dist/
npm run preview   # Preview the production build locally
npm run test:run  # Run the unit tests
npm run qa:flow   # Run the Chromium end-to-end flow test
```

## Tech Stack

React, TypeScript, Vite, Three.js, React Three Fiber, Zustand, KaTeX, Vitest, and Playwright.

## Verification

```bash
npm run test:run
npm run build
```