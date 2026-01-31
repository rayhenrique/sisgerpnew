import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);

function getArg(name) {
  const idx = args.indexOf(name);
  if (idx === -1) return null;
  return args[idx + 1] ?? null;
}

const inputPath = getArg("--input");
const outputPath = getArg("--output");
const mode = getArg("--mode") ?? "replace";
const preset = getArg("--preset");

if (!inputPath || !outputPath) {
  process.stderr.write(
    [
      "Uso:",
      "  node scripts/generate-supabase-import-from-mysql-dump.mjs --input <dump.sql> --output <import.sql> [--mode replace|append]",
      "  node scripts/generate-supabase-import-from-mysql-dump.mjs --preset sisgerp-domain --input <dump.sql> --output <import.sql> [--mode replace|append]",
      "  node scripts/generate-supabase-import-from-mysql-dump.mjs --preset sisgerp-dump2 --input <dump.sql> --output <import.sql> [--mode replace|append]",
      "",
      "Notas:",
      "- mode=replace gera TRUNCATE das tabelas-alvo antes de inserir.",
      "- mode=append não trunca; pode falhar por conflito de IDs/PK.",
      "- preset=sisgerp-domain migra apenas tabelas de domínio (sem logs/usuários).",
      "- preset=sisgerp-dump2 também converte users→legacy_users e audit_logs→audit_logs(legacy_*).",
      "",
    ].join("\n")
  );
  process.exit(1);
}

const targetTables =
  preset === "sisgerp-dump2"
    ? [
        "categories",
        "expense_classifications",
        "city_settings",
        "revenues",
        "expenses",
        "audit_logs",
        "users",
      ]
    : ["categories", "expense_classifications", "city_settings", "revenues", "expenses"];

const inputSql = fs.readFileSync(inputPath, "utf8");

function extractInsertBlocks(table) {
  const pattern = new RegExp(
    String.raw`INSERT INTO\s+\`${table}\`[\s\S]*?;\s*`,
    "g"
  );
  return inputSql.match(pattern) ?? [];
}

function splitCsvRespectingStrings(input) {
  const parts = [];
  let buf = "";
  let inString = false;
  let escape = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (inString) {
      buf += ch;
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === "\\") {
        escape = true;
        continue;
      }
      if (ch === "'") inString = false;
      continue;
    }

    if (ch === "'") {
      inString = true;
      buf += ch;
      continue;
    }

    if (ch === ",") {
      parts.push(buf.trim());
      buf = "";
      continue;
    }

    buf += ch;
  }

  if (buf.length > 0) parts.push(buf.trim());
  return parts;
}

function splitTuples(valuesSection) {
  const tuples = [];
  let buf = "";
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = 0; i < valuesSection.length; i++) {
    const ch = valuesSection[i];

    if (inString) {
      buf += ch;
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === "\\") {
        escape = true;
        continue;
      }
      if (ch === "'") inString = false;
      continue;
    }

    if (ch === "'") {
      inString = true;
      buf += ch;
      continue;
    }

    if (ch === "(") {
      depth++;
      buf += ch;
      continue;
    }

    if (ch === ")") {
      depth--;
      buf += ch;
      if (depth === 0) {
        tuples.push(buf.trim());
        buf = "";
      }
      continue;
    }

    if (depth === 0) continue;
    buf += ch;
  }

  return tuples;
}

function parseTuple(tupleText) {
  const trimmed = tupleText.trim();
  if (!trimmed.startsWith("(") || !trimmed.endsWith(")")) return [];
  const inner = trimmed.slice(1, -1);
  return splitCsvRespectingStrings(inner);
}

function formatTuple(values) {
  return `(${values.join(", ")})`;
}

function isNullToken(token) {
  return token.trim().toUpperCase() === "NULL";
}

function parseSqlStringLiteral(token) {
  const t = token.trim();
  if (t.length < 2 || t[0] !== "'" || t[t.length - 1] !== "'") return null;
  const inner = t.slice(1, -1);
  return inner.replaceAll("''", "'");
}

function quoteSqlString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function unescapeMySqlBackslashString(value) {
  return value
    .replaceAll("\\\\", "\\")
    .replaceAll("\\'", "'")
    .replaceAll('\\"', '"')
    .replaceAll("\\n", "\n")
    .replaceAll("\\r", "\r")
    .replaceAll("\\t", "\t");
}

