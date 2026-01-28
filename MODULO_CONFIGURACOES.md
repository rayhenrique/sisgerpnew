# 🔧 Módulo de Configurações - SISGERP

## 📋 Visão Geral

O módulo de Configurações permite gerenciar as informações da prefeitura que são utilizadas em relatórios, documentos oficiais e no cabeçalho do sistema.

**URL:** `http://localhost:3000/configuracoes`

## 🎯 Funcionalidades

### 1. **Gerenciamento de Informações da Prefeitura**

O módulo permite cadastrar e editar:

#### **Informações Básicas**
- ✅ Nome do Município (obrigatório)
- ✅ Nome da Prefeitura (obrigatório)
- ✅ Código IBGE (obrigatório, 7 dígitos)
- ✅ Estado/UF (obrigatório, seleção)

#### **Endereço**
- ✅ Endereço Completo (obrigatório)
- ✅ CEP (opcional, formatado automaticamente)

#### **Contato**
- ✅ Telefone (opcional, formatado automaticamente)
- ✅ E-mail (opcional, validação de formato)

#### **Gestor Municipal**
- ✅ Nome do Prefeito(a) (opcional)

### 2. **Formatação Automática**

**Telefone:**
- Formato: `(00) 00000-0000` ou `(00) 0000-0000`
- Remove caracteres não numéricos automaticamente
- Aplica máscara durante digitação

**CEP:**
- Formato: `00000-000`
- Remove caracteres não numéricos automaticamente
- Aplica máscara durante digitação

**Código IBGE:**
- Apenas números
- Máximo 7 dígitos

### 3. **Validações**

**Campos Obrigatórios:**
- Nome do Município
- Nome da Prefeitura
- Código IBGE
- Estado (UF)
- Endereço Completo

**Validações de Formato:**
- E-mail: Validação HTML5 nativa
- Telefone: Aceita 10 ou 11 dígitos
- CEP: Aceita 8 dígitos
- Código IBGE: Aceita 7 dígitos

### 4. **Estados de Interface**

**Loading:**
- Spinner centralizado durante carregamento inicial
- Indica que os dados estão sendo buscados

**Salvando:**
- Botão desabilitado com spinner
- Texto "Salvando..." durante operação

**Sucesso:**
- Card verde com ícone de check
- Mensagem: "Configurações salvas com sucesso!"
- Desaparece automaticamente após 3 segundos

**Erro:**
- Card vermelho com mensagem de erro
- Exibe detalhes do erro retornado pela API

## 🎨 Design e Layout

### Estrutura Visual

```
┌─────────────────────────────────────────────────────────┐
│ Configurações do Sistema                                │
│ Configure as informações da prefeitura...               │
├─────────────────────────────────────────────────────────┤
│ [Mensagem de Sucesso/Erro - se houver]                 │
├─────────────────────────────────────────────────────────┤
│ ┌─ Informações Básicas ────────────────────────────┐   │
│ │ 🏢 Nome do Município    │ Nome da Prefeitura     │   │
│ │ # Código IBGE           │ 🗺 Estado (UF)         │   │
│ └──────────────────────────────────────────────────┘   │
│                                                          │
│ ┌─ Endereço ───────────────────────────────────────┐   │
│ │ 📍 Endereço Completo                             │   │
│ │ CEP                                               │   │
│ └──────────────────────────────────────────────────┘   │
│                                                          │
│ ┌─ Contato ────────────────────────────────────────┐   │
│ │ 📞 Telefone             │ ✉ E-mail               │   │
│ └──────────────────────────────────────────────────┘   │
│                                                          │
│ ┌─ Gestor Municipal ───────────────────────────────┐   │
│ │ 👤 Nome do Prefeito(a)                           │   │
│ └──────────────────────────────────────────────────┘   │
│                                                          │
│                          [✓ Salvar Configurações]       │
├─────────────────────────────────────────────────────────┤
│ ℹ Sobre as Configurações                                │
│ Estas informações serão utilizadas nos relatórios...   │
└─────────────────────────────────────────────────────────┘
```

### Paleta de Cores

- **Ícones de Seção:** Azul (`text-blue-600`)
- **Sucesso:** Verde (`bg-green-50`, `text-green-700`)
- **Erro:** Vermelho (`bg-red-50`, `text-red-700`)
- **Info:** Azul (`bg-blue-50`, `text-blue-900`)
- **Campos Obrigatórios:** Asterisco vermelho (`text-red-500`)

### Ícones Utilizados

- `Building2` - Informações Básicas
- `MapPin` - Endereço
- `Phone` - Contato
- `User` - Gestor Municipal
- `Hash` - Código IBGE
- `Map` - Estado
- `Mail` - E-mail
- `Check` - Sucesso
- `Loader2` - Loading

## 🔧 Arquitetura Técnica

### Estrutura de Arquivos

```
src/features/settings/
├── types.ts                    # Tipos TypeScript
├── api.ts                      # Funções de API
└── SettingsPageClient.tsx      # Componente principal

src/app/(app)/configuracoes/
└── page.tsx                    # Página Next.js
```

### Tipos de Dados

