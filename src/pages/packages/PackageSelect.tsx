import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { songsApi } from '../../shared/apis/songs/songsApi';
import PackageCard from '../../shared/components/package/PackageCard';
import SegmentToggle from '../../shared/components/toggle/SegmentToggle';
import { logoImage } from '../../shared/assets';
import AnimatedGradientBackground from '../../shared/styles/AnimatedGradientBackground/AnimatedGradientBackground';
import { RECOMMENDED_PACKAGES, SPECIAL_PACKAGES } from '../../shared/constants/packages';
import { isLoggedIn } from '../../shared/utils/authStorage';
import {
  completeOnboarding,
  getOnboardingData,
  isIntroChatComplete,
  isOnboardingComplete,
  saveOnboardingData,
} from '../../shared/utils/onboardingStorage';
import { syncOnboardingToServer } from '../../shared/utils/syncOnboarding';
import './PackageSelect.css';

type PackageTab = 'recommended' | 'special';

const TAB_OPTIONS: { value: PackageTab; label: string }[] = [
  { value: 'recommended', label: '추천' },
  { value: 'special', label: '스페셜' },
];

export default function PackageSelect() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<PackageTab>('recommended');
  const [submitting, setSubmitting] = useState(false);
  const packages = tab === 'recommended' ? RECOMMENDED_PACKAGES : SPECIAL_PACKAGES;

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login', { replace: true });
      return;
    }
    if (!isIntroChatComplete()) {
      navigate('/onboarding/chat', { replace: true });
    }
  }, [navigate]);

  const handleSelect = async (packageId: string) => {
    if (submitting) return;
    setSubmitting(true);

    saveOnboardingData({ selectedPackageId: packageId });
    if (!isOnboardingComplete()) {
      completeOnboarding();
    }
    await syncOnboardingToServer();

    const onboarding = getOnboardingData();
    try {
      const { data } = await songsApi.create({
        packageId,
        genre: onboarding.selectedGenre,
        style: onboarding.selectedGenre,
      });
      navigate(`/create/${data.song.id}`);
    } catch {
      alert('곡 생성에 실패했습니다. 다시 시도해주세요.');
      setSubmitting(false);
    }
  };

  return (
    <AnimatedGradientBackground variant="auth" className="package-select">
      <header className="package-select__header">
        <div className="package-select__logo-wrap">
          <img src={logoImage} alt="나는 가수다" className="package-select__logo" />
        </div>
        <p className="package-select__subtitle">원하는 플랜을 선택해주세요</p>
        <SegmentToggle options={TAB_OPTIONS} value={tab} onChange={setTab} />
      </header>

      <main className="package-select__list">
        {packages.map((pkg) => (
          <PackageCard key={pkg.id} data={pkg} onClick={() => handleSelect(pkg.id)} />
        ))}
      </main>
    </AnimatedGradientBackground>
  );
}
