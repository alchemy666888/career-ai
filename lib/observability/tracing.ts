import { createCorrelationContext, type CorrelationContext } from "./correlation";

export async function withObservedSpan<T>(operation: string, fn: (context: CorrelationContext) => Promise<T> | T, context = createCorrelationContext()): Promise<T> {
  const started = Date.now();
  try {
    return await fn(context);
  } finally {
    void started;
    void operation;
  }
}

export function observedAction<TArgs extends unknown[], TResult>(operation: string, action: (...args: TArgs) => Promise<TResult>) {
  return (...args: TArgs) => withObservedSpan(operation, () => action(...args));
}
