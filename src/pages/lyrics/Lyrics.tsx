import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../shared/components/button/Button';
import { songsApi } from '../../shared/apis/songs/songsApi';
import CharacterChatLayout from '../../shared/components/chat/CharacterChatLayout';
import BottomNav from '../../shared/components/nav/BottomNav';
import { canRegenerateLyrics, getPackageFeatures } from '../../shared/constants/packageFeatures';
import { getPackageById } from '../../shared/constants/packages';
import {
  LYRICS_REVISION_DONE_MESSAGE,
  LYRICS_REVISION_STEPS,
  MELODY_FLOW_DONE_MESSAGE,
  MELODY_FLOW_STEPS,
  getSampleLyrics,
} from '../../shared/constants/lyricsFlow';
import {
  LYRICS_CONFIRM_MESSAGE,
  LYRICS_REGEN_PAYWALL_MESSAGE,
} from '../../shared/constants/productionFlow';
import type { LyricsFlowPhase, Song, VideoTier, UpdateSongRequest } from '../../shared/types/song';
import { isLoggedIn } from '../../shared/utils/authStorage';
import { isIntroChatComplete } from '../../shared/utils/onboardingStorage';
import { getSongRoute } from '../../shared/utils/songRoute';
import LyricsFlowChat from './LyricsFlowChat';
import VideoUpgradePanel from './VideoUpgradePanel';
import './Lyrics.css';

function resolveInitialPhase(song: Song): LyricsFlowPhase {
  if (song.lyricsFlowPhase && !song.lyricsConfirmedAt) {
    return song.lyricsFlowPhase;
  }
  return 'preview';
}

