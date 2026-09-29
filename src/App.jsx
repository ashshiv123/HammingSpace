import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './ui/Home';
import Simulation from './ui/Simulation';
import SimulationApp from './SimulationApp'; // Keeping this if the team needs it later, but using the UI route

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/simulation" element={<Simulation />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
