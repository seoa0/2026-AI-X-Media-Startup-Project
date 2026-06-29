import Button from '../button/Button';
import './ConfirmModal.css';

interface ConfirmModalProps {
  open: boolean;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  message,
  confirmLabel = '삭제',
  cancelLabel = '취소',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="confirm-modal" role="presentation" onClick={onCancel}>
      <div
        className="confirm-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-message"
        onClick={(e) => e.stopPropagation()}
      >
        <p id="confirm-modal-message" className="confirm-modal__message">
          {message}
        </p>
        <div className="confirm-modal__actions">
          <Button variant="white" layout="inline" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant="primary" layout="inline" onClick={onConfirm} disabled={loading}>
            {loading ? '삭제 중...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
