import './SegmentToggle.css';

interface SegmentToggleProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export default function SegmentToggle<T extends string>({
  options,
  value,
  onChange,
}: SegmentToggleProps<T>) {
  return (
    <div className="segment-toggle" role="tablist">
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
