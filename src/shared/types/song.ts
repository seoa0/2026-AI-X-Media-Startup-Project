import type { ChatMessage } from './chat';

export type SongStatus = 'in_progress' | 'completed';

export type TimelineStepStatus = 'pending' | 'in_progress' | 'completed';

export interface SongTimelineEntry {
  id: string;
  label: string;
  status: TimelineStepStatus;
  updatedAt: string | null;
}

export interface Song {
  id: string;
  title: string;
  style: string | null;
  genre: string | null;
  packageId: string | null;
  progress: number;
  step: string;
  status: SongStatus;
  lyrics: string | null;
  melody: string | null;
  timeline: SongTimelineEntry[];
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSongRequest {
  packageId?: string;
  genre?: string;
  style?: string;
  title?: string;
}

export interface UpdateSongRequest {
  title?: string;
  genre?: string;
  style?: string;
  progress?: number;
  step?: string;
  status?: SongStatus;
  lyrics?: string | null;
  melody?: string | null;
  timeline?: SongTimelineEntry[];
  messages?: ChatMessage[];
}
