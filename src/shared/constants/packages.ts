import type { PackageCardData } from '../components/package/PackageCard';
import { getPackageImage } from '../assets/packageImages';

function withPackageImage(pkg: PackageCardData): PackageCardData {
  return { ...pkg, image: getPackageImage(pkg.id) };
}

export const PACKAGES: PackageCardData[] = [
  withPackageImage({
    id: 'idol',
    badge: 'NEW',
    title: '케이팝 패키지',
    description: '케이팝 장르 특화 시스템',
    footer: 'K-POP 스타일 완성',
  }),
  withPackageImage({
    id: 'cheap',
    badge: '현재 무료!',
    title: '입문 패키지',
    description: '노래 2분~ + 리릭비디오 제공',
    footer: '첫 곡 제작 추천',
  }),
  withPackageImage({
    id: 'special',
    badge: '프리미엄',
    title: '프리미엄 패키지',
    description: '노래 3분 + 프리미엄 뮤비 제공'+'\n'+'(+ 추가 수정 가능)',
    footer: '최고 퀄리티 완성곡',
  }),
  withPackageImage({
    id: 'duet',
    title: '듀엣 패키지',
    description: '음성 2개 사용 가능',
    footer: '2인 보컬 듀엣 제작',
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
