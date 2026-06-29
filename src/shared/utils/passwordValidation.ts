/** 8~16자, 영어 소문자·숫자·특수문자 포함 */
export function validatePassword(password: string): string | null {
  if (password.length < 8 || password.length > 16) {
    return '비밀번호는 8~16자여야 합니다.';
  }
  if (!/[a-z]/.test(password)) {
    return '비밀번호에 영어 소문자를 포함해주세요.';
  }
  if (!/[0-9]/.test(password)) {
    return '비밀번호에 숫자를 포함해주세요.';
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password)) {
    return '비밀번호에 특수문자를 포함해주세요.';
  }
  return null;
}