function normalizeMySqlStringToken(token) {
  const t = token.trim();
  if (isNullToken(t)) return "NULL";
  if (t.length < 2 || t[0] !== "'" || t[t.length - 1] !== "'") return token;

  const inner = t.slice(1, -1).replaceAll("''", "'");
  const decoded = inner.replaceAll(/\\(.)/g, (_, ch) => {
    if (ch === "0") return "\0";
    if (ch === "b") return "\b";
    if (ch === "n") return "\n";
    if (ch === "r") return "\r";
    if (ch === "t") return "\t";
    if (ch === "Z") return "\x1a";
    if (ch === "'") return "'";
    if (ch === '"') return '"';
    if (ch === "\\") return "\\";
    return ch;
  });

  return quoteSqlString(decoded);
}

function normalizeMySqlJsonLiteral(token) {
  if (isNullToken(token)) return "NULL";
  const parsed = parseSqlStringLiteral(token);
  if (parsed == null) return token;
  const unescaped = unescapeMySqlBackslashString(parsed);
  return quoteSqlString(unescaped);
}

function rewriteCiUniqueByName({
  rows,
  idIndex,
  nameIndex,
  deletedAtIndex,
  activeIndex,
  maxNameLen,
}) {
  const seen = new Map();

  for (const row of rows) {
    const deletedAt = deletedAtIndex === -1 ? "NULL" : (row[deletedAtIndex] ?? "NULL");
    if (!isNullToken(deletedAt)) continue;

    const rawName = row[nameIndex] ?? "NULL";
    const parsed = parseSqlStringLiteral(rawName);
    if (parsed === null) continue;
    const key = parsed.toLowerCase();

    if (!seen.has(key)) {
      seen.set(key, true);
      continue;
    }

    const idToken = row[idIndex] ?? "0";
    const idValue = Number.parseInt(String(idToken).trim(), 10);
    const suffix = ` #${Number.isFinite(idValue) ? idValue : String(idToken).trim()}`;
    const newName = (parsed.slice(0, maxNameLen - suffix.length) + suffix).trim();
    row[nameIndex] = quoteSqlString(newName);
    if (activeIndex !== -1) row[activeIndex] = "false";
  }
}

function rewriteCiUniqueByCode({
  rows,
  idIndex,
  codeIndex,
  deletedAtIndex,
  activeIndex,
  maxCodeLen,
}) {
  const seen = new Map();

  for (const row of rows) {
    const deletedAt = deletedAtIndex === -1 ? "NULL" : (row[deletedAtIndex] ?? "NULL");
    if (!isNullToken(deletedAt)) continue;

    const rawCode = row[codeIndex] ?? "NULL";
    if (isNullToken(rawCode)) continue;

    const parsed = parseSqlStringLiteral(rawCode);
    if (parsed === null) continue;
    const key = parsed.toLowerCase();

    if (!seen.has(key)) {
      seen.set(key, true);
      continue;
    }

    const idToken = row[idIndex] ?? "0";
    const idValue = Number.parseInt(String(idToken).trim(), 10);
    const suffix = `#${Number.isFinite(idValue) ? idValue : String(idToken).trim()}`;
    const newCode = (parsed.slice(0, maxCodeLen - suffix.length) + suffix).trim();
    row[codeIndex] = quoteSqlString(newCode);
    if (activeIndex !== -1) row[activeIndex] = "false";
  }
}

