import type { ChatMessage } from './chat';

export type SongStatus = 'in_progress' | 'completed';

export type TimelineStepStatus = 'pending' | 'in_progress' | 'completed';

export type ProductionPhase =
  | 'story_select'
  | 'idea'
  | 'lyrics_making'
  | 'lyrics'
  | 'production'
  | 'completed';

export type StorySource = 'prologue' | 'new';

export type VideoTier = 'lyric' | 'premium';

export type LyricsFlowPhase = 'preview' | 'revision' | 'melody' | 'video_upgrade';

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
  generatedLyrics: string | null;
  melody: string | null;
  timeline: SongTimelineEntry[];
  messages: ChatMessage[];
  storySource: StorySource | null;
  prologueStory: string | null;
  productionPhase: ProductionPhase;
  lyricsRegenCount: number;
  lyricsConfirmedAt: string | null;
  productionReadyAt: string | null;
  videoUrl: string | null;
  audioUrl: string | null;
  lyricsFlowPhase: LyricsFlowPhase | null;
  videoTier: VideoTier | null;
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
  generatedLyrics?: string | null;
  melody?: string | null;
  timeline?: SongTimelineEntry[];
  messages?: ChatMessage[];
  storySource?: StorySource | null;
  prologueStory?: string | null;
  productionPhase?: ProductionPhase;
  lyricsRegenCount?: number;
  lyricsConfirmedAt?: string | null;
  productionReadyAt?: string | null;
  videoUrl?: string | null;
  audioUrl?: string | null;
  lyricsFlowPhase?: LyricsFlowPhase | null;
  videoTier?: VideoTier | null;
}
