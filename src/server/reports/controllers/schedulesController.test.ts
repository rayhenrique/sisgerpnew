import { describe, expect, it } from "vitest";

import type { SupabaseClient } from "@supabase/supabase-js";

import { createSchedule, deleteSchedule, listSchedules, runScheduleNow, updateSchedule } from "./schedulesController";

type AnyRecord = Record<string, unknown>;
type Builder = {
  select: (cols: string) => Builder;
  insert: (payload: AnyRecord) => Builder;
  update: (patch: AnyRecord) => Builder;
  delete: () => Builder;
  eq: (field: string, value: unknown) => Builder;
  order: (field: string, opts: AnyRecord) => Builder;
  gt: (field: string, value: unknown) => Builder;
  maybeSingle: () => Promise<{ data: unknown; error: unknown }>;
  single: () => Promise<{ data: unknown; error: unknown }>;
  then: (
    onFulfilled?: ((value: unknown) => unknown) | null,
    onRejected?: ((reason: unknown) => unknown) | null
  ) => Promise<unknown>;
};

function makeSupabaseMock() {
  const schedules = new Map<string, AnyRecord>();
  const state = { table: "", eq: new Map<string, unknown>() };
  let pendingUpdate: AnyRecord | null = null;

  function execute() {
    if (state.table === "report_schedules") {
      const userId = state.eq.get("user_id");
      const all = Array.from(schedules.values());
      const filtered = typeof userId === "string" ? all.filter((r) => r.user_id === userId) : all;
      return { data: filtered, error: null };
    }
    return { data: [], error: null };
  }

  const builder = {} as Builder;
  Object.assign(builder, {
    select: (_cols: string) => builder,
    insert: (payload: AnyRecord) => {
      const id = (payload.id as string | undefined) ?? "sch_1";
      const row = {
        id,
        created_at: new Date("2026-01-18T00:00:00.000Z").toISOString(),
        updated_at: new Date("2026-01-18T00:00:00.000Z").toISOString(),
        ...payload,
      };
      schedules.set(id, row);
      state.eq.set("id", id);
      return builder;
    },
    update: (patch: AnyRecord) => {
      pendingUpdate = patch;
      return builder;
    },
    delete: () => builder,
    eq: (field: string, value: unknown) => {
      state.eq.set(field, value);
      if (pendingUpdate && state.table === "report_schedules") {
        const id = state.eq.get("id");
        const userId = state.eq.get("user_id");
        if (typeof id === "string" && typeof userId === "string") {
          const row = schedules.get(id);
          if (row && row.user_id === userId) {
            schedules.set(id, { ...row, ...pendingUpdate, updated_at: new Date().toISOString() });
          }
          pendingUpdate = null;
        }
      }
      return builder;
    },
    order: (_field: string, _opts: AnyRecord) => builder,
    maybeSingle: async () => {
      const id = String(state.eq.get("id") ?? "");
      const userId = String(state.eq.get("user_id") ?? "");
      const row = schedules.get(id);
      if (!row || row.user_id !== userId) return { data: null, error: null };
      return { data: row, error: null };
    },
    single: async () => {
      const id = String(state.eq.get("id") ?? "");
      const row = schedules.get(id);
      return { data: row ?? null, error: row ? null : { message: "not found" } };
    },
    then: (
      onFulfilled?: ((value: unknown) => unknown) | null,
      onRejected?: ((reason: unknown) => unknown) | null
    ) => Promise.resolve(execute()).then(onFulfilled ?? undefined, onRejected ?? undefined),
  });

  return {
    from: (table: string) => {
      state.table = table;
      state.eq.clear();
      return builder;
    },
    __schedules: schedules,
  };
}

