import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Welcome to MiltmonNDT Academy
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Master welding inspection, quality control, and advanced NDT techniques with industry-leading training.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              to="/onboarding" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition"
            >
              Start Free Trial — No Credit Card
            </Link>
            <Link 
              to="/dashboard" 
              className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-8 rounded-lg transition"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-800/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-700/50 p-8 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-4">Expert Instructors</h3>
              <p className="text-slate-300">Learn from industry veterans with decades of experience.</p>
            </div>
            <div className="bg-slate-700/50 p-8 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-4">Flexible Learning</h3>
              <p className="text-slate-300">Study at your own pace with lifetime access to course materials.</p>
            </div>
            <div className="bg-slate-700/50 p-8 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-4">Certifications</h3>
              <p className="text-slate-300">Earn recognized certifications to advance your career.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
