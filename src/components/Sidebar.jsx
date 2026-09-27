import React from 'react';
import { Menu, X } from 'lucide-react';

export default function Sidebar({ topics, activeTopic, onTopicClick }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <div className="md:hidden sticky top-16 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur p-4 flex justify-between items-center">
        <span className="text-sm font-medium text-slate-300">Jump to section</span>
        <button onClick={() => setIsOpen(!isOpen)} className="text-slate-400 hover:text-white">
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar navigation */}
      <aside className={`
        fixed md:sticky top-[120px] md:top-24 z-30
        w-full md:w-64 shrink-0
        transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 md:translate-x-0 md:opacity-100'}
        bg-slate-950/95 md:bg-transparent
        h-[calc(100vh-120px)] md:h-[calc(100vh-8rem)]
        overflow-y-auto
        p-4 md:p-0 md:pl-4
        border-r border-slate-800 md:border-none
      `}>
        <nav className="flex flex-col gap-1">
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Topics</h4>
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => {
                onTopicClick(topic.id);
                setIsOpen(false);
              }}
              className={`
                flex items-center text-left px-3 py-2 text-sm rounded-md transition-all
                ${activeTopic === topic.id 
                  ? 'bg-blue-600/10 text-blue-400 font-medium' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }
              `}
            >
              <div className={`w-1.5 h-1.5 rounded-full mr-3 transition-colors ${activeTopic === topic.id ? 'bg-blue-500' : 'bg-transparent'}`} />
              {topic.title}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}
