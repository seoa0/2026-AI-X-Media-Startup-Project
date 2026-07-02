import type { Song } from '../types/song';

export function getSongRoute(song: Song): string {
  if (song.status === 'completed') {
    return `/production/complete/${song.id}`;
  }

  if (song.productionReadyAt) {
    const readyAt = new Date(song.productionReadyAt).getTime();
    if (Date.now() >= readyAt) {
      return `/production/complete/${song.id}`;
    }
    return `/production/waiting/${song.id}`;
  }

  if (song.lyricsConfirmedAt) {
    return `/production/waiting/${song.id}`;
  }

  if (song.productionPhase === 'lyrics_making') {
    return `/lyrics-making/${song.id}`;
  }

  if (song.productionPhase === 'lyrics' || song.step === '가사 작성 중') {
    return `/lyrics/${song.id}`;
  }

  if (song.storySource) {
    if (song.storySource === 'new') {
      const readyForLyrics = song.messages.some(
        (m) => m.role === 'bot' && m.text.includes('가사 생성으로 넘어가'),
      );
      if (readyForLyrics) return `/lyrics/${song.id}`;
      return `/create/${song.id}`;
    }
    return `/lyrics/${song.id}`;
  }

  return `/story-source/${song.id}`;
}
