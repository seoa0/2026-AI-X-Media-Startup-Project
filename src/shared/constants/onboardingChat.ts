export type ChatStep =
  | 'greeting'
  | 'genre'
  | 'favoriteSong'
  | 'story1'
  | 'storyMore'
  | 'storyConfirm'
  | 'finalGenre'
  | 'giftTarget'
  | 'voiceOwner'
  | 'voiceRecord'
  | 'summary'
  | 'farewell'
  | 'done';

export type VoiceRecordSubStep = 'method' | 'read';

export interface ChatChoice {
  label: string;
  value: string;
}

export const ASSISTANT_NAME = '또비';

/** llmService 호환용 */
export const ONBOARDING_QUESTIONS = {
  recentSong: '평소 어떤 장르의 노래를 즐겨 들으시나요?',
  favoriteSong: '가장 좋아하는 곡이 무엇인가요?',
  story: '노래의 가사가 될 이야기를 말씀해주시겠어요?',
  songTitle: '이 노래의 제목은 무엇으로 할까요?',
} as const;

export const VOICE_CONFIRM_CHOICES: ChatChoice[] = [
  { label: '이 답변이 맞아요.', value: '__confirm__' },
  { label: '잘못 입력됐어요.', value: '__retry__' },
];


export const GENRE_EXAMPLES: ChatChoice[] = [
  { label: '발라드', value: '발라드' },
  { label: '록', value: '록' },
  { label: '힙합', value: '힙합' },
  { label: 'K-POP', value: 'K-POP' },
  { label: '포크', value: '포크' },
];

export const FAVORITE_SONG_EXAMPLES: ChatChoice[] = [
  { label: '이정현 - 와!', value: '이정현 - 와!' },
  { label: '해바라기 - 행복을 주는 사람', value: '해바라기 - 행복을 주는 사람' },
  { label: '아이유 - 밤편지', value: '아이유 - 밤편지' },
];

export const STORY_EXAMPLES: ChatChoice[] = [
  { label: '나와 사랑 이야기', value: '나의 사랑 이야기' },
  { label: '친구와의 우정 이야기', value: '친구와의 우정 이야기' },
  { label: '부모님께 전하는 마음', value: '부모님께 전하는 마음' },
];

export const STORY_MORE_CHOICES: ChatChoice[] = [
  { label: '충분합니다.', value: 'enough' },
  { label: '더 얘기하고 싶어요.', value: 'more' },
  { label: '글로 적고 싶어요.', value: 'text' },
  { label: '사진으로 보낼게요.', value: 'photo' },
];

export const GIFT_TARGET_CHOICES: ChatChoice[] = [
  { label: '자기 자신', value: '자기 자신' },
  { label: '가족', value: '가족' },
  { label: '부모님', value: '부모님' },
  { label: '친구', value: '친구' },
  { label: '기타 : 직접 입력', value: '__custom__' },
];

export const VOICE_OWNER_CHOICES: ChatChoice[] = [
  { label: '지금까지 얘기한 나 자신', value: 'self' },
  { label: '다른 사람의 목소리', value: 'other' },
];

export const VOICE_RECORD_METHOD_CHOICES: ChatChoice[] = [
  { label: '파일 첨부', value: 'file' },
  { label: '지금 녹음', value: 'record' },
];

export const SUMMARY_CHOICES: ChatChoice[] = [
  { label: '좋아요', value: 'confirm' },
  { label: '바꾸고 싶어요', value: 'change' },
];

export const GENRE_FALLBACK = ['포크', '발라드', '록', 'K-POP', '힙합', 'R&B', '인디', '어쿠스틱'];

const CONFIDENT_GENRES = ['발라드', 'K-POP', '포크', '록', 'R&B'];

const STORY_GENRE_MAP: Record<string, string[]> = {
  사랑: ['발라드', 'R&B', 'K-POP'],
  이별: ['발라드', 'R&B'],
  우정: ['K-POP', 'POP', '포크'],
  가족: ['발라드', '포크', '어쿠스틱'],
  부모: ['발라드', '포크', '트로트'],
};

