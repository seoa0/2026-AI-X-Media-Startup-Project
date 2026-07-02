import type { ChatChoice } from '../types/chat';
import { STORY_EXAMPLES } from './onboardingChat';

export const SAMPLE_FINAL_LYRICS = `[Verse 1]
고장 난 문 고쳐주던 그때 그날에
조그만 게 야무지다 웃던 그때 그사람
티격태격 쏘아대니 정이 들어서
참 별나게 만나고 보니 찰떡이었네

[Chorus]
지지고 볶으며 우리 참 행복했었어
원 없이 사랑하고 툭 털고 떠났었네
이 세상 다시 없을 그대 당신 덕분에
나도 남은 삶을 정말 잘 살다 갈거야

[Verse 2]
라디오서 흘러나온 그 시절 유행가에
삐삐 치며 노래 좋지 마음이 딱 통했지
나도 방금 듣고 있다 너털웃음 짓던 날
어쩜 이리 똑같을까 천생연분이었네

[Chorus]
지지고 볶으며 우리 참 행복했었어
원 없이 사랑하고 툭 털고 떠났었네
이 세상 다시 없을 그대 당신 덕분에
나도 남은 삶을 씩씩하게 살다 갈거야

[Verse 3]
애들 크고 둘이 떠난 바닷가
뜨끈한 국밥 한 그릇 비우고
바람 참 시원하다며 함께 웃던 날
내 인생 구석구석 찐하게 남았네

[Chorus]
원 없이 사랑해 우리 참 행복할거야
함께한 우리 인생 눈부시게 빛났네
멋지게 미련없이 정말 잘 살다 갔어
우리 남은 삶을 씩씩하게 살아가보자`;

export type LyricsFlowPhase = 'preview' | 'revision' | 'melody' | 'video_upgrade';

export interface FlowChatStep {
  id: string;
  question: string;
  micGuide: string;
  exampleHint: string;
  ack: (answer: string) => string;
  choices?: ChatChoice[];
}

export const LYRICS_REVISION_STEPS: FlowChatStep[] = [
  {
    id: 'mood',
    question: '가사 분위기는 어떻게 바꾸고 싶으세요?',
    micGuide: '마이크를 눌러\n원하시는 분위기를 말씀해 주세요.',
    exampleHint: '예) 더 따뜻하게 · 더 쓸쓸하게 · 더 희망차게',
    ack: (a) => `«${truncate(a)}» 분위기로 수정 방향 잡을게요!`,
  },
  {
    id: 'tone',
    question: '가사 어투는 어떤 느낌이 좋을까요?',
    micGuide: '마이크를 눌러\n어투를 말씀해 주세요.',
    exampleHint: '예) 구어체 · 시적 표현 · 담백하고 담담하게',
    ack: (a) => `«${truncate(a)}» 어투로 맞춰 볼게요!`,
  },
  {
    id: 'density',
    question: '가사 밀도는 어떻게 할까요?\n(한 구절에 담기는 이야기 양)',
    micGuide: '마이크를 눌러\n원하시는 밀도를 말씀해 주세요.',
    exampleHint: '예) 더 여유롭게 · 지금보다 빽빽하게 · 후렴은 간결하게',
    ack: (a) => `가사 밀도는 «${truncate(a)}» 쪽으로 조정할게요!`,
  },
  {
    id: 'addStory',
    question: '가사에 더 넣으면 좋을 이야기가 있나요?',
    micGuide: '마이크를 눌러\n추가하고 싶은 내용을 말씀해 주세요.',
    exampleHint: `예) ${STORY_EXAMPLES.map((c) => c.label).join(' · ')}`,
    choices: STORY_EXAMPLES,
    ack: (a) => `«${truncate(a)}» 이야기를 더 담아 볼게요!`,
  },
  {
    id: 'removePart',
    question: '빼면 좋을 부분이 있다면 말씀해 주세요.',
    micGuide: '마이크를 눌러\n줄이고 싶은 부분을 말씀해 주세요.',
    exampleHint: '예) 반복되는 후렴 줄이기 · 특정 에피소드 빼기 · 없어요',
    ack: (a) => `«${truncate(a)}» 반영해서 다듬어 볼게요!`,
  },
];

export const LYRICS_REVISION_DONE_MESSAGE =
  '말씀해 주신 방향을 모두 반영해서\n가사를 다시 만들었어요!\n확인해 보시고 마음에 드시면 확정해 주세요.';

export const MELODY_FLOW_STEPS: FlowChatStep[] = [
  {
    id: 'tempo',
    question: '멜로디 템포는 어떤 느낌이 좋을까요?',
    micGuide: '마이크를 눌러\n템포를 말씀해 주세요.',
    exampleHint: '예) 느린 발라드 · 중간 템포 · 조금 경쾌하게',
    ack: (a) => `템포는 «${truncate(a)}» 느낌으로 맞출게요!`,
  },
  {
    id: 'mood',
    question: '전체적인 멜로디 분위기는 어떻게 할까요?',
    micGuide: '마이크를 눌러\n분위기를 말씀해 주세요.',
    exampleHint: '예) 따뜻하고 포근 · 쓸쓸하고 감성적 · 희망차고 밝게',
    ack: (a) => `«${truncate(a)}» 분위기의 멜로디로 만들게요!`,
  },
  {
    id: 'sound',
    question: '악기나 사운드는 어떤 방향이 좋을까요?',
    micGuide: '마이크를 눌러\n원하시는 사운드를 말씀해 주세요.',
    exampleHint: '예) 어쿠스틱 기타 · 피아노 위주 · 오케스트라 느낌',
    ack: (a) => `«${truncate(a)}» 사운드로 구성해 볼게요!`,
  },
  {
    id: 'vocal',
    question: '보컬 톤이나 노래 스타일은 어떻게 할까요?',
    micGuide: '마이크를 눌러\n보컬 스타일을 말씀해 주세요.',
    exampleHint: '예) 부드러운 남성 보컬 · 파워풀한 여성 보컬 · 담담한 민요 톤',
    ack: (a) => `보컬은 «${truncate(a)}» 스타일로 맞출게요!`,
  },
];

export const MELODY_FLOW_DONE_MESSAGE =
  '멜로디 방향 잘 정리했어요!\n이제 영상 옵션을 선택해 주세요.';

export const VIDEO_UPGRADE_INTRO =
  '무료 버전은 리릭 비디오가 제공돼요.\n고퀄리티 영상으로 업그레이드할 수도 있어요!';

export const VIDEO_UPGRADE_CHOICES: ChatChoice[] = [
  { label: '리릭 비디오 (무료)', value: 'lyric' },
  { label: '고퀄 영상 업그레이드', value: 'premium' },
];

export const VIDEO_UPGRADE_LYRIC_REPLY =
  '리릭 비디오로 제작을 시작할게요!\n곧 멋진 결과물을 만나보실 수 있어요.';

export const VIDEO_UPGRADE_PREMIUM_REPLY =
  '고퀄 영상 업그레이드를 선택하셨어요!\n결제 연동 전이라 우선 예약만 해두었어요.\n고퀄 영상으로 제작을 시작할게요!';

export const VIDEO_UPGRADE_PAYWALL_MESSAGE =
  '고퀄 영상 업그레이드는 결제가 필요합니다.\n(현재는 데모로 예약만 진행돼요)';

function truncate(text: string, max = 16) {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

export function getSampleLyrics() {
  return SAMPLE_FINAL_LYRICS;
}
