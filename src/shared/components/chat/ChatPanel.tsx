import type { FormEvent, ReactNode, RefObject } from 'react';
import type { ChatChoice, ChatMessage } from '../../types/chat';
import ChatInputBar from './ChatInputBar';
import './ChatPanel.css';

interface ChatPanelProps {
  messages: ChatMessage[];
  choices?: ChatChoice[];
  onChoice?: (choice: ChatChoice) => void;
  inputValue?: string;
  onInputChange?: (value: string) => void;
  onSubmit?: (e: FormEvent) => void;
  inputPlaceholder?: string;
  showInput?: boolean;
  inlineAction?: ReactNode;
  messagesEndRef?: RefObject<HTMLDivElement | null>;
}

export default function ChatPanel({
  messages,
  choices = [],
  onChoice,
  inputValue = '',
  onInputChange,
  onSubmit,
  inputPlaceholder = '메세지를 입력해주세요.',
  showInput = true,
  inlineAction,
  messagesEndRef,
}: ChatPanelProps) {
  return (
    <div className="chat-panel">
      <div className="chat-panel__messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-panel__group chat-panel__group--${msg.role}`}>
            <div className={`chat-panel__bubble chat-panel__bubble--${msg.role}`}>
              {msg.text.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  {i < msg.text.split('\n').length - 1 && <br />}
                </span>
              ))}
            </div>
            <time className="chat-panel__time">{msg.time}</time>
          </div>
        ))}

        {choices.length > 0 && onChoice && (
          <div className="chat-panel__choices">
            {choices.map((choice) => (
              <button
                key={choice.value}
                type="button"
                className="chat-panel__choice"
                onClick={() => onChoice(choice)}
              >
                {choice.label}
              </button>
            ))}
          </div>
        )}

        {inlineAction && <div className="chat-panel__inline-action">{inlineAction}</div>}

        <div ref={messagesEndRef} />
      </div>

      {showInput && onSubmit && onInputChange && (
        <div className="chat-panel__input-area">
          <ChatInputBar
            value={inputValue}
            onChange={onInputChange}
            onSubmit={onSubmit}
            placeholder={inputPlaceholder}
          />
        </div>
      )}
    </div>
  );
}
