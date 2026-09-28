import React from 'react';
import { motion } from 'framer-motion';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-[#0b0f19]">
      {/* Soft animated gradient orbs */}
      <motion.div 
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[100px]"
        animate={{
          x: ['0%', '30%', '0%'],
          y: ['0%', '20%', '0%'],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        style={{ willChange: "transform" }}
      />
      <motion.div 
        className="absolute top-[10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-indigo-600/20 blur-[100px]"
        animate={{
          x: ['0%', '-30%', '0%'],
          y: ['0%', '40%', '0%'],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        style={{ willChange: "transform" }}
      />
      <motion.div 
        className="absolute bottom-[-10%] left-[20%] w-[60%] h-[60%] rounded-full bg-cyan-600/15 blur-[120px]"
        animate={{
          x: ['0%', '25%', '-15%', '0%'],
          y: ['0%', '-25%', '15%', '0%'],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        style={{ willChange: "transform" }}
      />
      
      {/* Subtle grid pattern for technical feel */}
      <motion.div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem]"
        style={{ maskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, #000 10%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, #000 10%, transparent 100%)' }}
        animate={{
          backgroundPosition: ['0px 0px', '64px 64px']
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
