export type Role = 'Admin' | 'Instructor' | 'Student';

export interface User {
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  password?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  hours: number;
  thumbnail: string;
  instructorName: string;
  price: number;
}

export interface Video {
  id: string;
  courseId: string;
  title: string;
  url: string; // Using local mock paths or YouTube embeds for demo
  duration: string;
  order: number;
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  questions: Question[];
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
}

export interface QuizSubmission {
  id: string;
  quizId: string;
  userEmail: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
  date: string;
}

export interface Enrollment {
  courseId: string;
  userEmail: string;
  progress: number; // 0-100
  enrollDate: string;
  completed: boolean;
}

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  date: string;
  userEmail: string;
}

export interface ChatMessage {
  id: string;
  courseId: string;
  userEmail: string;
  userName: string;
  text: string;
  timestamp: string;
}

export interface LiveClass {
  id: string;
  courseId: string;
  topic: string;
  startTime: string; // ISO string
  instructorEmail: string;
  link: string;
}

export interface VideoProgress {
  videoId: string;
  watchedSeconds: number;
  completed: boolean;
}