function rewriteInsertForPostgres(insertSql, booleanColumnsByTable) {
  const normalized = insertSql.trim();
  const match = normalized.match(
    /^INSERT INTO public\.(\w+)\s*\(([\s\S]*?)\)\s*VALUES\s*([\s\S]*);$/m
  );
  if (!match) return normalized + "\n";

  const table = match[1];
  const columnsRaw = match[2];
  const valuesRaw = match[3];

  const columns = columnsRaw
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  const booleanCols = new Set(booleanColumnsByTable[table] ?? []);
  const booleanIndexes = [];
  for (let i = 0; i < columns.length; i++) {
    if (booleanCols.has(columns[i])) booleanIndexes.push(i);
  }

  const tuples = splitTuples(valuesRaw);
  const parsedRows = tuples.map((t) => parseTuple(t));

  for (const values of parsedRows) {
    for (let i = 0; i < values.length; i++) {
      values[i] = normalizeMySqlStringToken(values[i] ?? "NULL");
    }
  }

  for (const values of parsedRows) {
    for (const idx of booleanIndexes) {
      const raw = (values[idx] ?? "").trim();
      if (raw === "1") values[idx] = "true";
      else if (raw === "0") values[idx] = "false";
    }
  }

  if (table === "categories") {
    const idIndex = columns.indexOf("id");
    const nameIndex = columns.indexOf("name");
    const deletedAtIndex = columns.indexOf("deleted_at");
    const activeIndex = columns.indexOf("active");
    const codeIndex = columns.indexOf("code");

    if (idIndex !== -1 && nameIndex !== -1) {
      rewriteCiUniqueByName({
        rows: parsedRows,
        idIndex,
        nameIndex,
        deletedAtIndex,
        activeIndex,
        maxNameLen: 140,
      });
    }

    if (idIndex !== -1 && codeIndex !== -1) {
      rewriteCiUniqueByCode({
        rows: parsedRows,
        idIndex,
        codeIndex,
        deletedAtIndex,
        activeIndex,
        maxCodeLen: 40,
      });
    }
  }

  if (table === "expense_classifications") {
    const idIndex = columns.indexOf("id");
    const nameIndex = columns.indexOf("name");
    const activeIndex = columns.indexOf("active");
    if (idIndex !== -1 && nameIndex !== -1) {
      rewriteCiUniqueByName({
        rows: parsedRows,
        idIndex,
        nameIndex,
        deletedAtIndex: -1,
        activeIndex,
        maxNameLen: 140,
      });
    }
  }

  const rewrittenTuples = parsedRows.map((row) => formatTuple(row));

  return `INSERT INTO public.${table} (${columns.join(", ")}) VALUES\n${rewrittenTuples.join(
    ",\n"
  )};\n`;
}

function normalizeInsert(sql) {
  return sql
    .replaceAll("`", "")
    .replaceAll(/INSERT INTO\s+(\w+)/g, "INSERT INTO public.$1")
    .trim();
}

const booleanColumnsByTable = {
  categories: ["active"],
  expense_classifications: ["active"],
  users: ["active"],
};

function rewriteUsersToLegacyUsers(insertSql) {
  const normalized = insertSql.trim();
  const match = normalized.match(
    /^INSERT INTO public\.users\s*\(([\s\S]*?)\)\s*VALUES\s*([\s\S]*);$/m
  );
  if (!match) return normalized + "\n";

  const columns = match[1]
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
  const valuesRaw = match[2];

  const tuples = splitTuples(valuesRaw);
  const rows = tuples.map((t) => parseTuple(t));

  const idx = (name) => columns.indexOf(name);
  const idIndex = idx("id");
  const nameIndex = idx("name");
  const emailIndex = idx("email");
  const emailVerifiedAtIndex = idx("email_verified_at");
  const passwordIndex = idx("password");
  const roleIndex = idx("role");
  const activeIndex = idx("active");
  const createdAtIndex = idx("created_at");
  const updatedAtIndex = idx("updated_at");

  const outColumns = [
    "id",
    "name",
    "email",
    "email_verified_at",
    "password_hash",
    "role",
    "active",
    "created_at",
    "updated_at",
  ];

  const outRows = rows.map((r) => {
    const activeRaw = (r[activeIndex] ?? "").trim();
    const active = activeRaw === "0" ? "false" : "true";
    return [
      r[idIndex],
      normalizeMySqlStringToken(r[nameIndex] ?? "NULL"),
      normalizeMySqlStringToken(r[emailIndex] ?? "NULL"),
      r[emailVerifiedAtIndex],
      normalizeMySqlStringToken(r[passwordIndex] ?? "NULL"),
      normalizeMySqlStringToken(r[roleIndex] ?? "NULL"),
      active,
      r[createdAtIndex],
      r[updatedAtIndex],
    ];
  });

  const rewrittenTuples = outRows.map((row) => formatTuple(row));
  return `INSERT INTO public.legacy_users (${outColumns.join(
    ", "
  )}) VALUES\n${rewrittenTuples.join(",\n")};\n`;
}