function makeSupabaseMockWithJobs(input: { paused: boolean }) {
  const schedules = new Map<string, AnyRecord>();
  const jobs = new Map<string, AnyRecord>();
  const cacheHit = { cache_key: "k", storage_path: "users/u/reports/x.pdf", expires_at: "2999-01-01T00:00:00.000Z" };
  let jobSeq = 1;

  schedules.set("sch_1", {
    id: "sch_1",
    user_id: "u",
    name: "Agendamento",
    report_key: "transactions",
    category: "Financeiro",
    category_id: null,
    format: "PDF",
    use_cache: true,
    period_window: "last30d",
    cron: "0 8 * * 1",
    is_paused: input.paused,
    next_run_at: input.paused ? null : new Date("2026-01-19T08:00:00.000Z").toISOString(),
    created_at: new Date("2026-01-18T00:00:00.000Z").toISOString(),
    updated_at: new Date("2026-01-18T00:00:00.000Z").toISOString(),
  });

  function builderFor(table: string): Builder {
    const eq = new Map<string, unknown>();
    let pendingUpdate: AnyRecord | null = null;
    let pendingInsert: AnyRecord | null = null;

    function executeSelect() {
      if (table === "report_schedules") {
        const id = eq.get("id");
        const userId = eq.get("user_id");
        if (typeof id === "string" && typeof userId === "string") {
          const row = schedules.get(id);
          if (!row || row.user_id !== userId) return { data: null, error: null };
          return { data: row, error: null };
        }
        return { data: Array.from(schedules.values()), error: null };
      }

      if (table === "report_jobs") {
        const id = eq.get("id");
        const userId = eq.get("user_id");
        if (typeof id === "string" && typeof userId === "string") {
          const row = jobs.get(id);
          if (!row || row.user_id !== userId) return { data: null, error: null };
          return { data: row, error: null };
        }
        return { data: Array.from(jobs.values()), error: null };
      }

      if (table === "report_cache") {
        return { data: cacheHit, error: null };
      }

      return { data: null, error: null };
    }

    const b = {} as Builder;
    Object.assign(b, {
      select: (_cols: string) => b,
      insert: (payload: AnyRecord) => {
        pendingInsert = payload;
        return b;
      },
      update: (patch: AnyRecord) => {
        pendingUpdate = patch;
        return b;
      },
      delete: () => b,
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
      maybeSingle: async () => executeSelect(),
      single: async () => {
        if (table === "report_jobs" && pendingInsert) {
          const id = (pendingInsert.id as string | undefined) ?? `job_${jobSeq++}`;
          const row = {
            id,
            cache_key: null,
            storage_path: null,
            error_message: null,
            queued_at: new Date("2026-01-18T00:00:00.000Z").toISOString(),
            started_at: null,
            finished_at: null,
            ...pendingInsert,
          };
          jobs.set(String(id), row);
          pendingInsert = null;
          return { data: row, error: null };
        }
        if (table === "report_schedules" && pendingUpdate) {
          const id = eq.get("id");
          const userId = eq.get("user_id");
          if (typeof id === "string" && typeof userId === "string") {
            const row = schedules.get(id);
            if (row && row.user_id === userId) schedules.set(id, { ...row, ...pendingUpdate });
            pendingUpdate = null;
          }
        }
        return executeSelect();
      },
      then: (
        onFulfilled?: ((value: unknown) => unknown) | null,
        onRejected?: ((reason: unknown) => unknown) | null
      ) =>
        Promise.resolve({ data: null, error: null }).then(onFulfilled ?? undefined, onRejected ?? undefined),
    });

    return b;
  }

  return {
    from: (table: string) => builderFor(table),
  };
}

describe("schedulesController", () => {
  it("cria e lista agendamento", async () => {
    const supabase = makeSupabaseMock();
    const schedule = await createSchedule({
      supabase: supabase as unknown as SupabaseClient,
      actorId: "u",
      payload: {
        name: "Semanal",
        reportKey: "transactions",
        category: "Financeiro",
        format: "PDF",
        useCache: true,
        categoryId: null,
        periodWindow: "last30d",
        recurrence: "weekly",
        time: "08:00",
        weekday: 1,
      },
    });
    expect(schedule.name).toEqual("Semanal");
    const items = await listSchedules({ supabase: supabase as unknown as SupabaseClient, actorId: "u" });
    expect(items.length).toEqual(1);
  });

  it("pausa e retoma", async () => {
    const supabase = makeSupabaseMock();
    await createSchedule({
      supabase: supabase as unknown as SupabaseClient,
      actorId: "u",
      payload: {
        name: "Diário",
        reportKey: "transactions",
        category: "Financeiro",
        format: "PDF",
        useCache: true,
        categoryId: null,
        periodWindow: "last30d",
        recurrence: "daily",
        time: "08:00",
      },
    });

    const paused = await updateSchedule({
      supabase: supabase as unknown as SupabaseClient,
      actorId: "u",
      scheduleId: "sch_1",
      patch: { isPaused: true },
    });
    expect(paused.is_paused).toBe(true);
    expect(paused.next_run_at).toBeNull();

    const resumed = await updateSchedule({
      supabase: supabase as unknown as SupabaseClient,
      actorId: "u",
      scheduleId: "sch_1",
      patch: { isPaused: false },
    });
    expect(resumed.is_paused).toBe(false);
  });

  it("exclui agendamento", async () => {
    const supabase = makeSupabaseMock();
    await createSchedule({
      supabase: supabase as unknown as SupabaseClient,
      actorId: "u",
      payload: {
        name: "Diário",
        reportKey: "transactions",
        category: "Financeiro",
        format: "PDF",
        useCache: true,
        categoryId: null,
        periodWindow: "last30d",
        recurrence: "daily",
        time: "08:00",
      },
    });
    await deleteSchedule({ supabase: supabase as unknown as SupabaseClient, actorId: "u", scheduleId: "sch_1" });
  });

  it("executa agendamento agora", async () => {
    const supabase = makeSupabaseMockWithJobs({ paused: false });
    const job = await runScheduleNow({
      supabase: supabase as unknown as SupabaseClient,
      actorId: "u",
      scheduleId: "sch_1",
    });
    expect(job.status).toEqual("READY");
  });

  it("impede execução quando pausado", async () => {
    const supabase = makeSupabaseMockWithJobs({ paused: true });
    await expect(
      runScheduleNow({ supabase: supabase as unknown as SupabaseClient, actorId: "u", scheduleId: "sch_1" })
    ).rejects.toThrow(
      "Agendamento está pausado"
    );
  });
});

