import React from 'react';
import Header from '../components/Header';
import SimulationApp from '../SimulationApp';

export default function Simulation() {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#0b0f19]">
      <Header />
      
      <main className="flex-1 relative w-full h-full">
        <div className="absolute inset-0 [&>div]:!w-full [&>div]:!h-full [&>div]:!min-h-0">
          <SimulationApp />
        </div>
      </main>
    </div>
  );
}
