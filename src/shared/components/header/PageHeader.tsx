import './PageHeader.css';

interface PageHeaderProps {
  title: string;
  onBack: () => void;
}

export default function PageHeader({ title, onBack }: PageHeaderProps) {
  return (
    <header className="page-header">
      <button type="button" className="page-header__back" onClick={onBack} aria-label="뒤로 가기">
        <svg width="12" height="20" viewBox="0 0 12 20" fill="none" aria-hidden="true">
          <path
            d="M10 2L2 10L10 18"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <h1 className="page-header__title">{title}</h1>
    </header>
  );
}
