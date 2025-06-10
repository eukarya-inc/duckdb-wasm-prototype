export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface TaskLoopConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
}

export interface TaskLoopCallbacks {
  onStreamUpdate?: (content: string) => void;
  onComplete?: (content: string) => void;
  onError?: (error: Error) => void;
}

export interface TaskLoopState {
  isRunning: boolean;
  currentMessage: string;
  conversationHistory: Message[];
}

export type TaskLoopFunction = (
  message: string,
  callbacks?: TaskLoopCallbacks
) => Promise<void>;