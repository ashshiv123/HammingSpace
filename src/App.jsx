import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './ui/Home';
import Simulation from './ui/Simulation';
import SimulationApp from './SimulationApp'; // Keeping this if the team needs it later, but using the UI route

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/simulation" element={<Simulation />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
