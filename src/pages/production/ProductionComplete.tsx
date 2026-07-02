import { useEffect, useState } from 'react';
import { APP_NAME } from '../../shared/constants/brand';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../shared/components/button/Button';
import { songsApi } from '../../shared/apis/songs/songsApi';
import ChatPageHeader from '../../shared/components/header/ChatPageHeader';
import BottomNav from '../../shared/components/nav/BottomNav';
import { getPackageById } from '../../shared/constants/packages';
import { PRODUCTION_COMPLETE_MESSAGE } from '../../shared/constants/productionFlow';
import type { Song } from '../../shared/types/song';
import { isLoggedIn } from '../../shared/utils/authStorage';
import { getSongRoute } from '../../shared/utils/songRoute';
import './ProductionComplete.css';

const MOCK_VIDEO_URL = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
const MOCK_AUDIO_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

export default function ProductionComplete() {
  const navigate = useNavigate();
  const { songId } = useParams<{ songId: string }>();
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);

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
      .then(async (res) => {
        const loaded = res.data.song;

        if (!loaded.lyricsConfirmedAt) {
          navigate(getSongRoute(loaded), { replace: true });
          return;
        }

        const readyAt = loaded.productionReadyAt ? new Date(loaded.productionReadyAt).getTime() : 0;
        const isReady = loaded.status === 'completed' || (readyAt > 0 && Date.now() >= readyAt);

        if (!isReady) {
          navigate(`/production/waiting/${loaded.id}`, { replace: true });
          return;
        }

        if (loaded.status !== 'completed') {
          const { data } = await songsApi.update(loaded.id, {
            status: 'completed',
            productionPhase: 'completed',
            step: '믹싱 중',
            progress: 100,
            videoUrl: loaded.videoUrl ?? MOCK_VIDEO_URL,
            audioUrl: loaded.audioUrl ?? MOCK_AUDIO_URL,
          });
          setSong(data.song);
        } else {
          setSong(loaded);
        }
      })
      .catch(() => navigate('/home', { replace: true }))
      .finally(() => setLoading(false));
  }, [navigate, songId]);

  const handleShare = async () => {
    const url = window.location.href;
    const title = song?.title ?? APP_NAME;
    try {
      if (navigator.share) {
        await navigator.share({ title, text: `${title} - ${APP_NAME}`, url });
      } else {
        await navigator.clipboard.writeText(url);
        alert('링크가 복사됐어요!');
      }
    } catch {
      // 사용자가 공유 취소
    }
  };

  const handleSave = () => {
    alert('저장 기능은 곧 제공될 예정이에요. 완성된 파일은 마이페이지에서 확인하실 수 있어요.');
  };

  if (loading || !song) {
    return (
      <div className="production-complete">
        <p className="production-complete__empty">불러오는 중...</p>
      </div>
    );
  }

  const selectedPackage = song.packageId ? getPackageById(song.packageId) : null;
  const videoUrl = song.videoUrl ?? MOCK_VIDEO_URL;
  const audioUrl = song.audioUrl ?? MOCK_AUDIO_URL;

  return (
    <div className="production-complete">
      <ChatPageHeader
        title={song.title}
        subtitle={selectedPackage ? `${selectedPackage.title} · 완성` : '제작 완료'}
        onBack={() => navigate('/home')}
      />

      <main className="production-complete__main">
        <p className="production-complete__message">{PRODUCTION_COMPLETE_MESSAGE}</p>

        <div className="production-complete__media">
          <video
            className="production-complete__video"
            src={videoUrl}
            controls
            playsInline
            controlsList="nodownload"
          />
          <audio className="production-complete__audio" src={audioUrl} controls controlsList="nodownload" />
        </div>

        <div className="production-complete__actions">
          <Button variant="primary" layout="full" onClick={handleShare}>
            공유하기
          </Button>
          <Button variant="white" layout="full" className="production-complete__save-btn" onClick={handleSave}>
            저장하기
          </Button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
