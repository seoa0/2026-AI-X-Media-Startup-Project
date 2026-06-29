import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CharacterChatLayout from '../../shared/components/chat/CharacterChatLayout';
import VoiceConversationPanel from '../../shared/components/chat/VoiceConversationPanel';
import VoiceRecorderBar from '../../shared/components/chat/VoiceRecorderBar';
import {
  FAVORITE_SONG_EXAMPLES,
  GENRE_CHOICES,
  INTRO_CHOICES,
  ONBOARDING_QUESTIONS,
  RECENT_SONG_EXAMPLES,
  SONG_TITLE_EXAMPLES,
  STORY_CHOICES,
  buildAfterGenreMessage,
  buildCompletionMessage,
  buildGenreQuestionMessage,
  getFirstQuestionMessage,
  getIntroMessage,
  getServiceAskMessage,
  getServiceDescriptionMessage,
  matchChoiceFromSpeech,
  parseIntroSpeech,
  recommendGenres,
  type ChatChoice,
  type ChatStep,
} from '../../shared/constants/onboardingChat';
import { generateOnboardingAck, generateOnboardingTransition } from '../../shared/firebase/llmService';
import { isSpeechRecognitionSupported, VoiceRecorder } from '../../shared/firebase/voiceService';
import { createChatId, formatChatTime, type ChatMessage, type VoiceSessionStatus } from '../../shared/types/chat';
import { completeIntroChat, clearOnboardingGenre, saveOnboardingData } from '../../shared/utils/onboardingStorage';
import { syncOnboardingToServer } from '../../shared/utils/syncOnboarding';
import './ChatOnboarding.css';

interface Answers {
  recentSong: string;
  favoriteSong: string;
  story: string;
}

const EMPTY_ANSWERS: Answers = {
  recentSong: '',
  favoriteSong: '',
  story: '',
};

