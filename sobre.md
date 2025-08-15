# Controle de cantina escolar

Sistema de controle de cantina escolar feito em PHP com banco de dados MySql.

## Tecnologias utilizadas

- PHP
- MySql
- Composer
- JavaScript
- Bootstrap
- jQuery
- Datatable
- Plugins jQuery

Nota: Este projeto deve usar o framework CodeIgniter 4 como base da aplicação. Ajustes de estrutura, roteamento e execução deverão seguir as convenções do CodeIgniter 4.

Observação: o esqueleto do CodeIgniter 4 já foi instalado neste repositório (via Composer `codeigniter4/appstarter`). Use o utilitário `spark` para comandos de desenvolvimento e migrations.

## Banco de dados

As tabelas do sistema deverão começar com o prefixo `cant_`.

Instruções rápidas de setup local:

- Copie o arquivo de ambiente de exemplo e ajuste as configurações (APP_BASE_URL, database.\*):

```powershell
cd /d D:\dev\php-cantina
copy env .env
# Edite .env e ajuste DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD
```

- Instale dependências (caso necessário):

```powershell
composer install
```

- Importe o schema inicial (opcional) ou execute migrations do projeto:

```powershell
# usando mysql cli (ajuste usuário e database):
mysql -u SEU_USUARIO -p SEU_BANCO < bancodados.sql

# ou, preferencialmente, usar as migrations do projeto (se existirem):
php spark migrate
```

- Inicie o servidor de desenvolvimento:

```powershell
php spark serve -p 8000
# ou: php -S localhost:8000 -t public
```

## Tipos de usuários do sistema

- funcionários da cantina
- responsáveis pelos alunos

### Funcionários da cantina

Serão os usuários principais do sistema.

Papéis

- caixa: acesso ao PDV para registrar as vendas
- supervisor: todos os acessos do caixa, além de poder consultar o que foi consumido por aluno e funcionário e cadastros gerais do sistema.
- gerente: todos os acessos do supervisor e acesso a cadastro de novos funcionários.
- informática: acesso total ao sistema, podendo fazer manutenção e ajustes técnicos.

Observação sobre papéis/permissões

As tabelas separadas de `papel` e `permissao` foram removidas. Agora a tabela `cant_usuario` possui um campo `tipo` (ENUM) com os valores:

- 'caixa', 'supervisor', 'gerente', 'informatica', 'responsavel'

Esse campo define o papel do usuário e serve de base para aplicar permissões na aplicação. A decisão simplifica o esquema inicial e facilita o seed de usuários; se no futuro for necessária uma matriz de permissões mais granular podemos migrar para tabelas dedicadas sem perda dos dados.

### Responsáveis pelos alunos

Serão os usuários que poderão consultar o que foi consumido por seus dependentes.

Cada responsável poderá ter vários dependentes cadastrados no sistema.

Os responsáveis poderão consultar o que foi consumido por seus dependentes.

Os dados dos responsáveis deverão ser buscados no sistema de controle de alunos da escola (APS).

## Funcionalidades desejadas

- Integrar com o sistema de controle de alunos e o sistema de funcionários da escola (APS).
- Registrar tudo o que foi consumido por aluno e funcionário.
- Permitir que os responsáveis pelos alunos possam consultar o que foi consumido.
- Gerar relatório do que foi consumido por funcionário para enviar para o departamento de recursos humanos.
- Fazer a baixa do que foi pago pelos funcionários (fatura mensal).
- PDV para registrar as vendas.
- Cadastro de produtos e categorias.
- Responsável poder permitir o que será consumido ou não pelo dependente.
- Controle de estoque dos produtos.
- Histórico de consumo por dependente.
- Relatório de consumo por período.
- Tela para o responsável logar e ver o que foi consumido por seus dependentes.
- Aluno terá saldo disponível para consumo.
- Responsável poderá adicionar dinheiro para o saldo do aluno.
- Aluno poderá comprar produtos com o saldo ou com dinheiro.
- Venda de refeição por quilo.
- Preço diferente por cada funcionário. (definir regras de precificação, pois o almoço varia de preço de acordo com o funcionário).
- Sistema de pacotes de alimentação para os alunos (kits). O responsável poderá por exemplo comprar o pacote do lanche da manhã e do almoço por um período. O sistema deverá controlar o consumo desses pacotes.
- Os funcionário vão logar no sistema através do nome de usuário e senha.
- Os responsáveis vão logar no sistema através do CPF e senha. Essa tabela já existe no canco de dados do APS.