export function getSubtitleForStep(step: ChatStep): string {
  if (step === 'greeting') return '프롤로그';
  if (step === 'genre' || step === 'favoriteSong') return '장르 수집';
  if (step === 'story1' || step === 'storyMore' || step === 'storyConfirm') return '사연 듣기';
  if (step === 'finalGenre' || step === 'giftTarget' || step === 'voiceOwner' || step === 'voiceRecord') {
    return '최종 선택';
  }
  return '마무리';
}

export function getTtobiGreetingMessage() {
  return `안녕하세요!
저는 당신의 여정을 함께할
노래하는 파랑새, "또비"예요!
만나서 기뻐요!`;
}

export function getGreetingMicGuide() {
  return `마이크를 눌러
'또비 안녕' 이라고 말씀해주세요`;
}

export function getGenreQuestionMessage() {
  return `평소 어떤 장르의 노래를 즐겨 들으시나요?`;
}

export function getGenreMicGuide() {
  return `마이크를 눌러
장르 한 단어를 말씀해주세요`;
}

export function buildFavoriteSongMessage(genre: string) {
  return `'${genre}'를 즐겨 들으시네요.

그럼 가장 좋아하는 곡이 무엇인가요?
가수와 곡명을 차례대로 말씀해주세요.`;
}

export function getFavoriteSongMicGuide() {
  return `마이크를 눌러
가수와 곡명을 말씀해주세요`;
}

export function buildStory1Message(favoriteSong: string) {
  return `'${favoriteSong}'을 즐겨 들으시네요.

또비가 당신의 취향을 배웠어요!

이제,
노래의 가사가 될 이야기를 말씀해주시겠어요?
간단한 일화, 좋아하는 문장, 기억에 남는 일, 꿈 등
어떤 것이든 좋아요.

당신의 이야기를 들려주세요.`;
}

export function getStory1MicGuide() {
  return `마이크를 켜고 편하게 얘기해주세요.
간단해도 좋아요.`;
}

export function buildStoryMoreMessage(storySnippet: string) {
  const snippet = storySnippet.length > 40 ? `${storySnippet.slice(0, 40)}…` : storySnippet;
  return `'${snippet}'를 담고 싶으시군요. 말씀해주신 이야기를 바탕으로 가사가 만들어져요!

넣고 싶은 이야기 소재를 더 많이 말씀해주실수록 좋은 가사가 나와요.

또비는 당신에게 가장 아름다운 선물을 주고 싶어요.`;
}

export function getStoryConfirmMessage() {
  return `지금 말씀해주신 이야기들로만 노래가 만들어져.`;
}

export function buildFinalGenreThinkingMessage(userName: string) {
  return `또비가 생각하는 중 . . .

${userName}님의 이야기를 또비가 잘 들었어요! 고맙습니다!

당신만을 위한 노래가 만들어진다면 어떤 장르가 좋을까요?

마지막으로 선택해주세요`;
}

export function getCustomGenreChoice(): ChatChoice {
  return { label: '마음에 드는 장르가 없나요?', value: '__custom_genre__' };
}

export function buildGiftTargetMessage() {
  return `이 노래를 누구한테 선물하고 싶나요?`;
}

export function buildVoiceOwnerMessage() {
  return `이 노래의 목소리는 누구였으면 좋겠나요?`;
}

export function buildVoiceRecordMessage() {
  return `노래의 주인공이 될 목소리를 짧게 들려주세요.`;
}

export function buildReadSentenceMessage(sentence: string) {
  return `제시된 문장을 직접 읽어주세요.

"${sentence}"`;
}

export function buildSummaryMessage(input: {
  userName: string;
  genre: string;
  story: string;
  voiceLabel: string;
  giftTarget: string;
}) {
  const storySnippet = input.story.length > 50 ? `${input.story.slice(0, 50)}…` : input.story;
  return `또비가 모든 이야기를 잘 들었어요!

${input.userName}님의 노래는,
${input.genre} 장르로,
${storySnippet} 한 이야기를 담아
${input.voiceLabel}의 목소리로
${input.giftTarget}께 선물드릴 거예요`;
}

