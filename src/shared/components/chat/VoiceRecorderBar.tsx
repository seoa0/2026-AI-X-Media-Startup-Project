import './VoiceRecorderBar.css';

interface VoiceRecorderBarProps {
  status: 'idle' | 'listening' | 'processing';
  disabled?: boolean;
  onToggleRecord: () => void;
  showMic?: boolean;
}

export default function VoiceRecorderBar({
  status,
  disabled = false,
  onToggleRecord,
  showMic = true,
}: VoiceRecorderBarProps) {
  const isListening = status === 'listening';
  const isBusy = status === 'processing' || disabled;

  if (!showMic) return null;

  return (
    <div className="voice-recorder-bar">
      <p className="voice-recorder-bar__hint">
        {isListening ? '말씀이 끝나면 마이크를 다시 눌러주세요' : '마이크를 눌러 말씀해 주세요'}
      </p>
      <button
        type="button"
        className={`voice-recorder-bar__mic${isListening ? ' voice-recorder-bar__mic--active' : ''}`}
        onClick={onToggleRecord}
        disabled={isBusy}
        aria-label={isListening ? '녹음 종료' : '녹음 시작'}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          {isListening ? (
            <rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor" />
          ) : (
            <>
              <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" />
              <path
                d="M6 11a6 6 0 0012 0M12 17v4M8 21h8"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </>
          )}
        </svg>
      </button>
    </div>
  );
}
