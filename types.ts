export enum Role {
  Learner = 'learner',
  Mentor = 'mentor',
}

export enum BadgeKey {
  FoundationVerified = 'foundation_verified',
  ClauseMaster = 'clause_master',
  AcademyMentor = 'academy_mentor',
  TopContributor = 'top_contributor',
}

export enum QuizTopic {
  WeldingSymbols = 'Welding Symbols',
  VisualInspection = 'Visual Inspection Criteria',
  CodeNavigation = 'Code & Standards Navigation',
  WPS = 'Welder & Procedure Qualification',
  Safety = 'Job Site Safety',
}

export interface Badge {
  badge_key: BadgeKey;
  earned_at: string;
  evidence?: string;
}

export interface CommunityProfile {
  headline: string;
  bio: string;
}

export interface UserStats {
  challenge_streak: number;
  helpful_posts: number;
}

export interface User {
  id: string; // UUID
  name: string;
  avatarUrl: string;
  role: Role;
  badges: Badge[];
  community_profile: CommunityProfile;
  stats: UserStats;
}

export interface PlacementQuiz {
  id: string;
  user_id: string;
  started_at: string;
  completed_at: string;
  score: number; // 0-5
  passed_bool: boolean;
  misses: QuizTopic[];
}

export interface QuizQuestion {
  id: string;
  topic: QuizTopic;
  questionText: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
}

export type QuizAnswers = {
  [questionId: string]: string; // { questionId: selectedOptionId }
};

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}
