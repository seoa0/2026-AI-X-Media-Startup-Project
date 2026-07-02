import { useMemo, useState } from 'react';
import { SIGNUP_CONSENT_ITEMS } from '../../constants/signupConsents';
import type { ConsentItem } from '../../constants/signupConsents';
import type { ConsentKey, SignupConsents } from '../../types/consent';
import { areRequiredConsentsChecked } from '../../types/consent';
import ConsentDetailSheet from './ConsentDetailSheet';
import './SignupConsentFields.css';

interface SignupConsentFieldsProps {
  consents: SignupConsents;
  onChange: (consents: SignupConsents) => void;
}

const ALL_KEYS: ConsentKey[] = ['terms', 'privacy', 'aiVoice', 'copyright', 'marketing'];

export default function SignupConsentFields({ consents, onChange }: SignupConsentFieldsProps) {
  const [detailItem, setDetailItem] = useState<ConsentItem | null>(null);

  const allChecked = useMemo(
    () => ALL_KEYS.every((key) => consents[key]),
    [consents],
  );

  const handleToggleAll = () => {
    const next = !allChecked;
    onChange({
      terms: next,
      privacy: next,
      aiVoice: next,
      copyright: next,
      marketing: next,
    });
  };

  const handleToggle = (key: ConsentKey) => {
    onChange({ ...consents, [key]: !consents[key] });
  };

  return (
    <section className="signup-consent" aria-label="서비스 이용 동의">
      <label className="signup-consent__all">
        <input
          type="checkbox"
          className="signup-consent__checkbox"
          checked={allChecked}
          onChange={handleToggleAll}
        />
        <span className="signup-consent__all-label">전체 동의</span>
      </label>

      <ul className="signup-consent__list">
        {SIGNUP_CONSENT_ITEMS.map((item) => (
          <li key={item.key} className="signup-consent__item">
            <label className="signup-consent__row">
              <input
                type="checkbox"
                className="signup-consent__checkbox"
                checked={consents[item.key]}
                onChange={() => handleToggle(item.key)}
              />
              <span className="signup-consent__label">
                {item.label}
                <span className={`signup-consent__badge${item.required ? '' : ' signup-consent__badge--optional'}`}>
                  {item.required ? '필수' : '선택'}
                </span>
              </span>
            </label>
            <button
              type="button"
              className="signup-consent__view"
              onClick={() => setDetailItem(item)}
            >
              보기
            </button>
          </li>
        ))}
      </ul>

      {!areRequiredConsentsChecked(consents) && (
        <p className="signup-consent__hint">필수 항목에 모두 동의해 주세요.</p>
      )}

      <ConsentDetailSheet item={detailItem} onClose={() => setDetailItem(null)} />
    </section>
  );
}
