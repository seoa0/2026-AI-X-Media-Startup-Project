import type { ChatChoice } from '../types/chat';

export const STORY_SOURCE_QUESTION =
  '프롤로그에서 나눈 이야기를\n이 곡에도 사용할까요?\n아니면 새로운 이야기로 시작할까요?';

export const STORY_SOURCE_CHOICES: ChatChoice[] = [
  { label: '프롤로그 사용', value: 'prologue' },
  { label: '새로운 이야기', value: 'new' },
];

export const STORY_SOURCE_PROLOGUE_REPLY =
  '프롤로그에서 나눈 이야기를 바탕으로 곡을 만들어 볼게요!';

export const STORY_SOURCE_NEW_REPLY =
  '좋아요! 새로운 이야기로 곡을 만들어 볼게요. 어떤 느낌의 곡을 원하시나요?';

export const LYRICS_MAKING_MESSAGE = '여러분들의 이야기를 담은\n가사를 제작합니다';

export const LYRICS_CONFIRM_MESSAGE =
  '가사가 완성됐어요!\n마음에 드시면 확정해 주세요.\n다시 만들기는 1회까지 무료예요.';

export const LYRICS_REGEN_PAYWALL_MESSAGE =
  '무료 재제작 횟수를 모두 사용했어요.\n추가 재제작은 결제가 필요합니다.';

export const PRODUCTION_WAITING_MESSAGE =
  '가사가 확정됐어요!\n이제 멜로디와 보컬을 합성하고 있어요.\n잠시 후 완성된 영상과 노래를 받아보실 수 있어요.';

export const PRODUCTION_COMPLETE_MESSAGE = '축하합니다. 당신의 노래가 제작되었어요!';