## Requisitos Funcionais (RF)

Formato dos códigos: RFNNN onde NNN é número sequencial. Cada requisito traz: Descrição, Atores, Pré-condições, Fluxo Principal (resumido), Regras de Negócio (RN), Dados Principais, Exceções/Erros. Requisitos podem referenciar Regras de Negócio (RN) numéricas. Um agente de IA deverá usar esta lista como backlog inicial. Os requisitos estão priorizados aproximadamente por ordem de implementação sugerida (fundação > núcleo de vendas > integrações > relatórios > complementos).

### Fundamentos de Acesso e Cadastro

RF001 - Autenticação de Usuários

- Descrição: Permitir que qualquer usuário (funcionário da cantina, responsável) acesse o sistema mediante login (e-mail/CPF + senha) e sessão segura.
- Atores: caixa, supervisor, gerente, informática, responsável.
- Pré-condições: Usuário cadastrado ativo.
- Fluxo Principal: Usuário informa credenciais > sistema valida > cria sessão > redireciona para dashboard conforme papel.
- Regras de Negócio: RN001, RN002.
- Dados: usuario(id, nome, email, cpf, senhaHash, papel, status, ultimoAcesso).
- Exceções: Credenciais inválidas (retornar mensagem genérica), usuário inativo (bloquear e registrar auditoria).

RF002 - Gestão de Papéis e Permissões

- Descrição: Definir e aplicar matriz de permissões para papéis (caixa, supervisor, gerente, informática, responsável) em endpoints e UI.
- Atores: todos (aplicação das permissões); informática (manutenção); gerente (atribuição a novos funcionários).
- Pré-condições: Papéis pré-cadastrados (seed inicial).
- Fluxo Principal: Ao acessar recurso protegido o sistema verifica papel e permissões; se autorizado prossegue.
- Regras de Negócio: RN003, RN004.
- Dados: papel(id, codigo, nome); permissao(id, codigo); papel_permissao(papelId, permissaoId).
- Exceções: Acesso negado (HTTP 403 / mensagem UI).

RF003 - Cadastro de Funcionários da Cantina

- Descrição: Criar, editar, inativar funcionários (caixa, supervisor, gerente, informática).
- Atores: gerente (exceto papel informática), informática (todos).
- Pré-condições: Usuário autenticado com permissão.
- Fluxo Principal: Informar dados + papel > validar > persistir > exibir confirmação.
- Regras de Negócio: RN005, RN006.
- Dados: funcionario(usuarioId, matricula, tipoContratacao, dataAdmissao, ativo).
- Exceções: Duplicidade de CPF/email.

RF004 - Cadastro de Responsáveis

- Descrição: Cadastrar responsáveis localmente sincronizando dados primários do APS (leitura) e vinculando dependentes (alunos) importados.
- Atores: supervisor, gerente, informática.
- Pré-condições: Integração APS operacional (RF029).
- Fluxo Principal: Buscar responsável por CPF no APS > selecionar > criar registro local > vincular dependentes.
- Regras de Negócio: RN007, RN008.
- Dados: responsavel(id, apsId, nome, cpf, email, telefone, status); responsavel_aluno(responsavelId, alunoId, statusPermissoes).
- Exceções: Não encontrado no APS; divergência de CPF.

RF005 - Cadastro de Alunos (Importação)

