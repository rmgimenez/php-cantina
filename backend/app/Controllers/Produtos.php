<?php

namespace App\Controllers;

use App\Models\ProdutoModel;
use CodeIgniter\HTTP\ResponseInterface;

/**
 * Controller para gerenciamento dos produtos
 */
class Produtos extends BaseApiController
{
    protected $model;

    public function __construct()
    {
        $this->model = new ProdutoModel();
    }

    /**
     * Lista todos os produtos com paginação e filtros
     *
     * @return ResponseInterface
     */
    public function index(): ResponseInterface
    {
        try {
            $perPage = (int) ($this->getParam('perPage', 20));
            $page = (int) ($this->getParam('page', 1));

            $filtros = [
                'q' => $this->getParam('q'),
                'tipo_produto_id' => $this->getParam('tipo_produto_id'),
                'ativo' => $this->getParam('ativo')
            ];

            // Remove filtros vazios
            $filtros = array_filter($filtros, function ($value) {
                return $value !== null && $value !== '';
            });

            $resultado = $this->model->buscarPaginado($filtros, $perPage, $page);

            return $this->respondSuccess([
                'produtos' => $resultado['produtos'],
                'pagination' => [
                    'page' => $resultado['page'],
                    'perPage' => $resultado['perPage'],
                    'total' => $resultado['total'],
                    'totalPages' => $resultado['totalPages']
                ]
            ], 'Produtos listados com sucesso');
        } catch (\Exception $e) {
            log_message('error', 'Erro ao listar produtos: ' . $e->getMessage());
            return $this->respondError('Erro interno do servidor');
        }
    }

    /**
     * Busca um produto específico
     *
     * @param int $id
     * @return ResponseInterface
     */
    public function show($id = null): ResponseInterface
    {
        try {
            if (!$id || !is_numeric($id)) {
                return $this->respondError('ID do produto é obrigatório e deve ser numérico', 400);
            }

            $produto = $this->model->findComTipo((int) $id);

            if (!$produto) {
                return $this->respondNotFound('Produto não encontrado');
            }

            return $this->respondSuccess($produto, 'Produto encontrado com sucesso');
        } catch (\Exception $e) {
            log_message('error', 'Erro ao buscar produto: ' . $e->getMessage());
            return $this->respondError('Erro interno do servidor');
        }
    }

    /**
     * Cria um novo produto
     *
     * @return ResponseInterface
     */
    public function create(): ResponseInterface
    {
        try {
            $data = $this->getRequestData();

            // Validação
            $rules = [
                'nome' => 'required|min_length[2]|max_length[255]',
                'tipo_produto_id' => 'required|numeric|is_not_unique[cant_tipos_produtos.id]',
                'preco' => 'required|numeric|greater_than_equal_to[0]',
                'estoque_atual' => 'permit_empty|integer|greater_than_equal_to[0]',
                'estoque_minimo' => 'permit_empty|integer|greater_than_equal_to[0]',
                'codigo_barras' => 'permit_empty|max_length[50]|is_unique[cant_produtos.codigo_barras]',
                'descricao' => 'permit_empty|max_length[1000]',
                'ativo' => 'permit_empty|in_list[0,1]'
            ];

            if (!$this->validateInput($rules, $data)) {
                return $this->respondValidationError($this->getValidationErrors());
            }

            // Define valores padrão
            if (!isset($data['ativo'])) {
                $data['ativo'] = '1';
            }
            if (!isset($data['estoque_atual'])) {
                $data['estoque_atual'] = 0;
            }
            if (!isset($data['estoque_minimo'])) {
                $data['estoque_minimo'] = 0;
            }

            // Filtra o array $data para conter apenas as chaves permitidas pelo modelo
            $allowedFields = $this->model->allowedFields;
            $filteredData = array_intersect_key($data, array_flip($allowedFields));

            // Garantir tipos de dados corretos
            $filteredData['tipo_produto_id'] = (int)$filteredData['tipo_produto_id'];
            $filteredData['preco'] = (float)$filteredData['preco'];
            $filteredData['estoque_atual'] = (int)$filteredData['estoque_atual'];
            $filteredData['estoque_minimo'] = (int)$filteredData['estoque_minimo'];
            $filteredData['ativo'] = (string)$filteredData['ativo']; // Convertendo para string

            // Normalizar chaves numéricas (evita passar índices inteiros ao Query Builder)
            $normalizedForInsert = [];
            $allowedFields = $this->model->allowedFields;
            foreach ($filteredData as $k => $v) {
                if (is_int($k) || (is_string($k) && ctype_digit($k))) {
                    $idx = (int)$k;
                    if (isset($allowedFields[$idx])) {
                        $normalizedForInsert[$allowedFields[$idx]] = $v;
                        continue;
                    }
                }
                $normalizedForInsert[$k] = $v;
            }

            $produtoId = $this->model->insert($normalizedForInsert);

            if (!$produtoId) {
                return $this->respondError('Erro ao criar produto', 500, $this->model->errors());
            }

            $produtoCriado = $this->model->findComTipo($produtoId);

            return $this->respondSuccess($produtoCriado, 'Produto criado com sucesso', 201);
        } catch (\Exception $e) {
            log_message('error', 'Erro ao criar produto: ' . $e->getMessage());
            return $this->respondError('Erro interno do servidor');
        }
    }

