"use client";

import * as React from "react";
import { ArrowLeft, FileDown, Loader2, PieChart, RotateCcw, Scale, Sheet, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { fetchCategories } from "@/features/categories/api";
import { fetchExpenseClassifications } from "@/features/expenseClassifications/api";
import { fetchCitySettings } from "@/features/settings/api";
import type { Category } from "@/features/categories/types";
import type { ExpenseClassification } from "@/features/expenseClassifications/types";
import type { CitySettings } from "@/features/settings/types";
import { ReportDataTable } from "@/features/reports/ReportDataTable";
import { receitasColumns } from "@/features/reports/columns/receitasColumns";
import { despesasColumns } from "@/features/reports/columns/despesasColumns";
import { balancoColumns } from "@/features/reports/columns/balancoColumns";
import type { ReceitaReportRow } from "@/features/reports/types/receitas";
import type { DespesaReportRow, BalancoReportRow } from "@/features/reports/api/reportsData";
import { fetchReceitasReport, fetchDespesasReport, fetchBalancoReport } from "@/features/reports/api/reportsData";

type ReportType = "receitas" | "despesas" | "balanco" | "classificacao";

type ReportCardConfig = {
  id: ReportType;
  title: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
};

const REPORT_CARDS: ReportCardConfig[] = [
  {
    id: "receitas",
    title: "Receitas",
    description: "Detalhamento de receitas por fonte, data e categorias.",
    icon: TrendingUp,
    iconColor: "text-green-600",
    iconBg: "bg-green-50",
  },
  {
    id: "despesas",
    title: "Despesas",
    description: "Detalhamento de despesas por classificação e credores.",
    icon: TrendingDown,
    iconColor: "text-red-600",
    iconBg: "bg-red-50",
  },
  {
    id: "balanco",
    title: "Balanço",
    description: "Comparativo de entradas e saídas com saldo final.",
    icon: Scale,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
  },
  {
    id: "classificacao",
    title: "Por Classificação",
    description: "Despesas agrupadas por natureza e classificação.",
    icon: PieChart,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-50",
  },
];

export function ReportsPageClient() {
  const [selectedReport, setSelectedReport] = React.useState<ReportType | null>(null);

  if (selectedReport) {
    return (
      <ReportFilterView
        reportType={selectedReport}
        onBack={() => setSelectedReport(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Relatórios</h1>
        <p className="mt-1 text-sm text-slate-600">
          Selecione o tipo de relatório para visualizar ou exportar
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {REPORT_CARDS.map((card) => (
          <Card
            key={card.id}
            className="group cursor-pointer border border-slate-200 bg-white p-6 transition-all hover:shadow-lg hover:-translate-y-1"
            onClick={() => setSelectedReport(card.id)}
          >
            <div className="space-y-4">
              <div className={`inline-flex rounded-lg p-3 ${card.iconBg}`}>
                <card.icon className={`h-6 w-6 ${card.iconColor}`} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{card.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{card.description}</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="w-full group-hover:bg-slate-50"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedReport(card.id);
                }}
              >
                Selecionar
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

type ReportFilterViewProps = {
  reportType: ReportType;
  onBack: () => void;
};

type DatePreset = "today" | "thisMonth" | "lastMonth";

function ReportFilterView({ reportType, onBack }: ReportFilterViewProps) {
  const reportConfig = REPORT_CARDS.find((c) => c.id === reportType);
  const title = reportConfig?.title ?? "Relatório";

  // Categories state
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [fontes, setFontes] = React.useState<Category[]>([]);
  const [blocos, setBlocos] = React.useState<Category[]>([]);
  const [grupos, setGrupos] = React.useState<Category[]>([]);
  const [acoes, setAcoes] = React.useState<Category[]>([]);

  // Expense classifications state
  const [classifications, setClassifications] = React.useState<ExpenseClassification[]>([]);

  // City settings state
  const [citySettings, setCitySettings] = React.useState<CitySettings | null>(null);

  // Filter values
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [fonteId, setFonteId] = React.useState("");
  const [blocoId, setBlocoId] = React.useState("");
  const [grupoId, setGrupoId] = React.useState("");
  const [acaoId, setAcaoId] = React.useState("");
  const [classificationId, setClassificationId] = React.useState("");

  // UI state
  const [loading, setLoading] = React.useState(false);
  const [previewData, setPreviewData] = React.useState<
    ReceitaReportRow[] | DespesaReportRow[] | BalancoReportRow[] | null
  >(null);
  const [previewLoading, setPreviewLoading] = React.useState(false);
  const [previewError, setPreviewError] = React.useState<string | null>(null);

  // Load categories
  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const cats = await fetchCategories();
        if (cancelled) return;
        setCategories(cats.filter((c) => c.active && !c.deleted_at));
        setFontes(cats.filter((c) => c.type === "fonte" && c.active && !c.deleted_at));
      } catch (e) {
        console.error("Error loading categories:", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load city settings
  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const settings = await fetchCitySettings();
        if (cancelled) return;
        setCitySettings(settings);
      } catch (e) {
        console.error("Error loading city settings:", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load expense classifications for despesas report
  React.useEffect(() => {
    if (reportType !== "despesas" && reportType !== "classificacao") return;
    let cancelled = false;
    void (async () => {
      try {
        const result = await fetchExpenseClassifications({ status: "active", pageSize: 200 });
        if (cancelled) return;
        setClassifications(result.rows);
      } catch (e) {
        console.error("Error loading classifications:", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reportType]);

  // Update blocos when fonte changes
  React.useEffect(() => {
    if (!fonteId) {
      setBlocos([]);
      setBlocoId("");
      setGrupos([]);
      setGrupoId("");
      setAcoes([]);
      setAcaoId("");
      return;
    }
    const children = categories.filter((c) => c.type === "bloco" && c.parent_id === fonteId);
    setBlocos(children);
    setBlocoId("");
    setGrupos([]);
    setGrupoId("");
    setAcoes([]);
    setAcaoId("");
  }, [fonteId, categories]);

  // Update grupos when bloco changes
  React.useEffect(() => {
    if (!blocoId) {
      setGrupos([]);
      setGrupoId("");
      setAcoes([]);
      setAcaoId("");
      return;
    }
    const children = categories.filter((c) => c.type === "grupo" && c.parent_id === blocoId);
    setGrupos(children);
    setGrupoId("");
    setAcoes([]);
    setAcaoId("");
  }, [blocoId, categories]);

  // Update acoes when grupo changes
  React.useEffect(() => {
    if (!grupoId) {
      setAcoes([]);
      setAcaoId("");
      return;
    }
    const children = categories.filter((c) => c.type === "acao" && c.parent_id === grupoId);
    setAcoes(children);
    setAcaoId("");
  }, [grupoId, categories]);

  const applyDatePreset = (preset: DatePreset) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    switch (preset) {
      case "today": {
        const dateStr = today.toISOString().split("T")[0];
        setStartDate(dateStr);
        setEndDate(dateStr);
        break;
      }
      case "thisMonth": {
        const firstDay = new Date(year, month, 1).toISOString().split("T")[0];
        const lastDay = new Date(year, month + 1, 0).toISOString().split("T")[0];
        setStartDate(firstDay);
        setEndDate(lastDay);
        break;
      }
      case "lastMonth": {
        const firstDay = new Date(year, month - 1, 1).toISOString().split("T")[0];
        const lastDay = new Date(year, month, 0).toISOString().split("T")[0];
        setStartDate(firstDay);
        setEndDate(lastDay);
        break;
      }
    }
  };

  const handlePreview = async () => {
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const filters = {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        fonteId: fonteId || null,
        blocoId: blocoId || null,
        grupoId: grupoId || null,
        acaoId: acaoId || null,
        classificationId: classificationId || null,
      };

      let data: ReceitaReportRow[] | DespesaReportRow[] | BalancoReportRow[];

      switch (reportType) {
        case "receitas":
          data = await fetchReceitasReport(filters);
          break;
        case "despesas":
          data = await fetchDespesasReport(filters);
          break;
        case "balanco":
          data = await fetchBalancoReport(filters);
          break;
        case "classificacao":
          // For now, use despesas data grouped by classification
          data = await fetchDespesasReport(filters);
          break;
        default:
          data = [];
      }

      setPreviewData(data);
    } catch (e) {
      console.error("Error loading preview:", e);
      setPreviewError(e instanceof Error ? e.message : "Erro ao carregar dados");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownload = async (format: "pdf" | "excel") => {
    setLoading(true);
    try {
      if (format === "excel") {
        // Excel export is handled by the ReportDataTable component
        alert("Use o botão 'Exportar Excel' na tabela de resultados para exportar os dados filtrados.");
        return;
      }

      // PDF Download
      if (!previewData || previewData.length === 0) {
        alert("Por favor, pré-visualize os dados antes de baixar o PDF.");
        return;
      }

      const filters = {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        fonteId: fonteId || null,
        blocoId: blocoId || null,
        grupoId: grupoId || null,
        acaoId: acaoId || null,
        classificationId: classificationId || null,
      };

      // Generate PDF using the browser's print functionality
      generatePDF(reportType, previewData, filters);
    } catch (e) {
      console.error("Error downloading:", e);
      alert("Erro ao gerar o arquivo. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setFonteId("");
    setBlocoId("");
    setGrupoId("");
    setAcaoId("");
    setClassificationId("");
    setPreviewData(null);
    setPreviewError(null);
  };

  const generatePDF = (
    type: ReportType,
    data: ReceitaReportRow[] | DespesaReportRow[] | BalancoReportRow[],
    filters: any
  ) => {
    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Por favor, permita pop-ups para gerar o PDF.");
      return;
    }

    const reportTitle = REPORT_CARDS.find((c) => c.id === type)?.title || "Relatório";
    const currentDate = new Date().toLocaleDateString("pt-BR");
    const currentDateTime = new Date().toLocaleString("pt-BR");

    // Calculate total
    let totalValue = 0;
    let saldoFinal = 0;

    if (type === "balanco") {
      const balancoData = data as BalancoReportRow[];
      saldoFinal = balancoData.length > 0 ? balancoData[balancoData.length - 1].saldo : 0;
    } else {
      totalValue = data.reduce((sum, item: any) => sum + (item.valor || 0), 0);
    }

    // Build city info section
    let cityInfoHtml = "";
    if (citySettings) {
      cityInfoHtml = `
        <div class="city-info">
          <div class="city-name">${citySettings.city_hall_name}</div>
          <div class="city-details">
            ${citySettings.address}${citySettings.zip_code ? ` - CEP: ${citySettings.zip_code}` : ""}
          </div>
          ${citySettings.phone || citySettings.email ? `
            <div class="city-contact">
              ${citySettings.phone ? `Tel: ${citySettings.phone}` : ""}
              ${citySettings.phone && citySettings.email ? " | " : ""}
              ${citySettings.email ? `E-mail: ${citySettings.email}` : ""}
            </div>
          ` : ""}
          ${citySettings.mayor_name ? `
            <div class="city-mayor">Prefeito(a): ${citySettings.mayor_name}</div>
          ` : ""}
        </div>
      `;
    }

    // Build HTML for PDF
    let tableRows = "";

    if (type === "receitas") {
      const receitasData = data as ReceitaReportRow[];
      tableRows = receitasData
        .map(
          (row) => `
        <tr>
          <td>${new Date(row.data).toLocaleDateString("pt-BR")}</td>
          <td>${row.descricao}</td>
          <td>${row.fonte}</td>
          <td>${row.bloco}</td>
          <td>${row.grupo}</td>
          <td>${row.acao}</td>
          <td style="text-align: right; color: #16a34a; font-weight: 600;">
            ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(row.valor)}
          </td>
        </tr>
      `
        )
        .join("");
    } else if (type === "despesas" || type === "classificacao") {
      const despesasData = data as DespesaReportRow[];
      tableRows = despesasData
        .map(
          (row) => `
        <tr>
          <td>${new Date(row.data).toLocaleDateString("pt-BR")}</td>
          <td>${row.descricao}</td>
          <td>${row.classificacao}</td>
          <td>${row.fonte}</td>
          <td>${row.bloco}</td>
          <td>${row.grupo}</td>
          <td>${row.acao}</td>
          <td style="text-align: right; color: #dc2626; font-weight: 600;">
            ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(row.valor)}
          </td>
        </tr>
      `
        )
        .join("");
    } else if (type === "balanco") {
      const balancoData = data as BalancoReportRow[];
      tableRows = balancoData
        .map(
          (row) => `
        <tr>
          <td>${new Date(row.data).toLocaleDateString("pt-BR")}</td>
          <td>${row.tipo}</td>
          <td>${row.descricao}</td>
          <td>${row.fonte}</td>
          <td>${row.bloco}</td>
          <td>${row.grupo}</td>
          <td>${row.acao}</td>
          <td style="text-align: right; color: ${row.tipo === "Receita" ? "#16a34a" : "#dc2626"}; font-weight: 600;">
            ${row.tipo === "Receita" ? "+" : "-"} ${new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(row.valor)}
          </td>
          <td style="text-align: right; color: ${row.saldo >= 0 ? "#2563eb" : "#dc2626"}; font-weight: 700;">
            ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Math.abs(row.saldo))}
          </td>
        </tr>
      `
        )
        .join("");
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Relatório de ${reportTitle}</title>
          <style>
            @media print {
              @page { 
                margin: 1.5cm 1cm;
                size: A4 landscape;
              }
              body { margin: 0; }
            }
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #1e293b;
            }
            .city-info {
              text-align: center;
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 3px solid #2563eb;
            }
            .city-name {
              font-size: 18px;
              font-weight: 700;
              color: #0f172a;
              margin-bottom: 5px;
            }
            .city-details {
              font-size: 11px;
              color: #475569;
              margin-bottom: 3px;
            }
            .city-contact {
              font-size: 10px;
              color: #64748b;
              margin-bottom: 3px;
            }
            .city-mayor {
              font-size: 10px;
              color: #64748b;
              font-style: italic;
            }
            .header {
              text-align: center;
              margin-bottom: 25px;
              padding-bottom: 15px;
              border-bottom: 2px solid #e2e8f0;
            }
            .header h1 {
              margin: 0;
              color: #0f172a;
              font-size: 22px;
            }
            .header p {
              margin: 5px 0;
              color: #64748b;
              font-size: 12px;
            }
            .filters {
              background: #f8fafc;
              padding: 12px;
              border-radius: 6px;
              margin-bottom: 15px;
              font-size: 10px;
            }
            .filters strong {
              color: #0f172a;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 15px;
              font-size: 9px;
            }
            th {
              background: #f1f5f9;
              padding: 8px 6px;
              text-align: left;
              font-weight: 600;
              border-bottom: 2px solid #cbd5e1;
              color: #0f172a;
            }
            td {
              padding: 6px;
              border-bottom: 1px solid #e2e8f0;
            }
            tr:hover {
              background: #f8fafc;
            }
            .total {
              text-align: right;
              font-size: 14px;
              font-weight: 700;
              margin-top: 15px;
              padding: 12px;
              background: #f8fafc;
              border-radius: 6px;
            }
            .footer {
              margin-top: 25px;
              text-align: center;
              font-size: 9px;
              color: #94a3b8;
              border-top: 1px solid #e2e8f0;
              padding-top: 12px;
            }
            .generation-info {
              font-size: 8px;
              color: #cbd5e1;
              margin-top: 5px;
            }
          </style>
        </head>
        <body>
          ${cityInfoHtml}

          <div class="header">
            <h1>Relatório de ${reportTitle}</h1>
            <p>Gerado em: ${currentDate}</p>
          </div>

          <div class="filters">
            ${filters.startDate ? `<p><strong>Data Inicial:</strong> ${new Date(filters.startDate).toLocaleDateString("pt-BR")}</p>` : ""}
            ${filters.endDate ? `<p><strong>Data Final:</strong> ${new Date(filters.endDate).toLocaleDateString("pt-BR")}</p>` : ""}
            ${filters.fonteId ? `<p><strong>Filtros de categoria aplicados</strong></p>` : ""}
            ${filters.classificationId ? `<p><strong>Filtro de classificação aplicado</strong></p>` : ""}
            <p><strong>Total de registros:</strong> ${data.length}</p>
          </div>

          <table>
            <thead>
              <tr>
                ${
                  type === "receitas"
                    ? "<th>Data</th><th>Descrição</th><th>Fonte</th><th>Bloco</th><th>Grupo</th><th>Ação</th><th style='text-align: right;'>Valor</th>"
                    : type === "despesas" || type === "classificacao"
                    ? "<th>Data</th><th>Descrição</th><th>Classificação</th><th>Fonte</th><th>Bloco</th><th>Grupo</th><th>Ação</th><th style='text-align: right;'>Valor</th>"
                    : "<th>Data</th><th>Tipo</th><th>Descrição</th><th>Fonte</th><th>Bloco</th><th>Grupo</th><th>Ação</th><th style='text-align: right;'>Valor</th><th style='text-align: right;'>Saldo</th>"
                }
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>

          <div class="total">
            ${
              type === "balanco"
                ? `Saldo Final: <span style="color: ${saldoFinal >= 0 ? "#2563eb" : "#dc2626"};">${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(saldoFinal)}</span>`
                : `Total: <span style="color: ${type === "receitas" ? "#16a34a" : "#dc2626"};">${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalValue)}</span>`
            }
          </div>

          <div class="footer">
            <p><strong>SISGERP</strong> - Sistema de Gestão de Recursos Públicos</p>
            <p class="generation-info">Documento gerado em: ${currentDateTime}</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Relatório de {title}</h1>
        </div>
      </div>

      <Card className="border border-slate-200 bg-white p-6">
        <div className="space-y-6">
          {/* Date Filters */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Período</Label>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-slate-100"
                onClick={() => applyDatePreset("today")}
              >
                Hoje
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-slate-100"
                onClick={() => applyDatePreset("thisMonth")}
              >
                Este Mês
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-slate-100"
                onClick={() => applyDatePreset("lastMonth")}
              >
                Mês Passado
              </Badge>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Data Inicial</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Data Final</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-11"
                />
              </div>
            </div>
          </div>

          {/* Category Filters */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Categorias</Label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fonte">Fonte</Label>
                <Select value={fonteId} onValueChange={setFonteId}>
                  <SelectTrigger id="fonte" className="h-11">
                    <SelectValue placeholder="Selecione a fonte" />
                  </SelectTrigger>
                  <SelectContent>
                    {fontes.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bloco">Bloco</Label>
                <Select value={blocoId} onValueChange={setBlocoId} disabled={!fonteId}>
                  <SelectTrigger id="bloco" className="h-11">
                    <SelectValue placeholder="Selecione o bloco" />
                  </SelectTrigger>
                  <SelectContent>
                    {blocos.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="grupo">Grupo</Label>
                <Select value={grupoId} onValueChange={setGrupoId} disabled={!blocoId}>
                  <SelectTrigger id="grupo" className="h-11">
                    <SelectValue placeholder="Selecione o grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    {grupos.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="acao">Ação</Label>
                <Select value={acaoId} onValueChange={setAcaoId} disabled={!grupoId}>
                  <SelectTrigger id="acao" className="h-11">
                    <SelectValue placeholder="Selecione a ação" />
                  </SelectTrigger>
                  <SelectContent>
                    {acoes.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Expense Classification Filter (only for despesas and classificacao) */}
          {(reportType === "despesas" || reportType === "classificacao") && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Classificação de Despesa</Label>
              <Select value={classificationId} onValueChange={setClassificationId}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Selecione a classificação" />
                </SelectTrigger>
                <SelectContent>
                  {classifications.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4">
            <Button
              variant="ghost"
              className="flex-1 min-w-[200px] h-11"
              onClick={clearFilters}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Limpar Filtros
            </Button>
            <Button
              variant="secondary"
              className="flex-1 min-w-[200px] h-11"
              onClick={handlePreview}
              disabled={previewLoading || loading}
            >
              {previewLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Carregando...
                </>
              ) : (
                "Pré-visualizar na Tela"
              )}
            </Button>
            <Button
              className="flex-1 min-w-[200px] h-11"
              onClick={() => handleDownload("pdf")}
              disabled={loading || previewLoading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <FileDown className="mr-2 h-4 w-4" />
                  Baixar PDF
                </>
              )}
            </Button>
            <Button
              variant="secondary"
              className="flex-1 min-w-[200px] h-11"
              onClick={() => handleDownload("excel")}
              disabled={loading || previewLoading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sheet className="mr-2 h-4 w-4" />
                  Baixar Excel
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Preview Results */}
      {previewError && (
        <Card className="border border-red-200 bg-red-50 p-4">
          <div className="text-sm text-red-700">{previewError}</div>
        </Card>
      )}

      {previewData && previewData.length > 0 && (
        <Card className="border border-slate-200 bg-white p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Resultados</h2>
              <div className="text-sm text-slate-600">
                {reportType === "balanco" ? (
                  <>
                    Saldo Final:{" "}
                    <span
                      className={`font-semibold ${
                        (previewData as BalancoReportRow[])[previewData.length - 1]?.saldo >= 0
                          ? "text-blue-600"
                          : "text-red-600"
                      }`}
                    >
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format((previewData as BalancoReportRow[])[previewData.length - 1]?.saldo || 0)}
                    </span>
                  </>
                ) : (
                  <>
                    Total:{" "}
                    <span
                      className={`font-semibold ${
                        reportType === "receitas" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(
                        previewData.reduce((sum, item: any) => sum + (item.valor || 0), 0)
                      )}
                    </span>
                  </>
                )}
              </div>
            </div>

            <ReportDataTable
              columns={
                (reportType === "receitas"
                  ? receitasColumns
                  : reportType === "despesas" || reportType === "classificacao"
                  ? despesasColumns
                  : balancoColumns) as any
              }
              data={previewData as any}
              searchPlaceholder="Buscar por descrição, fonte..."
              exportFileName={`relatorio_${reportType}_${new Date().toISOString().split("T")[0]}`}
            />
          </div>
        </Card>
      )}

      {previewData && previewData.length === 0 && (
        <Card className="border border-slate-200 bg-white p-6">
          <div className="text-center text-slate-500">
            Nenhum registro encontrado para os filtros selecionados.
          </div>
        </Card>
      )}
    </div>
  );
}
