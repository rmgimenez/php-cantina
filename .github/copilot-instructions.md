## Objetivo

Instruções curtas e acionáveis para agentes de codificação que vão trabalhar neste repositório `php-cantina`.

## Documento fonte principal

- Leia `sobre.md` primeiro — contém o escopo do sistema, tecnologias usadas e regras importantes (por exemplo, prefixo de tabelas).
- `README.md` está presente mas vazio; não confie nele como fonte completa.

## Visão geral rápida (o "porquê")

- Sistema PHP para controle de cantina escolar; banco de dados MySQL. Objetivo: registrar consumo por alunos e funcionários e integrar com o sistema APS da escola.
- Pontos essenciais: integração com APS (dados de responsáveis/alunos), tabelas do banco com prefixo `cant_`, papéis de usuário (caixa, supervisor, gerente, informática).

## Tecnologias (visíveis em `sobre.md`)

- PHP, MySQL, Composer, JavaScript, Bootstrap, jQuery.

## Convenções do projeto (regras obrigatórias que o agente deve seguir)

- Prefixo de tabelas no banco: `cant_` (procure por esse padrão ao localizar SQL/queries).
- Nomes de variáveis em código: camelCase.
- Nomes de classes: PascalCase.
- Constantes: UPPER_SNAKE_CASE.
- Nomes de arquivos: kebab-case (use `-` entre palavras).
- Strings em código: use aspas simples (`'texto'`).
- Atributos HTML: use aspas duplas ("valor").
- Termine sentenças em linguagens que exigem com ponto-e-vírgula (`;`).

## Onde procurar código relevante

- Procure por arquivos PHP e por padrões SQL que contenham `cant_`.
- Verifique configurações de conexão com MySQL (normalmente arquivos `config`, `db`, ou `bootstrap` se existirem).
- Integração com APS: busque por termos `APS`, `integr`, `aluno`, `responsavel` em PHP/JS.

## Comandos úteis (assunções mínimas)

Algumas ferramentas são citadas em `sobre.md` (Composer, MySQL). Se o repositório tiver `composer.json`, use:

```powershell
composer install
```

Para localizar rapidamente referências no Windows PowerShell:

```powershell
# listar arquivos PHP
Get-ChildItem -Recurse -Filter *.php
# buscar referências ao prefixo de tabelas
Select-String -Path . -Pattern 'cant_' -SimpleMatch -List
# buscar por APS/integracao
Select-String -Path . -Pattern 'APS|integr|aluno|responsavel' -SimpleMatch -List
```

Se precisar rodar um servidor local rápido (assumindo que haja um ponto de entrada web), uma opção simples:

```powershell
php -S localhost:8000 -t public;
```

Observação: não encontramos `composer.json`, arquivos PHP nem estrutura pública neste repositório no momento; as linhas acima são instruções práticas a usar se/quando esses arquivos aparecerem.

## Padrões de implementação observáveis / exemplos do repositório

- `sobre.md` documenta papéis: `caixa`, `supervisor`, `gerente`, `informática`. Quando criar ou revisar código de autorização, garanta que as permissões implementadas correspondam a esses papéis.
- As funcionalidades desejadas listadas (PDV, relatórios, integração APS, baixa de faturas) são as prioridades do produto — inclua testes e rotas/CAMINHOS relacionados a esses domínios.

## Limites do que está documentado aqui

- Este repositório, no estado atual, contém apenas documentação (`sobre.md`) e não possui código fonte PHP ou arquivos de configuração detectados. Não invente caminhos/arquivos não presentes; ao implementar, use busca para localizar os arquivos reais e adapte as instruções.

## Orientações para alterações de código geradas por agentes

- Siga estritamente as convenções descritas acima (nomenclatura, aspas, kebab-case para arquivos).
- Antes de criar ou renomear tabelas, confirme o prefixo `cant_` e atualize migrations/SQL export do projeto.
- Ao propor alterações que afetam dados (migrações, scripts SQL), inclua uma breve nota explicando impactos em APS e em relatórios de RH.

## Perguntas para pedir ao revisor humano

1. Onde ficam os arquivos de configuração de banco (ex.: `config.php`, `.env`)?
2. Existe um `composer.json` que não foi comitado aqui? Qual comando padrão usamos para iniciar o app localmente?
3. Há testes automatizados ou estilos de lint específicos que devo aplicar?

---

Se algo estiver incorreto ou incompleto, diga o que devo ajustar — vou iterar o arquivo com base no seu retorno.
