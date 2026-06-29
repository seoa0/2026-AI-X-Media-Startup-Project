export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  code = 'firestore/timeout',
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(code)), ms);
    }),
  ]);
}
