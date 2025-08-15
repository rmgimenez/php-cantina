# Sistema de controle de cantina escolar

O objetivo desse sistema é gerenciar de forma eficiente as operações de uma cantina escolar, permitindo o controle de usuários, funcionários, responsáveis e alunos, além de facilitar a gestão de vendas e estoque.

## Organização do Projeto

O projeto está organizado em duas partes principais: backend e frontend.

Durante o desenvolvimento, será importante manter uma comunicação clara entre as equipes de backend e frontend para garantir que as APIs atendam às necessidades da interface do usuário.

Terá que ser feito configuração de CORS no backend para permitir requisições do frontend durante o desenvolvimento.

Em produção, a configuração de CORS deve ser mais restritiva, permitindo apenas origens específicas.

Quando fizer o build do frontend, os arquivos estáticos gerados devem ser servidos pelo backend.

### Backend

O backend ficará na pasta `backend`, onde serão implementadas as APIs necessárias para o funcionamento do sistema.

Será usado a framework codeigniter 4.

### Frontend

O frontend ficará na pasta `frontend`, onde será implementada a interface do usuário do sistema.

Será utilizado vite com react para a construção da aplicação frontend.

Para gerenciar os pacotes será utilizado o gerenciador de pacotes pnpm.

Bibliotecas utilizadas:

- [react-router-dom](https://reactrouter.com/en/main) - Para roteamento da aplicação.
- [axios](https://axios-http.com/) - Para requisições HTTP.
- [zustand](https://github.com/pmndrs/zustand) - Para gerenciamento de estado.
- [react-query](https://react-query.tanstack.com/) - Para gerenciamento de dados assíncronos.
- [bootstrap](https://getbootstrap.com/) - Para estilização da aplicação.
- [react-icons](https://react-icons.github.io/react-icons/) - Para ícones no projeto.

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
- Os produtos deverão possuir um tipo para classificação (ex: salgados, doces, etc).
- Os responsáveis poderão comprar pacotes de alimentação para seus filhos. Por exemplo, comprar lanche da manhã e almoço por 1 mês.
- Os funcionários da cantina poderão verificar se o aluno possui pacote de refeição comprada.
- Os funcionários da cantina poderão verificar o histórico de vendas e consumo dos alunos.

## Banco de dados

O banco de dados utilizado será MySQL.

Ele já possui algumas tabelas criadas. O sistema poderá usar essas tabelas existentes, mas não alterá-las.

Todas as tabelas do banco de dados deverão ser criadas com o prefixo `cant_`.

Não é para usar migrations do codeigniter.

Todo o esquema do banco de dados deve ser criado manualmente.

Os scripts estarão no arquivo `bancodados.sql`.
