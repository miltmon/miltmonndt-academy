import React from 'react';
import type { User, PlacementQuiz } from '../types';
import { CheckCircleIcon, XCircleIcon, BookOpenIcon } from './icons';

interface QuizResultViewProps {
  result: PlacementQuiz;
  user: User;
  onContinue: () => void;
}

const QuizResultView: React.FC<QuizResultViewProps> = ({ result, user, onContinue }) => {
  const totalQuestions = result.score + result.misses.length;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 text-center">
        {result.passed_bool ? (
          <>
            <CheckCircleIcon className="h-20 w-20 mx-auto text-green-400" />
            <h2 className="mt-4 text-3xl font-bold text-white">Foundation Verified—You’re track-ready.</h2>
            <p className="mt-2 text-lg text-slate-300">Choose WeldTrack™ or PipeTrack™, or browse Foundation as a refresher.</p>
          </>
        ) : (
          <>
            <XCircleIcon className="h-20 w-20 mx-auto text-amber-400" />
            <h2 className="mt-4 text-3xl font-bold text-white">Let’s sharpen your edge.</h2>
            <p className="mt-2 text-lg text-slate-300">A short Foundation refresh will set you up for certification success. We’ll also place you with a study squad.</p>
          </>
        )}

        <div className="mt-8 bg-slate-700/50 p-6 rounded-lg text-left">
          <h3 className="text-xl font-semibold text-white mb-4">Quiz Summary</h3>
          <div className="flex justify-between items-center text-lg mb-2">
            <span className="text-slate-300">Your Score:</span>
            <span className={`font-bold ${result.passed_bool ? 'text-green-400' : 'text-amber-400'}`}>
              {result.score} / {totalQuestions}
            </span>
          </div>
          <div className="w-full bg-slate-600 rounded-full h-4">
            <div
              className={`${result.passed_bool ? 'bg-green-500' : 'bg-amber-500'} h-4 rounded-full`}
              style={{ width: `${(result.score / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {result.misses.length > 0 && (
          <div className="mt-6 bg-slate-700/50 p-6 rounded-lg text-left">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <BookOpenIcon className="h-6 w-6 mr-2 text-teal-400" />
              Areas to Focus On
            </h3>
            <ul className="list-disc list-inside space-y-2 text-slate-300">
              {result.misses.map((topic, index) => (
                <li key={index}>{topic}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8">
          <button
            onClick={onContinue}
            className="w-full bg-teal-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-500 transition-colors text-lg"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResultView;
