# Sistema de Controle de Cantina Escolar - Copilot Instructions

## Project Overview

This is a **school cafeteria management system** built with **Next.js**, **Bootstrap**, and **MySQL**. The system manages sales, inventory, user accounts (students, parents, school staff), and meal packages for a school cafeteria environment.

## Architecture & Key Components

### Database Design (MySQL)

- **Existing Tables**: `cadastro_alunos`, `funcionarios` (pre-existing school system tables - DO NOT MODIFY)
- **Cantina Tables**: All new tables use `cant_` prefix (defined in `bancodados.sql`)
- **Key Entities**: Products, Product Types, User Accounts, Sales, Meal Packages, Financial Movements
- **Complex Relationships**: Student restrictions on products/categories, meal package consumption tracking

### User Types & Authentication

- **Cantina Staff**: 3 roles (administrador, atendente, estoquista) - username/password auth
- **Students**: Identified by `ra` (student ID), no direct login
- **Parents**: Login via CPF + birth date to manage student accounts
- **School Staff**: Monthly account billing system for purchases

### Core Business Logic

- **Account-based sales**: Students/staff buy on credit, parents add funds
- **Meal packages**: Pre-purchased meal plans with consumption tracking
- **Product restrictions**: Parents can restrict what students can purchase
- **Inventory management**: Real-time stock tracking with automatic updates
- **Financial tracking**: Complete audit trail of all transactions

## Development Patterns

### Database Conventions

```sql
-- Table naming: cant_{entity_name}
-- Use camelCase for variables, PascalCase for classes
-- All cantina tables have: id, ativo, data_criacao, data_atualizacao
-- Foreign keys follow pattern: fk_cant_{table}_{field}
```

### Critical Stored Procedures & Triggers

- `sp_cant_adicionar_credito_aluno()`: Add funds to student accounts
- `sp_cant_verificar_restricao_aluno()`: Check product purchase restrictions
- `sp_cant_gerar_numero_venda()`: Generate daily sequential sale numbers
- Auto-triggers: Update balances, stock levels, and audit trails on sales

### Key Business Rules

1. **Student purchases**: Check account balance + product restrictions before sale
2. **Meal packages**: Verify active packages and decrement usage on consumption
3. **Staff accounts**: Monthly billing cycle, automatic account creation per month
4. **Parent controls**: Can set daily spending limits and product restrictions
5. **Stock management**: Real-time updates with historical tracking

## Views & Reports

- `cant_view_alunos_completo`: Students with account and parent info
- `cant_view_produtos_estoque_baixo`: Low stock alerts
- `cant_view_vendas_resumo`: Daily sales summary by customer type
- `cant_view_pacotes_alunos_ativos`: Active meal packages per student

## Frontend Technology Stack

- **Next.js**: React framework with SSR/SSG capabilities
- **Bootstrap**: UI styling framework
- **react-icons**: Icon library

## Critical Integration Points

- **Existing school system**: Must integrate with `cadastro_alunos` and `funcionarios` tables
- **Financial workflows**: Real-time balance updates and transaction logging
- **Reporting system**: Monthly billing for school staff consumption
- **Parent portal**: CPF-based authentication for account management

## Development Workflow

- Database scripts in `bancodados.sql` - manual execution (no migrations)
- Use kebab-case for file names, camelCase for variables
- All financial calculations use DECIMAL(10,2) for precision
- Implement proper error handling for insufficient funds/stock scenarios

## Security Considerations

- Password hashing for cantina staff (example uses bcrypt)
- SQL injection prevention in all database queries
- Session management for different user types
- Audit trail for all financial transactions
