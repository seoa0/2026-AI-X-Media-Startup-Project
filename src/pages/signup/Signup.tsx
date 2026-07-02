import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../shared/apis/auth';
import Button from '../../shared/components/button/Button';
import { isFirebaseConfigured } from '../../shared/firebase/config';
import { getFirebaseErrorMessage } from '../../shared/firebase/errors';
import AnimatedGradientBackground from '../../shared/styles/AnimatedGradientBackground/AnimatedGradientBackground';
import PageHeader from '../../shared/components/header/PageHeader';
import { DEFAULT_EMAIL_DOMAIN, EMAIL_DOMAINS, type EmailDomain } from '../../shared/constants/emailDomains';
import { validatePassword } from '../../shared/utils/passwordValidation';
import { resetOnboarding } from '../../shared/utils/onboardingStorage';
import SignupConsentFields from '../../shared/components/consent/SignupConsentFields';
import { EMPTY_SIGNUP_CONSENTS, areRequiredConsentsChecked } from '../../shared/types/consent';
import type { SignupConsents } from '../../shared/types/consent';
import './Signup.css';

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [emailLocal, setEmailLocal] = useState('');
  const [domain, setDomain] = useState<EmailDomain | string>(DEFAULT_EMAIL_DOMAIN);
  const [customDomain, setCustomDomain] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [tempCustomDomain, setTempCustomDomain] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [consents, setConsents] = useState<SignupConsents>(EMPTY_SIGNUP_CONSENTS);

  const displayDomain = domain === '직접 입력' ? customDomain || '직접 입력' : domain;

  useEffect(() => {
    if (isSheetOpen) setTempCustomDomain(customDomain);
  }, [isSheetOpen, customDomain]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (!areRequiredConsentsChecked(consents)) {
      setError('필수 약관에 모두 동의해 주세요.');
      return;
    }

    const resolvedDomain = domain === '직접 입력' ? customDomain : domain;
    const email = `${emailLocal}@${resolvedDomain}`;

    if (!isFirebaseConfigured) {
      setError('Firebase 설정이 없습니다. .env 파일을 확인해주세요.');
      return;
    }

    setLoading(true);
    try {
      await authApi.signup({
        name: name.trim(),
        email,
        password,
        consents: { ...consents, agreedAt: new Date().toISOString() },
      });
      resetOnboarding();
      navigate('/onboarding/chat');
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === 'auth/email-already-in-use') {
        setError('이미 가입된 이메일입니다. 로그인해주세요.');
      } else {
        setError(getFirebaseErrorMessage(err, '회원가입에 실패했습니다.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDomainSelect = (selected: EmailDomain) => {
    if (selected === '직접 입력') {
      setDomain(selected);
      setCustomDomain(tempCustomDomain);
    } else {
      setDomain(selected);
    }
    setIsSheetOpen(false);
  };

  return (
    <AnimatedGradientBackground variant="auth" className="signup">
      <div className="signup__content">
        <PageHeader title="회원가입" onBack={() => navigate('/')} />

        <form className="signup__form" onSubmit={handleSubmit}>
          <div className="underline-input">
            <label className="underline-input__label">이름</label>
            <input
              className="underline-input__field"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력해주세요"
              autoComplete="name"
              required
            />
            <div className="underline-input__line" />
          </div>

          <div className="email-input">
            <div className="email-input__labels">
              <span className="email-input__label">이메일</span>
            </div>
            <div className="email-input__row">
              <input
                className="email-input__local"
                type="text"
                value={emailLocal}
                onChange={(e) => setEmailLocal(e.target.value)}
                autoComplete="username"
              />
              <button
                type="button"
                className="email-input__domain-btn"
                onClick={() => setIsSheetOpen(true)}
              >
                <span className="email-input__at">@</span>
                <span className="email-input__domain">{displayDomain}</span>
                <svg className="email-input__chevron" width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true">
                  <path d="M1 1.5L6 6.5L11 1.5" stroke="#C4A898" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <div className="email-input__line" />
          </div>

          <div className="underline-input">
            <label className="underline-input__label">비밀번호</label>
            <input
              className="underline-input__field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8~16자, 소문자·숫자·특수문자"
              autoComplete="new-password"
              maxLength={16}
            />
            <div className="underline-input__line" />
            <p className="underline-input__hint">8~16자, 영어 소문자·숫자·특수문자 포함</p>
          </div>

          <div className="underline-input">
            <label className="underline-input__label">비밀번호 재입력</label>
            <input
              className="underline-input__field"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호를 한 번 더 입력해주세요"
              autoComplete="new-password"
              maxLength={16}
            />
            <div className="underline-input__line" />
          </div>

          <SignupConsentFields consents={consents} onChange={setConsents} />

          <Button type="submit" variant="glass" layout="full" disabled={loading || !areRequiredConsentsChecked(consents)}>
            {loading ? '가입 중...' : '가입하기'}
          </Button>
          {error && <p className="signup__error">{error}</p>}
        </form>
      </div>

      {isSheetOpen && (
        <div className="domain-sheet-overlay" onClick={() => setIsSheetOpen(false)} role="presentation">
          <div className="domain-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="domain-sheet__list">
              {EMAIL_DOMAINS.map((item) => (
                <div key={item}>
                  <button
                    type="button"
                    className={`domain-sheet__item${domain === item ? ' domain-sheet__item--selected' : ''}`}
                    onClick={() => handleDomainSelect(item)}
                  >
                    {item}
                  </button>
                  {item === '직접 입력' && domain === '직접 입력' && (
                    <input
                      className="domain-sheet__custom-input"
                      type="text"
                      value={tempCustomDomain}
                      onChange={(e) => setTempCustomDomain(e.target.value)}
                      placeholder="example.com"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                </div>
              ))}
            </div>
            <Button variant="glass" layout="full" onClick={() => setIsSheetOpen(false)}>
              취소
            </Button>
          </div>
        </div>
      )}
    </AnimatedGradientBackground>
  );
}
