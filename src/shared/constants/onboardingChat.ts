export type ChatStep =
  | 'intro'
  | 'recentSong'
  | 'favoriteArtist'
  | 'favoriteSong'
  | 'mood'
  | 'story'
  | 'genre'
  | 'recommend'
  | 'done';

export interface ChatChoice {
  label: string;
  value: string;
}

/* ===========================
   선택지
=========================== */

export const MOOD_CHOICES: ChatChoice[] = [
  { label: '밝고 신나는', value: '신남' },
  { label: '감성적인', value: '감성' },
  { label: '설레는', value: '설렘' },
  { label: '슬픈', value: '슬픔' },
  { label: '희망찬', value: '희망' },
  { label: '잔잔한', value: '잔잔함' },
  { label: '몽환적인', value: '몽환' },
  { label: '강렬한', value: '강렬함' },
];

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
  { label: '직접 입력하기', value: 'custom' },
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

/* ===========================
   추천 데이터
=========================== */

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

const MOOD_GENRE_MAP: Record<string, string[]> = {
  신남: ['EDM', 'K-POP', '힙합'],
  감성: ['발라드', 'R&B'],
  설렘: ['K-POP', '발라드'],
  슬픔: ['발라드', 'R&B'],
  희망: ['POP', '록'],
  잔잔함: ['어쿠스틱', '인디'],
  몽환: ['시티팝', 'R&B'],
  강렬함: ['록', '힙합'],
};

/* ===========================
   장르 추천
=========================== */

export function recommendGenres(input: {
  story?: string;
  mood?: string;
  preferredGenre?: string;
  recentSong?: string;
  favoriteSong?: string;
  favoriteArtist?: string;
}): string[] {
  const scores = new Map<string, number>();

  const addScore = (genre: string, score: number) => {
    scores.set(genre, (scores.get(genre) ?? 0) + score);
  };

  // 이야기 기반
  if (input.story && STORY_GENRE_MAP[input.story]) {
    STORY_GENRE_MAP[input.story].forEach((genre, index) => {
      addScore(genre, 4 - index);
    });
  }

  // 분위기 기반
  if (input.mood && MOOD_GENRE_MAP[input.mood]) {
    MOOD_GENRE_MAP[input.mood].forEach((genre, index) => {
      addScore(genre, 3 - index);
    });
  }

  // 사용자가 직접 선택한 장르
  if (input.preferredGenre) {
    addScore(input.preferredGenre, 5);
  }

  // 입력 텍스트 분석
  const text = [
    input.favoriteArtist,
    input.favoriteSong,
    input.recentSong,
  ]
    .join(' ')
    .toLowerCase();

  // 발라드
  if (
    text.includes('아이유') ||
    text.includes('성시경') ||
    text.includes('ballad') ||
    text.includes('발라드')
  ) {
    addScore('발라드', 3);
  }

  // K-POP
  if (
    text.includes('뉴진스') ||
    text.includes('newjeans') ||
    text.includes('에스파') ||
    text.includes('aespa') ||
    text.includes('아이브') ||
    text.includes('ive') ||
    text.includes('세븐틴') ||
    text.includes('방탄') ||
    text.includes('bts')
  ) {
    addScore('K-POP', 3);
  }

  // 힙합
  if (
    text.includes('창모') ||
    text.includes('지코') ||
    text.includes('빈지노') ||
    text.includes('eminem') ||
    text.includes('hip')
  ) {
    addScore('힙합', 3);
  }

  // R&B
  if (
    text.includes('crush') ||
    text.includes('dean') ||
    text.includes('딘')
  ) {
    addScore('R&B', 3);
  }

  // 록
  if (
    text.includes('coldplay') ||
    text.includes('oasis') ||
    text.includes('day6') ||
    text.includes('데이식스')
  ) {
    addScore('록', 3);
  }

  // EDM
  if (
    text.includes('alan walker') ||
    text.includes('martin garrix') ||
    text.includes('edm')
  ) {
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

/* ===========================
   챗봇 메시지
=========================== */

export function getBotMessage(
  step: ChatStep,
  context?: { genres?: string[] }
): string {
  switch (step) {
    case 'intro':
      return `안녕하세요.
저는 '나도 가수다' AI 뮤직 메이트입니다.

몇 가지 질문을 통해 고객님만의 음악을 추천해 드리겠습니다.`;

    case 'recentSong':
      return `먼저 가볍게 시작해 보겠습니다.

요즘 자주 듣고 계신 노래가 있으신가요?`;

    case 'favoriteArtist':
      return `좋습니다.

평소 가장 좋아하시는 가수나 아티스트를 알려주세요.`;

    case 'favoriteSong':
      return `감사합니다.

가장 좋아하시는 노래 한 곡도 알려주실 수 있을까요?`;

    case 'mood':
      return `이번에는 분위기를 선택해 주세요.

어떤 느낌의 음악을 만들고 싶으신가요?`;

    case 'story':
      return `이번 노래에는 어떤 이야기를 담고 싶으신가요?

아래에서 선택하시거나 직접 입력하셔도 됩니다.`;

    case 'genre':
      return `선호하시는 장르가 있으신가요?

가장 마음에 드는 장르를 선택해 주세요.`;

    case 'recommend':
      return `답변을 종합해 보니

${context?.genres?.join(', ')}

장르가 가장 잘 어울릴 것으로 보입니다.

원하시는 장르를 선택해 주세요.`;

    case 'done':
      return `모든 준비가 완료되었습니다.

이제 고객님께 맞는 패키지를 선택하시면
나만의 음악 제작을 바로 시작하실 수 있습니다.`;

    default:
      return '';
  }
}