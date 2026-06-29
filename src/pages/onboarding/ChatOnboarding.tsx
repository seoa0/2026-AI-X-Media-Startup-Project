import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../shared/apis/auth';
import CharacterChatLayout from '../../shared/components/chat/CharacterChatLayout';
import ChatTextInputBar from '../../shared/components/chat/ChatTextInputBar';
import VoiceConversationPanel from '../../shared/components/chat/VoiceConversationPanel';
import VoiceRecorderBar from '../../shared/components/chat/VoiceRecorderBar';
import {
  ASSISTANT_NAME,
  VOICE_CONFIRM_CHOICES,
  buildFavoriteSongMessage,
  buildFinalGenreOptions,
  buildFinalGenreThinkingMessage,
  buildGiftTargetMessage,
  buildReadSentenceMessage,
  buildStory1Message,
  buildStoryMoreMessage,
  buildSummaryMessage,
  buildVoiceOwnerMessage,
  buildVoiceRecordMessage,
  getChoicesForStep,
  getExampleHintForStep,
  getFarewellMessages,
  getGenreMicGuide,
  getGenreQuestionMessage,
  getGreetingMicGuide,
  getStoryConfirmMessage,
  getSubtitleForStep,
  getTtobiGreetingMessage,
  getVoiceLabel,
  pickReadSentence,
  stepUsesMic,
  type ChatChoice,
  type ChatStep,
  type VoiceRecordSubStep,
} from '../../shared/constants/onboardingChat';
import { isSpeechRecognitionSupported, VoiceRecorder } from '../../shared/firebase/voiceService';
import { createChatId, formatChatTime, type ChatMessage, type VoiceSessionStatus } from '../../shared/types/chat';
import {
  clearOnboardingGenre,
  completeIntroChat,
  saveOnboardingData,
} from '../../shared/utils/onboardingStorage';
import { syncOnboardingToServer } from '../../shared/utils/syncOnboarding';
import './ChatOnboarding.css';

interface Answers {
  listenGenre: string;
  favoriteSong: string;
  storyParts: string[];
  selectedGenre: string;
  giftTarget: string;
  voiceOwner: 'self' | 'other';
}

const EMPTY_ANSWERS: Answers = {
  listenGenre: '',
  favoriteSong: '',
  storyParts: [],
  selectedGenre: '',
  giftTarget: '',
  voiceOwner: 'self',
};

type InputMode = null | 'storyText' | 'customGenre' | 'customGift';

