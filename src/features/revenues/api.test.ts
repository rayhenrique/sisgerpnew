import { beforeEach, describe, expect, it, vi } from "vitest";

import { createRevenue, updateRevenue } from "./api";

type SupabaseErrorShape = { message: string; code?: string; details?: string | null; hint?: string | null };

function makeRevenuesTable(opts: {
  insertResult?: { data: unknown; error: SupabaseErrorShape | null };
  oldRowResult?: { data: unknown; error: SupabaseErrorShape | null };
  updateResult?: { data: unknown; error: SupabaseErrorShape | null };
}) {
  const state: {
    operation: "insert" | "update" | "select" | null;
    insertPayload: unknown;
    updatePayload: unknown;
  } = {
    operation: null,
    insertPayload: null,
    updatePayload: null,
  };

  const builder = {
    insert: vi.fn((payload: unknown) => {
      state.operation = "insert";
      state.insertPayload = payload;
      return builder;
    }),
    update: vi.fn((payload: unknown) => {
      state.operation = "update";
      state.updatePayload = payload;
      return builder;
    }),
    select: vi.fn(() => {
      state.operation = state.operation ?? "select";
      return builder;
    }),
    eq: vi.fn(() => builder),
    single: vi.fn(async () => {
      if (state.operation === "insert") {
        return opts.insertResult ?? { data: { id: "rev-1" }, error: null };
      }
      return opts.updateResult ?? { data: { id: "rev-1" }, error: null };
    }),
    maybeSingle: vi.fn(async () => {
      return opts.oldRowResult ?? { data: null, error: null };
    }),
    __state: state,
  };

  return builder;
}

function makeAuditLogsTable() {
  return {
    insert: vi.fn(async () => ({ data: null, error: null })),
  };
}

const getSupabaseBrowserClientMock = vi.fn();

vi.mock("@/lib/supabase/browser", () => ({
  getSupabaseBrowserClient: () => getSupabaseBrowserClientMock(),
}));

describe("revenues api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("envia payload correto ao criar receita", async () => {
    const revenuesTable = makeRevenuesTable({});
    const auditLogsTable = makeAuditLogsTable();

    const supabase = {
      auth: { getUser: vi.fn(async () => ({ data: { user: { id: "user-1" } }, error: null })) },
      from: vi.fn((table: string) => {
        if (table === "revenues") return revenuesTable;
        if (table === "audit_logs") return auditLogsTable;
        throw new Error(`Tabela inesperada: ${table}`);
      }),
    };

    getSupabaseBrowserClientMock.mockReturnValue(supabase);

    await createRevenue({
      description: "receita teste",
      amount: 1000,
      date: "2026-02-02",
      fonteId: "fonte-1",
      blocoId: "bloco-1",
      grupoId: "grupo-1",
      acaoId: "acao-1",
    });

    expect(supabase.from).toHaveBeenCalledWith("revenues");
    expect(revenuesTable.insert).toHaveBeenCalledTimes(1);
    const payload = (revenuesTable.__state.insertPayload ?? {}) as Record<string, unknown>;
    expect(payload.description).toBe("receita teste");
    expect(payload.amount).toBe(1000);
    expect(payload.date).toBe("2026-02-02");
    expect(payload.source_id).toBe("fonte-1");
    expect(payload.category_id).toBe("acao-1");
    expect(payload.fonte_id).toBe("fonte-1");
    expect(payload.bloco_id).toBe("bloco-1");
    expect(payload.grupo_id).toBe("grupo-1");
    expect(payload.acao_id).toBe("acao-1");
  });

  it("falha com mensagem amigável quando Supabase retorna erro de campos obrigatórios", async () => {
    const revenuesTable = makeRevenuesTable({
      insertResult: {
        data: null,
        error: { message: "null value in column \"date\" violates not-null constraint", code: "23502" },
      },
    });
    const auditLogsTable = makeAuditLogsTable();

    const supabase = {
      auth: { getUser: vi.fn(async () => ({ data: { user: { id: "user-1" } }, error: null })) },
      from: vi.fn((table: string) => {
        if (table === "revenues") return revenuesTable;
        if (table === "audit_logs") return auditLogsTable;
        throw new Error(`Tabela inesperada: ${table}`);
      }),
    };

    getSupabaseBrowserClientMock.mockReturnValue(supabase);

    await expect(
      createRevenue({
        description: "receita teste",
        amount: 1,
        date: "2026-02-02",
        fonteId: "fonte-1",
        blocoId: "bloco-1",
        grupoId: "grupo-1",
        acaoId: "acao-1",
      })
    ).rejects.toThrow("Campos obrigatórios não preenchidos.");
  });

  it("valida entrada antes de chamar o banco", async () => {
    getSupabaseBrowserClientMock.mockReturnValue({
      from: vi.fn(),
      auth: { getUser: vi.fn() },
    });

    await expect(
      createRevenue({
        description: "x",
        amount: 100,
        date: "2026-02-02",
        fonteId: "fonte-1",
        blocoId: "bloco-1",
        grupoId: "grupo-1",
        acaoId: "acao-1",
      })
    ).rejects.toThrow("Informe a descrição");
  });

  it("faz update consultando linha anterior e salva audit log", async () => {
    const revenuesTable = makeRevenuesTable({
      oldRowResult: { data: { id: "rev-1", description: "antiga" }, error: null },
      updateResult: { data: { id: "rev-1", description: "nova" }, error: null },
    });
    const auditLogsTable = makeAuditLogsTable();

    const supabase = {
      auth: { getUser: vi.fn(async () => ({ data: { user: { id: "user-1" } }, error: null })) },
      from: vi.fn((table: string) => {
        if (table === "revenues") return revenuesTable;
        if (table === "audit_logs") return auditLogsTable;
        throw new Error(`Tabela inesperada: ${table}`);
      }),
    };

    getSupabaseBrowserClientMock.mockReturnValue(supabase);

    await updateRevenue("rev-1", {
      description: "nova",
      amount: 2,
      date: "2026-02-02",
      fonteId: "fonte-1",
      blocoId: "bloco-1",
      grupoId: "grupo-1",
      acaoId: "acao-1",
    });

    expect(revenuesTable.maybeSingle).toHaveBeenCalledTimes(1);
    expect(revenuesTable.update).toHaveBeenCalledTimes(1);
    expect(auditLogsTable.insert).toHaveBeenCalledTimes(1);
  });
});

