import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Calculator,
} from 'lucide-react';
import { useSimulationStore } from './store/simulationStore';
import { LabScene } from './scenes/LabScene';
import { ControlPanel } from './components2d/ControlPanel';
import { SessionLogPanel } from './scenes/SessionLogPanel';
import { StageInstruction } from './components2d/StageInstruction';
import { useCalculationPlayback } from './hooks/useCalculationPlayback';
import { CalculationPage } from './pages/CalculationPage';
import { GameControllerHUD } from './components2d/GameControllerHUD';
import { FirstPersonReticle } from './components2d/FirstPersonReticle';
import { Footprints } from 'lucide-react';
import HammingLessonOverlay from './lesson/HammingLessonOverlay';
import { createLessonState } from './lesson/hammingLessonEngine.js';
import { SceneErrorBoundary } from './components2d/SceneErrorBoundary';

export default function App() {
  const {
    stage, cameraFocus, setCameraFocus, message, G, H, codeword, errorVector,
    lessonOpen, lessonPhase, lessonStep, setLessonStep, finishLessonPhase,
    skipLesson, reset,
  } = useSimulationStore();
  const [sceneResetKey, setSceneResetKey] = useState(0);
  useCalculationPlayback();
  const lessonState = createLessonState({ messageBits: message, G, H, c: codeword, errorVector });

  // Client-side route management: '/' for 3D Lab, '/calculation' for 2D visualizer
  const [currentView, setCurrentView] = useState<'3d' | 'calculation'>(() => {
    if (typeof window !== 'undefined' && window.location.pathname === '/calculation') {
      return 'calculation';
    }
    return '3d';
  });

  useEffect(() => {
    const onPopState = () => {
      if (window.location.pathname === '/calculation') {
        setCurrentView('calculation');
      } else {
        setCurrentView('3d');
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigateTo = (view: '3d' | 'calculation') => {
    setCurrentView(view);
    const targetPath = view === 'calculation' ? '/calculation' : '/';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
  };

  const getStatusBadge = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          initial={{ opacity: 0, y: -6, scale: 0.92, filter: 'blur(3px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: 6, scale: 0.92, filter: 'blur(3px)' }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="flex-shrink-0"
        >
          {(() => {
            switch (stage) {
              case 'idle':
                return (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-400 text-[11px] font-mono shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span>IDLE</span>
                  </div>
                );
              case 'encoding':
                return (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/70 border border-blue-500/50 text-blue-300 text-[11px] font-mono shadow-md shadow-blue-900/20">
                    <Zap className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                    <span className="font-semibold tracking-wide">ENCODING</span>
                  </div>
                );
              case 'inChannel':
                return (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/70 border border-blue-500/50 text-blue-300 text-[11px] font-mono shadow-md shadow-blue-900/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                    <span className="font-semibold tracking-wide">IN CHANNEL</span>
                  </div>
                );
              case 'decoding':
                return (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/70 border border-indigo-500/50 text-indigo-300 text-[11px] font-mono shadow-md shadow-indigo-900/20">
                    <Radio className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                    <span className="font-semibold tracking-wide">DECODING</span>
                  </div>
                );
              case 'errorDetected':
                return (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/70 border border-rose-500/60 text-rose-200 text-[11px] font-mono shadow-md shadow-rose-900/30">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span className="font-semibold tracking-wide">ERROR DETECTED</span>
                  </div>
                );
              case 'corrected':
                return (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/60 text-emerald-200 text-[11px] font-mono shadow-md shadow-emerald-900/30">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-semibold tracking-wide">CORRECTED</span>
                  </div>
                );
            }
          })()}
        </motion.div>
      </AnimatePresence>
    );
  };

  // Dedicated 2D Calculation Workspace View
  if (currentView === 'calculation') {
    return <CalculationPage onBackToLab={() => navigateTo('3d')} />;
  }

  // 3D Communication Lab View
  return (
    <div className="relative w-screen h-screen bg-[#0b0f19] overflow-hidden select-none font-sans">
      {/* 3D WebGL Canvas Layer (Base Layer: z-0) */}
      <div className="absolute inset-0 z-0">
        <SceneErrorBoundary
          resetKey={sceneResetKey}
          onRestart={() => {
            reset();
            setSceneResetKey((key) => key + 1);
          }}
        >
          <Canvas
            key={sceneResetKey}
            camera={{ position: [0, 3.2, 14.5], fov: 46 }}
            gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
            dpr={[1, 2]}
          >
            <color attach="background" args={['#0f1422']} />
            <LabScene />
          </Canvas>
        </SceneErrorBoundary>
      </div>

      <HammingLessonOverlay
        open={lessonOpen}
        lessonState={lessonState}
        phase={lessonPhase}
        stepNumber={lessonStep}
        onClose={skipLesson}
        onFinishPhase={(step, isPhaseEnd) => {
          if (isPhaseEnd) finishLessonPhase(lessonPhase as 'encoding' | 'decoding');
          else setLessonStep(step);
        }}
        onReset={reset}
      />

      {/* ========================================================================= */}
      {/* ROBUST CSS GRID APPLICATION SHELL (z-10)                                   */}
      {/* High-level CSS Grid: [Header Row] / [Main Interactive Grid Stage Area]     */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full h-full pointer-events-none grid grid-rows-[auto_1fr] p-2.5 sm:p-3.5 md:p-4 overflow-hidden">
        
        {/* ======================================================================= */}
        {/* ROW 1: HEADER CONTAINER (z-40)                                          */}
        {/* ======================================================================= */}
        <header className="row-start-1 w-full flex items-center justify-between gap-2.5 sm:gap-4 pointer-events-auto z-40 pb-2">
          {/* Brand Identity */}
          <div className="flex items-center gap-2.5 px-3.5 py-2 bg-slate-900/90 backdrop-blur-xl border border-slate-700/60 rounded-xl shadow-lg flex-shrink-0">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xs font-mono font-bold tracking-wider text-slate-100 uppercase">
                  Digital Communication Lab
                </h1>
                <span className="hidden md:inline-block px-1.5 py-0.5 text-[9px] font-mono uppercase bg-slate-800 border border-slate-700 text-slate-300 rounded">
                  STUDIO SIMULATOR
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
                Linear Block Code & Coset Syndrome Analyzer
              </p>
            </div>
          </div>

          {/* Center: Direct Mode Navigation Pill */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 backdrop-blur-xl border border-slate-700/60 rounded-xl shadow-lg flex-shrink-0">
            <button
              type="button"
              onClick={() => navigateTo('3d')}
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition cursor-pointer bg-blue-600 text-white shadow-sm"
            >
              🌐 3D Lab
            </button>
            <button
              type="button"
              onClick={() => navigateTo('calculation')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition cursor-pointer text-blue-300 border border-blue-500/40 bg-blue-950/40 hover:bg-blue-900/60"
              title="Open 2D Mathematical Matrix Visualizer (/calculation)"
            >
              <Calculator className="w-3.5 h-3.5 text-blue-400" />
              <span>2D Math Visualizer</span>
            </button>
          </div>

          {/* Top-Right: Unified Simulation Status Badge */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {getStatusBadge()}
          </div>
        </header>

        {/* ======================================================================= */}
        {/* ROW 2: MAIN GRID STAGE & MULTI-LAYER WORKSPACE (row-start-2)            */}
        {/* Dedicated non-overlapping container pods with explicit z-index hierarchy */}
        {/* ======================================================================= */}
        <main className="row-start-2 relative w-full h-full min-h-0 pointer-events-none">
          
          {/* Desktop 12-Column Grid Guide (Provides spatial zones on large screens) */}
          <div className="hidden lg:grid grid-cols-12 gap-4 w-full h-full pointer-events-none">
            {/* Col 1-3: Clear unobstructed viewport for 3D Transmitter & G Matrix */}
            <div className="col-span-3 pointer-events-none" />

            {/* Col 4-9: Center HUD calculation area */}
            <div className="col-span-6 pointer-events-none" />

            {/* Col 10-12: Reserved right sidebar area for ControlPanel */}
            <div className="col-span-3 pointer-events-none" />
          </div>

          {/* ===================================================================== */}
          {/* UNIQUE CONTAINER 1: CONTROL PANEL (z-35)                              */}
          {/* Docked top-right with scroll boundary and adaptive width              */}
          {/* ===================================================================== */}
          <aside
            id="control-panel-container"
            className="absolute top-1 sm:top-2 right-1 sm:right-2 md:right-3 pointer-events-auto z-35 max-h-[calc(100vh-6rem)] overflow-y-auto max-w-[calc(100vw-1.5rem)] transition-all duration-200"
          >
            <ControlPanel
              onOpenCalculationVisualizer={() => navigateTo('calculation')}
            />
          </aside>

          {/* ===================================================================== */}
          {/* UNIQUE CONTAINER 3: STAGE INSTRUCTION (z-30)                          */}
          {/* Centered at bottom with safe clearance above corner utility buttons   */}
          {/* ===================================================================== */}
          <motion.section
            id="stage-instruction-container"
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-12 sm:bottom-14 md:bottom-16 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] sm:w-auto sm:min-w-[440px] max-w-xl px-1 pointer-events-auto z-30"
          >
            <StageInstruction />
          </motion.section>

          {/* ===================================================================== */}
          {/* UNIQUE CONTAINER 4: WASD GAME CONTROLLER & SESSION LOG (z-35)         */}
          {/* Anchored bottom-left corner with dedicated space                      */}
          {/* ===================================================================== */}
          <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 flex flex-col gap-1.5 pointer-events-auto z-35 transition-all duration-200">
            <GameControllerHUD />
            <aside id="session-log-container">
              <SessionLogPanel />
            </aside>
          </div>

          {/* ===================================================================== */}
          {/* UNIQUE CONTAINER 5: CAMERA CONTROLS (z-35)                            */}
          {/* Anchored bottom-right corner with dedicated space                     */}
          {/* ===================================================================== */}
          <aside
            id="camera-controls-container"
            className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 pointer-events-auto z-35 transition-all duration-200"
          >
            <div className="flex items-center gap-1 p-1 bg-slate-900/90 backdrop-blur-xl border border-slate-700/60 rounded-xl shadow-lg">
              <div className="flex items-center gap-1 px-1.5 sm:px-2 text-[10px] font-mono text-slate-400">
                <Camera className="w-3 h-3 text-slate-400" />
                <span className="hidden sm:inline">VIEW:</span>
              </div>

              <button
                type="button"
                onClick={() => setCameraFocus('overview')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition cursor-pointer ${
                  cameraFocus === 'overview'
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                ⊙ OVERVIEW
              </button>
              <button
                type="button"
                onClick={() => setCameraFocus('tx')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition cursor-pointer ${
                  cameraFocus === 'tx' || cameraFocus === 'matrixG'
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                TX (G)
              </button>
              <button
                type="button"
                onClick={() => setCameraFocus('channel')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition cursor-pointer ${
                  cameraFocus === 'channel' || cameraFocus === 'noise'
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                CHANNEL
              </button>
              <button
                type="button"
                onClick={() => setCameraFocus('rx')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition cursor-pointer ${
                  cameraFocus === 'rx' || cameraFocus === 'syndrome' || cameraFocus === 'correction'
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                RX (H)
              </button>
              <button
                type="button"
                onClick={() => setCameraFocus('firstPerson')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono transition cursor-pointer ${
                  cameraFocus === 'firstPerson'
                    ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-950/40 ring-1 ring-emerald-400'
                    : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40'
                }`}
                title="Enter First Person View (Walk around studio at eye level with WASD)"
              >
                <Footprints className="w-3 h-3 text-emerald-300" />
                <span>1ST PERSON</span>
              </button>
            </div>
          </aside>

          {/* First Person View HUD Reticle & Pointer Lock Bar */}
          <FirstPersonReticle />

        </main>
      </div>
    </div>
  );
}
