import { describe, expect, it } from "vitest";

import type { SupabaseClient } from "@supabase/supabase-js";

import { createSignedDownloadUrl, ensureReportsBucket, uploadReportFile } from "./storage";

function makeSupabaseStorageMock() {
  const calls: string[] = [];
  const storage = {
    listBuckets: async () => ({ data: [{ name: "other" }], error: null }),
    createBucket: async (name: string) => {
      calls.push(`createBucket:${name}`);
      return { data: null, error: null };
    },
    from: () => ({
      upload: async (path: string, _bytes: Uint8Array, _opts: { contentType: string; upsert: boolean }) => {
        calls.push(`upload:${path}`);
        return { data: null, error: null };
      },
      createSignedUrl: async (path: string, expiresIn: number) => {
        calls.push(`signed:${path}:${expiresIn}`);
        return { data: { signedUrl: `https://example.com/${path}` }, error: null };
      },
    }),
  };

  return { storage, calls };
}

describe("storage", () => {
  it("cria bucket quando não existe", async () => {
    const { storage, calls } = makeSupabaseStorageMock();
    await ensureReportsBucket({ storage } as unknown as SupabaseClient);
    expect(calls.some((c) => c.startsWith("createBucket:"))).toBe(true);
  });

  it("faz upload com content-type", async () => {
    const { storage, calls } = makeSupabaseStorageMock();
    await uploadReportFile({
      supabase: { storage } as unknown as SupabaseClient,
      path: "users/u/reports/a.csv",
      contentType: "text/csv",
      bytes: new Uint8Array([1, 2, 3]),
    });
    expect(calls).toContain("upload:users/u/reports/a.csv");
  });

  it("gera URL assinada", async () => {
    const { storage } = makeSupabaseStorageMock();
    const url = await createSignedDownloadUrl({
      supabase: { storage } as unknown as SupabaseClient,
      path: "p",
      expiresInSeconds: 60,
    });
    expect(url).toEqual("https://example.com/p");
  });
});

