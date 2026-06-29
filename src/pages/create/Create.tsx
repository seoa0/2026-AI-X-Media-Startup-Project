import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../shared/components/button/Button';
import { songsApi } from '../../shared/apis/songs/songsApi';
import CharacterChatLayout from '../../shared/components/chat/CharacterChatLayout';
import VoiceConversationPanel from '../../shared/components/chat/VoiceConversationPanel';
import VoiceRecorderBar from '../../shared/components/chat/VoiceRecorderBar';
import BottomNav from '../../shared/components/nav/BottomNav';
import { getPackageById } from '../../shared/constants/packages';
import {
  CREATE_WRAPUP_DONE,
  generateMusicAssistantReply,
  isWrapUpQuestion,
} from '../../shared/firebase/llmService';
import { isSpeechRecognitionSupported, VoiceRecorder } from '../../shared/firebase/voiceService';
import type { Song } from '../../shared/types/song';
import { createChatId, formatChatTime, type ChatMessage, type VoiceSessionStatus } from '../../shared/types/chat';
import { isLoggedIn } from '../../shared/utils/authStorage';
import { isIntroChatComplete } from '../../shared/utils/onboardingStorage';

export default function Create() {
  const navigate = useNavigate();
  const { songId } = useParams<{ songId: string }>();
  const voiceRecorderRef = useRef<VoiceRecorder | null>(null);

  const [song, setSong] = useState<Song | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<VoiceSessionStatus>('idle');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [loading, setLoading] = useState(true);
  const [readyForPackages, setReadyForPackages] = useState(false);

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
        setSong(res.data.song);
        setMessages(res.data.song.messages);
        setReadyForPackages(
          res.data.song.messages.some((m) => m.role === 'bot' && m.text.includes('플랜 선택으로 넘어가')),
        );
      })
      .catch(() => navigate('/home', { replace: true }))
      .finally(() => setLoading(false));
  }, [navigate, songId]);

  const goToPackages = () => {
    navigate('/packages');
  };

  const handleToggleRecord = async () => {
    if (!song || status === 'processing' || readyForPackages) return;

    if (!isSpeechRecognitionSupported()) {
      alert('이 브라우저에서는 음성 인식을 지원하지 않습니다. Chrome을 사용해 주세요.');
      return;
    }

    if (status === 'listening') {
      setStatus('processing');
      const recorder = voiceRecorderRef.current;
      voiceRecorderRef.current = null;

      const { transcript } = recorder ? await recorder.stop() : { transcript: '' };
      const userText = transcript.trim();

      if (!userText) {
        alert('말씀이 인식되지 않았습니다. 다시 시도해 주세요.');
        setStatus('idle');
        setLiveTranscript('');
        return;
      }

      const userMessage: ChatMessage = {
        id: createChatId(),
        role: 'user',
        text: userText,
        time: formatChatTime(),
        source: 'voice',
      };

      const withUser = [...messages, userMessage];
      setMessages(withUser);
      setLiveTranscript('');

      const wrapUpAlreadyAsked = messages.some((m) => m.role === 'bot' && isWrapUpQuestion(m.text));

      let botText: string;
      if (wrapUpAlreadyAsked) {
        botText = CREATE_WRAPUP_DONE;
      } else {
        const pkg = song.packageId ? getPackageById(song.packageId) : null;
        const userTurnCount = withUser.filter((m) => m.role === 'user').length;
        botText = await generateMusicAssistantReply(withUser, {
          packageTitle: pkg?.title,
          step: song.step,
          userTurnCount,
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
        setReadyForPackages(true);
      }

      setStatus('idle');
      return;
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

  return (
    <CharacterChatLayout
      title="나만의 노래 제작"
      subtitle={subtitle}
      onBack={() => navigate('/home')}
      footer={
        readyForPackages ? (
          <div style={{ padding: '8px 16px 4px' }}>
            <Button variant="primary" layout="full" onClick={goToPackages}>
              플랜 선택하기
            </Button>
          </div>
        ) : (
          <VoiceRecorderBar status={status} disabled={loading} onToggleRecord={handleToggleRecord} />
        )
      }
      showBottomNav
      bottomNav={<BottomNav />}
    >
      <VoiceConversationPanel
        messages={messages}
        status={status}
        liveTranscript={liveTranscript}
        inlineAction={
          readyForPackages ? (
            <Button variant="primary" layout="full" onClick={goToPackages}>
              플랜 선택하기
            </Button>
          ) : undefined
        }
      />
    </CharacterChatLayout>
  );
}
