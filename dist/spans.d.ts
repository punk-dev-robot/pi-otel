/**
 * Span lifecycle tracker.
 *
 * Owns one `pi.interaction` root span per user prompt. Children:
 *   - `pi.llm_request` per provider request
 *   - `pi.tool.<name>` per tool invocation (parallel-safe via Map<toolCallId, …>)
 *
 * Active provider span is single-slot — pi serializes provider requests
 * per session, but parallel tool calls overlap, so tools key on toolCallId.
 */
import { type Context, type Tracer } from "@opentelemetry/api";
import { type ContentCapture, type SpanNaming } from "./attrs.js";
export interface SpanTrackerOpts {
    tracer: Tracer;
    captureContent: ContentCapture;
    sessionId: () => string | undefined;
    cwd: string;
    /** Defaults to "legacy" — existing dashboards key off the `pi.*` names. */
    spanNaming?: SpanNaming;
}
export declare class SpanTracker {
    private opts;
    private interaction;
    private turn;
    private llm;
    private tools;
    private turnCount;
    private toolCount;
    private pendingMessages;
    constructor(opts: SpanTrackerOpts);
    private get genai();
    /**
     * Span name + kind for one operation. In legacy mode the kind is left unset
     * (SDK default INTERNAL) so the emitted span is byte-identical to pre-flag
     * output.
     */
    private spanOpts;
    private commonAttrs;
    startInteraction(prompt: string | undefined): void;
    endInteraction(error?: unknown): void;
    startTurn(turnIndex: number | undefined): void;
    endTurn(error?: unknown): void;
    /**
     * `provider` is the best-known request-start provider id (e.g.
     * `ctx.model?.provider`); normalized and attached only in genai mode.
     */
    hasOpenLlmRequest(): boolean;
    /**
     * `synthesized` marks a span opened from the assistant `message_start`
     * because the provider never emitted `before_provider_request` (#10). The
     * span then starts at stream start rather than at request send.
     */
    startLlmRequest(model?: string, provider?: string, opts?: {
        synthesized?: boolean;
    }): void;
    private currentInputMessages;
    private flushPendingMessages;
    /**
     * Buffer a user-role message; flushed as a gen_ai.user.message event on the
     * next LLM span (or the current one if already open).
     */
    noteUserMessage(content: unknown): void;
    /**
     * Buffer a toolResult message; flushed as a gen_ai.tool.message event on the
     * next LLM span (only when captureContent === "full").
     */
    noteToolResultMessage(msg: {
        toolCallId: string;
        toolName?: string;
        content: unknown;
    }): void;
    /**
     * Emit gen_ai.assistant.message + gen_ai.choice events on the active LLM
     * span. Called from message_end before endLlmRequest.
     */
    noteAssistantMessage(message: any): void;
    setLlmAttrs(attrs: Record<string, unknown>): void;
    endLlmRequest(error?: unknown): void;
    private recordLlmMetrics;
    toolContext(toolCallId: string): Context | undefined;
    startTool(toolCallId: string, toolName: string, input: unknown): void;
    endTool(toolCallId: string, args: {
        isError?: boolean;
        result?: unknown;
    }): void;
    /**
     * Drop any buffered user/tool messages — used when an interaction ends
     * without ever opening an LLM span (e.g., user prompt cancelled).
     */
    clearPending(): void;
    /**
     * Hook for the launcher / external code to read the active interaction
     * trace id (e.g. for surfacing in UI).
     */
    activeTraceId(): string | undefined;
}
