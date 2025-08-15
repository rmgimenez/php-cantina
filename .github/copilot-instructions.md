## Instruções para agentes de codificação — `php-cantina`

### Visão geral e arquitetura

- Sistema de controle de cantina escolar em PHP, baseado em CodeIgniter 4 (MVC). Entrypoint web: `public/`. CLI: `spark` na raiz.
- Banco de dados MySQL, todas as tabelas do sistema usam prefixo `cant_` (ex: `cant_usuario`, `cant_venda`).
- Integração com sistema APS (controle de alunos/funcionários) via tabelas de staging `cant_stg_aps_*` e camada de serviço (busque por "APS", "stg_aps", "integr").
- Estrutura principal: controllers em `app/Controllers/`, models em `app/Models/`, views em `app/Views/`. Configurações em `app/Config/`.

### Fluxos críticos e comandos

- Instalação: `composer install`
- Configuração: copie `env` para `.env` e ajuste DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD.
- Migrations: `php spark migrate` (schema incremental em `app/Database/Migrations`).
- Servidor dev: `php spark serve -p 8000` (ou `php -S localhost:8000 -t public`).
- Testes: `vendor\bin\phpunit.bat -c phpunit.xml.dist` (testes em `tests/`).

### Convenções e padrões do projeto

- Classes PHP: PascalCase; variáveis: camelCase; constantes: UPPER_SNAKE_CASE.
- Strings PHP: aspas simples; HTML: aspas duplas.
- Controllers, models e views seguem padrão CodeIgniter 4 (ex: `UsuarioModel` em `app/Models/`).
- Sempre use prefixo `cant_` para novas tabelas e atualize seeds/migrations.
- Rotas: registre novas em `app/Config/Routes.php`.
- Não altere tabelas legadas sem prefixo (ex: `cadastro_alunos`).

### Integrações e pontos de atenção

- APS: tabelas de staging (`cant_stg_aps_responsavel`, etc.) e serviços de integração. Busque "APS" ou "stg_aps" para localizar lógica.
- Transações: operações compostas (venda, estoque, saldo) devem usar transações (`db->transStart()`/`transComplete()`).
- APIs: endpoints retornam envelope JSON `{ success: bool, data: any, errors?: [] }`.

### Exemplos e arquivos-chave

- `sobre.md`: escopo, requisitos, regras e prefixos obrigatórios.
- `bancodados.sql`: schema completo, seeds de papéis, permissões e parâmetros.
- `app/Config/Database.php`: conexão DB (prefira `.env` para credenciais).
- `app/Controllers/Auth.php`, `app/Models/UsuarioModel.php`: exemplos de autenticação e padrão de model/controller.
- `tests/unit/HealthTest.php`: exemplo de teste unitário.

### Dicas para agentes/PRs

- Sempre valide uso do prefixo `cant_` em tabelas e queries.
- Siga estrutura e nomenclatura do CodeIgniter 4.
- Ao criar migrations/seeds, sincronize com `bancodados.sql`.
- Explique no PR impactos em APS ou relatórios ao alterar dados.

---

Se algo estiver desatualizado ou faltar contexto (ex: detalhes APS), sinalize pontos específicos para revisão.