    /**
     * Atualiza um produto existente
     *
     * @param int $id
     * @return ResponseInterface
     */
    public function update($id = null): ResponseInterface
    {
        try {
            if (!$id || !is_numeric($id)) {
                return $this->respondError('ID do produto é obrigatório e deve ser numérico', 400);
            }

            $produtoExistente = $this->model->find((int) $id);
            if (!$produtoExistente) {
                return $this->respondNotFound('Produto não encontrado');
            }

            $data = $this->getRequestData();

            // Validação
            $rules = [
                'nome' => 'required|min_length[2]|max_length[255]',
                'tipo_produto_id' => 'required|numeric|is_not_unique[cant_tipos_produtos.id]',
                'preco' => 'required|numeric|greater_than_equal_to[0]',
                'estoque_atual' => 'permit_empty|integer|greater_than_equal_to[0]',
                'estoque_minimo' => 'permit_empty|integer|greater_than_equal_to[0]',
                'codigo_barras' => "permit_empty|max_length[50]|is_unique[cant_produtos.codigo_barras,id,$id]",
                'descricao' => 'permit_empty|max_length[1000]',
                'ativo' => 'permit_empty|in_list[0,1]'
            ];

            if (!$this->validateInput($rules, $data)) {
                return $this->respondValidationError($this->getValidationErrors());
            }

            // Garantir tipos de dados corretos
            if (isset($data['tipo_produto_id'])) {
                $data['tipo_produto_id'] = (int)$data['tipo_produto_id'];
            }
            if (isset($data['preco'])) {
                $data['preco'] = (float)$data['preco'];
            }
            if (isset($data['estoque_atual'])) {
                $data['estoque_atual'] = (int)$data['estoque_atual'];
            }
            if (isset($data['estoque_minimo'])) {
                $data['estoque_minimo'] = (int)$data['estoque_minimo'];
            }
            if (isset($data['ativo'])) {
                $data['ativo'] = (string)$data['ativo']; // Convertendo para string
            }

            // Normalizar chaves numéricas antes do update (mesma razão que no create)
            $normalizedForUpdate = [];
            $allowedFields = $this->model->allowedFields;
            foreach ($data as $k => $v) {
                if (is_int($k) || (is_string($k) && ctype_digit($k))) {
                    $idx = (int)$k;
                    if (isset($allowedFields[$idx])) {
                        $normalizedForUpdate[$allowedFields[$idx]] = $v;
                        continue;
                    }
                }
                $normalizedForUpdate[$k] = $v;
            }

            $success = $this->model->update($id, $normalizedForUpdate);

            if (!$success) {
                return $this->respondError('Erro ao atualizar produto', 500, $this->model->errors());
            }

            $produtoAtualizado = $this->model->findComTipo((int) $id);

            return $this->respondSuccess($produtoAtualizado, 'Produto atualizado com sucesso');
        } catch (\Exception $e) {
            log_message('error', 'Erro ao atualizar produto: ' . $e->getMessage());
            return $this->respondError('Erro interno do servidor');
        }
    }

