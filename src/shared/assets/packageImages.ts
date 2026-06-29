const packageImageModules = import.meta.glob<string>('./images/packages/package_*.png', {
  eager: true,
  import: 'default',
});

/** images/packages/package_{id}.png (예: package_cheap.png) */
export function getPackageImage(packageId: string): string | undefined {
  return packageImageModules[`./images/packages/package_${packageId}.png`];
}
