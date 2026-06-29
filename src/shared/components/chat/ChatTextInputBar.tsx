import './ChatTextInputBar.css';

interface ChatTextInputBarProps {
  placeholder?: string;
  submitLabel?: string;
  onSubmit: (text: string) => void;
  onCancel?: () => void;
}

export default function ChatTextInputBar({
  placeholder = '내용을 입력해 주세요',
  submitLabel = '보내기',
  onSubmit,
  onCancel,
}: ChatTextInputBarProps) {
  return (
    <form
      className="chat-text-input-bar"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const input = form.elements.namedItem('text') as HTMLTextAreaElement;
        const value = input.value.trim();
        if (!value) return;
        onSubmit(value);
        input.value = '';
      }}
    >
      <textarea
        name="text"
        className="chat-text-input-bar__field"
        placeholder={placeholder}
        rows={3}
      />
      <div className="chat-text-input-bar__actions">
        {onCancel && (
          <button type="button" className="chat-text-input-bar__cancel" onClick={onCancel}>
            취소
          </button>
        )}
        <button type="submit" className="chat-text-input-bar__submit">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
