# Sistema de controle de cantina escolar

O objetivo desse sistema é gerenciar de forma eficiente as operações de uma cantina escolar, permitindo o controle de usuários, funcionários, responsáveis e alunos, além de facilitar a gestão de vendas e estoque.

## Cores

Cores principais para serem utilizadas no sistema:

- Azul: #253287
- Vermelho: #B20000
- Amarelo: #FEA800
- Escuro: #333333
- Claro: #FFFFFF

## Tecnologias utilizadas

O sistema utiliza as seguintes tecnologias:

- **Next.js**: Framework React para construção do frontend com renderização híbrida (SSR/SSG).
- **bootstrap**: Para estilização da aplicação.
- **react-icons**: Para uso de ícones.
- **MySQL**: Banco de dados relacional utilizado no backend.
- **PNPM**: Gerenciador de pacotes utilizado para instalação das dependências.

## Funcionalidades

### Atores

#### Funcionários da cantina

São os usuários responsáveis pelo atendimento e gestão da cantina.

Eles usarão um nome de usuário e senha para acessar o sistema.

#### Alunos

São os principais clientes da cantina.

#### Responsáveis dos alunos

São os responsáveis legais pelos alunos e poderão gerenciar as contas de seus dependentes.

#### Funcionários da escola

São consumidores que podem marcar na conta da cantina suas compras e depois a cantina envia um relatório para o departamento pessoal para descontar o valor consumido no mês. A conta fecha por mês.

### Funcionalidades do sistema

- Os funcionários da cantina poderão ser de 3 tipos:
  - Administrador: Tem acesso total ao sistema, podendo gerenciar usuários, produtos e vendas.
  - Atendente: Pode realizar vendas e consultar o estoque.
  - Estoquista: Pode gerenciar o estoque de produtos.
- Os alunos poderão consultar o saldo de suas contas e realizar compras.
- Os responsáveis poderão gerenciar as contas de seus dependentes, incluindo a possibilidade de adicionar crédito.
- Os funcionários da escola poderão realizar compras e marcar na conta da cantina, que será fechada mensalmente.
- Os responsáveis poderão consultar o que foi consumido e o saldo de seus dependentes através de uma tela onde ele deverá logar com o número do CPF e a data de nascimento.
- Os responsáveis poderão definir quais tipos de produtos ou produtos individuais que seus dependentes podem consumir.

  NOTE: A funcionalidade de consulta de consumo pelos responsáveis (login por CPF + data de nascimento e visualização de extrato/saldo) foi removida deste sistema e será implementada em um sistema separado. As capacidades restantes para responsáveis (como adicionar crédito, definir restrições e comprar pacotes) permanecem neste sistema.

- Os produtos deverão possuir um tipo para classificação (ex: salgados, doces, etc).
- Os responsáveis poderão comprar pacotes de alimentação para seus filhos. Por exemplo, comprar lanche da manhã e almoço por 1 mês.
- Os funcionários da cantina poderão verificar se o aluno possui pacote de refeição comprada.
- Os funcionários da cantina poderão verificar o histórico de vendas e consumo dos alunos.

## Banco de dados

O banco de dados utilizado será MySQL.

Ele já possui algumas tabelas criadas. O sistema poderá usar essas tabelas existentes, mas não alterá-las.

Todas as tabelas do banco de dados deverão ser criadas com o prefixo `cant_`.

Todo o esquema do banco de dados deve ser criado manualmente.

Os scripts estarão no arquivo `bancodados.sql`.

## Requisitos Funcionais

Sempre que um requisito for concluído, ele deverá ser marcado como "concluído".

### concluído - RF-001 - Autenticação de Funcionários da Cantina

O sistema deve permitir que funcionários da cantina façam login usando nome de usuário e senha, com controle de tipos de usuário (administrador, atendente, estoquista).

### concluído - RF-002 - Gerenciamento de Produtos

O sistema deve permitir o cadastro, edição, consulta e inativação de produtos, incluindo código de barras, nome, descrição, tipo, preço e controle de estoque.

### concluído - RF-003 - Controle de Tipos de Produtos

O sistema deve permitir o cadastro e gerenciamento de tipos de produtos (salgados, doces, bebidas, etc.) para classificação dos itens.

### concluído - RF-004 - Controle de Estoque

O sistema deve controlar automaticamente o estoque dos produtos, registrando entradas, saídas e ajustes com histórico completo de movimentações.

### concluído - RF-005 - Alerta de Estoque Baixo

O sistema deve gerar alertas quando produtos atingirem o estoque mínimo configurado.

### concluído - RF-006 - Gerenciamento de Contas de Alunos

O sistema deve permitir a criação e gerenciamento de contas para alunos, vinculadas ao RA (registro acadêmico) existente no sistema escolar.

