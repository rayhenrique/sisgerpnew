export type CategoryType = "fonte" | "bloco" | "grupo" | "acao";

export type Category = {
  id: string;
  name: string;
  type: CategoryType;
  parent_id: string | null;
};

export type ExpenseClassification = {
  id: string;
  name: string;
  code: string;
};

export type ExpenseType = string;

export type Expense = {
  id: string;
  description: string;
  amount: number;
  date: string;
  source_id: string | null;
  category_id: string | null;
  classification_id: string | null;
  type: ExpenseType | null;
};

export type ExpenseRow = Expense & {
  sourceName: string | null;
  classificationCode: string | null;
  classificationName: string | null;
};

