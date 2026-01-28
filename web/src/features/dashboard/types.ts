export type TransactionType = "receita" | "despesa";

export type MonthlyTotals = {
  month: string;
  receitas: number;
  despesas: number;
};

export type CategoryDistribution = {
  name: string;
  value: number;
  color: string;
};

export type Transaction = {
  id: string;
  date: string;
  description: string;
  type: TransactionType;
  amount: number;
};

export type DashboardOverview = {
  totals: {
    receitas: number;
    despesas: number;
    saldo: number;
  };
  monthly: MonthlyTotals[];
  categories: CategoryDistribution[];
  recentTransactions: Transaction[];
};

