export const EMAIL_DOMAINS = [
  '직접 입력',
  'naver.com',
  'gmail.com',
  'daum.net',
  'hanmail.net',
  'nate.com',
] as const;

export type EmailDomain = (typeof EMAIL_DOMAINS)[number];

export const DEFAULT_EMAIL_DOMAIN: EmailDomain = 'gmail.com';
