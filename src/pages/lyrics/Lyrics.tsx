import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { songsApi } from '../../shared/apis/songs/songsApi';
import CharacterChatLayout from '../../shared/components/chat/CharacterChatLayout';
import VoiceConversationPanel from '../../shared/components/chat/VoiceConversationPanel';
import VoiceRecorderBar from '../../shared/components/chat/VoiceRecorderBar';
import BottomNav from '../../shared/components/nav/BottomNav';
import { getPackageById } from '../../shared/constants/packages';
import {
  generateLyricsAssistantReply,
  LYRICS_PHASE_MARKER,
  LYRICS_START_MESSAGE,
} from '../../shared/firebase/llmService';
import { isSpeechRecognitionSupported, VoiceRecorder } from '../../shared/firebase/voiceService';
import type { Song } from '../../shared/types/song';
import { createChatId, formatChatTime, type ChatMessage, type VoiceSessionStatus } from '../../shared/types/chat';
import { isLoggedIn } from '../../shared/utils/authStorage';
import { isIntroChatComplete } from '../../shared/utils/onboardingStorage';

function hasLyricsPhaseStarted(messages: ChatMessage[]) {
  return messages.some((m) => m.role === 'bot' && m.text.includes(LYRICS_PHASE_MARKER));
}

export default function Lyrics() {
  const navigate = useNavigate();
  const { songId } = useParams<{ songId: string }>();
  const voiceRecorderRef = useRef<VoiceRecorder | null>(null);
  const lyricsIntroAdded = useRef(false);

  const [song, setSong] = useState<Song | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<VoiceSessionStatus>('idle');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [loading, setLoading] = useState(true);

  const saveMessages = useCallback(async (nextMessages: ChatMessage[], currentSong: Song) => {
    try {
      const { data } = await songsApi.update(currentSong.id, {
        messages: nextMessages,
        step: '가사 작성 중',
      });
      setSong(data.song);
    } catch {
      // 오프라인 등 저장 실패 시 로컬 상태만 유지
    }
  }, []);

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
        let nextMessages = res.data.song.messages;

        if (!hasLyricsPhaseStarted(nextMessages) && !lyricsIntroAdded.current) {
          lyricsIntroAdded.current = true;
          const introMessage: ChatMessage = {
            id: createChatId(),
            role: 'bot',
            text: LYRICS_START_MESSAGE,
            time: formatChatTime(),
            source: 'text',
          };
          nextMessages = [...nextMessages, introMessage];
          const { data } = await songsApi.update(res.data.song.id, {
            messages: nextMessages,
            step: '가사 작성 중',
          });
          setSong(data.song);
          setMessages(nextMessages);
        } else {
          setSong(res.data.song);
          setMessages(nextMessages);
        }
      })
      .catch(() => navigate('/home', { replace: true }))
      .finally(() => setLoading(false));
  }, [navigate, songId]);

  const handleToggleRecord = async () => {
    if (!song || status === 'processing') return;

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
      setLiveTranscript('');

      if (!userText) {
        alert('말씀이 인식되지 않았습니다. 다시 시도해 주세요.');
        setStatus('idle');
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

      const botText = await generateLyricsAssistantReply(withUser);
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
  const subtitle = selectedPackage ? `${selectedPackage.title} · 가사 작성` : '2. 가사 작성';

  return (
    <CharacterChatLayout
      title={song.title}
      subtitle={subtitle}
      onBack={() => navigate('/home')}
      footer={<VoiceRecorderBar status={status} disabled={loading} onToggleRecord={handleToggleRecord} />}
      showBottomNav
      bottomNav={<BottomNav />}
    >
      <VoiceConversationPanel
        messages={messages}
        status={status}
        liveTranscript={liveTranscript}
        defaultBotText="가사에 담고 싶은 내용을 말씀해 주세요."
      />
    </CharacterChatLayout>
  );
}
