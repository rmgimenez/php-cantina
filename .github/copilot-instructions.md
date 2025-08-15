## Objetivo

Instruções curtas e acionáveis para agentes de codificação que vão trabalhar neste repositório `php-cantina`.

## Documento fonte principal

- Leia `sobre.md` primeiro — contém o escopo do sistema, tecnologias usadas e regras importantes (por exemplo, prefixo de tabelas).
- `README.md` é um guia geral, mas `sobre.md` é o documento fonte primário.

## Objetivo

Instruções curtas e acionáveis para agentes de codificação que vão trabalhar neste repositório `php-cantina`.

## Leitura inicial recomendada (orde nado)

- `sobre.md` — documento fonte primário com escopo, requisitos e regras (ex.: prefixo `cant_`).
- `bancodados.sql` — schema e seeds iniciais (veja tabelas `cant_*`, parâmetros e usuários seedados).
- `app/Config/` — arquivos de configuração do CodeIgniter 4 (App.php, Database.php, Routes.php, etc.).

## Visão geral curta (o que importa)

- Projeto é um aplicativo PHP baseado em CodeIgniter 4 (skeleton presente). O entrypoint web está em `public/` e há o CLI helper `spark` na raiz.
- Banco MySQL com prefixo de tabelas `cant_` (procure por esse padrão em queries e migrations).
- Integração APS é um domínio importante (staging tables `cant_stg_aps_*` estão no schema). Busque por "APS", "integr", "stg_aps" ao investigar integrações.

## Convenções e padrões detectados (siga estes)

- Código PHP segue as convenções do CodeIgniter 4: classes em PascalCase, namespaces padrão, controllers em `app/Controllers`, models em `app/Models`.
- Nomes de variáveis: camelCase.
- Constantes: UPPER_SNAKE_CASE.
- Preferência por aspas simples em strings PHP (`'texto'`) e aspas duplas em atributos HTML ("valor").
- Prefixo de tabelas: sempre `cant_` (ex.: `cant_usuario`, `cant_venda`).
- Migrations e seeds: `app/Database/Migrations` e `app/Database/Seeds` (use `php spark migrate` / `php spark db:seed`).
- Observação sobre nomes de arquivos: o repositório usa o padrão do framework (PascalCase para classes/arquivos PHP). Ignore a recomendação genérica de kebab-case para arquivos PHP — siga o padrão do CodeIgniter para arquivos de classe.

## Locais-chave no repositório (onde olhar primeiro)

- `app/Config/Database.php` — parâmetros de conexão; confirme se `.env` existe ou copie `env` para `.env` e ajuste.
- `bancodados.sql` — esquema completo com seeds iniciais (papéis, permissões, parâmetros). Útil para inspeção rápida do modelo de dados.
- `app/Database/Migrations` e `app/Database/Seeds` — implementações incrementais do schema; prefira migrations quando existirem.
- `app/Controllers/`, `app/Models/`, `app/Views/` — fluxo MVC padrão; procure controllers de PDV/recarga/venda para lógica de negócio.
- `spark` (arquivo CLI) — utilitário do CodeIgniter para servir, migrar e rodar testes.
- `tests/` e `phpunit.xml.dist` — suíte de testes; veja exemplos em `tests/unit` e `tests/database`.

## Comandos de desenvolvedor (Windows PowerShell)

```powershell
# instalar dependências
composer install

# preparar ambiente (copiar arquivo de exemplo)
copy env .env; # editar .env para DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD

# rodar migrations (quando existirem)
php spark migrate

# iniciar servidor de desenvolvimento (usa public/)
php spark serve -p 8000
# alternativa: php -S localhost:8000 -t public

# rodar testes PHPUnit (versão bundlada no vendor)
vendor\bin\phpunit.bat -c phpunit.xml.dist
```

Observação: `composer.json` e `vendor/` estão presentes — não é necessário rebaixar ferramentas manualmente.

## Integrações e pontos de atenção

- APS: existem tabelas de staging no `bancodados.sql` (`cant_stg_aps_responsavel`, `cant_stg_aps_aluno`, `cant_stg_aps_funcionario`). A implementação real da integração pode estar em uma camada de serviço (pesquise por "APS", "stg_aps", "integr").
- Filtre buscas por prefixo `cant_` para localizar rapidamente entidades do domínio.
- Uso de transações é esperado em operações compostas (venda + itens + estoque + saldo); procure por chamadas a `db->transStart()` / `db->transComplete()` ou uso do Query Builder em transações.

## Padrões de API / respostas

- API internas e endpoints costumam seguir envelope JSON: { success: bool, data: any, errors?: [] } — verificar controllers para confirmar formato e replicar nos novos endpoints.

## Seeds e dados úteis

- `bancodados.sql` inclui seeds para papéis (`cant_papel`), permissões e parâmetros (ex.: `janela_cancelamento_min`, `peso_minimo_gramas`). Use esse arquivo como referência ao criar migrations ou seeders.

## Regras práticas para agentes/PRs automatizados

- Antes de criar/renomear tabelas, confirme uso do prefixo `cant_` e atualize migrations + `bancodados.sql` se alterar seeds.
- Siga a estrutura do CodeIgniter 4 ao colocar controllers, models e views. Use `app/Config/Routes.php` para registrar novas rotas.
- Evite alterações rompantes em nomes de arquivos de classes (siga PascalCase e namespaces do framework).
- Para mudanças de dados (migrations/seeds), inclua uma nota curta no PR sobre impacto em APS e relatórios (quem consome os dados).

## Perguntas para o revisor humano (prioritárias)

1. Onde preferem manter credenciais: `.env` (local) ou `app/Config/Database.php` (committed) para testes? (recomendamos usar `.env`)
2. Quais jobs de integração APS já existem (endpoints/cron) e qual o ponto de contato para testes end-to-end?
3. Há regras de lint/format (phpcs, php-cs-fixer) que devo aplicar nas PRs automáticas?

---

Se algo estiver incorreto ou incompleto, indique pontos específicos (ex.: arquivos de integração APS) e eu ajusto o documento.
