/**
 * OTel SDK bootstrap. One global SDK per process — pi loads us per session
 * but the SDK is shared across sessions in the same process.
 */
import { NodeSDK } from "@opentelemetry/sdk-node";
import type { OtelConfig } from "../config.js";
export type NotifySeverity = "info" | "warning" | "error";
export type Notify = (msg: string, severity?: NotifySeverity) => void;
export type ForeignSignal = "trace" | "metrics" | "logs";
/** Signals for which another OTel SDK already registered a global provider. */
export declare function foreignOtelProviders(): ForeignSignal[];
export declare function probeTcp(host: string, port: number, timeoutMs?: number): Promise<boolean>;
export declare function probeEndpoint(endpoint: string, timeoutMs?: number): Promise<boolean>;
/** null on an unparseable endpoint. */
export declare function parseProbeTarget(endpoint: string): {
    host: string;
    port: number;
} | null;
export type Signal = "traces" | "metrics" | "logs";
/**
 * HTTP OTLP is per-signal: the configured endpoint is a BASE url and each
 * signal appends its own resource path. gRPC uses the base endpoint as-is.
 * A base that already carries a signal path is tolerated (older configs).
 */
export declare function resolveSignalUrl(endpoint: string, signal: Signal): string;
export declare function initSdk(cfg: OtelConfig, notify?: Notify, opts?: {
    silentSuccess?: boolean;
}): NodeSDK | null;
export declare function shutdownSdk(): Promise<void>;