export default function ChatOnboarding() {
  const navigate = useNavigate();
  const voiceRecorderRef = useRef<VoiceRecorder | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const voiceFileInputRef = useRef<HTMLInputElement>(null);
  const initialized = useRef(false);

  const [step, setStep] = useState<ChatStep>('greeting');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [choices, setChoices] = useState<ChatChoice[]>([]);
  const [answers, setAnswers] = useState<Answers>(EMPTY_ANSWERS);
  const [finalGenres, setFinalGenres] = useState<string[]>([]);
  const [userName, setUserName] = useState('고객');
  const [status, setStatus] = useState<VoiceSessionStatus>('idle');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [pendingVoice, setPendingVoice] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>(null);
  const [customGenreMode, setCustomGenreMode] = useState(false);
  const [storyMoreMode, setStoryMoreMode] = useState<'more' | null>(null);
  const [voiceRecordSubStep, setVoiceRecordSubStep] = useState<VoiceRecordSubStep>('method');
  const [readSentence, setReadSentence] = useState('');

  const fullStory = answers.storyParts.join('\n');

  const appendMessage = useCallback((role: ChatMessage['role'], text: string, source: ChatMessage['source'] = 'text') => {
    setMessages((prev) => [
      ...prev,
      { id: createChatId(), role, text, time: formatChatTime(), source },
    ]);
  }, []);

  const restoreStepChoices = useCallback(
    (targetStep: ChatStep = step) => {
      setChoices(
        getChoicesForStep(targetStep, {
          finalGenres,
          voiceRecordSubStep,
          customGenreMode,
        }),
      );
    },
    [step, finalGenres, voiceRecordSubStep, customGenreMode],
  );

  const bootstrap = useCallback(() => {
    clearOnboardingGenre();
    setStep('greeting');
    setMessages([]);
    setAnswers(EMPTY_ANSWERS);
    setFinalGenres([]);
    setPendingVoice(null);
    setInputMode(null);
    setCustomGenreMode(false);
    setStoryMoreMode(null);
    setVoiceRecordSubStep('method');
    setReadSentence('');
    setStatus('idle');
    setLiveTranscript('');

    appendMessage('bot', getTtobiGreetingMessage());
    appendMessage('bot', getGreetingMicGuide());
    setChoices(getChoicesForStep('greeting'));
  }, [appendMessage]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    bootstrap();
    authApi.me().then(({ data }) => {
      if (data.user?.name) setUserName(data.user.name);
    }).catch(() => {});
  }, [bootstrap]);

  const goToGenre = () => {
    setStep('genre');
    appendMessage('bot', getGenreQuestionMessage());
    appendMessage('bot', getGenreMicGuide());
    restoreStepChoices('genre');
  };

  const submitGreeting = (value: string, source: ChatMessage['source']) => {
    appendMessage('user', value, source);
    appendMessage('bot', `반가워요! ${value} 만나서 정말 기뻐요!`);
    goToGenre();
  };

  const submitGenre = (value: string, source: ChatMessage['source']) => {
    appendMessage('user', value, source);
    setAnswers((prev) => ({ ...prev, listenGenre: value }));
    saveOnboardingData({ listenGenre: value, recentSong: value });
    setStep('favoriteSong');
    appendMessage('bot', buildFavoriteSongMessage(value));
    restoreStepChoices('favoriteSong');
  };

  const submitFavoriteSong = (value: string, source: ChatMessage['source']) => {
    appendMessage('user', value, source);
    setAnswers((prev) => ({ ...prev, favoriteSong: value }));
    saveOnboardingData({ favoriteSong: value });
    setStep('story1');
    appendMessage('bot', buildStory1Message(value));
    restoreStepChoices('story1');
  };

  const addStoryPart = (value: string, source: ChatMessage['source']) => {
    appendMessage('user', value, source);
    setAnswers((prev) => {
      const storyParts = [...prev.storyParts, value];
      saveOnboardingData({ story: storyParts.join('\n') });
      return { ...prev, storyParts };
    });
    return value;
  };

  const submitStory1 = (value: string, source: ChatMessage['source']) => {
    addStoryPart(value, source);
    setStep('storyMore');
    appendMessage('bot', buildStoryMoreMessage(value));
    restoreStepChoices('storyMore');
  };

  const goToStoryConfirm = () => {
    setStep('storyConfirm');
    appendMessage('bot', getStoryConfirmMessage());
    restoreStepChoices('storyConfirm');
  };

  const goToFinalGenre = useCallback(() => {
    setAnswers((prev) => {
      const story = prev.storyParts.join('\n');
      const genres = buildFinalGenreOptions({
        listenGenre: prev.listenGenre,
        favoriteSong: prev.favoriteSong,
        story,
      });
      setFinalGenres(genres);
      setCustomGenreMode(false);
      setStep('finalGenre');
      setChoices([
        ...genres.map((g) => ({ label: g, value: g })),
        { label: '마음에 드는 장르가 없나요?', value: '__custom_genre__' },
      ]);
      return prev;
    });
    appendMessage('bot', buildFinalGenreThinkingMessage(userName));
  }, [appendMessage, userName]);

  const submitFinalGenre = (value: string, source: ChatMessage['source']) => {
    appendMessage('user', value, source);
    setAnswers((prev) => ({ ...prev, selectedGenre: value }));
    saveOnboardingData({ selectedGenre: value, preferredGenre: value });
    setStep('giftTarget');
    appendMessage('bot', buildGiftTargetMessage());
    restoreStepChoices('giftTarget');
  };

  const submitGiftTarget = (value: string, source: ChatMessage['source']) => {
    appendMessage('user', value, source);
    setAnswers((prev) => ({ ...prev, giftTarget: value }));
    saveOnboardingData({ giftTarget: value });
    setStep('voiceOwner');
    appendMessage('bot', buildVoiceOwnerMessage());
    restoreStepChoices('voiceOwner');
  };

  const goToSummary = (voiceOwner: 'self' | 'other') => {
    const genre = answers.selectedGenre || finalGenres[0] || '발라드';
    const story = fullStory || '당신만의 이야기';
    const gift = answers.giftTarget || '자기 자신';
    setStep('summary');
    appendMessage(
      'bot',
      buildSummaryMessage({
        userName,
        genre,
        story,
        voiceLabel: getVoiceLabel(voiceOwner),
        giftTarget: gift,
      }),
    );
    restoreStepChoices('summary');
  };

  const submitVoiceOwner = (value: 'self' | 'other', label: string, source: ChatMessage['source']) => {
    appendMessage('user', label, source);
    setAnswers((prev) => ({ ...prev, voiceOwner: value }));
    saveOnboardingData({ voiceOwner: value });

    if (value === 'other') {
      const sentence = pickReadSentence(fullStory);
      setReadSentence(sentence);
      setVoiceRecordSubStep('method');
      setStep('voiceRecord');
      appendMessage('bot', buildVoiceRecordMessage());
      restoreStepChoices('voiceRecord');
      return;
    }
    goToSummary('self');
  };

  const startReadSentence = () => {
    setVoiceRecordSubStep('read');
    appendMessage('bot', buildReadSentenceMessage(readSentence));
    setChoices([]);
  };

  const finishOnboarding = async () => {
    const genre = answers.selectedGenre || finalGenres[0] || '발라드';
    const songTitle = `${userName}의 ${genre} 노래`;
    saveOnboardingData({ songTitle, selectedGenre: genre });

    setStep('farewell');
    setChoices([]);

    for (const msg of getFarewellMessages()) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise<void>((resolve) => {
        setMessages((prev) => [
          ...prev,
          { id: createChatId(), role: 'bot', text: msg, time: formatChatTime(), source: 'text' },
        ]);
        setTimeout(resolve, 1000);
      });
    }

    setStep('done');
    completeIntroChat();
    await syncOnboardingToServer();
    navigate('/packages');
  };

  const applyAnswerForStep = async (targetStep: ChatStep, value: string, source: ChatMessage['source']) => {
    switch (targetStep) {
      case 'greeting':
        submitGreeting(value, source);
        break;
      case 'genre':
        submitGenre(value, source);
        break;
      case 'favoriteSong':
        submitFavoriteSong(value, source);
        break;
      case 'story1':
        submitStory1(value, source);
        break;
      case 'storyMore':
      case 'storyConfirm':
        addStoryPart(value, source);
        setStoryMoreMode(null);
        appendMessage('bot', '이야기 잘 들었어요!');
        restoreStepChoices();
        break;
      case 'voiceRecord':
        if (voiceRecordSubStep === 'read') {
          appendMessage('user', value, source);
          goToSummary('other');
        }
        break;
      default:
        break;
    }
  };

  const handleStoryMoreChoice = (choice: ChatChoice, source: ChatMessage['source'] = 'text') => {
    appendMessage('user', choice.label, source);

    if (choice.value === 'enough') {
      setStoryMoreMode(null);
      if (step === 'storyMore') {
        goToStoryConfirm();
      } else {
        goToFinalGenre();
      }
      return;
    }
    if (choice.value === 'more') {
      setStoryMoreMode('more');
      appendMessage('bot', '편하게 더 말씀해 주세요. 또비가 듣고 있어요!');
      setChoices([]);
      return;
    }
    if (choice.value === 'text') {
      setInputMode('storyText');
      setChoices([]);
      return;
    }
    if (choice.value === 'photo') {
      photoInputRef.current?.click();
    }
  };

  const handlePhotoSelected = (file: File) => {
    const note = `[사진 첨부: ${file.name}]`;
    addStoryPart(note, 'text');
    appendMessage('bot', '사진 잘 받았어요! 이야기에 함께 담을게요.');
    restoreStepChoices();
  };

  const handleTextStorySubmit = (text: string) => {
    setInputMode(null);
    addStoryPart(text, 'text');
    appendMessage('bot', '글로 적어주신 이야기 잘 읽었어요!');
    restoreStepChoices();
  };

  const handleChoice = async (choice: ChatChoice) => {
    if (status === 'processing') return;

    if (pendingVoice) {
      if (choice.value === '__confirm__') {
        const text = pendingVoice;
        const currentStep = step;
        setPendingVoice(null);
        await applyAnswerForStep(currentStep, text, 'voice');
        return;
      }
      if (choice.value === '__retry__') {
        setPendingVoice(null);
        restoreStepChoices();
        return;
      }
    }

    if (step === 'storyMore' || step === 'storyConfirm') {
      handleStoryMoreChoice(choice);
      return;
    }
    if (step === 'finalGenre') {
      if (choice.value === '__custom_genre__') {
        setCustomGenreMode(true);
        setInputMode('customGenre');
        setChoices([]);
        return;
      }
      submitFinalGenre(choice.value, 'text');
      return;
    }
    if (step === 'giftTarget') {
      if (choice.value === '__custom__') {
        setInputMode('customGift');
        setChoices([]);
        return;
      }
      submitGiftTarget(choice.value, 'text');
      return;
    }
    if (step === 'voiceOwner') {
      submitVoiceOwner(choice.value as 'self' | 'other', choice.label, 'text');
      return;
    }
    if (step === 'voiceRecord') {
      if (choice.value === 'file') {
        voiceFileInputRef.current?.click();
        return;
      }
      if (choice.value === 'record') {
        appendMessage('bot', '목소리를 녹음해 주세요. 녹음이 끝나면 문장 읽기로 넘어갈게요.');
        startReadSentence();
      }
      return;
    }
    if (step === 'summary') {
      if (choice.value === 'change') {
        setStep('finalGenre');
        appendMessage('bot', '어떤 부분을 바꾸고 싶으신가요? 장르를 다시 골라볼게요.');
        restoreStepChoices('finalGenre');
        return;
      }
      await finishOnboarding();
    }
  };

  const processVoiceInput = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      alert('말씀이 인식되지 않았습니다. 다시 시도해 주세요.');
      return;
    }

    if (step === 'storyMore' && storyMoreMode === 'more') {
      addStoryPart(trimmed, 'voice');
      setStoryMoreMode(null);
      appendMessage('bot', '이야기 잘 들었어요!');
      restoreStepChoices();
      return;
    }

    if (step === 'voiceRecord' && voiceRecordSubStep === 'read') {
      setPendingVoice(trimmed);
      setChoices(VOICE_CONFIRM_CHOICES);
      return;
    }

    setPendingVoice(trimmed);
    setChoices(VOICE_CONFIRM_CHOICES);
  };

  const handleToggleRecord = async () => {
    if (step === 'done' || step === 'farewell' || status === 'processing') return;
    if (!stepUsesMic(step, { voiceRecordSubStep, storyMoreMode })) return;

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
      processVoiceInput(transcript);
      setStatus('idle');
      return;
    }

    if (pendingVoice) {
      setPendingVoice(null);
      restoreStepChoices();
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

  const showMic = stepUsesMic(step, { voiceRecordSubStep, storyMoreMode }) && step !== 'done' && step !== 'farewell';
  const displayChoices = pendingVoice ? VOICE_CONFIRM_CHOICES : choices;
  const exampleHint =
    pendingVoice || inputMode
      ? null
      : getExampleHintForStep(step, { customGenreMode });

  const statusLabels: Partial<Record<VoiceSessionStatus, string>> = {
    listening: '듣고 있어요...',
    processing: '또비가 답변을 준비하고 있어요...',
  };

  return (
    <CharacterChatLayout
      title="나만의 노래 제작"
      subtitle={getSubtitleForStep(step)}
      footer={
        step !== 'done' && step !== 'farewell' ? (
          <>
            {inputMode === 'storyText' && (
              <ChatTextInputBar
                placeholder="이야기를 자유롭게 적어주세요"
                onSubmit={handleTextStorySubmit}
                onCancel={() => {
                  setInputMode(null);
                  restoreStepChoices();
                }}
              />
            )}
            {inputMode === 'customGenre' && (
              <ChatTextInputBar
                placeholder="원하는 장르를 입력해 주세요"
                onSubmit={(text) => {
                  setInputMode(null);
                  setCustomGenreMode(false);
                  submitFinalGenre(text, 'text');
                }}
                onCancel={() => {
                  setInputMode(null);
                  setCustomGenreMode(false);
                  restoreStepChoices();
                }}
              />
            )}
            {inputMode === 'customGift' && (
              <ChatTextInputBar
                placeholder="선물받을 분을 입력해 주세요"
                onSubmit={(text) => {
                  setInputMode(null);
                  submitGiftTarget(text, 'text');
                }}
                onCancel={() => {
                  setInputMode(null);
                  restoreStepChoices();
                }}
              />
            )}
            {!inputMode && (
              <VoiceRecorderBar
                status={status}
                onToggleRecord={handleToggleRecord}
                showMic={showMic}
              />
            )}
          </>
        ) : undefined
      }
    >
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handlePhotoSelected(file);
          e.target.value = '';
        }}
      />
      <input
        ref={voiceFileInputRef}
        type="file"
        accept="audio/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            appendMessage('user', `목소리 파일: ${file.name}`, 'text');
            startReadSentence();
          }
          e.target.value = '';
        }}
      />

      <VoiceConversationPanel
        messages={messages}
        status={status}
        liveTranscript={liveTranscript}
        choices={displayChoices}
        onChoice={handleChoice}
        assistantName={ASSISTANT_NAME}
        pendingVoiceText={pendingVoice}
        statusLabels={statusLabels}
        defaultBotText={getTtobiGreetingMessage()}
        exampleHint={exampleHint}
      />
    </CharacterChatLayout>
  );
}
