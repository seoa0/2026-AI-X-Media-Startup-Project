import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { navArrowRightIcon } from '../../shared/assets/icons';
import { logoImage } from '../../shared/assets';
import { songsApi } from '../../shared/apis/songs/songsApi';
import BannerCarousel from '../../shared/components/banner/BannerCarousel';
import Button from '../../shared/components/button/Button';
import BottomNav from '../../shared/components/nav/BottomNav';
import AnimatedGradientBackground from '../../shared/styles/AnimatedGradientBackground/AnimatedGradientBackground';
import type { Song } from '../../shared/types/song';
import { isLoggedIn } from '../../shared/utils/authStorage';
import { isOnboardingComplete } from '../../shared/utils/onboardingStorage';
import { getRedirectIfNoActiveProduction } from '../../shared/utils/productionGuard';
import { getHomeGuardRedirect } from '../../shared/utils/routeGuard';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const loggedIn = isLoggedIn();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(loggedIn);

  useEffect(() => {
    if (!loggedIn) {
      setLoading(false);
      return;
    }

    const init = async () => {
      const onboardingRedirect = getHomeGuardRedirect();
      if (onboardingRedirect) {
        navigate(onboardingRedirect, { replace: true });
        return;
      }

      const emptyProductionRedirect = await getRedirectIfNoActiveProduction();
      if (emptyProductionRedirect) {
        navigate(emptyProductionRedirect, { replace: true });
        return;
      }

      songsApi
        .list('in_progress')
        .then((res) => setSongs(res.data.songs))
        .catch(() => setSongs([]))
        .finally(() => setLoading(false));
    };

    init();
  }, [navigate, loggedIn]);

  const handleCreateClick = () => {
    if (!loggedIn) {
      navigate('/login');
      return;
    }
    navigate('/packages');
  };

  const showInProgress = loggedIn && isOnboardingComplete();

  return (
    <AnimatedGradientBackground variant="auth" className="home">
      <div className="home__content">
        <div className="home__logo-wrap">
          <img src={logoImage} alt="나도 가수다" className="home__logo" />
        </div>

        <BannerCarousel />

        <Button
          variant="glass"
          layout="full"
          className="home__create-btn"
          onClick={handleCreateClick}
        >
          <span className="home__create-btn-text">음악 제작하러 가기</span>
          <span className="home__create-btn-arrow" aria-hidden="true">
            <img src={navArrowRightIcon} alt="" width={16} height={16} />
          </span>
        </Button>

        {showInProgress && (
          <section className="home__in-progress">
            <h2 className="home__section-title">제작 중인 곡</h2>
            {loading ? (
              <p className="home__empty">불러오는 중...</p>
            ) : songs.length > 0 ? (
              <div className="home__song-list">
                {songs.map((song) => (
                  <article
                    key={song.id}
                    className="home__song-card"
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/create/${song.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') navigate(`/create/${song.id}`);
                    }}
                  >
                    <div className="home__song-info">
                      <h3 className="home__song-title">{song.title}</h3>
                      <p className="home__song-meta">{song.step}</p>
                    </div>
                    <div className="home__song-progress">
                      <div
                        className="home__song-progress-bar"
                        style={{ width: `${song.progress}%` }}
                      />
                    </div>
                    <span className="home__song-percent">{song.progress}%</span>
                  </article>
                ))}
              </div>
            ) : (
              <p className="home__empty">아직 제작 중인 곡이 없어요.</p>
            )}
          </section>
        )}
      </div>

      <BottomNav />
    </AnimatedGradientBackground>
  );
}
