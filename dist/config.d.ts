/**
 * Resolve pi-otel configuration from `.pi/settings.json` + env vars.
 *
 * Precedence: env vars (OTEL_* / PI_OTEL_*) override settings.json `otel.*`.
 */
import { DiagLogLevel } from "@opentelemetry/api";
import { type ContentCapture, type SpanNaming } from "./attrs.js";
export interface OtelConfig {
    enabled: boolean;
    endpoint: string;
    protocol: "grpc" | "http/protobuf" | "http/json";
    headers: Record<string, string>;
    serviceName: string;
    captureContent: ContentCapture;
    spanNaming: SpanNaming;
    sampleRatio: number;
    propagateToShell: boolean;
    signals: {
        traces: boolean;
        metrics: boolean;
        logs: boolean;
    };
    resourceAttributes: Record<string, string | boolean>;
    logLevel: DiagLogLevel;
    cwd: string;
}
export declare function normalizeProtocol(p: string | undefined): "grpc" | "http/protobuf" | "http/json";
export declare function resolveConfig(cwd: string): OtelConfig;
