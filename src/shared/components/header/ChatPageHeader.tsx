import { logoImage } from '../../assets';
import { APP_NAME } from '../../constants/brand';
import './ChatPageHeader.css';

interface ChatPageHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}

export default function ChatPageHeader({ title, subtitle, onBack }: ChatPageHeaderProps) {
  return (
    <header className="chat-page-header">
      {onBack && (
        <button type="button" className="chat-page-header__back" onClick={onBack} aria-label="뒤로 가기">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
      <div className="chat-page-header__body">
        <div className="chat-page-header__text">
          <h1 className="chat-page-header__title">{title}</h1>
          {subtitle && <p className="chat-page-header__subtitle">{subtitle}</p>}
        </div>
        <img src={logoImage} alt={APP_NAME} className="chat-page-header__logo" />
      </div>
    </header>
  );
}
