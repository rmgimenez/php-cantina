# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

---

## Instruções específicas deste repositório (pt-BR)

O build de produção gera os arquivos estáticos para serem servidos pelo backend (CodeIgniter).

- Instalar dependências:

```powershell
Set-Location -Path 'D:\dev\php-cantina\frontend'; pnpm install
```

- Rodar em desenvolvimento (vite dev):

```powershell
Set-Location -Path 'D:\dev\php-cantina\frontend'; pnpm dev
```

- Build de produção (gera arquivos em `backend/public/frontend`):

```powershell
Set-Location -Path 'D:\dev\php-cantina\frontend'; pnpm build
```

Notas:

- `vite.config.ts` está configurado com `base: '/frontend/'` e `outDir: '../backend/public/frontend'`.
- O backend tem uma rota fallback que serve `public/frontend/index.html` para suportar rotas do SPA.
- Se preferir servir o SPA na raiz, podemos alterar a rota `/` para servir o `index.html` permanentemente.

CORS em desenvolvimento:

- Se você rodar o frontend com `pnpm dev` (Vite), o dev-server normalmente estará em `http://localhost:5173`.
- O backend contém uma configuração de CORS de desenvolvimento em `app/Config/Cors.php` (chave `dev`) que permite `http://localhost:5173` e `http://localhost:3000` e habilita credentials.

API e prefixo `/api`:

- Recomendamos colocar todas as rotas HTTP da API sob o prefixo `/api/` para evitar colisões com o fallback do SPA.
- Exemplo de rota no CodeIgniter: `$routes->get('api/users', 'Api\Users::index');`