- Descrição: Importar/atualizar alunos do APS; manter histórico mínimo (nome, série, turno).
- Atores: informática (manual disparo), rotina agendada.
- Pré-condições: APS acessível.
- Fluxo Principal: Chamar API APS > mapear campos > upsert aluno.
- Regras de Negócio: RN009.
- Dados: aluno(id, apsId, nome, matricula, serie, turno, status, saldoAtual, saldoReservado).
- Exceções: Conflitos de matrícula (log + manter o mais recente via timestamp do APS).

### Gestão de Catálogo e Estoque

RF006 - Cadastro de Categorias de Produto

- Descrição: Criar, editar, inativar categorias (ex.: Bebidas, Lanches, Refeição por Quilo).
- Atores: supervisor, gerente, informática.
- Regras de Negócio: RN010.
- Dados: categoria(id, nome, descricao, ativa, ordemExibicao).

RF007 - Cadastro de Produtos

- Descrição: Criar/editar/inativar produtos com atributos básicos e tipo de precificação.
- Atores: supervisor, gerente, informática.
- Regras de Negócio: RN011, RN012, RN013.
- Dados: produto(id, categoriaId, nome, descricao, tipo (unitario|peso|kit), precoBase, unidadeMedida, permiteSaldo, ativo, estoqueMinimo, estoqueAtual, codigoInterno, flagsRestricao).
- Exceções: Categoria inativa; duplicidade de nome+categoria.

RF008 - Controle de Estoque (Movimentações)

- Descrição: Registrar entradas (compra, ajuste) e saídas (venda, ajuste) mantendo saldo consistente.
- Atores: supervisor, gerente, informática (ajustes); caixa (saída por venda automática).
- Regras de Negócio: RN014, RN015.
- Dados: estoque_mov(id, produtoId, tipo (entrada|saida|ajuste), quantidade, origem, usuarioId, createdAt, observacao, custoUnitarioOpcional); produto.estoqueAtual.
- Exceções: Saída excedendo estoque (bloquear salvo produtos sem controle RN015).

RF009 - Kits / Pacotes de Alimentação

- Descrição: Permitir definir kits (pacotes) de consumo pré-pago para período (ex.: lanche + almoço por semana).
- Atores: supervisor, gerente, informática; responsável (aquisição).
- Regras de Negócio: RN016, RN017.
- Dados: kit(id, nome, descricao, periodoTipo (semana|mes|custom), duracaoDias, preco, ativo); kit_itens(kitId, produtoId, quantidadePermitida); kit_assinatura(id, kitId, alunoId, responsavelId, inicioVigencia, fimVigencia, saldoConsumosRestante, status).
- Exceções: Sobreposição de vigências (alerta ou impedir conforme RN017).

### Operações de Vendas / PDV

RF010 - PDV (Registro de Venda Rápida)

- Descrição: Interface otimizada para caixa registrar vendas (aluno, funcionário ou venda avulsa para funcionário com desconto/diferenciação) com leitura por busca ou código.
- Atores: caixa, supervisor, gerente.
- Regras de Negócio: RN018, RN019, RN020.
- Dados: venda(id, tipoConsumidor (aluno|funcionario|externo), alunoId?, funcionarioId?, totalBruto, totalDescontos, totalLiquido, formaPagamento (saldo|dinheiro|misto|folha), status, createdAt, usuarioCaixaId); venda_item(id, vendaId, produtoId, quantidade, precoUnitario, subtotal, origemPreco, descontoAplicado, pesoRegistradoGramas?).
- Exceções: Saldo insuficiente (oferecer pagar diferença em dinheiro se permitido RN019); produto inativo.

RF011 - Venda de Produto por Peso

- Descrição: Permitir registrar refeição por quilo/peso; usuário informa peso em gramas, sistema converte para valor.
- Atores: caixa.
- Regras de Negócio: RN021.
- Dados: venda_item.pesoRegistradoGramas, produto.tipo='peso', produto.precoBase (preço por Kg).
- Exceções: Peso zero ou negativo.

RF012 - Preços Diferenciados por Funcionário

