import type { PackageCardData } from '../components/package/PackageCard';
import { getPackageImage } from '../assets/packageImages';

function withPackageImage(pkg: PackageCardData): PackageCardData {
  return { ...pkg, image: getPackageImage(pkg.id) };
}

export const PACKAGES: PackageCardData[] = [
  withPackageImage({
    id: 'cheap',
    badge: '인기',
    title: '입문 패키지',
    description: '첫 곡 제작에 딱 맞는 합리적인 패키지. AI 보컬과 기본 믹싱까지 한 번에.',
    footer: '월 49,900원부터 · 신규 20% 할인',
  }),
  withPackageImage({
    id: 'duet',
    title: '커플 패키지',
    description: '친구와 함께 듀엣 트랙 제작. 각자 보컬을 합쳐 하나의 완성곡으로.',
    footer: '2인 동시 제작 · 공유 링크 제공',
  }),
  withPackageImage({
    id: 'idol',
    badge: 'NEW',
    title: '케이팝 패키지',
    description: '나도 아이돌! 보컬, 코러스, 댄스비트까지 K-POP 스타일로 완성.',
    footer: '아이돌st 굿즈 제작 지원',
  }),
  withPackageImage({
    id: 'special',
    badge: '프리미엄',
    title: '올인원 패키지',
    description: '맞춤 보컬 톤과 고급 믹싱·마스터링. 완성도 높은 트랙을 무제한으로 생성 가능.',
    footer: '전문가 1:1 피드백 포함',
  }),
];

export const ALL_PACKAGES = PACKAGES;

/** @deprecated PACKAGES 사용 */
export const RECOMMENDED_PACKAGES = PACKAGES;
/** @deprecated PACKAGES 사용 */
export const SPECIAL_PACKAGES: PackageCardData[] = [];

export function getPackageById(id: string) {
  return ALL_PACKAGES.find((pkg) => pkg.id === id);
}