```typescript
type CitySettings = {
  id: string;
  city_name: string;
  city_hall_name: string;
  address: string;
  ibge_code: string;
  state: string;
  zip_code: string | null;
  phone: string | null;
  email: string | null;
  mayor_name: string | null;
  created_at: string;
  updated_at: string;
};
```

### Funções de API

**`fetchCitySettings()`**
- Busca as configurações mais recentes
- Retorna `null` se não houver configurações
- Query: `SELECT * FROM city_settings ORDER BY created_at DESC LIMIT 1`

**`createCitySettings(formData)`**
- Cria novo registro de configurações
- Usado quando não há configurações existentes
- Retorna o registro criado

**`updateCitySettings(id, formData)`**
- Atualiza registro existente
- Usado quando já há configurações
- Retorna o registro atualizado

### Fluxo de Dados

```
1. Componente monta
   ↓
2. useEffect dispara fetchCitySettings()
   ↓
3. Se houver dados:
   - Preenche formulário
   - Define settings state
   ↓
4. Usuário edita campos
   ↓
5. Usuário clica "Salvar"
   ↓
6. handleSubmit valida e envia
   ↓
7. Se settings existe:
   - Chama updateCitySettings()
   Senão:
   - Chama createCitySettings()
   ↓
8. Atualiza state e exibe sucesso
```

## 📊 Integração com Banco de Dados

### Tabela: `city_settings`

```sql
CREATE TABLE city_settings (
  id BIGINT PRIMARY KEY,
  city_name TEXT NOT NULL,
  city_hall_name TEXT NOT NULL,
  address TEXT NOT NULL,
  ibge_code TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT,
  phone TEXT,
  email TEXT,
  mayor_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Políticas RLS

- ✅ `SELECT`: Autenticado pode ler
- ✅ `INSERT`: Autenticado pode criar
- ✅ `UPDATE`: Autenticado pode atualizar
- ✅ `DELETE`: Autenticado pode deletar

## 🎯 Casos de Uso

### Caso 1: Primeira Configuração

1. Usuário acessa `/configuracoes`
2. Sistema não encontra configurações
3. Formulário aparece vazio
4. Usuário preenche todos os campos obrigatórios
5. Clica em "Salvar Configurações"
6. Sistema cria novo registro
7. Exibe mensagem de sucesso

### Caso 2: Atualização de Configurações

1. Usuário acessa `/configuracoes`
2. Sistema carrega configurações existentes
3. Formulário aparece preenchido
4. Usuário edita campos desejados
5. Clica em "Salvar Configurações"
6. Sistema atualiza registro existente
7. Exibe mensagem de sucesso

### Caso 3: Erro de Validação

1. Usuário tenta salvar sem preencher campos obrigatórios
2. Navegador exibe validação HTML5 nativa
3. Campos obrigatórios são destacados
4. Usuário corrige e tenta novamente

### Caso 4: Erro de Conexão

1. Usuário tenta salvar
2. Erro de conexão com Supabase
3. Sistema exibe card vermelho com mensagem de erro
4. Usuário pode tentar novamente

## 🚀 Uso das Configurações

As informações cadastradas são utilizadas em:

### 1. **Relatórios em PDF**
- Cabeçalho com nome da prefeitura
- Rodapé com endereço e contato
- Identificação do município

### 2. **Documentos Oficiais**
- Ofícios
- Certidões
- Declarações

### 3. **Cabeçalho do Sistema**
- Nome da prefeitura no topo
- Identificação visual

### 4. **E-mails Automáticos**
- Assinatura com dados da prefeitura
- Informações de contato

## 📝 Exemplos de Dados

### Exemplo Completo

```json
{
  "city_name": "Olho d'Água das Flores",
  "city_hall_name": "Prefeitura Municipal de Olho d'Água das Flores",
  "address": "Praça Senador Rui Palmeira, 123 - Centro",
  "ibge_code": "2706307",
  "state": "AL",
  "zip_code": "57500-000",
  "phone": "(82) 3641-1234",
  "email": "contato@olhodaguadasflores.al.gov.br",
  "mayor_name": "João da Silva"
}
```

### Exemplo Mínimo (Apenas Obrigatórios)

```json
{
  "city_name": "Olho d'Água das Flores",
  "city_hall_name": "Prefeitura Municipal de Olho d'Água das Flores",
  "address": "Praça Senador Rui Palmeira, 123 - Centro",
  "ibge_code": "2706307",
  "state": "AL"
}
```

## ✅ Checklist de Implementação

- ✅ Tipos TypeScript definidos
- ✅ Funções de API (fetch, create, update)
- ✅ Componente de formulário
- ✅ Validações de campos obrigatórios
- ✅ Formatação automática (telefone, CEP)
- ✅ Estados de loading e salvando
- ✅ Mensagens de sucesso e erro
- ✅ Integração com Supabase
- ✅ Responsividade (mobile-friendly)
- ✅ Acessibilidade (labels, required)
- ✅ Build bem-sucedido

## 🎉 Status

**Build:** ✅ Compilação bem-sucedida  
**TypeScript:** ✅ Sem erros  
**Supabase:** ✅ Conectado  
**Validações:** ✅ Implementadas  
**Formatação:** ✅ Automática  
**UI/UX:** ✅ Completa e polida  

O módulo de Configurações está **100% funcional** e pronto para uso! 🚀
