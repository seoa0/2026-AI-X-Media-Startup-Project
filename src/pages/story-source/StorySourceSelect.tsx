import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { songsApi } from '../../shared/apis/songs/songsApi';
import CharacterChatLayout from '../../shared/components/chat/CharacterChatLayout';
import VoiceConversationPanel from '../../shared/components/chat/VoiceConversationPanel';
import BottomNav from '../../shared/components/nav/BottomNav';
import { ASSISTANT_NAME } from '../../shared/constants/onboardingChat';
import {
  STORY_SOURCE_CHOICES,
  STORY_SOURCE_NEW_REPLY,
  STORY_SOURCE_PROLOGUE_REPLY,
  STORY_SOURCE_QUESTION,
} from '../../shared/constants/productionFlow';
import { getPackageById } from '../../shared/constants/packages';
import { createChatId, formatChatTime, type ChatChoice, type ChatMessage } from '../../shared/types/chat';
import type { Song } from '../../shared/types/song';
import { isLoggedIn } from '../../shared/utils/authStorage';
import { getOnboardingData, isIntroChatComplete } from '../../shared/utils/onboardingStorage';
import { getSongRoute } from '../../shared/utils/songRoute';

export default function StorySourceSelect() {
  const navigate = useNavigate();
  const { songId } = useParams<{ songId: string }>();
  const initialized = useRef(false);

  const [song, setSong] = useState<Song | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
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
      .then((res) => {
        const loaded = res.data.song;
        setSong(loaded);

        if (loaded.storySource) {
          navigate(getSongRoute(loaded), { replace: true });
          return;
        }

        if (!initialized.current) {
          initialized.current = true;
          setMessages([
            {
              id: createChatId(),
              role: 'bot',
              text: STORY_SOURCE_QUESTION,
              time: formatChatTime(),
              source: 'text',
            },
          ]);
        }
      })
      .catch(() => navigate('/home', { replace: true }))
      .finally(() => setLoading(false));
  }, [navigate, songId]);

  const handleChoice = async (choice: ChatChoice) => {
    if (!song || submitting) return;
    setSubmitting(true);

    const isPrologue = choice.value === 'prologue';
    const { story } = getOnboardingData();
    const prologueStory = story?.trim() || '';

    const userMessage: ChatMessage = {
      id: createChatId(),
      role: 'user',
      text: choice.label,
      time: formatChatTime(),
      source: 'text',
    };

    const botMessage: ChatMessage = {
      id: createChatId(),
      role: 'bot',
      text: isPrologue ? STORY_SOURCE_PROLOGUE_REPLY : STORY_SOURCE_NEW_REPLY,
      time: formatChatTime(),
      source: 'text',
    };

    const nextMessages = [...messages, userMessage, botMessage];

    try {
      await songsApi.update(song.id, {
        messages: nextMessages,
        storySource: isPrologue ? 'prologue' : 'new',
        prologueStory: isPrologue ? prologueStory : null,
        productionPhase: isPrologue ? 'lyrics_making' : 'idea',
      });

      if (isPrologue) {
        navigate(`/lyrics-making/${song.id}`);
      } else {
        navigate(`/create/${song.id}`);
      }
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
  const subtitle = selectedPackage ? `${selectedPackage.title} · 이야기 선택` : '이야기 선택';

  return (
    <CharacterChatLayout
      title="나만의 노래 제작"
      subtitle={subtitle}
      onBack={() => navigate('/packages')}
      showBottomNav
      bottomNav={<BottomNav />}
    >
      <VoiceConversationPanel
        messages={messages}
        status={submitting ? 'processing' : 'idle'}
        choices={submitting ? [] : STORY_SOURCE_CHOICES}
        onChoice={handleChoice}
        assistantName={ASSISTANT_NAME}
        choicesClassName="voice-conversation__choices--spacious"
      />
    </CharacterChatLayout>
  );
}