    /**
     * Remove um produto (soft delete)
     *
     * @param int $id
     * @return ResponseInterface
     */
    public function delete($id = null): ResponseInterface
    {
        try {
            if (!$id || !is_numeric($id)) {
                return $this->respondError('ID do produto é obrigatório e deve ser numérico', 400);
            }

            $produto = $this->model->find((int) $id);
            if (!$produto) {
                return $this->respondNotFound('Produto não encontrado');
            }

            // Soft delete - apenas desativa o produto
            $success = $this->model->desativar((int) $id);

            if (!$success) {
                return $this->respondError('Erro ao excluir produto', 500);
            }

            return $this->respondSuccess(null, 'Produto excluído com sucesso');
        } catch (\RuntimeException $e) {
            return $this->respondError($e->getMessage(), 422);
        } catch (\Exception $e) {
            log_message('error', 'Erro ao excluir produto: ' . $e->getMessage());
            return $this->respondError('Erro interno do servidor');
        }
    }

    /**
     * Lista produtos com estoque baixo
     *
     * @return ResponseInterface
     */
    public function estoqueBaixo(): ResponseInterface
    {
        try {
            $produtos = $this->model->findEstoqueBaixo();

            return $this->respondSuccess([
                'produtos' => $produtos,
                'total' => count($produtos)
            ], 'Produtos com estoque baixo listados com sucesso');
        } catch (\Exception $e) {
            log_message('error', 'Erro ao listar produtos com estoque baixo: ' . $e->getMessage());
            return $this->respondError('Erro interno do servidor');
        }
    }

    /**
     * Ativa um produto
     *
     * @param int $id
     * @return ResponseInterface
     */
    public function ativar($id = null): ResponseInterface
    {
        try {
            if (!$id || !is_numeric($id)) {
                return $this->respondError('ID do produto é obrigatório e deve ser numérico', 400);
            }

            $produto = $this->model->find((int) $id);
            if (!$produto) {
                return $this->respondNotFound('Produto não encontrado');
            }

            $success = $this->model->ativar((int) $id);

            if (!$success) {
                return $this->respondError('Erro ao ativar produto', 500);
            }

            $produtoAtualizado = $this->model->findComTipo((int) $id);

            return $this->respondSuccess($produtoAtualizado, 'Produto ativado com sucesso');
        } catch (\Exception $e) {
            log_message('error', 'Erro ao ativar produto: ' . $e->getMessage());
            return $this->respondError('Erro interno do servidor');
        }
    }

    /**
     * Desativa um produto
     *
     * @param int $id
     * @return ResponseInterface
     */
    public function desativar($id = null): ResponseInterface
    {
        try {
            if (!$id || !is_numeric($id)) {
                return $this->respondError('ID do produto é obrigatório e deve ser numérico', 400);
            }

            $produto = $this->model->find((int) $id);
            if (!$produto) {
                return $this->respondNotFound('Produto não encontrado');
            }

            $success = $this->model->desativar((int) $id);

            if (!$success) {
                return $this->respondError('Erro ao desativar produto', 500);
            }

            $produtoAtualizado = $this->model->findComTipo((int) $id);

            return $this->respondSuccess($produtoAtualizado, 'Produto desativado com sucesso');
        } catch (\Exception $e) {
            log_message('error', 'Erro ao desativar produto: ' . $e->getMessage());
            return $this->respondError('Erro interno do servidor');
        }
    }
}
