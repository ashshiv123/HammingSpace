import React from 'react';
import { motion } from 'framer-motion';

export default function TheoryCard({ id, title, content, Diagram, codeBlock }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
      className="scroll-mt-32 mb-16 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 md:p-8 backdrop-blur-sm shadow-xl shadow-black/20"
    >
      <h3 className="mb-6 text-2xl font-semibold text-slate-100 tracking-tight">{title}</h3>
      
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        <div className="flex-1 space-y-4 text-slate-300 leading-relaxed">
          {content}
          
          {codeBlock && (
            <div className="mt-6 rounded-lg bg-slate-950 p-4 border border-slate-800/80 font-mono text-sm text-blue-300 overflow-x-auto shadow-inner">
              <pre><code>{codeBlock}</code></pre>
            </div>
          )}
        </div>
        
        {Diagram && (
          <div className="flex-1 flex items-center justify-center min-h-[200px] rounded-xl bg-slate-950/50 border border-slate-800/50 p-4 shadow-inner">
            <Diagram />
          </div>
        )}
      </div>
    </motion.section>
  );
}
