import React from 'react';
import type { User } from '../types';
import { LogoIcon } from './icons';

interface HeaderProps {
  currentUser: User | null;
  onReset: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onReset }) => {
  return (
    <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <LogoIcon className="h-10 w-auto text-white" />
          <div>
            <h1 className="text-lg font-bold tracking-wider text-white">MiltmonNDT Academy</h1>
            <p className="text-xs text-slate-400 tracking-widest font-light">NEW DIGITAL TECHNOLOGY</p>
          </div>
        </div>
        {currentUser && (
          <div className="flex items-center space-x-4">
            <span className="text-slate-300 hidden sm:block">Welcome, <span className="font-bold text-white">{currentUser.name}</span></span>
            <button
              onClick={onReset}
              className="bg-slate-700 text-slate-300 font-semibold py-2 px-4 rounded-lg hover:bg-slate-600 hover:text-white transition-colors text-sm"
            >
              Switch User
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;