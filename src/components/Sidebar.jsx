import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, X, ChevronRight } from 'lucide-react';

export default function Sidebar({ topics, activeTopic, onTopicClick }) {
  const [isOpen, setIsOpen] = useState(false);

  const activeIndex = topics.findIndex(t => t.id === activeTopic);
  const activeTitle = topics[activeIndex]?.title || '';

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50">
      {/* Collapsed: floating pill with dots */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center gap-1"
          >
            {/* Open button */}
            <button
              onClick={() => setIsOpen(true)}
              className="mb-2 w-10 h-10 rounded-full bg-slate-900/90 border border-slate-700/60 backdrop-blur-xl flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500/50 transition-all shadow-lg cursor-pointer"
            >
              <List size={18} />
            </button>

            {/* Dot indicators */}
            {topics.map((topic, i) => (
              <button
                key={topic.id}
                onClick={() => onTopicClick(topic.id)}
                className="group relative cursor-pointer p-1"
              >
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-500 ease-out ${
                    i === activeIndex
                      ? 'bg-blue-500 scale-150 shadow-[0_0_8px_rgba(59,130,246,0.6)]'
                      : 'bg-slate-600 hover:bg-slate-400 scale-100'
                  }`}
                />
                {/* Tooltip on hover */}
                <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  <div className="bg-slate-900/95 border border-slate-700 text-xs text-slate-300 px-2 py-1 rounded-md shadow-lg">
                    {topic.title}
                  </div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded: floating panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -30, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-64 bg-slate-950/95 border border-slate-800/60 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/40 overflow-hidden"
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Topics</span>
              <button
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 rounded-md flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Topic list */}
            <nav className="p-2 max-h-[60vh] overflow-y-auto">
              {topics.map((topic, i) => (
                <motion.button
                  key={topic.id}
                  onClick={() => {
                    onTopicClick(topic.id);
                    setIsOpen(false);
                  }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`
                    w-full flex items-center gap-2 text-left px-3 py-2 text-[13px] rounded-lg transition-all cursor-pointer
                    ${activeTopic === topic.id
                      ? 'bg-blue-600/15 text-blue-400 font-medium'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    }
                  `}
                >
                  <ChevronRight
                    size={12}
                    className={`transition-transform ${activeTopic === topic.id ? 'text-blue-500 rotate-90' : 'text-slate-600'}`}
                  />
                  <span className="truncate">{topic.title}</span>
                </motion.button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
