import { describe, expect, it } from "vitest";

import type { SupabaseClient } from "@supabase/supabase-js";

import { createJob, getDownloadUrl, runJob } from "./jobsController";

type AnyRecord = Record<string, unknown>;
type Builder = {
  select: (cols: string) => Builder;
  insert: (payload: AnyRecord) => Builder;
  update: (patch: AnyRecord) => Builder;
  delete: () => Builder;
  upsert: (payload: AnyRecord) => Promise<{ data: null; error: null }>;
  eq: (field: string, value: unknown) => Builder;
  gt: (field: string, value: unknown) => Builder;
  gte: (field: string, value: unknown) => Builder;
  lte: (field: string, value: unknown) => Builder;
  order: (field: string, opts: AnyRecord) => Builder;
  limit: (n: number) => Builder;
  maybeSingle: () => Promise<{ data: unknown; error: unknown }>;
  single: () => Promise<{ data: unknown; error: unknown }>;
  then: (
    onFulfilled?: ((value: unknown) => unknown) | null,
    onRejected?: ((reason: unknown) => unknown) | null
  ) => Promise<unknown>;
};

function makeSupabaseMock() {
  const jobs = new Map<string, Record<string, unknown>>();
  let cacheHit: Record<string, unknown> | null = { cache_key: "k", storage_path: "users/u/reports/x.pdf" };

  const storageCalls: string[] = [];

  const storage = {
    listBuckets: async () => ({ data: [{ name: "report-files" }], error: null }),
    createBucket: async () => ({ data: null, error: null }),
    from: () => ({
      upload: async () => ({ data: null, error: null }),
      createSignedUrl: async (path: string, expiresIn: number) => {
        storageCalls.push(`signed:${path}:${expiresIn}`);
        return { data: { signedUrl: `https://example.com/${path}` }, error: null };
      },
    }),
  };

  const state = { table: "", eq: new Map<string, unknown>() };
  let pendingUpdate: AnyRecord | null = null;

  const builder = {} as Builder;
  Object.assign(builder, {
    select: (_cols: string) => builder,
    insert: (payload: Record<string, unknown>) => {
      const id = (payload.id as string | undefined) ?? "job_1";
      const row = {
        id,
        schedule_id: null,
        cache_key: null,
        storage_path: null,
        error_message: null,
        started_at: null,
        finished_at: null,
        queued_at: new Date("2026-01-18T00:00:00.000Z").toISOString(),
        ...payload,
      };
      jobs.set(id, row);
      state.eq.set("id", id);
      return builder;
    },
    update: (patch: Record<string, unknown>) => {
      pendingUpdate = patch;
      return builder;
    },
    delete: () => builder,
    upsert: (_payload: Record<string, unknown>) => Promise.resolve({ data: null, error: null }),
    eq: (field: string, value: unknown) => {
      state.eq.set(field, value);
      if (pendingUpdate && state.table === "report_jobs") {
        const id = state.eq.get("id");
        const userId = state.eq.get("user_id");
        if (typeof id === "string" && typeof userId === "string") {
          const row = jobs.get(id);
          if (row && row.user_id === userId) {
            jobs.set(id, { ...row, ...pendingUpdate });
          }
          pendingUpdate = null;
        }
      }
      return builder;
    },
    gt: (_field: string, _value: unknown) => builder,
    gte: (_field: string, _value: unknown) => builder,
    lte: (_field: string, _value: unknown) => builder,
    order: (_field: string, _opts: AnyRecord) => builder,
    limit: (_n: number) => builder,
    maybeSingle: async () => {
      if (state.table === "report_jobs") {
        const id = String(state.eq.get("id") ?? "");
        const userId = String(state.eq.get("user_id") ?? "");
        const row = jobs.get(id);
        if (!row || row.user_id !== userId) return { data: null, error: null };
        return { data: row, error: null };
      }

      if (state.table === "report_cache") {
        return { data: cacheHit, error: null };
      }

      return { data: null, error: null };
    },
    single: async () => {
      const id = String(state.eq.get("id") ?? "");
      const row = jobs.get(id);
      return { data: row ?? null, error: row ? null : { message: "not found" } };
    },
    then: (
      onFulfilled?: ((value: unknown) => unknown) | null,
      onRejected?: ((reason: unknown) => unknown) | null
    ) => Promise.resolve({ data: null, error: null }).then(onFulfilled ?? undefined, onRejected ?? undefined),
  });

  return {
    storage,
    from: (table: string) => {
      state.table = table;
      state.eq.clear();
      return builder;
    },
    __setCacheHit: (v: Record<string, unknown> | null) => {
      cacheHit = v;
    },
    __jobs: jobs,
    __storageCalls: storageCalls,
  };
}

function makeSupabaseMockForGeneration() {
  const jobs = new Map<string, Record<string, unknown>>();
  const cache = new Map<string, Record<string, unknown>>();
  const uploads: string[] = [];
  let jobSeq = 1;

  const storage = {
    listBuckets: async () => ({ data: [{ name: "report-files" }], error: null }),
    createBucket: async () => ({ data: null, error: null }),
    from: () => ({
      upload: async (path: string) => {
        uploads.push(path);
        return { data: null, error: null };
      },
      createSignedUrl: async () => ({ data: { signedUrl: "https://example.com" }, error: null }),
    }),
  };

  function builderFor(table: string): Builder {
    const eq = new Map<string, unknown>();
    const filters = new Map<string, unknown>();
    let pendingUpdate: Record<string, unknown> | null = null;
    let pendingInsert: Record<string, unknown> | null = null;

    function executeSelect() {
      if (table === "categories") {
        return { data: [{ id: 1, name: "Cat" }], error: null };
      }
      if (table === "revenues") {
        return {
          data: [{ id: 1, date: "2026-01-02", description: "R", amount: 10, category_id: 1 }],
          error: null,
        };
      }
      if (table === "expenses") {
        return {
          data: [{ id: 1, date: "2026-01-03", description: "E", amount: 4, category_id: 1 }],
          error: null,
        };
      }
      if (table === "report_jobs") {
        const userId = eq.get("user_id");
        const id = eq.get("id");
        if (typeof id === "string" && typeof userId === "string") {
          const row = jobs.get(id);
          if (!row || row.user_id !== userId) return { data: null, error: null };
          return { data: row, error: null };
        }
        return { data: Array.from(jobs.values()), error: null };
      }
      if (table === "report_cache") {
        const key = eq.get("cache_key");
        if (typeof key !== "string") return { data: null, error: null };
        return { data: cache.get(key) ?? null, error: null };
      }
      return { data: null, error: null };
    }

    const b = {} as Builder;
    Object.assign(b, {
      select: (_cols: string) => b,
      insert: (payload: Record<string, unknown>) => {
        pendingInsert = payload;
        return b;
      },
      update: (patch: Record<string, unknown>) => {
        pendingUpdate = patch;
        return b;
      },
      upsert: (payload: Record<string, unknown>) => {
        if (table === "report_cache") {
          const k = String(payload.cache_key);
          cache.set(k, payload);
        }
        return Promise.resolve({ data: null, error: null });
      },
      eq: (field: string, value: unknown) => {
        eq.set(field, value);
        if (pendingUpdate && table === "report_jobs") {
          const id = eq.get("id");
          const userId = eq.get("user_id");
          if (typeof id === "string" && typeof userId === "string") {
            const row = jobs.get(id);
            if (row && row.user_id === userId) jobs.set(id, { ...row, ...pendingUpdate });
            pendingUpdate = null;
          }
        }
        return b;
      },
      gt: (_f: string, _v: unknown) => b,
      gte: (field: string, v: unknown) => {
        filters.set(`${field}_gte`, v);
        return b;
      },
      lte: (field: string, v: unknown) => {
        filters.set(`${field}_lte`, v);
        return b;
      },
      is: (_f: string, _v: unknown) => b,
      maybeSingle: async () => executeSelect(),
      single: async () => {
        if (table === "report_jobs" && pendingInsert) {
          const id = (pendingInsert.id as string | undefined) ?? `job_${jobSeq++}`;
          const row = {
            id,
            schedule_id: null,
            cache_key: null,
            storage_path: null,
            error_message: null,
            started_at: null,
            finished_at: null,
            queued_at: new Date("2026-01-18T00:00:00.000Z").toISOString(),
            ...pendingInsert,
          };
          jobs.set(String(id), row);
          pendingInsert = null;
          return { data: row, error: null };
        }
        return executeSelect();
      },
      then: (
        onFulfilled?: ((value: unknown) => unknown) | null,
        onRejected?: ((reason: unknown) => unknown) | null
      ) => Promise.resolve(executeSelect()).then(onFulfilled ?? undefined, onRejected ?? undefined),
    });

    return b;
  }

  return {
    storage,
    from: (table: string) => builderFor(table),
    __jobs: jobs,
    __uploads: uploads,
  };
}

