import { useEffect, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { songsApi } from '../../shared/apis/songs/songsApi';
import PackageCard from '../../shared/components/package/PackageCard';
import BottomNav from '../../shared/components/nav/BottomNav';
import { logoImage } from '../../shared/assets';
import { APP_NAME } from '../../shared/constants/brand';
import AnimatedGradientBackground from '../../shared/styles/AnimatedGradientBackground/AnimatedGradientBackground';
import { PACKAGES } from '../../shared/constants/packages';
import { isLoggedIn } from '../../shared/utils/authStorage';
import {
  completeOnboarding,
  clearOnboardingGenre,
  getOnboardingData,
  isIntroChatComplete,
  isOnboardingComplete,
  saveOnboardingData,
} from '../../shared/utils/onboardingStorage';
import { syncOnboardingToServer } from '../../shared/utils/syncOnboarding';
import './PackageSelect.css';

export default function PackageSelect() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [bottomNavVisible, setBottomNavVisible] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login', { replace: true });
      return;
    }
    if (!isIntroChatComplete()) {
      navigate('/onboarding/chat', { replace: true });
      return;
    }
    clearOnboardingGenre();
  }, [navigate]);

  const handleBackgroundTap = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('.package-card, button, a')) return;
    setBottomNavVisible((prev) => !prev);
  };

  const handleSelect = async (packageId: string) => {
    if (submitting) return;
    setSubmitting(true);

    saveOnboardingData({ selectedPackageId: packageId });
    if (!isOnboardingComplete()) {
      completeOnboarding();
    }
    await syncOnboardingToServer();

    try {
      const { songTitle } = getOnboardingData();
      const { data } = await songsApi.create({
        packageId,
        title: songTitle?.trim() || undefined,
      });
      navigate(`/story-source/${data.song.id}`);
    } catch {
      alert('곡 생성에 실패했습니다. 다시 시도해주세요.');
      setSubmitting(false);
    }
  };

  return (
    <AnimatedGradientBackground variant="auth" className="package-select">
      <div className="package-select__tap-area" onClick={handleBackgroundTap}>
        <header className="package-select__header">
          <div className="package-select__logo-wrap">
            <img src={logoImage} alt={APP_NAME} className="package-select__logo" />
          </div>
          <p className="package-select__subtitle">원하는 플랜을 선택해주세요</p>
        </header>

        <main className="package-select__list">
          {PACKAGES.map((pkg) => (
            <PackageCard key={pkg.id} data={pkg} onClick={() => handleSelect(pkg.id)} />
          ))}
        </main>
      </div>

      <div
        className={`package-select__nav-overlay${
          bottomNavVisible ? ' package-select__nav-overlay--visible' : ''
        }`}
      >
        <BottomNav />
      </div>
    </AnimatedGradientBackground>
  );
}
