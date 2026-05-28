// src/hooks/__tests__/withMinDuration.test.ts
// Validates that the loading-floor helper extends fast resolutions/rejections
// up to the minimum duration without delaying slow ones.

import { withMinDuration } from '../withMinDuration';

describe('withMinDuration', () => {
  it('extends a fast resolution up to the minimum duration', async () => {
    const start = Date.now();
    const value = await withMinDuration(Promise.resolve('ok'), 200);
    const elapsed = Date.now() - start;

    expect(value).toBe('ok');
    expect(elapsed).toBeGreaterThanOrEqual(195); // small jitter tolerance
  });

  it('does not delay a resolution slower than the minimum', async () => {
    const slow = new Promise<string>((resolve) =>
      setTimeout(() => resolve('slow'), 250)
    );
    const start = Date.now();
    const value = await withMinDuration(slow, 100);
    const elapsed = Date.now() - start;

    expect(value).toBe('slow');
    expect(elapsed).toBeGreaterThanOrEqual(245);
    expect(elapsed).toBeLessThan(350); // sanity: no extra padding applied
  });

  it('still floors errors so they do not flash', async () => {
    const start = Date.now();
    await expect(
      withMinDuration(Promise.reject(new Error('boom')), 200)
    ).rejects.toThrow('boom');
    const elapsed = Date.now() - start;

    expect(elapsed).toBeGreaterThanOrEqual(195);
  });
});
