export function getFirebaseErrorMessage(error: unknown, fallback = '요청에 실패했습니다.'): string {
  const code = (error as { code?: string })?.code ?? '';

  const messages: Record<string, string> = {
    'auth/invalid-email': '올바른 이메일 형식이 아닙니다.',
    'auth/user-disabled': '비활성화된 계정입니다.',
    'auth/user-not-found': '이메일 또는 비밀번호가 올바르지 않습니다.',
    'auth/wrong-password': '이메일 또는 비밀번호가 올바르지 않습니다.',
    'auth/invalid-credential': '이메일 또는 비밀번호가 올바르지 않습니다.',
    'auth/email-already-in-use': '이미 가입된 이메일입니다.',
    'auth/weak-password': '비밀번호는 6자 이상이어야 합니다.',
    'auth/too-many-requests': '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
    'auth/network-request-failed': '네트워크 연결을 확인해주세요.',
    'auth/operation-not-allowed': '이메일 로그인이 비활성화되어 있습니다. Firebase 콘솔에서 활성화해주세요.',
    'firestore/timeout':
      'Firestore가 연결되지 않습니다. Firebase Console에서 Firestore Database를 생성해주세요.',
    'firestore/not-found':
      'Firestore Database가 없습니다. Firebase Console → Firestore Database → 데이터베이스 만들기를 실행해주세요.',
    'permission-denied': 'Firestore 접근 권한이 없습니다. 보안 규칙을 확인해주세요.',
    'unavailable': '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.',
  };

  return messages[code] ?? fallback;
}