function rewriteAuditLogsToLegacyColumns(insertSql) {
  const normalized = insertSql.trim();
  const match = normalized.match(
    /^INSERT INTO public\.audit_logs\s*\(([\s\S]*?)\)\s*VALUES\s*([\s\S]*);$/m
  );
  if (!match) return normalized + "\n";

  const columns = match[1]
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
  const valuesRaw = match[2];

  const tuples = splitTuples(valuesRaw);
  const rows = tuples.map((t) => parseTuple(t));

  const idx = (name) => columns.indexOf(name);
  const idIndex = idx("id");
  const userIdIndex = idx("user_id");
  const actionIndex = idx("action");
  const modelTypeIndex = idx("model_type");
  const modelIdIndex = idx("model_id");
  const oldValuesIndex = idx("old_values");
  const newValuesIndex = idx("new_values");
  const createdAtIndex = idx("created_at");
  const updatedAtIndex = idx("updated_at");

  const outColumns = [
    "legacy_id",
    "legacy_user_id",
    "action",
    "model_type",
    "model_id",
    "old_values",
    "new_values",
    "created_at",
    "updated_at",
  ];

  const outRows = rows.map((r) => {
    const oldValues = normalizeMySqlJsonLiteral(r[oldValuesIndex] ?? "NULL");
    const newValues = normalizeMySqlJsonLiteral(r[newValuesIndex] ?? "NULL");
    return [
      r[idIndex],
      r[userIdIndex],
      normalizeMySqlStringToken(r[actionIndex] ?? "NULL"),
      normalizeMySqlStringToken(r[modelTypeIndex] ?? "NULL"),
      r[modelIdIndex],
      oldValues,
      newValues,
      r[createdAtIndex],
      r[updatedAtIndex],
    ];
  });

  const rewrittenTuples = outRows.map((row) => formatTuple(row));
  return `INSERT INTO public.audit_logs (${outColumns.join(
    ", "
  )}) VALUES\n${rewrittenTuples.join(",\n")};\n`;
}

function transformInsertBlock(table, normalized) {
  if (table === "users") return rewriteUsersToLegacyUsers(normalized);
  if (table === "audit_logs") return rewriteAuditLogsToLegacyColumns(normalized);
  return rewriteInsertForPostgres(normalized, booleanColumnsByTable);
}

const blocks = [];
for (const table of targetTables) {
  for (const block of extractInsertBlocks(table)) {
    const normalized = normalizeInsert(block);
    blocks.push(transformInsertBlock(table, normalized));
  }
}

if (blocks.length === 0) {
  process.stderr.write(
    `Nenhum INSERT encontrado para as tabelas: ${targetTables.join(", ")}\n`
  );
  process.exit(2);
}

const header = [];
header.push("begin;");
header.push("set statement_timeout = 0;");

if (mode === "replace") {
  header.push(
    preset === "sisgerp-dump2"
      ? "truncate table public.audit_logs, public.legacy_users, public.expenses, public.revenues, public.expense_classifications, public.categories, public.city_settings restart identity cascade;"
      : "truncate table public.expenses, public.revenues, public.expense_classifications, public.categories, public.city_settings restart identity cascade;"
  );
} else if (mode !== "append") {
  process.stderr.write(`Modo inválido: ${mode}\n`);
  process.exit(3);
}

const footer = [];
footer.push("do $$");
footer.push("declare");
footer.push("  v bigint;");
footer.push("begin");
footer.push("  select max(id) into v from public.categories;");
footer.push(
  "  if v is null then perform setval(pg_get_serial_sequence('public.categories','id'), 1, false); else perform setval(pg_get_serial_sequence('public.categories','id'), v, true); end if;"
);
footer.push("  select max(id) into v from public.expense_classifications;");
footer.push(
  "  if v is null then perform setval(pg_get_serial_sequence('public.expense_classifications','id'), 1, false); else perform setval(pg_get_serial_sequence('public.expense_classifications','id'), v, true); end if;"
);
footer.push("  select max(id) into v from public.city_settings;");
footer.push(
  "  if v is null then perform setval(pg_get_serial_sequence('public.city_settings','id'), 1, false); else perform setval(pg_get_serial_sequence('public.city_settings','id'), v, true); end if;"
);
footer.push("  select max(id) into v from public.revenues;");
footer.push(
  "  if v is null then perform setval(pg_get_serial_sequence('public.revenues','id'), 1, false); else perform setval(pg_get_serial_sequence('public.revenues','id'), v, true); end if;"
);
footer.push("  select max(id) into v from public.expenses;");
footer.push(
  "  if v is null then perform setval(pg_get_serial_sequence('public.expenses','id'), 1, false); else perform setval(pg_get_serial_sequence('public.expenses','id'), v, true); end if;"
);
footer.push("end $$;");
footer.push("commit;");

const outputSql =
  header.join("\n") + "\n\n" + blocks.join("\n") + "\n" + footer.join("\n") + "\n";

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, outputSql, "utf8");

process.stdout.write(
  [
    "Arquivo gerado com sucesso:",
    outputPath,
    "",
    `Tabelas incluídas: ${targetTables.join(", ")}`,
    `Modo: ${mode}`,
    "",
  ].join("\n")
);
