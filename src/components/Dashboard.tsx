import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <h1 className="text-4xl font-bold text-white mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-slate-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Courses</h2>
          <p className="text-slate-300">View your enrolled courses</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Progress</h2>
          <p className="text-slate-300">Track your learning progress</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Certificates</h2>
          <p className="text-slate-300">View your earned certificates</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