- Descrição: Aplicar regras de precificação específicas por tipo de funcionário ou tabela personalizada.
- Atores: caixa, supervisor.
- Regras de Negócio: RN022, RN023.
- Dados: preco_personalizado(id, produtoId, tipoFuncionario, preco); funcionario.tipoFuncionario.
- Exceções: Preço específico não encontrado (usar preço base).

RF013 - Consumo via Kit

- Descrição: Deduzir item de kit ativo ao invés de cobrar preço unitário quando aluno tem kit válido que inclui o produto.
- Atores: caixa.
- Regras de Negócio: RN024.
- Dados: kit_assinatura.saldoConsumosRestante; registro em venda_item origemPreco='kit'.
- Exceções: Saldo do kit esgotado (cobrar normalmente).

RF014 - Autorização de Consumo (Restrição por Responsável)

- Descrição: Bloqueio ou alerta de itens não autorizados para determinado aluno conforme preferências do responsável.
- Atores: caixa, responsável (configura), supervisor.
- Regras de Negócio: RN025.
- Dados: responsavel_aluno_preferencias(alunoId, responsavelId, produtoId?, categoriaId?, permitido (sim|nao|alerta)).
- Exceções: Produto bloqueado (impedir finalização sem override supervisor).

RF015 - Pagamento Misto (Saldo + Dinheiro)

- Descrição: Permitir que parte da venda seja debitada do saldo do aluno e restante pago em dinheiro.
- Atores: caixa.
- Regras de Negócio: RN026.
- Dados: venda.formaPagamento='misto'; venda_pagamento(vendaId, tipo (saldo|dinheiro|folha), valor).
- Exceções: Saldo zero (converter para pagamento integral em dinheiro).

RF016 - Cancelamento / Estorno de Venda

- Descrição: Permitir cancelamento de venda em janela configurável revertendo estoque, saldo e kits.
- Atores: supervisor, gerente, informática.
- Regras de Negócio: RN027.
- Dados: venda.status (ativa|cancelada); venda_cancelamento(vendaId, motivo, usuarioId, createdAt).
- Exceções: Janela expirada (bloquear salvo perfil informática).

### Saldos e Financeiro (Alunos e Funcionários)

RF017 - Consulta de Saldo do Aluno

- Descrição: Mostrar saldo atual e reservado; detalhar últimas movimentações.
- Atores: responsável, caixa (visualização rápida), aluno (se previsto futuramente).
- Regras de Negócio: RN028.
- Dados: movimento_saldo(id, alunoId, tipo (credito|debito|reserva), valor, referencia (venda|recarga|ajuste|kit), observacao).

RF018 - Recarga de Saldo pelo Responsável

- Descrição: Responsável adiciona crédito (pagamento manual registrado ou integração futura com gateway - placeholder).
- Atores: responsável, supervisor (recarga presencial), gerente.
- Regras de Negócio: RN029.
- Dados: recarga(id, alunoId, responsavelId, valor, meio (dinheiro|pix|boleto|cartao|outro), status, comprovanteRef).
- Exceções: Valor abaixo mínimo (RN029) ou acima limite diário.

RF019 - Faturamento de Funcionários (Folha)

- Descrição: Gerar fatura mensal consolidando consumo por funcionário para envio ao RH (export CSV/PDF).
- Atores: supervisor, gerente.
- Regras de Negócio: RN030, RN031.
- Dados: fatura_func(id, funcionarioId, mesRef, total, status (aberta|baixada), dataBaixa, observacao); fatura_func_item(faturaId, vendaId, valor).
- Exceções: Venda já faturada (ignorar duplicidade).

RF020 - Baixa de Fatura de Funcionário

- Descrição: Registrar pagamento (folha) e marcar fatura como baixada.
- Atores: gerente, informática.
- Regras de Negócio: RN032.
- Dados: fatura_func.status, fatura_func_pagamento(id, faturaId, data, valor, metodo, usuarioId).
- Exceções: Valor pago divergente (exigir ajuste ou complemento).

### Consulta e Portal do Responsável

