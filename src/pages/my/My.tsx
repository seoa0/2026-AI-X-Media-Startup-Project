import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../shared/apis/auth';
import { songsApi } from '../../shared/apis/songs/songsApi';
import { logoImage } from '../../shared/assets';
import BottomNav from '../../shared/components/nav/BottomNav';
import type { User } from '../../shared/types/user';
import { clearAccessToken, isLoggedIn } from '../../shared/utils/authStorage';
import './My.css';

function ChevronIcon() {
  return (
    <svg width="8" height="14" viewBox="0 0 8 14" fill="none" aria-hidden="true">
      <path
        d="M1 1l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface MenuItemProps {
  label: string;
  onClick?: () => void;
  variant?: 'default' | 'danger';
}

function MenuItem({ label, onClick, variant = 'default' }: MenuItemProps) {
  return (
    <button
      type="button"
      className={`my-menu-item${variant === 'danger' ? ' my-menu-item--danger' : ''}`}
      onClick={onClick}
    >
      <span>{label}</span>
      <ChevronIcon />
    </button>
  );
}

function formatStreaming(count: number) {
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(count);
}

function MyFooter() {
  return (
    <footer className="my__footer">
      <img src={logoImage} alt="나는 가수다" className="my__footer-logo" />
      <p className="my__footer-meta">v1.0.0 · © 2026 NadoGasuda Inc.</p>
    </footer>
  );
}

function MyGuestView() {
  const navigate = useNavigate();

  const requireLogin = () => navigate('/login');

  return (
    <>
      <header className="my__hero">
        <button type="button" className="my__auth-link" onClick={() => navigate('/login')}>
          로그인
        </button>
        <button type="button" className="my__auth-link" onClick={() => navigate('/signup')}>
          회원가입
        </button>
      </header>

      <div className="my__body">
        <section className="my__menu-section">
          <h2 className="my__menu-heading">설정</h2>
          <div className="my__menu-list">
            <MenuItem label="프로필 수정" onClick={requireLogin} />
            <MenuItem label="결제 내역" onClick={requireLogin} />
            <MenuItem label="고객 지원" onClick={requireLogin} />
          </div>
        </section>

        <MyFooter />
      </div>
    </>
  );
}

interface MyMemberViewProps {
  user: User;
  inProgressCount: number;
  onLogout: () => void;
}

function MyMemberView({ user, inProgressCount, onLogout }: MyMemberViewProps) {
  const navigate = useNavigate();

  return (
    <>
      <header className="my__hero">
        <h1 className="my__user-name">{user.name}</h1>
      </header>

      <div className="my__body">
        <div className="my__stats">
          <div className="my__stat">
            <span className="my__stat-label">진행중 프로젝트</span>
            <span className="my__stat-value">{inProgressCount}</span>
          </div>
          <div className="my__stat-divider" aria-hidden="true" />
          <div className="my__stat">
            <span className="my__stat-label">스트리밍</span>
            <span className="my__stat-value">{formatStreaming(0)}</span>
          </div>
        </div>

        <section className="my__menu-section">
          <h2 className="my__menu-heading">나의 음악 정보</h2>
          <p className="my__menu-sub">제작·발매·수익 한 눈에</p>
          <div className="my__menu-list">
            <MenuItem label="제작 진행 현황" onClick={() => navigate('/home')} />
            <MenuItem label="발매 음원 관리" onClick={() => navigate('/home')} />
            <MenuItem label="수익 정산" onClick={() => navigate('/home')} />
            <MenuItem label="제작 문의하기" onClick={() => navigate('/home')} />
          </div>
        </section>

        <section className="my__menu-section">
          <h2 className="my__menu-heading">설정</h2>
          <div className="my__menu-list">
            <MenuItem label="프로필 수정" onClick={() => navigate('/home')} />
            <MenuItem label="결제 내역" onClick={() => navigate('/home')} />
            <MenuItem label="고객 지원" onClick={() => navigate('/home')} />
            <MenuItem label="로그아웃" onClick={onLogout} variant="danger" />
          </div>
        </section>

        <MyFooter />
      </div>
    </>
  );
}

export default function My() {
  const navigate = useNavigate();
  const loggedIn = isLoggedIn();
  const [user, setUser] = useState<User | null>(null);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [loading, setLoading] = useState(loggedIn);

  useEffect(() => {
    if (!loggedIn) return;

    Promise.all([authApi.me(), songsApi.list('in_progress')])
      .then(([meRes, songsRes]) => {
        setUser(meRes.data.user);
        setInProgressCount(songsRes.data.songs.length);
      })
      .catch(async () => {
        await authApi.logout();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [loggedIn]);

  const handleLogout = async () => {
    await authApi.logout();
    clearAccessToken();
    setUser(null);
    navigate('/my', { replace: true });
  };

  return (
    <div className="my">
      <div className="my__scroll">
        {!loggedIn || !user ? (
          loading ? (
            <p className="my__loading">불러오는 중...</p>
          ) : (
            <MyGuestView />
          )
        ) : (
          <MyMemberView
            user={user}
            inProgressCount={inProgressCount}
            onLogout={handleLogout}
          />
        )}
      </div>

      <BottomNav />
    </div>
  );
}
