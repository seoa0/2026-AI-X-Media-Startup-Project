export interface ChatMessage {
  id: string;
  role: 'bot' | 'user';
  text: string;
  time: string;
  source?: 'text' | 'voice';
  audioUrl?: string;
}

export interface ChatChoice {
  label: string;
  value: string;
}

export type VoiceSessionStatus = 'idle' | 'listening' | 'processing';

export function createChatId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function formatChatTime(date = new Date()) {
  return date.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true });
}
