import type { VoiceOwner } from '../constants/onboardingChat';

const STORAGE_KEY = 'naneun-gasuda-onboarding';

export interface OnboardingData {
  complete: boolean;
  introChatComplete: boolean;
  recentSong?: string;
  listenGenre?: string;
  favoriteSong?: string;
  story?: string;
  songTitle?: string;
  preferredGenre?: string;
  selectedGenre?: string;
  giftTarget?: string;
  voiceOwner?: VoiceOwner;
  selectedPackageId?: string;
}

const DEFAULT: OnboardingData = { complete: false, introChatComplete: false };

export function getOnboardingData(): OnboardingData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT };
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT };
  }
}

export function saveOnboardingData(partial: Partial<OnboardingData>) {
  const current = getOnboardingData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...partial }));
}

/** 예전 세션 장르가 새 제작에 섞이지 않도록 제거 */
export function clearOnboardingGenre() {
  const current = getOnboardingData();
  const { selectedGenre: _selected, preferredGenre: _preferred, ...rest } = current;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
}

export function isOnboardingComplete() {
  return getOnboardingData().complete;
}

export function isIntroChatComplete() {
  return getOnboardingData().introChatComplete;
}

export function completeIntroChat() {
  saveOnboardingData({ introChatComplete: true });
}

export function completeOnboarding() {
  saveOnboardingData({ complete: true, introChatComplete: true });
}

export function resetOnboarding() {
  localStorage.removeItem(STORAGE_KEY);
}

/** 온보딩 대화 전체를 처음부터 다시 시작 */
export function restartOnboardingChat() {
  resetOnboarding();
}

export function getPostLoginPath() {
  const data = getOnboardingData();
  if (data.complete) return '/home';
  if (data.introChatComplete) return '/packages';
  return '/onboarding/chat';
}

export function getHomeGuardRedirect() {
  const data = getOnboardingData();
  if (data.complete) return null;
  if (data.introChatComplete) return '/packages';
  return '/onboarding/chat';
}
