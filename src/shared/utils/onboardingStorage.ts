const STORAGE_KEY = 'naneun-gasuda-onboarding';

export interface OnboardingData {
  complete: boolean;
  introChatComplete: boolean;
  recentSong?: string;
  favoriteSong?: string;
  story?: string;
  preferredGenre?: string;
  selectedGenre?: string;
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
