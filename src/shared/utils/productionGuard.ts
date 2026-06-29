import { songsApi } from '../apis/songs/songsApi';
import { isLoggedIn } from './authStorage';
import { isOnboardingComplete, restartOnboardingChat } from './onboardingStorage';

/** 온보딩을 마친 사용자인데 제작 중인 곡이 없으면 온보딩부터 다시 시작 */
export async function getRedirectIfNoActiveProduction(): Promise<string | null> {
  if (!isLoggedIn() || !isOnboardingComplete()) return null;

  try {
    const { data } = await songsApi.list('in_progress');
    if (data.songs.length === 0) {
      restartOnboardingChat();
      return '/onboarding/chat';
    }
  } catch {
    // API 오류 시 기존 화면 유지
  }

  return null;
}
