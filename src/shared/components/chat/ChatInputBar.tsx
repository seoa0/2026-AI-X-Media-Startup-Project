import type { FormEvent } from 'react';
import './ChatInputBar.css';

interface ChatInputBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  placeholder?: string;
}

export default function ChatInputBar({
  value,
  onChange,
  onSubmit,
  placeholder = '메세지를 입력해주세요.',
}: ChatInputBarProps) {
  return (
    <form className="chat-input-bar" onSubmit={onSubmit}>
      <input
        type="text"
        className="chat-input-bar__field chat-input-bar__field--single"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <button type="submit" className="chat-input-bar__submit" aria-label="보내기">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M5 12h14M13 6l6 6-6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </form>
  );
}
