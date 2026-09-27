import React from 'react';
import Header from '../components/Header';
import AnimatedBackground from '../components/AnimatedBackground';

export default function Simulation() {
  return (
    <div className="min-h-screen flex flex-col">
      <AnimatedBackground />
      <Header />
      
      <main className="flex-1 container mx-auto px-4 md:px-8 py-8 flex flex-col">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            Interactive <span className="text-cyan-400">Simulation</span>
          </h1>
          <p className="text-slate-400 mt-2">
            The 3D Hamming space visualization will be loaded here.
          </p>
        </div>
        
        {/* Placeholder for the teammate's simulation */}
        <div className="flex-1 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/30 backdrop-blur flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-slate-500">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-slate-300">Simulation Placeholder</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              This container is styled and ready for the interactive 3D WebGL Hamming code simulation to be injected.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
