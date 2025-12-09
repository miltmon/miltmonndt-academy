import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/onboarding" element={<Onboarding user={{ id: 'placeholder' }} />} />
        <Route path="/onboarding/role" element={<Onboarding user={{ id: 'placeholder' }} />} />
        <Route path="/onboarding/profile" element={<Onboarding user={{ id: 'placeholder' }} />} />
        <Route path="/onboarding/skills" element={<Onboarding user={{ id: 'placeholder' }} />} />
        <Route path="/onboarding/complete" element={<Onboarding user={{ id: 'placeholder' }} />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to='/' />} />
      </Routes>
    </Router>
  );
}

export default App;
