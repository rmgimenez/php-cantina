<?php

namespace App\Controllers;

use App\Models\TipoProdutoModel;
use CodeIgniter\HTTP\ResponseInterface;

/**
 * Controller para gerenciamento dos tipos de produtos
 */
class TiposProdutos extends BaseApiController
{
    protected $model;

    public function __construct()
    {
        $this->model = new TipoProdutoModel();
    }

    /**
     * Lista todos os tipos de produtos
     *
     * @return ResponseInterface
     */
    public function index(): ResponseInterface
    {
        try {
            // Parâmetros de paginação
            $page = max(1, (int)$this->getParam('page', 1));
            $perPage = min(100, max(1, (int)$this->getParam('perPage', 20)));

            $filtros = [];

            // Filtro por nome
            $nome = $this->getParam('q');
            if ($nome !== null && $nome !== '') {
                $filtros['nome'] = $nome;
            }

            // Filtro por ativo
            $ativo = $this->getParam('ativo');
            if ($ativo !== null && $ativo !== '') {
                $filtros['ativo'] = (int)$ativo;
            }

            $tiposProdutos = $this->model->buscarComFiltrosPaginado($filtros, $page, $perPage);
            $total = $this->model->contarComFiltros($filtros);

            return $this->respondSuccess([
                'data' => $tiposProdutos,
                'meta' => [
                    'page' => $page,
                    'perPage' => $perPage,
                    'total' => $total,
                    'totalPages' => ceil($total / $perPage)
                ]
            ], 'Lista de tipos de produtos obtida com sucesso');
        } catch (\Exception $e) {
            log_message('error', 'Erro ao listar tipos de produtos: ' . $e->getMessage());
            return $this->respondError('Erro interno do servidor');
        }
    }

    /**
     * Exibe um tipo de produto específico
     *
     * @param int $id
     * @return ResponseInterface
     */
    public function show($id = null): ResponseInterface
    {
        try {
            if (!$id || !is_numeric($id)) {
                return $this->respondError('ID inválido', 400);
            }

            $tipoProduto = $this->model->find($id);

            if (!$tipoProduto) {
                return $this->respondNotFound('Tipo de produto não encontrado');
            }

            return $this->respondSuccess($tipoProduto, 'Tipo de produto obtido com sucesso');
        } catch (\Exception $e) {
            log_message('error', 'Erro ao buscar tipo de produto: ' . $e->getMessage());
            return $this->respondError('Erro interno do servidor');
        }
    }

    /**
     * Cria um novo tipo de produto
     *
     * @return ResponseInterface
     */
    public function create(): ResponseInterface
    {
        try {
            // Verificação de autorização
            if (!$this->hasManagementPermission()) {
                return $this->respondForbidden('Acesso negado. Apenas usuários com permissão de gestão podem criar tipos de produtos.');
            }

            $data = $this->getRequestData();

            // Validação básica do payload
            if (!is_array($data)) {
                log_message('error', 'Payload inválido ao criar tipo de produto: esperado objeto associativo');
                return $this->respondError('Payload inválido', 400);
            }

            // Validação
            $rules = [
                'nome' => 'required|min_length[2]|max_length[100]|is_unique[cant_tipos_produtos.nome]',
                'descricao' => 'permit_empty|max_length[1000]',
                'ativo' => 'permit_empty|in_list[0,1,\'0\',\'1\']'
            ];

            if (!$this->validateInput($rules, $data)) {
                return $this->respondValidationError($this->getValidationErrors());
            }

            // Define valor padrão para ativo se não informado
            if (!isset($data['ativo'])) {
                $data['ativo'] = '1';
            }

            // Filtra o array $data para conter apenas as chaves permitidas pelo modelo
            $allowedFields = $this->model->allowedFields;
            $filteredData = array_intersect_key($data, array_flip($allowedFields));

            // Normaliza payloads que venham como arrays indexados (0,1,2...) para mapear
            // para chaves permitidas — evita passar chaves numéricas para o Query Builder
            $filteredData = $this->normalizePayload($filteredData, $allowedFields);

            // Log para depuração
            log_message('debug', 'TiposProdutos::create payload: ' . json_encode($filteredData));

            // Garantir que os tipos de dados estão corretos antes da inserção
            if (isset($filteredData['ativo'])) {
                $filteredData['ativo'] = (string)$filteredData['ativo']; // Garantir que seja string
            }

            $id = $this->model->insert($filteredData);

            if (!$id) {
                return $this->respondError('Erro ao criar tipo de produto', 500, $this->model->errors());
            }

            $tipoProduto = $this->model->find($id);

            if (!$tipoProduto) {
                return $this->respondError('Erro ao recuperar o tipo de produto criado', 500);
            }

            // Formatar response conforme especificação da issue
            $response = [
                'id' => (int)$tipoProduto['id'],
                'nome' => $tipoProduto['nome'],
                'descricao' => $tipoProduto['descricao'] ?? '',
                'ativo' => (bool)$tipoProduto['ativo'],
                'criado_em' => date('c', strtotime($tipoProduto['data_criacao'])) // ISO 8601
            ];

            return $this->respondSuccess($response, 'Tipo de produto criado com sucesso', 201);
        } catch (\Exception $e) {
            log_message('error', 'Erro ao criar tipo de produto: ' . $e->getMessage());
            return $this->respondError('Erro interno do servidor');
        }
    }

