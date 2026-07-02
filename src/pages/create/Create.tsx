import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../shared/components/button/Button';
import { songsApi } from '../../shared/apis/songs/songsApi';
import CharacterChatLayout from '../../shared/components/chat/CharacterChatLayout';
import VoiceConversationPanel from '../../shared/components/chat/VoiceConversationPanel';
import VoiceRecorderBar from '../../shared/components/chat/VoiceRecorderBar';
import BottomNav from '../../shared/components/nav/BottomNav';
import { ASSISTANT_NAME, VOICE_CONFIRM_CHOICES } from '../../shared/constants/onboardingChat';
import { getCreateExampleHint } from '../../shared/constants/createChat';
import { getPackageById } from '../../shared/constants/packages';
import {
  CREATE_WRAPUP_DONE,
  generateMusicAssistantReply,
  isWrapUpQuestion,
} from '../../shared/firebase/llmService';
import { isSpeechRecognitionSupported, VoiceRecorder } from '../../shared/firebase/voiceService';
import type { Song } from '../../shared/types/song';
import { createChatId, formatChatTime, type ChatChoice, type ChatMessage, type VoiceSessionStatus } from '../../shared/types/chat';
import { isLoggedIn } from '../../shared/utils/authStorage';
import { isIntroChatComplete } from '../../shared/utils/onboardingStorage';
import { getSongRoute } from '../../shared/utils/songRoute';
import { useBotMotionPulse } from '../../shared/hooks/useBotMotionPulse';
import { resolveCharacterMotionMode } from '../../shared/utils/characterMotionMode';

