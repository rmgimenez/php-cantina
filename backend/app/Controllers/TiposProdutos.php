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

            $filtros = [
                'nome' => $this->getParam('q'), // 'q' conforme especificação da issue
                'ativo' => $this->getParam('ativo')
            ];

            // Remove filtros vazios

            $filtros = array_filter($filtros, function ($value) {
                return $value !== null && $value !== '';
            });
            // Garante que as chaves associativas sejam mantidas
            $filtros = array_intersect_key($filtros, ['nome' => '', 'ativo' => '']);

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

            // Espera um array associativo; caso receba um array indexado (ex: ["Nome", "Desc", 1])
            // converte para associativo usando a ordem esperada dos campos.
            if (!is_array($data)) {
                log_message('error', 'Payload inválido ao criar tipo de produto: esperado objeto associativo');
                return $this->respondError('Payload inválido', 400);
            }

            if (array_values($data) === $data) {
                // Campos esperados na ordem quando payload vier como array indexado
                $expected = ['nome', 'descricao', 'ativo'];
                $assoc = [];
                foreach ($data as $i => $value) {
                    if (isset($expected[$i])) {
                        $assoc[$expected[$i]] = $value;
                    }
                }
                $data = $assoc;
            }

            // Validação
            $rules = [
                'nome' => 'required|min_length[2]|max_length[100]|is_unique[cant_tipos_produtos.nome]',
                'descricao' => 'permit_empty|max_length[1000]',
                'ativo' => 'permit_empty|in_list[0,1]'
            ];

            if (!$this->validateInput($rules, $data)) {
                return $this->respondValidationError($this->getValidationErrors());
            }

            // Define valor padrão para ativo se não informado
            if (!isset($data['ativo'])) {
                $data['ativo'] = 1;
            }

            // Log para depuração: inspeciona payload antes do insert
            try {
                log_message('debug', 'TiposProdutos::create payload keys: ' . implode(', ', array_keys((array)$data)));
                log_message('debug', 'TiposProdutos::create payload: ' . json_encode($data));
            } catch (\Throwable $t) {
                // não bloquear execução em caso de erro no log
                log_message('error', 'Erro ao logar payload: ' . $t->getMessage());
            }

            $id = $this->model->insert($data);

            if (!$id) {
                return $this->respondError('Erro ao criar tipo de produto', 500, $this->model->errors());
            }

            $tipoProduto = $this->model->find($id);

            // Formatar response conforme especificação da issue
            $response = [
                'id' => (int)$tipoProduto['id'],
                'nome' => $tipoProduto['nome'],
                'descricao' => $tipoProduto['descricao'],
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

            // Aceita também payloads indexados (ex: de clientes/testes) e converte para associativo
            if (!is_array($data)) {
                log_message('error', 'Payload inválido ao atualizar tipo de produto: esperado objeto associativo');
                return $this->respondError('Payload inválido', 400);
            }

            if (array_values($data) === $data) {
                $expected = ['nome', 'descricao', 'ativo'];
                $assoc = [];
                foreach ($data as $i => $value) {
                    if (isset($expected[$i])) {
                        $assoc[$expected[$i]] = $value;
                    }
                }
                $data = $assoc;
            }

            // Validação
            $rules = [
                'nome' => "required|min_length[2]|max_length[100]|is_unique[cant_tipos_produtos.nome,id,$id]",
                'descricao' => 'permit_empty|max_length[1000]',
                'ativo' => 'permit_empty|in_list[0,1]'
            ];

            if (!$this->validateInput($rules, $data)) {
                return $this->respondValidationError($this->getValidationErrors());
            }

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
