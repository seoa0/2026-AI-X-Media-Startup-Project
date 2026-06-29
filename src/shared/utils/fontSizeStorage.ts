export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';

const STORAGE_KEY = 'nado-gasuda-font-size';
const DEFAULT: FontSize = 'medium';

const SCALE: Record<FontSize, number> = {
  small: 0.875,
  medium: 1,
  large: 1.125,
  xlarge: 1.25,
};

export const FONT_SIZE_OPTIONS: { value: FontSize; label: string }[] = [
  { value: 'small', label: '작게' },
  { value: 'medium', label: '보통' },
  { value: 'large', label: '크게' },
  { value: 'xlarge', label: '아주 크게' },
];

export function getFontSize(): FontSize {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'small' || raw === 'medium' || raw === 'large' || raw === 'xlarge') return raw;
  } catch {
    // ignore
  }
  return DEFAULT;
}

export function setFontSize(size: FontSize) {
  localStorage.setItem(STORAGE_KEY, size);
  applyFontSize(size);
}

export function applyFontSize(size: FontSize = getFontSize()) {
  document.documentElement.dataset.fontSize = size;
  document.documentElement.style.setProperty('--font-scale', String(SCALE[size]));
}
