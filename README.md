# php-cantina

Controle de cantina escolar — sistema em PHP com MySQL para registrar consumos de alunos e funcionários, integração com o sistema APS da escola e funcionalidades de PDV, relatórios e controle de estoque.

## Visão rápida

- Linguagens/stack: PHP, MySQL, JavaScript (Bootstrap, jQuery).
- Objetivo: registrar consumo por dependente/funcionário, permitir consulta por responsáveis, gerar relatórios e integração com APS.

## Estado atual do repositório

Neste momento o repositório contém documentação (`sobre.md`) e instruções para agentes. O código-fonte PHP, arquivos de configuração (por exemplo `composer.json`, `config.php` ou `.env`) e migrations podem não estar presentes nesta branch. Antes de implementar, procure por esses arquivos ou confirme com o time.

## Arquivos importantes

- `sobre.md` — escopo do sistema e regras importantes (prefixo de tabelas `cant_`, papéis de usuário).
- `.github/copilot-instructions.md` — diretrizes específicas para agentes/colaboradores (convenções de código e comandos úteis).

## Início rápido (desenvolvimento)

Prerequisitos: PHP (CLI), MySQL, Composer (se aplicável).

Se houver `composer.json`, instale dependências:

```powershell
composer install
```

Para subir um servidor PHP embutido (quando houver um ponto de entrada web, ex.: pasta `public`):

```powershell
php -S localhost:8000 -t public;
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