### concluído - RF-007 - Adição de Crédito em Contas de Alunos

O sistema deve permitir que funcionários da cantina adicionem crédito nas contas dos alunos, registrando todas as movimentações financeiras.

### concluído - RF-008 - Controle de Saldo de Alunos

O sistema deve controlar o saldo das contas dos alunos, debitando automaticamente o valor das compras realizadas.

### RF-009 - (REMOVIDO) Login de Responsáveis

Esta funcionalidade foi removida: o login e a consulta de consumo por responsáveis serão fornecidos por outro sistema externo. Removida do escopo deste repositório.

### RF-010 - (REMOVIDO) Consulta de Saldo e Extrato por Responsáveis

Esta funcionalidade foi removida do sistema; a visualização de saldo/extrato por responsáveis ficará a cargo do novo sistema de portal de responsáveis.

### RF-011 - Recarga de Crédito por Responsáveis

O sistema deve permitir que responsáveis adicionem crédito nas contas de seus dependentes através do portal web.

Os responsáveis poderão pagar via cartão de crédito, PIX ou boleto bancário. Tudo isso diretamente no caixa.

### RF-012 - Controle de Restrições de Produtos

O sistema deve permitir que responsáveis definam restrições de consumo, bloqueando produtos específicos ou tipos de produtos para seus dependentes.

Os responsáveis poderão definir restrições de consumo, bloqueando produtos específicos ou tipos de produtos para seus dependentes. Para bloquear os responsáveis deverão ir no caixa da cantina e solicitar para um atendente.

### RF-013 - Configuração de Limite Diário

O sistema deve permitir que responsáveis definam um limite de gasto diário para seus dependentes.

Isso deve ser feito no caixa da cantina. O responsável deverá solicitar ao atendente a configuração do limite.

### RF-014 - Gerenciamento de Contas de Funcionários da Escola

O sistema deve criar automaticamente contas mensais para funcionários da escola, permitindo compras a crédito que serão fechadas mensalmente.

### concluído - RF-015 - Processamento de Vendas

O sistema deve processar vendas para diferentes tipos de clientes (alunos, funcionários da escola, pagamento à vista), verificando saldo e restrições antes da finalização.

### RF-016 - Verificação de Restrições na Venda

O sistema deve verificar automaticamente se o aluno pode consumir o produto baseado nas restrições definidas pelos responsáveis antes de permitir a venda.

Mostrar mensagem de erro caso o aluno não possa consumir o produto.

### RF-017 - Geração de Número de Venda

O sistema deve gerar automaticamente números sequenciais únicos para cada venda, organizados por data.

### RF-018 - Registro de Itens da Venda

O sistema deve registrar todos os itens vendidos, quantidades, preços unitários e subtotais para cada venda.

### RF-019 - Controle de Formas de Pagamento

O sistema deve suportar diferentes formas de pagamento: conta (débito em conta), dinheiro, cartão e PIX.

### RF-020 - Cálculo de Troco

O sistema deve calcular automaticamente o troco para vendas em dinheiro, registrando valor recebido e troco dado.

### RF-021 - Criação de Pacotes de Alimentação

O sistema deve permitir a criação de pacotes de refeições (lanche manhã, almoço, lanche tarde) com validade e preços específicos.

### RF-022 - Compra de Pacotes por Responsáveis

O sistema deve permitir que responsáveis comprem pacotes de alimentação para seus dependentes, definindo período de validade e número de refeições.

### RF-023 - Consumo de Pacotes

O sistema deve permitir que funcionários da cantina registrem o consumo de refeições de pacotes, decrementando automaticamente o saldo de refeições disponíveis.

### RF-024 - Verificação de Pacotes Ativos

O sistema deve permitir consultar rapidamente se um aluno possui pacotes de refeição ativos e quantas refeições restam.

### RF-025 - Relatório de Vendas Diárias

O sistema deve gerar relatórios de vendas por período, separando por tipo de cliente e funcionário responsável.

### RF-026 - Relatório de Consumo Mensal de Funcionários

O sistema deve gerar relatórios mensais do consumo de funcionários da escola para envio ao departamento pessoal.

### RF-027 - Histórico de Movimentações Financeiras

O sistema deve manter histórico completo de todas as movimentações financeiras (créditos, débitos) com data, hora e responsável.

### RF-028 - Histórico de Vendas por Aluno

O sistema deve permitir consultar o histórico completo de compras de qualquer aluno, incluindo produtos consumidos e valores.

### RF-029 - Controle de Sessões de Usuário

O sistema deve gerenciar sessões de login para todos os tipos de usuários, mantendo segurança e controle de acesso.

### RF-030 - Auditoria de Operações

O sistema deve registrar todas as operações realizadas, identificando usuário responsável, data/hora e tipo de operação para fins de auditoria.
