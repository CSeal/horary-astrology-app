// src/hooks/withMinDuration.ts
// Pure helper: floors the perceived duration of an async operation. If `work`
// resolves (or rejects) before `minMs`, pads with a sleep so the caller's
// pending state stays true for the full window. Used by useHoraryQuery to keep
// the loading animation from flashing on fast API responses.

export async function withMinDuration<T>(
  work: Promise<T>,
  minMs: number
): Promise<T> {
  const start = Date.now();
  try {
    return await work;
  } finally {
    const remaining = minMs - (Date.now() - start);
    if (remaining > 0) {
      await new Promise<void>((resolve) => setTimeout(resolve, remaining));
    }
  }
}
