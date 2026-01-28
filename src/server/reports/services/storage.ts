import type { SupabaseClient } from "@supabase/supabase-js";

export const REPORTS_BUCKET = "report-files";

export async function ensureReportsBucket(supabase: SupabaseClient) {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) return;
    const exists = (buckets ?? []).some((b) => b.name === REPORTS_BUCKET);
    if (exists) return;
    await supabase.storage.createBucket(REPORTS_BUCKET, { public: false });
  } catch {
    return;
  }
}

export async function uploadReportFile(input: {
  supabase: SupabaseClient;
  path: string;
  contentType: string;
  bytes: Uint8Array;
}) {
  await ensureReportsBucket(input.supabase);
  const { error } = await input.supabase.storage
    .from(REPORTS_BUCKET)
    .upload(input.path, input.bytes, {
      contentType: input.contentType,
      upsert: true,
    });
  if (error) throw new Error(error.message);
}

export async function createSignedDownloadUrl(input: {
  supabase: SupabaseClient;
  path: string;
  expiresInSeconds: number;
}) {
  const { data, error } = await input.supabase.storage
    .from(REPORTS_BUCKET)
    .createSignedUrl(input.path, input.expiresInSeconds);
  if (error) throw new Error(error.message);
  const url = data?.signedUrl;
  if (!url) throw new Error("Falha ao gerar link de download");
  return url;
}

