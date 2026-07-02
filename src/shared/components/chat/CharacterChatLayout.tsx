import { useState, type ReactNode } from 'react';
import type { CharacterMotionMode } from '../../assets/characterMotion';
import AnimatedCharacter from './AnimatedCharacter';
import ChatPageHeader from '../header/ChatPageHeader';
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
  characterMotion?: CharacterMotionMode;
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
  characterMotion = 'idle',
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
      <ChatPageHeader title={title} subtitle={subtitle} onBack={onBack} />

      <div className="character-chat__main" onClick={handleMainTap}>
        <div className="character-chat__character-wrap">
          <AnimatedCharacter mode={characterMotion} className="character-chat__character" />
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
