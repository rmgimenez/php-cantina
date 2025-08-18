# API Endpoints - Gestão de Alunos

Este documento descreve os endpoints implementados para a gestão de alunos.

## Base URL
```
/api/alunos
```

## Autenticação
Todos os endpoints requerem autenticação JWT. Incluir o header:
```
Authorization: Bearer <token>
```

## Endpoints

### 1. Listar Alunos
**GET** `/api/alunos`

Lista alunos com paginação e filtros opcionais.

**Query Parameters:**
- `q` (opcional): Busca por nome ou RA
- `curso` (opcional): Filtro por nome do curso  
- `serie` (opcional): Filtro por série
- `turma` (opcional): Filtro por turma
- `status` (opcional): Filtro por status (padrão: MAT)
- `page` (opcional): Página (padrão: 1)
- `perPage` (opcional): Itens por página (padrão: 20, máx: 100)

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": [
    {
      "ra": 2021001,
      "nome": "João Silva",
      "nome_social": null,
      "curso_nome": "Ensino Fundamental",
      "serie": 6,
      "turma": "6A",
      "status": "MAT"
    }
  ],
  "meta": {
    "page": 1,
    "perPage": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### 2. Obter Dados do Aluno
**GET** `/api/alunos/{ra}`

Retorna dados completos de um aluno específico.

**Path Parameters:**
- `ra`: RA do aluno (número)

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Aluno encontrado",
  "data": {
    "ra": 2021001,
    "nome": "João Silva",
    "nome_social": null,
    "nasc": "2010-05-15",
    "curso_nome": "Ensino Fundamental",
    "serie": 6,
    "turma": "6A",
    "status": "MAT",
    "nome_resp": "Maria Silva",
    "cpf_resp": "12345678901",
    "email": "joao@teste.com"
  }
}
```

**Resposta de Erro (404):**
```json
{
  "success": false,
  "message": "Aluno não encontrado",
  "errors": {
    "code": "NOT_FOUND"
  }
}
```

### 3. Obter Dados da Conta
**GET** `/api/alunos/{ra}/conta`

Retorna saldo e informações da conta do aluno.

**Path Parameters:**
- `ra`: RA do aluno (número)

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Dados da conta obtidos",
  "data": {
    "ra": 2021001,
    "saldo": 150.00,
    "limite_diario": 50.00,
    "conta_ativa": true,
    "historico_recente": [
      {
        "id": 1,
        "tipo_movimentacao": "credito",
        "valor": 100.00,
        "descricao": "Crédito inicial",
        "data_movimentacao": "2025-01-15 10:30:00",
        "funcionario_nome": "Admin Teste"
      }
    ]
  }
}
```

### 4. Adicionar Crédito
**POST** `/api/alunos/{ra}/credito`

Adiciona crédito na conta do aluno.

**Path Parameters:**
- `ra`: RA do aluno (número)

**Body (JSON):**
```json
{
  "valor": 50.00,
  "motivo": "Recarga responsável"
}
```

**Campos:**
- `valor` (obrigatório): Valor do crédito (number > 0)
- `motivo` (opcional): Descrição da operação (string, máx 255 chars)

**Permissões Required:** administrador ou atendente

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Crédito adicionado com sucesso",
  "data": {
    "ra": 2021001,
    "valor_adicionado": 50.00,
    "saldo_atual": 200.00,
    "motivo": "Recarga responsável"
  }
}
```

**Resposta de Erro - Validação (422):**
```json
{
  "success": false,
  "message": "Dados inválidos",
  "errors": {
    "valor": "O valor é obrigatório e deve ser maior que zero"
  }
}
```

**Resposta de Erro - Sem Permissão (403):**
```json
{
  "success": false,
  "message": "Sem permissão para adicionar créditos"
}
```

### 5. Histórico de Movimentações
**GET** `/api/alunos/{ra}/historico`

Retorna histórico detalhado de movimentações da conta.

**Path Parameters:**
- `ra`: RA do aluno (número)

**Query Parameters:**
- `page` (opcional): Página (padrão: 1)
- `perPage` (opcional): Itens por página (padrão: 20, máx: 100)

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Histórico obtido",
  "data": {
    "historico": [
      {
        "id": 1,
        "tipo_movimentacao": "credito",
        "valor": 100.00,
        "descricao": "Crédito inicial",
        "data_movimentacao": "2025-01-15 10:30:00",
        "funcionario_nome": "Admin Teste",
        "numero_venda": null
      }
    ],
    "meta": {
      "page": 1,
      "perPage": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

## Códigos de Erro Comuns

- **400 - Bad Request**: `INVALID_RA` - RA inválido ou ausente
- **401 - Unauthorized**: Token de acesso inválido ou ausente
- **403 - Forbidden**: Usuário sem permissão para a operação
- **404 - Not Found**: `NOT_FOUND` - Aluno não encontrado
- **422 - Unprocessable Entity**: Dados de entrada inválidos
- **500 - Internal Server Error**: `SERVER_ERROR` - Erro interno do servidor

## Regras de Negócio

1. **Contas de Alunos**: São criadas automaticamente quando necessário
2. **Créditos**: Apenas administradores e atendentes podem adicionar
3. **Histórico**: Todas as movimentações são registradas com timestamp e responsável
4. **Paginação**: Máximo de 100 itens por página
5. **Filtros**: Busca por nome ou RA ignora maiúsculas/minúsculas
6. **Status**: Apenas alunos com status 'MAT' (matriculados) são retornados por padrão

## Exemplos de Uso

### Buscar aluno por nome
```bash
GET /api/alunos?q=João
```

### Listar alunos da turma 6A
```bash
GET /api/alunos?turma=6A&page=1&perPage=20
```

### Adicionar R$ 25,00 na conta do aluno
```bash
POST /api/alunos/2021001/credito
Content-Type: application/json

{
  "valor": 25.00,
  "motivo": "Recarga do responsável"
}
```