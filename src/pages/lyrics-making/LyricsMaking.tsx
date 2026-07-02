import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLottie } from 'lottie-react';
import { songsApi } from '../../shared/apis/songs/songsApi';
import letterAnimation from '../../shared/assets/letter.json';
import { LYRICS_MAKING_MESSAGE } from '../../shared/constants/productionFlow';
import AnimatedGradientBackground from '../../shared/styles/AnimatedGradientBackground/AnimatedGradientBackground';
import { isLoggedIn } from '../../shared/utils/authStorage';
import { isIntroChatComplete } from '../../shared/utils/onboardingStorage';
import './LyricsMaking.css';

const AUTO_ADVANCE_MS = 3500;

const animationData =
  typeof letterAnimation === 'object' && letterAnimation !== null && 'default' in letterAnimation
    ? (letterAnimation as { default: typeof letterAnimation }).default
    : letterAnimation;

function LetterLottie() {
  const { View } = useLottie({
    animationData,
    loop: false,
    autoplay: true,
  });

  return <div className="lyrics-making__lottie">{View}</div>;
}

export default function LyricsMaking() {
  const navigate = useNavigate();
  const { songId } = useParams<{ songId: string }>();
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<number | null>(null);

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

    let cancelled = false;

    songsApi
      .getById(songId)
      .then(async (res) => {
        if (cancelled) return;
        const song = res.data.song;

        if (song.lyricsConfirmedAt) {
          navigate(`/production/waiting/${song.id}`, { replace: true });
          return;
        }

        if (song.generatedLyrics) {
          navigate(`/lyrics/${song.id}`, { replace: true });
          return;
        }

        if (!song.storySource) {
          navigate(`/story-source/${song.id}`, { replace: true });
          return;
        }

        if (song.productionPhase === 'lyrics_making') {
          await songsApi.update(song.id, { productionPhase: 'lyrics', step: '가사 작성 중' });
        }

        setVisible(true);
        timerRef.current = window.setTimeout(() => {
          navigate(`/lyrics/${songId}`, { replace: true });
        }, AUTO_ADVANCE_MS);
      })
      .catch(() => {
        if (!cancelled) navigate('/home', { replace: true });
      });

    return () => {
      cancelled = true;
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [navigate, songId]);

  return (
    <AnimatedGradientBackground variant="auth" className="lyrics-making">
      <div className={`lyrics-making__content${visible ? ' lyrics-making__content--visible' : ''}`}>
        <LetterLottie />
        <p className="lyrics-making__message">{LYRICS_MAKING_MESSAGE}</p>
      </div>
    </AnimatedGradientBackground>
  );
}
