export const CREATE_MOOD_EXAMPLES = [
  '잔잔한 발라드',
  '신나는 팝',
  '감성적인 R&B',
];

export const CREATE_FEELING_EXAMPLES = [
  '따뜻한 느낌',
  '그리운 분위기',
  '희망찬 메시지',
];

export const CREATE_DETAIL_EXAMPLES = [
  '피아노 위주',
  '어쿠스틱한 느낌',
  '감성적인 보컬',
];

export function getCreateStartMessage(packageTitle: string) {
  return `${packageTitle}로 시작할게요!

좋아요! 이제 본격적으로 곡을 만들어 볼게요.
어떤 느낌의 곡을 원하시나요?`;
}

export function getCreateMicGuide() {
  return `마이크를 눌러
자유롭게 말씀해 주세요.`;
}

export function getCreateExampleHint(userTurnCount: number): string | null {
  if (userTurnCount === 0) {
    return `예) ${CREATE_MOOD_EXAMPLES.join(' · ')}`;
  }
  if (userTurnCount === 1) {
    return `예) ${CREATE_FEELING_EXAMPLES.join(' · ')}`;
  }
  if (userTurnCount === 2) {
    return `예) ${CREATE_DETAIL_EXAMPLES.join(' · ')}`;
  }
  return null;
}
