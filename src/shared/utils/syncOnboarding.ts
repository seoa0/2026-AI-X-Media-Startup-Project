import { authApi } from '../apis/auth';
import { getOnboardingData, type OnboardingData } from './onboardingStorage';
import { isLoggedIn } from './authStorage';

const STORAGE_KEY = 'naneun-gasuda-onboarding';
const DEFAULT: OnboardingData = { complete: false, introChatComplete: false };

export async function syncOnboardingToServer() {
  if (!isLoggedIn()) return;
  try {
    const { selectedGenre: _selected, preferredGenre: _preferred, ...onboarding } = getOnboardingData();
    await authApi.syncOnboarding(onboarding as unknown as Record<string, unknown>);
  } catch {
    // 네트워크 오류 시 로컬 상태만 유지
  }
}

export function applyServerOnboarding(onboarding: Record<string, unknown> | null) {
  if (!onboarding) return;
  const { selectedGenre: _selected, preferredGenre: _preferred, ...rest } = onboarding;
  const current = getOnboardingData();
  const { selectedGenre: _cSelected, preferredGenre: _cPreferred, ...currentWithoutGenre } = current;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...DEFAULT, ...currentWithoutGenre, ...rest }));
}
