export type OwnerScope = { userId: string };
export type PageRequest = { limit?: number; cursor?: string };
export type Page<T> = { items: T[]; nextCursor?: string };

export function boundedLimit(limit = 20, max = 100) {
  return Math.min(Math.max(limit, 1), max);
}
