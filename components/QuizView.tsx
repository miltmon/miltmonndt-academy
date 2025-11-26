import React, { useState } from 'react';
import type { User, QuizAnswers, QuizQuestion } from '../types';
import { QuizTopic } from '../types';
import { QUIZ_QUESTIONS } from '../constants';
import { WeldSymbolIcon, EyeIcon, BookOpenIcon, DocumentIcon, ShieldIcon, ListIcon } from './icons';

interface QuizViewProps {
  user: User;
  onComplete: (answers: QuizAnswers) => void;
}

const topicDetails: { [key in QuizTopic | 'All']: { name: string; icon: React.ReactNode; questionCount: number; } } = {
    'All': {
        name: 'Comprehensive Quiz',
        icon: <ListIcon className="h-10 w-10 mx-auto text-teal-300 mb-2" />,
        questionCount: QUIZ_QUESTIONS.length,
    },
    [QuizTopic.WeldingSymbols]: {
        name: QuizTopic.WeldingSymbols,
        icon: <WeldSymbolIcon className="h-10 w-10 mx-auto text-teal-300 mb-2" />,
        questionCount: QUIZ_QUESTIONS.filter(q => q.topic === QuizTopic.WeldingSymbols).length,
    },
    [QuizTopic.VisualInspection]: {
        name: 'Visual Inspection',
        icon: <EyeIcon className="h-10 w-10 mx-auto text-teal-300 mb-2" />,
        questionCount: QUIZ_QUESTIONS.filter(q => q.topic === QuizTopic.VisualInspection).length,
    },
    [QuizTopic.CodeNavigation]: {
        name: 'Code Navigation',
        icon: <BookOpenIcon className="h-10 w-10 mx-auto text-teal-300 mb-2" />,
        questionCount: QUIZ_QUESTIONS.filter(q => q.topic === QuizTopic.CodeNavigation).length,
    },
    [QuizTopic.WPS]: {
        name: 'WPS/PQR',
        icon: <DocumentIcon className="h-10 w-10 mx-auto text-teal-300 mb-2" />,
        questionCount: QUIZ_QUESTIONS.filter(q => q.topic === QuizTopic.WPS).length,
    },
    [QuizTopic.Safety]: {
        name: 'Job Site Safety',
        icon: <ShieldIcon className="h-10 w-10 mx-auto text-teal-300 mb-2" />,
        questionCount: QUIZ_QUESTIONS.filter(q => q.topic === QuizTopic.Safety).length,
    },
};

const QuizView: React.FC<QuizViewProps> = ({ user, onComplete }) => {
  const [selectedTopic, setSelectedTopic] = useState<QuizTopic | 'All' | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handleTopicSelect = (topic: QuizTopic | 'All') => {
    setSelectedTopic(topic);
    setQuestions(topic === 'All' ? QUIZ_QUESTIONS : QUIZ_QUESTIONS.filter(q => q.topic === topic));
    setAnswers({});
    setCurrentQuestionIndex(0);
  };

  const handleResetTopic = () => {
    setSelectedTopic(null);
    setQuestions([]);
  };

  const handleOptionSelect = (questionId: string, optionId: string) => {
    setAnswers({ ...answers, [questionId]: optionId });
  };
  
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  }
  
  const handleSubmit = () => {
    onComplete(answers);
  };

  if (!selectedTopic) {
    return (
        <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white">Focus Your Learning</h2>
            <p className="mt-2 text-lg text-slate-300">Select a topic for a focused quiz, or choose the comprehensive assessment.</p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(['All'] as (QuizTopic | 'All')[]).concat(Object.values(QuizTopic)).map((topic) => (
                    <button
                        key={topic}
                        onClick={() => handleTopicSelect(topic)}
                        className="group bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-teal-500 hover:bg-slate-700/50 transition-all duration-300 flex flex-col items-center text-center"
                    >
                        {topicDetails[topic].icon}
                        <h3 className="text-lg font-semibold text-white">{topicDetails[topic].name}</h3>
                        <p className="text-sm text-slate-400 mt-1">{topicDetails[topic].questionCount} Questions</p>
                    </button>
                ))}
            </div>
        </div>
    );
  }

  if (questions.length === 0) {
      return (
        <div className="max-w-3xl mx-auto text-center">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
                <h2 className="text-xl font-semibold text-white">No Questions Available</h2>
                <p className="mt-2 text-slate-300">There are no questions for the selected topic at this moment.</p>
                <button
                    onClick={handleResetTopic}
                    className="mt-6 bg-teal-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-teal-500 transition-colors"
                >
                    Choose a Different Topic
                </button>
            </div>
        </div>
      );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const answeredQuestions = Object.keys(answers).length;
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
            <div className="mb-6">
                 <div className="flex justify-between items-center mb-2">
                    <div>
                        <h2 className="text-sm font-bold text-teal-400 uppercase tracking-widest">{topicDetails[selectedTopic]?.name} Quiz</h2>
                        <button onClick={handleResetTopic} className="text-xs text-slate-400 hover:text-slate-200 hover:underline transition-colors">
                            Change Topic
                        </button>
                    </div>
                    <p className="text-sm text-slate-400 font-mono">Question {currentQuestionIndex + 1}/{questions.length}</p>
                 </div>
                 <div className="w-full bg-slate-700 rounded-full h-2.5">
                    <div className="bg-teal-500 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                 </div>
            </div>

            <h3 id={`q${currentQuestionIndex}-label`} className="text-2xl font-semibold text-white mb-6 min-h-[6rem]">{currentQuestion.questionText}</h3>
            
            <div role="radiogroup" aria-labelledby={`q${currentQuestionIndex}-label`} className="space-y-4">
                {currentQuestion.options.map(option => (
                    <label key={option.id} className={`flex items-center p-4 rounded-lg cursor-pointer border-2 transition-all duration-200 ${answers[currentQuestion.id] === option.id ? 'bg-teal-900/50 border-teal-500' : 'bg-slate-700/50 border-slate-600 hover:border-teal-600'}`}>
                        <input
                            type="radio"
                            name={`question-${currentQuestion.id}`}
                            value={option.id}
                            checked={answers[currentQuestion.id] === option.id}
                            onChange={() => handleOptionSelect(currentQuestion.id, option.id)}
                            className="hidden"
                        />
                         <span className={`w-5 h-5 rounded-full border-2 mr-4 flex-shrink-0 flex items-center justify-center ${answers[currentQuestion.id] === option.id ? 'border-teal-400' : 'border-slate-500'}`}>
                            {answers[currentQuestion.id] === option.id && <span className="w-2.5 h-2.5 bg-teal-400 rounded-full"></span>}
                        </span>
                        <span className="text-slate-200">{option.text}</span>
                    </label>
                ))}
            </div>
            
            <div className="mt-8 flex justify-end">
                {currentQuestionIndex < questions.length - 1 ? (
                     <button
                        onClick={handleNext}
                        disabled={!answers[currentQuestion.id]}
                        className="bg-teal-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-teal-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                     >
                        Next
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={answeredQuestions < questions.length}
                        className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                    >
                        Submit Quiz
                    </button>
                )}
            </div>
        </div>
    </div>
  );
};

export default QuizView;