export function getFarewellMessages() {
  return [
    '또비가 목소리를 가다듬는 중 . . .',
    '또비가 노래를 만드는 데에는 최대 일주일이 걸려요.',
    `준비가 되면 알람을 짹! 울려드려요.

다시 만났을 때, 당신에게
세상 단 하나뿐인 노래를 선물해 드릴게요.`,
  ];
}

export function inferGenreFromText(text: string): string | null {
  const normalized = text.toLowerCase();
  for (const genre of GENRE_FALLBACK) {
    if (normalized.includes(genre.toLowerCase())) return genre;
  }
  if (/kpop|케이팝/.test(normalized)) return 'K-POP';
  if (/r&b|rnb/.test(normalized)) return 'R&B';
  if (/힙합|랩/.test(normalized)) return '힙합';
  if (/발라드/.test(normalized)) return '발라드';
  if (/록|락|rock/.test(normalized)) return '록';
  if (/포크|folk/.test(normalized)) return '포크';
  return null;
}

export function buildFinalGenreOptions(input: {
  listenGenre: string;
  favoriteSong: string;
  story: string;
}): string[] {
  const options = new Set<string>();

  if (input.listenGenre) options.add(input.listenGenre);

  const fromFavorite = inferGenreFromText(input.favoriteSong);
  if (fromFavorite) options.add(fromFavorite);

  const recommended = recommendGenres({
    story: input.story,
    recentSong: input.listenGenre,
    favoriteSong: input.favoriteSong,
  });
  recommended.forEach((g) => options.add(g));

  while (options.size < 3) {
    const random = CONFIDENT_GENRES[Math.floor(Math.random() * CONFIDENT_GENRES.length)];
    options.add(random);
  }

  return [...options].slice(0, 3);
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

  const text = [input.favoriteSong, input.recentSong, input.story].join(' ').toLowerCase();

  for (const [keyword, genres] of Object.entries(STORY_GENRE_MAP)) {
    if (text.includes(keyword)) {
      genres.forEach((genre, index) => addScore(genre, 4 - index));
    }
  }

  if (text.includes('아이유') || text.includes('성시경') || text.includes('발라드') || text.includes('해바라기')) {
    addScore('발라드', 3);
  }
  if (text.includes('뉴진스') || text.includes('bts') || text.includes('방탄')) {
    addScore('K-POP', 3);
  }
  if (text.includes('이정현')) {
    addScore('K-POP', 2);
    addScore('록', 2);
  }
  if (text.includes('힙합') || text.includes('랩')) {
    addScore('힙합', 3);
  }
  if (text.includes('포크')) {
    addScore('포크', 3);
  }

  const listenGenre = input.recentSong ? inferGenreFromText(input.recentSong) : null;
  if (listenGenre) addScore(listenGenre, 4);

  if (scores.size === 0) {
    return ['K-POP', '발라드', '포크'];
  }

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([genre]) => genre);
}

export function pickReadSentence(story: string): string {
  const trimmed = story.trim();
  if (!trimmed) return '오늘도 당신 곁에 있어요';

  const sentences = trimmed.split(/[.!?。\n]/).map((s) => s.trim()).filter(Boolean);
  if (sentences.length > 0) {
    const pick = sentences[0];
    return pick.length > 60 ? `${pick.slice(0, 60)}…` : pick;
  }
  return trimmed.length > 60 ? `${trimmed.slice(0, 60)}…` : trimmed;
}

export function getVoiceLabel(voiceOwner: 'self' | 'other'): string {
  return voiceOwner === 'self' ? '지금까지 얘기한 나 자신' : '다른 사람';
}