RF021 - Portal do Responsável (Dashboard)

- Descrição: Página inicial com resumo de saldo por aluno, kits ativos, últimos consumos.
- Atores: responsável.
- Regras de Negócio: RN033.
- Dados: agregações de venda_item, kit_assinatura, aluno.saldoAtual.

RF022 - Histórico de Consumo por Dependente

- Descrição: Listar consumos (itens de venda) filtrando por período e produto com paginação.
- Atores: responsável.
- Regras de Negócio: RN034.
- Dados: venda_item join venda join produto.

RF023 - Configuração de Restrições de Consumo

- Descrição: Responsável define produtos/categorias permitidos, bloqueados ou de alerta.
- Atores: responsável.
- Regras de Negócio: RN025 (referência), RN035.
- Dados: responsavel_aluno_preferencias.

RF024 - Compra de Kits pelo Responsável

- Descrição: Responsável seleciona kit, período (dentro das regras) e confirma aquisição debitando saldo ou registrando pendência de pagamento.
- Atores: responsável.
- Regras de Negócio: RN016, RN017, RN036.
- Dados: kit_assinatura + movimento_saldo (debito) ou recarga pendente.
- Exceções: Saldo insuficiente (oferecer recarga imediata).

### Relatórios e Auditoria

RF025 - Relatório de Consumo por Período (Consolidado)

- Descrição: Somar consumo por aluno, por funcionário e por produto em intervalo de datas.
- Atores: supervisor, gerente, informática.
- Regras de Negócio: RN037.
- Dados: agregações sobre venda_item.
- Exceções: Intervalo > limite (ex.: 93 dias) (forçar export incremental).

RF026 - Relatório de Estoque (Posição e Movimentações)

- Descrição: Mostrar estoque atual e histórico de movimentações por produto com filtros.
- Atores: supervisor, gerente.
- Regras de Negócio: RN038.
- Dados: produto.estoqueAtual, estoque_mov.

RF027 - Log de Auditoria

- Descrição: Registrar ações críticas (login, cancelamento, alteração de preço, ajuste de estoque, permissões) com detalhes.
- Atores: informática (consulta completa), gerente (parcial).
- Regras de Negócio: RN039.
- Dados: auditoria(id, usuarioId, acao, entidade, entidadeId, dadosAntes, dadosDepois, ip, userAgent, createdAt).

RF028 - Exportações (CSV/PDF)

- Descrição: Permitir exportar relatórios (consumo, faturamento, estoque) em CSV e PDF.
- Atores: supervisor, gerente.
- Regras de Negócio: RN040.
- Dados: Arquivos gerados on-the-fly (não persistir salvo histórico de faturas exportadas).

### Integrações APS

RF029 - Integração APS: Responsáveis e Alunos

- Descrição: Sincronizar dados mestre (responsáveis, alunos, vínculos) periodicamente e sob demanda.
- Atores: rotina agendada, informática.
- Regras de Negócio: RN041, RN042.
- Dados: staging_aps_responsavel, staging_aps_aluno (tabelas temporárias) antes de upsert.
- Exceções: Falha conexão (repetir com backoff exponencial até N tentativas RN042).

RF030 - Integração APS: Funcionários

- Descrição: Importar funcionários elegíveis para consumo (precificação diferenciada) e mapear para usuários quando aplicável.
- Atores: informática.
- Regras de Negócio: RN043.
- Dados: funcionario.apsId.

### Manutenção e Operações Técnicas

RF031 - Parametrizações do Sistema

- Descrição: Cadastro de parâmetros (ex.: janela cancelamento, peso mínimo, limites recarga).
- Atores: informática, gerente (alguns parâmetros).
- Regras de Negócio: RN044.
- Dados: parametro(chave, valor, descricao, escopo).

RF032 - Health Check / Status Integrações

- Descrição: Tela técnica exibindo status último sucesso APS, filas, jobs agendados.
- Atores: informática.
- Regras de Negócio: RN045.
- Dados: job_execucao(id, job, status, startedAt, endedAt, mensagem).

