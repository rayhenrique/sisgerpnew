export type ReceitaReportRow = {
  id: string;
  data: string;
  descricao: string;
  fonte: string;
  bloco: string;
  grupo: string;
  acao: string;
  fonteId: string | null;
  blocoId: string | null;
  grupoId: string | null;
  acaoId: string | null;
  valor: number;
  observacao: string | null;
};
