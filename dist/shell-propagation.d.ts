/**
 * Opt-in W3C trace context propagation into the `bash` / `powershell` tools (#1).
 *
 * pi has no hook to mutate the child env of its built-in shell tools, so the
 * supported route is to rebuild the tool with `spawnHook` and re-register it
 * under the same name. pi warns once in interactive mode about the override;
 * that is why this is off by default (`propagateToShell`).
 */
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { SpanTracker } from "./spans.js";
export type ShellToolName = "bash" | "powershell";
/**
 * Inject `TRACEPARENT` / `TRACESTATE` from the active context into `env`.
 * Returns the same object untouched when no span is active.
 */
export declare function injectTraceContext(env: NodeJS.ProcessEnv, ctx?: import("@opentelemetry/api").Context): NodeJS.ProcessEnv;
export declare function registerShellPropagation(pi: ExtensionAPI, cwd: string, getTracker: () => SpanTracker | null): ShellToolName[];
