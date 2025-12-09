import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-white">
            MiltmonNDT Academy
          </Link>
          <nav className="flex gap-6">
            <Link to="/" className="text-slate-300 hover:text-white transition">Home</Link>
            <Link to="/onboarding" className="text-slate-300 hover:text-white transition">Onboarding</Link>
            <Link to="/dashboard" className="text-slate-300 hover:text-white transition">Dashboard</Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