    /**
     * Atualiza um tipo de produto
     *
     * @param int $id
     * @return ResponseInterface
     */
    public function update($id = null): ResponseInterface
    {
        try {
            // Verificação de autorização
            if (!$this->hasManagementPermission()) {
                return $this->respondForbidden('Acesso negado. Apenas usuários com permissão de gestão podem atualizar tipos de produtos.');
            }

            if (!$id || !is_numeric($id)) {
                return $this->respondError('ID inválido', 400);
            }

            $tipoProduto = $this->model->find($id);
            if (!$tipoProduto) {
                return $this->respondNotFound('Tipo de produto não encontrado');
            }

            $data = $this->getRequestData();

            // Validação básica do payload
            if (!is_array($data)) {
                log_message('error', 'Payload inválido ao atualizar tipo de produto: esperado objeto associativo');
                return $this->respondError('Payload inválido', 400);
            }

            // Validação
            $rules = [
                'nome' => "required|min_length[2]|max_length[100]|is_unique[cant_tipos_produtos.nome,id,$id]",
                'descricao' => 'permit_empty|max_length[1000]',
                'ativo' => 'permit_empty|in_list[0,1,\'0\',\'1\']'
            ];

            if (!$this->validateInput($rules, $data)) {
                return $this->respondValidationError($this->getValidationErrors());
            }

            // Garantir que os tipos de dados estão corretos antes da atualização
            if (isset($data['ativo'])) {
                $data['ativo'] = (string)$data['ativo']; // Garantir que seja string
            }

            // Caso o cliente tenha enviado um array indexado, normalize para associativo
            $data = $this->normalizePayload($data, $this->model->allowedFields);

            $success = $this->model->update($id, $data);

            if (!$success) {
                return $this->respondError('Erro ao atualizar tipo de produto', 500, $this->model->errors());
            }

            $tipoProdutoAtualizado = $this->model->find($id);

            return $this->respondSuccess($tipoProdutoAtualizado, 'Tipo de produto atualizado com sucesso');
        } catch (\Exception $e) {
            log_message('error', 'Erro ao atualizar tipo de produto: ' . $e->getMessage());
            return $this->respondError('Erro interno do servidor');
        }
    }

    /**
     * Normaliza payloads que podem chegar como arrays indexados (0,1,2..)
     * Mapeia os valores na ordem dos campos permitidos para chaves associativas.
     * Ex: ["Nome", "Desc", 1] com allowedFields ["nome","descricao","ativo"]
     * vira ["nome"=>"Nome","descricao"=>"Desc","ativo"=>1]
     *
     * @param array $payload
     * @param array $allowedFields
     * @return array
     */
    private function normalizePayload(array $payload, array $allowedFields): array
    {
        // Se já é associativo com chaves de string, retorna como está
        foreach ($payload as $k => $v) {
            if (!is_int($k)) {
                return $payload;
            }
        }

        // Caso seja um array indexado, mapeia pela ordem dos campos permitidos
        $normalized = [];
        $i = 0;
        foreach ($allowedFields as $field) {
            if (array_key_exists($i, $payload)) {
                $normalized[$field] = $payload[$i];
            }
            $i++;
        }

        return $normalized;
    }

