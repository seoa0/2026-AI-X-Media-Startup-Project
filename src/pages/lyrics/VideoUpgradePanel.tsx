import CharacterChatLayout from '../../shared/components/chat/CharacterChatLayout';
import BottomNav from '../../shared/components/nav/BottomNav';
import { VIDEO_UPGRADE_INTRO, VIDEO_UPGRADE_PAYWALL_MESSAGE } from '../../shared/constants/lyricsFlow';
import type { VideoTier } from '../../shared/types/song';
import './VideoUpgradePanel.css';

interface VideoUpgradePanelProps {
  title: string;
  subtitle: string;
  onBack: () => void;
  onSelect: (tier: VideoTier) => void;
  submitting?: boolean;
}

export default function VideoUpgradePanel({
  title,
  subtitle,
  onBack,
  onSelect,
  submitting = false,
}: VideoUpgradePanelProps) {
  const handleSelect = (tier: VideoTier) => {
    if (submitting) return;
    if (tier === 'premium') {
      alert(VIDEO_UPGRADE_PAYWALL_MESSAGE);
    }
    onSelect(tier);
  };

  return (
    <CharacterChatLayout
      title={title}
      subtitle={subtitle}
      onBack={onBack}
      footer={
        <div className="video-upgrade__footer">
          <div className="video-upgrade__cards">
            <button
              type="button"
              className="video-upgrade__card"
              disabled={submitting}
              onClick={() => handleSelect('lyric')}
            >
              <h3>리릭 비디오</h3>
              <p>가사가 흐르는 기본 영상</p>
              <span className="video-upgrade__price">무료</span>
            </button>
            <button
              type="button"
              className="video-upgrade__card video-upgrade__card--premium"
              disabled={submitting}
              onClick={() => handleSelect('premium')}
            >
              <h3>고퀄 영상</h3>
              <p>고화질 뮤직비디오</p>
              <span className="video-upgrade__price">유료</span>
            </button>
          </div>
        </div>
      }
      showBottomNav
      bottomNav={<BottomNav />}
    >
      <div className="video-upgrade__intro">
        <p className="video-upgrade__intro-text">{VIDEO_UPGRADE_INTRO}</p>
      </div>
    </CharacterChatLayout>
  );
}
