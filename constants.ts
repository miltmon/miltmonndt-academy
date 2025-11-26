
import type { User, QuizQuestion } from './types';
import { Role, BadgeKey, QuizTopic } from './types';

export const MOCK_USERS: { [id: string]: User } = {
  'user-maria': {
    id: 'user-maria',
    name: 'Maria',
    avatarUrl: 'https://picsum.photos/seed/maria/100/100',
    role: Role.Learner,
    badges: [],
    community_profile: {
      headline: 'Aspiring CWI Inspector',
      bio: 'Eager to learn code and inspection science. Currently focused on AWS D1.1 fundamentals and visual inspection techniques.',
    },
    stats: {
      challenge_streak: 1,
      helpful_posts: 3,
    }
  },
  'user-jamal': {
    id: 'user-jamal',
    name: 'Jamal',
    avatarUrl: 'https://picsum.photos/seed/jamal/100/100',
    role: Role.Mentor,
    badges: [
      { badge_key: BadgeKey.FoundationVerified, earned_at: '2023-10-15T10:00:00Z' },
      { badge_key: BadgeKey.ClauseMaster, earned_at: '2023-11-20T14:30:00Z' },
      { badge_key: BadgeKey.TopContributor, earned_at: '2024-01-05T18:00:00Z' },
    ],
    community_profile: {
      headline: 'Senior CWI | Academy Mentor',
      bio: '10+ years of experience in structural and pipeline inspection. Passionate about mentoring the next generation of inspectors and raising the bar for quality.',
    },
    stats: {
      challenge_streak: 7,
      helpful_posts: 82,
    }
  },
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    topic: QuizTopic.WeldingSymbols,
    questionText: 'In a standard AWS welding symbol, where is information about the weld size located?',
    options: [
      { id: 'q1a1', text: 'In the tail' },
      { id: 'q1a2', text: 'To the left of the symbol' },
      { id: 'q1a3', text: 'To the right of the symbol' },
      { id: 'q1a4', text: 'Below the reference line' },
    ],
    correctOptionId: 'q1a2',
  },
  {
    id: 'q2',
    topic: QuizTopic.VisualInspection,
    questionText: 'According to AWS D1.1 for structural steel, which of the following is an unacceptable weld profile discontinuity?',
    options: [
        { id: 'q2a1', text: 'Slight undercut, less than 1/32"' },
        { id: 'q2a2', text: 'Minimal surface porosity' },
        { id: 'q2a3', text: 'Excessive convexity' },
        { id: 'q2a4', text: 'A smooth transition at the weld toes' },
    ],
    correctOptionId: 'q2a3',
  },
  {
    id: 'q3',
    topic: QuizTopic.CodeNavigation,
    questionText: 'ASME Section IX primarily covers which of the following?',
    options: [
      { id: 'q3a1', text: 'Rules for Construction of Pressure Vessels' },
      { id: 'q3a2', text: 'Nondestructive Examination' },
      { id: 'q3a3', text: 'Welding, Brazing, and Fusing Qualifications' },
      { id: 'q3a4', text: 'Rules for Inservice Inspection of Nuclear Power Plant Components' },
    ],
    correctOptionId: 'q3a3',
  },
  {
    id: 'q4',
    topic: QuizTopic.WPS,
    questionText: 'What is the primary purpose of a Procedure Qualification Record (PQR)?',
    options: [
      { id: 'q4a1', text: 'To provide instructions to the welder for production welding' },
      { id: 'q4a2', text: 'To document the actual variables used to create an acceptable test weld' },
      { id: 'q4a3', text: "To certify a welder's ability to deposit sound weld metal" },
      { id: 'q4a4', text: 'To list all approved welders for a specific project' },
    ],
    correctOptionId: 'q4a2',
  },
  {
    id: 'q5',
    topic: QuizTopic.Safety,
    questionText: 'When working in a confined space, what is the primary role of the "hole watch" or attendant?',
    options: [
        { id: 'q5a1', text: 'To assist with the welding or inspection work inside the space' },
        { id: 'q5a2', text: 'To monitor entrants and conditions, and summon rescue services if needed' },
        { id: 'q5a3', text: 'To provide ventilation for the confined space' },
        { id: 'q5a4', text: 'To complete the work permit before entry' },
    ],
    correctOptionId: 'q5a2',
  },
];