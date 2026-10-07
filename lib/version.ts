// Completed product-change batches. Increment once per shipped batch
// (not for deploy retries or version-only edits).
export const CHANGE_COUNTER = 6;

export const version = [
  Math.floor(CHANGE_COUNTER / 100),
  Math.floor(CHANGE_COUNTER / 10) % 10,
  CHANGE_COUNTER % 10,
].join(".");
