import { useEffect, useRef, useState } from 'react';
import banner1 from '../../assets/images/banner/banner1.png';
import banner2 from '../../assets/images/banner/banner2.png';
import banner3 from '../../assets/images/banner/banner3.png';
import banner4 from '../../assets/images/banner/banner4.png';
import './BannerCarousel.css';

const BANNERS = [banner1, banner2, banner3, banner4];
const INTERVAL_MS = 3000;
const BANNER_GAP = 12;
const BANNER_INSET = 20;

export default function BannerCarousel() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [slideWidth, setSlideWidth] = useState(0);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const update = () => {
      setSlideWidth(viewport.offsetWidth - BANNER_INSET * 2);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % BANNERS.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  const step = slideWidth + BANNER_GAP;

  return (
    <div className="banner-carousel">
      <div ref={viewportRef} className="banner-carousel__viewport">
        <div
          className="banner-carousel__track"
          style={{
            transform: step ? `translateX(-${current * step}px)` : undefined,
          }}
        >
          {BANNERS.map((src, index) => (
            <div
              key={index}
              className="banner-carousel__slide"
              style={{ width: slideWidth || undefined }}
            >
              <img
                className="banner-carousel__image"
                src={src}
                alt={`배너 ${index + 1}`}
                width={2000}
                height={1064}
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="banner-carousel__dots">
        {BANNERS.map((_, index) => (
          <button
            key={index}
            type="button"
            className={`banner-carousel__dot${current === index ? ' banner-carousel__dot--active' : ''}`}
            onClick={() => setCurrent(index)}
            aria-label={`${index + 1}번째 배너`}
            aria-current={current === index ? 'true' : undefined}
          />
        ))}
      </div>
    </div>
  );
}