RF033 - Ajuste Manual de Saldo

- Descrição: Permitir ajuste (crédito/débito) autorizado e auditado.
- Atores: supervisor (até limite), gerente, informática.
- Regras de Negócio: RN046.
- Dados: movimento_saldo(tipo='ajuste').
- Exceções: Valor excede limite de ajuste do papel.

RF034 - Ajuste Manual de Estoque

- Descrição: Ajustar estoque por perda, inventário ou correção.
- Atores: supervisor, gerente, informática.
- Regras de Negócio: RN047.
- Dados: estoque_mov.tipo='ajuste'.
- Exceções: Ajuste que cria número negativo (bloquear).

RF035 - Pesquisa e Filtros Globais

- Descrição: Caixa de busca global por aluno, produto, venda, funcionário.
- Atores: todos (conforme permissões).
- Regras de Negócio: RN048.
- Dados: índices de busca (considerar fulltext ou LIKE otimizado).

RF036 - Paginador e Ordenação Consistentes

- Descrição: Listagens com paginação, ordenação e filtros persistentes em sessão.
- Atores: todos.
- Regras de Negócio: RN049.

RF037 - Notificações ao Responsável

- Descrição: Enviar e-mail (ou placeholder) de eventos (recarga confirmada, kit prestes a expirar, saldo baixo).
- Atores: sistema (jobs), responsável.
- Regras de Negócio: RN050.
- Dados: notificacao(id, responsavelId, tipo, payloadJson, statusEnvio, tentativas, proximaTentativa).

RF038 - Dashboard Gerencial

- Descrição: Cards com KPIs (vendas do dia, top produtos, saldo total alunos, estoque crítico).
- Atores: supervisor, gerente.
- Regras de Negócio: RN051.
- Dados: consultas agregadas.

RF039 - Segurança de Sessão

- Descrição: Timeout inatividade, logout simultâneo em revogação, proteção CSRF/form tokens.
- Atores: todos.
- Regras de Negócio: RN052.

RF040 - Logs de Erro Centralizados

- Descrição: Capturar exceções e armazenar para consulta técnica.
- Atores: informática.
- Regras de Negócio: RN053.
- Dados: log_erro(id, nivel, mensagem, stackTrace, contextoJson, createdAt).

### Regras de Negócio (RN) Referenciadas

