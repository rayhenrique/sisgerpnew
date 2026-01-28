export type ReportFormat = "PDF" | "XLSX" | "CSV";

export type ReportJobStatus = "QUEUED" | "RUNNING" | "READY" | "FAILED";

export type ReportDefinition = {
  key: string;
  category: string;
  name: string;
  description: string;
  supportsCategoryFilter: boolean;
};

export type CreateReportJobInput = {
  reportKey: string;
  category: string;
  periodStart: string;
  periodEnd: string;
  format: ReportFormat;
  categoryId?: string | null;
  useCache: boolean;
};

export type ReportJobRow = {
  id: string;
  user_id: string;
  schedule_id: string | null;
  report_key: string;
  category: string;
  period_start: string;
  period_end: string;
  category_id: string | null;
  format: ReportFormat;
  status: ReportJobStatus;
  cache_key: string | null;
  storage_path: string | null;
  error_message: string | null;
  queued_at: string;
  started_at: string | null;
  finished_at: string | null;
};

export type CreateScheduleInput = {
  name: string;
  reportKey: string;
  category: string;
  format: ReportFormat;
  useCache: boolean;
  categoryId?: string | null;
  periodWindow: "last7d" | "last30d" | "monthToDate" | "yearToDate";
  recurrence: "daily" | "weekly" | "monthly";
  time: string;
  weekday?: number;
  dayOfMonth?: number;
};

export type ReportScheduleRow = {
  id: string;
  user_id: string;
  name: string;
  report_key: string;
  category: string;
  category_id: string | null;
  format: ReportFormat;
  use_cache: boolean;
  period_window: "last7d" | "last30d" | "monthToDate" | "yearToDate";
  cron: string;
  is_paused: boolean;
  next_run_at: string | null;
  created_at: string;
  updated_at: string;
};

