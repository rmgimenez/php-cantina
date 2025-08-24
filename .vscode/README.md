# Configurações do VS Code para este workspace

Este diretório contém configurações e atalhos recomendados para melhorar a experiência com o GitHub Copilot e manter consistência entre a equipe.

Arquivos incluídos:

- `settings.json` — configurações do editor (sugestões inline, formatação, exclusões de diretórios pesados).
- `keybindings.json` — atalhos úteis para aceitar e navegar entre sugestões inline.

Como usar

1. Abra o projeto no VS Code.
2. Recarregue a janela: Command Palette → Developer: Reload Window.
3. Teste as sugestões inline:

   - Abra um arquivo `.ts`, `.tsx`, `.js` ou `.jsx`.
   - Escreva um comentário descrevendo a função que você quer. Exemplo:

     ```js
     // Função: calcula o total de vendas por data a partir de um array de vendas
     function calcularTotais(vendas) {}
     ```

   - Comece a escrever o corpo da função e aguarde a sugestão (ghost text). Aceite com `Tab`.

Keybindings presentes (padrão neste workspace)

- `Tab` — aceitar sugestão inline (quando visível)
- `Ctrl+Alt+\` — aceitar sugestão inline (atalho alternativo)
- `Alt+]` — próxima sugestão inline
- `Alt+[` — sugestão inline anterior
- `Ctrl+Esc` — ocultar sugestão inline

Recomendações e boas práticas

- Use comentários curtos e objetivos acima de funções para dar contexto ao Copilot.
- Evite arquivos enormes no mesmo diretório de edição; grandes diretórios devem estar em `files.exclude`.
- Mantenha `formatOnSave` e linters (ESLint/Prettier) ativos para sugestões mais consistentes.
- Revise as opções de privacidade na extensão do GitHub Copilot se o código contém dados sensíveis.

Sugestões para a equipe

- Padronizar `editor.tabSize` (2 ou 4) no `settings.json` do workspace.
- Adicionar um pequeno script de verificação pré-commit (lint/format) para garantir consistência.

Se quiser que eu ajuste os atalhos ou harmonize com outra convenção (ex.: Ctrl+N / Ctrl+P para navegar), posso editar `keybindings.json` automaticamente.

---

_Arquivo gerado automaticamente para documentar as configurações do workspace._
