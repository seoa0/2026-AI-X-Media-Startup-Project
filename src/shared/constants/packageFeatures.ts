export type StorySource = 'prologue' | 'new';

export interface PackageFeatures {
  freeLyricsRegens: number;
  productionWaitMs: number;
}

const DEFAULT_FEATURES: PackageFeatures = {
  freeLyricsRegens: 1,
  productionWaitMs: 10_000,
};

const PACKAGE_FEATURES: Record<string, PackageFeatures> = {
  cheap: {
    freeLyricsRegens: 1,
    productionWaitMs: 10_000,
  },
};

export function getPackageFeatures(packageId: string | null): PackageFeatures {
  if (!packageId) return DEFAULT_FEATURES;
  return PACKAGE_FEATURES[packageId] ?? DEFAULT_FEATURES;
}

export function canRegenerateLyrics(packageId: string | null, regenCount: number): boolean {
  const { freeLyricsRegens } = getPackageFeatures(packageId);
  return regenCount < freeLyricsRegens;
}
