import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatPageHeader from '../../shared/components/header/ChatPageHeader';
import SegmentToggle from '../../shared/components/toggle/SegmentToggle';
import {
  FONT_SIZE_OPTIONS,
  getFontSize,
  setFontSize,
  type FontSize,
} from '../../shared/utils/fontSizeStorage';
import './FontSizeSettings.css';

const PREVIEW_TEXT = {
  title: '나만의 노래 제작',
  body: '안녕하세요! 저는 나도 가수다 AI 뮤직 메이트입니다. 고객님만의 음악을 위해 몇 가지 여쭤볼게요.',
  caption: '마이크를 눌러 말씀해 주세요',
};

export default function FontSizeSettings() {
  const navigate = useNavigate();
  const [size, setSize] = useState<FontSize>(getFontSize());

  const handleChange = (next: FontSize) => {
    setSize(next);
    setFontSize(next);
  };

  return (
    <div className="font-size-settings">
      <ChatPageHeader title="폰트 크기" subtitle="설정" onBack={() => navigate('/my')} />

      <main className="font-size-settings__main">
        <section className="font-size-settings__section">
          <h2 className="font-size-settings__label">글자 크기</h2>
          <SegmentToggle
            options={FONT_SIZE_OPTIONS}
            value={size}
            onChange={handleChange}
            variant="light"
            layout="full"
          />
        </section>

        <section className="font-size-settings__preview" aria-label="미리보기">
          <p className="font-size-settings__preview-caption">{PREVIEW_TEXT.caption}</p>
          <div className="font-size-settings__preview-card">
            <p className="font-size-settings__preview-title">{PREVIEW_TEXT.title}</p>
            <p className="font-size-settings__preview-body">{PREVIEW_TEXT.body}</p>
          </div>
        </section>
      </main>
    </div>
  );
}
