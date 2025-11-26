import React from 'react';
import type { User } from '../types';
import { Role } from '../types';
import { UsersIcon } from './icons';

interface UserSelectionProps {
  users: User[];
  onSelect: (user: User) => void;
}

const UserSelection: React.FC<UserSelectionProps> = ({ users, onSelect }) => {
  return (
    <div className="max-w-3xl mx-auto text-center">
       <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Welcome to MiltmonNDT Academy</h1>
      <h2 className="mt-4 text-2xl font-semibold text-teal-300">Training. Mentorship. Mastery.</h2>
      <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-300">
        Welcome to MiltmonNDT Academy, a learning environment built on rigor, mentorship, and applied practice. Here, welders and inspectors don’t just prepare for exams; they gain a foundation in code literacy, inspection science, and professional judgment that carries into every project.
      </p>
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        {users.map(user => (
          <div key={user.id} className="group bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-teal-500 hover:bg-slate-700/50 transition-all duration-300 flex flex-col items-center">
            <img src={user.avatarUrl} alt={user.name} className="w-24 h-24 rounded-full border-4 border-slate-600 group-hover:border-teal-500 transition-colors" />
            <h3 className="mt-4 text-xl font-semibold text-white">{user.name}</h3>
            <p className="text-teal-400 capitalize">{user.role}</p>
            <p className="mt-2 text-sm text-slate-400 flex-grow">{user.community_profile.headline}</p>
            <button
              onClick={() => onSelect(user)}
              className="mt-6 w-full bg-teal-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-500 transition-colors"
            >
              {user.role === Role.Mentor ? 'Enter Community' : 'Assess My Edge'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserSelection;