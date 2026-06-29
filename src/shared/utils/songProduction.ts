import type { ChatMessage } from '../types/chat';
import type { Song, SongTimelineEntry } from '../types/song';

export const DEFAULT_TIMELINE_LABELS = [
  { id: 'idea', label: '아이디어 수집' },
  { id: 'lyrics', label: '가사 작성' },
  { id: 'melody', label: '멜로디 생성' },
  { id: 'vocal', label: '보컬 합성' },
  { id: 'mix', label: '믹싱 · 마스터링' },
] as const;

const STEP_TO_TIMELINE_INDEX: Record<string, number> = {
  '제작 시작': 0,
  '아이디어 수집 중': 0,
  '가사 작성 중': 1,
  '멜로디 생성 중': 2,
  '보컬 합성 중': 3,
  '믹싱 중': 4,
};

export function createInitialTimeline(): SongTimelineEntry[] {
  const now = new Date().toISOString();
  return DEFAULT_TIMELINE_LABELS.map((item, index) => ({
    id: item.id,
    label: item.label,
    status: index === 0 ? 'in_progress' : 'pending',
    updatedAt: index === 0 ? now : null,
  }));
}

export function advanceTimeline(timeline: SongTimelineEntry[], step: string): SongTimelineEntry[] {
  const activeIndex = STEP_TO_TIMELINE_INDEX[step] ?? 0;
  const now = new Date().toISOString();

  return timeline.map((entry, index) => {
    if (index < activeIndex) {
      return { ...entry, status: 'completed', updatedAt: entry.updatedAt ?? now };
    }
    if (index === activeIndex) {
      return { ...entry, status: 'in_progress', updatedAt: now };
    }
    return { ...entry, status: 'pending' };
  });
}

export function calcProgress(messageCount: number) {
  return Math.min(90, Math.max(5, messageCount * 8));
}

export function calcStep(messageCount: number) {
  if (messageCount <= 2) return '제작 시작';
  if (messageCount <= 4) return '아이디어 수집 중';
  if (messageCount <= 6) return '가사 작성 중';
  if (messageCount <= 8) return '멜로디 생성 중';
  if (messageCount <= 10) return '보컬 합성 중';
  return '믹싱 중';
}

export function deriveSongFieldsFromMessages(
  messages: ChatMessage[],
  current: Pick<Song, 'lyrics' | 'melody' | 'style' | 'genre' | 'timeline'>,
) {
  const messageCount = messages.length;
  const step = calcStep(messageCount);
  const progress = calcProgress(messageCount);
  const timeline = advanceTimeline(
    current.timeline?.length ? current.timeline : createInitialTimeline(),
    step,
  );

  const userLines = messages.filter((m) => m.role === 'user').map((m) => m.text.trim()).filter(Boolean);
  const lyrics = userLines.length > 0 ? userLines.join('\n') : current.lyrics;

  let melody = current.melody;
  const melodyIndex = STEP_TO_TIMELINE_INDEX['멜로디 생성 중'];
  const activeIndex = STEP_TO_TIMELINE_INDEX[step] ?? 0;
  if (activeIndex >= melodyIndex && !melody) {
    melody = 'AI 멜로디 생성 준비 중';
  }
  if (activeIndex > melodyIndex && melody === 'AI 멜로디 생성 준비 중') {
    melody = '멜로디 초안 생성 완료';
  }

  const style = current.style ?? current.genre;

  return { step, progress, timeline, lyrics, melody, style };
}
