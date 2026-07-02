import { useNavigate } from 'react-router-dom';
import Button from '../../shared/components/button/Button';
import { APP_NAME } from '../../shared/constants/brand';
import AnimatedGradientBackground from '../../shared/styles/AnimatedGradientBackground/AnimatedGradientBackground';
import { logoImage, lpImage } from '../../shared/assets';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <AnimatedGradientBackground variant="landing" className="landing">
      <div className="landing__lp-wrap" aria-hidden="true">
        <img src={lpImage} alt="" className="landing__lp" draggable={false} />
      </div>
      <div className="landing__content">
        <div className="landing__hero">
          <p className="landing__tagline-line">세상에 하나뿐인,</p>
          <p className="landing__tagline-line">
            <span className="landing__tagline-highlight">당신만을 위한 노래</span> 제작기
          </p>
          <p className="landing__tagline-line">
            <span className="landing__marker-highlight">앙코르(ENCORE) AI</span>
          </p>
          <img src={logoImage} alt={APP_NAME} className="landing__logo" />
        </div>

        <div className="landing__actions">
          <Button variant="glass" layout="inline" onClick={() => navigate('/signup')}>
            회원가입
          </Button>
          <Button variant="glass" layout="inline" onClick={() => navigate('/login')}>
            로그인
          </Button>
        </div>

        <p className="landing__terms">
          가입 시{' '}
          <a href="#" className="landing__terms-link">이용약관</a>
          {' '}및{' '}
          <a href="#" className="landing__terms-link">개인정보처리방침</a>
          에 동의합니다
        </p>
      </div>
    </AnimatedGradientBackground>
  );
}
