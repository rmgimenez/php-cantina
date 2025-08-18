<?php

namespace App\Controllers;

use App\Models\TipoProdutoModel;

/**
 * Controller para gerenciamento de tipos de produtos
 */
class TiposProdutos extends BaseApiController
{
    protected $modelName = TipoProdutoModel::class;
    protected $format = 'json';

    /**
     * Lista todos os tipos de produtos
     */
    public function index()
    {
        try {
            $tipoProdutoModel = new TipoProdutoModel();
            
            $filtros = [];
            
            // Filtros opcionais
            if ($this->request->getGet('nome')) {
                $filtros['nome'] = $this->request->getGet('nome');
            }
            
            if ($this->request->getGet('ativo') !== null) {
                $filtros['ativo'] = (int) $this->request->getGet('ativo');
            }

            $tipos = $tipoProdutoModel->buscarComFiltros($filtros);

            return $this->respond([
                'status' => 'success',
                'message' => 'Tipos de produtos listados com sucesso',
                'data' => $tipos
            ]);

        } catch (\Exception $e) {
            return $this->fail('Erro interno do servidor: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Busca tipo de produto por ID
     */
    public function show($id = null)
    {
        try {
            if (!$id || !is_numeric($id)) {
                return $this->failValidationError('ID inválido');
            }

            $tipoProdutoModel = new TipoProdutoModel();
            $tipo = $tipoProdutoModel->find($id);

            if (!$tipo) {
                return $this->failNotFound('Tipo de produto não encontrado');
            }

            return $this->respond([
                'status' => 'success',
                'message' => 'Tipo de produto encontrado',
                'data' => $tipo
            ]);

        } catch (\Exception $e) {
            return $this->fail('Erro interno do servidor: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Cria novo tipo de produto
     */
    public function create()
    {
        try {
            $tipoProdutoModel = new TipoProdutoModel();
            
            $dados = $this->request->getJSON(true);
            
            if (!$dados) {
                return $this->failValidationError('Dados inválidos ou ausentes');
            }

            // Define valores padrão
            $dados['ativo'] = $dados['ativo'] ?? 1;

            if (!$tipoProdutoModel->insert($dados)) {
                $errors = $tipoProdutoModel->errors();
                return $this->failValidationErrors($errors);
            }

            $id = $tipoProdutoModel->getInsertID();
            $novoTipo = $tipoProdutoModel->find($id);

            return $this->respondCreated([
                'status' => 'success',
                'message' => 'Tipo de produto criado com sucesso',
                'data' => $novoTipo
            ]);

        } catch (\Exception $e) {
            return $this->fail('Erro interno do servidor: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Atualiza tipo de produto
     */
    public function update($id = null)
    {
        try {
            if (!$id || !is_numeric($id)) {
                return $this->failValidationError('ID inválido');
            }

            $tipoProdutoModel = new TipoProdutoModel();
            
            $tipoExistente = $tipoProdutoModel->find($id);
            if (!$tipoExistente) {
                return $this->failNotFound('Tipo de produto não encontrado');
            }

            $dados = $this->request->getJSON(true);
            
            if (!$dados) {
                return $this->failValidationError('Dados inválidos ou ausentes');
            }

            if (!$tipoProdutoModel->update($id, $dados)) {
                $errors = $tipoProdutoModel->errors();
                return $this->failValidationErrors($errors);
            }

            $tipoAtualizado = $tipoProdutoModel->find($id);

            return $this->respond([
                'status' => 'success',
                'message' => 'Tipo de produto atualizado com sucesso',
                'data' => $tipoAtualizado
            ]);

        } catch (\Exception $e) {
            return $this->fail('Erro interno do servidor: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Remove tipo de produto (desativa)
     */
    public function delete($id = null)
    {
        try {
            if (!$id || !is_numeric($id)) {
                return $this->failValidationError('ID inválido');
            }

            $tipoProdutoModel = new TipoProdutoModel();
            
            $tipo = $tipoProdutoModel->find($id);
            if (!$tipo) {
                return $this->failNotFound('Tipo de produto não encontrado');
            }

            // Verifica se pode ser excluído (não tem produtos associados)
            if (!$tipoProdutoModel->podeExcluir($id)) {
                return $this->failValidationError('Não é possível excluir este tipo pois existem produtos associados');
            }

            if (!$tipoProdutoModel->desativar($id)) {
                return $this->fail('Erro ao desativar tipo de produto');
            }

            return $this->respondDeleted([
                'status' => 'success',
                'message' => 'Tipo de produto removido com sucesso'
            ]);

        } catch (\Exception $e) {
            return $this->fail('Erro interno do servidor: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Ativa tipo de produto
     */
    public function ativar($id = null)
    {
        try {
            if (!$id || !is_numeric($id)) {
                return $this->failValidationError('ID inválido');
            }

            $tipoProdutoModel = new TipoProdutoModel();
            
            $tipo = $tipoProdutoModel->find($id);
            if (!$tipo) {
                return $this->failNotFound('Tipo de produto não encontrado');
            }

            if (!$tipoProdutoModel->ativar($id)) {
                return $this->fail('Erro ao ativar tipo de produto');
            }

            $tipoAtualizado = $tipoProdutoModel->find($id);

            return $this->respond([
                'status' => 'success',
                'message' => 'Tipo de produto ativado com sucesso',
                'data' => $tipoAtualizado
            ]);

        } catch (\Exception $e) {
            return $this->fail('Erro interno do servidor: ' . $e->getMessage(), 500);
        }
    }
}