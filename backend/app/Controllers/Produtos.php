<?php

namespace App\Controllers;

use App\Models\ProdutoModel;
use App\Models\TipoProdutoModel;

/**
 * Controller para gerenciamento de produtos
 */
class Produtos extends BaseApiController
{
    protected $modelName = ProdutoModel::class;
    protected $format = 'json';

    /**
     * Lista todos os produtos
     */
    public function index()
    {
        try {
            $produtoModel = new ProdutoModel();
            
            $filtros = [];
            
            // Filtros opcionais
            if ($this->request->getGet('nome')) {
                $filtros['nome'] = $this->request->getGet('nome');
            }
            
            if ($this->request->getGet('tipo_produto_id')) {
                $filtros['tipo_produto_id'] = (int) $this->request->getGet('tipo_produto_id');
            }
            
            if ($this->request->getGet('codigo_barras')) {
                $filtros['codigo_barras'] = $this->request->getGet('codigo_barras');
            }
            
            if ($this->request->getGet('ativo') !== null) {
                $filtros['ativo'] = (int) $this->request->getGet('ativo');
            }

            $produtos = $produtoModel->listarComTipo($filtros);

            return $this->respond([
                'status' => 'success',
                'message' => 'Produtos listados com sucesso',
                'data' => $produtos
            ]);

        } catch (\Exception $e) {
            return $this->fail('Erro interno do servidor: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Busca produto por ID
     */
    public function show($id = null)
    {
        try {
            if (!$id || !is_numeric($id)) {
                return $this->failValidationError('ID inválido');
            }

            $produtoModel = new ProdutoModel();
            $produtos = $produtoModel->listarComTipo(['ativo' => null]);
            $produto = null;

            foreach ($produtos as $p) {
                if ($p['id'] == $id) {
                    $produto = $p;
                    break;
                }
            }

            if (!$produto) {
                return $this->failNotFound('Produto não encontrado');
            }

            return $this->respond([
                'status' => 'success',
                'message' => 'Produto encontrado',
                'data' => $produto
            ]);

        } catch (\Exception $e) {
            return $this->fail('Erro interno do servidor: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Cria novo produto
     */
    public function create()
    {
        try {
            $produtoModel = new ProdutoModel();
            $tipoProdutoModel = new TipoProdutoModel();
            
            $dados = $this->request->getJSON(true);
            
            if (!$dados) {
                return $this->failValidationError('Dados inválidos ou ausentes');
            }

            // Verifica se o tipo de produto existe e está ativo
            if (isset($dados['tipo_produto_id'])) {
                $tipo = $tipoProdutoModel->find($dados['tipo_produto_id']);
                if (!$tipo || $tipo['ativo'] == 0) {
                    return $this->failValidationError('Tipo de produto inválido ou inativo');
                }
            }

            // Define valores padrão
            $dados['ativo'] = $dados['ativo'] ?? 1;
            $dados['estoque_atual'] = $dados['estoque_atual'] ?? 0;
            $dados['estoque_minimo'] = $dados['estoque_minimo'] ?? 0;

            // Converte preço para formato correto
            if (isset($dados['preco'])) {
                $dados['preco'] = number_format((float) $dados['preco'], 2, '.', '');
            }

            if (!$produtoModel->insert($dados)) {
                $errors = $produtoModel->errors();
                return $this->failValidationErrors($errors);
            }

            $id = $produtoModel->getInsertID();
            $produtos = $produtoModel->listarComTipo(['ativo' => null]);
            $novoProduto = null;

            foreach ($produtos as $p) {
                if ($p['id'] == $id) {
                    $novoProduto = $p;
                    break;
                }
            }

            return $this->respondCreated([
                'status' => 'success',
                'message' => 'Produto criado com sucesso',
                'data' => $novoProduto
            ]);

        } catch (\Exception $e) {
            return $this->fail('Erro interno do servidor: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Atualiza produto
     */
    public function update($id = null)
    {
        try {
            if (!$id || !is_numeric($id)) {
                return $this->failValidationError('ID inválido');
            }

            $produtoModel = new ProdutoModel();
            $tipoProdutoModel = new TipoProdutoModel();
            
            $produtoExistente = $produtoModel->find($id);
            if (!$produtoExistente) {
                return $this->failNotFound('Produto não encontrado');
            }

            $dados = $this->request->getJSON(true);
            
            if (!$dados) {
                return $this->failValidationError('Dados inválidos ou ausentes');
            }

            // Verifica se o tipo de produto existe e está ativo
            if (isset($dados['tipo_produto_id'])) {
                $tipo = $tipoProdutoModel->find($dados['tipo_produto_id']);
                if (!$tipo || $tipo['ativo'] == 0) {
                    return $this->failValidationError('Tipo de produto inválido ou inativo');
                }
            }

            // Converte preço para formato correto
            if (isset($dados['preco'])) {
                $dados['preco'] = number_format((float) $dados['preco'], 2, '.', '');
            }

            if (!$produtoModel->update($id, $dados)) {
                $errors = $produtoModel->errors();
                return $this->failValidationErrors($errors);
            }

            $produtos = $produtoModel->listarComTipo(['ativo' => null]);
            $produtoAtualizado = null;

            foreach ($produtos as $p) {
                if ($p['id'] == $id) {
                    $produtoAtualizado = $p;
                    break;
                }
            }

            return $this->respond([
                'status' => 'success',
                'message' => 'Produto atualizado com sucesso',
                'data' => $produtoAtualizado
            ]);

        } catch (\Exception $e) {
            return $this->fail('Erro interno do servidor: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Remove produto (desativa)
     */
    public function delete($id = null)
    {
        try {
            if (!$id || !is_numeric($id)) {
                return $this->failValidationError('ID inválido');
            }

            $produtoModel = new ProdutoModel();
            
            $produto = $produtoModel->find($id);
            if (!$produto) {
                return $this->failNotFound('Produto não encontrado');
            }

            if (!$produtoModel->desativar($id)) {
                return $this->fail('Erro ao desativar produto');
            }

            return $this->respondDeleted([
                'status' => 'success',
                'message' => 'Produto removido com sucesso'
            ]);

        } catch (\Exception $e) {
            return $this->fail('Erro interno do servidor: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Lista produtos com estoque baixo
     */
    public function estoqueBaixo()
    {
        try {
            $produtoModel = new ProdutoModel();
            $produtos = $produtoModel->findEstoqueBaixo();

            return $this->respond([
                'status' => 'success',
                'message' => 'Produtos com estoque baixo listados com sucesso',
                'data' => $produtos
            ]);

        } catch (\Exception $e) {
            return $this->fail('Erro interno do servidor: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Busca produto por código de barras
     */
    public function porCodigoBarras($codigoBarras = null)
    {
        try {
            if (!$codigoBarras) {
                return $this->failValidationError('Código de barras inválido');
            }

            $produtoModel = new ProdutoModel();
            $produto = $produtoModel->findByCodigoBarras($codigoBarras);

            if (!$produto) {
                return $this->failNotFound('Produto não encontrado');
            }

            // Busca com informações do tipo
            $produtos = $produtoModel->listarComTipo(['ativo' => null]);
            $produtoCompleto = null;

            foreach ($produtos as $p) {
                if ($p['id'] == $produto['id']) {
                    $produtoCompleto = $p;
                    break;
                }
            }

            return $this->respond([
                'status' => 'success',
                'message' => 'Produto encontrado',
                'data' => $produtoCompleto
            ]);

        } catch (\Exception $e) {
            return $this->fail('Erro interno do servidor: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Ativa produto
     */
    public function ativar($id = null)
    {
        try {
            if (!$id || !is_numeric($id)) {
                return $this->failValidationError('ID inválido');
            }

            $produtoModel = new ProdutoModel();
            
            $produto = $produtoModel->find($id);
            if (!$produto) {
                return $this->failNotFound('Produto não encontrado');
            }

            if (!$produtoModel->ativar($id)) {
                return $this->fail('Erro ao ativar produto');
            }

            $produtos = $produtoModel->listarComTipo(['ativo' => null]);
            $produtoAtualizado = null;

            foreach ($produtos as $p) {
                if ($p['id'] == $id) {
                    $produtoAtualizado = $p;
                    break;
                }
            }

            return $this->respond([
                'status' => 'success',
                'message' => 'Produto ativado com sucesso',
                'data' => $produtoAtualizado
            ]);

        } catch (\Exception $e) {
            return $this->fail('Erro interno do servidor: ' . $e->getMessage(), 500);
        }
    }
}