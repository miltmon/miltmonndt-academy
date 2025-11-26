import React, { useState } from 'react';
import type { User, PlacementQuiz } from '../types';
import ProfileView from './ProfileView';
import AITools from './AITools';
import { UsersIcon, SparklesIcon } from './icons';

interface DashboardProps {
  user: User;
  onUserUpdate: (user: User) => void;
  quizResult: PlacementQuiz | null;
}

type DashboardTab = 'profile' | 'tools';

const Dashboard: React.FC<DashboardProps> = ({ user, onUserUpdate, quizResult }) => {
    const [activeTab, setActiveTab] = useState<DashboardTab>('profile');

    return (
        <div>
            <div className="mb-8 border-b border-slate-700">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors ${
                            activeTab === 'profile'
                            ? 'border-teal-400 text-teal-300'
                            : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
                        }`}
                    >
                        <UsersIcon className="inline h-5 w-5 mr-2"/>
                        My Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('tools')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors ${
                            activeTab === 'tools'
                            ? 'border-teal-400 text-teal-300'
                            : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
                        }`}
                    >
                        <SparklesIcon className="inline h-5 w-5 mr-2" />
                        AI Power Tools
                    </button>
                </nav>
            </div>
            
            <div>
                {activeTab === 'profile' && <ProfileView user={user} onUserUpdate={onUserUpdate} quizResult={quizResult} />}
                {activeTab === 'tools' && <AITools user={user} onUserUpdate={onUserUpdate} />}
            </div>
        </div>
    );
};

export default Dashboard;
