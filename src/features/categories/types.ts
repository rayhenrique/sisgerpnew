export type CategoryType = "fonte" | "bloco" | "grupo" | "acao";

export type Category = {
  id: string;
  name: string;
  type: CategoryType;
  parent_id: string | null;
  code?: string | null;
  description?: string | null;
  active?: boolean | null;
  deleted_at?: string | null;
};

export type CategoryNode = Category & {
  children: CategoryNode[];
};

