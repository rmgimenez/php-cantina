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

            // Normaliza primeiro para suportar payloads indexados
            $data = $this->normalizePayload($data, $this->model->allowedFields);

            // Validação básica do payload
            if (!is_array($data) || empty($data)) {
                log_message('error', 'Payload inválido ao criar tipo de produto: esperado objeto associativo');
                return $this->respondError('Payload inválido', 400);
            }

            // Regras de validação
            $rules = [
                'nome' => "required|min_length[2]|max_length[100]|is_unique[cant_tipos_produtos.nome]",
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

            // Filtra o array $data para conter apenas as chaves permitidas pelo modelo
            $allowedFields = $this->model->allowedFields;
            $filteredData = array_intersect_key($data, array_flip($allowedFields));

            // Se o payload veio indexado ou "embalado" (ex: { data: [...] } ou [[...]])
            // normalizePayload já tenta lidar com arrays indexados, mas quando o corpo
            // está embalado dentro de outra chave (ex: { "data": [...] }) ou quando
            // array_intersect_key retornou vazio, devemos tentar extrair e normalizar
            // explicitamente para evitar passar chaves numéricas ao Model.
            if (empty($filteredData) && is_array($data)) {
                // Caso 1: payload estilo [[...]] (array com primeiro elemento sendo o array indexado)
                if (isset($data[0]) && is_array($data[0]) && array_values($data) === $data) {
                    $data = $data[0];
                }

                // Caso 2: payload embalado em uma chave comum como 'data'
                if (isset($data['data']) && is_array($data['data']) && array_values($data['data']) === $data['data']) {
                    $data = $data['data'];
                }

                // Normaliza indexados para associativo com base em allowedFields
                $data = $this->normalizePayload($data, $allowedFields);
                $filteredData = array_intersect_key($data, array_flip($allowedFields));
            }

            // Garantir tipos de dados corretos
            if (isset($filteredData['ativo'])) {
                $filteredData['ativo'] = (string)$filteredData['ativo'];
            }

            // Log para diagnóstico: registrar se houver chaves não-associativas
            foreach (array_keys($filteredData) as $k) {
                if (is_int($k)) {
                    log_message('error', 'TiposProdutos::create - payload com chave numérica detectada: ' . json_encode($filteredData));
                    break;
                }
            }

            // Normalizar chaves numéricas para nomes de campos (evita passar índices inteiros ao Query Builder)
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

            $insertId = $this->model->insert($normalizedForInsert);

            if (!$insertId) {
                return $this->respondError('Erro ao criar tipo de produto', 500, $this->model->errors());
            }

            $tipoCriado = $this->model->find($insertId);

            return $this->respondSuccess($tipoCriado, 'Tipo de produto criado com sucesso', 201);
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

            // Normaliza primeiro para suportar payloads indexados
            $data = $this->normalizePayload($data, $this->model->allowedFields);

            // Validação básica do payload
            if (!is_array($data) || empty($data)) {
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

            // Normalizar chaves numéricas (por exemplo payload vindo como ["Nome","Desc",1])
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
        // Detecta se o payload é associativo válido (possui pelo menos uma chave string não numérica)
        $hasAssocStringKey = false;
        foreach (array_keys($payload) as $k) {
            if (is_string($k) && !ctype_digit($k)) {
                $hasAssocStringKey = true;
                break;
            }
        }

        // Se já é associativo com chaves string "não numéricas", retorna como está
        if ($hasAssocStringKey) {
            return $payload;
        }

        // Caso seja um array indexado (chaves inteiras ou strings numéricas), mapeia pela ordem dos campos permitidos
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
