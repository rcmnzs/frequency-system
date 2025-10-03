# Sistema de Frequência Escolar

Sistema completo para processamento de frequência escolar com frontend React + Material-UI e backend Node.js + Express, utilizando Supabase como banco de dados.

## Estrutura do Projeto

```
project/
├── src/                          # Frontend React
│   ├── components/
│   │   ├── FrequencyProcessor.tsx    # Processamento de PDFs
│   │   ├── StudentManager.tsx        # Gerenciamento de alunos
│   │   ├── ScheduleGrid.tsx          # Grade de horários
│   │   └── AbsenceBoard.tsx          # Quadro de faltas
│   ├── App.tsx                   # Componente principal
│   └── main.tsx                  # Entry point
└── frequency-backend/backend/    # Backend Node.js
    └── src/
        ├── database/
        │   └── supabase.js           # Conexão Supabase
        ├── services/
        │   ├── pdfService.js         # Processamento de PDFs
        │   ├── studentService.js     # CRUD de alunos
        │   ├── scheduleService.js    # CRUD de horários
        │   └── frequencyService.js   # Gestão de faltas
        └── server.js                 # Servidor Express
```

## Banco de Dados (Supabase)

O sistema utiliza três tabelas principais:

### 1. `alunos` (Estudantes)
- `matricula` (TEXT) - Chave primária
- `nome` (TEXT) - Nome do aluno
- `turma` (TEXT) - Turma/classe
- `created_at` (TIMESTAMPTZ) - Data de criação

### 2. `horarios` (Grade de Horários)
- `id` (UUID) - Chave primária
- `turma` (TEXT) - Turma
- `dia_semana` (TEXT) - Dia da semana
- `hora_inicio` (TEXT) - Hora de início
- `hora_fim` (TEXT) - Hora de fim
- `disciplina` (TEXT) - Nome da disciplina
- `created_at` (TIMESTAMPTZ) - Data de criação

### 3. `faltas_disciplina` (Registro de Faltas)
- `id` (UUID) - Chave primária
- `matricula_aluno` (TEXT) - FK para alunos
- `disciplina` (TEXT) - Nome da disciplina
- `total_faltas` (INTEGER) - Total de faltas acumuladas
- `created_at` (TIMESTAMPTZ) - Data de criação
- `updated_at` (TIMESTAMPTZ) - Última atualização

## Configuração

### 1. Variáveis de Ambiente

O arquivo `.env` já contém as credenciais do Supabase:
- `VITE_SUPABASE_URL` - URL do projeto Supabase
- `VITE_SUPABASE_ANON_KEY` - Chave anônima do Supabase

O backend também precisa acessar essas variáveis, portanto utilize o mesmo arquivo `.env`.

### 2. Instalar Dependências

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd frequency-backend/backend
npm install
```

### 3. Iniciar o Backend

```bash
cd frequency-backend/backend
npm start
```

O servidor rodará em `http://localhost:3001`

### 4. Iniciar o Frontend

Em outro terminal:
```bash
npm run dev
```

O frontend rodará em `http://localhost:5173`

## Funcionalidades

### 1. Processar Frequência
- Upload de PDFs de frequência (com registros de entrada/saída)
- Upload de PDFs de ausentes
- Seleção de data para processamento
- Processamento automático que:
  - Identifica alunos ausentes
  - Cruza com grade de horários
  - Registra faltas por disciplina no banco de dados
  - Acumula faltas historicamente

### 2. Gerenciar Alunos
- Lista completa de alunos cadastrados
- Busca por nome, matrícula ou turma
- Adicionar novos alunos
- Editar dados de alunos (incluindo matrícula)
- Excluir alunos
- Interface com DataGrid do Material-UI

### 3. Grade de Horários
- Visualização em formato de grade (dias x horários)
- Filtro por turma
- Adicionar disciplinas clicando nas células vazias
- Editar disciplinas existentes
- Excluir disciplinas
- Suporte para múltiplas turmas

### 4. Quadro de Faltas
- Visualização consolidada de todas as faltas
- Matriz: alunos × disciplinas
- Busca por aluno
- Código de cores:
  - Verde: 0 faltas
  - Amarelo: 1-5 faltas
  - Vermelho: 6+ faltas
- Colunas fixas para fácil navegação

## API Endpoints

### Estatísticas
- `GET /api/stats` - Estatísticas gerais do sistema

### Processamento
- `POST /api/process` - Processar PDFs de frequência

### Alunos
- `GET /api/alunos` - Listar todos os alunos
- `GET /api/alunos/:matricula` - Buscar aluno por matrícula
- `POST /api/alunos` - Criar novo aluno
- `PUT /api/alunos/:matricula` - Atualizar aluno
- `DELETE /api/alunos/:matricula` - Excluir aluno

### Horários
- `GET /api/horarios` - Listar todos os horários
- `GET /api/horarios?turma=X` - Filtrar por turma
- `GET /api/horarios/turmas` - Listar todas as turmas
- `GET /api/horarios/:id` - Buscar horário por ID
- `POST /api/horarios` - Criar novo horário
- `PUT /api/horarios/:id` - Atualizar horário
- `DELETE /api/horarios/:id` - Excluir horário

### Faltas
- `GET /api/quadro-de-faltas` - Quadro completo de faltas
- `GET /api/faltas/:matricula` - Faltas de um aluno específico

## Formato dos PDFs

### PDF de Frequência
Deve conter registros com os campos:
- Crachá (matrícula)
- Nome
- Data
- Hora
- Sentido (Entrada/Saída)
- Estado (Liberado)

### PDF de Ausentes
Deve conter lista com:
- Matrícula
- Nome

## Tecnologias Utilizadas

### Frontend
- React 18 + TypeScript
- Vite
- Material-UI (MUI) v7
- MUI X DataGrid
- Lucide React (ícones)
- Emotion (CSS-in-JS)

### Backend
- Node.js + Express
- Supabase (PostgreSQL)
- pdf-parse (extração de PDFs)
- Multer (upload de arquivos)
- CORS

## Segurança

- Row Level Security (RLS) habilitado em todas as tabelas
- Políticas de acesso para usuários autenticados
- Validação de dados no backend
- Chaves estrangeiras com CASCADE DELETE

## Melhorias Futuras

1. Autenticação de usuários
2. Relatórios exportáveis (PDF/Excel)
3. Dashboard com gráficos e estatísticas
4. Notificações para alunos com muitas faltas
5. Importação em massa via Excel
6. Histórico de processamentos
7. Justificativas de faltas
8. Geração automática de relatórios mensais
