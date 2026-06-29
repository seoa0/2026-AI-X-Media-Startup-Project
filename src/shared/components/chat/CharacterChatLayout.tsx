import { useState, type ReactNode } from 'react';
import { characterImage, logoImage } from '../../assets';
import './CharacterChatLayout.css';

interface CharacterChatLayoutProps {
  className?: string;
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  children: ReactNode;
  footer?: ReactNode;
  showBottomNav?: boolean;
  bottomNav?: ReactNode;
}

export default function CharacterChatLayout({
  className = '',
  title = '나만의 노래 제작',
  subtitle = '프롤로그',
  onBack,
  children,
  footer,
  showBottomNav = false,
  bottomNav,
}: CharacterChatLayoutProps) {
  const [bottomNavVisible, setBottomNavVisible] = useState(false);

  const handleMainTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!showBottomNav) return;
    const target = e.target as HTMLElement;
    if (target.closest('button, a, input, textarea, label')) return;
    setBottomNavVisible((prev) => !prev);
  };

  return (
    <div className={`character-chat ${className}`.trim()}>
      <header className="character-chat__header">
        {onBack && (
          <button type="button" className="character-chat__back" onClick={onBack} aria-label="뒤로 가기">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <div className="character-chat__header-body">
          <div className="character-chat__header-text">
            <h1 className="character-chat__title">{title}</h1>
            <p className="character-chat__subtitle">{subtitle}</p>
          </div>
          <img src={logoImage} alt="나도 가수다" className="character-chat__logo" />
        </div>
      </header>

      <div className="character-chat__main" onClick={handleMainTap}>
        <div className="character-chat__character-wrap">
          <img src={characterImage} alt="" className="character-chat__character" draggable={false} />
        </div>

        <div className="character-chat__chat-area">
          {children}
        </div>
      </div>

      {footer && (
        <div
          className={`character-chat__bottom${
            showBottomNav && bottomNavVisible ? ' character-chat__bottom--with-nav' : ''
          }`}
        >
          <div className="character-chat__footer">{footer}</div>
        </div>
      )}

      {showBottomNav && (
        <div
          className={`character-chat__nav-overlay${
            bottomNavVisible ? ' character-chat__nav-overlay--visible' : ''
          }`}
        >
          {bottomNav}
        </div>
      )}
    </div>
  );
}
