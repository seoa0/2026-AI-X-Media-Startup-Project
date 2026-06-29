const packageImageModules = import.meta.glob<string>('./images/packages/*.png', {
  eager: true,
  import: 'default',
});

/** 패키지 id와 동일한 파일명으로 images/packages/{id}.png 추가 */
export function getPackageImage(packageId: string): string | undefined {
  return packageImageModules[`./images/packages/${packageId}.png`];
}