export function getChoicesForStep(
  step: ChatStep,
  options: {
    finalGenres?: string[];
    voiceRecordSubStep?: VoiceRecordSubStep;
    customGenreMode?: boolean;
  } = {},
): ChatChoice[] {
  switch (step) {
    case 'greeting':
    case 'genre':
    case 'favoriteSong':
    case 'story1':
      return [];
    case 'storyMore':
    case 'storyConfirm':
      return STORY_MORE_CHOICES;
    case 'finalGenre':
      if (options.customGenreMode) return [];
      return [
        ...(options.finalGenres ?? []).map((g) => ({ label: g, value: g })),
        getCustomGenreChoice(),
      ];
    case 'giftTarget':
      return GIFT_TARGET_CHOICES;
    case 'voiceOwner':
      return VOICE_OWNER_CHOICES;
    case 'voiceRecord':
      return options.voiceRecordSubStep === 'read' ? [] : VOICE_RECORD_METHOD_CHOICES;
    case 'summary':
      return SUMMARY_CHOICES;
    default:
      return [];
  }
}

export function getExampleHintForStep(
  step: ChatStep,
  options: { customGenreMode?: boolean } = {},
): string | null {
  switch (step) {
    case 'greeting':
      return `예) ${GREETING_CHOICES.map((c) => c.label).join(' · ')}`;
    case 'genre':
      return `예) ${GENRE_EXAMPLES.map((c) => c.label).join(' · ')}`;
    case 'favoriteSong':
      return `예) ${FAVORITE_SONG_EXAMPLES.map((c) => c.label).join(' · ')}`;
    case 'story1':
      return `예) ${STORY_EXAMPLES.map((c) => c.label).join(' · ')}`;
    case 'finalGenre':
      if (options.customGenreMode) {
        return `예) ${GENRE_EXAMPLES.map((c) => c.label).join(' · ')}`;
      }
      return null;
    default:
      return null;
  }
}

const PREVIOUS_STEP: Partial<Record<ChatStep, ChatStep>> = {
  genre: 'greeting',
  favoriteSong: 'genre',
  story1: 'favoriteSong',
  storyMore: 'story1',
  storyConfirm: 'storyMore',
  finalGenre: 'storyConfirm',
  giftTarget: 'finalGenre',
  voiceOwner: 'giftTarget',
  voiceRecord: 'voiceOwner',
  summary: 'voiceOwner',
};

export function getPreviousStep(step: ChatStep, voiceOwner?: 'self' | 'other'): ChatStep | null {
  if (step === 'summary' && voiceOwner === 'other') return 'voiceRecord';
  return PREVIOUS_STEP[step] ?? null;
}

export function stepUsesMic(
  step: ChatStep,
  opts: { voiceRecordSubStep?: VoiceRecordSubStep; storyMoreMode?: 'more' | null } = {},
): boolean {
  if (['greeting', 'genre', 'favoriteSong', 'story1'].includes(step)) return true;
  if (step === 'storyMore' && opts.storyMoreMode === 'more') return true;
  if (step === 'voiceRecord' && opts.voiceRecordSubStep === 'read') return true;
  if (step === 'finalGenre' && opts.storyMoreMode === 'more') return true;
  return false;
}

export function getMicGuideForStep(
  step: ChatStep,
  opts: { voiceRecordSubStep?: VoiceRecordSubStep } = {},
): string | null {
  switch (step) {
    case 'greeting':
      return getGreetingMicGuide();
    case 'genre':
      return getGenreMicGuide();
    case 'favoriteSong':
      return getFavoriteSongMicGuide();
    case 'story1':
      return getStory1MicGuide();
    case 'voiceRecord':
      return opts.voiceRecordSubStep === 'read' ? '마이크를 눌러 문장을 읽어주세요' : null;
    default:
      return null;
  }
}

/** @deprecated use getTtobiGreetingMessage */
export function getTobiGreetingMessage() {
  return getTtobiGreetingMessage();
}

const FALLBACK_ACK: Record<keyof typeof ONBOARDING_QUESTIONS, string> = {
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
