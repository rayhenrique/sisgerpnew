export type ExpenseClassification = {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  active: boolean;
};

export type StatusFilter = "all" | "active" | "inactive";
