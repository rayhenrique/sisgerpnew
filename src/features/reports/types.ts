export type ReportFormat = "PDF" | "XLSX" | "CSV";
export type ReportJobStatus = "QUEUED" | "RUNNING" | "READY" | "FAILED";

export type ReportDefinition = {
  key: string;
  category: string;
  name: string;
  description: string;
  supportsCategoryFilter: boolean;
};

export type ReportJob = {
  id: string;
  report_key: string;
  category: string;
  period_start: string;
  period_end: string;
  category_id: string | null;
  format: ReportFormat;
  status: ReportJobStatus;
  error_message: string | null;
  queued_at: string;
  started_at: string | null;
  finished_at: string | null;
};

export type ReportSchedule = {
  id: string;
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

