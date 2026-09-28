import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { FileText } from 'lucide-react';
import SpotlightCard from './reactbits/SpotlightCard';

export default function TheoryCard({ 
  id, 
  title, 
  content, 
  Diagram, 
  codeBlock, 
  paper,
  index = 0, 
  isActive = false, 
  onSelect 
}) {
  const prefersReduced = useReducedMotion();

  const handleClick = (e) => {
    // Don't trigger if clicking a link or code block
    if (e.target.closest('a') || e.target.closest('pre')) return;
    if (onSelect) {
      onSelect(id);
    }
  };

  return (
    <motion.section
      id={id}
      initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={prefersReduced ? { duration: 0 } : { duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="scroll-mt-28 w-full group cursor-pointer"
      onClick={handleClick}
    >
      <SpotlightCard
        spotlightColor={isActive ? 'rgba(34, 211, 238, 0.22)' : 'rgba(56, 189, 248, 0.12)'}
        className={`
          relative rounded-2xl border bg-slate-900/80 backdrop-blur-sm
          p-6 md:p-8 lg:p-10 overflow-hidden transition-all duration-300
          shadow-[0_4px_30px_rgba(0,0,0,0.3)]
          ${isActive 
            ? 'border-blue-500/60 shadow-[0_0_35px_rgba(59,130,246,0.18)] ring-1 ring-blue-500/40 bg-slate-900/90' 
            : 'border-slate-800/80 hover:border-slate-700/90 hover:shadow-[0_4px_35px_rgba(0,0,0,0.4)]'
          }
        `}
      >
        {/* Subtle accent glow on top border */}
        <div
          className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r transition-opacity duration-300 z-10 ${
            isActive 
              ? 'from-transparent via-cyan-400 to-transparent opacity-80' 
              : 'from-transparent via-blue-500/30 to-transparent opacity-40 group-hover:opacity-70'
          }`}
        />

        {/* Title */}
        <h3 className="relative z-10 mb-6 text-xl md:text-2xl font-bold text-slate-100 tracking-tight flex items-center justify-between">
          <span>{title}</span>
          <span className={`text-xs font-mono font-medium px-2 py-0.5 rounded-full transition-colors ${
            isActive ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-500 group-hover:text-slate-400'
          }`}>
            #{index + 1}
          </span>
        </h3>

        <div className="relative z-10 flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Text content */}
          <div className="flex-1 space-y-4 text-slate-300 leading-relaxed text-[15px] antialiased">
            {content}

            {codeBlock && (
              <div className="mt-6 rounded-xl bg-slate-950/90 p-5 border border-slate-800/80 font-mono text-sm text-blue-300 overflow-x-auto shadow-inner">
                <pre><code>{codeBlock}</code></pre>
              </div>
            )}

            {/* Research paper link (optional) */}
            {paper && (
              <div className="mt-6 pt-4 border-t border-slate-800/60">
                <a
                  href={paper.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-blue-400 transition-colors group/link"
                >
                  <FileText size={14} className="text-blue-400/80" />
                  <span>
                    {paper.authors && <span className="text-slate-500">{paper.authors} — </span>}
                    <span className="underline underline-offset-2 decoration-slate-700 group-hover/link:decoration-blue-400">
                      {paper.title}
                    </span>
                  </span>
                </a>
              </div>
            )}
          </div>

          {/* Diagram panel */}
          {Diagram && (
            <div className="flex-1 flex items-center justify-center min-h-[220px] lg:min-h-[260px] rounded-xl bg-slate-950/60 border border-slate-800/60 p-6 shadow-inner">
              <Diagram />
            </div>
          )}
        </div>
      </SpotlightCard>
    </motion.section>
  );
}
