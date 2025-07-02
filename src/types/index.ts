export interface Category {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface Paper {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  subCategory: string;
  questionCount: number;
  duration: number; // in minutes
}

export interface Question {
  id: string;
  paperId: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface UserAnswer {
  questionId: string;
  selectedOption: string;
  isCorrect: boolean;
  timeSpent: number; // in seconds
}

export interface TestResult {
  id: string;
  paper: Paper;
  answers: UserAnswer[];
  score: number;
  totalTimeSpent: number; // in seconds
  completedAt: Date;
}
