import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { resolveConfig } from "../dist/config.js";

const HERDSMAN_VARS = [
  "PI_HERDSMAN_AGENT_DEFINITION",
  "PI_HERDSMAN_LABEL",
  "PI_HERDSMAN_OWNER_SESSION_ID",
  "PI_SUBAGENT_CHILD",
  "PI_SUBAGENT_PARENT_SESSION",
  "OTEL_RESOURCE_ATTRIBUTES",
];

// The test runner may itself be a herdsman child; start from a clean env.
function withEnv(vars, fn) {
  const saved = Object.fromEntries(
    HERDSMAN_VARS.map((k) => [k, process.env[k]]),
  );
  for (const k of HERDSMAN_VARS) delete process.env[k];
  Object.assign(process.env, vars);
  try {
    return fn();
  } finally {
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
}

const cwd = mkdtempSync(join(tmpdir(), "pi-otel-config-"));

test("herdsman child env lands on the resource — Logfire attributes the session to its role and parent", () => {
  const attrs = withEnv(
    {
      PI_HERDSMAN_AGENT_DEFINITION: "scout",
      PI_HERDSMAN_LABEL: "scout-1",
      PI_HERDSMAN_OWNER_SESSION_ID: "owner-sess",
      PI_SUBAGENT_CHILD: "1",
      PI_SUBAGENT_PARENT_SESSION: "parent-sess",
    },
    () => resolveConfig(cwd).resourceAttributes,
  );
  assert.deepEqual(attrs, {
    "pi.agent.role": "scout",
    "pi.agent.label": "scout-1",
    "pi.agent.owner.session.id": "owner-sess",
    "pi.agent.child": true,
    "pi.parent.session.id": "parent-sess",
  });
});

test("main session (no herdsman env) carries no pi.agent.* / parent attrs, so it stays 'main'", () => {
  const attrs = withEnv({}, () => resolveConfig(cwd).resourceAttributes);
  assert.deepEqual(
    Object.keys(attrs).filter(
      (k) => k.startsWith("pi.agent.") || k === "pi.parent.session.id",
    ),
    [],
  );
});

test("explicit OTEL_RESOURCE_ATTRIBUTES still wins over herdsman-derived attrs", () => {
  const attrs = withEnv(
    {
      PI_HERDSMAN_AGENT_DEFINITION: "scout",
      OTEL_RESOURCE_ATTRIBUTES: "pi.agent.role=override,team=x",
    },
    () => resolveConfig(cwd).resourceAttributes,
  );
  assert.equal(attrs["pi.agent.role"], "override");
  assert.equal(attrs.team, "x");
});
