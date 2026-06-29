import type { PackageCardData } from '../components/package/PackageCard';
import { getPackageImage } from '../assets/packageImages';

function withPackageImage(pkg: PackageCardData): PackageCardData {
  return { ...pkg, image: getPackageImage(pkg.id) };
}

export const RECOMMENDED_PACKAGES: PackageCardData[] = [
  withPackageImage({
    id: 'value',
    badge: '인기',
    title: '가성비 세트',
    description: '첫 곡 제작에 딱 맞는 합리적인 패키지. AI 보컬 + 기본 믹싱까지 한 번에.',
    footer: '월 9,900원부터 · 신규 20% 할인',
    imageGradient: 'linear-gradient(135deg, #3d2b6e 0%, #8b6fd4 50%, #c4a8f0 100%)',
  }),
  withPackageImage({
    id: 'unlimited',
    title: '무제한',
    description: '제작 횟수 걱정 없이 원하는 만큼. 아이디어가 떠오를 때마다 바로 만들어보세요.',
    footer: '월 정액 · 무제한 생성',
    imageGradient: 'linear-gradient(135deg, #1a3a5c 0%, #4a90c8 50%, #7ec8e8 100%)',
  }),
  withPackageImage({
    id: 'expert',
    title: '정밀 전문가',
    description: '프로 믹싱·마스터링까지. 세밀한 사운드 조율로 완성도 높은 트랙을 만듭니다.',
    footer: '전문가 1:1 피드백 포함',
    imageGradient: 'linear-gradient(135deg, #2a1f3d 0%, #5c4a7a 50%, #9a8ab8 100%)',
  }),
  withPackageImage({
    id: 'idol',
    badge: 'NEW',
    title: '아이돌 패키지',
    description: '데뷔 준비를 위한 올인원. 보컬, 코러스, 댄스비트까지 K-POP 스타일로 완성.',
    footer: '데뷔 트레이닝 가이드 제공',
    imageGradient: 'linear-gradient(135deg, #4a1540 0%, #c2185b 50%, #f48fb1 100%)',
  }),
];

export const SPECIAL_PACKAGES: PackageCardData[] = [
  withPackageImage({
    id: 'special',
    badge: '스페셜',
    title: '스페셜',
    description: '한정 기간 프리미엄 사운드. 맞춤 보컬 톤과 독점 장르 프리셋을 제공합니다.',
    footer: '한정 100명 · 선착순 마감',
    imageGradient: 'linear-gradient(135deg, #1a237e 0%, #3949ab 50%, #7986cb 100%)',
  }),
  withPackageImage({
    id: 'release-all',
    badge: '인기',
    title: '발매 올인원',
    description: '제작부터 커버 아트, 유통 등록, MV까지. 발매까지 전부 맡겨주는 원스톱 패키지.',
    footer: '발매 D-day까지 전담 매니저 배정',
    imageGradient: 'linear-gradient(135deg, #0d3b2e 0%, #1b8a6b 50%, #4dd4ac 100%)',
  }),
  withPackageImage({
    id: 'premium-studio',
    title: '프리미엄 스튜디오',
    description: '실제 스튜디오급 음질. 라이브 세션 녹음과 AI 보컬을 결합한 하이엔드 패키지.',
    footer: '스튜디오 세션 2회 포함',
    imageGradient: 'linear-gradient(135deg, #3e2723 0%, #795548 50%, #bcaaa4 100%)',
  }),
  withPackageImage({
    id: 'custom-sound',
    title: '커스텀 사운드',
    description: '나만의 보이스 DNA를 학습해 완전히 유니크한 보컬을 만들어드립니다.',
    footer: '보이스 클로닝 · 7일 제작',
    imageGradient: 'linear-gradient(135deg, #263238 0%, #546e7a 50%, #90a4ae 100%)',
  }),
  withPackageImage({
    id: 'collab',
    title: '콜라보 패키지',
    description: '친구와 함께 듀엣 트랙 제작. 각자 보컬을 합쳐 하나의 완성곡으로.',
    footer: '2인 동시 제작 · 공유 링크 제공',
    imageGradient: 'linear-gradient(135deg, #4a148c 0%, #7b1fa2 50%, #ce93d8 100%)',
  }),
];

export const ALL_PACKAGES = [...RECOMMENDED_PACKAGES, ...SPECIAL_PACKAGES];

export function getPackageById(id: string) {
  return ALL_PACKAGES.find((pkg) => pkg.id === id);
}