describe("jobsController", () => {
  it("cria job com status QUEUED", async () => {
    const supabase = makeSupabaseMock();
    const job = await createJob({
      supabase: supabase as unknown as SupabaseClient,
      actorId: "u",
      payload: {
        reportKey: "transactions",
        category: "Financeiro",
        periodStart: "2026-01-01",
        periodEnd: "2026-01-31",
        format: "PDF",
        categoryId: null,
        useCache: true,
      },
    });
    expect(job.status).toEqual("QUEUED");
  });

  it("processa job via cache hit", async () => {
    const supabase = makeSupabaseMock();

    await createJob({
      supabase: supabase as unknown as SupabaseClient,
      actorId: "u",
      payload: {
        reportKey: "transactions",
        category: "Financeiro",
        periodStart: "2026-01-01",
        periodEnd: "2026-01-31",
        format: "PDF",
        categoryId: null,
        useCache: true,
      },
    });

    const j = await runJob({
      supabase: supabase as unknown as SupabaseClient,
      actorId: "u",
      jobId: "job_1",
      useCache: true,
      categoryId: null,
    });

    expect(j.status).toEqual("READY");
    expect(j.storage_path).toEqual("users/u/reports/x.pdf");
  });

  it("gera link de download", async () => {
    const supabase = makeSupabaseMock();
    const row = {
      id: "job_2",
      user_id: "u",
      schedule_id: null,
      report_key: "transactions",
      category: "Financeiro",
      period_start: "2026-01-01",
      period_end: "2026-01-31",
      category_id: null,
      format: "PDF",
      status: "READY",
      cache_key: "k",
      storage_path: "users/u/reports/x.pdf",
      error_message: null,
      queued_at: new Date("2026-01-18T00:00:00.000Z").toISOString(),
      started_at: null,
      finished_at: null,
    };
    supabase.__jobs.set("job_2", row);

    const res = await getDownloadUrl({
      supabase: supabase as unknown as SupabaseClient,
      actorId: "u",
      jobId: "job_2",
    });
    expect(res.url).toContain("https://example.com/");
    expect(supabase.__storageCalls.length).toBeGreaterThan(0);
  });

  it("processa job via cache miss e faz upload", async () => {
    const supabase = makeSupabaseMockForGeneration();
    await createJob({
      supabase: supabase as unknown as SupabaseClient,
      actorId: "u",
      payload: {
        reportKey: "transactions",
        category: "Financeiro",
        periodStart: "2026-01-01",
        periodEnd: "2026-01-31",
        format: "CSV",
        categoryId: null,
        useCache: false,
      },
    });

    const job = await runJob({
      supabase: supabase as unknown as SupabaseClient,
      actorId: "u",
      jobId: "job_1",
      useCache: false,
      categoryId: null,
    });

    expect(job.status).toEqual("READY");
    expect(supabase.__uploads.length).toBeGreaterThan(0);
  });
});

