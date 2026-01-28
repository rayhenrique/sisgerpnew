export type CategoryType = "fonte" | "bloco" | "grupo" | "acao";

export type Category = {
  id: string;
  name: string;
  type: CategoryType;
  parent_id: string | null;
};

export type RevenueType = string;

export type Revenue = {
  id: string;
  description: string;
  amount: number;
  date: string;
  source_id: string | null;
  category_id: string | null;
  type: RevenueType | null;
};

export type RevenueRow = Revenue & {
  sourceName: string | null;
};

