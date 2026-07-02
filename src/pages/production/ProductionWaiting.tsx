import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { songsApi } from '../../shared/apis/songs/songsApi';
import ChatPageHeader from '../../shared/components/header/ChatPageHeader';
import { getPackageById } from '../../shared/constants/packages';
import { PRODUCTION_WAITING_MESSAGE } from '../../shared/constants/productionFlow';
import type { Song } from '../../shared/types/song';
import { isLoggedIn } from '../../shared/utils/authStorage';
import { getSongRoute } from '../../shared/utils/songRoute';
import './ProductionWaiting.css';

function formatRemaining(ms: number) {
  if (ms <= 0) return '곧 완성됩니다';
  const seconds = Math.ceil(ms / 1000);
  return `${seconds}초 남음`;
}

export default function ProductionWaiting() {
  const navigate = useNavigate();
  const { songId } = useParams<{ songId: string }>();
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login', { replace: true });
      return;
    }
    if (!songId) {
      navigate('/home', { replace: true });
      return;
    }

    songsApi
      .getById(songId)
      .then((res) => {
        const loaded = res.data.song;
        if (!loaded.lyricsConfirmedAt) {
          navigate(getSongRoute(loaded), { replace: true });
          return;
        }
        if (loaded.status === 'completed') {
          navigate(`/production/complete/${loaded.id}`, { replace: true });
          return;
        }
        const readyAt = loaded.productionReadyAt ? new Date(loaded.productionReadyAt).getTime() : 0;
        if (readyAt && Date.now() >= readyAt) {
          navigate(`/production/complete/${loaded.id}`, { replace: true });
          return;
        }
        setSong(loaded);
      })
      .catch(() => navigate('/home', { replace: true }))
      .finally(() => setLoading(false));
  }, [navigate, songId]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!song?.productionReadyAt || !songId) return;
    const readyAt = new Date(song.productionReadyAt).getTime();
    if (Date.now() >= readyAt) {
      navigate(`/production/complete/${songId}`, { replace: true });
    }
  }, [song, songId, now, navigate]);

  const remainingLabel = useMemo(() => {
    if (!song?.productionReadyAt) return '약 10초';
    const ms = new Date(song.productionReadyAt).getTime() - now;
    return formatRemaining(ms);
  }, [song, now]);

  if (loading || !song) {
    return (
      <div className="production-waiting">
        <p className="production-waiting__empty">불러오는 중...</p>
      </div>
    );
  }

  const selectedPackage = song.packageId ? getPackageById(song.packageId) : null;

  return (
    <div className="production-waiting">
      <ChatPageHeader
        title={song.title}
        subtitle={selectedPackage ? `${selectedPackage.title} · 2. 제작 중` : '2. 제작 중'}
        onBack={() => navigate('/home')}
      />

      <main className="production-waiting__main">
        <div className="production-waiting__card">
          <span className="production-waiting__step">STEP 2</span>
          <h2 className="production-waiting__title">노래 제작 중</h2>
          <p className="production-waiting__message">{PRODUCTION_WAITING_MESSAGE}</p>
          <div className="production-waiting__timer">{remainingLabel}</div>
          <ul className="production-waiting__timeline">
            <li className="production-waiting__timeline-item production-waiting__timeline-item--done">가사 확정</li>
            <li className="production-waiting__timeline-item production-waiting__timeline-item--active">멜로디 · 보컬 · 믹싱</li>
            <li className="production-waiting__timeline-item">영상 · 노래 완성</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
