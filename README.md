# php-cantina

Controle de cantina escolar — sistema em PHP com MySQL para registrar consumos de alunos e funcionários, integração com o sistema APS da escola e funcionalidades de PDV, relatórios e controle de estoque.

## Visão rápida

- Linguagens/stack: PHP, MySQL, JavaScript (Bootstrap, jQuery).
- Objetivo: registrar consumo por dependente/funcionário, permitir consulta por responsáveis, gerar relatórios e integração com APS.

> Observação: o esqueleto do CodeIgniter 4 já foi instalado neste repositório via Composer (codeigniter4/appstarter). Utilize os comandos do framework (`spark`) para tarefas de desenvolvimento e migrations.

## Estado atual do repositório

O repositório contém um esqueleto CodeIgniter 4 e artefatos do projeto:

- Estrutura padrão do CodeIgniter 4: `app/` (ou `src/`), `public/`, `writable/`, `tests/`, `vendor/` e o utilitário `spark`.
- `composer.json` e `composer.lock` gerenciando dependências.
- `bancodados.sql` — script de schema inicial (referência/migração inicial).
- Migrations iniciais podem estar em `database/migrations` (verificar e usar preferencialmente).

As futuras mudanças de schema devem ser feitas via migrations incrementais. Evite alterar a migration inicial após produção.

## Setup rápido (desenvolvimento)

Prerequisitos: PHP 8+, MySQL 8 (recomendado), Composer.

1. Instale dependências (caso ainda não tenha sido executado):

```powershell
cd /d D:\dev\php-cantina
composer install
```

2. Crie o arquivo de ambiente `.env` a partir do exemplo e ajuste as variáveis (APP_BASE_URL, database.\*):

```powershell
cd /d D:\dev\php-cantina
copy env .env
# Edite .env e configure DB (DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD)
```

3. Importar o schema inicial (opcional — use migrations preferencialmente):

```powershell
# Usando mysql cli (ajuste usuário e database):
mysql -u SEU_USUARIO -p SEU_BANCO < bancodados.sql

# Ou rode as migrations do projeto (se existirem):
php spark migrate
```

4. Rodar servidor de desenvolvimento:

```powershell
cd /d D:\dev\php-cantina
php spark serve -p 8000
# ou (alternativa) php -S localhost:8000 -t public
```

5. Executar testes (se desejar):

```powershell
cd /d D:\dev\php-cantina
php vendor\bin\phpunit --testdox
```

## Arquivos importantes

- `sobre.md` — escopo do sistema e regras importantes (prefixo de tabelas `cant_`, papéis de usuário).
- `.github/copilot-instructions.md` — diretrizes e convenções do projeto (nomenclatura, prefixos, etc.).

## Boas práticas

- Use migrations para mudanças de schema e mantenha-as idempotentes.
- Utilize transações em operações que envolvem múltiplas escritas coerentes (venda + itens + estoque + saldo).
- Siga convenções descritas em `.github/copilot-instructions.md` (camelCase para variáveis, PascalCase para classes, kebab-case para nomes de arquivos, prefixo `cant_` para tabelas, strings em aspas simples em PHP).

## Próximos passos sugeridos

1. Verificar e ajustar o `.env` com credenciais do MySQL.
2. Importar `bancodados.sql` ou aplicar as migrations existentes.
3. Ajustar e executar seeds de papéis/usuários iniciais (caso necessário).
4. Criar endpoints iniciais: autenticação (RF001), catálogo de produtos (RF006/RF007) e PDV mínimo (RF010).

Se quiser, eu posso configurar o `.env` automaticamente (se você me fornecer as credenciais de desenvolvimento), importar o `bancodados.sql` localmente, e rodar um teste rápido do servidor. Diga qual ação prefere.