export default function Lyrics() {
  const navigate = useNavigate();
  const { songId } = useParams<{ songId: string }>();

  const [song, setSong] = useState<Song | null>(null);
  const [phase, setPhase] = useState<LyricsFlowPhase>('preview');
  const [lyrics, setLyrics] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login', { replace: true });
      return;
    }
    if (!isIntroChatComplete()) {
      navigate('/onboarding/chat', { replace: true });
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

        if (loaded.lyricsConfirmedAt) {
          navigate(getSongRoute(loaded), { replace: true });
          return;
        }

        if (!loaded.storySource) {
          navigate(`/story-source/${loaded.id}`, { replace: true });
          return;
        }

        if (loaded.storySource === 'new') {
          const readyForLyrics = loaded.messages.some(
            (m) => m.role === 'bot' && m.text.includes('가사 생성으로 넘어가'),
          );
          if (!readyForLyrics) {
            navigate(`/create/${loaded.id}`, { replace: true });
            return;
          }
        }

        setSong(loaded);
        setPhase(resolveInitialPhase(loaded));

        if (loaded.generatedLyrics) {
          setLyrics(loaded.generatedLyrics);
          return;
        }

        setGenerating(true);
        const generated = getSampleLyrics();
        try {
          const { data } = await songsApi.update(loaded.id, {
            generatedLyrics: generated,
            lyrics: generated,
            step: '가사 작성 중',
            productionPhase: 'lyrics',
            lyricsFlowPhase: 'preview',
          });
          setSong(data.song);
          setLyrics(generated);
        } catch {
          setLyrics(generated);
        } finally {
          setGenerating(false);
        }
      })
      .catch(() => navigate('/home', { replace: true }))
      .finally(() => setLoading(false));
  }, [navigate, songId]);

  const persistPhase = async (nextPhase: LyricsFlowPhase, patch: UpdateSongRequest = {}) => {
    if (!song) return;
    try {
      const { data } = await songsApi.update(song.id, {
        lyricsFlowPhase: nextPhase,
        ...patch,
      });
      setSong(data.song);
    } catch {
      setSong((prev) => (prev ? { ...prev, lyricsFlowPhase: nextPhase, ...patch } : prev));
    }
    setPhase(nextPhase);
  };

  const handleStartRevision = async () => {
    if (!song || generating) return;

    if (!canRegenerateLyrics(song.packageId, song.lyricsRegenCount)) {
      alert(LYRICS_REGEN_PAYWALL_MESSAGE);
      return;
    }

    await persistPhase('revision');
  };

  const handleRevisionComplete = async () => {
    if (!song) return;

    setGenerating(true);
    const nextRegenCount = song.lyricsRegenCount + 1;
    const generated = getSampleLyrics();

    try {
      const { data } = await songsApi.update(song.id, {
        generatedLyrics: generated,
        lyrics: generated,
        lyricsRegenCount: nextRegenCount,
        lyricsFlowPhase: 'preview',
      });
      setSong(data.song);
      setLyrics(generated);
      setPhase('preview');
    } catch {
      setLyrics(generated);
      setSong((prev) =>
        prev
          ? {
              ...prev,
              lyricsRegenCount: nextRegenCount,
              generatedLyrics: generated,
              lyrics: generated,
              lyricsFlowPhase: 'preview',
            }
          : prev,
      );
      setPhase('preview');
    } finally {
      setGenerating(false);
    }
  };

  const handleConfirmLyrics = async () => {
    if (!song) return;
    await persistPhase('melody');
  };

  const handleMelodyComplete = async () => {
    await persistPhase('video_upgrade');
  };

  const handleVideoSelect = async (tier: VideoTier) => {
    if (!song || submitting) return;
    setSubmitting(true);

    const { productionWaitMs } = getPackageFeatures(song.packageId);
    const readyAt = new Date(Date.now() + productionWaitMs);
    const melodySummary = '멜로디 방향 확정';

    try {
      await songsApi.update(song.id, {
        lyricsConfirmedAt: new Date().toISOString(),
        productionReadyAt: readyAt.toISOString(),
        productionPhase: 'production',
        step: '멜로디 생성 중',
        progress: 60,
        lyricsFlowPhase: null,
        videoTier: tier,
        melody: melodySummary,
      });
      navigate(`/production/waiting/${song.id}`);
    } catch {
      alert('저장에 실패했습니다. 다시 시도해 주세요.');
      setSubmitting(false);
    }
  };

  if (loading || !song) {
    return (
      <div className="character-chat" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'rgba(45,49,66,0.5)', fontFamily: 'var(--font-body)' }}>불러오는 중...</p>
      </div>
    );
  }

  const selectedPackage = song.packageId ? getPackageById(song.packageId) : null;
  const packageLabel = selectedPackage?.title ?? '';

  if (phase === 'revision') {
    return (
      <LyricsFlowChat
        title={song.title}
        subtitle={packageLabel ? `${packageLabel} · 가사 수정` : '가사 수정'}
        steps={LYRICS_REVISION_STEPS}
        doneMessage={LYRICS_REVISION_DONE_MESSAGE}
        onBack={() => setPhase('preview')}
        onComplete={() => {
          handleRevisionComplete();
        }}
      />
    );
  }

  if (phase === 'melody') {
    return (
      <LyricsFlowChat
        title={song.title}
        subtitle={packageLabel ? `${packageLabel} · 멜로디 방향` : '멜로디 방향'}
        steps={MELODY_FLOW_STEPS}
        doneMessage={MELODY_FLOW_DONE_MESSAGE}
        onBack={() => setPhase('preview')}
        onComplete={() => {
          handleMelodyComplete();
        }}
      />
    );
  }

  if (phase === 'video_upgrade') {
    return (
      <VideoUpgradePanel
        title={song.title}
        subtitle={packageLabel ? `${packageLabel} · 영상 선택` : '영상 선택'}
        onBack={() => setPhase('melody')}
        onSelect={handleVideoSelect}
        submitting={submitting}
      />
    );
  }

  const regensLeft = getPackageFeatures(song.packageId).freeLyricsRegens - song.lyricsRegenCount;
  const regenLabel =
    regensLeft > 0 ? `다시 만들기 (무료 ${regensLeft}회)` : '다시 만들기 (결제 필요)';

  return (
    <CharacterChatLayout
      title={song.title}
      subtitle={packageLabel ? `${packageLabel} · 1. 가사 생성` : '1. 가사 생성'}
      onBack={() => navigate('/home')}
      footer={
        <div className="lyrics__footer">
          <Button
            variant="white"
            layout="full"
            className="lyrics__regen-btn"
            onClick={handleStartRevision}
            disabled={generating || submitting}
          >
            {generating ? '가사 생성 중...' : regenLabel}
          </Button>
          <Button variant="primary" layout="full" onClick={handleConfirmLyrics} disabled={generating || submitting}>
            이 가사로 확정
          </Button>
        </div>
      }
      showBottomNav
      bottomNav={<BottomNav />}
    >
      <div className="lyrics__panel">
        <p className="lyrics__guide">{LYRICS_CONFIRM_MESSAGE}</p>
        <pre className="lyrics__preview">{generating ? '가사를 만들고 있어요...' : lyrics}</pre>
      </div>
    </CharacterChatLayout>
  );
}
