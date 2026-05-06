// Thin wrapper around the Anthropic Messages API.
// Used by every AI edge function so that ALL text generation goes through
// Anthropic Claude directly — not through any AI gateway.

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
export const DEFAULT_MODEL = "claude-sonnet-4-5";

export interface AnthropicTool {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

export interface AnthropicCallOptions {
  system: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  max_tokens?: number;
  model?: string;
  tool?: AnthropicTool;          // forces tool use and returns parsed input
}

export interface AnthropicResult {
  text: string;                  // joined text content
  tool_input: any | null;        // parsed input of the forced tool, if any
}

/**
 * Call Anthropic Messages API. If `tool` is provided, the model is forced to
 * call that tool and the parsed input is returned in `tool_input`.
 *
 * Returns the standard result on success. On rate-limit (429) or quota-exhausted
 * (402-equivalent) responses, throws an `AnthropicLimitError` so callers can
 * surface a friendly HTTP 200 message (matching existing Lovable behaviour).
 */
export async function callAnthropic(opts: AnthropicCallOptions): Promise<AnthropicResult> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");

  const body: Record<string, unknown> = {
    model: opts.model ?? DEFAULT_MODEL,
    max_tokens: opts.max_tokens ?? 1024,
    system: opts.system,
    messages: opts.messages,
  };

  if (opts.tool) {
    body.tools = [{
      name: opts.tool.name,
      description: opts.tool.description,
      input_schema: opts.tool.input_schema,
    }];
    body.tool_choice = { type: "tool", name: opts.tool.name };
  }

  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    if (res.status === 429) throw new AnthropicLimitError("rate_limit", "Rate limit reached. Please try again in a moment.");
    if (res.status === 402 || res.status === 529) throw new AnthropicLimitError("quota", "Anthropic usage limit reached.");
    if (res.status === 401 || res.status === 403) throw new AnthropicLimitError("auth", "Anthropic API key is missing or invalid.");
    throw new Error(`Anthropic error [${res.status}]: ${errText.slice(0, 400)}`);
  }

  const data = await res.json();
  const blocks: Array<any> = data.content ?? [];

  let text = "";
  let tool_input: any = null;
  for (const b of blocks) {
    if (b.type === "text") text += b.text;
    else if (b.type === "tool_use") tool_input = b.input;
  }

  return { text: text.trim(), tool_input };
}

export class AnthropicLimitError extends Error {
  kind: "rate_limit" | "quota" | "auth";
  constructor(kind: "rate_limit" | "quota" | "auth", message: string) {
    super(message);
    this.kind = kind;
  }
}
