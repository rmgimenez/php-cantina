# Controle de cantina escolar

Sistema de controle de cantina escolar feito em PHP com banco de dados MySql.

## Tecnologias utilizadas

- PHP
- MySql
- Composer
- JavaScript
- Bootstrap
- jQuery

## Banco de dados

As tabelas do sistema deverão começar com o prefixo `cant_`.

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
