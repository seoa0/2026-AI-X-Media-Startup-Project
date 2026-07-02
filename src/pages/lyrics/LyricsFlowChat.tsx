import { useCallback, useEffect, useRef, useState } from 'react';
import CharacterChatLayout from '../../shared/components/chat/CharacterChatLayout';
import VoiceConversationPanel from '../../shared/components/chat/VoiceConversationPanel';
import VoiceRecorderBar from '../../shared/components/chat/VoiceRecorderBar';
import BottomNav from '../../shared/components/nav/BottomNav';
import { ASSISTANT_NAME, VOICE_CONFIRM_CHOICES } from '../../shared/constants/onboardingChat';
import type { FlowChatStep } from '../../shared/constants/lyricsFlow';
import { isSpeechRecognitionSupported, VoiceRecorder } from '../../shared/firebase/voiceService';
import { createChatId, formatChatTime, type ChatChoice, type ChatMessage, type VoiceSessionStatus } from '../../shared/types/chat';
import { useBotMotionPulse } from '../../shared/hooks/useBotMotionPulse';
import { resolveCharacterMotionMode } from '../../shared/utils/characterMotionMode';

interface LyricsFlowChatProps {
  title: string;
  subtitle: string;
  steps: FlowChatStep[];
  doneMessage: string;
  onBack: () => void;
  onComplete: (answers: Record<string, string>) => void;
}

export default function LyricsFlowChat({
  title,
  subtitle,
  steps,
  doneMessage,
  onBack,
  onComplete,
}: LyricsFlowChatProps) {
  const voiceRecorderRef = useRef<VoiceRecorder | null>(null);
  const initialized = useRef(false);

  const [stepIndex, setStepIndex] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<VoiceSessionStatus>('idle');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [pendingVoice, setPendingVoice] = useState<string | null>(null);
  const [finishing, setFinishing] = useState(false);

  const currentStep = steps[stepIndex];
  const isDone = stepIndex >= steps.length;
  const botAnimating = useBotMotionPulse(messages);
  const characterMotion = resolveCharacterMotionMode({
    status,
    chatComplete: finishing && isDone,
    botAnimating,
  });

  const appendBot = useCallback((text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: createChatId(), role: 'bot', text, time: formatChatTime(), source: 'text' },
    ]);
  }, []);

  const appendUser = useCallback((text: string, source: ChatMessage['source'] = 'voice') => {
    setMessages((prev) => [
      ...prev,
      { id: createChatId(), role: 'user', text, time: formatChatTime(), source },
    ]);
  }, []);

  useEffect(() => {
    if (initialized.current || !currentStep) return;
    initialized.current = true;
    appendBot(currentStep.question);
    appendBot(currentStep.micGuide);
  }, [appendBot, currentStep]);

  const advanceStep = useCallback(
    (answer: string) => {
      if (!currentStep) return;

      const nextAnswers = { ...answers, [currentStep.id]: answer };
      setAnswers(nextAnswers);
      appendBot(currentStep.ack(answer));

      const nextIndex = stepIndex + 1;
      if (nextIndex < steps.length) {
        setStepIndex(nextIndex);
        const next = steps[nextIndex];
        window.setTimeout(() => {
          appendBot(next.question);
          appendBot(next.micGuide);
        }, 400);
        return;
      }

      setStepIndex(nextIndex);
      setFinishing(true);
      window.setTimeout(() => {
        appendBot(doneMessage);
        window.setTimeout(() => onComplete(nextAnswers), 1200);
      }, 400);
    },
    [answers, appendBot, currentStep, doneMessage, onComplete, stepIndex, steps],
  );

  const submitAnswer = (text: string, source: ChatMessage['source'] = 'voice') => {
    appendUser(text, source);
    setStatus('processing');
    window.setTimeout(() => {
      advanceStep(text);
      setStatus('idle');
    }, 500);
  };

  const handleChoice = async (choice: ChatChoice) => {
    if (status === 'processing' || finishing) return;

    if (pendingVoice) {
      if (choice.value === '__confirm__') {
        const text = pendingVoice;
        setPendingVoice(null);
        submitAnswer(text, 'voice');
        return;
      }
      if (choice.value === '__retry__') {
        setPendingVoice(null);
      }
      return;
    }

    if (currentStep?.choices?.some((c) => c.value === choice.value)) {
      submitAnswer(choice.label, 'text');
    }
  };

  const handleToggleRecord = async () => {
    if (status === 'processing' || finishing || isDone) return;

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
      setPendingVoice(trimmed);
      setStatus('idle');
      return;
    }

    if (pendingVoice) setPendingVoice(null);

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

  const stepChoices =
    !pendingVoice && !finishing && currentStep?.choices ? currentStep.choices : [];
  const displayChoices = pendingVoice ? VOICE_CONFIRM_CHOICES : stepChoices;

  const exampleHint =
    !pendingVoice && !finishing && currentStep ? currentStep.exampleHint : null;

  return (
    <CharacterChatLayout
      title={title}
      subtitle={subtitle}
      onBack={onBack}
      characterMotion={characterMotion}
      footer={
        <VoiceRecorderBar
          status={status}
          disabled={finishing || isDone}
          onToggleRecord={handleToggleRecord}
        />
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
        statusLabels={{
          listening: '듣고 있어요...',
          processing: '또비가 정리하고 있어요...',
        }}
        exampleHint={exampleHint}
        choicesClassName={stepChoices.length > 0 ? 'voice-conversation__choices--spacious' : undefined}
      />
    </CharacterChatLayout>
  );
}
