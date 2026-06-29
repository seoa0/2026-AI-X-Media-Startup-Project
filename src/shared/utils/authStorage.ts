import { isFirebaseLoggedIn } from '../firebase/authService';

/** Firebase Auth 세션 기준. @see initAuthListener */
export function isLoggedIn() {
  return isFirebaseLoggedIn();
}

/** Firebase가 세션을 관리하므로 no-op (기존 호출 호환) */
export function setAccessToken(_token: string) {}

export function clearAccessToken() {
  // signOut은 authApi.logout()에서 처리
}

export function getAccessToken() {
  return isLoggedIn() ? 'firebase-session' : null;
}
