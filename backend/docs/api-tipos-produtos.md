# API Documentation - Tipos de Produtos

## Autenticação

Todos os endpoints requerem autenticação JWT via header `Authorization: Bearer {token}`.

Endpoints de criação, atualização e exclusão requerem permissões de gestão (`administrador` ou `estoquista`).

## Endpoints

### Listar Tipos de Produtos

```http
GET /api/tipos-produtos
```

**Parâmetros de Query:**
- `page` (int, opcional): Página (default: 1)
- `perPage` (int, opcional): Registros por página (default: 20, max: 100)
- `q` (string, opcional): Filtrar por nome
- `ativo` (int, opcional): Filtrar por status (0=inativo, 1=ativo)

**Resposta (200):**
```json
{
  "success": true,
  "message": "Lista de tipos de produtos obtida com sucesso",
  "data": {
    "data": [
      {
        "id": 1,
        "nome": "Bebidas",
        "descricao": "Sucos e refrigerantes",
        "ativo": 1,
        "data_criacao": "2025-08-18T00:00:00Z"
      }
    ],
    "meta": {
      "page": 1,
      "perPage": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

### Buscar Tipo de Produto por ID

```http
GET /api/tipos-produtos/{id}
```

**Resposta (200):**
```json
{
  "success": true,
  "message": "Tipo de produto obtido com sucesso",
  "data": {
    "id": 1,
    "nome": "Bebidas",
    "descricao": "Sucos e refrigerantes",
    "ativo": 1,
    "data_criacao": "2025-08-18T00:00:00Z"
  }
}
```

**Erros:**
- `404`: Tipo de produto não encontrado

### Criar Tipo de Produto

```http
POST /api/tipos-produtos
```

**Requisitos:** Permissão de gestão

**Body:**
```json
{
  "nome": "Bebidas",
  "descricao": "Sucos e refrigerantes"
}
```

**Resposta (201):**
```json
{
  "success": true,
  "message": "Tipo de produto criado com sucesso",
  "data": {
    "id": 1,
    "nome": "Bebidas",
    "descricao": "Sucos e refrigerantes",
    "ativo": true,
    "criado_em": "2025-08-18T00:00:00Z"
  }
}
```

**Erros:**
- `403`: Sem permissão de gestão
- `422`: Dados inválidos (nome obrigatório, único)

### Atualizar Tipo de Produto

```http
PUT /api/tipos-produtos/{id}
```

**Requisitos:** Permissão de gestão

**Body:**
```json
{
  "nome": "Bebidas Frias",
  "descricao": "Refrigerantes e sucos gelados"
}
```

**Resposta (200):**
```json
{
  "success": true,
  "message": "Tipo de produto atualizado com sucesso",
  "data": {
    "id": 1,
    "nome": "Bebidas Frias",
    "descricao": "Refrigerantes e sucos gelados",
    "ativo": 1,
    "data_criacao": "2025-08-18T00:00:00Z"
  }
}
```

**Erros:**
- `403`: Sem permissão de gestão
- `404`: Tipo de produto não encontrado
- `422`: Dados inválidos

### Excluir Tipo de Produto (Soft Delete)

```http
DELETE /api/tipos-produtos/{id}
```

**Requisitos:** Permissão de gestão

**Resposta (204):** Sem conteúdo

**Erros:**
- `403`: Sem permissão de gestão
- `404`: Tipo de produto não encontrado
- `409`: Não pode ser excluído (existem produtos usando este tipo)

### Endpoints Auxiliares

#### Listar Apenas Tipos Ativos

```http
GET /api/tipos-produtos/ativos
```

#### Ativar Tipo de Produto

```http
PUT /api/tipos-produtos/{id}/ativar
```

#### Desativar Tipo de Produto

```http
PUT /api/tipos-produtos/{id}/desativar
```

## Códigos de Erro

- `400`: Dados inválidos (ID inválido)
- `401`: Não autenticado (token ausente/inválido)
- `403`: Sem permissão (apenas gestores podem criar/editar/excluir)
- `404`: Recurso não encontrado
- `409`: Conflito (nome duplicado ou dependências existem)
- `422`: Erro de validação
- `500`: Erro interno do servidor

## Regras de Validação

### Nome
- Obrigatório
- Mínimo 2 caracteres
- Máximo 100 caracteres
- Deve ser único

### Descrição
- Opcional
- Máximo 1000 caracteres

### Ativo
- Opcional (padrão: 1)
- Valores: 0 (inativo) ou 1 (ativo)

## Exemplos de Uso

### Criar um tipo com cURL

```bash
curl -X POST "http://localhost:8080/api/tipos-produtos" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Doces",
    "descricao": "Brigadeiros, bolos e tortas"
  }'
```

### Listar com filtros e paginação

```bash
curl -X GET "http://localhost:8080/api/tipos-produtos?q=Bebidas&ativo=1&page=1&perPage=10" \
  -H "Authorization: Bearer {token}"
```

### Atualizar um tipo

```bash
curl -X PUT "http://localhost:8080/api/tipos-produtos/1" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Bebidas Geladas"
  }'
```

### Excluir um tipo

```bash
curl -X DELETE "http://localhost:8080/api/tipos-produtos/1" \
  -H "Authorization: Bearer {token}"
```