RN001: Senhas armazenadas com hash seguro (bcrypt/argon2).  
RN002: Tentativas de login falhas > N bloqueiam usuário temporariamente (ex.: 5 por 15 min).  
RN003: Permissões definidas em tabela não hard-coded (seed inicial + manutenção).  
RN004: Papel 'informática' tem acesso total, mas ações críticas ainda auditadas.  
RN005: Funcionário só pode ser inativado se não houver fatura em aberto.  
RN006: Alterar papel gera registro de auditoria.  
RN007: Não permitir cadastro manual de responsável que exista no APS (sempre via import).  
RN008: Um aluno pode ter múltiplos responsáveis; permissões de restrição se combinam (bloqueio prevalece sobre permissões).  
RN009: Atualização de alunos mantém histórico de série (tabela de mudanças).  
RN010: Categoria inativa impede novos produtos ou associação em kits.  
RN011: Produto não pode ser deletado, apenas inativado.  
RN012: Tipo de produto (unitário/peso/kit) imutável após primeira venda.  
RN013: Flags de restrição (alérgenos, etc.) exibidas no PDV.  
RN014: Toda venda gera saída automática do estoque (exceto tipo peso se configurado para ajuste manual).  
RN015: Produtos marcados 'sem controle de estoque' podem ficar negativos sem bloquear venda.  
RN016: Kit define número de consumos por item (quantidade diária ou total periodo).  
RN017: Não permitir duas assinaturas ativas sobre o mesmo período e kit para o mesmo aluno.  
RN018: PDV deve permitir atalho teclado e operação <= 5 cliques médios por venda.  
RN019: Se saldo parcial cobre alguns itens, usuário escolhe se usa saldo parcial ou cancela.  
RN020: Horário de operação PDV (parametrizado) — fora dele exige override supervisor.  
RN021: Preço por peso = (pesoGramas / 1000) \* preçoKg arredondado a 2 casas (half-up).  
RN022: Tabela de preço por tipo de funcionário, fallback para preço base.  
RN023: Descontos não podem gerar valor negativo.  
RN024: Consumo de kit decrementa saldoConsumosRestante; ao zerar status muda para 'consumido'.  
RN025: Prioridade de restrição: bloqueado > alerta > permitido.  
RN026: Pagamento misto debita saldo primeiro e restante outra forma.  
RN027: Janela de cancelamento padrão 30 min (parametrizável), após isso só informática.  
RN028: Saldo = sum(creditos - debitos - reservas).  
RN029: Valor mínimo recarga e máximo diário parametrizados.  
RN030: Faturamento inclui apenas vendas não canceladas, formaPagamento folhável (folha|misto parte folha).  
RN031: Recalcular fatura se venda cancelada após geração (marca para reprocesso).  
RN032: Baixa exige total pago igual ao devido.  
RN033: Portal só mostra alunos ativos vinculados.  
RN034: Histórico retorna no máximo 1000 itens por export; paginação server-side.  
RN035: Alterações de restrição efetivadas imediatamente (cache inválido).  
RN036: Compra de kit verifica saldo antes; se insuficiente gera instrução de recarga.  
RN037: Relatório de consumo deve poder agrupar por (produto|categoria|aluno|funcionario).  
RN038: Estoque crítico = estoqueAtual <= estoqueMinimo.  
RN039: Auditoria imutável (append-only).  
RN040: Exportações paginadas para > 50k linhas (streaming).  
RN041: Sincronização completa noturna; incremental a cada 30 min.  
RN042: Backoff: 3 tentativas com intervalos 1m, 5m, 15m.  
RN043: Funcionário APS sem consumo em 90 dias pode ser arquivado.  
RN044: Alteração de parâmetro efetiva-se em cache após 60s (invalidação).  
RN045: Health check exibe latência média últimas N execuções.  
RN046: Limite ajuste supervisor (ex.: R$50) parametrizado; > limite exige gerente.  
RN047: Ajuste de estoque requer motivo categorizado.  
RN048: Busca global normaliza acentos e case.  
RN049: Padrão de paginação: pageSize default 20, máximo 100.  
RN050: Notificação saldo baixo disparada quando saldo < parâmetro (ex.: R$10) e não repetida em <24h.  
RN051: KPIs cache 5 min.  
RN052: Timeout sessão 30 min inatividade, token CSRF por formulário.  
RN053: Logs de erro retidos 180 dias.

### Observações Técnicas de Implementação

- Todos os nomes de tabelas devem seguir prefixo 'cant\_'. Ex.: 'cant_usuario', 'cant_produto'.
- Implementar migrations idempotentes organizadas por timestamp.
- Garantir índices para campos de busca frequente (matricula, cpf, produto.nome).
- Para integrações APS utilizar camada de serviço isolada para facilitar mocking em testes.
- Padronizar retornos de API em JSON com envelope: { success: bool, data: any, errors?: [ { code, message } ] }.
- Utilizar transações para operações que envolvem múltiplas escritas coerentes (ex.: venda + itens + estoque + movimento_saldo + kit consumo).
- Considerar fila/tabela de jobs para notificações e integrações.

### Roadmap Sugerido (Fases)

Fase 1 (MVP Interno): RF001-RF008, RF010, RF011, RF039 (básico), RN essenciais.  
Fase 2: RF009, RF012-RF016, RF017-RF018.  
Fase 3: RF019-RF024, RF025-RF028.  
Fase 4: RF029-RF033.  
Fase 5: RF034-RF040 e otimizações.

---

Esta seção poderá ser expandida conforme novas necessidades forem levantadas.
