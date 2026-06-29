const PACKAGES: Record<string, { title: string }> = {
  value: { title: '가성비 세트' },
  unlimited: { title: '무제한' },
  expert: { title: '정밀 전문가' },
  idol: { title: '아이돌 패키지' },
  special: { title: '스페셜' },
  'release-all': { title: '발매 올인원' },
  'premium-studio': { title: '프리미엄 스튜디오' },
  'custom-sound': { title: '커스텀 사운드' },
  collab: { title: '콜라보 패키지' },
};

export function getPackageById(id: string) {
  return PACKAGES[id] ?? null;
}
