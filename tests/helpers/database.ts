import { randomUUID } from "node:crypto";

export function uniqueTestUser(prefix = "test") {
  const id = randomUUID();
  return { id, email: `${prefix}-${id}@example.test`, name: `Test User ${id.slice(0, 8)}` };
}

export function parallelSafeId(prefix: string) {
  return `${prefix}-${process.pid}-${Date.now()}-${randomUUID()}`;
}

export function assertTestOwnerCleanup(ownerId: string, deletedOwnerId: string) {
  if (ownerId !== deletedOwnerId) throw new Error("cleanup attempted to affect a different test owner");
}
