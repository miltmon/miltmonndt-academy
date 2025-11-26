import React, { useState, useCallback } from 'react';
import type { User, PlacementQuiz, QuizAnswers } from './types';
import { Role, BadgeKey } from './types';
import { MOCK_USERS } from './constants';
import { completeQuiz } from './services/mockApi';
import Header from './components/Header';
import UserSelection from './components/UserSelection';
import QuizView from './components/QuizView';
import QuizResultView from './components/QuizResultView';
import Dashboard from './components/Dashboard';

type View = 'user-selection' | 'quiz' | 'result' | 'dashboard';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>('user-selection');
  const [quizResult, setQuizResult] = useState<PlacementQuiz | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleUserSelect = (user: User) => {
    setCurrentUser(user);
    if (user.role === Role.Mentor) {
      setCurrentView('dashboard');
    } else {
      setCurrentView('quiz');
    }
  };

  const handleQuizComplete = useCallback(async (answers: QuizAnswers) => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const result = await completeQuiz(currentUser.id, answers);
      setQuizResult(result);
      setCurrentUser(prevUser => {
        if (!prevUser) return null;
        const updatedUser = { ...prevUser };
        if (result.passed_bool && !prevUser.badges.some(b => b.badge_key === BadgeKey.FoundationVerified)) {
          updatedUser.badges = [...prevUser.badges, { badge_key: BadgeKey.FoundationVerified, earned_at: new Date().toISOString(), evidence: 'Passed placement quiz' }];
        }
        return updatedUser;
      });
      setCurrentView('result');
    } catch (error) {
      console.error("Failed to complete quiz:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  const handleNavigateToDashboard = () => {
    setCurrentView('dashboard');
  };
  
  const handleReset = () => {
    setCurrentUser(null);
    setQuizResult(null);
    setCurrentView('user-selection');
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)]">
          <svg className="animate-spin h-10 w-10 text-teal-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-lg text-slate-300">Submitting Quiz...</p>
        </div>
      );
    }

    switch (currentView) {
      case 'user-selection':
        return <UserSelection users={Object.values(MOCK_USERS)} onSelect={handleUserSelect} />;
      case 'quiz':
        return currentUser && <QuizView user={currentUser} onComplete={handleQuizComplete} />;
      case 'result':
        return quizResult && currentUser && <QuizResultView result={quizResult} user={currentUser} onContinue={handleNavigateToDashboard} />;
      case 'dashboard':
          return currentUser && <Dashboard user={currentUser} onUserUpdate={setCurrentUser} quizResult={quizResult} />;
      default:
        return <UserSelection users={Object.values(MOCK_USERS)} onSelect={handleUserSelect} />;
    }
  };

  return (
    <div className="min-h-screen font-sans">
      <Header currentUser={currentUser} onReset={handleReset} />
      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
