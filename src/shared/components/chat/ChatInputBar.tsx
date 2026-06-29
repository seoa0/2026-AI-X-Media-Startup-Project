import type { FormEvent } from 'react';
import { messageSendIcon } from '../../assets/icons';
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
      <div className="chat-input-bar__wrap">
        <input
          type="text"
          className="chat-input-bar__field"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button type="submit" className="chat-input-bar__send" aria-label="전송">
          <img src={messageSendIcon} alt="" className="chat-input-bar__send-icon" width={18} height={18} />
        </button>
      </div>
    </form>
  );
}
