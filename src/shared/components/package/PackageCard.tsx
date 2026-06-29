import './PackageCard.css';

export interface PackageCardData {
  id: string;
  badge?: string;
  title: string;
  description: string;
  footer?: string;
  image?: string;
  imageGradient: string;
}

interface PackageCardProps {
  data: PackageCardData;
  onClick?: () => void;
}

export default function PackageCard({ data, onClick }: PackageCardProps) {
  return (
    <article className="package-card" onClick={onClick} role={onClick ? 'button' : undefined}>
      <div className="package-card__body">
        {data.badge && <span className="package-card__badge">{data.badge}</span>}
        <h3 className="package-card__title">{data.title}</h3>
        <p className="package-card__desc">{data.description}</p>
        {data.footer && <p className="package-card__footer">{data.footer}</p>}
      </div>
      <div
        className="package-card__visual"
        style={{ background: data.imageGradient }}
        aria-hidden="true"
      >
        {data.image && (
          <img
            className="package-card__visual-img"
            src={data.image}
            alt=""
            draggable={false}
          />
        )}
      </div>
    </article>
  );
}