    /**
     * Exclui um tipo de produto (soft delete)
     *
     * @param int $id
     * @return ResponseInterface
     */
    public function delete($id = null): ResponseInterface
    {
        try {
            // Verificação de autorização
            if (!$this->hasManagementPermission()) {
                return $this->respondForbidden('Acesso negado. Apenas usuários com permissão de gestão podem excluir tipos de produtos.');
            }

            if (!$id || !is_numeric($id)) {
                return $this->respondError('ID inválido', 400);
            }

            $tipoProduto = $this->model->find($id);
            if (!$tipoProduto) {
                return $this->respondNotFound('Tipo de produto não encontrado');
            }

            // Verifica se pode ser deletado
            if (!$this->model->podeSerDeletado($id)) {
                return $this->respondError('Não é possível excluir este tipo de produto pois existem produtos associados a ele', 409);
            }

            // Soft delete - apenas desativa em vez de deletar fisicamente
            $success = $this->model->desativar($id);

            if (!$success) {
                return $this->respondError('Erro ao excluir tipo de produto');
            }

            return $this->respond(null, 204); // 204 No Content conforme especificação

        } catch (\RuntimeException $e) {
            return $this->respondError($e->getMessage(), 409);
        } catch (\Exception $e) {
            log_message('error', 'Erro ao excluir tipo de produto: ' . $e->getMessage());
            return $this->respondError('Erro interno do servidor');
        }
    }

    /**
     * Lista apenas tipos de produtos ativos
     *
     * @return ResponseInterface
     */
    public function ativos(): ResponseInterface
    {
        try {
            $tiposAtivos = $this->model->findAtivos();

            return $this->respondSuccess([
                'tipos_produtos' => $tiposAtivos,
                'total' => count($tiposAtivos)
            ], 'Lista de tipos ativos obtida com sucesso');
        } catch (\Exception $e) {
            log_message('error', 'Erro ao listar tipos ativos: ' . $e->getMessage());
            return $this->respondError('Erro interno do servidor');
        }
    }

    /**
     * Ativa um tipo de produto
     *
     * @param int $id
     * @return ResponseInterface
     */
    public function ativar($id = null): ResponseInterface
    {
        try {
            if (!$id || !is_numeric($id)) {
                return $this->respondError('ID inválido', 400);
            }

            $tipoProduto = $this->model->find($id);
            if (!$tipoProduto) {
                return $this->respondNotFound('Tipo de produto não encontrado');
            }

            $success = $this->model->ativar($id);

            if (!$success) {
                return $this->respondError('Erro ao ativar tipo de produto');
            }

            $tipoProdutoAtualizado = $this->model->find($id);

            return $this->respondSuccess($tipoProdutoAtualizado, 'Tipo de produto ativado com sucesso');
        } catch (\Exception $e) {
            log_message('error', 'Erro ao ativar tipo de produto: ' . $e->getMessage());
            return $this->respondError('Erro interno do servidor');
        }
    }

    /**
     * Desativa um tipo de produto
     *
     * @param int $id
     * @return ResponseInterface
     */
    public function desativar($id = null): ResponseInterface
    {
        try {
            if (!$id || !is_numeric($id)) {
                return $this->respondError('ID inválido', 400);
            }

            $tipoProduto = $this->model->find($id);
            if (!$tipoProduto) {
                return $this->respondNotFound('Tipo de produto não encontrado');
            }

            $success = $this->model->desativar($id);

            if (!$success) {
                return $this->respondError('Erro ao desativar tipo de produto');
            }

            $tipoProdutoAtualizado = $this->model->find($id);

            return $this->respondSuccess($tipoProdutoAtualizado, 'Tipo de produto desativado com sucesso');
        } catch (\Exception $e) {
            log_message('error', 'Erro ao desativar tipo de produto: ' . $e->getMessage());
            return $this->respondError('Erro interno do servidor');
        }
    }
}
