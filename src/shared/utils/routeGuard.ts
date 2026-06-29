import { isLoggedIn } from './authStorage';
import { getHomeGuardRedirect as getOnboardingGuard } from './onboardingStorage';

/** 로그인한 사용자만 온보딩 완료 여부 검사. 비회원은 null */
export function getHomeGuardRedirect() {
  if (!isLoggedIn()) return null;
  return getOnboardingGuard();
}

export function getAuthGuardRedirect() {
  if (!isLoggedIn()) return '/login';
  return null;
}