export default function ChatOnboarding() {
  const navigate = useNavigate();
  const voiceRecorderRef = useRef<VoiceRecorder | null>(null);
  const initialized = useRef(false);

  const [step, setStep] = useState<ChatStep>('intro');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [choices, setChoices] = useState<ChatChoice[]>([]);
  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS);
  const [recommendedGenres, setRecommendedGenres] = useState<string[]>([]);
  const [status, setStatus] = useState<VoiceSessionStatus>('idle');
  const [liveTranscript, setLiveTranscript] = useState('');

  const appendMessage = (role: ChatMessage['role'], text: string, source: ChatMessage['source'] = 'text') => {
    setMessages((prev) => [
      ...prev,
      { id: createChatId(), role, text, time: formatChatTime(), source },
    ]);
  };

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    clearOnboardingGenre();
    setStep('intro');
    appendMessage('bot', getIntroMessage());
    setChoices(INTRO_CHOICES);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetToIntro = () => {
    setStep('intro');
    appendMessage('bot', getIntroMessage());
    setChoices(INTRO_CHOICES);
  };

  const startFirstQuestion = () => {
    setStep('recentSong');
    appendMessage('bot', getFirstQuestionMessage());
    setChoices(RECENT_SONG_EXAMPLES);
  };

  const handleServiceExplain = (label: string, source: ChatMessage['source'] = 'text') => {
    appendMessage('user', label, source);
    appendMessage('bot', getServiceAskMessage());
    appendMessage('bot', getServiceDescriptionMessage());
    resetToIntro();
  };

  const handleIntroChoice = (value: string, label: string, source: ChatMessage['source'] = 'text') => {
    if (value === 'question') {
      handleServiceExplain(label, source);
      return;
    }
    appendMessage('user', label, source);
    startFirstQuestion();
  };

  const finishOnboarding = async (value: string, source: ChatMessage['source']) => {
    appendMessage('user', value, source);
    saveOnboardingData({ songTitle: value });
    appendMessage('bot', buildCompletionMessage(value));
    setStep('done');
    setChoices([]);
    completeIntroChat();
    await syncOnboardingToServer();
    navigate('/packages');
  };

  const submitRecentSong = async (value: string, source: ChatMessage['source']) => {
    appendMessage('user', value, source);
    setAnswers((prev) => ({ ...prev, recentSong: value }));
    saveOnboardingData({ recentSong: value });

    setStatus('processing');
    const botText = await generateOnboardingTransition(
      value,
      'recentSong',
      ONBOARDING_QUESTIONS.favoriteSong,
    );
    setStep('favoriteSong');
    appendMessage('bot', botText);
    setChoices(FAVORITE_SONG_EXAMPLES);
    setStatus('idle');
  };

  const submitFavoriteSong = async (value: string, source: ChatMessage['source']) => {
    appendMessage('user', value, source);
    const nextAnswers = { ...answers, favoriteSong: value };
    setAnswers(nextAnswers);
    saveOnboardingData({ favoriteSong: value });

    setStatus('processing');
    const botText = await generateOnboardingTransition(
      value,
      'favoriteSong',
      ONBOARDING_QUESTIONS.story,
    );
    setStep('story');
    appendMessage('bot', botText);
    setChoices(STORY_CHOICES);
    setStatus('idle');
  };

  const submitStory = async (value: string, source: ChatMessage['source']) => {
    appendMessage('user', value, source);
    const nextAnswers = { ...answers, story: value };
    setAnswers(nextAnswers);
    saveOnboardingData({ story: value });

    const genres = recommendGenres({
      story: value,
      recentSong: nextAnswers.recentSong,
      favoriteSong: nextAnswers.favoriteSong,
    });
    setRecommendedGenres(genres);

    setStatus('processing');
    const ack = await generateOnboardingAck(value, 'story');
    const botText = `${ack}\n\n${buildGenreQuestionMessage(genres)}`;

    setStep('genre');
    appendMessage('bot', botText);
    setChoices(genres.map((g) => ({ label: g, value: g })));
    setStatus('idle');
  };

  const submitGenre = async (value: string, source: ChatMessage['source']) => {
    appendMessage('user', value, source);
    appendMessage('bot', buildAfterGenreMessage(value));
    setStep('songTitle');
    setChoices(SONG_TITLE_EXAMPLES);
  };

  const handleChoice = async (choice: ChatChoice) => {
    if (status === 'processing') return;

    if (step === 'intro') {
      handleIntroChoice(choice.value, choice.label);
      return;
    }
    if (step === 'recentSong') {
      await submitRecentSong(choice.value, 'text');
      return;
    }
    if (step === 'favoriteSong') {
      await submitFavoriteSong(choice.value, 'text');
      return;
    }
    if (step === 'story') {
      await submitStory(choice.label, 'text');
      return;
    }
    if (step === 'genre') {
      await submitGenre(choice.value, 'text');
      return;
    }
    if (step === 'songTitle') {
      await finishOnboarding(choice.value, 'text');
    }
  };

  const processVoiceInput = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      alert('말씀이 인식되지 않았습니다. 다시 시도해 주세요.');
      return;
    }

    if (step === 'intro') {
      const intent = parseIntroSpeech(trimmed);
      handleIntroChoice(intent, intent === 'question' ? '잠깐만요 🤔' : '네, 시작할게요!', 'voice');
      return;
    }
    if (step === 'recentSong') {
      const matched = matchChoiceFromSpeech(trimmed, RECENT_SONG_EXAMPLES);
      await submitRecentSong(matched?.value ?? trimmed, 'voice');
      return;
    }
    if (step === 'favoriteSong') {
      const matched = matchChoiceFromSpeech(trimmed, FAVORITE_SONG_EXAMPLES);
      await submitFavoriteSong(matched?.value ?? trimmed, 'voice');
      return;
    }
    if (step === 'story') {
      const matched = matchChoiceFromSpeech(trimmed, STORY_CHOICES);
      await submitStory(matched?.label ?? trimmed, 'voice');
      return;
    }
    if (step === 'genre') {
      const genreChoices =
        recommendedGenres.length > 0
          ? recommendedGenres.map((g) => ({ label: g, value: g }))
          : GENRE_CHOICES;
      const matched = matchChoiceFromSpeech(trimmed, genreChoices) ?? matchChoiceFromSpeech(trimmed, GENRE_CHOICES);
      await submitGenre(matched?.value ?? trimmed, 'voice');
      return;
    }
    if (step === 'songTitle') {
      const matched = matchChoiceFromSpeech(trimmed, SONG_TITLE_EXAMPLES);
      await finishOnboarding(matched?.value ?? trimmed, 'voice');
    }
  };

  const handleToggleRecord = async () => {
    if (step === 'done' || status === 'processing') return;

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
      try {
        await processVoiceInput(transcript);
      } finally {
        setStatus('idle');
      }
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

  return (
    <CharacterChatLayout
      title="나만의 노래 제작"
      subtitle="프롤로그"
      footer={
        step !== 'done' ? (
          <VoiceRecorderBar status={status} onToggleRecord={handleToggleRecord} />
        ) : undefined
      }
    >
      <VoiceConversationPanel
        messages={messages}
        status={status}
        liveTranscript={liveTranscript}
        choices={choices}
        onChoice={handleChoice}
        defaultBotText="안녕하세요! 마이크를 눌러 대화를 시작해 주세요."
      />
    </CharacterChatLayout>
  );
}
