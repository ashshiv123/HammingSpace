import React from 'react';
import Aurora from './reactbits/Aurora';

/**
 * AnimatedBackground — Uses React Bits Aurora component
 * Tuned to site's cyan/indigo palette at low opacity with a radial vignette
 * so it gently floats behind cards without competing for attention.
 */
export default function AnimatedBackground() {
  return (
    <div 
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden" 
      style={{ backgroundColor: '#0b0f19' }}
    >
      {/* React Bits Aurora Ambient Waves */}
      <div 
        className="absolute inset-0"
        style={{ opacity: 0.35 }}
      >
        <Aurora
          colorStops={['#1d4ed8', '#06b6d4', '#4338ca']}
          amplitude={0.8}
          blend={0.6}
          speed={0.5}
        />
      </div>

      {/* Radial vignette mask so the background fades to near-solid behind cards */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 65% 65% at 50% 45%, rgba(11,15,25,0.3) 0%, #0b0f19 90%)',
        }}
      />
    </div>
  );
}
