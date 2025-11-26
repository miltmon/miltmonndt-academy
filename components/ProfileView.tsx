import React from 'react';
import type { User, PlacementQuiz } from '../types';
import { BadgeKey } from '../types';
import { BadgeIcon, ChartBarIcon, FireIcon, ThumbUpIcon } from './icons';

interface ProfileViewProps {
  user: User;
  onUserUpdate: (user: User) => void;
  quizResult: PlacementQuiz | null;
}

const badgeInfo = {
  [BadgeKey.FoundationVerified]: { name: 'Foundation Verified', description: "Passed the initial skills assessment.", icon: <BadgeIcon className="h-8 w-8 text-green-400" /> },
  [BadgeKey.ClauseMaster]: { name: 'Clause Master', description: "Mastered 3 consecutive weekly challenges.", icon: <BadgeIcon className="h-8 w-8 text-purple-400" /> },
  [BadgeKey.AcademyMentor]: { name: 'Academy Mentor', description: "Share clause wisdom, review posts, and guide new inspectors.", icon: <BadgeIcon className="h-8 w-8 text-blue-400" /> },
  [BadgeKey.TopContributor]: { name: 'Top Contributor', description: "Consistently provides helpful posts and feedback.", icon: <BadgeIcon className="h-8 w-8 text-yellow-400" /> },
};

const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode; }> = ({ label, value, icon }) => (
    <div className="bg-slate-700/50 p-4 rounded-lg flex items-center space-x-4">
        <div className="text-teal-400">{icon}</div>
        <div>
            <p className="text-sm text-slate-400">{label}</p>
            <p className="text-xl font-bold text-white">{value}</p>
        </div>
    </div>
);


const ProfileView: React.FC<ProfileViewProps> = ({ user, onUserUpdate, quizResult }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Left Column - Profile Card */}
      <div className="md:col-span-1">
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 text-center sticky top-28">
          <img src={user.avatarUrl} alt={user.name} className="w-32 h-32 rounded-full mx-auto border-4 border-teal-500" />
          <h2 className="mt-4 text-2xl font-bold text-white">{user.name}</h2>
          <p className="text-teal-400 capitalize">{user.role}</p>
          <p className="mt-2 text-slate-300 text-sm">{user.community_profile.headline}</p>
          <p className="mt-4 text-slate-400 text-sm">{user.community_profile.bio}</p>
        </div>
      </div>

      {/* Right Column - Badges & Stats */}
      <div className="md:col-span-2 space-y-8">
        {/* Stats & Activity */}
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4">Stats & Activity</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {quizResult && (
                <StatCard 
                    label="Last Quiz Score" 
                    value={`${quizResult.score}/${quizResult.score + quizResult.misses.length}`}
                    icon={<ChartBarIcon className="h-8 w-8"/>}
                />
                )}
                <StatCard 
                label="Challenge Streak" 
                value={user.stats.challenge_streak}
                icon={<FireIcon className="h-8 w-8"/>}
                />
                <StatCard 
                label="Helpful Posts" 
                value={user.stats.helpful_posts}
                icon={<ThumbUpIcon className="h-8 w-8"/>}
                />
            </div>
        </div>

        {/* Badges Section */}
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
          <h3 className="text-xl font-bold text-white mb-4">Achievements</h3>
          {user.badges.length > 0 ? (
            <ul className="space-y-4">
              {user.badges.map(({ badge_key, earned_at }) => (
                <li key={badge_key} className="flex items-center space-x-4 p-3 bg-slate-700/50 rounded-lg">
                  <div>{badgeInfo[badge_key].icon}</div>
                  <div>
                    <p className="font-semibold text-white">{badgeInfo[badge_key].name}</p>
                    <p className="text-sm text-slate-400">{badgeInfo[badge_key].description}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-400">No badges earned yet. Complete the quiz and challenges to unlock them!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
