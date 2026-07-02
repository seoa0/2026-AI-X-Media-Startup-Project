import Button from '../button/Button';
import type { ConsentItem } from '../../constants/signupConsents';
import './ConsentDetailSheet.css';

interface ConsentDetailSheetProps {
  item: ConsentItem | null;
  onClose: () => void;
}

export default function ConsentDetailSheet({ item, onClose }: ConsentDetailSheetProps) {
  if (!item) return null;

  return (
    <div className="consent-sheet-overlay" onClick={onClose} role="presentation">
      <div
        className="consent-sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="consent-sheet-title"
      >
        <h2 id="consent-sheet-title" className="consent-sheet__title">
          {item.title}
        </h2>
        <div className="consent-sheet__body">
          <pre className="consent-sheet__content">{item.content}</pre>
        </div>
        <Button variant="primary" layout="full" onClick={onClose}>
          확인
        </Button>
      </div>
    </div>
  );
}
