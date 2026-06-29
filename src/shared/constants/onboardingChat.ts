export type ChatStep = 'intro' | 'recentSong' | 'favoriteSong' | 'story' | 'genre' | 'songTitle' | 'done';

export interface ChatChoice {
  label: string;
  value: string;
}

export const STORY_CHOICES: ChatChoice[] = [
  { label: '사랑 이야기', value: '사랑' },
  { label: '이별 이야기', value: '이별' },
  { label: '성장과 도전', value: '도전' },
  { label: '위로와 희망', value: '희망' },
  { label: '청춘', value: '청춘' },
  { label: '우정', value: '우정' },
  { label: '여행', value: '여행' },
  { label: '자유와 일탈', value: '자유' },
  { label: '꿈과 미래', value: '꿈' },
];

export const GENRE_CHOICES: ChatChoice[] = [
  { label: '발라드', value: '발라드' },
  { label: 'K-POP', value: 'K-POP' },
  { label: '힙합', value: '힙합' },
  { label: 'R&B', value: 'R&B' },
  { label: '록', value: '록' },
  { label: 'EDM', value: 'EDM' },
  { label: '인디', value: '인디' },
  { label: '어쿠스틱', value: '어쿠스틱' },
  { label: 'POP', value: 'POP' },
  { label: '재즈', value: '재즈' },
  { label: '시티팝', value: '시티팝' },
  { label: '트로트', value: '트로트' },
];

const STORY_GENRE_MAP: Record<string, string[]> = {
  사랑: ['발라드', 'R&B', 'K-POP'],
  이별: ['발라드', 'R&B'],
  도전: ['록', '힙합', 'K-POP'],
  희망: ['발라드', '어쿠스틱', 'R&B'],
  청춘: ['K-POP', '인디', '록'],
  우정: ['K-POP', 'POP'],
  여행: ['EDM', 'POP', '시티팝'],
  자유: ['힙합', '록', 'EDM'],
  꿈: ['발라드', 'POP', '인디'],
};

export const ONBOARDING_QUESTIONS = {
  recentSong: '평소에 어떤 노래를 즐겨 들으시나요?',
  favoriteSong: '좋아하시는 노래를 알려주시겠어요?',
  story: '이번 노래에 담고 싶은 이야기를 말씀해 주시겠어요?',
  songTitle: '이 노래의 제목은 무엇으로 할까요?',
} as const;

export function getIntroMessage() {
  return `안녕하세요!
저는 '나도 가수다' AI 뮤직 메이트입니다.

고객님만의 음악을 위해 몇 가지 여쭤볼게요.`;
}

export function getFirstQuestionMessage() {
  return ONBOARDING_QUESTIONS.recentSong;
}

export function buildGenreQuestionMessage(genres: string[]) {
  return `답변을 종합해 보니 ${genres.join(', ')} 장르가 가장 잘 어울릴 것 같아요.\n이 스토리를 어떤 장르로 제작하고 싶으신가요?`;
}

export function buildAfterGenreMessage(genre: string) {
  return `${genre} 장르로 제작해 드리겠습니다!\n\n${ONBOARDING_QUESTIONS.songTitle}`;
}

export function buildCompletionMessage(songTitle: string) {
  return `«${songTitle}», 멋진 제목이에요!\n이제 제작에 들어가겠습니다!`;
}

export function recommendGenres(input: {
  story?: string;
  recentSong?: string;
  favoriteSong?: string;
}): string[] {
  const scores = new Map<string, number>();

  const addScore = (genre: string, score: number) => {
    scores.set(genre, (scores.get(genre) ?? 0) + score);
  };

  if (input.story && STORY_GENRE_MAP[input.story]) {
    STORY_GENRE_MAP[input.story].forEach((genre, index) => {
      addScore(genre, 4 - index);
    });
  }

  const text = [input.favoriteSong, input.recentSong, input.story].join(' ').toLowerCase();

  if (text.includes('아이유') || text.includes('성시경') || text.includes('발라드')) {
    addScore('발라드', 3);
  }
  if (
    text.includes('뉴진스') ||
    text.includes('에스파') ||
    text.includes('아이브') ||
    text.includes('세븐틴') ||
    text.includes('방탄') ||
    text.includes('bts')
  ) {
    addScore('K-POP', 3);
  }
  if (text.includes('창모') || text.includes('지코') || text.includes('힙합')) {
    addScore('힙합', 3);
  }
  if (text.includes('crush') || text.includes('딘')) {
    addScore('R&B', 3);
  }
  if (text.includes('coldplay') || text.includes('day6') || text.includes('데이식스')) {
    addScore('록', 3);
  }
  if (text.includes('edm')) {
    addScore('EDM', 3);
  }

  if (scores.size === 0) {
    return ['K-POP', '발라드', 'R&B'];
  }

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([genre]) => genre);
}

export function matchChoiceFromSpeech(text: string, choices: ChatChoice[]): ChatChoice | null {
  const normalized = text.trim().toLowerCase();
  if (!normalized) return null;

  for (const choice of choices) {
    const label = choice.label.toLowerCase();
    const value = choice.value.toLowerCase();
    if (normalized.includes(label) || label.includes(normalized)) return choice;
    if (normalized.includes(value) || value.includes(normalized)) return choice;
  }
  return null;
}

export function parseIntroSpeech(text: string): 'start' | 'question' {
  if (/질문|궁금|잠깐|잠시|모르|헷갈/.test(text)) return 'question';
  return 'start';
}

const FALLBACK_ACK: Record<string, string> = {
  recentSong: '좋은 취향이시네요!',
  favoriteSong: '멋진 곡이에요!',
  story: '담고 싶은 이야기 잘 들었습니다.',
  songTitle: '좋은 제목이네요!',
};

export function getFallbackAck(step: keyof typeof ONBOARDING_QUESTIONS) {
  return FALLBACK_ACK[step] ?? '감사합니다!';
}

export function getFallbackOnboardingReply(step: keyof typeof ONBOARDING_QUESTIONS, nextQuestion: string) {
  return `${FALLBACK_ACK[step] ?? '감사합니다!'} ${nextQuestion}`;
}
