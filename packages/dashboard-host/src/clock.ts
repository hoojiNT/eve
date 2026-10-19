/** Floor `nowMs` to the start of its `bucketMs` window. */
export function truncateToBucket(nowMs: number, bucketMs: number): number {
  return Math.floor(nowMs / bucketMs) * bucketMs;
}

/** Milliseconds until the next bucket boundary. Exact boundaries wait a full bucket. */
export function delayUntilNextBucket(nowMs: number, bucketMs: number): number {
  return truncateToBucket(nowMs, bucketMs) + bucketMs - nowMs;
}
