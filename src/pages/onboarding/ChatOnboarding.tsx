import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../shared/components/button/Button';
import CharacterChatLayout from '../../shared/components/chat/CharacterChatLayout';
import ChatInputBar from '../../shared/components/chat/ChatInputBar';
import ChatPanel from '../../shared/components/chat/ChatPanel';
import {
  GENRE_CHOICES,
  STORY_CHOICES,
  getBotMessage,
  recommendGenres,
  type ChatChoice,
  type ChatStep,
} from '../../shared/constants/onboardingChat';
import { createChatId, formatChatTime, type ChatMessage } from '../../shared/types/chat';
import { completeIntroChat, saveOnboardingData } from '../../shared/utils/onboardingStorage';
import { syncOnboardingToServer } from '../../shared/utils/syncOnboarding';
import './ChatOnboarding.css';

interface Answers {
  recentSong: string;
  favoriteSong: string;
  story: string;
  preferredGenre: string;
}

const INTRO_CHOICES: ChatChoice[] = [
  { label: '네, 시작할게요!', value: 'start' },
  { label: '잠깐만요 🤔', value: 'question' },
];

const EMPTY_ANSWERS: Answers = {
  recentSong: '',
  favoriteSong: '',
  story: '',
  preferredGenre: '',
};

export default function ChatOnboarding() {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  const [step, setStep] = useState<ChatStep>('intro');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [choices, setChoices] = useState<ChatChoice[]>([]);
  const [input, setInput] = useState('');
  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS);
  const [showPackageBtn, setShowPackageBtn] = useState(false);

  const appendMessage = (role: ChatMessage['role'], text: string) => {
    setMessages((prev) => [...prev, { id: createChatId(), role, text, time: formatChatTime() }]);
  };

  const applyStepUi = (nextStep: ChatStep, genres: string[] = []) => {
    switch (nextStep) {
      case 'intro':
        setChoices(INTRO_CHOICES);
        break;
      case 'recentSong':
      case 'favoriteSong':
        setChoices([]);
        break;
      case 'story':
        setChoices(STORY_CHOICES);
        break;
      case 'genre':
        setChoices(GENRE_CHOICES);
        break;
      case 'recommend':
        setChoices(genres.map((g) => ({ label: g, value: g })));
        break;
      case 'done':
        setChoices([]);
        setShowPackageBtn(true);
        break;
      default:
        setChoices([]);
    }
  };

  const goToStep = (nextStep: ChatStep, genres: string[] = []) => {
    setStep(nextStep);
    appendMessage('bot', getBotMessage(nextStep, { genres }));
    applyStepUi(nextStep, genres);
  };

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    goToStep('intro');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, choices, showPackageBtn]);

  const handleIntroChoice = (value: string, label: string) => {
    appendMessage('user', label);
    if (value === 'question') {
      appendMessage('bot', '궁금한 점은 제작 시작 후에도 언제든 물어봐!\n일단 가볍게 시작해볼까?');
    }
    goToStep('recentSong');
  };

  const handleRecentSong = (value: string) => {
    appendMessage('user', value);
    setAnswers((prev) => ({ ...prev, recentSong: value }));
    saveOnboardingData({ recentSong: value });
    goToStep('favoriteSong');
  };

  const handleFavoriteSong = (value: string) => {
    appendMessage('user', value);
    setAnswers((prev) => ({ ...prev, favoriteSong: value }));
    saveOnboardingData({ favoriteSong: value });
    goToStep('story');
  };

  const handleStory = (value: string) => {
    appendMessage('user', value);
    setAnswers((prev) => ({ ...prev, story: value }));
    saveOnboardingData({ story: value });
    goToStep('genre');
  };

  const handleGenre = (value: string) => {
    appendMessage('user', value);
    const nextAnswers = { ...answers, preferredGenre: value };
    setAnswers(nextAnswers);
    saveOnboardingData({ preferredGenre: value });

    const genres = recommendGenres({
      story: nextAnswers.story,
      preferredGenre: value,
      recentSong: nextAnswers.recentSong,
    });
    goToStep('recommend', genres);
  };

  const handleRecommend = (value: string) => {
    appendMessage('user', value);
    saveOnboardingData({ selectedGenre: value });
    goToStep('done');
  };

  const handleChoice = (choice: ChatChoice) => {
    if (step === 'intro') {
      handleIntroChoice(choice.value, choice.label);
      return;
    }
    if (step === 'story') {
      handleStory(choice.value);
      return;
    }
    if (step === 'genre') {
      handleGenre(choice.value);
      return;
    }
    if (step === 'recommend') {
      handleRecommend(choice.value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    setInput('');

    if (step === 'recentSong') {
      handleRecentSong(trimmed);
      return;
    }
    if (step === 'favoriteSong') {
      handleFavoriteSong(trimmed);
      return;
    }
    if (step === 'story') {
      handleStory(trimmed);
      return;
    }
    if (step === 'genre') {
      handleGenre(trimmed);
      return;
    }
    if (step === 'recommend') {
      handleRecommend(trimmed);
      return;
    }
    if (step === 'intro') {
      handleIntroChoice('start', trimmed);
    }
  };

  const handleGoToPackages = async () => {
    completeIntroChat();
    await syncOnboardingToServer();
    navigate('/packages');
  };

  const inputPlaceholder =
    step === 'recentSong'
      ? '요즘 듣는 노래를 입력해주세요'
      : step === 'favoriteSong'
        ? '가장 좋아하는 노래를 입력해주세요'
        : '메세지를 입력해주세요.';

  return (
    <CharacterChatLayout
      title="나만의 노래 제작"
      subtitle="0. 프롤로그"
      footer={
        step !== 'done' ? (
          <ChatInputBar
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            placeholder={inputPlaceholder}
          />
        ) : undefined
      }
    >
      <ChatPanel
        messages={messages}
        choices={choices}
        onChoice={handleChoice}
        showInput={false}
        inlineAction={
          showPackageBtn ? (
            <Button variant="primary" layout="full" onClick={handleGoToPackages}>
              플랜 선택하기
            </Button>
          ) : undefined
        }
        messagesEndRef={messagesEndRef}
      />
    </CharacterChatLayout>
  );
}
