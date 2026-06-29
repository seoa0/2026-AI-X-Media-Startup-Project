import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { songsApi } from '../../shared/apis/songs/songsApi';
import CharacterChatLayout from '../../shared/components/chat/CharacterChatLayout';
import ChatInputBar from '../../shared/components/chat/ChatInputBar';
import ChatPanel from '../../shared/components/chat/ChatPanel';
import BottomNav from '../../shared/components/nav/BottomNav';
import { getPackageById } from '../../shared/constants/packages';
import type { Song } from '../../shared/types/song';
import { createChatId, formatChatTime, type ChatMessage } from '../../shared/types/chat';
import { isLoggedIn } from '../../shared/utils/authStorage';
import { getOnboardingData, isIntroChatComplete } from '../../shared/utils/onboardingStorage';

const BOT_REPLY = '멋진 아이디어야! 곧 제작 플로우가 이어질 거야.\n조금만 기다려줘 🎵';

export default function Create() {
  const navigate = useNavigate();
  const { songId } = useParams<{ songId: string }>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const onboarding = getOnboardingData();

  const [song, setSong] = useState<Song | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);

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
          genre: currentSong.genre ?? onboarding.selectedGenre,
          style: currentSong.style ?? onboarding.selectedGenre,
        });
        setSong(data.song);
      } catch {
        // 오프라인 등 저장 실패 시 로컬 상태만 유지
      }
    },
    [onboarding.selectedGenre],
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
      })
      .catch(() => navigate('/home', { replace: true }))
      .finally(() => setLoading(false));
  }, [navigate, songId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || !song) return;

    setInput('');
    const nextMessages: ChatMessage[] = [
      ...messages,
      { id: createChatId(), role: 'user', text: trimmed, time: formatChatTime() },
      { id: createChatId(), role: 'bot', text: BOT_REPLY, time: formatChatTime() },
    ];
    setMessages(nextMessages);
    await saveMessages(nextMessages, song);
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
    ? `${selectedPackage.title} · ${song.style ?? song.genre ?? onboarding.selectedGenre ?? '제작 중'}`
    : '1. 제작 시작';

  return (
    <CharacterChatLayout
      title="나만의 노래 제작"
      subtitle={subtitle}
      onBack={() => navigate('/home')}
      footer={
        <ChatInputBar
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          placeholder="어떤 곡을 만들고 싶은지 입력해주세요"
        />
      }
      showBottomNav
      bottomNav={<BottomNav />}
    >
      <ChatPanel messages={messages} showInput={false} messagesEndRef={messagesEndRef} />
    </CharacterChatLayout>
  );
}
