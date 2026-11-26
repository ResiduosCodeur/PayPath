export const REVIEW_THRESHOLD = 70;

export function withReviewFlag<T extends { confidence?: unknown }>(requirement: T) {
  const { confidence } = requirement;
  return {
    ...requirement,
    needsReview: typeof confidence === "number" && confidence < REVIEW_THRESHOLD,
  };
}
