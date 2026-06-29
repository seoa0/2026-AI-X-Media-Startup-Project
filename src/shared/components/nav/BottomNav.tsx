import { useLocation, useNavigate } from 'react-router-dom';
import { navCreateIcon, navHomeIcon, navMyIcon } from '../../assets/icons';
import { isLoggedIn } from '../../utils/authStorage';
import { isIntroChatComplete } from '../../utils/onboardingStorage';
import './BottomNav.css';

export type NavItem = 'home' | 'create' | 'my';

const NAV_ITEMS: { id: NavItem; label: string; path: string; icon: string }[] = [
  { id: 'home', label: '홈', path: '/home', icon: navHomeIcon },
  { id: 'create', label: '제작', path: '/create', icon: navCreateIcon },
  { id: 'my', label: '마이', path: '/my', icon: navMyIcon },
];

function getActiveItem(pathname: string): NavItem {
  if (pathname.startsWith('/create')) return 'create';
  if (pathname.startsWith('/my')) return 'my';
  return 'home';
}

function getCreatePath() {
  if (!isLoggedIn()) return '/login';
  if (!isIntroChatComplete()) return '/onboarding/chat';
  return '/packages';
}

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const active = getActiveItem(pathname);

  const handleNav = (item: NavItem, path: string) => {
    if (item === 'create') {
      navigate(getCreatePath());
      return;
    }
    navigate(path);
  };

  return (
    <nav className="bottom-nav" aria-label="하단 메뉴">
      <div className="bottom-nav__inner">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`bottom-nav__item${active === item.id ? ' bottom-nav__item--active' : ''}`}
            onClick={() => handleNav(item.id, item.path)}
            aria-current={active === item.id ? 'page' : undefined}
          >
            <img src={item.icon} alt="" className="bottom-nav__icon" width={22} height={22} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
