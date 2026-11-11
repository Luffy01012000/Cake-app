import { SeverityNumber } from "@opentelemetry/api-logs";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { BatchLogRecordProcessor, LoggerProvider } from "@opentelemetry/sdk-logs";

const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

if (!token && process.env.NODE_ENV !== "production") {
  console.warn(
    "NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN is configured"
  );
}

if (!host && process.env.NODE_ENV !== "production") {
  console.warn(
    "NEXT_PUBLIC_POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_HOST is configured"
  );
}

export const loggerProvider =
  token && host
    ? new LoggerProvider({
        resource: resourceFromAttributes({ "service.name": "cake-app" }),
        processors: [
          new BatchLogRecordProcessor({
            exporter: new OTLPLogExporter({
              url: `${host}/i/v1/logs`,
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              timeoutMillis: 2000,
            }),
          }),
        ],
      })
    : null;

const posthogLogger = loggerProvider?.getLogger("cake-app.posthog-logs");

export function logOrderCreationStarted() {
  posthogLogger?.emit({
    body: "order_creation_started",
    severityNumber: SeverityNumber.INFO,
    attributes: { route: "/api/orders", operation: "create_order" },
  });
}

export function logOrderCreationSucceeded() {
  posthogLogger?.emit({
    body: "order_creation_succeeded",
    severityNumber: SeverityNumber.INFO,
    attributes: { route: "/api/orders", operation: "create_order" },
  });
}

export function logOrderCreationFailed() {
  posthogLogger?.emit({
    body: "order_creation_failed",
    severityNumber: SeverityNumber.WARN,
    attributes: { route: "/api/orders", operation: "create_order" },
  });
}

export async function flushPostHogLogs() {
  await loggerProvider?.forceFlush().catch(() => {});
}

export function register() {}
