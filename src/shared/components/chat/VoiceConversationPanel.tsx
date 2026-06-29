import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import type { ChatChoice, ChatMessage, VoiceSessionStatus } from '../../types/chat';
import './VoiceConversationPanel.css';

interface VoiceConversationPanelProps {
  messages: ChatMessage[];
  status: VoiceSessionStatus;
  liveTranscript?: string;
  choices?: ChatChoice[];
  onChoice?: (choice: ChatChoice) => void;
  inlineAction?: ReactNode;
  defaultBotText?: string;
  assistantName?: string;
  pendingVoiceText?: string | null;
  statusLabels?: Partial<Record<VoiceSessionStatus, string>>;
  exampleHint?: string | null;
}

const STATUS_LABEL: Record<VoiceSessionStatus, string> = {
  idle: '마이크를 눌러 말씀해 주세요',
  listening: '듣고 있어요...',
  processing: '답변을 작성하고 있어요...',
};

function MessageLines({ text }: { text: string }) {
  return text.split('\n').map((line, i, arr) => (
    <span key={i}>
      {line}
      {i < arr.length - 1 && <br />}
    </span>
  ));
}

export default function VoiceConversationPanel({
  messages,
  status,
  liveTranscript = '',
  choices = [],
  onChoice,
  inlineAction,
  defaultBotText = '안녕하세요! 어떤 곡을 만들고 싶으신지 말씀해 주세요.',
  assistantName = 'AI 뮤직 메이트',
  pendingVoiceText = null,
  statusLabels,
  exampleHint = null,
}: VoiceConversationPanelProps) {
  const listEndRef = useRef<HTMLDivElement>(null);

  const statusLabel = statusLabels?.[status] ?? STATUS_LABEL[status];
  const showChoices = choices.length > 0 && onChoice && status === 'idle';

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status, liveTranscript, choices, pendingVoiceText, exampleHint]);

  return (
    <div className="voice-conversation">
      {status !== 'idle' && (
        <div className="voice-conversation__status" data-status={status}>
          <span className="voice-conversation__status-dot" aria-hidden="true" />
          <span>{statusLabel}</span>
        </div>
      )}

      <div className="voice-conversation__messages">
        <div className="voice-conversation__chat-log">
          {messages.length === 0 && status !== 'listening' && !pendingVoiceText && (
            <div className="voice-chat__group voice-chat__group--bot">
              <p className="voice-chat__speaker">{assistantName}</p>
              <div className="voice-chat__bubble voice-chat__bubble--bot">
                <MessageLines text={defaultBotText} />
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`voice-chat__group voice-chat__group--${msg.role}`}>
              <p className={`voice-chat__speaker voice-chat__speaker--${msg.role}`}>
                {msg.role === 'bot' ? assistantName : '나'}
              </p>
              <div className={`voice-chat__bubble voice-chat__bubble--${msg.role}`}>
                <MessageLines text={msg.text} />
              </div>
              <time className="voice-chat__time">{msg.time}</time>
            </div>
          ))}

          {status === 'listening' && (
            <div className="voice-chat__group voice-chat__group--user voice-chat__group--live">
              <p className="voice-chat__speaker voice-chat__speaker--user">나</p>
              <div className="voice-chat__bubble voice-chat__bubble--user voice-chat__bubble--live">
                {liveTranscript || '...'}
              </div>
              <div className="voice-conversation__wave" aria-hidden="true">
                <span /><span /><span /><span /><span />
              </div>
            </div>
          )}

          {pendingVoiceText && status !== 'listening' && (
            <div className="voice-chat__group voice-chat__group--user">
              <p className="voice-chat__speaker voice-chat__speaker--user">나</p>
              <div className="voice-chat__bubble voice-chat__bubble--user">
                {pendingVoiceText}
              </div>
              <p className="voice-chat__confirm-hint">이 답변이 맞나요?</p>
            </div>
          )}

          {status === 'processing' && (
            <div className="voice-chat__group voice-chat__group--bot">
              <p className="voice-chat__speaker">{assistantName}</p>
              <div className="voice-chat__bubble voice-chat__bubble--bot voice-chat__bubble--typing">
                <span className="voice-chat__typing-dot" />
                <span className="voice-chat__typing-dot" />
                <span className="voice-chat__typing-dot" />
              </div>
            </div>
          )}

          <div ref={listEndRef} />
        </div>
      </div>

      {showChoices && (
        <div className="voice-conversation__choices">
          {choices.map((choice) => (
            <button
              key={choice.value}
              type="button"
              className="voice-conversation__choice"
              onClick={() => onChoice(choice)}
            >
              {choice.label}
            </button>
          ))}
        </div>
      )}

      {exampleHint && status === 'idle' && !pendingVoiceText && (
        <p className="voice-conversation__example-hint">{exampleHint}</p>
      )}

      {inlineAction && <div className="voice-conversation__inline-action">{inlineAction}</div>}
    </div>
  );
}
