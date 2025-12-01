
export interface FixStep {
  stepNumber: number;
  instruction: string;
  detail: string;
  visualPrompt: string; // Prompt to generate the image
  generatedImageUrl?: string; // Populated after generation
}

export interface Tool {
  name: string;
  estimatedPrice: string;
  isCommon: boolean; // True if likely in a basic toolbox
}

export interface FixPlan {
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedTime: string;
  safetyWarning: string;
  tools: Tool[];
  steps: FixStep[];
}

export interface UserProfile {
  name: string;
  streak: number;
  badges: string[];
  points: number;
  skillLevel: 'Novice' | 'Apprentice' | 'Home Hero';
}

export interface StoreLocation {
  name: string;
  address: string;
  uri?: string;
  rating?: string;
}

export interface CommunityPost {
  id: string;
  author: string;
  title: string;
  description: string;
  likes: number;
  comments: number;
  timeAgo: string;
}

export interface ChatMessage {
  id: string;
  sender: 'me' | 'partner';
  text: string;
  timestamp: Date;
}

export type AuthProvider = 'Google' | 'Microsoft' | 'GitHub' | 'X';

export enum AppView {
  SIGN_IN = 'SIGN_IN',
  DASHBOARD = 'DASHBOARD',
  SCANNER = 'SCANNER',
  FIX_GUIDE = 'FIX_GUIDE',
  TOOL_FINDER = 'TOOL_FINDER',
  COACH = 'COACH',
  LUNCHBOX = 'LUNCHBOX',
  SETTINGS = 'SETTINGS',
  COMMUNITY = 'COMMUNITY',
  ASK_HELP = 'ASK_HELP',
  CHAT = 'CHAT',
}

export enum LoadingState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  SEARCHING_STORES = 'SEARCHING_STORES',
}
