import React from 'react';
import { NavLink } from 'react-router-dom';
import { Hexagon, Activity } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md supports-[backdrop-filter]:bg-slate-950/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600/20 text-blue-500">
            <Hexagon size={20} className="fill-blue-500/20" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-100">HammingSpace</span>
        </div>
        
        <nav className="flex items-center gap-6">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `text-sm font-medium transition-colors hover:text-blue-400 ${isActive ? 'text-blue-500' : 'text-slate-400'}`
            }
          >
            Theory
          </NavLink>
          <NavLink 
            to="/simulation" 
            className={({ isActive }) => 
              `flex items-center gap-2 text-sm font-medium transition-colors hover:text-cyan-400 ${isActive ? 'text-cyan-500' : 'text-slate-400'}`
            }
          >
            <Activity size={16} />
            Simulation
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
