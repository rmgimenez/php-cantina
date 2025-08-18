# Sistema de Controle de Cantina Escolar

Este projeto implementa um sistema completo para gerenciar operações de uma cantina escolar, permitindo o controle de usuários, funcionários, responsáveis e alunos, além de facilitar a gestão de vendas e estoque.

## Arquitetura do Projeto

O projeto está organizado em duas partes principais:

### Backend (CodeIgniter 4)
- **Localização**: `backend/`
- **Framework**: CodeIgniter 4
- **Linguagem**: PHP 8.1+
- **Banco de dados**: MySQL
- **Responsabilidades**: APIs REST, autenticação, lógica de negócio

### Frontend (React + TypeScript + Vite)
- **Localização**: `frontend/`
- **Framework**: React 19 com TypeScript
- **Build tool**: Vite
- **Gerenciador de pacotes**: pnpm
- **Responsabilidades**: Interface do usuário, SPA (Single Page Application)

## Instalação e Configuração

### Pré-requisitos
- PHP 8.1 ou superior
- Composer
- Node.js 18+ 
- pnpm
- MySQL/MariaDB

### Backend (CodeIgniter 4)

1. **Instalar dependências**:
```bash
cd backend
composer install
```

2. **Configurar ambiente**:
```bash
# Copiar arquivo de configuração
cp env .env

# Editar .env com suas configurações de banco de dados
# Especialmente app.baseURL e configurações do MySQL
```

3. **Executar servidor de desenvolvimento**:
```bash
php spark serve
```
O backend estará disponível em `http://localhost:8080`

### Frontend (Vite + React)

1. **Instalar dependências**:
```bash
cd frontend
pnpm install
```

2. **Executar em modo desenvolvimento**:
```bash
pnpm dev
```
O frontend estará disponível em `http://localhost:5173`

3. **Build de produção**:
```bash
pnpm build
```
Este comando gera os arquivos estáticos em `backend/public/frontend/` para serem servidos pelo backend.

**Mais detalhes**: Ver [frontend/README.md](frontend/README.md)

## Banco de Dados

### Importação do Schema

O arquivo `bancodados.sql` contém o schema completo do banco de dados:

```bash
# Importar via linha de comando
mysql -u usuario -p nome_do_banco < bancodados.sql

# Ou via phpMyAdmin/MySQL Workbench
```

### Importantes:
- **Charset**: O banco utiliza `latin1` (manter compatibilidade)
- **Tabelas legadas**: Existem tabelas pré-existentes (`cadastro_alunos`, `familias`, `funcionarios`) que não devem ser alteradas
- **Novas tabelas**: Todas as tabelas do sistema de cantina devem usar o prefixo `cant_`
- **Migrations**: Não usar migrations do CodeIgniter; manter `bancodados.sql` como fonte de verdade
- **View**: Existe uma view `alunos` que agrega dados de múltiplas tabelas

## CORS e Desenvolvimento

### Desenvolvimento
O backend possui configuração de CORS específica para desenvolvimento em `app/Config/Cors.php`:
- Permite origins: `http://localhost:5173` (Vite) e `http://localhost:3000`
- Habilita credentials para autenticação
- Headers permitidos incluem Authorization e Content-Type

### Produção
- Configuração mais restritiva
- Configure `CORS_ALLOWED_ORIGINS` no `.env` de produção
- Apenas origins específicas devem ser permitidas

**Mais detalhes**: Ver [backend/README.md](backend/README.md)

## Bibliotecas e Dependências

### Frontend
- **[react-router-dom](https://reactrouter.com/)**: Roteamento SPA
- **[axios](https://axios-http.com/)**: Requisições HTTP  
- **[zustand](https://github.com/pmndrs/zustand)**: Gerenciamento de estado
- **[@tanstack/react-query](https://tanstack.com/query)**: Cache e sincronização de dados
- **[bootstrap](https://getbootstrap.com/)**: Framework CSS
- **[bootstrap-icons](https://icons.getbootstrap.com/)**: Ícones

### Backend
- **[CodeIgniter 4](https://codeigniter.com/)**: Framework PHP
- **[firebase/php-jwt](https://github.com/firebase/php-jwt)**: Autenticação JWT

## Testes e Qualidade

### Backend (PHPUnit)
```bash
cd backend

# Executar todos os testes
./vendor/bin/phpunit

# Executar testes específicos
./vendor/bin/phpunit tests/Feature/AlunosTest.php

# Gerar coverage (se configurado)
./vendor/bin/phpunit --coverage-html coverage/
```

**Mais detalhes**: Ver [backend/tests/README.md](backend/tests/README.md)

### Frontend (ESLint)
```bash
cd frontend

# Verificar lint
pnpm lint

# Build com verificação de tipos TypeScript
pnpm build:ci
```

## Estrutura de APIs

As APIs do backend seguem o padrão REST com prefixo `/api/`:
- `GET /api/alunos` - Listar alunos
- `GET /api/alunos/:ra` - Detalhes de um aluno
- `POST /api/auth/login` - Autenticação

Exemplo de endpoint implementado: [backend/ALUNOS-API-README.md](backend/ALUNOS-API-README.md)

## Checklist Pré-Merge/PR

Antes de abrir um Pull Request, execute:

### Frontend
```bash
cd frontend
pnpm install          # Verificar dependências
pnpm lint             # Verificar código
pnpm build            # Gerar build de produção
```

### Backend  
```bash
cd backend
composer install      # Verificar dependências
php -l app/**/*.php   # Verificar sintaxe PHP
./vendor/bin/phpunit  # Executar testes
```

### Verificações Gerais
- [ ] Frontend compila sem erros (`pnpm build`)
- [ ] Backend não possui erros de sintaxe
- [ ] Testes PHPUnit estão passando
- [ ] ESLint não reporta erros críticos
- [ ] Build gera arquivos em `backend/public/frontend/`
- [ ] APIs seguem padrão `/api/` se aplicável

## Documentação Adicional

- **[sobre.md](sobre.md)**: Visão detalhada do projeto e funcionalidades
- **[frontend/README.md](frontend/README.md)**: Configurações específicas do frontend
- **[backend/README.md](backend/README.md)**: Configurações específicas do backend e CodeIgniter
- **[backend/tests/README.md](backend/tests/README.md)**: Guia completo de testes

## Funcionalidades Principais

- **Gestão de usuários**: Administradores, atendentes e estoquistas
- **Controle de alunos**: Consulta de saldo e realização de compras
- **Gestão de responsáveis**: Adição de crédito e controle de dependentes  
- **Funcionários da escola**: Compras com fechamento mensal
- **Relatórios**: Consumo e saldo detalhados

Para mais detalhes sobre funcionalidades, consulte [sobre.md](sobre.md).