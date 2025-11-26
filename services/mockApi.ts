
import type { PlacementQuiz, QuizAnswers } from '../types';
import { QUIZ_QUESTIONS } from '../constants';

// Simulate network latency
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const completeQuiz = async (
  userId: string,
  answers: QuizAnswers
): Promise<PlacementQuiz> => {
  await delay(1500); // Simulate API call latency

  const started_at = new Date();
  started_at.setMinutes(started_at.getMinutes() - 5); // Assume quiz took 5 mins

  let score = 0;
  const misses = [];

  const answeredQuestionIds = Object.keys(answers);
  // Determine which questions were part of the quiz based on the answers provided.
  const questionsInQuiz = QUIZ_QUESTIONS.filter(q => answeredQuestionIds.includes(q.id));

  // If for some reason there are no questions (e.g. empty topic), handle gracefully.
  if (questionsInQuiz.length === 0) {
    return {
      id: `quiz_${new Date().getTime()}`,
      user_id: userId,
      started_at: started_at.toISOString(),
      completed_at: new Date().toISOString(),
      score: 0,
      passed_bool: false,
      misses: [],
    };
  }
  
  for (const question of questionsInQuiz) {
    if (answers[question.id] === question.correctOptionId) {
      score++;
    } else {
      misses.push(question.topic);
    }
  }

  const completed_at = new Date();
  // Passing threshold is 80%, based on original logic of 4/5 questions.
  const passed_bool = score / questionsInQuiz.length >= 0.8;

  const result: PlacementQuiz = {
    id: `quiz_${new Date().getTime()}`,
    user_id: userId,
    started_at: started_at.toISOString(),
    completed_at: completed_at.toISOString(),
    score,
    passed_bool,
    misses,
  };

  console.log("Quiz Result:", result);
  return result;
};
