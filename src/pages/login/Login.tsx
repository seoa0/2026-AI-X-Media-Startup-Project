import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../shared/apis/auth';
import Button from '../../shared/components/button/Button';
import { isFirebaseConfigured } from '../../shared/firebase/config';
import { getFirebaseErrorMessage } from '../../shared/firebase/errors';
import AnimatedGradientBackground from '../../shared/styles/AnimatedGradientBackground/AnimatedGradientBackground';
import PageHeader from '../../shared/components/header/PageHeader';
import { clearOnboardingGenre, getPostLoginPath } from '../../shared/utils/onboardingStorage';
import { getRedirectIfNoActiveProduction } from '../../shared/utils/productionGuard';
import { applyServerOnboarding } from '../../shared/utils/syncOnboarding';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isFirebaseConfigured) {
      setError('Firebase 설정이 없습니다. .env 파일을 확인해주세요.');
      return;
    }

    setLoading(true);

    try {
      const { data } = await authApi.login({ email, password });
      applyServerOnboarding(data.user.onboarding);
      clearOnboardingGenre();
      setLoading(false);
      const emptyProductionRedirect = await getRedirectIfNoActiveProduction();
      navigate(emptyProductionRedirect ?? getPostLoginPath());
    } catch (err) {
      setError(getFirebaseErrorMessage(err, '이메일 또는 비밀번호가 올바르지 않습니다.'));
      setLoading(false);
    }
  };

  return (
    <AnimatedGradientBackground variant="auth" className="login">
      <div className="login__content">
        <PageHeader title="로그인" onBack={() => navigate('/')} />

        <form className="login__form" onSubmit={handleSubmit}>
          <div className="underline-input">
            <label className="underline-input__label">이메일</label>
            <input
              className="underline-input__field"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력해주세요"
              autoComplete="email"
              required
            />
            <div className="underline-input__line" />
          </div>

          <div className="underline-input">
            <label className="underline-input__label">비밀번호</label>
            <input
              className="underline-input__field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력해주세요"
              autoComplete="current-password"
              required
            />
            <div className="underline-input__line" />
          </div>

          {error && <p className="login__error">{error}</p>}

          <Button type="submit" variant="primary" layout="full" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </Button>
        </form>
      </div>
    </AnimatedGradientBackground>
  );
}
