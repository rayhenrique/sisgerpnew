import crypto from "crypto";

export function stableJson(input: unknown): string {
  if (input === null) return "null";
  if (typeof input === "string") return JSON.stringify(input);
  if (typeof input === "number" || typeof input === "boolean") return JSON.stringify(input);
  if (Array.isArray(input)) return `[${input.map((v) => stableJson(v)).join(",")}]`;
  if (typeof input === "object") {
    const rec = input as Record<string, unknown>;
    const keys = Object.keys(rec).sort();
    const body = keys.map((k) => `${JSON.stringify(k)}:${stableJson(rec[k])}`).join(",");
    return `{${body}}`;
  }
  return JSON.stringify(String(input));
}

export function sha256Hex(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

