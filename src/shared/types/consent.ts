export type ConsentKey = 'terms' | 'privacy' | 'aiVoice' | 'copyright' | 'marketing';

export interface SignupConsents {
  terms: boolean;
  privacy: boolean;
  aiVoice: boolean;
  copyright: boolean;
  marketing: boolean;
}

export interface StoredSignupConsents extends SignupConsents {
  agreedAt: string;
}

export const EMPTY_SIGNUP_CONSENTS: SignupConsents = {
  terms: false,
  privacy: false,
  aiVoice: false,
  copyright: false,
  marketing: false,
};

export function areRequiredConsentsChecked(consents: SignupConsents) {
  return consents.terms && consents.privacy && consents.aiVoice && consents.copyright;
}
