# php-cantina

Controle de cantina escolar — sistema em PHP com MySQL para registrar consumos de alunos e funcionários, integração com o sistema APS da escola e funcionalidades de PDV, relatórios e controle de estoque.

## Visão rápida

- Linguagens/stack: PHP, MySQL, JavaScript (Bootstrap, jQuery).
- Objetivo: registrar consumo por dependente/funcionário, permitir consulta por responsáveis, gerar relatórios e integração com APS.

## Estado atual do repositório

O repositório agora contém:

- `composer.json` com autoload PSR-4 e scripts (`start`, `migrate`).
- Estrutura básica `public/index.php` + `src/Bootstrap.php`.
- Sistema de migrations em `database/migrations` + runner `bin/migrate.php`.
- Script SQL monolítico de referência (`bancodados.sql`) usado pela primeira migration.
- Carregamento `.env` minimalista (`src/Env.php`).

As futuras mudanças de schema devem ser feitas via novas migrations incrementais. Evite alterar a migration inicial após produção.

## Arquivos importantes

- `sobre.md` — escopo do sistema e regras importantes (prefixo de tabelas `cant_`, papéis de usuário).
- `.github/copilot-instructions.md` — diretrizes específicas para agentes/colaboradores (convenções de código e comandos úteis).

## Início rápido (desenvolvimento)

Prerequisitos: PHP 8+, MySQL 8 (recomendado), Composer.

Instale dependências:

```powershell
composer install
```

Para subir o servidor embutido (página simples inicial):

```powershell
php -S localhost:8000 -t public;
```

Aplicar migrations (cria schema, triggers e procedures):

```powershell
composer migrate
```

Comandos úteis para localizar artefatos no Windows PowerShell:

```powershell
# listar arquivos PHP
Get-ChildItem -Recurse -Filter *.php
# buscar referências ao prefixo de tabelas
Select-String -Path . -Pattern 'cant_' -SimpleMatch -List
# buscar por integrações APS
Select-String -Path . -Pattern 'APS|integr|aluno|responsavel' -SimpleMatch -List
```

## Convenções e boas práticas

Consulte `.github/copilot-instructions.md` para regras específicas do projeto (nomenclatura camelCase, PascalCase para classes, kebab-case para nomes de arquivo, uso de aspas simples em strings PHP, prefixo `cant_` para tabelas, etc.). Siga essas convenções ao criar código ou migrações.

## Como contribuir

1. Abra uma issue descrevendo a mudança ou bug.
2. Crie uma branch com nome descritivo em kebab-case.
3. Inclua testes e migrações quando necessário.
4. Abra um pull request com descrição das alterações e impactos (especialmente em integrações APS e relatórios de RH).

## Perguntas que ajudam a progredir

- Onde ficam os arquivos de configuração do banco (`config.php`, `.env`)?
- Existe um `composer.json` em outra branch ou repositório remoto?
- Há convenções de testes (ex.: `phpunit`) que devo seguir?

Se quiser, posso procurar por arquivos de configuração em branches remotas ou preparar um esqueleto inicial do projeto (migrations, `composer.json`) — diga qual opção prefere.

## Projeto inicial criado

Criei um esqueleto mínimo do projeto sem framework com autoload PSR-4 (namespace `App\\` -> `src/`) e um ponto de entrada em `public/index.php`.

Para instalar dependências e rodar localmente:

```powershell
composer install
php -S localhost:8000 -t public
```

Copie o arquivo de exemplo de configuração `config/.env.example` para `.env` na raiz:

```powershell
Copy-Item config/.env.example .env
```

Depois rode as migrations:

```powershell
composer migrate
```

### Próximos passos sugeridos

1. Implementar camada de repositórios (`src/Repository`).
2. Criar serviços de domínio (VendaService, SaldoService) com transações.
3. Adicionar PHPUnit e testes de unidade para regras RN021, RN026, RN024.
4. Adicionar mecanismo de rollback em migrations (guardar hash e opcional método down()).
5. Implementar roteamento (ex.: FastRoute) e controllers REST para primeiros endpoints (auth, produtos, alunos).
