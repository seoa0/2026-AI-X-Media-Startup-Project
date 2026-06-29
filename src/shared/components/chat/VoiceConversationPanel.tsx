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
}

const STATUS_LABEL: Record<VoiceSessionStatus, string> = {
  idle: '마이크를 눌러 말씀해 주세요',
  listening: '듣고 있어요...',
  processing: '답변을 작성하고 있어요...',
};

export default function VoiceConversationPanel({
  messages,
  status,
  liveTranscript = '',
  choices = [],
  onChoice,
  inlineAction,
  defaultBotText = '안녕하세요! 어떤 곡을 만들고 싶으신지 말씀해 주세요.',
}: VoiceConversationPanelProps) {
  const listEndRef = useRef<HTMLDivElement>(null);
  const lastBot = [...messages].reverse().find((m) => m.role === 'bot');

  const displayText =
    status === 'listening' && liveTranscript
      ? liveTranscript
      : lastBot?.text ?? defaultBotText;

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status, liveTranscript, choices]);

  return (
    <div className="voice-conversation">
      <div className="voice-conversation__status" data-status={status}>
        <span className="voice-conversation__status-dot" aria-hidden="true" />
        <span>{STATUS_LABEL[status]}</span>
      </div>

      <div className="voice-conversation__current">
        <p className="voice-conversation__current-label">
          {status === 'listening' ? '나' : 'AI 뮤직 메이트'}
        </p>
        <p className="voice-conversation__current-text">{displayText}</p>
        {status === 'listening' && (
          <div className="voice-conversation__wave" aria-hidden="true">
            <span /><span /><span /><span /><span />
          </div>
        )}
      </div>

      {choices.length > 0 && onChoice && status === 'idle' && (
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

      {inlineAction && <div className="voice-conversation__inline-action">{inlineAction}</div>}

      {messages.length > 0 && (
        <div className="voice-conversation__history">
          <p className="voice-conversation__history-title">대화 기록</p>
          <div className="voice-conversation__chat-log">
            {messages.map((msg) => (
              <div key={msg.id} className={`voice-chat__group voice-chat__group--${msg.role}`}>
                <div className={`voice-chat__bubble voice-chat__bubble--${msg.role}`}>
                  {msg.text.split('\n').map((line, i, arr) => (
                    <span key={i}>
                      {line}
                      {i < arr.length - 1 && <br />}
                    </span>
                  ))}
                </div>
                <time className="voice-chat__time">{msg.time}</time>
              </div>
            ))}
            <div ref={listEndRef} />
          </div>
        </div>
      )}
    </div>
  );
}
