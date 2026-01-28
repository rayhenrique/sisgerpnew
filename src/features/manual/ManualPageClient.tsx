"use client";

import * as React from "react";
import {
  BookOpen,
  Home,
  Tag,
  FileText,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Settings,
  Users,
  ShieldCheck,
  ChevronRight,
  Search,
  HelpCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type ManualSection = {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  content: React.ReactNode;
  keywords: string[];
};

const MANUAL_SECTIONS: ManualSection[] = [
  {
    id: "introducao",
    title: "Introdução ao SISGERP",
    icon: BookOpen,
    description: "Visão geral do sistema e primeiros passos",
    keywords: ["introdução", "começar", "início", "visão geral", "o que é"],
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">O que é o SISGERP?</h3>
        <p className="text-slate-700">
          O SISGERP (Sistema de Gestão de Recursos Públicos) é uma plataforma completa para
          gerenciamento financeiro de prefeituras municipais. O sistema permite controlar receitas,
          despesas, gerar relatórios e manter a conformidade com as normas de gestão pública.
        </p>

        <h3 className="text-lg font-semibold text-slate-900 mt-6">Principais Funcionalidades</h3>
        <ul className="list-disc list-inside space-y-2 text-slate-700">
          <li>Gestão de Receitas e Despesas</li>
          <li>Classificação orçamentária (Fonte, Bloco, Grupo, Ação)</li>
          <li>Relatórios financeiros em PDF e Excel</li>
          <li>Controle de usuários e auditoria</li>
          <li>Dashboard com visão geral das finanças</li>
        </ul>

        <h3 className="text-lg font-semibold text-slate-900 mt-6">Primeiros Passos</h3>
        <ol className="list-decimal list-inside space-y-2 text-slate-700">
          <li>Configure as informações da prefeitura em <strong>Configurações</strong></li>
          <li>Cadastre as categorias orçamentárias em <strong>Categorias</strong></li>
          <li>Cadastre as classificações de despesas</li>
          <li>Comece a registrar receitas e despesas</li>
          <li>Gere relatórios para análise e prestação de contas</li>
        </ol>
      </div>
    ),
  },
  {
    id: "dashboard",
    title: "Dashboard",
    icon: Home,
    description: "Visão geral das finanças municipais",
    keywords: ["dashboard", "início", "visão geral", "resumo", "gráficos"],
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Painel Principal</h3>
        <p className="text-slate-700">
          O Dashboard apresenta uma visão consolidada das finanças municipais, com gráficos e
          indicadores importantes para tomada de decisão.
        </p>

        <h3 className="text-lg font-semibold text-slate-900 mt-6">Informações Exibidas</h3>
        <ul className="list-disc list-inside space-y-2 text-slate-700">
          <li><strong>Total de Receitas:</strong> Soma de todas as receitas do período</li>
          <li><strong>Total de Despesas:</strong> Soma de todas as despesas do período</li>
          <li><strong>Saldo:</strong> Diferença entre receitas e despesas</li>
          <li><strong>Gráficos:</strong> Visualização temporal das movimentações</li>
        </ul>

        <h3 className="text-lg font-semibold text-slate-900 mt-6">Filtros</h3>
        <p className="text-slate-700">
          Use os filtros de período para visualizar dados de diferentes intervalos de tempo
          (mês atual, trimestre, ano, etc.).
        </p>
      </div>
    ),
  },
  {
    id: "categorias",
    title: "Categorias Orçamentárias",
    icon: Tag,
    description: "Estrutura de classificação orçamentária",
    keywords: ["categorias", "fonte", "bloco", "grupo", "ação", "orçamento"],
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Estrutura Hierárquica</h3>
        <p className="text-slate-700">
          As categorias seguem uma estrutura hierárquica de 4 níveis:
        </p>

        <div className="bg-slate-50 p-4 rounded-lg space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700">Fonte</Badge>
            <ChevronRight className="h-4 w-4 text-slate-400" />
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700">Bloco</Badge>
            <ChevronRight className="h-4 w-4 text-slate-400" />
            <Badge variant="outline" className="bg-violet-50 text-violet-700">Grupo</Badge>
            <ChevronRight className="h-4 w-4 text-slate-400" />
            <Badge variant="outline" className="bg-cyan-50 text-cyan-700">Ação</Badge>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 mt-6">Como Cadastrar</h3>
        <ol className="list-decimal list-inside space-y-2 text-slate-700">
          <li>Acesse o menu <strong>Categorias</strong></li>
          <li>Clique em <strong>Nova Categoria</strong></li>
          <li>Selecione o tipo (Fonte, Bloco, Grupo ou Ação)</li>
          <li>Se não for Fonte, selecione a categoria pai</li>
          <li>Preencha nome, código (opcional) e descrição</li>
          <li>Clique em <strong>Salvar</strong></li>
        </ol>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mt-4">
          <p className="text-sm text-blue-900">
            <strong>💡 Dica:</strong> Cadastre as categorias na ordem hierárquica: primeiro as
            Fontes, depois os Blocos, Grupos e por último as Ações.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "classificacao-despesas",
    title: "Classificação de Despesas",
    icon: FileText,
    description: "Natureza e classificação das despesas",
    keywords: ["classificação", "despesas", "natureza", "tipo"],
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">O que são Classificações?</h3>
        <p className="text-slate-700">
          As classificações de despesas definem a natureza do gasto, como "Pessoal e Encargos",
          "Material de Consumo", "Serviços de Terceiros", etc.
        </p>

        <h3 className="text-lg font-semibold text-slate-900 mt-6">Como Cadastrar</h3>
        <ol className="list-decimal list-inside space-y-2 text-slate-700">
          <li>Acesse <strong>Classificação de Despesas</strong></li>
          <li>Clique em <strong>Nova Classificação</strong></li>
          <li>Preencha o nome (ex: "Pessoal e Encargos")</li>
          <li>Adicione um código (opcional, ex: "3.1.90")</li>
          <li>Adicione uma descrição explicativa</li>
          <li>Clique em <strong>Salvar</strong></li>
        </ol>

        <h3 className="text-lg font-semibold text-slate-900 mt-6">Ativar/Desativar</h3>
        <p className="text-slate-700">
          Classificações podem ser ativadas ou desativadas sem serem excluídas. Classificações
          inativas não aparecem nos formulários de cadastro de despesas.
        </p>
      </div>
    ),
  },
  {
    id: "receitas",
    title: "Gestão de Receitas",
    icon: TrendingUp,
    description: "Registro e controle de receitas municipais",
    keywords: ["receitas", "entrada", "arrecadação", "cadastrar"],
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Cadastrar Nova Receita</h3>
        <ol className="list-decimal list-inside space-y-2 text-slate-700">
          <li>Acesse o menu <strong>Receitas</strong></li>
          <li>Clique em <strong>Nova Receita</strong></li>
          <li>Preencha a descrição (ex: "Transferência FPM")</li>
          <li>Informe o valor</li>
          <li>Selecione a data de recebimento</li>
          <li>Selecione a classificação orçamentária (Fonte → Bloco → Grupo → Ação)</li>
          <li>Adicione observações se necessário</li>
          <li>Clique em <strong>Salvar</strong></li>
        </ol>

        <h3 className="text-lg font-semibold text-slate-900 mt-6">Editar ou Excluir</h3>
        <p className="text-slate-700">
          Na lista de receitas, clique no ícone de edição (lápis) para modificar ou no ícone de
          exclusão (lixeira) para remover uma receita.
        </p>

        <div className="bg-green-50 border border-green-200 p-4 rounded-lg mt-4">
          <p className="text-sm text-green-900">
            <strong>✓ Boas Práticas:</strong> Sempre preencha a classificação orçamentária
            completa para facilitar a geração de relatórios detalhados.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "despesas",
    title: "Gestão de Despesas",
    icon: TrendingDown,
    description: "Registro e controle de despesas municipais",
    keywords: ["despesas", "saída", "pagamento", "gasto", "cadastrar"],
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Cadastrar Nova Despesa</h3>
        <ol className="list-decimal list-inside space-y-2 text-slate-700">
          <li>Acesse o menu <strong>Despesas</strong></li>
          <li>Clique em <strong>Nova Despesa</strong></li>
          <li>Preencha a descrição (ex: "Pagamento de Salários")</li>
          <li>Informe o valor</li>
          <li>Selecione a data do pagamento</li>
          <li>Selecione a classificação de despesa (ex: "Pessoal e Encargos")</li>
          <li>Selecione a classificação orçamentária (Fonte → Bloco → Grupo → Ação)</li>
          <li>Adicione observações se necessário</li>
          <li>Clique em <strong>Salvar</strong></li>
        </ol>

        <h3 className="text-lg font-semibold text-slate-900 mt-6">Filtros e Busca</h3>
        <p className="text-slate-700">
          Use os filtros de período e classificação para encontrar despesas específicas. A busca
          permite localizar despesas por descrição ou valor.
        </p>

        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mt-4">
          <p className="text-sm text-red-900">
            <strong>⚠️ Atenção:</strong> Despesas excluídas não podem ser recuperadas. Certifique-se
            antes de confirmar a exclusão.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "relatorios",
    title: "Relatórios",
    icon: BarChart3,
    description: "Geração de relatórios financeiros",
    keywords: ["relatórios", "pdf", "excel", "exportar", "imprimir"],
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Tipos de Relatórios</h3>
        <div className="space-y-3">
          <div className="bg-slate-50 p-3 rounded-lg">
            <h4 className="font-semibold text-slate-900">Receitas</h4>
            <p className="text-sm text-slate-700">
              Detalhamento de todas as receitas por fonte, data e categorias orçamentárias.
            </p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg">
            <h4 className="font-semibold text-slate-900">Despesas</h4>
            <p className="text-sm text-slate-700">
              Detalhamento de todas as despesas por classificação e categorias orçamentárias.
            </p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg">
            <h4 className="font-semibold text-slate-900">Balanço</h4>
            <p className="text-sm text-slate-700">
              Comparativo de entradas e saídas com saldo acumulado ao longo do tempo.
            </p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg">
            <h4 className="font-semibold text-slate-900">Por Classificação</h4>
            <p className="text-sm text-slate-700">
              Despesas agrupadas por natureza e classificação orçamentária.
            </p>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 mt-6">Como Gerar um Relatório</h3>
        <ol className="list-decimal list-inside space-y-2 text-slate-700">
          <li>Acesse <strong>Relatórios</strong></li>
          <li>Selecione o tipo de relatório desejado</li>
          <li>Aplique os filtros (período, categorias, classificação)</li>
          <li>Clique em <strong>Pré-visualizar na Tela</strong> para ver os dados</li>
          <li>Use <strong>Baixar PDF</strong> para gerar documento imprimível</li>
          <li>Use <strong>Exportar Excel</strong> na tabela para análise em planilha</li>
        </ol>

        <h3 className="text-lg font-semibold text-slate-900 mt-6">Recursos da Tabela</h3>
        <ul className="list-disc list-inside space-y-2 text-slate-700">
          <li><strong>Busca:</strong> Localize dados específicos digitando na caixa de busca</li>
          <li><strong>Ordenação:</strong> Clique nos cabeçalhos para ordenar colunas</li>
          <li><strong>Ocultar Colunas:</strong> Use "Visualizar Colunas" para personalizar</li>
          <li><strong>Paginação:</strong> Navegue entre páginas com os botões inferior</li>
        </ul>
      </div>
    ),
  },
  {
    id: "configuracoes",
    title: "Configurações",
    icon: Settings,
    description: "Configurações da prefeitura e do sistema",
    keywords: ["configurações", "prefeitura", "dados", "município"],
    content: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Informações da Prefeitura</h3>
        <p className="text-slate-700">
          Configure os dados da prefeitura que serão exibidos nos relatórios e documentos oficiais.
        </p>

        <h3 className="text-lg font-semibold text-slate-900 mt-6">Dados Cadastrados</h3>
        <ul className="list-disc list-inside space-y-2 text-slate-700">
          <li>Nome do Município</li>
          <li>Nome da Prefeitura</li>
          <li>Código IBGE</li>
          <li>Estado (UF)</li>
          <li>Endereço completo</li>
          <li>CEP</li>
          <li>Telefone</li>
          <li>E-mail</li>
          <li>Nome do Prefeito(a)</li>
        </ul>

        <h3 className="text-lg font-semibold text-slate-900 mt-6">Onde São Usados</h3>
        <p className="text-slate-700">
          Estes dados aparecem:
        </p>
        <ul className="list-disc list-inside space-y-2 text-slate-700">
          <li>Cabeçalho dos relatórios em PDF</li>
          <li>Rodapé de documentos oficiais</li>
          <li>Identificação do município no sistema</li>
        </ul>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mt-4">
          <p className="text-sm text-blue-900">
            <strong>💡 Importante:</strong> Mantenha estes dados sempre atualizados para garantir
            a conformidade dos documentos gerados pelo sistema.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "usuarios",
    title: "Gestão de Usuários",
    icon: Users,
    description: "Controle de acesso e permissões (Admin)",
    keywords: ["usuários", "admin", "permissões", "acesso", "senha"],
    content: (
      <div className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
          <p className="text-sm text-amber-900">
            <strong>🔒 Acesso Restrito:</strong> Este módulo está disponível apenas para
            administradores e superadministradores.
          </p>
        </div>

        <h3 className="text-lg font-semibold text-slate-900">Níveis de Acesso</h3>
        <div className="space-y-2">
          <div className="bg-slate-50 p-3 rounded-lg">
            <h4 className="font-semibold text-slate-900">Operador</h4>
            <p className="text-sm text-slate-700">
              Pode cadastrar e visualizar receitas, despesas e gerar relatórios.
            </p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg">
            <h4 className="font-semibold text-slate-900">Admin</h4>
            <p className="text-sm text-slate-700">
              Todas as permissões do Operador + gerenciar usuários e visualizar auditoria.
            </p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg">
            <h4 className="font-semibold text-slate-900">Superadmin</h4>
            <p className="text-sm text-slate-700">
              Acesso total ao sistema, incluindo promover outros usuários a Admin.
            </p>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 mt-6">Cadastrar Novo Usuário</h3>
        <ol className="list-decimal list-inside space-y-2 text-slate-700">
          <li>Acesse <strong>Administração → Usuários</strong></li>
          <li>Clique em <strong>Novo Usuário</strong></li>
          <li>Preencha nome, e-mail e senha</li>
          <li>Selecione o nível de acesso</li>
          <li>Clique em <strong>Salvar</strong></li>
        </ol>
      </div>
    ),
  },
  {
    id: "auditoria",
    title: "Auditoria",
    icon: ShieldCheck,
    description: "Registro de ações no sistema (Admin)",
    keywords: ["auditoria", "log", "histórico", "ações", "rastreamento"],
    content: (
      <div className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
          <p className="text-sm text-amber-900">
            <strong>🔒 Acesso Restrito:</strong> Este módulo está disponível apenas para
            administradores e superadministradores.
          </p>
        </div>

        <h3 className="text-lg font-semibold text-slate-900">O que é Auditoria?</h3>
        <p className="text-slate-700">
          O módulo de auditoria registra todas as ações importantes realizadas no sistema,
          permitindo rastreabilidade e conformidade com normas de gestão pública.
        </p>

        <h3 className="text-lg font-semibold text-slate-900 mt-6">Ações Registradas</h3>
        <ul className="list-disc list-inside space-y-2 text-slate-700">
          <li>Criação, edição e exclusão de usuários</li>
          <li>Criação, edição e exclusão de categorias</li>
          <li>Criação, edição e exclusão de classificações</li>
          <li>Alterações em configurações do sistema</li>
        </ul>

        <h3 className="text-lg font-semibold text-slate-900 mt-6">Informações do Log</h3>
        <p className="text-slate-700">
          Cada registro de auditoria contém:
        </p>
        <ul className="list-disc list-inside space-y-2 text-slate-700">
          <li>Usuário que realizou a ação</li>
          <li>Data e hora da ação</li>
          <li>Tipo de ação (criar, editar, excluir)</li>
          <li>Modelo afetado (usuário, categoria, etc.)</li>
          <li>Valores antigos e novos (quando aplicável)</li>
        </ul>
      </div>
    ),
  },
];

