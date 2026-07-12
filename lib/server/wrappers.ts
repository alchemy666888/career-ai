import { createCorrelationContext } from "@/lib/observability/correlation";
import { toSafeErrorResult } from "@/lib/observability/errors";
import { logEvent } from "@/lib/observability/logger";
import { withObservedSpan } from "@/lib/observability/tracing";

export function observedServerAction<TArgs extends unknown[], TResult>(operation: string, action: (...args: TArgs) => Promise<TResult>) {
  return async (...args: TArgs) => {
    const correlation = createCorrelationContext();
    try {
      return await withObservedSpan(operation, () => action(...args), correlation);
    } catch (error) {
      logEvent({ severity: "error", event: "server_action_failed", operation, correlationId: correlation.correlationId, error });
      return toSafeErrorResult(error, correlation);
    }
  };
}

export function observedRouteHandler(handler: (request: Request) => Promise<Response>) {
  return async (request: Request) => {
    const correlation = createCorrelationContext({ correlationId: request.headers.get("x-correlation-id") ?? undefined });
    try {
      return await withObservedSpan("route.handler", () => handler(request), correlation);
    } catch (error) {
      logEvent({ severity: "error", event: "route_handler_failed", correlationId: correlation.correlationId, error });
      return Response.json(toSafeErrorResult(error, correlation), { status: 500, headers: { "x-correlation-id": correlation.correlationId } });
    }
  };
}
