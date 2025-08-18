## Autenticação - RF-001

Instruções rápidas para executar a autenticação de funcionários (demo em memória).

- Instalar dependências: pnpm install
- Variável opcional: JWT_SECRET para produção
- Usuários demo:
  - admin / admin123 (administrador)
  - atendente / atende123 (atendente)
  - estoquista / estoq123 (estoquista)

Endpoints:
- POST /api/auth/login { username, password } -> seta cookie httpOnly `cant_token`
- GET /api/auth/me -> retorna usuário autenticado

Notas:
- Esta implementação usa um store em memória para demonstração. Substitua por queries ao banco de dados (MySQL) em produção.