export function ManualPageClient() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedSection, setSelectedSection] = React.useState<string | null>(null);

  const filteredSections = React.useMemo(() => {
    if (!searchTerm) return MANUAL_SECTIONS;

    const term = searchTerm.toLowerCase();
    return MANUAL_SECTIONS.filter(
      (section) =>
        section.title.toLowerCase().includes(term) ||
        section.description.toLowerCase().includes(term) ||
        section.keywords.some((keyword) => keyword.includes(term))
    );
  }, [searchTerm]);

  const currentSection = selectedSection
    ? MANUAL_SECTIONS.find((s) => s.id === selectedSection)
    : null;

  if (currentSection) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedSection(null)}
            className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1"
          >
            ← Voltar ao índice
          </button>
        </div>

        <Card className="border border-slate-200 bg-white p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
              <currentSection.icon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">{currentSection.title}</h1>
              <p className="text-sm text-slate-600">{currentSection.description}</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none">{currentSection.content}</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Manual do Usuário</h1>
        <p className="mt-1 text-sm text-slate-600">
          Guia completo para utilização do SISGERP
        </p>
      </div>

      {/* Search */}
      <Card className="border border-slate-200 bg-white p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar no manual... (ex: receitas, relatórios, usuários)"
            className="pl-10"
          />
        </div>
      </Card>

      {/* Sections Grid */}
      {filteredSections.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSections.map((section) => (
            <Card
              key={section.id}
              className="group cursor-pointer border border-slate-200 bg-white p-6 transition-all hover:shadow-lg hover:-translate-y-1"
              onClick={() => setSelectedSection(section.id)}
            >
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                  <section.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{section.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{section.description}</p>
                </div>
                <div className="flex items-center text-sm text-blue-600 font-medium">
                  Ler mais
                  <ChevronRight className="ml-1 h-4 w-4" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border border-slate-200 bg-white p-12 text-center">
          <HelpCircle className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Nenhum resultado encontrado
          </h3>
          <p className="text-sm text-slate-600">
            Tente buscar por outros termos como "receitas", "relatórios" ou "usuários"
          </p>
        </Card>
      )}

      {/* Help Card */}
      <Card className="border border-blue-200 bg-blue-50 p-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <HelpCircle className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Precisa de mais ajuda?</h3>
            <p className="text-sm text-blue-800">
              Se você não encontrou o que procurava neste manual, entre em contato com o suporte
              técnico ou com o administrador do sistema da sua prefeitura.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
