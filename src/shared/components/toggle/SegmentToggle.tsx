import './SegmentToggle.css';

interface SegmentToggleProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  variant?: 'dark' | 'light';
  layout?: 'inline' | 'full';
}

export default function SegmentToggle<T extends string>({
  options,
  value,
  onChange,
  variant = 'dark',
  layout = 'inline',
}: SegmentToggleProps<T>) {
  return (
    <div
      className={`segment-toggle segment-toggle--${variant} segment-toggle--${layout}`}
      role="tablist"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          className={`segment-toggle__item${value === option.value ? ' segment-toggle__item--active' : ''}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