export default function Create() {
  const navigate = useNavigate();
  const { songId } = useParams<{ songId: string }>();
  const voiceRecorderRef = useRef<VoiceRecorder | null>(null);

  const [song, setSong] = useState<Song | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<VoiceSessionStatus>('idle');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [pendingVoice, setPendingVoice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [readyForLyrics, setReadyForLyrics] = useState(false);

  const userTurnCount = messages.filter((m) => m.role === 'user').length;
  const botAnimating = useBotMotionPulse(messages);
  const characterMotion = resolveCharacterMotionMode({ status, botAnimating });

  const saveMessages = useCallback(
    async (nextMessages: ChatMessage[], currentSong: Song) => {
      try {
        const title =
          currentSong.title === '새로운 곡'
            ? nextMessages.find((m) => m.role === 'user')?.text.slice(0, 30) ?? currentSong.title
            : currentSong.title;

        const { data } = await songsApi.update(currentSong.id, {
          messages: nextMessages,
          title,
        });
        setSong(data.song);
      } catch {
        // 오프라인 등 저장 실패 시 로컬 상태만 유지
      }
    },
    [],
  );

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
        if (!loaded.storySource) {
          navigate(`/story-source/${loaded.id}`, { replace: true });
          return;
        }
        if (loaded.storySource === 'prologue') {
          navigate(getSongRoute(loaded), { replace: true });
          return;
        }
        setSong(loaded);
        setMessages(loaded.messages);
        setReadyForLyrics(
          loaded.messages.some((m) => m.role === 'bot' && m.text.includes('가사 생성으로 넘어가')),
        );
      })
      .catch(() => navigate('/home', { replace: true }))
      .finally(() => setLoading(false));
  }, [navigate, songId]);

  const goToLyrics = () => {
    if (song) navigate(`/lyrics-making/${song.id}`);
  };

  const submitUserMessage = async (userText: string) => {
    if (!song) return;

    const userMessage: ChatMessage = {
      id: createChatId(),
      role: 'user',
      text: userText,
      time: formatChatTime(),
      source: 'voice',
    };

    const withUser = [...messages, userMessage];
    setMessages(withUser);
    setStatus('processing');

    const wrapUpAlreadyAsked = messages.some((m) => m.role === 'bot' && isWrapUpQuestion(m.text));

    let botText: string;
    if (wrapUpAlreadyAsked) {
      botText = CREATE_WRAPUP_DONE;
    } else {
      const pkg = song.packageId ? getPackageById(song.packageId) : null;
      const turnCount = withUser.filter((m) => m.role === 'user').length;
      botText = await generateMusicAssistantReply(withUser, {
        packageTitle: pkg?.title,
        step: song.step,
        userTurnCount: turnCount,
      });
    }

    const botMessage: ChatMessage = {
      id: createChatId(),
      role: 'bot',
      text: botText,
      time: formatChatTime(),
      source: 'text',
    };

    const nextMessages = [...withUser, botMessage];
    setMessages(nextMessages);
    await saveMessages(nextMessages, song);

    if (wrapUpAlreadyAsked) {
      setReadyForLyrics(true);
    }

    setStatus('idle');
  };

  const handleChoice = async (choice: ChatChoice) => {
    if (status === 'processing' || readyForLyrics || !pendingVoice) return;

    if (choice.value === '__confirm__') {
      const text = pendingVoice;
      setPendingVoice(null);
      await submitUserMessage(text);
      return;
    }

    if (choice.value === '__retry__') {
      setPendingVoice(null);
    }
  };

  const processVoiceInput = (text: string) => {
    setPendingVoice(text);
  };

  const handleToggleRecord = async () => {
    if (!song || status === 'processing' || readyForLyrics) return;

    if (!isSpeechRecognitionSupported()) {
      alert('이 브라우저에서는 음성 인식을 지원하지 않습니다. Chrome을 사용해 주세요.');
      return;
    }

    if (status === 'listening') {
      setStatus('processing');
      const recorder = voiceRecorderRef.current;
      voiceRecorderRef.current = null;

      const { transcript } = recorder ? await recorder.stop() : { transcript: '' };
      setLiveTranscript('');
      const trimmed = transcript.trim();
      if (!trimmed) {
        alert('말씀이 인식되지 않았습니다. 다시 시도해 주세요.');
        setStatus('idle');
        return;
      }
      processVoiceInput(trimmed);
      setStatus('idle');
      return;
    }

    if (pendingVoice) {
      setPendingVoice(null);
    }

    const recorder = new VoiceRecorder();
    voiceRecorderRef.current = recorder;
    setLiveTranscript('');
    setStatus('listening');

    try {
      await recorder.start(setLiveTranscript);
    } catch {
      voiceRecorderRef.current = null;
      setStatus('idle');
      alert('마이크 권한이 필요합니다. 브라우저 설정에서 허용해 주세요.');
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
  const subtitle = selectedPackage
    ? `${selectedPackage.title} · ${song.step}`
    : '1. 제작 시작';

  const displayChoices = pendingVoice ? VOICE_CONFIRM_CHOICES : [];
  const exampleHint = pendingVoice || readyForLyrics ? null : getCreateExampleHint(userTurnCount);

  const statusLabels: Partial<Record<VoiceSessionStatus, string>> = {
    listening: '듣고 있어요...',
    processing: '또비가 답변을 준비하고 있어요...',
  };

  return (
    <CharacterChatLayout
      title="나만의 노래 제작"
      subtitle={subtitle}
      onBack={() => navigate('/home')}
      characterMotion={characterMotion}
      footer={
        readyForLyrics ? (
          <div style={{ padding: '8px 16px 4px' }}>
            <Button variant="primary" layout="full" onClick={goToLyrics}>
              가사 생성하기
            </Button>
          </div>
        ) : (
          <VoiceRecorderBar
            status={status}
            disabled={loading}
            onToggleRecord={handleToggleRecord}
          />
        )
      }
      showBottomNav
      bottomNav={<BottomNav />}
    >
      <VoiceConversationPanel
        messages={messages}
        status={status}
        liveTranscript={liveTranscript}
        choices={displayChoices}
        onChoice={handleChoice}
        assistantName={ASSISTANT_NAME}
        pendingVoiceText={pendingVoice}
        statusLabels={statusLabels}
        exampleHint={exampleHint}
        inlineAction={
          readyForLyrics ? (
            <Button variant="primary" layout="full" onClick={goToLyrics}>
              가사 생성하기
            </Button>
          ) : undefined
        }
      />
    </CharacterChatLayout>
  );
}
