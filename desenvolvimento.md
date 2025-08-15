# Desenvolvimento do Sistema de Cantina Escolar

## Visão Geral

Este documento define as tarefas organizadas para desenvolvimento do sistema de cantina escolar, separadas em módulos e priorizadas para facilitar o desenvolvimento por agentes de IA.

## Estrutura do Projeto

- **Backend**: CodeIgniter 4 (APIs REST)
- **Frontend**: React + Vite + TypeScript
- **Banco de Dados**: MySQL (estrutura já criada em `bancodados.sql`)

## Cronograma de Desenvolvimento

### Fase 1: Configuração Base e Autenticação (Prioridade Alta)

#### Task 1.1: Configuração Inicial do Backend

- [ ] Configurar arquivo `.env` do CodeIgniter 4
- [ ] Configurar conexão com banco de dados
- [ ] Configurar CORS para desenvolvimento
- [ ] Criar estrutura base de resposta para APIs
- [ ] Configurar rotas base

**Arquivos envolvidos:**

- `backend/env`
- `backend/app/Config/Database.php`
- `backend/app/Config/Cors.php`
- `backend/app/Config/Routes.php`

#### Task 1.2: Sistema de Autenticação - Backend

- [ ] Criar Model `FuncionarioCantina`
- [ ] Criar Controller `Auth` para login/logout
- [ ] Implementar middleware de autenticação JWT
- [ ] Criar endpoints:
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`

**Arquivos a criar:**

- `backend/app/Models/FuncionarioCantinaModel.php`
- `backend/app/Controllers/Auth.php`
- `backend/app/Filters/JWTAuth.php`

#### Task 1.3: Configuração Inicial do Frontend

- [ ] Configurar Vite com proxy para backend
- [ ] Configurar roteamento com React Router
- [ ] Configurar Axios com interceptadores
- [ ] Configurar Zustand para estado global
- [ ] Configurar React Query

**Arquivos envolvidos:**

- `frontend/vite.config.ts`
- `frontend/src/lib/axios.ts`
- `frontend/src/stores/auth-store.ts`
- `frontend/src/lib/react-query.ts`

#### Task 1.4: Tela de Login - Frontend

- [ ] Criar componente de layout de autenticação
- [ ] Criar tela de login com formulário
- [ ] Implementar validação de formulário
- [ ] Integrar com API de autenticação
- [ ] Criar hook `useAuth`

**Arquivos a criar:**

- `frontend/src/pages/login.tsx`
- `frontend/src/components/auth/login-form.tsx`
- `frontend/src/hooks/use-auth.ts`

### Fase 2: Gestão de Produtos e Estoque (Prioridade Alta)

#### Task 2.1: CRUD de Tipos de Produtos - Backend

- [ ] Criar Model `TipoProdutoModel`
- [ ] Criar Controller `TiposProdutos`
- [ ] Implementar endpoints:
  - `GET /api/tipos-produtos`
  - `POST /api/tipos-produtos`
  - `PUT /api/tipos-produtos/{id}`
  - `DELETE /api/tipos-produtos/{id}`

**Arquivos a criar:**

- `backend/app/Models/TipoProdutoModel.php`
- `backend/app/Controllers/TiposProdutos.php`

#### Task 2.2: CRUD de Produtos - Backend

- [ ] Criar Model `ProdutoModel`
- [ ] Criar Controller `Produtos`
- [ ] Implementar endpoints:
  - `GET /api/produtos`
  - `GET /api/produtos/{id}`
  - `POST /api/produtos`
  - `PUT /api/produtos/{id}`
  - `DELETE /api/produtos/{id}`
  - `GET /api/produtos/estoque-baixo`

**Arquivos a criar:**

- `backend/app/Models/ProdutoModel.php`
- `backend/app/Controllers/Produtos.php`

#### Task 2.3: Gestão de Estoque - Backend

- [ ] Criar Model `EstoqueHistoricoModel`
- [ ] Criar Controller `Estoque`
- [ ] Implementar endpoints:
  - `POST /api/estoque/entrada`
  - `POST /api/estoque/ajuste`
  - `GET /api/estoque/historico/{produto_id}`

**Arquivos a criar:**

- `backend/app/Models/EstoqueHistoricoModel.php`
- `backend/app/Controllers/Estoque.php`

#### Task 2.4: Interface de Produtos - Frontend

- [ ] Criar página de listagem de produtos
- [ ] Criar formulário de cadastro/edição de produtos
- [ ] Criar modal de confirmação de exclusão
- [ ] Implementar filtros e busca
- [ ] Criar hook `useProducts`

**Arquivos a criar:**

- `frontend/src/pages/produtos/produtos-list.tsx`
- `frontend/src/pages/produtos/produto-form.tsx`
- `frontend/src/components/produtos/produto-card.tsx`
- `frontend/src/hooks/use-products.ts`

#### Task 2.5: Interface de Estoque - Frontend

- [ ] Criar página de controle de estoque
- [ ] Criar formulários de entrada e ajuste
- [ ] Criar relatório de produtos com estoque baixo
- [ ] Criar histórico de movimentações
- [ ] Criar hook `useEstoque`

**Arquivos a criar:**

- `frontend/src/pages/estoque/estoque-control.tsx`
- `frontend/src/pages/estoque/estoque-historico.tsx`
- `frontend/src/components/estoque/entrada-form.tsx`
- `frontend/src/hooks/use-estoque.ts`

### Fase 3: Gestão de Alunos e Contas (Prioridade Alta)

#### Task 3.1: Gestão de Alunos - Backend

- [ ] Criar Model `AlunoModel` (usando view existente)
- [ ] Criar Model `ContaAlunoModel`
- [ ] Criar Controller `Alunos`
- [ ] Implementar endpoints:
  - `GET /api/alunos`
  - `GET /api/alunos/{ra}`
  - `GET /api/alunos/{ra}/conta`
  - `POST /api/alunos/{ra}/credito`

**Arquivos a criar:**

- `backend/app/Models/AlunoModel.php`
- `backend/app/Models/ContaAlunoModel.php`
- `backend/app/Controllers/Alunos.php`

#### Task 3.2: Interface de Alunos - Frontend

- [ ] Criar página de busca de alunos
- [ ] Criar componente de detalhes do aluno
- [ ] Criar formulário de adição de crédito
- [ ] Criar histórico de movimentações do aluno
- [ ] Criar hook `useAlunos`

**Arquivos a criar:**

- `frontend/src/pages/alunos/alunos-search.tsx`
- `frontend/src/pages/alunos/aluno-details.tsx`
- `frontend/src/components/alunos/credito-form.tsx`
- `frontend/src/hooks/use-alunos.ts`

### Fase 4: Sistema de Vendas (Prioridade Alta)

#### Task 4.1: Sistema de Vendas - Backend

- [ ] Criar Model `VendaModel`
- [ ] Criar Model `VendaItemModel`
- [ ] Criar Controller `Vendas`
- [ ] Implementar endpoints:
  - `POST /api/vendas`
  - `GET /api/vendas`
  - `GET /api/vendas/{id}`
  - `POST /api/vendas/numero`

**Arquivos a criar:**

- `backend/app/Models/VendaModel.php`
- `backend/app/Models/VendaItemModel.php`
- `backend/app/Controllers/Vendas.php`

#### Task 4.2: Interface de Vendas - Frontend

- [ ] Criar página de PDV (Ponto de Venda)
- [ ] Criar carrinho de compras
- [ ] Criar seleção de cliente (aluno/funcionário/dinheiro)
- [ ] Criar finalização de venda
- [ ] Criar impressão de comprovante
- [ ] Criar hook `useVendas`

**Arquivos a criar:**

- `frontend/src/pages/vendas/pdv.tsx`
- `frontend/src/components/vendas/carrinho.tsx`
- `frontend/src/components/vendas/cliente-selector.tsx`
- `frontend/src/hooks/use-vendas.ts`

### Fase 5: Gestão de Funcionários Escola (Prioridade Média)

#### Task 5.1: Gestão de Funcionários Escola - Backend

- [ ] Criar Model `FuncionarioEscolaModel` (usando tabela existente)
- [ ] Criar Model `ContaFuncionarioModel`
- [ ] Criar Controller `FuncionariosEscola`
- [ ] Implementar endpoints:
  - `GET /api/funcionarios-escola`
  - `GET /api/funcionarios-escola/{codigo}`
  - `GET /api/funcionarios-escola/{codigo}/conta`
  - `POST /api/funcionarios-escola/{codigo}/definir-limite`

**Arquivos a criar:**

- `backend/app/Models/FuncionarioEscolaModel.php`
- `backend/app/Models/ContaFuncionarioModel.php`
- `backend/app/Controllers/FuncionariosEscola.php`

#### Task 5.2: Interface de Funcionários Escola - Frontend

- [ ] Criar página de gestão de funcionários
- [ ] Criar relatório de consumo mensal
- [ ] Criar definição de limites mensais
- [ ] Criar fechamento mensal
- [ ] Criar hook `useFuncionariosEscola`

**Arquivos a criar:**

- `frontend/src/pages/funcionarios-escola/funcionarios-list.tsx`
- `frontend/src/pages/funcionarios-escola/relatorio-mensal.tsx`
- `frontend/src/hooks/use-funcionarios-escola.ts`

### Fase 6: Gestão de Pacotes de Alimentação (Prioridade Média)

#### Task 6.1: Gestão de Pacotes - Backend

- [ ] Criar Model `PacoteAlimentacaoModel`
- [ ] Criar Model `PacoteProdutoModel`
- [ ] Criar Model `PacoteAlunoModel`
- [ ] Criar Controller `Pacotes`
- [ ] Implementar endpoints para CRUD de pacotes
- [ ] Implementar compra de pacotes

**Arquivos a criar:**

- `backend/app/Models/PacoteAlimentacaoModel.php`
- `backend/app/Models/PacoteProdutoModel.php`
- `backend/app/Models/PacoteAlunoModel.php`
- `backend/app/Controllers/Pacotes.php`

#### Task 6.2: Interface de Pacotes - Frontend

- [ ] Criar página de gestão de pacotes
- [ ] Criar formulário de criação de pacotes
- [ ] Criar interface de compra de pacotes
- [ ] Criar verificação de pacotes do aluno
- [ ] Criar hook `usePacotes`

### Fase 7: Gestão de Restrições (Prioridade Média)

#### Task 7.1: Sistema de Restrições - Backend

- [ ] Criar Model `RestricaoAlunoModel`
- [ ] Criar Controller `Restricoes`
- [ ] Implementar verificação de restrições nas vendas
- [ ] Implementar endpoints para gestão de restrições

#### Task 7.2: Interface de Restrições - Frontend

- [ ] Criar página de gestão de restrições
- [ ] Criar interface para responsáveis definirem restrições
- [ ] Integrar verificação nas vendas

### Fase 8: Portal do Responsável (Prioridade Média)

#### Task 8.1: Portal do Responsável - Backend

- [ ] Criar Controller `PortalResponsavel`
- [ ] Implementar autenticação por CPF + data nascimento
- [ ] Implementar consulta de consumo dos dependentes
- [ ] Implementar gestão de restrições

#### Task 8.2: Portal do Responsável - Frontend

- [ ] Criar layout específico para responsáveis
- [ ] Criar login com CPF + data nascimento
- [ ] Criar dashboard de consumo dos filhos
- [ ] Criar gestão de restrições

### Fase 9: Relatórios e Dashboard (Prioridade Baixa)

#### Task 9.1: Sistema de Relatórios - Backend

- [ ] Criar Controller `Relatorios`
- [ ] Implementar relatórios de vendas
- [ ] Implementar relatórios de estoque
- [ ] Implementar relatórios financeiros

#### Task 9.2: Dashboard - Frontend

- [ ] Criar dashboard administrativo
- [ ] Criar gráficos de vendas
- [ ] Criar indicadores de estoque
- [ ] Criar relatórios exportáveis

### Fase 10: Funcionalidades Avançadas (Prioridade Baixa)

#### Task 10.1: Configurações do Sistema

- [ ] Criar gestão de funcionários da cantina
- [ ] Criar configurações gerais
- [ ] Criar backup e logs

#### Task 10.2: Melhorias de UX

- [ ] Implementar notificações
- [ ] Implementar busca avançada
- [ ] Implementar atalhos de teclado
- [ ] Implementar modo escuro

## Ordem Recomendada de Desenvolvimento

1. **Fase 1** (Configuração e Autenticação) - Essencial
2. **Fase 2** (Produtos e Estoque) - Base do sistema
3. **Fase 4** (Sistema de Vendas) - Funcionalidade principal
4. **Fase 3** (Gestão de Alunos) - Integração com vendas
5. **Fase 5** (Funcionários Escola) - Complementar
6. **Fase 6** (Pacotes) - Funcionalidade adicional
7. **Fase 7** (Restrições) - Controle parental
8. **Fase 8** (Portal Responsável) - Interface externa
9. **Fase 9** (Relatórios) - Gestão e análise
10. **Fase 10** (Funcionalidades Avançadas) - Melhorias

## Convenções de Código

- **Backend**: Seguir padrões PSR-12 do PHP
- **Frontend**: Seguir convenções do projeto (camelCase, kebab-case para arquivos)
- **Banco**: Usar stored procedures criadas quando necessário
- **APIs**: Seguir padrão REST com respostas JSON consistentes
- **Commits**: Usar conventional commits (feat:, fix:, docs:, etc.)

## Observações Importantes

1. Sempre testar integração com banco de dados real
2. Implementar validação tanto no frontend quanto backend
3. Usar os triggers e procedures já criados no banco
4. Manter consistência na estrutura de respostas das APIs
5. Implementar tratamento de erros adequado
6. Documentar APIs conforme desenvolvimento
7. Realizar testes de cada funcionalidade antes de prosseguir

## Arquivos de Configuração Importantes

- `backend/env` - Configurações do ambiente
- `frontend/vite.config.ts` - Configurações do Vite
- `bancodados.sql` - Estrutura completa do banco
- `.github/copilot-instructions.md` - Guia para agentes de IA
